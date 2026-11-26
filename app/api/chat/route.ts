import { after, NextResponse } from 'next/server';
import { z } from 'zod';
import type Anthropic from '@anthropic-ai/sdk';
import { getPerfil } from '@/lib/auth';
import { demoPermitido, env, isSupabaseConfigured } from '@/lib/env';
import { createServiceClient } from '@/lib/supabase/server';
import {
  anthropicConfigurado,
  ESFUERZO_CHAT,
  getAnthropic,
  MAX_RONDAS_HERRAMIENTAS,
  MAX_TOKENS_CHAT,
  MODELO_CHAT,
} from '@/lib/ai/config';
import { crearEjecutorHerramientas, getSistema, HERRAMIENTAS } from '@/lib/ai/conocimiento';
import { traducirError } from '@/lib/ai/errores';
import {
  CABECERA_RESTANTES,
  LIMITES,
  serializarEvento,
  type EventoChat,
  type MensajeChat,
  type MotivoFin,
} from '@/lib/ai/protocolo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Hasta 4 llamadas a Claude seguidas (3 vueltas con herramientas + la respuesta): el bucle vigila este plazo
// y, si se acerca, pide la respuesta final sin herramientas.
export const maxDuration = 60;

const esquema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(LIMITES.caracteres, `Cada mensaje puede tener como máximo ${LIMITES.caracteres} caracteres.`),
      }),
    )
    .min(1, 'Falta el mensaje.')
    .max(LIMITES.mensajes, 'La conversación es demasiado larga. Bórrala y empieza una nueva.')
    .refine((m) => m.at(-1)?.role === 'user' && m.at(-1)!.content.trim().length > 0, {
      message: 'El último mensaje debe ser tuyo y no puede estar vacío.',
    }),
  pagina: z.string().max(LIMITES.pagina).optional(),
});

function errorJson(status: number, error: string, headers?: HeadersInit) {
  return NextResponse.json({ error }, { status, headers });
}

/** Limpia el historial: quita vacíos, une turnos seguidos del mismo rol y empieza por el usuario. */
function normalizar(mensajes: MensajeChat[]): Anthropic.MessageParam[] {
  const resultado: Anthropic.MessageParam[] = [];
  for (const m of mensajes) {
    const texto = m.content.trim();
    if (!texto) continue;
    if (resultado.length === 0 && m.role === 'assistant') continue;
    const ultimo = resultado.at(-1);
    if (ultimo && ultimo.role === m.role) {
      ultimo.content = `${ultimo.content as string}\n\n${texto}`;
    } else {
      resultado.push({ role: m.role, content: texto });
    }
  }
  return resultado;
}

/** Fecha (YYYY-MM-DD) en Madrid, igual que la usa chat_incrementar. */
function diaMadrid() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

async function registrarUso(usuarioId: string, entrada: number, salida: number) {
  if (!isSupabaseConfigured || (entrada === 0 && salida === 0)) return;
  try {
    const supabase = createServiceClient();
    const dia = diaMadrid();
    const { data } = await supabase
      .from('chat_uso')
      .select('tokens_entrada, tokens_salida')
      .eq('usuario_id', usuarioId)
      .eq('dia', dia)
      .maybeSingle();
    const actual = data as { tokens_entrada: number | null; tokens_salida: number | null } | null;
    if (!actual) return;
    await supabase
      .from('chat_uso')
      .update({
        tokens_entrada: Number(actual.tokens_entrada ?? 0) + entrada,
        tokens_salida: Number(actual.tokens_salida ?? 0) + salida,
      })
      .eq('usuario_id', usuarioId)
      .eq('dia', dia);
  } catch {
    // Best effort: el uso de tokens es solo estadística.
  }
}

/** Devuelve el mensaje al cupo de hoy si Claude falló antes de responder nada. */
async function devolverCupo(usuarioId: string) {
  try {
    const { error } = await createServiceClient().rpc('chat_devolver', { p_usuario: usuarioId });
    if (error) throw error;
  } catch (e) {
    console.error('[chat] No se pudo devolver el mensaje al cupo diario', e);
  }
}

export async function POST(request: Request) {
  // 0. Sin Supabase solo se permite el modo demo en desarrollo (o con DAM_DEMO=1)
  if (!isSupabaseConfigured && !demoPermitido) return errorJson(503, 'Servidor mal configurado.');

  // 1. Autenticación
  const perfil = await getPerfil();
  if (!perfil) return errorJson(401, 'Inicia sesión para usar el tutor.');
  if (!perfil.clase_ok) return errorJson(401, 'Únete a la clase con el código para usar el tutor.');

  // 2. Configuración
  if (!anthropicConfigurado()) {
    return errorJson(
      503,
      'El tutor aún no está activado: el propietario tiene que añadir ANTHROPIC_API_KEY a las variables de entorno del servidor.',
    );
  }

  // 3. Validación
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorJson(400, 'Petición no válida.');
  }
  const parsed = esquema.safeParse(body);
  if (!parsed.success) {
    return errorJson(400, parsed.error.issues[0]?.message ?? 'Petición no válida.');
  }
  const mensajes = normalizar(parsed.data.messages);
  if (mensajes.at(-1)?.role !== 'user') return errorJson(400, 'El último mensaje debe ser tuyo.');

  // 4. Límite diario
  const headers = new Headers({
    'Content-Type': 'application/x-ndjson; charset=utf-8',
    'Cache-Control': 'no-store, no-transform',
    'X-Accel-Buffering': 'no',
  });
  let cupoContado = false;
  if (isSupabaseConfigured) {
    if (!env.supabaseServiceRoleKey) {
      console.error('[chat] Falta SUPABASE_SERVICE_ROLE_KEY: no se puede aplicar el límite diario.');
      return errorJson(503, 'El tutor no está disponible ahora mismo (no se puede comprobar el límite diario).');
    }
    try {
      const { data, error } = await createServiceClient().rpc('chat_incrementar', {
        p_usuario: perfil.id,
        p_limite: env.chatLimiteDiario,
      });
      if (error) throw error;
      const total = Number(data);
      if (total === -1) {
        return errorJson(
          429,
          `Has llegado al límite de ${env.chatLimiteDiario} mensajes de hoy con el tutor. Mañana tienes más; mientras, tira de los apuntes y del buscador (Ctrl+K).`,
          { [CABECERA_RESTANTES]: '0' },
        );
      }
      cupoContado = true;
      if (Number.isFinite(total)) {
        headers.set(CABECERA_RESTANTES, String(Math.max(0, env.chatLimiteDiario - total)));
      }
    } catch (e) {
      // Fallamos cerrados: sin contador no hay límite, y eso lo paga el propietario.
      console.error('[chat] No se pudo comprobar el límite diario', e);
      return errorJson(503, 'El tutor no está disponible ahora mismo (no se puede comprobar el límite diario).');
    }
  }

  // 5. Llamada a Claude en streaming, con bucle de herramientas (leer_pagina / buscar_en_apuntes)
  const uso = { entrada: 0, salida: 0 };
  const sumarUso = (u: Anthropic.Usage) => {
    uso.entrada += (u.input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0);
    uso.salida += u.output_tokens ?? 0;
  };
  let marcarTerminado!: () => void;
  const terminado = new Promise<void>((r) => (marcarTerminado = r));
  after(async () => {
    await terminado;
    await registrarUso(perfil.id, uso.entrada, uso.salida);
  });

  // La conversación crece dentro de este turno con las llamadas a herramientas y sus resultados.
  // Los bloques del asistente (incluidos los de pensamiento) se devuelven tal cual, sin tocarlos.
  const conversacion: Anthropic.MessageParam[] = [...mensajes];
  let system: Anthropic.TextBlockParam[] = [];
  // Topes de herramientas de este mensaje (páginas, búsquedas, texto): ver LIMITES_TURNO.
  const ejecutarHerramienta = crearEjecutorHerramientas(parsed.data.pagina);
  const inicio = Date.now();
  /** Milisegundos que quedan hasta que Vercel corte la función. */
  const restante = () => maxDuration * 1000 - (Date.now() - inicio);

  const lanzar = (ultimaRonda: boolean) =>
    getAnthropic().messages.stream(
      {
        model: MODELO_CHAT,
        max_tokens: MAX_TOKENS_CHAT,
        output_config: { effort: ESFUERZO_CHAT },
        system,
        // Siempre las mismas herramientas y en el mismo orden: forman parte del prefijo cacheado.
        tools: HERRAMIENTAS,
        // En la última vuelta ya no puede consultar más: responde con lo que tenga.
        ...(ultimaRonda ? { tool_choice: { type: 'none' as const } } : {}),
        messages: [...conversacion],
        // Caché automática en el último bloque: cada vuelta reutiliza lo que ya se mandó en la anterior.
        cache_control: { type: 'ephemeral' },
      },
      { signal: request.signal },
    );

  let stream: ReturnType<typeof lanzar>;
  let iterador: AsyncIterator<Anthropic.MessageStreamEvent>;
  let primero: IteratorResult<Anthropic.MessageStreamEvent>;
  try {
    system = await getSistema({ pagina: parsed.data.pagina, nombre: perfil.nombre });
    stream = lanzar(false);
    iterador = stream[Symbol.asyncIterator]();
    // Esperamos al primer evento para poder devolver un status HTTP real si falla (429, 529…).
    primero = await iterador.next();
  } catch (e) {
    marcarTerminado();
    // Claude no llegó a responder: ese intento no cuenta para el límite de hoy
    if (cupoContado) after(() => devolverCupo(perfil.id));
    const { status, mensaje } = traducirError(e);
    return errorJson(status === 499 ? 400 : status, mensaje);
  }

  const encoder = new TextEncoder();
  let cerrado = false;

  const cuerpo = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enviar = (evento: EventoChat) => {
        if (cerrado) return;
        try {
          controller.enqueue(encoder.encode(serializarEvento(evento)));
        } catch {
          cerrado = true; // el cliente ya se fue
        }
      };
      const cerrar = () => {
        if (cerrado) return;
        cerrado = true;
        try {
          controller.close();
        } catch {
          // ya cerrado
        }
      };

      let pendiente: IteratorResult<Anthropic.MessageStreamEvent> | null = primero;
      let huboTexto = false; // ya se ha mandado texto al alumno
      let separar = false; // hubo herramientas desde el último texto: separa los párrafos
      let motivo: MotivoFin = 'otro';

      try {
        for (let ronda = 0; ; ronda++) {
          // Reenvía el texto de esta vuelta según llega.
          while (true) {
            const r: IteratorResult<Anthropic.MessageStreamEvent> = pendiente ?? (await iterador.next());
            pendiente = null;
            if (r.done) break;
            const ev = r.value;
            if (ev.type === 'content_block_delta' && ev.delta.type === 'text_delta' && ev.delta.text) {
              if (separar && huboTexto) enviar({ t: 'd', v: '\n\n' });
              separar = false;
              huboTexto = true;
              enviar({ t: 'd', v: ev.delta.text });
            }
          }

          // El iterador se cierra en silencio si llega un error SSE o se corta la conexión;
          // finalMessage() rechaza con ese error para que lo veamos abajo.
          const mensaje = await stream.finalMessage();
          sumarUso(mensaje.usage);

          const sr = mensaje.stop_reason;
          const usos = mensaje.content.filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use');
          // Solo se ejecutan herramientas si la vuelta terminó pidiéndolas (nunca tras refusal o max_tokens).
          if (sr !== 'tool_use' || usos.length === 0) {
            motivo = sr === 'end_turn' || sr === 'max_tokens' || sr === 'refusal' ? sr : 'otro';
            break;
          }

          // Sin tiempo para otra llamada: se corta aquí con lo que haya.
          if (restante() < 12_000) {
            enviar({
              t: 'd',
              v: `${huboTexto ? '\n\n' : ''}No me ha dado tiempo a consultar los apuntes. Vuelve a preguntármelo, mejor algo más concreto.`,
            });
            motivo = 'otro';
            break;
          }
          // Última vuelta si se agotan las vueltas o queda poco tiempo: ya no podrá usar herramientas.
          const ultima = ronda + 1 >= MAX_RONDAS_HERRAMIENTAS || restante() < 35_000;

          conversacion.push({ role: 'assistant', content: mensaje.content });
          // Todas las respuestas a herramientas van juntas en un único mensaje del usuario.
          const resultados = await Promise.all(
            usos.map(async (u): Promise<Anthropic.ToolResultBlockParam> => {
              const res = await ejecutarHerramienta(u.name, u.input);
              if (!huboTexto) enviar({ t: 'info', v: res.etiqueta });
              return { type: 'tool_result', tool_use_id: u.id, content: res.contenido, ...(res.error ? { is_error: true } : {}) };
            }),
          );
          conversacion.push({
            role: 'user',
            content: ultima
              ? [...resultados, { type: 'text', text: '(Ya no puedes consultar más los apuntes: responde ahora con lo que tienes.)' }]
              : resultados,
          });
          separar = true;

          stream = lanzar(ultima);
          iterador = stream[Symbol.asyncIterator]();
        }

        if (motivo === 'refusal') {
          enviar({
            t: 'd',
            v: `${huboTexto ? '\n\n' : ''}Lo siento, no puedo ayudarte con eso. Prueba a reformular la pregunta o pregúntame sobre los apuntes.`,
          });
        }
        enviar({ t: 'fin', motivo });
        cerrar();
      } catch (e) {
        const { mensaje } = traducirError(e);
        // Si falló una vuelta antes de escribir nada al alumno, ese mensaje no cuenta para el límite de hoy.
        if (!huboTexto && cupoContado && !request.signal.aborted) await devolverCupo(perfil.id);
        if (!request.signal.aborted) {
          console.error('[chat] Error a mitad de respuesta', e);
          enviar({ t: 'error', mensaje });
        }
        cerrar();
      } finally {
        marcarTerminado();
      }
    },
    cancel() {
      cerrado = true;
      stream.abort();
    },
  });

  return new Response(cuerpo, { status: 200, headers });
}
