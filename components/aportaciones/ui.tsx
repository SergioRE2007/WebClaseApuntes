import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { ESTADOS_INFO, type EstadoAportacion } from '@/lib/aportaciones';

export const inputClase =
  'w-full rounded-md border bg-fd-background px-3 py-2 text-sm text-fd-foreground outline-none transition-colors placeholder:text-fd-muted-foreground focus-visible:border-fd-primary focus-visible:ring-2 focus-visible:ring-fd-ring/25 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-red-500 aria-[invalid=true]:ring-red-500/25';

export const botonPrimario =
  'inline-flex h-10 items-center justify-center gap-2 rounded-md bg-fd-foreground px-4 text-sm font-medium text-fd-background sm:h-9 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2 focus-visible:ring-offset-fd-background disabled:pointer-events-none disabled:bg-fd-muted disabled:text-fd-muted-foreground disabled:opacity-100';

export const botonSecundario =
  'inline-flex h-10 items-center justify-center gap-2 rounded-md border sm:h-9 bg-fd-background px-3 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring disabled:pointer-events-none disabled:opacity-50';

export function Campo({
  id,
  label,
  opcional,
  error,
  ayuda,
  children,
  className,
}: {
  id: string;
  label: string;
  opcional?: boolean;
  error?: string;
  ayuda?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="flex items-baseline gap-2 text-sm font-medium text-fd-foreground">
        {label}
        {opcional && <span className="text-xs font-normal text-fd-muted-foreground">(opcional)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : ayuda ? (
        <p id={`${id}-ayuda`} className="text-xs text-fd-muted-foreground">
          {ayuda}
        </p>
      ) : null}
    </div>
  );
}

export function EstadoBadge({ estado, className }: { estado: EstadoAportacion; className?: string }) {
  const info = ESTADOS_INFO[estado];
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 text-xs font-medium',
        info.badge,
        className,
      )}
    >
      <span className={cn('size-1.5 rounded-full', info.dot)} aria-hidden />
      {info.label}
    </span>
  );
}
