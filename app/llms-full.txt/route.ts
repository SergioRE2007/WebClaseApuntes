import { docsLlms } from '@/lib/source';
import { getPerfil } from '@/lib/auth';

// Texto completo de todos los apuntes: solo para miembros de la clase.
export const dynamic = 'force-dynamic';

export async function GET() {
  const perfil = await getPerfil();
  if (!perfil?.clase_ok) {
    return new Response('No autorizado', {
      status: 403,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex', 'Cache-Control': 'no-store' },
    });
  }
  const res = (await docsLlms.serve('/llms-full.txt'))!;
  const cabeceras = new Headers(res.headers);
  cabeceras.set('X-Robots-Tag', 'noindex');
  cabeceras.set('Cache-Control', 'private, no-store');
  return new Response(res.body, { status: res.status, headers: cabeceras });
}
