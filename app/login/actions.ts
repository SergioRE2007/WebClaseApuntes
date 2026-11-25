'use server';

import { z } from 'zod';
import { rutaSegura } from '@/lib/ruta-segura';
import { headers } from 'next/headers';
import { env, isSupabaseConfigured } from '@/lib/env';
import { createClient } from '@/lib/supabase/server';

export type LoginState = { ok: boolean; mensaje: string } | null;

const schema = z.object({
  email: z.email('Email no válido'),
  next: z.string().optional(),
});

export async function enviarEnlace(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!isSupabaseConfigured) return { ok: false, mensaje: 'Supabase no está configurado (modo demo).' };
  const parsed = schema.safeParse({ email: formData.get('email'), next: formData.get('next') ?? undefined });
  if (!parsed.success) return { ok: false, mensaje: parsed.error.issues[0]?.message ?? 'Datos no válidos' };

  const next = rutaSegura(parsed.data.next);
  // El enlace debe volver al MISMO dominio desde el que se pide (ahí está la cookie PKCE).
  const origen = await origenPeticion();
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: `${origen}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error) {
    if (error.status === 429) return { ok: false, mensaje: 'Acabas de pedir un enlace. Espera un minuto y usa el último que te llegó.' };
    return { ok: false, mensaje: 'No se pudo enviar el enlace. Inténtalo en un minuto.' };
  }
  return { ok: true, mensaje: 'Te hemos enviado un enlace. Ábrelo en este mismo navegador (revisa también spam).' };
}

async function origenPeticion() {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  if (!host) return env.siteUrl;
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

export async function cerrarSesion() {
  if (!isSupabaseConfigured) return;
  const supabase = await createClient();
  await supabase.auth.signOut();
}
