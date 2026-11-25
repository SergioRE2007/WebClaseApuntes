'use client';

import { useId } from 'react';
import { cn } from '@/lib/cn';
import { TIPOS, TIPOS_INFO, type TipoAportacion } from '@/lib/aportaciones';

/** Selector de tipo como control segmentado (radios nativos: flechas del teclado incluidas). */
export function TipoSelector({
  value,
  onChange,
  disabled,
}: {
  value: TipoAportacion;
  onChange: (t: TipoAportacion) => void;
  disabled?: boolean;
}) {
  const name = useId();
  const ayudaId = useId();
  return (
    <fieldset aria-describedby={ayudaId}>
      <legend className="mb-2 text-sm font-medium text-fd-foreground">¿Qué quieres aportar?</legend>
      <div
        className={cn(
          'inline-flex max-w-full divide-x divide-fd-border overflow-hidden rounded-md border',
          'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-fd-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-fd-background',
          disabled && 'opacity-60',
        )}
      >
        {TIPOS.map((t) => {
          const info = TIPOS_INFO[t];
          const activo = value === t;
          return (
            <label
              key={t}
              className={cn(
                'inline-flex h-10 cursor-pointer items-center px-2.5 text-[13px] transition-colors sm:h-8 sm:px-3 sm:text-sm',
                activo
                  ? 'bg-fd-accent font-medium text-fd-foreground'
                  : 'text-fd-muted-foreground hover:bg-fd-accent/50 hover:text-fd-foreground',
                disabled && 'cursor-not-allowed',
              )}
            >
              <input
                type="radio"
                name={name}
                value={t}
                checked={activo}
                onChange={() => onChange(t)}
                disabled={disabled}
                className="sr-only"
              />
              {info.label}
            </label>
          );
        })}
      </div>
      <p id={ayudaId} className="mt-2 text-sm text-fd-muted-foreground">
        {TIPOS_INFO[value].descripcion}
      </p>
    </fieldset>
  );
}
