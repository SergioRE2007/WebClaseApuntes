'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cerrarSesion } from '@/app/login/actions';

/** Cierra la sesión de Supabase y vuelve a la portada. */
export async function salir() {
  await cerrarSesion();
  // Que se vuelvan a pintar los layouts (menú de usuario y tutor) sin la sesión.
  revalidatePath('/', 'layout');
  redirect('/');
}
