import type { ReactNode } from 'react';
import { CalendarDays, CircleDashed, EyeOff } from 'lucide-react';

/**
 * Marcas para separar lo dado en clase de lo que no (ver "Contexto para la web"):
 *  - <NoDadoEnClase>: contenido que NO se ha dado en clase (bloque o etiqueta en línea).
 *  - <NoSeVio>: código o partes que no se llegan a ver en las capturas de clase.
 *  - <DeClase>: línea de metadatos "Visto en clase el 13/11 · ToDoApp".
 * <Dudoso> está en dudoso.tsx porque necesita el cliente (popover).
 */

export const TEXTO_NO_DADO =
  'No se ha visto en clase: es la forma más estándar de hacer lo que piden los requisitos. Si te preguntan en la defensa, di que lo has buscado tú.';

export const TEXTO_NO_SE_VIO =
  'Esta parte no sale en las capturas de clase. No se ha rellenado para no presentar como del profesor algo que no se vio.';

const cuerpoMarca =
  'mt-1.5 text-sm leading-relaxed text-fd-muted-foreground [&>:first-child]:mt-0 [&>:last-child]:mb-0 [&_p]:my-2';

export interface NoDadoEnClaseProps {
  /** Etiqueta pequeña en línea (junto a un título, en una tabla…) en vez de bloque. */
  inline?: boolean;
  /** Bloque: texto corto tras la etiqueta (p. ej. "Seed con Prisma"). */
  titulo?: string;
  /** Bloque: sustituye al texto por defecto. Admite Markdown. */
  children?: ReactNode;
}

/** Marca contenido que NO se ha dado en clase. */
export function NoDadoEnClase({ inline = false, titulo, children }: NoDadoEnClaseProps) {
  if (inline) {
    return (
      <span
        title={TEXTO_NO_DADO}
        className="not-prose ms-1.5 inline-flex items-center whitespace-nowrap rounded border border-dashed border-fd-foreground/30 px-1.5 py-px align-middle font-sans text-[11px] font-medium leading-4 tracking-normal text-fd-muted-foreground"
      >
        No dado en clase
      </span>
    );
  }
  return (
    <aside
      aria-label="No dado en clase"
      className="my-6 rounded-lg border border-dashed border-fd-foreground/30 bg-fd-background px-4 py-3 sm:px-5"
    >
      <p className="not-prose flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs font-medium text-fd-foreground">
        <CircleDashed className="size-3.5 shrink-0 text-fd-muted-foreground" aria-hidden />
        No dado en clase
        {titulo && <span className="font-normal text-fd-muted-foreground">· {titulo}</span>}
      </p>
      <div className={cuerpoMarca}>{children ?? <p>{TEXTO_NO_DADO}</p>}</div>
    </aside>
  );
}

export interface NoSeVioProps {
  /** Texto corto tras la etiqueta (p. ej. "DataStoreModule"). */
  titulo?: string;
  /** Qué es lo que falta. Admite Markdown. */
  children?: ReactNode;
}

/** Hueco: algo que no se llega a ver en clase. No se rellena con código inventado. */
export function NoSeVio({ titulo, children }: NoSeVioProps) {
  return (
    <aside
      aria-label="Esto no se llega a ver en clase"
      className="my-6 rounded-lg border bg-fd-muted/40 px-4 py-3 sm:px-5"
    >
      <p className="not-prose flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs font-medium text-fd-foreground">
        <EyeOff className="size-3.5 shrink-0 text-fd-muted-foreground" aria-hidden />
        Esto no se llega a ver en clase
        {titulo && <span className="font-normal text-fd-muted-foreground">· {titulo}</span>}
      </p>
      <div className={cuerpoMarca}>{children ?? <p>{TEXTO_NO_SE_VIO}</p>}</div>
    </aside>
  );
}

/** "13/11", "2026-11-13" o "13/11/2026" → "13/11". */
function formatearFecha(f: string): string {
  const t = f.trim();
  const iso = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) return `${iso[3]!.padStart(2, '0')}/${iso[2]!.padStart(2, '0')}`;
  const dmy = t.match(/^(\d{1,2})\/(\d{1,2})(?:\/\d{2,4})?$/);
  if (dmy) return `${dmy[1]!.padStart(2, '0')}/${dmy[2]!.padStart(2, '0')}`;
  return t;
}

export function textoFechas(fecha: string): string {
  const fechas = fecha
    .split(/[,;]/)
    .map(formatearFecha)
    .filter(Boolean)
    .map((f) => `el ${f}`);
  if (fechas.length <= 1) return fechas[0] ?? '';
  return `${fechas.slice(0, -1).join(', ')} y ${fechas.at(-1)}`;
}

export interface DeClaseProps {
  /** Fecha o fechas separadas por comas: "13/11", "09/10, 16/10, 23/10" o "2026-11-13". */
  fecha?: string;
  /** Proyecto de clase: "ToDoApp", "PokeApp2627"… */
  proyecto?: string;
  /** Rama del repositorio, si importa: "datastore". */
  rama?: string;
  /** Texto libre al final: "solo el fragmento de 3 minutos". */
  nota?: string;
}

/** Línea discreta de metadatos: "Visto en clase el 13/11 · ToDoApp". */
export function DeClase({ fecha, proyecto, rama, nota }: DeClaseProps) {
  const partes: ReactNode[] = [];
  const fechas = fecha ? textoFechas(fecha) : '';
  partes.push(<span key="f">{fechas ? `Visto en clase ${fechas}` : 'Visto en clase'}</span>);
  if (proyecto)
    partes.push(
      <span key="p">
        {proyecto}
        {rama && (
          <>
            {' '}
            (rama <code className="font-mono text-[0.95em]">{rama}</code>)
          </>
        )}
      </span>,
    );
  if (nota) partes.push(<span key="n">{nota}</span>);

  return (
    <p className="not-prose my-4 flex items-start gap-1.5 text-xs leading-5 text-fd-muted-foreground">
      <CalendarDays className="mt-[3px] size-3.5 shrink-0" aria-hidden />
      <span className="min-w-0">
        {partes.map((p, i) => (
          <span key={i}>
            {i > 0 && <span aria-hidden> · </span>}
            {i > 0 && <span className="sr-only">, </span>}
            {p}
          </span>
        ))}
      </span>
    </p>
  );
}

