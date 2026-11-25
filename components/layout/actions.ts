'use server';

import { redirect } from 'next/navigation';
import { cerrarSesion } from '@/app/login/actions';

/** Cierra la sesión de Supabase y vuelve a la portada. */
export async function salir() {
  await cerrarSesion();
  redirect('/');
}
