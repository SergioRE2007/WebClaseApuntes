import { Children, cloneElement, Fragment, isValidElement, type ReactElement, type ReactNode } from 'react';

/**
 * Utilidades sin 'use client' para los componentes que se renderizan en el
 * servidor (Comparar, Recorrido, Flujo). Desde un componente de servidor no se
 * puede llamar a funciones de un módulo 'use client', así que viven aquí.
 */

/** Hijos en orden, abriendo los fragmentos. */
export function aplanarHijos(children: ReactNode): ReactNode[] {
  const out: ReactNode[] = [];
  Children.forEach(children, (hijo) => {
    if (isValidElement<{ children?: ReactNode }>(hijo) && hijo.type === Fragment) {
      out.push(...aplanarHijos(hijo.props.children));
    } else if (hijo !== null && hijo !== undefined && typeof hijo !== 'boolean') {
      out.push(hijo);
    }
  });
  return out;
}

/**
 * Recorre los hijos que escribe el autor en MDX, se queda con las props de los
 * que son del tipo esperado (p. ej. <Paso>) y les inyecta `indice` (0, 1, 2…).
 * Así el servidor ya sabe cuántos pasos hay y cuál es el primero, sin esperar a
 * que hidrate el cliente.
 */
export function indexarHijos<P extends object>(
  children: ReactNode,
  esDelTipo: (hijo: ReactElement<Record<string, unknown>>) => boolean,
): { hijos: ReactNode[]; props: P[] } {
  const props: P[] = [];
  const hijos = aplanarHijos(children).map((hijo, i) => {
    if (isValidElement<Record<string, unknown>>(hijo) && esDelTipo(hijo)) {
      const indice = props.length;
      props.push(hijo.props as P);
      return cloneElement(hijo, { indice, key: `i${indice}` });
    }
    return isValidElement(hijo) ? cloneElement(hijo, { key: `o${i}` }) : hijo;
  });
  return { hijos, props };
}

/** Quita la indentación común y las líneas vacías del principio y del final. */
export function desindentar(texto: string): string {
  const lineas = texto.replace(/\r\n?/g, '\n').replace(/^\n+|\s+$/g, '').split('\n');
  const sangria = Math.min(...lineas.filter((l) => l.trim()).map((l) => l.match(/^[ \t]*/)?.[0].length ?? 0));
  return lineas.map((l) => l.slice(Number.isFinite(sangria) ? sangria : 0)).join('\n');
}

/**
 * Convierte "3-5", "7" o "3-5, 8, 10-12" en rangos [inicio, fin] (1-based),
 * recortados al número de líneas del código. Lo que no se entiende se ignora.
 */
export function parsearLineas(lineas: string | number | undefined, total: number): [number, number][] {
  if (lineas === undefined || lineas === null || lineas === '') return [];
  const rangos: [number, number][] = [];
  for (const parte of String(lineas).split(',')) {
    const m = parte.trim().match(/^(\d+)\s*(?:[-–]\s*(\d+))?$/);
    if (!m) continue;
    let ini = Number(m[1]);
    let fin = m[2] ? Number(m[2]) : ini;
    if (fin < ini) [ini, fin] = [fin, ini];
    ini = Math.max(1, ini);
    fin = Math.min(total, fin);
    if (ini <= fin) rangos.push([ini, fin]);
  }
  return rangos.sort((a, b) => a[0] - b[0]);
}
