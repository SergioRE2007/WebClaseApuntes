import Link from 'next/link';
import { LogoMark } from '@/components/layout/logo';

export function Footer({ logueado = false }: { logueado?: boolean }) {
  const anio = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <LogoMark className="size-8" />
          <div>
            <p className="text-sm font-semibold">DAM Apuntes</p>
            <p className="text-xs text-fd-muted-foreground">Hecho por y para la clase de DAM · {anio}</p>
          </div>
        </div>
        <nav aria-label="Pie de página" className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-fd-muted-foreground">
          <Link href="/docs" className="rounded transition-colors hover:text-fd-foreground">
            Apuntes
          </Link>
          <Link href="/aportar" className="rounded transition-colors hover:text-fd-foreground">
            Aportar
          </Link>
          {logueado ? null : (
            <Link href="/login" className="rounded transition-colors hover:text-fd-foreground">
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </footer>
  );
}
