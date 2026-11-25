import { after, NextResponse } from 'next/server';
import { z } from 'zod';
import type Anthropic from '@anthropic-ai/sdk';
import { getPerfil } from '@/lib/auth';
import { env, isSupabaseConfigured } from '@/lib/env';
import { createServiceClient } from '@/lib/supabase/server';
import { anthropicConfigurado, ESFUERZO_CHAT, getAnthropic, MAX_TOKENS_CHAT, MODELO_CHAT } from '@/lib/ai/config';
import { getSistema } from '@/lib/ai/conocimiento';
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

export async function POST(request: Request) {
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
  if (isSupabaseConfigured) {
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
      if (Number.isFinite(total)) {
        headers.set(CABECERA_RESTANTES, String(Math.max(0, env.chatLimiteDiario - total)));
      }
    } catch (e) {
      // Si el contador falla (p. ej. falta la service role), no bloqueamos al alumno.
      console.error('[chat] No se pudo comprobar el límite diario', e);
    }
  }

  // 5. Llamada a Claude en streaming
  const uso = { entrada: 0, salida: 0 };
  let marcarTerminado!: () => void;
  const terminado = new Promise<void>((r) => (marcarTerminado = r));
  after(async () => {
    await terminado;
    await registrarUso(perfil.id, uso.entrada, uso.salida);
  });

  let stream: ReturnType<Anthropic['messages']['stream']>;
  let iterador: AsyncIterator<Anthropic.MessageStreamEvent>;
  let primero: IteratorResult<Anthropic.MessageStreamEvent>;
  try {
    const system = await getSistema({ pagina: parsed.data.pagina, nombre: perfil.nombre });
    stream = getAnthropic().messages.stream(
      {
        model: MODELO_CHAT,
        max_tokens: MAX_TOKENS_CHAT,
        output_config: { effort: ESFUERZO_CHAT },
        system,
        messages: mensajes,
      },
      { signal: request.signal },
    );
    iterador = stream[Symbol.asyncIterator]();
    // Esperamos al primer evento para poder devolver un status HTTP real si falla (429, 529…).
    primero = await iterador.next();
  } catch (e) {
    marcarTerminado();
    const { status, mensaje } = traducirError(e);
    return errorJson(status === 499 ? 400 : status, mensaje);
  }

  const encoder = new TextEncoder();
  let motivo: MotivoFin = 'otro';
  let pendiente: IteratorResult<Anthropic.MessageStreamEvent> | null = primero;
  let cerrado = false;

  const procesar = (evento: Anthropic.MessageStreamEvent): EventoChat | null => {
    switch (evento.type) {
      case 'message_start': {
        const u = evento.message.usage;
        uso.entrada +=
          (u.input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0);
        uso.salida += u.output_tokens ?? 0;
        return null;
      }
      case 'message_delta': {
        // output_tokens en message_delta es acumulado
        if (evento.usage?.output_tokens != null) uso.salida = evento.usage.output_tokens;
        const sr = evento.delta.stop_reason;
        motivo = sr === 'end_turn' || sr === 'max_tokens' || sr === 'refusal' ? sr : sr ? 'otro' : motivo;
        return null;
      }
      case 'content_block_delta':
        return evento.delta.type === 'text_delta' && evento.delta.text ? { t: 'd', v: evento.delta.text } : null;
      default:
        return null;
    }
  };

  const cuerpo = new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (cerrado) return;
      try {
        while (true) {
          const r: IteratorResult<Anthropic.MessageStreamEvent> = pendiente ?? (await iterador.next());
          pendiente = null;
          if (r.done) {
            if (motivo === 'refusal') {
              controller.enqueue(
                encoder.encode(
                  serializarEvento({
                    t: 'd',
                    v: '\n\nLo siento, no puedo ayudarte con eso. Prueba a reformular la pregunta o pregúntame sobre los apuntes.',
                  }),
                ),
              );
            }
            controller.enqueue(encoder.encode(serializarEvento({ t: 'fin', motivo })));
            cerrado = true;
            controller.close();
            marcarTerminado();
            return;
          }
          const salida = procesar(r.value);
          if (salida) {
            controller.enqueue(encoder.encode(serializarEvento(salida)));
            return;
          }
        }
      } catch (e) {
        cerrado = true;
        const { mensaje } = traducirError(e);
        if (!request.signal.aborted) {
          try {
            controller.enqueue(encoder.encode(serializarEvento({ t: 'error', mensaje })));
            controller.close();
          } catch {
            // el cliente ya se fue
          }
        } else {
          try {
            controller.close();
          } catch {
            // ya cerrado
          }
        }
        marcarTerminado();
      }
    },
    cancel() {
      cerrado = true;
      stream.abort();
      marcarTerminado();
    },
  });

  return new Response(cuerpo, { status: 200, headers });
}
