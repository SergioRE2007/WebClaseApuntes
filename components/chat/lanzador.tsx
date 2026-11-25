'use client';

import { forwardRef, useEffect, useState, type ComponentProps } from 'react';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

function esMac() {
  return typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent);
}

/** Páginas de acceso: ahí el lanzador del tutor sobra. */
export function esPaginaDeAcceso(pathname: string) {
  return pathname.startsWith('/login') || pathname.startsWith('/unirse') || pathname.startsWith('/auth');
}

/** Atajo del tutor según el sistema ("⌘J" en Mac, "Ctrl+J" en el resto). */
export function useAtajoChat() {
  const [mac, setMac] = useState(false);
  useEffect(() => setMac(esMac()), []);
  return mac ? '⌘J' : 'Ctrl+J';
}

/** Botón fijo abajo a la derecha que abre el tutor. Icono + "Tutor" en escritorio, solo icono en móvil. */
export const Lanzador = forwardRef<HTMLButtonElement, ComponentProps<'button'> & { atajo: string }>(function Lanzador(
  { atajo, className, ...props },
  ref,
) {
  return (
    <div
      className="dam-chat-fab fixed right-4 bottom-4 z-30 sm:right-6 sm:bottom-6 print:hidden"
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      <button
        ref={ref}
        type="button"
        aria-keyshortcuts="Control+J Meta+J"
        title={`Tutor DAM (${atajo})`}
        className={cn(
          'flex size-10 items-center justify-center gap-2 rounded-md border bg-fd-background text-sm font-medium text-fd-foreground shadow-sm transition-colors hover:bg-fd-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2 focus-visible:ring-offset-fd-background sm:h-9 sm:w-auto sm:px-3',
          className,
        )}
        {...props}
      >
        <MessageCircle className="size-4 text-fd-muted-foreground" aria-hidden />
        <span className="hidden sm:inline">Tutor</span>
        <kbd className="hidden font-mono text-[11px] text-fd-muted-foreground sm:inline">{atajo}</kbd>
      </button>
    </div>
  );
});
