'use client';

import { completadas, useProgresoLocal } from './use-progreso-local';

/** Barra de progreso de un módulo (lee 'dam:progreso'; invisible si no hay nada hecho). */
export function ModuloProgreso({ paginas, nombre }: { paginas: string[]; nombre: string }) {
  const progreso = useProgresoLocal();
  const total = paginas.length;
  const hechas = completadas(progreso, paginas);
  if (total === 0 || hechas === 0) return null;
  const pct = Math.round((hechas / total) * 100);
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between text-[11px] font-medium text-fd-muted-foreground">
        <span>{pct === 100 ? 'Completado' : 'En progreso'}</span>
        <span className="tabular-nums">
          {hechas}/{total}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={`Progreso en ${nombre}`}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={hechas}
        className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-fd-muted"
      >
        <div
          className={pct === 100 ? 'h-full rounded-full bg-emerald-500' : 'bg-brand-gradient h-full rounded-full'}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
