'use server';

import { z } from 'zod';
import { rutaSegura } from '@/lib/ruta-segura';
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
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: `${env.siteUrl}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error) return { ok: false, mensaje: 'No se pudo enviar el enlace. Inténtalo en un minuto.' };
  return { ok: true, mensaje: 'Te hemos enviado un enlace mágico. Revisa tu correo (y spam).' };
}

export async function cerrarSesion() {
  if (!isSupabaseConfigured) return;
  const supabase = await createClient();
  await supabase.auth.signOut();
}
