import 'server-only';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { isSupabaseConfigured } from '@/lib/env';
import { createClient } from '@/lib/supabase/server';

export type Rol = 'alumno' | 'admin';

export interface Perfil {
  id: string;
  email: string;
  nombre: string | null;
  rol: Rol;
  clase_ok: boolean;
}

/** Perfil del usuario actual o null. En modo demo devuelve un admin ficticio. */
export const getPerfil = cache(async (): Promise<Perfil | null> => {
  if (!isSupabaseConfigured) {
    return { id: 'demo', email: 'demo@local', nombre: 'Demo', rol: 'admin', clase_ok: true };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('perfiles')
    .select('id, email, nombre, rol, clase_ok')
    .eq('id', user.id)
    .maybeSingle();
  return (
    (data as Perfil | null) ?? {
      id: user.id,
      email: user.email ?? '',
      nombre: null,
      rol: 'alumno',
      clase_ok: false,
    }
  );
});

/** Exige usuario logueado y dentro de la clase; si no, redirige. */
export async function requireAlumno(next = '/docs'): Promise<Perfil> {
  const perfil = await getPerfil();
  if (!perfil) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (!perfil.clase_ok) redirect(`/unirse?next=${encodeURIComponent(next)}`);
  return perfil;
}

/** Exige rol admin. */
export async function requireAdmin(): Promise<Perfil> {
  const perfil = await requireAlumno('/admin');
  if (perfil.rol !== 'admin') redirect('/');
  return perfil;
}
