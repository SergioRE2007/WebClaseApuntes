'use client';

import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/cn';

/**
 * Piezas compartidas por las demos de Compose: un selector segmentado
 * accesible (grupo de radio con flechas) y un bloque de código sencillo.
 */

export interface OpcionSegmentado<T extends string> {
  valor: T;
  texto: ReactNode;
}

export function Segmentado<T extends string>({
  opciones,
  valor,
  onCambio,
  etiqueta,
  className,
}: {
  opciones: readonly OpcionSegmentado<T>[];
  valor: T;
  onCambio: (v: T) => void;
  etiqueta: string;
  className?: string;
}) {
  const id = useId();
  const reducir = useReducedMotion();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const mover = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    let j = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % opciones.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + opciones.length) % opciones.length;
    else if (e.key === 'Home') j = 0;
    else if (e.key === 'End') j = opciones.length - 1;
    if (j < 0) return;
    e.preventDefault();
    onCambio(opciones[j].valor);
    refs.current[j]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={etiqueta}
      className={cn('inline-flex max-w-full flex-wrap gap-1 rounded-lg border bg-fd-muted/40 p-1', className)}
    >
      {opciones.map((o, i) => {
        const activo = o.valor === valor;
        return (
          <button
            key={o.valor}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={activo}
            tabIndex={activo ? 0 : -1}
            onClick={() => onCambio(o.valor)}
            onKeyDown={(e) => mover(e, i)}
            className={cn(
              'relative min-h-9 rounded-md px-2.5 py-1 text-xs font-medium transition-colors sm:min-h-8',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring',
              activo ? 'text-fd-foreground' : 'text-fd-muted-foreground hover:text-fd-foreground',
            )}
          >
            {activo && (
              <motion.span
                layoutId={`seg-${id}`}
                aria-hidden
                className="absolute inset-0 rounded-md border bg-fd-background"
                transition={reducir ? { duration: 0 } : { type: 'spring', bounce: 0.15, duration: 0.35 }}
              />
            )}
            <span className="relative font-mono">{o.texto}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Código de ejemplo sin resaltado (las demos son de cliente y no usan Shiki). */
export function CodigoDemo({ codigo, titulo }: { codigo: string; titulo?: string }) {
  return (
    <figure className="min-w-0 overflow-hidden rounded-md border bg-fd-muted/30">
      {titulo && (
        <figcaption className="border-b px-3 py-1.5 font-mono text-[11px] text-fd-muted-foreground">{titulo}</figcaption>
      )}
      <pre className="overflow-x-auto p-3 font-mono text-[12.5px] leading-relaxed text-fd-foreground">
        <code>{codigo}</code>
      </pre>
    </figure>
  );
}
