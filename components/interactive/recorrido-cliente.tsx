'use client';

import {
  createContext,
  use,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { motion, MotionConfig, useReducedMotion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { botonPrimario, botonSecundario, cabecera, etiqueta, tituloBloque } from './estilos';
import { parsearLineas } from './hijos';
import { AlturaSuave, TextoEnriquecido } from './utils';

/** Un trozo de línea ya coloreado por Shiki: texto + variables --shiki-light / --shiki-dark. */
export interface Token {
  t: string;
  s?: Record<string, string>;
}

export interface PasoMeta {
  titulo?: string;
  lineas?: string | number;
}

/** Alto de cada línea (leading-6) y relleno superior del código (py-3), en px. */
const ALTO_LINEA = 24;
const RELLENO = 12;

interface RecorridoCtx {
  actual: number;
  total: number;
  panelId: string;
}

const RecorridoContext = createContext<RecorridoCtx | null>(null);

export interface RecorridoClienteProps {
  titulo?: string;
  lenguaje: string;
  lineas: Token[][];
  pasos: PasoMeta[];
  children: ReactNode;
}

export function RecorridoCliente({ titulo, lenguaje, lineas, pasos, children }: RecorridoClienteProps) {
  const [actual, setActual] = useState(0);
  const [interaccion, setInteraccion] = useState(false);
  const reducir = useReducedMotion();
  const codigoRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const total = pasos.length;
  const rangos = parsearLineas(pasos[actual]?.lineas, lineas.length);
  const enRango = (n: number) => rangos.some(([a, b]) => n >= a && n <= b);

  const ir = (i: number) => {
    const destino = Math.max(0, Math.min(total - 1, i));
    setActual(destino);
    setInteraccion(true);
  };

  // Al cambiar de paso, si las líneas quedan fuera de la vista del código, se desplaza (solo el código, no la página).
  useEffect(() => {
    if (!interaccion) return;
    const el = codigoRef.current;
    const primero = rangos[0];
    const ultimo = rangos.at(-1);
    if (!el || !primero || !ultimo) return;
    const top = RELLENO + (primero[0] - 1) * ALTO_LINEA;
    const bottom = RELLENO + ultimo[1] * ALTO_LINEA;
    const visibleTop = el.scrollTop;
    const visibleBottom = el.scrollTop + el.clientHeight;
    if (top >= visibleTop && bottom <= visibleBottom) return;
    el.scrollTo({ top: Math.max(0, top - ALTO_LINEA * 2), behavior: reducir ? 'auto' : 'smooth' });
    // Solo depende del paso: `rangos` se recalcula en cada render.
  }, [actual, interaccion]);

  const teclas = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement;
    if (t.closest('input, textarea, select, [contenteditable="true"]')) return;
    const destino =
      e.key === 'ArrowRight' ? actual + 1 : e.key === 'ArrowLeft' ? actual - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? total - 1 : null;
    if (destino === null) return;
    e.preventDefault();
    ir(destino);
  };

  const anchoNumeros = String(lineas.length).length;

  return (
    <MotionConfig reducedMotion="user">
      <section
        aria-label={titulo ? `Recorrido: ${titulo}` : 'Recorrido de código'}
        onKeyDown={teclas}
        className="@container my-8 overflow-hidden rounded-lg border bg-fd-background text-fd-foreground"
      >
        <div className={cn('not-prose', cabecera)}>
          <span className={etiqueta}>Recorrido</span>
          {titulo && <p className={cn(tituloBloque, 'min-w-0 flex-1 truncate font-mono text-[13px]')}>{titulo}</p>}
          {total > 0 && (
            <span className="ms-auto text-xs tabular-nums text-fd-muted-foreground">
              Paso {actual + 1} de {total}
            </span>
          )}
        </div>

        {/* Código */}
        <div
          ref={codigoRef}
          role="region"
          data-codigo=""
          aria-label={`Código${lenguaje && lenguaje !== 'text' ? ` (${lenguaje})` : ''}`}
          tabIndex={0}
          className="not-prose max-h-[28rem] overflow-auto bg-fd-muted/30 font-mono text-[13px] leading-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fd-ring"
        >
          <div className="relative w-max min-w-full py-3">
            {rangos.map(([a, b], i) => (
              <motion.div
                key={i}
                aria-hidden
                className="pointer-events-none absolute inset-x-0 border-l-2 border-fd-primary bg-fd-primary/[0.08]"
                initial={false}
                animate={{ top: RELLENO + (a - 1) * ALTO_LINEA, height: (b - a + 1) * ALTO_LINEA, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 380, damping: 36, mass: 0.8 }}
              />
            ))}
            <pre className="relative m-0 bg-transparent p-0">
              <code className="block">
                {lineas.map((tokens, i) => {
                  const n = i + 1;
                  const atenuada = rangos.length > 0 && !enRango(n);
                  return (
                    <span
                      key={i}
                      data-linea={n}
                      className={cn(
                        'flex h-6 transition-opacity duration-200',
                        atenuada ? 'opacity-40' : 'opacity-100',
                      )}
                    >
                      <span
                        aria-hidden
                        className="shrink-0 select-none pe-4 ps-3 text-right tabular-nums text-fd-muted-foreground/70"
                        style={{ width: `${anchoNumeros + 3.5}ch` }}
                      >
                        {n}
                      </span>
                      <span className="whitespace-pre pe-4">
                        {tokens.length === 0
                          ? ' '
                          : tokens.map((tk, j) =>
                              tk.s ? (
                                <span
                                  key={j}
                                  style={tk.s as CSSProperties}
                                  className="text-[color:var(--shiki-light)] dark:text-[color:var(--shiki-dark)]"
                                >
                                  {tk.t}
                                </span>
                              ) : (
                                <span key={j}>{tk.t}</span>
                              ),
                            )}
                      </span>
                    </span>
                  );
                })}
              </code>
            </pre>
          </div>
        </div>

        {total > 0 && (
          <div className="grid border-t @xl:grid-cols-[13rem_minmax(0,1fr)]">
            {/* Lista de pasos: números en móvil, títulos en pantallas anchas */}
            <ol
              aria-label="Pasos"
              className="not-prose flex flex-wrap gap-1.5 border-b px-4 py-3 @xl:flex-col @xl:flex-nowrap @xl:gap-0.5 @xl:border-b-0 @xl:border-e @xl:p-2"
            >
              {pasos.map((p, i) => {
                const sel = i === actual;
                return (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => ir(i)}
                      aria-current={sel ? 'step' : undefined}
                      aria-controls={panelId}
                      title={p.titulo}
                      className={cn(
                        'flex size-8 items-center justify-center gap-2 rounded-md border text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring',
                        '@xl:size-auto @xl:min-h-8 @xl:w-full @xl:justify-start @xl:border-transparent @xl:px-2 @xl:py-1.5 @xl:text-left',
                        sel
                          ? 'border-fd-foreground bg-fd-foreground font-medium text-fd-background @xl:bg-fd-accent @xl:text-fd-foreground'
                          : 'bg-fd-background text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-foreground',
                      )}
                    >
                      <span className="text-xs tabular-nums @xl:w-4 @xl:shrink-0 @xl:text-fd-muted-foreground">
                        {i + 1}
                      </span>
                      <span className="sr-only @xl:not-sr-only @xl:min-w-0 @xl:truncate">
                        {p.titulo ? <TextoEnriquecido texto={p.titulo} /> : `Paso ${i + 1}`}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <div id={panelId} aria-live="polite" className="min-w-0">
              <AlturaSuave className="px-4 py-4 sm:px-5">
                <RecorridoContext value={{ actual, total, panelId }}>{children}</RecorridoContext>
              </AlturaSuave>
            </div>
          </div>
        )}

        {total > 0 && (
          <div className="not-prose flex items-center gap-2 border-t px-4 py-2.5 sm:px-5">
            <p className="hidden flex-1 text-xs text-fd-muted-foreground sm:block">Usa ← y → para moverte por los pasos.</p>
            <div className="ms-auto flex gap-2">
              <button type="button" onClick={() => ir(actual - 1)} disabled={actual === 0} className={botonSecundario}>
                <ChevronLeft className="size-3.5" aria-hidden />
                Anterior
              </button>
              <button
                type="button"
                onClick={() => ir(actual + 1)}
                disabled={actual >= total - 1}
                className={botonPrimario}
              >
                Siguiente
                <ChevronRight className="size-3.5" aria-hidden />
              </button>
            </div>
          </div>
        )}
      </section>
    </MotionConfig>
  );
}

export interface PasoProps {
  /** Líneas que se iluminan: "3", "3-5" o "3-5, 8". Numeradas desde 1. Sin lineas no se ilumina nada. */
  lineas?: string | number;
  /** Título corto del paso (sale en la lista de pasos). Admite `código`. */
  titulo?: string;
  /** Lo inyecta <Recorrido>; no lo escribas. */
  indice?: number;
  /** Explicación del paso. Admite Markdown. */
  children?: ReactNode;
}

export function Paso({ lineas, titulo, indice = -1, children }: PasoProps) {
  const ctx = use(RecorridoContext);

  if (!ctx) {
    return (
      <div className="my-4">
        {titulo && (
          <p className="not-prose text-sm font-semibold">
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
      <p className="not-prose text-xs text-fd-muted-foreground">
        Paso {indice + 1} de {ctx.total}
        {lineas !== undefined && lineas !== '' && (
          <>
            {' · '}
            {/[,\-–]/.test(String(lineas)) ? 'líneas' : 'línea'} {String(lineas)}
          </>
        )}
      </p>
      {titulo && (
        <p className="not-prose mt-0.5 text-[15px] font-semibold leading-snug text-fd-foreground">
          <TextoEnriquecido texto={titulo} />
        </p>
      )}
      <div className="mt-2 text-sm leading-relaxed [&>:first-child]:mt-0 [&>:last-child]:mb-0 [&_p]:my-2">{children}</div>
    </motion.div>
  );
}
