import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

// Los apuntes son públicos, así que el buscador también.
const buscador = createFromSource(source);

export async function GET(request: Request) {
  const res = await buscador.GET(request as Parameters<typeof buscador.GET>[0]);
  const cabeceras = new Headers(res.headers);
  cabeceras.set('X-Robots-Tag', 'noindex');
  return new Response(res.body, { status: res.status, headers: cabeceras });
}
