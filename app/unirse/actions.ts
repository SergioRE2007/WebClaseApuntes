'use server';

import { redirect } from 'next/navigation';
import { rutaSegura } from '@/lib/ruta-segura';
import { timingSafeEqual } from 'node:crypto';
import { env, isSupabaseConfigured } from '@/lib/env';
import { getPerfil } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';

const INTENTOS_DIARIOS = 10;

export type UnirseState = { mensaje: string } | null;

function igual(a: string, b: string) {
  const ba = Buffer.from(a.trim().toUpperCase());
  const bb = Buffer.from(b.trim().toUpperCase());
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export async function unirseClase(_prev: UnirseState, formData: FormData): Promise<UnirseState> {
  const perfil = await getPerfil();
  if (!perfil) redirect('/login');
  if (!isSupabaseConfigured) return { mensaje: 'En modo demo no hace falta código: ya estás dentro.' };
  const codigo = String(formData.get('codigo') ?? '').slice(0, 200);
  const nombre = String(formData.get('nombre') ?? '').trim().slice(0, 60);
  if (!env.claseCodigo) return { mensaje: 'El profe aún no ha configurado CLASE_CODIGO.' };
  if (nombre.length < 2) return { mensaje: 'Pon tu nombre (como te conoce la clase).' };

  const admin = createServiceClient();
  // Anti fuerza bruta: como mucho INTENTOS_DIARIOS por cuenta y día
  const { data: intentos, error: errIntento } = await admin.rpc('unirse_intento', {
    p_usuario: perfil.id,
    p_limite: INTENTOS_DIARIOS,
  });
  if (errIntento) {
    console.error('[unirse] No se pudo registrar el intento', errIntento);
    return { mensaje: 'Ahora mismo no se puede comprobar el código. Inténtalo en un rato.' };
  }
  if (Number(intentos) === -1) {
    return { mensaje: 'Demasiados intentos por hoy. Pide el código a quien gestiona la web y vuelve mañana.' };
  }
  if (!igual(codigo, env.claseCodigo)) return { mensaje: 'Código incorrecto. Pídeselo a quien gestiona la web.' };

  const { error } = await admin.from('perfiles').update({ clase_ok: true, nombre }).eq('id', perfil.id);
  if (error) return { mensaje: 'Error guardando tu perfil. Inténtalo de nuevo.' };

  const next = String(formData.get('next') ?? '/docs');
  redirect(rutaSegura(next));
}
