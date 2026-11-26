'use client';

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { motion, MotionConfig, useReducedMotion } from 'motion/react';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { botonPrimario, botonSecundario, cabecera, etiqueta, tituloBloque } from './estilos';
import { AlturaSuave, TextoEnriquecido, useIsoLayoutEffect } from './utils';

export type TipoMensaje = 'llamada' | 'respuesta';

export interface MensajeMeta {
  de?: string;
  a?: string;
  titulo?: string;
  tipo?: TipoMensaje;
}

interface FlujoCtx {
  actual: number;
  total: number;
}

const FlujoContext = createContext<FlujoCtx | null>(null);

/**
 * Clases (literales, para que Tailwind las vea) que ponen los nodos en fila a
 * partir de un ancho del contenedor que depende de cuántos nodos hay. Por
 * debajo, en columna.
 */
const FILA = {
  sm: { lista: '@sm:flex-row @sm:items-stretch @sm:gap-6', nodo: '@sm:max-w-none @sm:flex-1 @sm:min-w-0' },
  md: { lista: '@md:flex-row @md:items-stretch @md:gap-6', nodo: '@md:max-w-none @md:flex-1 @md:min-w-0' },
  lg: { lista: '@lg:flex-row @lg:items-stretch @lg:gap-5', nodo: '@lg:max-w-none @lg:flex-1 @lg:min-w-0' },
  xl: { lista: '@xl:flex-row @xl:items-stretch @xl:gap-5', nodo: '@xl:max-w-none @xl:flex-1 @xl:min-w-0' },
  '2xl': { lista: '@2xl:flex-row @2xl:items-stretch @2xl:gap-4', nodo: '@2xl:max-w-none @2xl:flex-1 @2xl:min-w-0' },
  nunca: { lista: '', nodo: '' },
} as const;

function claseFila(n: number) {
  if (n <= 3) return FILA.sm;
  if (n === 4) return FILA.md;
  if (n === 5) return FILA.lg;
  if (n === 6) return FILA.xl;
  if (n === 7) return FILA['2xl'];
  return FILA.nunca;
}

interface Caja {
  l: number;
  t: number;
  r: number;
  b: number;
}

interface Segmento {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function segmento(cajas: Caja[], fila: boolean, i: number, j: number): Segmento | null {
  const a = cajas[i];
  const b = cajas[j];
  if (!a || !b || i === j) return null;
  const adelante = j > i;
  if (fila) {
    const y = (a.t + a.b) / 2;
    return { x1: adelante ? a.r : a.l, y1: y, x2: adelante ? b.l : b.r, y2: y };
  }
  const x = (a.l + a.r) / 2;
  return { x1: x, y1: adelante ? a.b : a.t, x2: x, y2: adelante ? b.t : b.b };
}

function punta({ x1, y1, x2, y2 }: Segmento) {
  const largo = Math.hypot(x2 - x1, y2 - y1) || 1;
  const ux = (x2 - x1) / largo;
  const uy = (y2 - y1) / largo;
  const bx = x2 - ux * 6;
  const by = y2 - uy * 6;
  return `${x2},${y2} ${bx - uy * 3.5},${by + ux * 3.5} ${bx + uy * 3.5},${by - ux * 3.5}`;
}

export interface FlujoClienteProps {
  nodos: string[];
  titulo?: string;
  intervalo: number;
  mensajes: MensajeMeta[];
  children: ReactNode;
}

export function FlujoCliente({ nodos, titulo, intervalo, mensajes, children }: FlujoClienteProps) {
  const reducir = useReducedMotion();
  const [actual, setActual] = useState(0);
  // Cada navegación incrementa el ciclo para repetir la animación del paso.
  const [ciclo, setCiclo] = useState(0);
  const [reproduciendo, setReproduciendo] = useState(false);
  const pista = useRef<HTMLDivElement>(null);
  const cajasRef = useRef<(HTMLLIElement | null)[]>([]);
  const [geo, setGeo] = useState<{ cajas: Caja[]; fila: boolean } | null>(null);
  const panelId = useId();
  const total = mensajes.length;
  const fila = claseFila(nodos.length);

  const indiceNodo = useCallback(
    (nombre?: string) => {
      const n = (nombre ?? '').trim().toLowerCase();
      return nodos.findIndex((x) => x.trim().toLowerCase() === n);
    },
    [nodos],
  );

  const msg = mensajes[actual];
  const iDe = indiceNodo(msg?.de);
  const iA = indiceNodo(msg?.a);

  // Aviso para el autor si un <Mensaje> usa un nodo que no existe (solo en desarrollo).
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    mensajes.forEach((m, i) => {
      if (indiceNodo(m.de) < 0 || indiceNodo(m.a) < 0)
        console.warn(`[Flujo] El mensaje ${i + 1} usa un nodo que no está en "nodos": ${m.de} → ${m.a}`);
    });
  }, [mensajes, indiceNodo]);

  // Medir la posición de los nodos (y volver a medir si cambia el ancho).
  useIsoLayoutEffect(() => {
    const cont = pista.current;
    if (!cont) return;
    const medir = () => {
      const base = cont.getBoundingClientRect();
      const cajas = nodos.map((_, i) => {
        const r = cajasRef.current[i]?.getBoundingClientRect();
        return r
          ? { l: r.left - base.left, t: r.top - base.top, r: r.right - base.left, b: r.bottom - base.top }
          : { l: 0, t: 0, r: 0, b: 0 };
      });
      const enFila = cajas.length < 2 || Math.abs(cajas[0]!.t - cajas[1]!.t) < 4;
      setGeo({ cajas, fila: enFila });
    };
    medir();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(medir);
    ro.observe(cont);
    return () => ro.disconnect();
  }, [nodos]);

  // Reproducción automática: avanza tras `intervalo` ms y se para al final.
  useEffect(() => {
    if (!reproduciendo) return;
    const t = window.setTimeout(() => {
      if (actual >= total - 1) setReproduciendo(false);
      else {
        setActual((a) => a + 1);
        setCiclo((c) => c + 1);
      }
    }, intervalo);
    return () => window.clearTimeout(t);
  }, [reproduciendo, actual, total, intervalo, ciclo]);

  const ir = (i: number) => {
    setReproduciendo(false);
    setActual(Math.max(0, Math.min(total - 1, i)));
    setCiclo((c) => c + 1);
  };

  const alternar = () => {
    if (reproduciendo) {
      setReproduciendo(false);
      return;
    }
    if (actual >= total - 1) setActual(0);
    setCiclo((c) => c + 1);
    setReproduciendo(true);
  };

  const teclas = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement;
    if (t.closest('input, textarea, select, [contenteditable="true"]')) return;
    const destino =
      e.key === 'ArrowRight' ? actual + 1 : e.key === 'ArrowLeft' ? actual - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? total - 1 : null;
    if (destino === null) return;
    e.preventDefault();
    ir(destino);
  };

  const seg = geo && iDe >= 0 && iA >= 0 ? segmento(geo.cajas, geo.fila, iDe, iA) : null;
  const animar = ciclo > 0 && !reducir;
  const respuesta = msg?.tipo === 'respuesta';
  const clave = `${actual}-${ciclo}`;
  const alFinal = actual >= total - 1;

  return (
    <MotionConfig reducedMotion="user">
      <section
        aria-label={titulo ? `Flujo: ${titulo}` : 'Flujo paso a paso'}
        onKeyDown={teclas}
        className="@container my-8 overflow-hidden rounded-lg border bg-fd-background text-fd-foreground"
      >
        <div className={cn('not-prose', cabecera)}>
          <span className={etiqueta}>Flujo</span>
          {titulo && <p className={cn(tituloBloque, 'min-w-0 flex-1')}>{titulo}</p>}
          {total > 0 && (
            <span className="ms-auto text-xs tabular-nums text-fd-muted-foreground">
              Paso {actual + 1} de {total}
            </span>
          )}
        </div>

        <p className="sr-only">Participantes, en orden: {nodos.join(', ')}.</p>

        {/* Diagrama (visual; la explicación de cada paso está debajo) */}
        <div ref={pista} className="not-prose relative px-4 py-6 sm:px-6" aria-hidden>
          {geo && (
            <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
              {/* Conectores fijos entre nodos vecinos */}
              <g className="text-fd-border">
                {nodos.slice(1).map((_, i) => {
                  const s = segmento(geo.cajas, geo.fila, i, i + 1);
                  return s ? <line key={i} {...s} stroke="currentColor" strokeWidth={1} /> : null;
                })}
              </g>
              {/* Mensaje activo */}
              {seg && (
                <g key={clave} className="text-fd-primary">
                  {respuesta ? (
                    <motion.line
                      {...seg}
                      stroke="currentColor"
                      strokeWidth={1.5}
                      strokeDasharray="4 3"
                      initial={animar ? { opacity: 0 } : false}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    />
                  ) : (
                    <motion.line
                      {...seg}
                      stroke="currentColor"
                      strokeWidth={1.5}
                      initial={animar ? { pathLength: 0 } : false}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.7, ease: 'easeInOut' }}
                    />
                  )}
                  <motion.polygon
                    points={punta(seg)}
                    fill="currentColor"
                    initial={animar ? { opacity: 0 } : false}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15, delay: animar ? 0.6 : 0 }}
                  />
                </g>
              )}
            </svg>
          )}

          <ol className={cn('relative z-10 flex flex-col items-center gap-5', fila.lista)}>
            {nodos.map((nodo, i) => {
              const implicado = i === iDe || i === iA;
              return (
                <li
                  key={i}
                  ref={(el) => {
                    cajasRef.current[i] = el;
                  }}
                  className={cn(
                    'relative flex w-full max-w-[15rem] items-center justify-center rounded-md border bg-fd-background px-2.5 py-2 text-center text-xs font-medium leading-snug break-words transition-colors duration-200 sm:text-[13px]',
                    fila.nodo,
                    implicado ? 'border-fd-primary text-fd-foreground' : 'text-fd-muted-foreground',
                  )}
                >
                  <TextoEnriquecido texto={nodo} />
                  {/* Mensaje de un nodo a sí mismo: un pulso sobre el nodo */}
                  {implicado && iDe === iA && (
                    <motion.span
                      key={clave}
                      className="pointer-events-none absolute -inset-1 rounded-lg border border-fd-primary"
                      initial={animar ? { opacity: 0, scale: 0.96 } : false}
                      animate={{ opacity: [0, 1, 0.35], scale: 1 }}
                      transition={{ duration: 0.8 }}
                    />
                  )}
                </li>
              );
            })}
          </ol>

          {/* Punto que viaja de un nodo a otro */}
          {seg && animar && (
            <motion.span
              key={clave}
              className="pointer-events-none absolute left-0 top-0 z-20 size-2 rounded-full bg-fd-primary"
              initial={{ x: seg.x1 - 4, y: seg.y1 - 4, opacity: 1 }}
              animate={{ x: seg.x2 - 4, y: seg.y2 - 4, opacity: [1, 1, 0] }}
              transition={{
                x: { duration: 0.7, ease: 'easeInOut' },
                y: { duration: 0.7, ease: 'easeInOut' },
                opacity: { duration: 0.95, times: [0, 0.75, 1] },
              }}
            />
          )}
        </div>

        {total > 0 && (
          <>
            <div id={panelId} aria-live="polite" className="border-t">
              <AlturaSuave className="px-4 py-4 sm:px-5">
                <FlujoContext value={{ actual, total }}>{children}</FlujoContext>
              </AlturaSuave>
            </div>

            <div className="not-prose flex flex-wrap items-center gap-2 border-t px-4 py-2.5 sm:px-5">
              <ol aria-label="Pasos" className="flex w-full min-w-0 flex-wrap gap-1.5 @md:w-auto @md:flex-1">
                {mensajes.map((m, i) => {
                  const sel = i === actual;
                  return (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() => ir(i)}
                        aria-current={sel ? 'step' : undefined}
                        aria-controls={panelId}
                        aria-label={`Paso ${i + 1}: ${m.de ?? '?'} a ${m.a ?? '?'}${m.titulo ? `, ${m.titulo}` : ''}`}
                        title={m.titulo}
                        className={cn(
                          'flex size-8 items-center justify-center rounded-md border text-xs tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring',
                          sel
                            ? 'border-fd-foreground bg-fd-foreground font-medium text-fd-background'
                            : 'bg-fd-background text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-foreground',
                        )}
                      >
                        {i + 1}
                      </button>
                    </li>
                  );
                })}
              </ol>
              <div className="ms-auto flex gap-2">
                <button
                  type="button"
                  onClick={() => ir(actual - 1)}
                  disabled={actual === 0}
                  aria-label="Paso anterior"
                  className={botonSecundario}
                >
                  <ChevronLeft className="size-4" aria-hidden />
                </button>
                <button type="button" onClick={alternar} className={cn(botonPrimario, 'min-w-[7.5rem]')}>
                  {reproduciendo ? (
                    <>
                      <Pause className="size-3.5" aria-hidden />
                      Pausa
                    </>
                  ) : alFinal && ciclo > 0 ? (
                    <>
                      <RotateCcw className="size-3.5" aria-hidden />
                      Otra vez
                    </>
                  ) : (
                    <>
                      <Play className="size-3.5" aria-hidden />
                      Reproducir
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => ir(actual + 1)}
                  disabled={alFinal}
                  aria-label="Paso siguiente"
                  className={botonSecundario}
                >
                  <ChevronRight className="size-4" aria-hidden />
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </MotionConfig>
  );
}

export interface MensajeProps {
  /** Nodo de origen (tal cual está en `nodos`; no distingue mayúsculas). */
  de: string;
  /** Nodo de destino. Si es el mismo que `de`, el nodo hace algo por su cuenta. */
  a: string;
  /** Título corto: "cargar()", "GET /tasks"… Admite `código`. */
  titulo?: string;
  /** "respuesta" dibuja la flecha discontinua (lo que vuelve). Por defecto "llamada". */
  tipo?: TipoMensaje;
  /** Lo inyecta <Flujo>; no lo escribas. */
  indice?: number;
  /** Explicación del paso. Admite Markdown. */
  children?: ReactNode;
}

function Cabecera({ de, a, tipo, prefijo }: { de: string; a: string; tipo?: TipoMensaje; prefijo?: string }) {
  return (
    <p className="not-prose flex flex-wrap items-center gap-x-1.5 text-xs text-fd-muted-foreground">
      {prefijo && <span>{prefijo} · </span>}
      <span>{de}</span>
      {de !== a && (
        <>
          <ArrowRight className="size-3" aria-hidden />
          <span className="sr-only"> a </span>
          <span>{a}</span>
        </>
      )}
      {tipo === 'respuesta' && <span>(respuesta)</span>}
    </p>
  );
}

export function Mensaje({ de, a, titulo, tipo = 'llamada', indice = -1, children }: MensajeProps) {
  const ctx = use(FlujoContext);

  if (!ctx) {
    return (
      <div className="my-4">
        <Cabecera de={de} a={a} tipo={tipo} />
        {titulo && (
          <p className="not-prose mt-0.5 text-sm font-semibold">
            <TextoEnriquecido texto={titulo} />
          </p>
        )}
        {children}
      </div>
    );
  }

  const activo = ctx.actual === indice;
  return (
    <motion.div
      hidden={!activo}
      initial={false}
      animate={activo ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <Cabecera de={de} a={a} tipo={tipo} prefijo={`Paso ${indice + 1} de ${ctx.total}`} />
      {titulo && (
        <p className="not-prose mt-0.5 text-[15px] font-semibold leading-snug text-fd-foreground">
          <TextoEnriquecido texto={titulo} />
        </p>
      )}
      <div className="mt-2 text-sm leading-relaxed [&>:first-child]:mt-0 [&>:last-child]:mb-0 [&_p]:my-2">{children}</div>
    </motion.div>
  );
}
