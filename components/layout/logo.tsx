import { useId } from 'react';
import { cn } from '@/lib/cn';

/** Isotipo de DAM Apuntes: chevrons de código sobre degradado de marca. */
export function LogoMark({ className }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={cn('size-7 shrink-0', className)}>
      <defs>
        <linearGradient id={id} x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#4f46e5" />
          <stop offset=".55" stopColor="#8b3dff" />
          <stop offset="1" stopColor="#22c3e6" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${id})`} />
      <path d="M24 21 13 32l11 11" fill="none" stroke="#fff" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m40 21 11 11-11 11" fill="none" stroke="#fff" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" opacity=".92" />
      <path d="M35.5 17 28.5 47" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".75" />
    </svg>
  );
}

/** Logo completo (isotipo + nombre) para la barra de navegación. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark />
      <span className="font-semibold tracking-tight">
        DAM <span className="text-fd-muted-foreground font-medium">Apuntes</span>
      </span>
    </span>
  );
}
