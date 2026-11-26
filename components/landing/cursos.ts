import type { ReactNode } from 'react';
import type * as PageTree from 'fumadocs-core/page-tree';
import { source } from '@/lib/source';
import { CURSO_ACTUAL } from '@/lib/shared';

export interface ModuloResumen {
  id: string;
  nombre: string;
  descripcion: string | null;
  icono: ReactNode;
  url: string;
  paginas: string[];
}

export interface CursoResumen {
  id: string;
  /** "1º DAM", "2º DAM" u otro nombre de grupo. */
  nombre: string;
  /** Número de curso si se ha detectado (1 o 2). */
  numero: number | null;
  /** Portada del curso (/docs/2-dam), si la tiene. */
  url: string | null;
  modulos: ModuloResumen[];
  paginas: string[];
}

function texto(n: ReactNode): string {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(texto).join('');
  return '';
}

/** Detecta si un nombre de carpeta/separador es un curso ("1º DAM", "Primero", "2-dam"...). */
function numeroCurso(nombre: string): number | null {
  const n = nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const m =
    n.match(/(?:^|\D)([12])\s*(?:º|ª|o)?\s*(?:-|_)?\s*(?:de\s+)?(?:dam|curso)\b/) ??
    n.match(/\b(?:curso|dam)\s*([12])\b/) ??
    n.match(/^([12])\s*(?:º|ª)?$/);
  if (m) return Number(m[1]);
  if (/\bprimer(?:o)?\b/.test(n)) return 1;
  if (/\bsegundo\b/.test(n)) return 2;
  return null;
}

function profundidad(url: string): number {
  return url.replace(/^\/docs\/?/, '').split('/').filter(Boolean).length;
}

function todasLasUrls(node: PageTree.Node): string[] {
  if (node.type === 'page') return node.external ? [] : [node.url];
  if (node.type === 'folder') return [...(node.index ? [node.index.url] : []), ...node.children.flatMap(todasLasUrls)];
  return [];
}

/**
 * Portada de una carpeta. Si su meta.json lista "index" en `pages`, Fumadocs la deja como un hijo
 * normal en vez de en `folder.index`: es la página cuya url es prefijo de todas las demás.
 */
function portadaDe(node: PageTree.Folder): PageTree.Item | undefined {
  if (node.index) return node.index;
  const resto = node.children.flatMap(todasLasUrls);
  return node.children.find(
    (c): c is PageTree.Item =>
      c.type === 'page' && resto.length > 1 && resto.every((u) => u === c.url || u.startsWith(`${c.url}/`)),
  );
}

function urlsDe(node: PageTree.Node): string[] {
  if (node.type === 'page') return node.external ? [] : [node.url];
  // Las portadas de carpeta (index) no son temas: nunca se marcan como completadas.
  if (node.type === 'folder') {
    const indice = portadaDe(node)?.url;
    return node.children.flatMap(urlsDe).filter((u) => u !== indice);
  }
  return [];
}

function aModulo(node: PageTree.Folder | PageTree.Item, i: number): ModuloResumen | null {
  const paginas = urlsDe(node);
  const portada = node.type === 'folder' ? portadaDe(node) : undefined;
  // Un módulo vacío sigue apareciendo (con su portada) y se marca como "Próximamente".
  const url = node.type === 'page' ? node.url : (portada?.url ?? paginas[0]);
  if (!url) return null;
  return {
    id: node.$id ?? `${url}-${i}`,
    nombre: texto(node.name) || 'Módulo',
    descripcion: texto(node.description) || texto(portada?.description) || null,
    icono: node.icon ?? null,
    url,
    paginas,
  };
}

function cursoDesdeNodos(id: string, nombre: string, nodos: PageTree.Node[], url: string | null = null): CursoResumen {
  const modulos = nodos
    .filter((n): n is PageTree.Folder | PageTree.Item => n.type === 'folder' || n.type === 'page')
    .map(aModulo)
    .filter((m): m is ModuloResumen => m !== null);
  return {
    id,
    nombre,
    numero: numeroCurso(nombre),
    url,
    modulos,
    paginas: [...new Set(modulos.flatMap((m) => m.paginas))],
  };
}

/**
 * Agrupa el árbol de apuntes en cursos y módulos, sin depender de una estructura
 * fija:
 *  - Carpetas de primer nivel con nombre de curso ("1º DAM") → curso con sus subcarpetas como módulos.
 *  - Separadores de primer nivel ("--- 1º DAM ---" en meta.json) → curso con lo que sigue.
 *  - Cualquier otra carpeta de primer nivel → módulo del grupo "Módulos".
 * La página índice raíz (/docs) se ignora.
 */
export function getCursos(): CursoResumen[] {
  let tree: PageTree.Root;
  try {
    tree = source.getPageTree();
  } catch {
    return [];
  }

  const cursos: CursoResumen[] = [];
  const sueltos: PageTree.Node[] = [];
  let actual: { nombre: string; nodos: PageTree.Node[] } | null = null;

  const cerrarActual = () => {
    if (actual && actual.nodos.length > 0) {
      cursos.push(cursoDesdeNodos(`sep-${cursos.length}`, actual.nombre, actual.nodos));
    }
    actual = null;
  };

  for (const node of tree.children) {
    if (node.type === 'separator') {
      cerrarActual();
      const nombre = texto(node.name).trim();
      if (nombre) actual = { nombre, nodos: [] };
      continue;
    }
    if (node.type === 'folder' && numeroCurso(texto(node.name)) !== null) {
      cerrarActual();
      // La portada del curso (/docs/1-dam) no es un módulo.
      const hijos = node.children.filter(
        (c) => c.type !== 'separator' && !(c.type === 'page' && (c.url === portadaDe(node)?.url || profundidad(c.url) <= 1)),
      );
      // Si el curso no tiene subcarpetas, sus páginas hacen de módulos.
      cursos.push(
        cursoDesdeNodos(node.$id ?? `curso-${cursos.length}`, texto(node.name), hijos, portadaDe(node)?.url ?? null),
      );
      continue;
    }
    if (node.type === 'page' && (node.url === '/docs' || node.url === '/docs/')) continue;
    if (actual) (actual as { nodos: PageTree.Node[] }).nodos.push(node);
    // Pestañas raíz sin subcarpetas (p. ej. la guía del autor) no son módulos.
    else if (node.type === 'folder' && !(node.root && !node.children.some((c) => c.type === 'folder'))) sueltos.push(node);
  }
  cerrarActual();

  if (sueltos.length > 0) cursos.push(cursoDesdeNodos('modulos', 'Módulos', sueltos));

  return cursos
    .filter((c) => c.modulos.length > 0)
    .sort((a, b) => orden(a.numero) - orden(b.numero));
}

/** El curso actual de la clase va primero; el resto, en orden. */
function orden(numero: number | null | undefined) {
  if (numero === CURSO_ACTUAL) return -1;
  return numero ?? 99;
}

/** Títulos de todas las páginas por URL (para "Continúa donde lo dejaste"). */
export function getTitulos(): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    for (const p of source.getPages()) out[p.url] = p.data.title ?? p.url;
  } catch {
    /* sin contenido todavía */
  }
  return out;
}
