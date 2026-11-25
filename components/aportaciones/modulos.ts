import 'server-only';
import { isValidElement, type ReactNode } from 'react';
import type * as PageTree from 'fumadocs-core/page-tree';
import { source } from '@/lib/source';
import { docsRoute } from '@/lib/shared';
import { MODULO_OTRO, type Modulo } from '@/lib/aportaciones';

function texto(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(texto).join('');
  if (isValidElement<{ children?: ReactNode }>(node)) return texto(node.props.children);
  return '';
}

function bonito(slug: string): string {
  const s = slug.replace(/[-_]+/g, ' ').trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function paginasDe(nodes: PageTree.Node[], out: { url: string; titulo: string }[] = []) {
  for (const n of nodes) {
    if (n.type === 'page') out.push({ url: n.url, titulo: texto(n.name) || n.url });
    else if (n.type === 'folder') {
      if (n.index) out.push({ url: n.index.url, titulo: texto(n.index.name) || texto(n.name) });
      paginasDe(n.children, out);
    }
  }
  return out;
}

function segmentos(url: string): string[] {
  const rel = url.startsWith(docsRoute) ? url.slice(docsRoute.length) : url;
  return rel.split('/').filter(Boolean);
}

function slugDeNodo(n: PageTree.Folder | PageTree.Item, profundidad: number): string | undefined {
  const urls = n.type === 'page' ? [n.url] : paginasDe([n]).map((p) => p.url);
  for (const u of urls) {
    const seg = segmentos(u);
    if (seg.length >= profundidad) return seg.slice(0, profundidad).join('/');
  }
  return undefined;
}

function aModulo(n: PageTree.Folder | PageTree.Item, profundidad: number, grupo?: string): Modulo | null {
  const slug = slugDeNodo(n, profundidad);
  if (!slug) return null;
  const temas =
    n.type === 'folder' ? paginasDe([n]).filter((t) => t.url !== `${docsRoute}/${slug}`) : [];
  return { slug, nombre: texto(n.name) || bonito(slug.split('/').at(-1) ?? slug), temas, grupo };
}

/**
 * Módulos del ciclo derivados del contenido. Nunca se codifican a mano: añadir
 * una carpeta en content/docs hace que aparezca aquí.
 *
 * - Carpeta raíz (`"root": true`) con subcarpetas → es un curso (1º/2º DAM) y
 *   cada subcarpeta es un módulo (`slug` = "1-dam/programacion").
 * - Carpeta raíz sin subcarpetas (p. ej. la guía del autor) → no es un módulo.
 * - Carpeta o página normal de primer nivel → módulo (`slug` = "carpeta").
 */
export function getModulos(): Modulo[] {
  const tree = source.getPageTree();
  const modulos: Modulo[] = [];
  const vistos = new Set<string>();
  const push = (m: Modulo | null) => {
    if (!m || vistos.has(m.slug) || m.slug === MODULO_OTRO) return;
    vistos.add(m.slug);
    modulos.push(m);
  };

  for (const n of tree.children) {
    if (n.type === 'separator') continue;
    if (n.type === 'page') {
      // la portada /docs no es un módulo
      if (segmentos(n.url).length > 0) push(aModulo(n, 1));
      continue;
    }
    const subcarpetas = n.children.filter((c): c is PageTree.Folder => c.type === 'folder');
    if (n.root) {
      const grupo = texto(n.name) || undefined;
      for (const c of subcarpetas) push(aModulo(c, 2, grupo));
      continue;
    }
    push(aModulo(n, 1));
  }

  return modulos;
}

/** slug → nombre legible (incluye "Otro"). */
export function getNombresModulos(): Record<string, string> {
  const map: Record<string, string> = { [MODULO_OTRO]: 'Otro' };
  for (const m of getModulos()) map[m.slug] = m.nombre;
  return map;
}
