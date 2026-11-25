'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getPerfil } from '@/lib/auth';
import { env, isSupabaseConfigured } from '@/lib/env';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import {
  BUCKET_APORTACIONES,
  MAX_BYTES,
  MIMES_PERMITIDOS,
  MODULO_OTRO,
  erroresPorCampo,
  mimeAdmitido,
  nuevaAportacionSchema,
  resolverMime,
  type NuevaAportacion,
  type ResultadoAccion,
} from '@/lib/aportaciones';
import { getModulos } from '@/components/aportaciones/modulos';

const DEMO: ResultadoAccion = {
  ok: false,
  error: 'Modo demo: configura Supabase para poder enviar aportaciones.',
};

/** Borra un objeto subido por el propio usuario (no hay política de borrado para alumnos). */
async function borrarHuerfano(path: string) {
  if (!env.supabaseServiceRoleKey) return;
  try {
    const admin = createServiceClient();
    // Solo si ninguna aportación lo referencia
    const { count } = await admin
      .from('aportaciones')
      .select('id', { count: 'exact', head: true })
      .eq('archivo_path', path);
    if (count) return;
    await admin.storage.from(BUCKET_APORTACIONES).remove([path]);
  } catch {
    // Mejor dejar un huérfano que romper la respuesta
  }
}

export async function crearAportacion(input: NuevaAportacion): Promise<ResultadoAccion> {
  if (!isSupabaseConfigured) return DEMO;
  const perfil = await getPerfil();
  if (!perfil) return { ok: false, error: 'Tu sesión ha caducado. Vuelve a entrar.' };
  if (!perfil.clase_ok) return { ok: false, error: 'Primero únete a la clase con el código.' };

  const parsed = nuevaAportacionSchema.safeParse(input);
  const archivoPath = typeof input?.archivo?.path === 'string' ? input.archivo.path : null;
  const propio = archivoPath?.startsWith(`${perfil.id}/`) ?? false;

  const fallar = async (r: ResultadoAccion): Promise<ResultadoAccion> => {
    if (archivoPath && propio) await borrarHuerfano(archivoPath);
    return r;
  };

  if (!parsed.success) {
    const campos = erroresPorCampo(parsed.error);
    return fallar({ ok: false, error: Object.values(campos)[0] ?? 'Revisa el formulario', campos });
  }
  const d = parsed.data;

  const modulosValidos = new Set([MODULO_OTRO, ...getModulos().map((m) => m.slug)]);
  if (!modulosValidos.has(d.modulo)) {
    return fallar({ ok: false, error: 'Módulo no válido', campos: { modulo: 'Módulo no válido' } });
  }

  const supabase = await createClient();
  let archivo: { path: string; nombre: string; mime: string; bytes: number } | null = null;

  if (d.archivo) {
    if (!d.archivo.path.startsWith(`${perfil.id}/`)) {
      return { ok: false, error: 'Ese archivo no es tuyo.' };
    }
    // Metadatos reales del objeto en Storage (no nos fiamos de lo que diga el cliente)
    const { data: info, error } = await supabase.storage.from(BUCKET_APORTACIONES).info(d.archivo.path);
    if (error || !info) {
      return fallar({ ok: false, error: 'No encuentro el archivo subido. Vuelve a intentarlo.' });
    }
    const bytes = Number(info.size ?? 0);
    const mime = resolverMime(d.archivo.nombre, info.contentType);
    if (!bytes || bytes > MAX_BYTES) {
      return fallar({ ok: false, error: 'El archivo supera los 50 MB.', campos: { archivo: 'Máximo 50 MB' } });
    }
    if (!MIMES_PERMITIDOS.includes(mime) || !mimeAdmitido(d.tipo, mime)) {
      return fallar({ ok: false, error: 'Formato de archivo no admitido para este tipo.', campos: { archivo: 'Formato no admitido' } });
    }
    archivo = { path: d.archivo.path, nombre: d.archivo.nombre.slice(0, 255), mime, bytes };
  }

  const { error } = await supabase.from('aportaciones').insert({
    autor_id: perfil.id,
    tipo: d.tipo,
    modulo: d.modulo,
    tema: d.tema ?? null,
    titulo: d.titulo,
    descripcion: d.descripcion ?? null,
    enlace: d.enlace ?? null,
    archivo_path: archivo?.path ?? null,
    archivo_nombre: archivo?.nombre ?? null,
    archivo_mime: archivo?.mime ?? null,
    archivo_bytes: archivo?.bytes ?? null,
  });

  if (error) {
    return fallar({ ok: false, error: 'No se pudo guardar la aportación. Inténtalo de nuevo.' });
  }

  revalidatePath('/aportar');
  revalidatePath('/admin');
  return { ok: true, mensaje: '¡Gracias! Tu aportación está pendiente de revisión.' };
}

/** Limpia un archivo subido cuando el envío no llega a completarse. */
export async function cancelarSubida(path: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  const p = z.string().max(400).safeParse(path);
  if (!p.success) return;
  const perfil = await getPerfil();
  if (!perfil || !p.data.startsWith(`${perfil.id}/`) || p.data.includes('..')) return;
  await borrarHuerfano(p.data);
}
