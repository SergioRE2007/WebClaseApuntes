'use client';

import { completadas, useProgresoLocal } from './use-progreso-local';

/**
 * Texto de progreso de un grupo de temas (un módulo o un curso entero): "N temas" (nada si aún no tiene temas)
 * o, si hay progreso guardado en este navegador, "hechos/total". Con `unidad`, el "temas" también se ve en el
 * segundo caso ("3/12 temas"), para cuando el número va suelto en una frase.
 */
export function ModuloProgreso({ paginas, unidad = false }: { paginas: string[]; unidad?: boolean }) {
  const progreso = useProgresoLocal();
  const total = paginas.length;
  if (total === 0) return null;
  const hechas = completadas(progreso, paginas);
  const temas = total === 1 ? 'tema' : 'temas';
  if (hechas === 0) return <>{total} {temas}</>;
  return (
    <span className={hechas === total ? 'text-fd-foreground' : undefined}>
      <span className="sr-only">Completados </span>
      {hechas}/{total}
      <span className={unidad ? undefined : 'sr-only'}> {temas}</span>
    </span>
  );
}
