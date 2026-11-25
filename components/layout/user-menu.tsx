import { Suspense } from 'react';
import { getPerfil, type Perfil } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/env';
import { UserMenuCliente } from './user-menu-client';
import { EntrarLink } from './entrar-link';

async function UserMenuInterno() {
  let perfil: Perfil | null = null;
  try {
    perfil = await getPerfil();
  } catch {
    perfil = null;
  }

  if (!perfil) return <EntrarLink />;

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
 * Muestra "Entrar" (con vuelta a la página actual) si no hay sesión; si la hay, un menú con avatar,
 * enlace al panel (solo admins) y cerrar sesión.
 */
export function UserMenu() {
  return (
    <Suspense fallback={<span aria-hidden className="inline-block h-8 w-16" />}>
      <UserMenuInterno />
    </Suspense>
  );
}
