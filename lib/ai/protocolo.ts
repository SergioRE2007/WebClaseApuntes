/**
 * Protocolo del chat "Tutor DAM" (compartido entre servidor y navegador).
 *
 * POST /api/chat
 *   Body JSON: { messages: { role: 'user' | 'assistant'; content: string }[]; pagina?: string }
 *     - máximo LIMITES.mensajes mensajes, cada uno <= LIMITES.caracteres caracteres
 *     - el último mensaje debe ser del usuario
 *
 * Respuestas de error (antes de empezar el stream): JSON { error: string } con status
 *   400 (body inválido) · 401 (no logueado / fuera de la clase) · 429 (límite diario)
 *   503 (falta ANTHROPIC_API_KEY) · 500.
 *
 * Respuesta OK (200): `application/x-ndjson; charset=utf-8`, una línea JSON por evento:
 *   { "t": "d", "v": "texto" }                 → trozo de texto (delta) de la respuesta
 *   { "t": "fin", "motivo": MotivoFin }        → la respuesta terminó bien
 *   { "t": "error", "mensaje": "..." }         → error a mitad de stream (mensaje para el alumno)
 * Cabecera opcional `X-Chat-Restantes`: mensajes que le quedan hoy al usuario.
 *
 * Si el cliente aborta el fetch, el servidor aborta también la petición a Claude.
 */

export const LIMITES = {
  /** Mensajes máximos enviados por petición (historial incluido). */
  mensajes: 24,
  /** Caracteres máximos por mensaje. */
  caracteres: 4000,
  /** Longitud máxima de la ruta de página enviada. */
  pagina: 300,
} as const;

export const CABECERA_RESTANTES = 'X-Chat-Restantes';

export type RolMensaje = 'user' | 'assistant';

export interface MensajeChat {
  role: RolMensaje;
  content: string;
}

export interface PeticionChat {
  messages: MensajeChat[];
  pagina?: string;
}

/** end_turn: normal · max_tokens: cortada por longitud · refusal: Claude declinó responder. */
export type MotivoFin = 'end_turn' | 'max_tokens' | 'refusal' | 'otro';

export type EventoChat =
  | { t: 'd'; v: string }
  | { t: 'fin'; motivo: MotivoFin }
  | { t: 'error'; mensaje: string };

export function serializarEvento(evento: EventoChat): string {
  return `${JSON.stringify(evento)}\n`;
}

/** Parser incremental de NDJSON: pásale trozos de texto, te devuelve los eventos completos. */
export function crearLectorEventos() {
  let resto = '';
  return {
    push(trozo: string): EventoChat[] {
      resto += trozo;
      const lineas = resto.split('\n');
      resto = lineas.pop() ?? '';
      return lineas.flatMap(parsearLinea);
    },
    flush(): EventoChat[] {
      const ultima = resto;
      resto = '';
      return parsearLinea(ultima);
    },
  };
}

function parsearLinea(linea: string): EventoChat[] {
  const limpia = linea.trim();
  if (!limpia) return [];
  try {
    const evento = JSON.parse(limpia) as EventoChat;
    if (evento && typeof evento === 'object' && 't' in evento) return [evento];
  } catch {
    // línea corrupta: se ignora
  }
  return [];
}
