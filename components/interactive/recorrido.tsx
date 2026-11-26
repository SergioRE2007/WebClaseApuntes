import type { ReactNode } from 'react';
import { highlightHast } from 'fumadocs-core/highlight';
import { desindentar, indexarHijos } from './hijos';
import { Paso, RecorridoCliente, type PasoMeta, type Token } from './recorrido-cliente';

export interface RecorridoProps {
  /** Código entre {`...`}. La sangría común se quita sola. */
  codigo: string;
  /** Lenguaje para el resaltado (Shiki): kotlin, typescript, ts, html, java, json, bash, prisma, csharp, sql… */
  lenguaje?: string;
  /** Título del bloque, normalmente el nombre del archivo: "TaskListViewModel.kt". */
  titulo?: string;
  /** Hijos <Paso lineas="3-5" titulo="…">explicación</Paso>, en orden. */
  children?: ReactNode;
}

interface NodoHast {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: NodoHast[];
}

function buscar(nodo: NodoHast, tag: string): NodoHast | null {
  if (nodo.type === 'element' && nodo.tagName === tag) return nodo;
  for (const h of nodo.children ?? []) {
    const r = buscar(h, tag);
    if (r) return r;
  }
  return null;
}

function textoDe(nodo: NodoHast): string {
  if (nodo.type === 'text') return nodo.value ?? '';
  return (nodo.children ?? []).map(textoDe).join('');
}

function variables(estilo: unknown): Record<string, string> | undefined {
  if (typeof estilo !== 'string') return undefined;
  const out: Record<string, string> = {};
  for (const decl of estilo.split(';')) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const k = decl.slice(0, i).trim();
    if (k.startsWith('--shiki-')) out[k] = decl.slice(i + 1).trim();
  }
  // Comentarios de github-dark con contraste AA (como en app/global.css).
  if (out['--shiki-dark']?.toUpperCase() === '#6A737D') out['--shiki-dark'] = '#8B949E';
  return Object.keys(out).length ? out : undefined;
}

function esLinea(n: NodoHast) {
  // Shiki pone `class: "line"` (string); otros procesadores, `className: ["line"]`.
  const c = n.properties?.className ?? n.properties?.class;
  const clases = Array.isArray(c) ? c.map(String) : typeof c === 'string' ? c.split(/\s+/) : [];
  return n.type === 'element' && clases.includes('line');
}

async function resaltar(codigo: string, lenguaje: string): Promise<Token[][]> {
  const plano = () => codigo.split('\n').map((l) => (l ? [{ t: l }] : []));
  if (!lenguaje || lenguaje === 'text' || lenguaje === 'txt') return plano();
  try {
    const raiz = (await highlightHast(codigo, { lang: lenguaje, fallbackLanguage: 'text' })) as unknown as NodoHast;
    const code = buscar(raiz, 'code');
    const lineas = (code?.children ?? []).filter(esLinea).map((linea) =>
      (linea.children ?? [])
        .map((tk): Token => {
          const s = tk.type === 'element' ? variables(tk.properties?.style) : undefined;
          return s ? { t: textoDe(tk), s } : { t: textoDe(tk) };
        })
        .filter((tk) => tk.t.length > 0),
    );
    return lineas.length === codigo.split('\n').length ? lineas : plano();
  } catch {
    return plano();
  }
}

/**
 * Recorrido de código paso a paso. Componente de servidor: resalta el código con
 * el Shiki de Fumadocs (mismos colores que los bloques de código) y lee los
 * <Paso>; la parte interactiva está en recorrido-cliente.tsx.
 *
 * Solo funciona en MDX o en componentes de servidor (es asíncrono).
 */
export async function Recorrido({ codigo, lenguaje = 'text', titulo, children }: RecorridoProps) {
  const fuente = desindentar(String(codigo ?? ''));
  const lineas = await resaltar(fuente, lenguaje.toLowerCase());
  const { hijos, props } = indexarHijos<PasoMeta>(
    children,
    (h) => h.type === Paso || 'lineas' in h.props || 'titulo' in h.props,
  );
  const pasos = props.map((p) => ({ titulo: p.titulo, lineas: p.lineas }));
  return (
    <RecorridoCliente titulo={titulo} lenguaje={lenguaje} lineas={lineas} pasos={pasos}>
      {hijos}
    </RecorridoCliente>
  );
}

export { Paso };
