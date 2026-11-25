'use server';

import { redirect } from 'next/navigation';
import { timingSafeEqual } from 'node:crypto';
import { env } from '@/lib/env';
import { getPerfil } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';

export type UnirseState = { mensaje: string } | null;

function igual(a: string, b: string) {
  const ba = Buffer.from(a.trim().toUpperCase());
  const bb = Buffer.from(b.trim().toUpperCase());
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export async function unirseClase(_prev: UnirseState, formData: FormData): Promise<UnirseState> {
  const perfil = await getPerfil();
  if (!perfil) redirect('/login');
  const codigo = String(formData.get('codigo') ?? '');
  const nombre = String(formData.get('nombre') ?? '').trim().slice(0, 60);
  if (!env.claseCodigo) return { mensaje: 'El profe aún no ha configurado CLASE_CODIGO.' };
  if (!igual(codigo, env.claseCodigo)) return { mensaje: 'Código incorrecto. Pídeselo a quien gestiona la web.' };
  if (nombre.length < 2) return { mensaje: 'Pon tu nombre (como te conoce la clase).' };

  const admin = createServiceClient();
  const { error } = await admin.from('perfiles').update({ clase_ok: true, nombre }).eq('id', perfil.id);
  if (error) return { mensaje: 'Error guardando tu perfil. Inténtalo de nuevo.' };

  const next = String(formData.get('next') ?? '/docs');
  redirect(next.startsWith('/') && !next.startsWith('//') ? next : '/docs');
}
