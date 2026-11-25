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
import { ChevronLeft, ChevronRight, RotateCcw, Shuffle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { barajar, Contenido, TextoEnriquecido, useRegistroOrdenado, usePrefiereMenosMovimiento } from './utils';
import { bloque, botonSecundario, cabecera, etiqueta, tituloBloque } from './estilos';

type Marca = 'sabida' | 'repasar';

const kbd = 'rounded border bg-fd-muted px-1 py-px font-mono text-[0.7rem] text-fd-foreground';

const ETIQUETA_MARCA: Record<Marca, string> = { sabida: 'Me la sé', repasar: 'Por repasar' };

interface MazoCtx {
  activa: string | null;
  girada: boolean;
  /** Marca de la tarjeta activa, para mostrarla sobre la tarjeta. */
  marca: Marca | null;
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
  const marcaActiva = activa ? (marcas[activa] ?? null) : null;
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
    setAnuncio(`Repasando ${pendientes.length} ${pendientes.length === 1 ? 'tarjeta marcada' : 'tarjetas marcadas'}`);
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
    () => ({ activa, girada, marca: marcaActiva, listo: total > 0, registrar, girar, reducir }),
    [activa, girada, marcaActiva, total, registrar, girar, reducir],
  );

  const filtrado = orden !== null && orden.length < ids.length;

  const enlaceFiltro =
    'text-sm text-fd-muted-foreground underline-offset-4 hover:text-fd-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring rounded-sm';

  return (
    <section aria-labelledby={tituloId} aria-describedby={ayudaId} className={bloque}>
      <div className={cabecera}>
        <p id={tituloId} className={tituloBloque}>
          {titulo}
        </p>
        <p className={cn(etiqueta, 'tabular-nums')}>
          {total ? `${indice + 1} / ${total}` : 'Cargando…'}
          {filtrado ? ' · solo las marcadas' : ''}
        </p>
        <p className={cn(etiqueta, 'ms-auto tabular-nums')}>
          {sabidas} {sabidas === 1 ? 'sabida' : 'sabidas'} · {repasar} por repasar
        </p>
      </div>

      <div className="p-4 sm:p-5">
        {/* Zona de tarjetas: enfocable para usar el teclado */}
        <div
          ref={contenedor}
          data-registro-raiz=""
          tabIndex={0}
          onKeyDown={onKeyDown}
          role="group"
          aria-roledescription="mazo de tarjetas"
          aria-label={
            total
              ? `Tarjeta ${indice + 1} de ${total}. ${girada ? 'Mostrando respuesta' : 'Mostrando pregunta'}${marcaActiva ? `. ${ETIQUETA_MARCA[marcaActiva]}` : ''}`
              : 'Mazo de tarjetas'
          }
          className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2 focus-visible:ring-offset-fd-background"
        >
          <MazoContext value={ctx}>{children}</MazoContext>
          {total === 0 && <div className="h-44 rounded-md border bg-fd-muted/40" aria-hidden />}
        </div>

        <span className="sr-only" aria-live="polite">
          {anuncio}
        </span>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => ir(-1)}
              className={cn(botonSecundario, 'px-2')}
              aria-label="Tarjeta anterior"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => ir(1)}
              className={cn(botonSecundario, 'px-2')}
              aria-label="Tarjeta siguiente"
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
          <div className="order-last flex w-full gap-1.5 sm:order-none sm:w-auto">
            <button
              type="button"
              onClick={() => marcar('repasar')}
              aria-pressed={marcaActiva === 'repasar'}
              className={cn(
                botonSecundario,
                'flex-1 whitespace-nowrap sm:flex-none',
                marcaActiva === 'repasar' &&
                  'border-amber-600/30 bg-amber-500/[0.07] text-amber-800 dark:border-amber-400/30 dark:text-amber-300',
              )}
            >
              Repasar
            </button>
            <button
              type="button"
              onClick={() => marcar('sabida')}
              aria-pressed={marcaActiva === 'sabida'}
              className={cn(
                botonSecundario,
                'flex-1 whitespace-nowrap sm:flex-none',
                marcaActiva === 'sabida' &&
                  'border-green-600/30 bg-green-600/[0.06] text-green-800 dark:border-green-400/30 dark:text-green-300',
              )}
            >
              Me la sé
            </button>
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={mezclar}
              className={cn(botonSecundario, 'px-2')}
              aria-label="Barajar"
              title="Barajar"
            >
              <Shuffle className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={reiniciar}
              className={cn(botonSecundario, 'px-2')}
              aria-label="Reiniciar mazo"
              title="Reiniciar"
            >
              <RotateCcw className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          'flex-wrap items-center gap-x-4 gap-y-1 border-t px-4 py-2 sm:px-5',
          repasar > 0 || filtrado ? 'flex' : 'hidden [@media(hover:hover)]:flex',
        )}
      >
        <p id={ayudaId} className="hidden text-xs text-fd-muted-foreground [@media(hover:hover)]:block">
          <kbd className={kbd}>Espacio</kbd> girar · <kbd className={kbd}>←</kbd> <kbd className={kbd}>→</kbd> moverte ·{' '}
          <kbd className={kbd}>S</kbd> me la sé · <kbd className={kbd}>R</kbd> repasar
        </p>
        {repasar > 0 && !filtrado && (
          <button type="button" onClick={soloRepasar} className={cn(enlaceFiltro, 'sm:ms-auto')}>
            {repasar === 1 ? 'Repasar solo la marcada' : `Repasar solo las ${repasar} marcadas`}
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
            className={cn(enlaceFiltro, 'sm:ms-auto')}
          >
            Volver a todas las tarjetas
          </button>
        )}
      </div>
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
      <div className="my-3 rounded-md border p-4">
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
    <div data-tarjeta={id} hidden={!visible} className="relative [perspective:1200px]">
      {mazo.marca && (
        <span className="pointer-events-none absolute end-3 top-2.5 z-10 text-xs text-fd-muted-foreground">
          {ETIQUETA_MARCA[mazo.marca]}
        </span>
      )}
      <motion.div
        className="grid cursor-pointer [transform-style:preserve-3d]"
        initial={false}
        animate={{ rotateY: girada ? 180 : 0 }}
        transition={mazo.reducir ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' }}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('a, button')) return;
          mazo.girar();
        }}
      >
        {/* Frente */}
        <div
          aria-hidden={girada}
          inert={girada}
          className="col-start-1 row-start-1 flex min-h-44 flex-col items-center justify-center rounded-md border bg-fd-background p-6 text-center [backface-visibility:hidden]"
        >
          <span className="mb-2 text-xs font-medium text-fd-muted-foreground">Pregunta</span>
          <p className="text-base font-semibold leading-snug sm:text-lg">
            <TextoEnriquecido texto={frente} />
          </p>
          <span className="mt-4 text-xs text-fd-muted-foreground">Pulsa para ver la respuesta</span>
        </div>
        {/* Reverso */}
        <div
          aria-hidden={!girada}
          inert={!girada}
          className="col-start-1 row-start-1 flex min-h-44 flex-col items-center justify-center rounded-md border bg-fd-muted/40 p-6 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]"
        >
          {/* Recuerda la pregunta para no tener que volver a girar la tarjeta. */}
          <p className="mb-2 max-w-prose text-xs font-medium text-fd-muted-foreground">
            <span className="sr-only">Respuesta a: </span>
            <TextoEnriquecido texto={frente} />
          </p>
          <div className="max-w-prose text-sm leading-relaxed sm:text-base [&_code]:rounded [&_code]:border [&_code]:bg-fd-muted [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.9em] [&_p]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-left">
            <Contenido>{children}</Contenido>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
