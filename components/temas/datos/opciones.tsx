'use client';

import { useId } from 'react';
import { cn } from '@/lib/cn';

export interface Opcion<T extends string | number> {
  valor: T;
  texto: string;
  /** Si es true, el texto se pinta como código. */
  codigo?: boolean;
}

/**
 * Grupo de botones de opción (radio) con inputs nativos: se maneja con el
 * teclado (Tab para entrar, flechas para cambiar) y lo leen los lectores.
 */
export function Opciones<T extends string | number>({
  leyenda,
  opciones,
  valor,
  onCambio,
  desactivado = false,
  className,
}: {
  leyenda: string;
  opciones: readonly Opcion<T>[];
  valor: T;
  onCambio: (v: T) => void;
  desactivado?: boolean;
  className?: string;
}) {
  const nombre = useId();
  return (
    <fieldset className={cn('min-w-0', className)} disabled={desactivado}>
      <legend className="mb-1.5 text-xs font-medium text-fd-muted-foreground">{leyenda}</legend>
      <div className="flex flex-wrap gap-1.5">
        {opciones.map((o) => (
          <label
            key={String(o.valor)}
            className={cn(
              'relative inline-flex min-h-10 min-w-0 cursor-pointer items-center rounded-md border px-2.5 py-1.5 text-sm transition-colors sm:min-h-8',
              'hover:bg-fd-accent has-[:checked]:border-fd-primary has-[:checked]:bg-fd-primary/10 has-[:checked]:text-fd-foreground',
              'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-fd-ring has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50',
            )}
          >
            <input
              type="radio"
              name={nombre}
              className="sr-only"
              checked={valor === o.valor}
              onChange={() => onCambio(o.valor)}
            />
            {o.codigo ? <code className="break-all font-mono text-[0.8125rem]">{o.texto}</code> : o.texto}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
