/**
 * Abre el Tutor DAM desde cualquier parte de la web (componentes cliente).
 *
 *   import { abrirChat, urlLoginVolviendo } from '@/components/chat/abrir-chat';
 *   if (!abrirChat({ pregunta: 'Explícame los JOIN', enviar: true })) router.push(urlLoginVolviendo());
 *
 * Equivale a:
 *   window.dispatchEvent(new CustomEvent('dam:abrir-chat', { cancelable: true, detail: { pregunta, enviar } }))
 *
 * - Sin `pregunta`: solo abre el panel.
 * - Con `pregunta`: la escribe en el cuadro de texto (y la envía si `enviar: true`).
 *
 * Devuelve `true` si alguien ha atendido el evento (llama a `preventDefault`):
 * el panel del tutor (miembros de la clase) o el aviso para entrar (sin sesión
 * o sin código de clase). Con `false` no hay nada montado todavía (la sesión
 * aún se está leyendo, o estás en una página de acceso): conviene mandar al
 * usuario a `urlLoginVolviendo()`.
 */
export const EVENTO_ABRIR_CHAT = 'dam:abrir-chat';

export interface DetalleAbrirChat {
  pregunta?: string;
  /** Enviar la pregunta directamente en vez de solo rellenarla. */
  enviar?: boolean;
}

export function abrirChat(detalle: DetalleAbrirChat = {}): boolean {
  if (typeof window === 'undefined') return false;
  const evento = new CustomEvent<DetalleAbrirChat>(EVENTO_ABRIR_CHAT, { cancelable: true, detail: detalle });
  window.dispatchEvent(evento);
  return evento.defaultPrevented;
}

/** Páginas de acceso (login, unirse, auth): ni se vuelve a ellas tras entrar ni llevan lanzador del tutor. */
export function esPaginaDeAcceso(pathname: string) {
  return pathname.startsWith('/login') || pathname.startsWith('/unirse') || pathname.startsWith('/auth');
}

/** Ruta a la que volver tras entrar: la página actual (con su ?query y #ancla). */
export function rutaParaVolver(pathname?: string): string {
  if (typeof window === 'undefined') return pathname ?? '/';
  const ruta = pathname ?? window.location.pathname;
  if (esPaginaDeAcceso(ruta)) return '/';
  // Solo añadimos query y ancla si la ruta es la de la página actual.
  const extra = ruta === window.location.pathname ? window.location.search + window.location.hash : '';
  return ruta + extra;
}

/** URL de login que, tras entrar, devuelve a la página actual. */
export function urlLoginVolviendo(): string {
  return `/login?next=${encodeURIComponent(rutaParaVolver())}`;
}
