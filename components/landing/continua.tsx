'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, History, Trophy } from 'lucide-react';
import { completadas, normalizarUrlProgreso, useProgresoLocal } from './use-progreso-local';

export interface CursoProgresoInfo {
  id: string;
  nombre: string;
  numero: number | null;
  paginas: string[];
}

interface Props {
  cursos: CursoProgresoInfo[];
  titulos: Record<string, string>;
}

function fechaRelativa(iso: string): string | null {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  const dias = Math.floor((Date.now() - t) / 86_400_000);
  if (dias <= 0) return 'hoy';
  if (dias === 1) return 'ayer';
  if (dias < 7) return `hace ${dias} días`;
  return new Date(t).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

/**
 * "Continúa donde lo dejaste": solo aparece si el alumno tiene progreso guardado
 * en este navegador (localStorage 'dam:progreso').
 */
export function Continua({ cursos, titulos }: Props) {
  const progreso = useProgresoLocal();

  const hechas = Object.entries(progreso).filter(([, v]) => v.completado);
  if (hechas.length === 0) return null;

  // Última página completada (por fecha).
  const [ultimaUrl, ultima] = hechas.reduce((a, b) => (Date.parse(b[1].fecha) > Date.parse(a[1].fecha) ? b : a));

  // Siguiente tema pendiente dentro del mismo curso, en el orden del temario.
  const cursoDeUltima = cursos.find((c) => c.paginas.some((u) => normalizarUrlProgreso(u) === ultimaUrl));
  let siguiente: string | null = null;
  if (cursoDeUltima) {
    const orden = cursoDeUltima.paginas.map(normalizarUrlProgreso);
    const idx = orden.indexOf(ultimaUrl);
    const resto = [...orden.slice(idx + 1), ...orden.slice(0, idx)];
    siguiente = resto.find((u) => !progreso[u]?.completado) ?? null;
  }

  const titulo = (url: string) =>
    titulos[url] ?? titulos[`${url}/`] ?? decodeURIComponent(url.split('/').filter(Boolean).pop() ?? url);

  const cuando = fechaRelativa(ultima.fecha);

  return (
    <section aria-labelledby="continua-titulo" className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="ring-gradient glass relative flex flex-col gap-5 rounded-2xl border p-5 shadow-lg shadow-fd-primary/5 md:flex-row md:items-center md:justify-between md:p-6"
      >
        <div className="flex min-w-0 items-start gap-4">
          <span className="bg-brand-gradient inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md">
            <History aria-hidden className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 id="continua-titulo" className="font-semibold">
              Continúa donde lo dejaste
            </h2>
            <p className="mt-0.5 truncate text-sm text-fd-muted-foreground">
              Último tema completado: <span className="text-fd-foreground">{titulo(ultimaUrl)}</span>
              {cuando ? ` · ${cuando}` : ''}
            </p>
            <ul className="mt-3 flex flex-wrap gap-2" aria-label="Progreso por curso">
              {cursos
                .filter((c) => c.paginas.length > 0)
                .map((c) => {
                  const n = completadas(progreso, c.paginas);
                  const total = c.paginas.length;
                  const pct = Math.round((n / total) * 100);
                  return (
                    <li
                      key={c.id}
                      className="inline-flex items-center gap-2 rounded-full border bg-fd-background/60 py-1 ps-1 pe-3 text-xs font-medium"
                    >
                      <Anillo pct={pct} />
                      <span>{c.nombre}</span>
                      <span className="tabular-nums text-fd-muted-foreground">
                        {n}/{total}
                      </span>
                    </li>
                  );
                })}
            </ul>
          </div>
        </div>

        {siguiente ? (
          <Link
            href={siguiente}
            className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-fd-primary px-5 py-2.5 text-sm font-semibold text-fd-primary-foreground shadow-md transition-[filter,transform] hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2 focus-visible:ring-offset-fd-background"
          >
            <span className="max-w-[16rem] truncate">Siguiente: {titulo(siguiente)}</span>
            <ArrowRight aria-hidden className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : cursoDeUltima ? (
          <p className="inline-flex shrink-0 items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
            <Trophy aria-hidden className="size-4" />
            ¡{cursoDeUltima.nombre} completado!
          </p>
        ) : (
          <Link
            href={ultimaUrl}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-fd-accent"
          >
            Volver al tema
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        )}
      </motion.div>
    </section>
  );
}

function Anillo({ pct }: { pct: number }) {
  const r = 8;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 20 20" className="size-5 -rotate-90" aria-hidden>
      <circle cx="10" cy="10" r={r} fill="none" strokeWidth="2.5" className="stroke-fd-muted" />
      <circle
        cx="10"
        cy="10"
        r={r}
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct / 100)}
        className={pct === 100 ? 'stroke-emerald-500' : 'stroke-fd-primary'}
      />
    </svg>
  );
}
