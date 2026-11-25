import Link from 'next/link';
import type { ReactNode } from 'react';
import { Logo } from './logo';

/** Página de acceso: formulario centrado, sin adornos. */
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
    <main className="flex flex-1 flex-col items-center px-4 py-16 sm:px-6 sm:py-24">
      <div className="w-full max-w-sm">
        <Link href="/" aria-label="DAM Apuntes, ir al inicio" className="inline-flex rounded-sm">
          <Logo />
        </Link>
        <h1 className="mt-10 text-xl font-semibold tracking-tight">{titulo}</h1>
        {subtitulo && <p className="mt-1.5 text-sm leading-relaxed text-fd-muted-foreground">{subtitulo}</p>}
        {children}
        {pie && <div className="mt-8 border-t pt-4 text-xs leading-relaxed text-fd-muted-foreground">{pie}</div>}
      </div>
    </main>
  );
}

export { authBoton, authInput } from './auth-estilos';
