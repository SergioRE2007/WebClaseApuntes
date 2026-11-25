import Link from 'next/link';
import { Suspense } from 'react';
import { LogIn } from 'lucide-react';
import { getPerfil, type Perfil } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/env';
import { UserMenuCliente } from './user-menu-client';

async function UserMenuInterno() {
  let perfil: Perfil | null = null;
  try {
    perfil = await getPerfil();
  } catch {
    perfil = null;
  }

  if (!perfil) {
    return (
      <Link
        href="/login"
        className="inline-flex h-8 items-center gap-1.5 rounded-full bg-fd-primary px-3.5 text-sm font-medium text-fd-primary-foreground shadow-sm transition-[filter,transform] hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2 focus-visible:ring-offset-fd-background"
      >
        <LogIn className="size-3.5" aria-hidden />
        Entrar
      </Link>
    );
  }

  return (
    <UserMenuCliente
      nombre={perfil.nombre}
      email={perfil.email}
      esAdmin={perfil.rol === 'admin'}
      enClase={perfil.clase_ok}
      demo={!isSupabaseConfigured}
    />
  );
}

/**
 * Área de usuario de la barra de navegación (server component).
 * Muestra "Entrar" si no hay sesión; si la hay, un menú con avatar,
 * enlace al panel (solo admins) y cerrar sesión.
 */
export function UserMenu() {
  return (
    <Suspense fallback={<span aria-hidden className="inline-block size-8 animate-pulse rounded-full bg-fd-muted" />}>
      <UserMenuInterno />
    </Suspense>
  );
}
