import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { LogoMark } from './logo';

/** Fondo con degradado + tarjeta "glass" centrada para login/unirse. */
export function AuthShell({
  titulo,
  subtitulo,
  children,
  pie,
}: {
  titulo: ReactNode;
  subtitulo?: ReactNode;
  children: ReactNode;
  pie?: ReactNode;
}) {
  return (
    <main className="relative isolate flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-12 sm:px-6">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_60%_55%_at_50%_45%,#000_30%,transparent_100%)]" />
        <div className="animate-aurora absolute top-1/2 left-1/2 h-[34rem] w-[34rem] max-w-[140vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,var(--dam-glow-1),transparent),radial-gradient(closest-side_at_75%_70%,var(--dam-glow-2),transparent)] blur-3xl" />
      </div>

      <Link
        href="/"
        className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground sm:top-6 sm:left-6"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Inicio
      </Link>

      <div className="ring-gradient glass relative w-full max-w-sm rounded-3xl border p-6 shadow-2xl shadow-fd-primary/10 sm:p-8">
        <Link href="/" aria-label="DAM Apuntes, ir al inicio" className="inline-flex rounded-xl">
          <LogoMark className="size-11 shadow-lg shadow-fd-primary/25 rounded-[0.8rem]" />
        </Link>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">{titulo}</h1>
        {subtitulo && <p className="mt-1.5 text-sm text-fd-muted-foreground">{subtitulo}</p>}
        {children}
      </div>

      {pie && <div className="mt-6 text-center text-xs text-fd-muted-foreground">{pie}</div>}
    </main>
  );
}

export { authBoton, authInput } from './auth-estilos';
