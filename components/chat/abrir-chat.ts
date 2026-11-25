/**
 * Abre el Tutor DAM desde cualquier parte de la web (componentes cliente).
 *
 *   import { abrirChat } from '@/components/chat/abrir-chat';
 *   abrirChat({ pregunta: 'Explícame los JOIN', enviar: true });
 *
 * Equivale a:
 *   window.dispatchEvent(new CustomEvent('dam:abrir-chat', { detail: { pregunta, enviar } }))
 *
 * - Sin `pregunta`: solo abre el panel.
 * - Con `pregunta`: la escribe en el cuadro de texto (y la envía si `enviar: true`).
 * Si el chat no está montado (usuario sin sesión), el evento no hace nada.
 */
export const EVENTO_ABRIR_CHAT = 'dam:abrir-chat';

export interface DetalleAbrirChat {
  pregunta?: string;
  /** Enviar la pregunta directamente en vez de solo rellenarla. */
  enviar?: boolean;
}

export function abrirChat(detalle: DetalleAbrirChat = {}) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<DetalleAbrirChat>(EVENTO_ABRIR_CHAT, { detail: detalle }));
}
