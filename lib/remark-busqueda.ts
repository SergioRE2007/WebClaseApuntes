/**
 * Plugin remark que limpia el índice de búsqueda (lo que ves con Ctrl+K):
 *  - Saca del índice los componentes interactivos (tests, flashcards, soluciones,
 *    diagramas…): si no, remark-structure serializa sus props y destripa respuestas.
 *  - Convierte los componentes "hoja" o de solo texto (Card, Termino…) en texto
 *    legible ("Título — descripción", "Término: definición") en vez de la etiqueta.
 *
 * No toca el renderizado: solo rellena `data.structuredData` del nodo, que
 * remark-structure usa "en lugar del nodo" (y de todos sus hijos).
 */
const OCULTOS_EN_BUSQUEDA = new Set([
  'Quiz',
  'Pregunta',
  'Opcion',
  'Explicacion',
  'Flashcards',
  'Tarjeta',
  'Pista',
  'Solucion',
  'CompletarCodigo',
  'MarcarCompletado',
  'Mermaid',
  'Terminal',
  'File',
  'Folder',
  'Files',
]);

/** Atributos de texto que tiene sentido buscar, en orden. */
const ATRIBUTOS_TEXTO = ['nombre', 'term', 'title', 'titulo', 'description', 'descripcion'];

const FRASE = new Set(['text', 'inlineCode', 'emphasis', 'strong', 'delete', 'link', 'break', 'mdxJsxTextElement', 'paragraph']);

interface Atributo {
  type: string;
  name?: string;
  value?: unknown;
}

interface Nodo {
  type: string;
  name?: string | null;
  value?: string;
  attributes?: Atributo[];
  children?: Nodo[];
  data?: Record<string, unknown>;
}

function soloFrase(n: Nodo): boolean {
  return (n.children ?? []).every((h) => FRASE.has(h.type) && soloFrase(h));
}

function texto(n: Nodo): string {
  if (n.type === 'inlineCode') return `\`${n.value ?? ''}\``;
  if (typeof n.value === 'string') return n.value;
  return (n.children ?? []).map(texto).join(n.type === 'paragraph' ? ' ' : '');
}

function atributos(n: Nodo): string[] {
  const out: string[] = [];
  for (const nombre of ATRIBUTOS_TEXTO) {
    const a = n.attributes?.find((x) => x.type === 'mdxJsxAttribute' && x.name === nombre);
    if (a && typeof a.value === 'string' && a.value.trim()) out.push(a.value.trim());
  }
  return out;
}

function sustituir(nodo: Nodo, contenido: string) {
  const content = contenido.replace(/\s+/g, ' ').trim();
  nodo.data = {
    ...nodo.data,
    structuredData: { contents: content ? [{ heading: undefined, content }] : [] },
  };
}

export function remarkBusquedaLimpia() {
  return (tree: Nodo) => {
    const visitar = (nodo: Nodo) => {
      if (nodo.type === 'mdxJsxFlowElement' && nodo.name) {
        if (OCULTOS_EN_BUSQUEDA.has(nodo.name)) return sustituir(nodo, '');
        const hijos = nodo.children ?? [];
        if (hijos.length === 0) return sustituir(nodo, atributos(nodo).join(' — '));
        if (soloFrase(nodo)) {
          const [etiqueta] = atributos(nodo);
          const cuerpo = texto(nodo).trim();
          return sustituir(nodo, etiqueta ? `${etiqueta}: ${cuerpo}` : cuerpo);
        }
      }
      for (const hijo of nodo.children ?? []) visitar(hijo);
    };
    visitar(tree);
  };
}
