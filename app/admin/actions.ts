'use server';

import { revalidatePath } from 'next/cache';
import { getPerfil } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/env';
import { createClient } from '@/lib/supabase/server';
import {
  BUCKET_APORTACIONES,
  idSchema,
  revisarSchema,
  type EstadoAportacion,
  type ResultadoAccion,
} from '@/lib/aportaciones';

/** Comprobación de admin dentro de cada acción (las acciones son endpoints públicos). */
async function asegurarAdmin(): Promise<ResultadoAccion | null> {
  if (!isSupabaseConfigured) return { ok: false, error: 'Modo demo: configura Supabase para gestionar aportaciones.' };
  const perfil = await getPerfil();
  if (!perfil) return { ok: false, error: 'Tu sesión ha caducado. Vuelve a entrar.' };
  if (perfil.rol !== 'admin') return { ok: false, error: 'Solo quien administra la web puede hacer esto.' };
  return null;
}

const MENSAJES: Record<EstadoAportacion, string> = {
  aprobada: 'Aportación aprobada',
  descartada: 'Aportación descartada',
  pendiente: 'Devuelta a pendientes',
};

export async function revisarAportacion(input: {
  id: string;
  estado: EstadoAportacion;
  nota?: string;
}): Promise<ResultadoAccion> {
  const denegado = await asegurarAdmin();
  if (denegado) return denegado;

  const parsed = revisarSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos no válidos' };
  const { id, estado, nota } = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('aportaciones')
    .update({
      estado,
      nota_admin: nota ?? null,
      revisado_en: estado === 'pendiente' ? null : new Date().toISOString(),
    })
    .eq('id', id)
    .select('id');

  if (error) return { ok: false, error: 'No se pudo actualizar. Inténtalo de nuevo.' };
  if (!data?.length) return { ok: false, error: 'Esa aportación ya no existe.' };

  revalidatePath('/admin');
  revalidatePath('/aportar');
  return { ok: true, mensaje: MENSAJES[estado] };
}

export async function eliminarAportacion(input: { id: string }): Promise<ResultadoAccion> {
  const denegado = await asegurarAdmin();
  if (denegado) return denegado;

  const parsed = idSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Identificador no válido' };

  const supabase = await createClient();
  const { data: fila, error: errLeer } = await supabase
    .from('aportaciones')
    .select('id, archivo_path')
    .eq('id', parsed.data.id)
    .maybeSingle();
  if (errLeer) return { ok: false, error: 'No se pudo leer la aportación.' };
  if (!fila) return { ok: false, error: 'Esa aportación ya no existe.' };

  const path = (fila as { archivo_path: string | null }).archivo_path;
  if (path) {
    const { error } = await supabase.storage.from(BUCKET_APORTACIONES).remove([path]);
    if (error) return { ok: false, error: 'No se pudo borrar el archivo adjunto. Inténtalo de nuevo.' };
  }

  const { error } = await supabase.from('aportaciones').delete().eq('id', parsed.data.id);
  if (error) return { ok: false, error: 'No se pudo eliminar la aportación.' };

  revalidatePath('/admin');
  revalidatePath('/aportar');
  return { ok: true, mensaje: 'Aportación eliminada' };
}
