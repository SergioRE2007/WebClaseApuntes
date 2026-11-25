import { cn } from '@/lib/cn';

/**
 * Isotipo de DAM Apuntes: chevrons de código sobre degradado de marca.
 * El degradado va en CSS (no en un <linearGradient> con id): Fumadocs pinta el
 * título dos veces (cabecera móvil oculta + barra lateral) y un id duplicado
 * dentro de un subárbol `display:none` hace que el navegador no pinte nada.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex size-7 shrink-0 overflow-hidden rounded-[25%] bg-[linear-gradient(135deg,#4f46e5,#8b3dff_55%,#22c3e6)]',
        className,
      )}
    >
      <svg viewBox="0 0 64 64" className="size-full">
        <path d="M24 21 13 32l11 11" fill="none" stroke="#fff" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m40 21 11 11-11 11" fill="none" stroke="#fff" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" opacity=".92" />
        <path d="M35.5 17 28.5 47" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".75" />
      </svg>
    </span>
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
