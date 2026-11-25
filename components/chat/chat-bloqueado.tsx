'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { EVENTO_ABRIR_CHAT, rutaParaVolver } from './abrir-chat';
import { esPaginaDeAcceso, Lanzador, useAtajoChat } from './lanzador';

/**
 * Lanzador del tutor para quien no puede usarlo (sin sesión o sin código de
 * clase). Al pulsarlo (o con Ctrl+J / el evento 'dam:abrir-chat') muestra un
 * aviso pequeño con el enlace para entrar, que después devuelve a esta página.
 * Atiende el evento (preventDefault) para que `abrirChat()` sepa que hay
 * alguien escuchando y no redirija por su cuenta.
 */
export function ChatBloqueado({ logueado }: { logueado: boolean }) {
  const pathname = usePathname() ?? '/';
  const [abierto, setAbierto] = useState(false);
  const atajo = useAtajoChat();
  const lanzadorRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const accionRef = useRef<HTMLAnchorElement>(null);
  const tituloId = useId();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  // Elemento que tenía el foco al abrir (p. ej. "Preguntar al tutor"): ahí vuelve al cerrar.
  const origenRef = useRef<HTMLElement | null>(null);

  const cerrar = useCallback((devolverFoco = true) => {
    setAbierto(false);
    if (!devolverFoco) return;
    requestAnimationFrame(() => {
      const origen = origenRef.current;
      if (origen?.isConnected && !panelRef.current?.contains(origen)) origen.focus({ preventScroll: true });
      else lanzadorRef.current?.focus();
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setAbierto((v) => !v);
      }
    };
    const onAbrir = (e: Event) => {
      // En las páginas de acceso no se muestra nada: que decida quien lanza el evento.
      if (esPaginaDeAcceso(pathnameRef.current)) return;
      e.preventDefault();
      setAbierto(true);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener(EVENTO_ABRIR_CHAT, onAbrir);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(EVENTO_ABRIR_CHAT, onAbrir);
    };
  }, []);

  useEffect(() => {
    if (!abierto) return;
    const activo = document.activeElement;
    origenRef.current = activo instanceof HTMLElement && activo !== document.body ? activo : null;
    requestAnimationFrame(() => accionRef.current?.focus({ preventScroll: true }));
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || lanzadorRef.current?.contains(t)) return;
      cerrar(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [abierto, cerrar]);

  useEffect(() => setAbierto(false), [pathname]);

  // Solo se pinta con el aviso abierto (tras una interacción), así que leer
  // window.location aquí no provoca diferencias de hidratación.
  const href = abierto ? `${logueado ? '/unirse' : '/login'}?next=${encodeURIComponent(rutaParaVolver(pathname))}` : '/login';

  if (esPaginaDeAcceso(pathname)) return null;

  return (
    <>
      <Lanzador
        ref={lanzadorRef}
        atajo={atajo}
        onClick={() => setAbierto((v) => !v)}
        aria-label={`Tutor DAM (${atajo})`}
        aria-haspopup="dialog"
        aria-expanded={abierto}
      />
      {abierto && (
        <div
          ref={panelRef}
          role="dialog"
          aria-labelledby={tituloId}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.stopPropagation();
              cerrar();
            }
          }}
          className="fixed right-4 bottom-16 z-40 w-[min(20rem,calc(100vw-2rem))] rounded-lg border bg-fd-popover p-4 text-fd-popover-foreground shadow-sm motion-safe:animate-[fd-fade-in_150ms_ease] sm:right-6 sm:bottom-17 print:hidden"
          style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="flex items-start justify-between gap-3">
            <p id={tituloId} className="text-sm font-semibold">
              Tutor DAM
            </p>
            <button
              type="button"
              onClick={() => cerrar()}
              aria-label="Cerrar"
              className="-m-2 rounded-md p-2.5 text-fd-muted-foreground sm:-m-1 sm:p-1 hover:bg-fd-accent hover:text-fd-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-fd-muted-foreground">
            {logueado
              ? 'El tutor es solo para la clase. Introduce el código de clase para usarlo.'
              : 'El tutor es solo para la clase. Entra con tu correo y el código de clase.'}
          </p>
          <Link
            ref={accionRef}
            href={href}
            onClick={() => cerrar(false)}
            className="mt-3 inline-flex h-10 items-center rounded-md bg-fd-foreground px-3 text-sm font-medium text-fd-background sm:h-8 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2 focus-visible:ring-offset-fd-popover"
          >
            {logueado ? 'Introducir código' : 'Entrar'}
          </Link>
        </div>
      )}
    </>
  );
}
