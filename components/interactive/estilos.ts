/**
 * Sistema visual común de los componentes interactivos: bloque con borde de
 * 1px, cabecera pequeña en gris y acento solo para la acción principal y la
 * selección. Verde/rojo/ámbar atenuados para correcto/incorrecto/aviso.
 */
export const bloque = 'not-prose my-8 overflow-hidden rounded-lg border bg-fd-background text-fd-foreground';
export const cabecera = 'flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b px-4 py-2.5 sm:px-5';
export const etiqueta = 'text-xs font-medium text-fd-muted-foreground';
export const tituloBloque = 'text-sm font-semibold text-fd-foreground';

export const botonPrimario =
  'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md bg-fd-foreground sm:min-h-8 px-3 py-1.5 text-sm font-medium text-fd-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2 focus-visible:ring-offset-fd-background disabled:pointer-events-none disabled:bg-fd-muted disabled:text-fd-muted-foreground disabled:opacity-100';
export const botonSecundario =
  'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md border sm:min-h-8 bg-fd-background px-3 py-1.5 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2 focus-visible:ring-offset-fd-background disabled:pointer-events-none disabled:opacity-40';

/** Estados semánticos (fondo teñido + texto), nunca saturados. */
export const okCaja = 'border-green-600/25 bg-green-600/[0.06] dark:border-green-400/25 dark:bg-green-400/[0.06]';
export const malCaja = 'border-red-600/25 bg-red-600/[0.06] dark:border-red-400/25 dark:bg-red-400/[0.06]';
export const avisoCaja = 'border-amber-600/25 bg-amber-500/[0.07] dark:border-amber-400/25 dark:bg-amber-400/[0.06]';
export const okTexto = 'text-green-700 dark:text-green-400';
export const malTexto = 'text-red-700 dark:text-red-400';
export const avisoTexto = 'text-amber-700 dark:text-amber-400';
