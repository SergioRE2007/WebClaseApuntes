'use client';

import { createContext, use, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { motion, MotionConfig, useReducedMotion } from 'motion/react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { cabecera, etiqueta, malTexto, okTexto, tituloBloque } from './estilos';
import { AlturaSuave } from './utils';

export type TipoLado = 'evitar' | 'bien' | 'neutro';

export interface LadoMeta {
  titulo?: string;
  tipo?: TipoLado;
}

export function tituloPorDefecto(tipo: TipoLado | undefined, indice: number) {
  if (tipo === 'evitar') return 'Así se hizo en clase';
  if (tipo === 'bien') return 'Mejor así';
  return `Opción ${indice + 1}`;
}

function IconoTipo({ tipo }: { tipo?: TipoLado }) {
  if (tipo === 'evitar') return <X className={cn('size-3.5 shrink-0', malTexto)} aria-hidden />;
  if (tipo === 'bien') return <Check className={cn('size-3.5 shrink-0', okTexto)} aria-hidden />;
  return null;
}

const textoTipo = (tipo?: TipoLado) => (tipo === 'evitar' ? malTexto : tipo === 'bien' ? okTexto : 'text-fd-muted-foreground');
const srTipo = (tipo?: TipoLado) => (tipo === 'evitar' ? ' (forma a evitar)' : tipo === 'bien' ? ' (forma recomendada)' : '');

interface CompararCtx {
  activo: number;
  columnas: boolean;
  direccion: number;
  interaccion: boolean;
  idBase: string;
}

const CompararContext = createContext<CompararCtx | null>(null);

export interface CompararClienteProps {
  titulo?: string;
  columnas: boolean;
  lados: LadoMeta[];
  children: ReactNode;
}

export function CompararCliente({ titulo, columnas, lados, children }: CompararClienteProps) {
  const [activo, setActivo] = useState(0);
  const [direccion, setDireccion] = useState(1);
  const [interaccion, setInteraccion] = useState(false);
  const idBase = useId();
  const pestanas = useRef<(HTMLButtonElement | null)[]>([]);
  const reducir = useReducedMotion();

  const elegir = (i: number, enfocar = false) => {
    if (i === activo) return;
    setDireccion(i > activo ? 1 : -1);
    setActivo(i);
    setInteraccion(true);
    if (enfocar) pestanas.current[i]?.focus();
  };

  const teclas = (e: KeyboardEvent) => {
    const n = lados.length;
    if (!n) return;
    let destino: number | null = null;
    if (e.key === 'ArrowRight') destino = (activo + 1) % n;
    else if (e.key === 'ArrowLeft') destino = (activo - 1 + n) % n;
    else if (e.key === 'Home') destino = 0;
    else if (e.key === 'End') destino = n - 1;
    if (destino === null) return;
    e.preventDefault();
    elegir(destino, true);
  };

  return (
    <MotionConfig reducedMotion="user">
      <section
        aria-label={titulo ?? 'Comparación'}
        className="@container my-8 overflow-hidden rounded-lg border bg-fd-background text-fd-foreground"
      >
        {titulo && (
          <div className={cn('not-prose', cabecera)}>
            <span className={etiqueta}>Comparación</span>
            <p className={cn(tituloBloque, 'min-w-0 flex-1')}>{titulo}</p>
          </div>
        )}

        <div
          role="tablist"
          aria-label="Versiones"
          onKeyDown={teclas}
          className={cn('not-prose flex gap-1 overflow-x-auto border-b p-1.5', columnas && '@xl:hidden')}
        >
          {lados.map((l, i) => {
            const sel = i === activo;
            return (
              <button
                key={i}
                ref={(el) => {
                  pestanas.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`${idBase}-tab-${i}`}
                aria-selected={sel}
                aria-controls={`${idBase}-panel-${i}`}
                tabIndex={sel ? 0 : -1}
                onClick={() => elegir(i)}
                className={cn(
                  'relative inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring sm:min-h-8',
                  sel ? 'font-medium text-fd-foreground' : 'text-fd-muted-foreground hover:text-fd-foreground',
                )}
              >
                {sel && (
                  <motion.span
                    layoutId={`${idBase}-indicador`}
                    aria-hidden
                    className="absolute inset-0 rounded-md border bg-fd-accent"
                    transition={{ duration: reducir ? 0 : 0.22, ease: 'easeOut' }}
                  />
                )}
                <span className="relative inline-flex items-center gap-1.5">
                  <IconoTipo tipo={l.tipo} />
                  {l.titulo ?? tituloPorDefecto(l.tipo, i)}
                  <span className="sr-only">{srTipo(l.tipo)}</span>
                </span>
              </button>
            );
          })}
        </div>

        <AlturaSuave>
          <div className={cn(columnas && '@xl:grid @xl:grid-cols-2 @xl:divide-x @xl:divide-fd-border')}>
            <CompararContext value={{ activo, columnas, direccion, interaccion, idBase }}>{children}</CompararContext>
          </div>
        </AlturaSuave>
      </section>
    </MotionConfig>
  );
}

export interface LadoProps {
  /** Título del lado. Por defecto según el tipo: "Así se hizo en clase", "Mejor así" u "Opción N". */
  titulo?: string;
  /** "evitar" (forma de clase que no conviene copiar), "bien" (la recomendada) o "neutro". */
  tipo?: TipoLado;
  /** Lo inyecta <Comparar>; no lo escribas. */
  indice?: number;
  /** Bloques de código Markdown y texto. */
  children?: ReactNode;
}

export function Lado({ titulo, tipo = 'neutro', indice = 0, children }: LadoProps) {
  const ctx = use(CompararContext);
  const t = titulo ?? tituloPorDefecto(tipo, indice);

  if (!ctx) {
    // Fuera de <Comparar>: un bloque con título, sin conmutador.
    return (
      <div className="my-6 rounded-lg border">
        <p className={cn('not-prose flex items-center gap-1.5 border-b px-4 py-2 text-xs font-medium', textoTipo(tipo))}>
          <IconoTipo tipo={tipo} />
          {t}
        </p>
        <div className="px-4 py-3 [&>:first-child]:mt-0 [&>:last-child]:mb-0">{children}</div>
      </div>
    );
  }

  const activo = ctx.activo === indice;
  const oculto = !activo && (ctx.columnas ? 'hidden @xl:block' : 'hidden');

  return (
    <div
      role="tabpanel"
      id={`${ctx.idBase}-panel-${indice}`}
      aria-labelledby={`${ctx.idBase}-tab-${indice}`}
      className={cn('min-w-0', oculto)}
    >
      {ctx.columnas && (
        <p
          className={cn(
            'not-prose hidden items-center gap-1.5 border-b px-4 py-2 text-xs font-medium @xl:flex',
            textoTipo(tipo),
          )}
        >
          <IconoTipo tipo={tipo} />
          {t}
          <span className="sr-only">{srTipo(tipo)}</span>
        </p>
      )}
      <motion.div
        key={activo ? 'activo' : 'inactivo'}
        initial={activo && ctx.interaccion ? { opacity: 0, x: 10 * ctx.direccion } : false}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="px-4 py-4 sm:px-5 [&>:first-child]:mt-0 [&>:last-child]:mb-0"
      >
        {children}
      </motion.div>
    </div>
  );
}
