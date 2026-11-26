'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Play, RotateCcw, TriangleExclamationPoint } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  avisoCaja,
  avisoTexto,
  bloque,
  botonPrimario,
  botonSecundario,
  cabecera,
  etiqueta,
  malCaja,
  malTexto,
  tituloBloque,
} from '@/components/interactive/estilos';

type Estado = 'Initial' | 'Loading' | 'Success' | 'Error';

const TAREAS = [
  { id: 1, titulo: 'Dummy', descripcion: 'Sigue siendo mentira', completada: false },
  { id: 2, titulo: 'Dummy2', descripcion: 'Sigue siendo mentira 2', completada: true },
];

/** Líneas del when de clase (23/10) y a qué estado corresponde cada una. */
const WHEN: { texto: string; estado?: Estado }[] = [
  { texto: 'when (state) {' },
  { texto: '    is TaskListScreenState.Success -> { ... isLoading = false, tasks = tasks }', estado: 'Success' },
  { texto: '    is TaskListScreenState.Error -> TODO()', estado: 'Error' },
  { texto: '    TaskListScreenState.Loading -> { ... isLoading = true }', estado: 'Loading' },
  { texto: '    TaskListScreenState.Initial -> { viewModel.load(); ... }', estado: 'Initial' },
  { texto: '}' },
];

const ETIQUETA: Record<Estado, string> = {
  Initial: 'Initial',
  Loading: 'Loading',
  Success: 'Success(tasks)',
  Error: 'Error(message)',
};

/**
 * La pantalla de lista de la ToDoApp como máquina de estados: load() publica
 * Loading y luego Success o Error, y la pantalla pinta una cosa u otra según la
 * rama del when.
 */
export function EstadosPantalla({ retardo = 1600 }: { retardo?: number }) {
  const reducir = useReducedMotion();
  const [estado, setEstado] = useState<Estado>('Loading');
  const [historial, setHistorial] = useState<Estado[]>(['Loading']);
  const [errorHecho, setErrorHecho] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  const publicar = (e: Estado) => {
    setEstado(e);
    setHistorial((h) => [...h, e].slice(-6));
  };

  const load = (falla: boolean) => {
    if (temporizador.current) clearTimeout(temporizador.current);
    publicar('Loading');
    temporizador.current = setTimeout(() => publicar(falla ? 'Error' : 'Success'), retardo);
  };

  const reiniciar = () => {
    if (temporizador.current) clearTimeout(temporizador.current);
    setEstado('Loading');
    setHistorial(['Loading']);
    setErrorHecho(false);
    temporizador.current = setTimeout(() => publicar('Success'), retardo);
  };

  useEffect(() => {
    // init { load() }: al crearse el ViewModel ya se está cargando
    temporizador.current = setTimeout(() => publicar('Success'), retardo);
    return () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    };
  }, [retardo]);

  return (
    <section aria-label="Estados de la pantalla de lista" className={bloque}>
      <div className={cabecera}>
        <span className={etiqueta}>Demo</span>
        <p className={cn(tituloBloque, 'min-w-0 flex-1')}>TaskListScreenState paso a paso</p>
      </div>

      <div className="space-y-4 px-4 py-4 sm:px-5">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => load(false)} className={botonPrimario}>
            <Play className="size-3.5" aria-hidden />
            load() que va bien
          </button>
          <button type="button" onClick={() => load(true)} className={botonSecundario}>
            <TriangleExclamationPoint className="size-3.5" aria-hidden />
            load() que falla
          </button>
          <button type="button" onClick={reiniciar} className={botonSecundario}>
            <RotateCcw className="size-3.5" aria-hidden />
            Reiniciar
          </button>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-medium text-fd-muted-foreground">Valores que ha emitido state</p>
          <ol className="flex flex-wrap items-center gap-1.5" aria-label="Historial de estados">
            {historial.map((e, i) => (
              <li key={`${i}-${e}`} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-fd-muted-foreground" aria-hidden>→</span>}
                <span
                  className={cn(
                    'rounded border px-1.5 py-0.5 font-mono text-xs',
                    i === historial.length - 1 ? 'border-fd-foreground text-fd-foreground' : 'text-fd-muted-foreground',
                  )}
                >
                  {ETIQUETA[e]}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_15rem]">
          <div className="min-w-0">
            <p className="mb-1.5 text-xs font-medium text-fd-muted-foreground">Rama del when que se ejecuta</p>
            <pre className="overflow-x-auto rounded-md border bg-fd-muted/40 py-2 text-[12.5px] leading-relaxed">
              <code className="block min-w-max">
                {WHEN.map((l, i) => {
                  const activa = l.estado === estado;
                  return (
                    <span
                      key={i}
                      className={cn(
                        'block border-l-2 px-3 transition-colors motion-reduce:transition-none',
                        activa ? 'border-fd-primary bg-fd-primary/10 text-fd-foreground' : 'border-transparent',
                        !activa && l.estado && 'text-fd-muted-foreground',
                      )}
                    >
                      {l.texto}
                      {activa && <span className="sr-only"> (rama que se ejecuta)</span>}
                    </span>
                  );
                })}
              </code>
            </pre>
          </div>

          <Movil estado={estado} errorHecho={errorHecho} reducir={!!reducir} onReintentar={() => load(false)} />
        </div>

        <div aria-live="polite" className="space-y-2 text-sm">
          {estado === 'Loading' && (
            <p className="text-fd-muted-foreground">
              El ViewModel acaba de publicar <code>Loading</code> y está esperando a <code>readAll()</code>. En clase el
              repositorio tardaba 5 segundos a propósito con <code>delay(5_000L)</code>.
            </p>
          )}
          {estado === 'Success' && (
            <p className="text-fd-muted-foreground">
              <code>Success</code> es una <code>class</code> con datos, por eso la rama lleva <code>is</code> y se saca la
              lista con <code>(state as TaskListScreenState.Success).tasks</code>.
            </p>
          )}
          {estado === 'Error' && (
            <p className={cn('rounded-md border px-3 py-2', malCaja)}>
              <span className={cn('font-medium', malTexto)}>Con el código de clase la app se cierra. </span>
              La rama <code>Error</code> es <code>TODO()</code>, que lanza <code>NotImplementedError</code> en cuanto
              se ejecuta.
            </p>
          )}
        </div>

        {estado === 'Error' && (
          <label className="flex items-center gap-2 text-sm text-fd-muted-foreground">
            <input
              type="checkbox"
              checked={errorHecho}
              onChange={(e) => setErrorHecho(e.target.checked)}
              className="size-4 accent-current"
            />
            Ver una rama de error hecha (no se dio en clase)
          </label>
        )}
      </div>
    </section>
  );
}

function Movil({
  estado,
  errorHecho,
  reducir,
  onReintentar,
}: {
  estado: Estado;
  errorHecho: boolean;
  reducir: boolean;
  onReintentar: () => void;
}) {
  const vista = estado === 'Error' ? (errorHecho ? 'error-hecho' : 'error-clase') : estado;
  return (
    <div role="group" className="mx-auto w-full max-w-60 rounded-2xl border p-2" aria-label="Pantalla simulada">
      <div className="relative h-72 overflow-hidden rounded-xl border bg-fd-card">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={vista}
            initial={reducir ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducir ? undefined : { opacity: 0 }}
            transition={{ duration: reducir ? 0 : 0.18 }}
            className="absolute inset-0 flex flex-col p-3"
          >
            {(vista === 'Loading' || vista === 'Initial') && (
              <div className="flex flex-1 flex-col items-center pt-6">
                <span
                  className="size-8 animate-spin rounded-full border-[3px] border-fd-muted border-t-fd-primary motion-reduce:animate-none"
                  aria-label="Cargando"
                  role="img"
                />
                <p className="mt-3 text-xs text-fd-muted-foreground">CircularProgressIndicator()</p>
              </div>
            )}
            {vista === 'Success' && (
              <ul className="space-y-2">
                {TAREAS.map((t) => (
                  <li key={t.id} className="rounded-md border bg-fd-background p-2">
                    <p className="text-sm font-medium">{t.titulo}</p>
                    <p className="text-xs text-fd-muted-foreground">{t.descripcion}</p>
                    <div className="mt-1 flex items-center justify-between text-xs">
                      <span>
                        Completada
                        <span className="sr-only">: {t.completada ? 'sí' : 'no'}</span>
                      </span>
                      <span
                        aria-hidden
                        className={cn(
                          'flex h-4 w-7 items-center rounded-full border px-0.5',
                          t.completada ? 'justify-end bg-fd-primary' : 'justify-start bg-fd-muted',
                        )}
                      >
                        <span className="size-2.5 rounded-full bg-fd-background" />
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {vista === 'error-clase' && (
              <div className={cn('mt-6 rounded-md border p-3 text-xs', malCaja)}>
                <p className={cn('font-medium', malTexto)}>ToDoApp se ha detenido</p>
                <p className="mt-1 break-words font-mono text-[11px] text-fd-muted-foreground">
                  kotlin.NotImplementedError: An operation is not implemented.
                </p>
              </div>
            )}
            {vista === 'error-hecho' && (
              <div className={cn('mt-6 rounded-md border p-3 text-xs', avisoCaja)}>
                <p className={cn('font-medium', avisoTexto)}>No dado en clase</p>
                <p className="mt-1">No se han podido cargar las tareas.</p>
                <button type="button" onClick={onReintentar} className={cn(botonSecundario, 'mt-2 min-h-8 text-xs')}>
                  Reintentar
                </button>
              </div>
            )}
            <span
              className="absolute bottom-3 right-3 flex size-10 items-center justify-center rounded-xl bg-fd-primary text-lg leading-none text-fd-primary-foreground"
              aria-hidden
            >
              +
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
