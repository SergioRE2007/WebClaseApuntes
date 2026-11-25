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
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { motion } from 'motion/react';
import { Check, ChevronLeft, ChevronRight, Layers, RefreshCw, RotateCcw, Shuffle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { barajar, Contenido, TextoEnriquecido, useRegistroOrdenado, usePrefiereMenosMovimiento } from './utils';
import { botonSecundario } from './quiz';

type Marca = 'sabida' | 'repasar';

const kbd = 'rounded border bg-fd-muted px-1.5 py-0.5 font-mono text-[0.7rem] text-fd-foreground';

interface MazoCtx {
  activa: string | null;
  girada: boolean;
  listo: boolean;
  registrar: () => () => void;
  girar: () => void;
  reducir: boolean;
}

const MazoContext = createContext<MazoCtx | null>(null);

export interface FlashcardsProps {
  /** Título del mazo. */
  titulo?: string;
  /** Hijos <Tarjeta>. */
  children: ReactNode;
}

export function Flashcards({ titulo = 'Tarjetas de repaso', children }: FlashcardsProps) {
  const contenedor = useRef<HTMLDivElement>(null);
  const { ids, registrar } = useRegistroOrdenado(contenedor, 'data-tarjeta');
  const [orden, setOrden] = useState<string[] | null>(null);
  const [pos, setPos] = useState(0);
  const [girada, setGirada] = useState(false);
  const [marcas, setMarcas] = useState<Record<string, Marca>>({});
  const [anuncio, setAnuncio] = useState('');
  const reducir = usePrefiereMenosMovimiento();
  const tituloId = useId();
  const ayudaId = useId();

  // Orden efectivo: el barajado/filtrado si existe y sigue siendo válido; si no, el del documento.
  const lista = useMemo(() => {
    if (!orden) return ids;
    const validos = orden.filter((id) => ids.includes(id));
    return validos.length ? validos : ids;
  }, [orden, ids]);

  const total = lista.length;
  const indice = Math.min(pos, Math.max(0, total - 1));
  const activa = lista[indice] ?? null;
  const sabidas = ids.filter((id) => marcas[id] === 'sabida').length;
  const repasar = ids.filter((id) => marcas[id] === 'repasar').length;

  const girar = useCallback(() => setGirada((g) => !g), []);

  const ir = useCallback(
    (delta: number) => {
      if (!total) return;
      setGirada(false);
      setPos((p) => (Math.min(p, total - 1) + delta + total) % total);
    },
    [total],
  );

  const marcar = (m: Marca) => {
    if (!activa) return;
    setMarcas((prev) => ({ ...prev, [activa]: m }));
    setAnuncio(m === 'sabida' ? 'Marcada como sabida' : 'Marcada para repasar');
    if (indice < total - 1) ir(1);
    else setGirada(false);
  };

  const mezclar = () => {
    setOrden(barajar(lista));
    setPos(0);
    setGirada(false);
    setAnuncio('Tarjetas barajadas');
  };

  const soloRepasar = () => {
    const pendientes = ids.filter((id) => marcas[id] === 'repasar');
    if (!pendientes.length) return;
    setOrden(pendientes);
    setPos(0);
    setGirada(false);
    setAnuncio(`Repasando ${pendientes.length} tarjetas marcadas`);
  };

  const reiniciar = () => {
    setOrden(null);
    setMarcas({});
    setPos(0);
    setGirada(false);
    setAnuncio('Mazo reiniciado');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLElement && e.target.closest('input, textarea, select')) return;
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    switch (e.key) {
      case ' ':
      case 'Enter':
        if (e.target !== e.currentTarget && e.target instanceof HTMLElement && e.target.closest('a, button')) return;
        e.preventDefault();
        girar();
        break;
      case 'ArrowRight':
        e.preventDefault();
        ir(1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        ir(-1);
        break;
      case 's':
      case 'S':
        e.preventDefault();
        marcar('sabida');
        break;
      case 'r':
      case 'R':
        e.preventDefault();
        marcar('repasar');
        break;
    }
  };

  const ctx = useMemo<MazoCtx>(
    () => ({ activa, girada, listo: total > 0, registrar, girar, reducir }),
    [activa, girada, total, registrar, girar, reducir],
  );

  const filtrado = orden !== null && orden.length < ids.length;

  return (
    <section
      aria-labelledby={tituloId}
      aria-describedby={ayudaId}
      className="not-prose my-8 rounded-2xl border bg-fd-card p-4 text-fd-card-foreground shadow-sm sm:p-5"
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-fd-primary text-fd-primary-foreground">
          <Layers className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p id={tituloId} className="font-semibold leading-tight">
            {titulo}
          </p>
          <p className="text-xs text-fd-muted-foreground tabular-nums">
            {total ? `Tarjeta ${indice + 1} de ${total}` : 'Cargando…'}
            {filtrado ? ' · solo las marcadas' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium tabular-nums">
          <span className="rounded-full bg-green-500/15 px-2 py-1 text-green-700 dark:text-green-400" title="Me las sé">
            <Check className="mr-0.5 inline size-3.5" aria-hidden />
            {sabidas}
            <span className="sr-only"> sabidas</span>
          </span>
          <span className="rounded-full bg-amber-500/15 px-2 py-1 text-amber-700 dark:text-amber-400" title="Para repasar">
            <RefreshCw className="mr-0.5 inline size-3.5" aria-hidden />
            {repasar}
            <span className="sr-only"> para repasar</span>
          </span>
        </div>
      </div>

      {/* Zona de tarjetas: enfocable para usar el teclado */}
      <div
        ref={contenedor}
        data-registro-raiz=""
        tabIndex={0}
        onKeyDown={onKeyDown}
        role="group"
        aria-roledescription="mazo de tarjetas"
        aria-label={`Tarjeta ${indice + 1} de ${total}. ${girada ? 'Mostrando respuesta' : 'Mostrando pregunta'}`}
        className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2 focus-visible:ring-offset-fd-card"
      >
        <MazoContext value={ctx}>{children}</MazoContext>
        {total === 0 && <div className="h-48 animate-pulse rounded-xl bg-fd-muted" aria-hidden />}
      </div>

      <p id={ayudaId} className="mt-2 hidden text-center text-xs text-fd-muted-foreground sm:block">
        Teclado: <kbd className={kbd}>Espacio</kbd> girar · <kbd className={kbd}>←</kbd> <kbd className={kbd}>→</kbd>{' '}
        moverte · <kbd className={kbd}>S</kbd> me la sé · <kbd className={kbd}>R</kbd> repasar
      </p>
      <span className="sr-only" aria-live="polite">
        {anuncio}
      </span>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <button type="button" onClick={() => ir(-1)} className={cn(botonSecundario, 'px-2.5')} aria-label="Tarjeta anterior">
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <button type="button" onClick={() => ir(1)} className={cn(botonSecundario, 'px-2.5')} aria-label="Tarjeta siguiente">
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
        <div className="flex flex-1 justify-center gap-2 sm:flex-none">
          <button
            type="button"
            onClick={() => marcar('repasar')}
            className={cn(
              botonSecundario,
              'flex-1 border-amber-500/40 sm:flex-none',
              activa && marcas[activa] === 'repasar' && 'bg-amber-500/15',
            )}
          >
            <RefreshCw className="size-4 text-amber-600 dark:text-amber-400" aria-hidden />
            Repasar
          </button>
          <button
            type="button"
            onClick={() => marcar('sabida')}
            className={cn(
              botonSecundario,
              'flex-1 border-green-500/40 sm:flex-none',
              activa && marcas[activa] === 'sabida' && 'bg-green-500/15',
            )}
          >
            <Check className="size-4 text-green-600 dark:text-green-400" aria-hidden />
            Me la sé
          </button>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={mezclar} className={cn(botonSecundario, 'px-2.5')} aria-label="Barajar" title="Barajar">
            <Shuffle className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={reiniciar}
            className={cn(botonSecundario, 'px-2.5')}
            aria-label="Reiniciar mazo"
            title="Reiniciar"
          >
            <RotateCcw className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      {repasar > 0 && !filtrado && (
        <button
          type="button"
          onClick={soloRepasar}
          className="mt-3 w-full rounded-lg border border-dashed px-3 py-2 text-sm text-fd-muted-foreground transition hover:bg-fd-accent hover:text-fd-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
        >
          Repasar solo las {repasar} marcadas
        </button>
      )}
      {filtrado && (
        <button
          type="button"
          onClick={() => {
            setOrden(null);
            setPos(0);
            setGirada(false);
          }}
          className="mt-3 w-full rounded-lg border border-dashed px-3 py-2 text-sm text-fd-muted-foreground transition hover:bg-fd-accent hover:text-fd-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
        >
          Volver a todas las tarjetas
        </button>
      )}
    </section>
  );
}

export interface TarjetaProps {
  /** Cara delantera (pregunta o concepto). Admite `código`. */
  frente: string;
  /** Cara trasera: la respuesta (admite markdown). */
  children: ReactNode;
}

export function Tarjeta({ frente, children }: TarjetaProps) {
  const mazo = use(MazoContext);
  const id = useId();

  const registrar = mazo?.registrar;
  useEffect(() => registrar?.(), [registrar]);

  if (!mazo) {
    return (
      <div className="my-3 rounded-xl border p-4">
        <p className="font-semibold">
          <TextoEnriquecido texto={frente} />
        </p>
        <div className="mt-2 text-sm text-fd-muted-foreground">{children}</div>
      </div>
    );
  }

  const visible = mazo.listo && mazo.activa === id;
  const girada = visible && mazo.girada;

  return (
    <div data-tarjeta={id} hidden={!visible} className="[perspective:1200px]">
      <motion.div
        className="grid cursor-pointer [transform-style:preserve-3d]"
        initial={false}
        animate={{ rotateY: girada ? 180 : 0 }}
        transition={mazo.reducir ? { duration: 0 } : { type: 'spring', stiffness: 180, damping: 22 }}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('a, button')) return;
          mazo.girar();
        }}
      >
        {/* Frente */}
        <div
          aria-hidden={girada}
          className="col-start-1 row-start-1 flex min-h-48 flex-col items-center justify-center rounded-xl border bg-gradient-to-br from-fd-background to-fd-muted/60 p-6 text-center [backface-visibility:hidden]"
        >
          <span className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground">
            Pregunta
          </span>
          <p className="text-lg font-semibold leading-snug sm:text-xl">
            <TextoEnriquecido texto={frente} />
          </p>
          <span className="mt-4 text-xs text-fd-muted-foreground">Toca o pulsa espacio para girar</span>
        </div>
        {/* Reverso */}
        <div
          aria-hidden={!girada}
          className="col-start-1 row-start-1 flex min-h-48 flex-col items-center justify-center rounded-xl border border-fd-primary/40 bg-fd-primary/5 p-6 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]"
        >
          <span className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-fd-primary">Respuesta</span>
          <div className="max-w-prose text-sm leading-relaxed sm:text-base [&_code]:rounded [&_code]:border [&_code]:bg-fd-muted [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.9em] [&_p]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-left">
            <Contenido>{children}</Contenido>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
