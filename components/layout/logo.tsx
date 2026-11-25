import { cn } from '@/lib/cn';

/** Marca mínima: "< >" en el color del texto. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('size-4 shrink-0', className)}
    >
      <path d="m9 7-5 5 5 5M15 7l5 5-5 5" />
    </svg>
  );
}

/** Logo de texto para la barra de navegación. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-[15px] font-semibold tracking-tight', className)}>
      <LogoMark className="text-fd-muted-foreground" />
      DAM Apuntes
    </span>
  );
}
