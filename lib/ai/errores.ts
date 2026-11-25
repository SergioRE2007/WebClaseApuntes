import 'server-only';
import Anthropic from '@anthropic-ai/sdk';

export interface ErrorTraducido {
  /** Status HTTP que devolvemos al navegador si aún no ha empezado el stream. */
  status: number;
  /** Mensaje para el alumno (español, sin detalles internos). */
  mensaje: string;
}

const REINTENTA = 'El tutor está muy solicitado ahora mismo, inténtalo en unos segundos.';

/** Traduce errores del SDK de Anthropic a mensajes amables. Registra el detalle en el servidor. */
export function traducirError(error: unknown): ErrorTraducido {
  if (error instanceof Anthropic.APIUserAbortError) {
    return { status: 499, mensaje: 'Respuesta detenida.' };
  }

  if (error instanceof Anthropic.APIError) {
    console.error('[chat] Error de la API de Claude', {
      status: error.status,
      requestId: error.requestID,
      message: error.message,
    });
  } else {
    console.error('[chat] Error inesperado', error);
  }

  if (error instanceof Anthropic.APIConnectionTimeoutError) {
    return { status: 504, mensaje: 'El tutor ha tardado demasiado en responder. Inténtalo de nuevo.' };
  }
  if (error instanceof Anthropic.APIConnectionError) {
    return { status: 502, mensaje: 'No se ha podido conectar con el tutor. Revisa tu conexión e inténtalo de nuevo.' };
  }
  if (error instanceof Anthropic.RateLimitError || error instanceof Anthropic.OverloadedError) {
    return { status: 503, mensaje: REINTENTA };
  }
  if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
    return {
      status: 503,
      mensaje: 'El tutor no está bien configurado (clave de API no válida). Avisa al propietario de la web.',
    };
  }
  if (error instanceof Anthropic.PaymentRequiredError) {
    return {
      status: 503,
      mensaje: 'El tutor está pausado por un problema de facturación. Avisa al propietario de la web.',
    };
  }
  if (error instanceof Anthropic.NotFoundError) {
    return { status: 503, mensaje: 'El modelo del tutor no está disponible. Avisa al propietario de la web.' };
  }
  if (error instanceof Anthropic.ContentTooLargeError) {
    return { status: 413, mensaje: 'La conversación es demasiado larga. Bórrala y empieza una nueva.' };
  }
  if (error instanceof Anthropic.BadRequestError) {
    return {
      status: 400,
      mensaje: 'No he podido procesar esa conversación. Prueba a borrarla y empezar de nuevo.',
    };
  }
  if (error instanceof Anthropic.InternalServerError) {
    return { status: 503, mensaje: REINTENTA };
  }
  return { status: 500, mensaje: 'Ha fallado algo al generar la respuesta. Inténtalo de nuevo.' };
}
