'use client';

import { createContext, use, useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bot, Dumbbell, Eye, EyeOff, Lightbulb, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useRegistroOrdenado } from './utils';
import { botonPrimario, botonSecundario } from './quiz';

type Dificultad = 'facil' | 'media' | 'dificil';

const DIFICULTADES: Record<Dificultad, { etiqueta: string; clase: string; puntos: number }> = {
  facil: { etiqueta: 'Fácil', clase: 'bg-green-500/15 text-green-700 dark:text-green-400', puntos: 1 },
  media: { etiqueta: 'Media', clase: 'bg-amber-500/15 text-amber-700 dark:text-amber-400', puntos: 2 },
  dificil: { etiqueta: 'Difícil', clase: 'bg-red-500/15 text-red-700 dark:text-red-400', puntos: 3 },
};

interface EjercicioCtx {
  pistasVisibles: number;
  indicePista: (id: string) => number;
  registrarPista: () => () => void;
  solucionVisible: boolean;
  registrarSolucion: () => () => void;
}

const EjercicioContext = createContext<EjercicioCtx | null>(null);

export interface EjercicioProps {
  titulo: string;
  dificultad?: Dificultad;
  /**
   * Pregunta que se envía al Tutor DAM al pulsar «Pregúntale al tutor».
   * Por defecto se genera una a partir del título. Usa `tutor={false}` para ocultar el botón.
   */
  pregunta?: string;
  tutor?: boolean;
  /** Enunciado (markdown) + <Pista> y <Solucion>. */
  children: ReactNode;
}

export function Ejercicio({ titulo, dificultad = 'media', pregunta, tutor = true, children }: EjercicioProps) {
  const contenedor = useRef<HTMLDivElement>(null);
  const { ids: pistas, registrar: registrarPista } = useRegistroOrdenado(contenedor, 'data-pista');
  const [pistasVisibles, setPistasVisibles] = useState(0);
  const [numSoluciones, setNumSoluciones] = useState(0);
  const [fase, setFase] = useState<'oculta' | 'confirmar' | 'visible'>('oculta');
  const tituloId = useId();
  const dif = DIFICULTADES[dificultad] ?? DIFICULTADES.media;

  const registrarSolucion = useCallback(() => {
    setNumSoluciones((n) => n + 1);
    return () => setNumSoluciones((n) => n - 1);
  }, []);

  const indicePista = useCallback((id: string) => pistas.indexOf(id), [pistas]);

  const ctx = useMemo<EjercicioCtx>(
    () => ({
      pistasVisibles,
      indicePista,
      registrarPista,
      solucionVisible: fase === 'visible',
      registrarSolucion,
    }),
    [pistasVisibles, indicePista, registrarPista, fase, registrarSolucion],
  );

  const quedanPistas = pistasVisibles < pistas.length;

  const preguntarTutor = () => {
    const texto =
      pregunta ??
      `Estoy haciendo el ejercicio «${titulo}» de los apuntes. ¿Me ayudas a razonarlo paso a paso sin darme directamente la solución?`;
    window.dispatchEvent(new CustomEvent('dam:abrir-chat', { detail: { pregunta: texto } }));
  };

  return (
    <section
      aria-labelledby={tituloId}
      className="my-8 overflow-hidden rounded-2xl border bg-fd-card text-fd-card-foreground shadow-sm"
    >
      <div className="not-prose flex flex-wrap items-center gap-3 border-b bg-fd-muted/50 px-4 py-3 sm:px-5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-fd-primary text-fd-primary-foreground">
          <Dumbbell className="size-5" aria-hidden />
        </span>
        <p id={tituloId} className="min-w-0 flex-1 font-semibold leading-tight">
          <span className="block text-[0.7rem] font-medium uppercase tracking-wider text-fd-muted-foreground">Ejercicio</span>
          {titulo}
        </p>
        <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', dif.clase)}>
          <span className="sr-only">Dificultad: </span>
          {dif.etiqueta}
          <span aria-hidden className="ml-1 tracking-tighter">
            {'●'.repeat(dif.puntos)}
            <span className="opacity-30">{'●'.repeat(3 - dif.puntos)}</span>
          </span>
        </span>
      </div>

      <div ref={contenedor} data-registro-raiz="" className="px-4 py-4 sm:px-5 [&>:first-child]:mt-0 [&>:last-child]:mb-0">
        <EjercicioContext value={ctx}>{children}</EjercicioContext>
      </div>

      <div className="not-prose border-t px-4 py-3 sm:px-5">
        <AnimatePresence mode="wait" initial={false}>
          {fase === 'confirmar' ? (
            <motion.div
              key="confirmar"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex flex-col gap-3 sm:flex-row sm:items-center"
              role="alertdialog"
              aria-label="Confirmar ver la solución"
            >
              <p className="flex-1 text-sm">
                <strong>¿Seguro?</strong> Inténtalo primero un poco más: equivocarte ahora es la mejor forma de aprenderlo.
                {quedanPistas && ' Aún te quedan pistas.'}
              </p>
              <div className="flex gap-2">
                <button type="button" autoFocus onClick={() => setFase('oculta')} className={botonPrimario}>
                  Vale, lo intento
                </button>
                <button type="button" onClick={() => setFase('visible')} className={botonSecundario}>
                  Ver solución
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="acciones"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-wrap items-center gap-2"
            >
              {pistas.length > 0 && (
                <button
                  type="button"
                  onClick={() => setPistasVisibles((n) => Math.min(n + 1, pistas.length))}
                  disabled={!quedanPistas}
                  className={botonSecundario}
                >
                  <Lightbulb className="size-4 text-amber-500" aria-hidden />
                  {quedanPistas
                    ? `Ver pista ${pistasVisibles + 1} de ${pistas.length}`
                    : `Pistas: ${pistas.length}/${pistas.length}`}
                </button>
              )}
              {numSoluciones > 0 &&
                (fase === 'visible' ? (
                  <button type="button" onClick={() => setFase('oculta')} className={botonSecundario}>
                    <EyeOff className="size-4" aria-hidden />
                    Ocultar solución
                  </button>
                ) : (
                  <button type="button" onClick={() => setFase('confirmar')} className={botonSecundario}>
                    <Eye className="size-4" aria-hidden />
                    Ver solución
                  </button>
                ))}
              {tutor && (
                <button
                  type="button"
                  onClick={preguntarTutor}
                  className="ml-auto inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-fd-primary transition hover:bg-fd-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
                >
                  <Bot className="size-4" aria-hidden />
                  Pregúntale al tutor
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

/** Pista que se revela de una en una, en el orden en que aparecen. */
export function Pista({ children }: { children: ReactNode }) {
  const ej = use(EjercicioContext);
  const id = useId();
  const registrar = ej?.registrarPista;
  useEffect(() => registrar?.(), [registrar]);

  const indice = ej ? ej.indicePista(id) : 0;
  const visible = !ej || (indice >= 0 && indice < ej.pistasVisibles);

  return (
    <div data-pista={id} hidden={!visible}>
      <AnimatePresence initial={false}>
        {visible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="my-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm [&_p]:my-1">
              <p className="not-prose mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                <Lightbulb className="size-3.5" aria-hidden />
                Pista {indice + 1}
              </p>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Solución oculta tras el botón «Ver solución» del ejercicio. */
export function Solucion({ children }: { children: ReactNode }) {
  const ej = use(EjercicioContext);
  const registrar = ej?.registrarSolucion;
  useEffect(() => registrar?.(), [registrar]);
  const visible = !ej || ej.solucionVisible;

  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="my-3 rounded-xl border border-green-500/30 bg-green-500/5 px-4 py-3 [&>:last-child]:mb-0">
            <p className="not-prose mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-400">
              <PartyPopper className="size-3.5" aria-hidden />
              Solución
            </p>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
