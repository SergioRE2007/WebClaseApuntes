'use client';

import { createClient } from '@/lib/supabase/client';
import { BUCKET_APORTACIONES } from '@/lib/aportaciones';

export class SubidaCancelada extends Error {
  constructor() {
    super('Subida cancelada');
  }
}

/**
 * Sube un archivo directamente del navegador a Supabase Storage (bucket
 * privado). Usa XHR en lugar de supabase-js para poder mostrar el progreso.
 * Las políticas RLS del bucket exigen que la ruta empiece por `<auth.uid()>/`.
 */
export async function subirArchivo(
  path: string,
  archivo: File,
  contentType: string,
  onProgreso: (fraccion: number | null) => void,
  signal?: AbortSignal,
): Promise<void> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error('Tu sesión ha caducado. Vuelve a entrar.');

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/$/, '');
  const ruta = path.split('/').map(encodeURIComponent).join('/');
  const url = `${base}/storage/v1/object/${BUCKET_APORTACIONES}/${ruta}`;

  if (typeof XMLHttpRequest === 'undefined') {
    onProgreso(null);
    const { error } = await supabase.storage
      .from(BUCKET_APORTACIONES)
      .upload(path, archivo, { contentType, upsert: false, cacheControl: '3600' });
    if (error) throw new Error(traducirError(error.message));
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader('authorization', `Bearer ${session.access_token}`);
    xhr.setRequestHeader('apikey', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    xhr.setRequestHeader('x-upsert', 'false');
    xhr.setRequestHeader('cache-control', 'max-age=3600');
    xhr.setRequestHeader('content-type', contentType || 'application/octet-stream');

    xhr.upload.onprogress = (e) => onProgreso(e.lengthComputable ? e.loaded / e.total : null);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgreso(1);
        resolve();
        return;
      }
      let msg = `Error ${xhr.status} al subir`;
      try {
        const body = JSON.parse(xhr.responseText) as { message?: string; error?: string };
        msg = body.message ?? body.error ?? msg;
      } catch {
        // respuesta no JSON
      }
      reject(new Error(traducirError(msg, xhr.status)));
    };
    xhr.onerror = () => reject(new Error('Fallo de red al subir el archivo. Revisa tu conexión.'));
    xhr.onabort = () => reject(new SubidaCancelada());

    if (signal) {
      if (signal.aborted) {
        xhr.abort();
        return;
      }
      signal.addEventListener('abort', () => xhr.abort(), { once: true });
    }
    onProgreso(0);
    xhr.send(archivo);
  });
}

function traducirError(msg: string, status?: number): string {
  const m = msg.toLowerCase();
  if (status === 413 || m.includes('maximum allowed size') || m.includes('too large')) {
    return 'El archivo es demasiado grande (máx. 50 MB).';
  }
  if (status === 403 || m.includes('row-level security') || m.includes('unauthorized')) {
    return 'No tienes permiso para subir archivos. ¿Has entrado con tu cuenta?';
  }
  if (m.includes('mime') || m.includes('content type')) return 'Formato de archivo no admitido.';
  if (m.includes('already exists') || m.includes('duplicate')) return 'Ese archivo ya existe; vuelve a intentarlo.';
  return msg;
}
