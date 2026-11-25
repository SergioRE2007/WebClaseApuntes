'use client';

import {
  createContext,
  Fragment,
  use,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronRight, CircleHelp, RotateCcw, Trophy, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Celebracion } from './celebracion';
import { Contenido, TextoEnriquecido, useRegistroOrdenado } from './utils';

/* -------------------------------------------------------------------------- */
/*                                   Contextos                                */
/* -------------------------------------------------------------------------- */

interface QuizCtx {
  activa: string | null;
  listo: boolean;
  registrar: () => () => void;
  responder: (id: string, correcta: boolean) => void;
  numero: (id: string) => number;
  total: number;
}

const QuizContext = createContext<QuizCtx | null>(null);

interface PreguntaCtx {
  respondida: boolean;
  correcta: boolean | null;
  multiple: boolean;
  seleccionadas: ReadonlySet<string>;
  registrarOpcion: (id: string, correcta: boolean) => () => void;
  registrarOrden: () => () => void;
  letra: (id: string) => string;
  elegir: (id: string) => void;
}

const PreguntaContext = createContext<PreguntaCtx | null>(null);

/* -------------------------------------------------------------------------- */
/*                                     Quiz                                   */
/* -------------------------------------------------------------------------- */

export interface QuizProps {
  /** Título del test. Por defecto «Comprueba lo que sabes». */
  titulo?: string;
  /** Texto corto bajo el título. */
  descripcion?: string;
  children: ReactNode;
}

function mensajeResultado(aciertos: number, total: number) {
  const ratio = total ? aciertos / total : 0;
  if (ratio === 1) return { titulo: '¡Pleno! Lo dominas', texto: 'Has acertado todas. Puedes pasar al siguiente tema con tranquilidad.' };
  if (ratio >= 0.7) return { titulo: '¡Muy bien!', texto: 'Vas por buen camino. Repasa las que has fallado y vuelve a intentarlo.' };
  if (ratio >= 0.4) return { titulo: 'Casi, casi', texto: 'Hay conceptos que conviene repasar. Lee las explicaciones y prueba otra vez.' };
  return { titulo: 'Toca repasar', texto: 'No pasa nada: vuelve a leer el tema con calma y repite el test.' };
}

export function Quiz({ titulo = 'Comprueba lo que sabes', descripcion, children }: QuizProps) {
  const contenedor = useRef<HTMLDivElement>(null);
  const { ids, registrar } = useRegistroOrdenado(contenedor, 'data-quiz-pregunta');
  const [indice, setIndice] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, boolean>>({});
  const [intento, setIntento] = useState(0);
  const [terminado, setTerminado] = useState(false);
  const tituloId = useId();
  const cabecera = useRef<HTMLDivElement>(null);

  const activa = terminado ? null : (ids[indice] ?? null);
  const total = ids.length;
  const aciertos = ids.filter((id) => respuestas[id]).length;
  const respondidaActual = activa ? activa in respuestas : false;
  const esUltima = indice >= total - 1;

  const responder = useCallback((id: string, correcta: boolean) => {
    setRespuestas((r) => (id in r ? r : { ...r, [id]: correcta }));
  }, []);

  const numero = useCallback((id: string) => ids.indexOf(id) + 1, [ids]);

  const ctx = useMemo<QuizCtx>(
    () => ({ activa, listo: total > 0, registrar, responder, numero, total }),
    [activa, total, registrar, responder, numero],
  );

  const enfocarCabecera = () => requestAnimationFrame(() => cabecera.current?.focus({ preventScroll: true }));

  const siguiente = () => {
    if (esUltima) setTerminado(true);
    else setIndice((i) => i + 1);
    enfocarCabecera();
  };

  const reintentar = () => {
    setRespuestas({});
    setIndice(0);
    setTerminado(false);
    setIntento((n) => n + 1);
    enfocarCabecera();
  };

  const resultado = mensajeResultado(aciertos, total);
  const perfecto = terminado && total > 0 && aciertos === total;

  return (
    <section
      aria-labelledby={tituloId}
      className="not-prose relative my-8 overflow-hidden rounded-2xl border bg-fd-card text-fd-card-foreground shadow-sm"
    >
      {/* Cabecera */}
      <div
        ref={cabecera}
        tabIndex={-1}
        className="flex flex-wrap items-center gap-3 border-b bg-fd-muted/50 px-4 py-3 outline-none sm:px-5"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-fd-primary text-fd-primary-foreground">
          <CircleHelp className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p id={tituloId} className="font-semibold leading-tight">
            {titulo}
          </p>
          {descripcion && <p className="text-sm text-fd-muted-foreground">{descripcion}</p>}
        </div>
        {total > 0 && (
          <span className="rounded-full border bg-fd-background px-2.5 py-1 text-xs font-medium tabular-nums text-fd-muted-foreground">
            {terminado ? `${aciertos}/${total} aciertos` : `Pregunta ${Math.min(indice + 1, total)} de ${total}`}
          </span>
        )}
      </div>

      {/* Barra de progreso */}
      {total > 0 && (
        <div
          className="h-1 w-full bg-fd-muted"
          role="progressbar"
          aria-label="Progreso del test"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={terminado ? total : indice + (respondidaActual ? 1 : 0)}
        >
          <motion.div
            className="h-full bg-fd-primary"
            initial={false}
            animate={{ width: `${((terminado ? total : indice + (respondidaActual ? 1 : 0)) / total) * 100}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 30 }}
          />
        </div>
      )}

      <div ref={contenedor} data-registro-raiz="" className="px-4 py-5 sm:px-5">
        <QuizContext value={ctx}>
          <Fragment key={intento}>{children}</Fragment>
        </QuizContext>

        {total === 0 && (
          <div className="space-y-3" aria-hidden>
            <div className="h-5 w-2/3 animate-pulse rounded bg-fd-muted" />
            <div className="h-11 animate-pulse rounded-xl bg-fd-muted" />
            <div className="h-11 animate-pulse rounded-xl bg-fd-muted" />
          </div>
        )}

        <AnimatePresence>
          {terminado && (
            <motion.div
              key="resultado"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="relative flex flex-col items-center gap-3 py-6 text-center"
              role="status"
            >
              {perfecto && <Celebracion />}
              <motion.span
                initial={{ scale: 0.4, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 14 }}
                className={cn(
                  'flex size-16 items-center justify-center rounded-full',
                  perfecto
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                    : 'bg-fd-primary/10 text-fd-primary',
                )}
              >
                <Trophy className="size-8" aria-hidden />
              </motion.span>
              <p className="text-3xl font-bold tabular-nums">
                {aciertos}
                <span className="text-fd-muted-foreground">/{total}</span>
              </p>
              <p className="text-lg font-semibold">{resultado.titulo}</p>
              <p className="max-w-md text-sm text-fd-muted-foreground">{resultado.texto}</p>
              <div className="mt-2 flex flex-wrap justify-center gap-1.5" aria-label="Resumen por pregunta">
                {ids.map((id, i) => (
                  <span
                    key={id}
                    title={`Pregunta ${i + 1}: ${respuestas[id] ? 'acierto' : 'fallo'}`}
                    className={cn(
                      'flex size-7 items-center justify-center rounded-full text-xs font-semibold',
                      respuestas[id]
                        ? 'bg-green-500/15 text-green-700 dark:text-green-400'
                        : 'bg-red-500/15 text-red-700 dark:text-red-400',
                    )}
                  >
                    {i + 1}
                  </span>
                ))}
              </div>
              <button type="button" onClick={reintentar} className={cn(botonSecundario, 'mt-3')}>
                <RotateCcw className="size-4" aria-hidden />
                Reintentar
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!terminado && total > 0 && (
        <div className="flex items-center justify-between gap-3 border-t px-4 py-3 sm:px-5">
          <p className="text-xs text-fd-muted-foreground" aria-live="polite">
            {respondidaActual ? 'Lee la explicación y continúa.' : 'Elige una respuesta.'}
          </p>
          <button type="button" onClick={siguiente} disabled={!respondidaActual} className={botonPrimario}>
            {esUltima ? 'Ver resultado' : 'Siguiente'}
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Pregunta                                 */
/* -------------------------------------------------------------------------- */

export const botonPrimario =
  'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-fd-primary px-3.5 py-2 text-sm font-medium text-fd-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2 focus-visible:ring-offset-fd-background disabled:pointer-events-none disabled:opacity-40';
export const botonSecundario =
  'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border bg-fd-secondary px-3.5 py-2 text-sm font-medium text-fd-secondary-foreground transition hover:bg-fd-accent hover:text-fd-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2 focus-visible:ring-offset-fd-background disabled:pointer-events-none disabled:opacity-40';

export interface PreguntaProps {
  /** Enunciado. Admite `código` entre comillas invertidas. */
  enunciado: string;
  /**
   * - "opciones" (por defecto): hijos <Opcion>. Si hay más de una correcta, es de respuesta múltiple.
   * - "vf": verdadero/falso, usa `respuesta={true}` o `respuesta={false}`.
   * - "texto": el alumno escribe la respuesta (p. ej. la salida de un programa).
   */
  tipo?: 'opciones' | 'vf' | 'texto';
  /** Para tipo "vf": boolean. Para tipo "texto": string o lista de respuestas válidas. */
  respuesta?: boolean | string | string[];
  /** Explicación que aparece tras responder (también puedes usar <Explicacion>). */
  explicacion?: string;
  /** Tipo "texto": distinguir mayúsculas y espacios (por defecto no). */
  exacta?: boolean;
  /** Contenido adicional (bloques de código…), las <Opcion> y/o <Explicacion>. */
  children?: ReactNode;
}

function normalizar(s: string, exacta: boolean) {
  const t = s.trim();
  return exacta ? t : t.replace(/\s+/g, ' ').toLowerCase();
}

export function Pregunta({ enunciado, tipo = 'opciones', respuesta, explicacion, exacta = false, children }: PreguntaProps) {
  const quiz = use(QuizContext);
  const id = useId();
  const enunciadoId = useId();
  const cuerpo = useRef<HTMLDivElement>(null);
  const { ids: ordenOpciones, registrar: registrarOrden } = useRegistroOrdenado(cuerpo, 'data-quiz-opcion');
  const [correctas, setCorrectas] = useState<Record<string, boolean>>({});
  const [seleccionadas, setSeleccionadas] = useState<Set<string>>(new Set());
  const [respondida, setRespondida] = useState(false);
  const [acierto, setAcierto] = useState<boolean | null>(null);
  const [texto, setTexto] = useState('');

  useEffect(() => quiz?.registrar(), [quiz?.registrar]);

  const visible = !quiz || (quiz.listo && quiz.activa === id);
  const numCorrectas = Object.values(correctas).filter(Boolean).length;
  const multiple = tipo === 'opciones' && numCorrectas > 1;

  const finalizar = useCallback(
    (ok: boolean) => {
      setRespondida(true);
      setAcierto(ok);
      quiz?.responder(id, ok);
    },
    [quiz, id],
  );

  const registrarOpcion = useCallback((opId: string, esCorrecta: boolean) => {
    setCorrectas((c) => ({ ...c, [opId]: esCorrecta }));
    return () =>
      setCorrectas((c) => {
        const { [opId]: _, ...resto } = c;
        return resto;
      });
  }, []);

  const elegir = useCallback(
    (opId: string) => {
      if (respondida) return;
      if (multiple) {
        setSeleccionadas((s) => {
          const n = new Set(s);
          if (n.has(opId)) n.delete(opId);
          else n.add(opId);
          return n;
        });
      } else {
        setSeleccionadas(new Set([opId]));
        finalizar(correctas[opId] === true);
      }
    },
    [respondida, multiple, correctas, finalizar],
  );

  const comprobarMultiple = () => {
    const ok =
      Object.entries(correctas).every(([opId, c]) => c === seleccionadas.has(opId)) && seleccionadas.size > 0;
    finalizar(ok);
  };

  const comprobarTexto = () => {
    if (!texto.trim()) return;
    const validas = (Array.isArray(respuesta) ? respuesta : [String(respuesta ?? '')]).map((r) => normalizar(r, exacta));
    finalizar(validas.includes(normalizar(texto, exacta)));
  };

  const letra = useCallback(
    (opId: string) => String.fromCharCode(65 + Math.max(0, ordenOpciones.indexOf(opId))),
    [ordenOpciones],
  );

  const ctx = useMemo<PreguntaCtx>(
    () => ({
      respondida,
      correcta: acierto,
      multiple,
      seleccionadas,
      registrarOpcion,
      registrarOrden,
      letra,
      elegir,
    }),
    [respondida, acierto, multiple, seleccionadas, registrarOpcion, registrarOrden, letra, elegir],
  );

  const solucionTexto = Array.isArray(respuesta) ? respuesta[0] : typeof respuesta === 'string' ? respuesta : '';
  const numero = quiz?.numero(id);

  return (
    <div data-quiz-pregunta={id} hidden={!visible} role="group" aria-labelledby={enunciadoId}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={visible ? 'v' : 'h'} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
          <p id={enunciadoId} className="mb-1 text-base font-semibold leading-snug sm:text-lg">
            {numero ? <span className="sr-only">Pregunta {numero}. </span> : null}
            <TextoEnriquecido texto={enunciado} />
          </p>
          <p className="mb-4 text-xs text-fd-muted-foreground">
            {tipo === 'vf'
              ? 'Verdadero o falso'
              : tipo === 'texto'
                ? 'Escribe la respuesta'
                : multiple
                  ? 'Varias respuestas correctas: marca todas y comprueba'
                  : 'Una sola respuesta correcta'}
          </p>

          <PreguntaContext value={ctx}>
            <div ref={cuerpo} data-registro-raiz="" className="space-y-2 [&_pre]:my-3">
              {tipo === 'vf' ? (
                <>
                  <Opcion correcta={respuesta === true}>Verdadero</Opcion>
                  <Opcion correcta={respuesta === false}>Falso</Opcion>
                  {children}
                </>
              ) : (
                children
              )}
            </div>

            {tipo === 'texto' && (
              <form
                className="mt-3 flex flex-col gap-2 sm:flex-row"
                onSubmit={(e) => {
                  e.preventDefault();
                  comprobarTexto();
                }}
              >
                <label className="sr-only" htmlFor={`${id}-texto`}>
                  Tu respuesta
                </label>
                <input
                  id={`${id}-texto`}
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  disabled={respondida}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="Tu respuesta…"
                  aria-invalid={respondida && acierto === false ? true : undefined}
                  className={cn(
                    'min-h-10 flex-1 rounded-lg border bg-fd-background px-3 font-mono text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-fd-ring',
                    respondida && acierto && 'border-green-500 bg-green-500/10',
                    respondida && acierto === false && 'border-red-500 bg-red-500/10',
                  )}
                />
                {!respondida && (
                  <button type="submit" className={botonPrimario} disabled={!texto.trim()}>
                    Comprobar
                  </button>
                )}
              </form>
            )}

            {multiple && !respondida && (
              <button type="button" onClick={comprobarMultiple} disabled={seleccionadas.size === 0} className={cn(botonPrimario, 'mt-3')}>
                Comprobar
              </button>
            )}

            <div aria-live="polite">
              <AnimatePresence>
                {respondida && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="overflow-hidden"
                  >
                    <div
                      className={cn(
                        'mt-4 rounded-xl border p-3.5 text-sm',
                        acierto
                          ? 'border-green-500/40 bg-green-500/10'
                          : 'border-red-500/40 bg-red-500/10',
                      )}
                    >
                      <p
                        className={cn(
                          'flex items-center gap-1.5 font-semibold',
                          acierto ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400',
                        )}
                      >
                        {acierto ? <Check className="size-4" aria-hidden /> : <X className="size-4" aria-hidden />}
                        {acierto ? '¡Correcto!' : 'No exactamente'}
                      </p>
                      {tipo === 'texto' && !acierto && solucionTexto && (
                        <p className="mt-1">
                          Respuesta correcta:{' '}
                          <code className="rounded border bg-fd-background px-1.5 py-0.5 font-mono">{solucionTexto}</code>
                        </p>
                      )}
                      {explicacion && (
                        <p className="mt-1.5 text-fd-foreground/90">
                          <TextoEnriquecido texto={explicacion} />
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </PreguntaContext>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Opción                                   */
/* -------------------------------------------------------------------------- */

export interface OpcionProps {
  /** Marca la opción como correcta. Puede haber varias (respuesta múltiple). */
  correcta?: boolean;
  children: ReactNode;
}

export function Opcion({ correcta = false, children }: OpcionProps) {
  const pregunta = use(PreguntaContext);
  const id = useId();

  const registrarOpcion = pregunta?.registrarOpcion;
  const registrarOrden = pregunta?.registrarOrden;
  useEffect(() => registrarOpcion?.(id, correcta), [registrarOpcion, id, correcta]);
  useEffect(() => registrarOrden?.(), [registrarOrden]);

  if (!pregunta) {
    // Fuera de una <Pregunta>: se muestra como un elemento de lista simple.
    return <div className="rounded-lg border px-3 py-2">{children}</div>;
  }

  const { respondida, multiple, seleccionadas, elegir, letra } = pregunta;
  const elegida = seleccionadas.has(id);
  const estado = !respondida ? (elegida ? 'elegida' : 'normal') : correcta ? 'correcta' : elegida ? 'fallada' : 'apagada';

  return (
    <button
      type="button"
      data-quiz-opcion={id}
      onClick={() => elegir(id)}
      aria-pressed={elegida}
      aria-disabled={respondida || undefined}
      className={cn(
        'group flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring [&_p]:m-0',
        estado === 'normal' && 'bg-fd-background hover:border-fd-primary/50 hover:bg-fd-accent/60',
        estado === 'elegida' && 'border-fd-primary bg-fd-primary/10',
        estado === 'correcta' && 'border-green-500/60 bg-green-500/10',
        estado === 'fallada' && 'border-red-500/60 bg-red-500/10',
        estado === 'apagada' && 'opacity-60',
        respondida && 'cursor-default',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'mt-px flex size-6 shrink-0 items-center justify-center border text-xs font-semibold transition-colors',
          multiple ? 'rounded-md' : 'rounded-full',
          estado === 'elegida' && 'border-fd-primary bg-fd-primary text-fd-primary-foreground',
          estado === 'correcta' && 'border-green-600 bg-green-600 text-white',
          estado === 'fallada' && 'border-red-600 bg-red-600 text-white',
          (estado === 'normal' || estado === 'apagada') && 'text-fd-muted-foreground',
        )}
      >
        {estado === 'correcta' ? (
          <Check className="size-3.5" />
        ) : estado === 'fallada' ? (
          <X className="size-3.5" />
        ) : (
          letra(id)
        )}
      </span>
      <span className="min-w-0 flex-1 leading-relaxed [&_code]:rounded [&_code]:border [&_code]:bg-fd-muted [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.9em]">
        <Contenido>{children}</Contenido>
      </span>
      {respondida && (
        <span className="sr-only">
          {correcta ? '(respuesta correcta)' : elegida ? '(tu respuesta, incorrecta)' : ''}
        </span>
      )}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Explicación                                */
/* -------------------------------------------------------------------------- */

/** Explicación con formato (markdown, código) que aparece al responder. */
export function Explicacion({ children }: { children: ReactNode }) {
  const pregunta = use(PreguntaContext);
  if (pregunta && !pregunta.respondida) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 rounded-xl border border-dashed bg-fd-muted/40 p-3.5 text-sm leading-relaxed [&_p]:my-1.5"
    >
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-fd-muted-foreground">Explicación</p>
      {children}
    </motion.div>
  );
}
