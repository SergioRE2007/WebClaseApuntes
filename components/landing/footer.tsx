import Link from 'next/link';

export function Footer({ logueado = false }: { logueado?: boolean }) {
  const enlace = 'inline-flex min-h-10 items-center hover:text-fd-foreground sm:min-h-0';
  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center gap-x-5 gap-y-1 px-4 py-5 sm:py-6 text-sm text-fd-muted-foreground sm:px-6">
        <span>DAM Apuntes · {new Date().getFullYear()}</span>
        <nav aria-label="Pie de página" className="ms-auto flex gap-5">
          <Link href="/docs" className={enlace}>
            Apuntes
          </Link>
          <Link href="/aportar" className={enlace}>
            Aportar
          </Link>
          {logueado ? null : (
            <Link href="/login" className={enlace}>
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </footer>
  );
}
