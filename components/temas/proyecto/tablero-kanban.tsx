'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { LayoutGroup, motion, MotionConfig, useReducedMotion } from 'motion/react';
import { ChevronLeft, ChevronRight, RotateCcw, Sun } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  avisoCaja,
  avisoTexto,
  bloque,
  botonPrimario,
  botonSecundario,
  cabecera,
  etiqueta,
  tituloBloque,
} from '@/components/interactive/estilos';

/*
 * Tablero Kanban con límite WIP y burndown del sprint. Las tarjetas se mueven
 * de columna con los botones; "En curso" no admite más tarjetas que el límite.
 * Cada "Terminar el día" apunta los puntos que quedan sin terminar y la
 * gráfica compara la línea real con la ideal.
 */

const COLUMNAS = ['Por hacer', 'En curso', 'En revisión', 'Listo'] as const;
const WIP = 2;
const DIAS = 10;

interface Tarjeta {
  id: string;
  titulo: string;
  puntos: number;
  etiqueta: string;
}

const TARJETAS: Tarjeta[] = [
  { id: 't1', titulo: 'Como alumno, quiero subir mis prácticas para que el profesor las corrija', puntos: 5, etiqueta: 'backend' },
  { id: 't2', titulo: 'Como profesor, quiero recibir notificaciones cuando un alumno entrega su trabajo', puntos: 3, etiqueta: 'backend' },
  { id: 't3', titulo: '[AUTH] Login con JWT', puntos: 5, etiqueta: 'security' },
  { id: 't4', titulo: '[PLATAFORMA] Proyectos Angular y Express creados', puntos: 2, etiqueta: 'frontend' },
  { id: 't5', titulo: 'Listado de prácticas con paginación', puntos: 3, etiqueta: 'frontend' },
  { id: 't6', titulo: 'Formulario de alta con validación', puntos: 3, etiqueta: 'frontend' },
];

const TOTAL = TARJETAS.reduce((s, t) => s + t.puntos, 0);
const INICIAL: Record<string, number> = Object.fromEntries(TARJETAS.map((t) => [t.id, 0]));

function Burndown({ reales, reducir }: { reales: number[]; reducir: boolean }) {
  const W = 320;
  const H = 150;
  const M = { l: 28, r: 8, t: 10, b: 22 };
  const x = (d: number) => M.l + (d / DIAS) * (W - M.l - M.r);
  const y = (p: number) => M.t + (1 - p / TOTAL) * (H - M.t - M.b);
  const puntos = reales.map((p, d) => `${x(d)},${y(p)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full max-w-md" role="img" aria-label={`Burndown: quedan ${reales.at(-1) ?? TOTAL} de ${TOTAL} puntos tras ${reales.length - 1} días`}>
      {[0, TOTAL / 2, TOTAL].map((p) => (
        <g key={p}>
          <line x1={M.l} x2={W - M.r} y1={y(p)} y2={y(p)} className="stroke-fd-border" strokeWidth={1} />
          <text x={M.l - 6} y={y(p) + 3} textAnchor="end" className="fill-fd-muted-foreground text-[9px]">
            {Math.round(p)}
          </text>
        </g>
      ))}
      {Array.from({ length: DIAS + 1 }, (_, d) => (
        <text key={d} x={x(d)} y={H - 6} textAnchor="middle" className="fill-fd-muted-foreground text-[9px]">
          {d}
        </text>
      ))}
      <line x1={x(0)} y1={y(TOTAL)} x2={x(DIAS)} y2={y(0)} strokeDasharray="4 4" strokeWidth={1.5} className="stroke-fd-muted-foreground" />
      <polyline points={puntos} fill="none" strokeWidth={2} strokeLinejoin="round" className="stroke-fd-primary" />
      {reales.map((p, d) => (
        <motion.circle
          key={d}
          cx={x(d)}
          cy={y(p)}
          r={3}
          className="fill-fd-primary"
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          initial={reducir ? false : { scale: 0 }}
          animate={{ scale: 1 }}
        />
      ))}
    </svg>
  );
}

export function TableroKanban({ titulo = 'Un sprint en un tablero Kanban' }: { titulo?: string }) {
  const reducir = useReducedMotion() ?? false;
  const grupo = useId();
  const [col, setCol] = useState<Record<string, number>>(INICIAL);
  const [reales, setReales] = useState<number[]>([TOTAL]);
  const [aviso, setAviso] = useState<string | null>(null);
  // Al mover una tarjeta, su <li> se monta en otra columna y el foco se perdería:
  // se devuelve al mismo botón (o al otro, si ese queda desactivado).
  const foco = useRef<{ id: string; dir: 'prev' | 'next' } | null>(null);

  useEffect(() => {
    const f = foco.current;
    if (!f) return;
    foco.current = null;
    const boton = (dir: string) => document.getElementById(`${grupo}-${f.id}-${dir}`) as HTMLButtonElement | null;
    const mismo = boton(f.dir);
    (mismo && !mismo.disabled ? mismo : boton(f.dir === 'prev' ? 'next' : 'prev'))?.focus();
  }, [col, grupo]);

  const enCurso = TARJETAS.filter((t) => col[t.id] === 1).length;
  const quedan = TARJETAS.filter((t) => col[t.id] !== 3).reduce((s, t) => s + t.puntos, 0);
  const dia = reales.length - 1;

  const mover = (t: Tarjeta, delta: number) => {
    const desde = col[t.id] ?? 0;
    const hasta = desde + delta;
    if (hasta < 0 || hasta >= COLUMNAS.length) return;
    if (hasta === 1 && enCurso >= WIP) {
      setAviso(`Límite WIP: "En curso" ya tiene ${WIP} tarjetas. Termina algo (pásalo a revisión) antes de empezar otra cosa.`);
      return;
    }
    setAviso(null);
    foco.current = { id: t.id, dir: delta < 0 ? 'prev' : 'next' };
    setCol((c) => ({ ...c, [t.id]: hasta }));
  };

  const terminarDia = () => {
    if (dia >= DIAS) return;
    setReales((r) => [...r, quedan]);
  };

  const reiniciar = () => {
    setCol(INICIAL);
    setReales([TOTAL]);
    setAviso(null);
  };

  return (
    <MotionConfig reducedMotion="user">
      <section aria-label={titulo} className={cn(bloque, '@container')}>
        <div className={cabecera}>
          <span className={etiqueta}>Demo</span>
          <p className={cn(tituloBloque, 'min-w-0 flex-1')}>{titulo}</p>
          <span className={cn(etiqueta, 'tabular-nums')}>
            Día {dia} de {DIAS} · quedan {quedan} de {TOTAL} puntos
          </span>
        </div>

        <LayoutGroup id={grupo}>
          <div className="grid gap-3 px-3 py-3 @md:grid-cols-2 @3xl:grid-cols-4 sm:px-4">
            {COLUMNAS.map((nombre, c) => {
              const tarjetas = TARJETAS.filter((t) => col[t.id] === c);
              const llena = c === 1 && tarjetas.length >= WIP;
              return (
                <div key={nombre} className="min-w-0 rounded-md border bg-fd-muted/30 p-2">
                  <p className="flex items-baseline justify-between gap-2 px-1 pb-2 text-xs font-medium">
                    <span>{nombre}</span>
                    <span className={cn('tabular-nums text-fd-muted-foreground', llena && avisoTexto)}>
                      {c === 1 ? `${tarjetas.length}/${WIP} WIP` : tarjetas.length}
                    </span>
                  </p>
                  <ul className="space-y-2" aria-label={`Columna ${nombre}`}>
                    {tarjetas.map((t) => (
                      <motion.li
                        key={t.id}
                        layoutId={t.id}
                        layout
                        transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                        className="rounded-md border bg-fd-background p-2"
                      >
                        <p className="text-xs leading-snug">{t.titulo}</p>
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="rounded border px-1 font-mono text-[10px] text-fd-muted-foreground">{t.etiqueta}</span>
                          <span className="text-[10px] tabular-nums text-fd-muted-foreground">{t.puntos} pts</span>
                          <span className="ml-auto flex gap-1">
                            <button
                              id={`${grupo}-${t.id}-prev`}
                              type="button"
                              onClick={() => mover(t, -1)}
                              disabled={c === 0}
                              aria-label={`Mover «${t.titulo}» a ${COLUMNAS[c - 1] ?? ''}`}
                              className="inline-flex size-7 items-center justify-center rounded border hover:bg-fd-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring disabled:opacity-30"
                            >
                              <ChevronLeft className="size-3.5" aria-hidden />
                            </button>
                            <button
                              id={`${grupo}-${t.id}-next`}
                              type="button"
                              onClick={() => mover(t, 1)}
                              disabled={c === COLUMNAS.length - 1}
                              aria-label={`Mover «${t.titulo}» a ${COLUMNAS[c + 1] ?? ''}`}
                              className="inline-flex size-7 items-center justify-center rounded border hover:bg-fd-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring disabled:opacity-30"
                            >
                              <ChevronRight className="size-3.5" aria-hidden />
                            </button>
                          </span>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </LayoutGroup>

        <div className="px-4 sm:px-5" aria-live="polite">
          {aviso ? <p className={cn('mb-3 rounded-md border px-3 py-2 text-sm', avisoCaja, avisoTexto)}>{aviso}</p> : null}
        </div>

        <div className="border-t px-4 py-4 sm:px-5">
          <p className="text-sm font-medium">Burndown del sprint</p>
          <p className="mb-2 text-xs text-fd-muted-foreground">
            Discontinua: el ritmo ideal. Continua: los puntos que quedaban al final de cada día. Solo cuenta lo que está en Listo.
          </p>
          <Burndown reales={reales} reducir={reducir} />
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className={botonPrimario} onClick={terminarDia} disabled={dia >= DIAS}>
              <Sun className="size-3.5" aria-hidden />
              Terminar el día {dia + 1 > DIAS ? '' : dia + 1}
            </button>
            <button type="button" className={botonSecundario} onClick={reiniciar}>
              <RotateCcw className="size-3.5" aria-hidden />
              Reiniciar el sprint
            </button>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
