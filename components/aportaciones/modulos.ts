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

/**
 * Módulos del curso derivados del contenido (carpetas/páginas de primer nivel
 * bajo content/docs). Nunca se codifican a mano: añadir una carpeta en
 * content/docs hace que aparezca aquí.
 */
export function getModulos(): Modulo[] {
  const pages = source.getPages();
  const tree = source.getPageTree();

  // slug de primer nivel → páginas
  const porSlug = new Map<string, { url: string; titulo: string }[]>();
  for (const p of pages) {
    const slug = p.slugs[0];
    if (!slug) continue; // la portada /docs no es un módulo
    const lista = porSlug.get(slug) ?? [];
    lista.push({ url: p.url, titulo: p.data.title ?? bonito(p.slugs.at(-1) ?? slug) });
    porSlug.set(slug, lista);
  }

  const slugDeUrl = (url: string) => {
    const page = pages.find((p) => p.url === url);
    return page?.slugs[0];
  };

  const modulos: Modulo[] = [];
  const vistos = new Set<string>();

  // Primero en el orden del árbol (respeta meta.json)
  for (const n of tree.children) {
    if (n.type === 'separator') continue;
    const urls = n.type === 'page' ? [n.url] : paginasDe([n]).map((p) => p.url);
    const slug = urls.map(slugDeUrl).find(Boolean);
    if (!slug || vistos.has(slug)) continue;
    vistos.add(slug);
    const ordenArbol = n.type === 'folder' ? paginasDe([n]) : [];
    const temas = (ordenArbol.length ? ordenArbol : (porSlug.get(slug) ?? [])).filter(
      (t) => t.url !== `${docsRoute}/${slug}` || n.type === 'page',
    );
    modulos.push({
      slug,
      nombre: texto(n.name) || bonito(slug),
      temas: n.type === 'page' ? [] : temas,
    });
  }

  // Por si algo no aparece en el árbol
  for (const [slug, temas] of porSlug) {
    if (vistos.has(slug) || slug === MODULO_OTRO) continue;
    modulos.push({ slug, nombre: bonito(slug), temas: temas.length > 1 ? temas : [] });
  }

  return modulos;
}

/** slug → nombre legible (incluye "Otro"). */
export function getNombresModulos(): Record<string, string> {
  const map: Record<string, string> = { [MODULO_OTRO]: 'Otro' };
  for (const m of getModulos()) map[m.slug] = m.nombre;
  return map;
}
