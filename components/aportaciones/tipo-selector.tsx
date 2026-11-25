'use client';

import { useId } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/cn';
import { TIPOS, TIPOS_INFO, type TipoAportacion } from '@/lib/aportaciones';

/** Selector de tipo como tarjetas segmentadas (radios nativos: flechas del teclado incluidas). */
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
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-fd-foreground">¿Qué quieres aportar?</legend>
      <div className="grid grid-cols-2 gap-2 min-[480px]:grid-cols-3 md:grid-cols-5">
        {TIPOS.map((t) => {
          const info = TIPOS_INFO[t];
          const Icon = info.icon;
          const activo = value === t;
          return (
            <label
              key={t}
              className={cn(
                'group relative flex cursor-pointer flex-col gap-1 rounded-xl border bg-fd-card p-3 text-left transition',
                'hover:border-fd-primary/50 hover:bg-fd-accent/40',
                'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-fd-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-fd-background',
                activo && 'border-fd-primary/70',
                disabled && 'cursor-not-allowed opacity-60',
                t === 'texto' && 'col-span-2 min-[480px]:col-span-1',
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
              {activo && (
                <motion.span
                  layoutId={`${name}-activo`}
                  className="absolute inset-0 rounded-xl bg-fd-primary/10 ring-1 ring-inset ring-fd-primary/60"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  aria-hidden
                />
              )}
              <span
                className={cn(
                  'relative flex size-8 items-center justify-center rounded-lg bg-fd-muted text-fd-muted-foreground transition',
                  activo && 'bg-fd-primary text-fd-primary-foreground',
                )}
              >
                <Icon className="size-4" aria-hidden />
              </span>
              <span className="relative text-sm font-semibold text-fd-foreground">{info.label}</span>
              <span className="relative text-xs leading-snug text-fd-muted-foreground">{info.descripcion}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
