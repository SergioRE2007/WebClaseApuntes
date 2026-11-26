import 'server-only';
import Anthropic from '@anthropic-ai/sdk';

/** Modelo elegido para el tutor (decisión del propietario, no cambiar sin hablarlo). */
export const MODELO_CHAT = 'claude-haiku-5-5';

/** Esfuerzo bajo: respuestas rápidas y baratas, suficiente para un tutor de chat. */
export const ESFUERZO_CHAT = 'low' as const;

/** Tope de salida por respuesta (incluye el pensamiento adaptativo). */
export const MAX_TOKENS_CHAT = 4096;

/** Vueltas máximas con herramientas (leer_pagina / buscar_en_apuntes) por mensaje; la siguiente ya responde sin ellas. */
export const MAX_RONDAS_HERRAMIENTAS = 3;

export const anthropicConfigurado = () => Boolean(process.env.ANTHROPIC_API_KEY);

let cliente: Anthropic | null = null;

/** Cliente único del SDK (reutiliza conexiones entre peticiones). */
export function getAnthropic(): Anthropic {
  cliente ??= new Anthropic({ maxRetries: 2, timeout: 60_000 });
  return cliente;
}
