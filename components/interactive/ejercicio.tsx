'use client';

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Eye, EyeOff, Lightbulb, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useRegistroOrdenado } from './utils';
import {
  avisoCaja,
  avisoTexto,
  botonPrimario,
  botonSecundario,
  cabecera,
  etiqueta,
  okCaja,
  okTexto,
  tituloBloque,
} from './estilos';

type Dificultad = 'facil' | 'media' | 'dificil';

const DIFICULTADES: Record<Dificultad, { etiqueta: string }> = {
  facil: { etiqueta: 'Fácil' },
  media: { etiqueta: 'Media' },
  dificil: { etiqueta: 'Difícil' },
};

interface EjercicioCtx {
  pistasVisibles: number;
  indicePista: (id: string) => number;
  registrarPista: () => () => void;
  solucionVisible: boolean;
  registrarSolucion: () => () => void;
  solucionId: string;
  /** Si es true, la solución toma el foco al aparecer (tras confirmar). */
  enfocarSolucion: RefObject<boolean>;
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
  const solucionId = useId();
  const enfocarSolucion = useRef(false);
  // Al volver de la confirmación, el foco regresa al botón «Ver solución».
  const enfocarTrigger = useRef(false);
  const triggerRef = useCallback((el: HTMLButtonElement | null) => {
    if (el && enfocarTrigger.current) {
      enfocarTrigger.current = false;
      el.focus();
    }
  }, []);
  const cancelarConfirmacion = () => {
    enfocarTrigger.current = true;
    setFase('oculta');
  };
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
      solucionId,
      enfocarSolucion,
    }),
    [pistasVisibles, indicePista, registrarPista, fase, registrarSolucion, solucionId],
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
      className="my-8 overflow-hidden rounded-lg border bg-fd-background text-fd-foreground"
    >
      <div className={cn('not-prose', cabecera)}>
        <span className={etiqueta}>Ejercicio</span>
        <p id={tituloId} className={cn(tituloBloque, 'min-w-0 flex-1')}>
          {titulo}
        </p>
        <span className={etiqueta}>
          <span className="sr-only">Dificultad: </span>
          {dif.etiqueta}
        </span>
      </div>

      <div
        ref={contenedor}
        data-registro-raiz=""
        className="px-4 py-4 sm:px-5 [&>:first-child]:mt-0 [&>:last-child]:mb-0"
      >
        <EjercicioContext value={ctx}>{children}</EjercicioContext>
      </div>

      <div className="not-prose border-t px-4 py-3 sm:px-5">
        <AnimatePresence mode="wait" initial={false}>
          {fase === 'confirmar' ? (
            <motion.div
              key="confirmar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-3 sm:flex-row sm:items-center"
              role="alertdialog"
              aria-label="Confirmar ver la solución"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation();
                  cancelarConfirmacion();
                }
              }}
            >
              <p className="flex-1 text-sm">
                <strong className="font-medium">¿Ver ya la solución?</strong> Intentarlo un poco más ayuda a fijarlo.
                {quedanPistas && ' Aún te quedan pistas.'}
              </p>
              <div className="flex gap-2">
                <button type="button" autoFocus onClick={cancelarConfirmacion} className={botonPrimario}>
                  Vale, lo intento
                </button>
                <button
                  type="button"
                  onClick={() => {
                    enfocarSolucion.current = true;
                    setFase('visible');
                  }}
                  className={botonSecundario}
                >
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
              transition={{ duration: 0.15 }}
              className="flex flex-wrap items-center gap-2"
            >
              {pistas.length > 0 && (
                <button
                  type="button"
                  onClick={() => setPistasVisibles((n) => Math.min(n + 1, pistas.length))}
                  disabled={!quedanPistas}
                  aria-controls={pistas[Math.min(pistasVisibles, pistas.length - 1)]}
                  aria-expanded={pistasVisibles > 0}
                  className={botonSecundario}
                >
                  <Lightbulb className="size-4 text-fd-muted-foreground" aria-hidden />
                  {quedanPistas
                    ? `Ver pista ${pistasVisibles + 1} de ${pistas.length}`
                    : `Pistas: ${pistas.length}/${pistas.length}`}
                </button>
              )}
              {numSoluciones > 0 &&
                (fase === 'visible' ? (
                  <button
                    type="button"
                    onClick={() => setFase('oculta')}
                    aria-expanded
                    aria-controls={solucionId}
                    className={botonSecundario}
                  >
                    <EyeOff className="size-4" aria-hidden />
                    Ocultar solución
                  </button>
                ) : (
                  <button
                    ref={triggerRef}
                    type="button"
                    onClick={() => setFase('confirmar')}
                    aria-expanded={false}
                    aria-controls={solucionId}
                    className={botonSecundario}
                  >
                    <Eye className="size-4" aria-hidden />
                    Ver solución
                  </button>
                ))}
              {tutor && (
                <button
                  type="button"
                  onClick={preguntarTutor}
                  className="ml-auto inline-flex min-h-10 items-center sm:min-h-8 gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-fd-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
                >
                  <MessageCircle className="size-4" aria-hidden />
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
    <div data-pista={id} id={id} hidden={!visible}>
      <AnimatePresence initial={false}>
        {visible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className={cn('my-3 rounded-md border px-4 py-3 text-sm [&_p]:my-1', avisoCaja)}>
              <p className={cn('not-prose mb-1 text-xs font-medium', avisoTexto)}>Pista {indice + 1}</p>
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
  const enfocar = ej?.enfocarSolucion;
  const refSolucion = useCallback(
    (el: HTMLDivElement | null) => {
      if (el && enfocar?.current) {
        enfocar.current = false;
        el.focus();
      }
    },
    [enfocar],
  );

  return (
    <div id={ej?.solucionId}>
      <AnimatePresence initial={false}>
        {visible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div
              ref={refSolucion}
              tabIndex={-1}
              aria-label="Solución"
              role="region"
              className={cn('my-3 rounded-md border px-4 py-3 outline-none [&>:last-child]:mb-0', okCaja)}
            >
              <p className={cn('not-prose mb-2 text-xs font-medium', okTexto)}>Solución</p>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
