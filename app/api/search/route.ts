import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';
import { getPerfil } from '@/lib/auth';

// El índice contiene extractos de todos los apuntes: solo para miembros de la clase.
const buscador = createFromSource(source);

export async function GET(request: Request) {
  const perfil = await getPerfil();
  if (!perfil?.clase_ok) {
    return Response.json(
      { error: 'No autorizado' },
      { status: 403, headers: { 'X-Robots-Tag': 'noindex', 'Cache-Control': 'no-store' } },
    );
  }
  const res = await buscador.GET(request as Parameters<typeof buscador.GET>[0]);
  const cabeceras = new Headers(res.headers);
  cabeceras.set('X-Robots-Tag', 'noindex');
  cabeceras.set('Cache-Control', 'private, no-store');
  return new Response(res.body, { status: res.status, headers: cabeceras });
}
