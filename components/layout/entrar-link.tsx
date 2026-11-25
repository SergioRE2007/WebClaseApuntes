'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/** Enlace discreto a /login que vuelve a la página actual tras entrar. */
export function EntrarLink() {
  const pathname = usePathname() ?? '/';
  const next = pathname.startsWith('/login') || pathname.startsWith('/unirse') ? '/' : pathname;
  return (
    <Link
      href={`/login?next=${encodeURIComponent(next)}`}
      className="inline-flex h-10 items-center rounded-md px-2 sm:h-8 text-sm font-medium text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
    >
      Entrar
    </Link>
  );
}
