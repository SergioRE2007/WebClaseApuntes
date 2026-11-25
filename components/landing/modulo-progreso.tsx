'use client';

import { completadas, useProgresoLocal } from './use-progreso-local';

/**
 * Texto a la derecha de cada módulo: "N temas" (nada si el módulo aún no tiene temas) o, si hay progreso
 * guardado en este navegador, "hechos/total".
 */
export function ModuloProgreso({ paginas }: { paginas: string[] }) {
  const progreso = useProgresoLocal();
  const total = paginas.length;
  if (total === 0) return null;
  const hechas = completadas(progreso, paginas);
  if (hechas === 0) return <>{total} {total === 1 ? 'tema' : 'temas'}</>;
  return (
    <span className={hechas === total ? 'text-fd-foreground' : undefined}>
      <span className="sr-only">Completados </span>
      {hechas}/{total}
      <span className="sr-only"> temas</span>
    </span>
  );
}
