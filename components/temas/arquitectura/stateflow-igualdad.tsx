'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Plus, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  bloque,
  botonPrimario,
  botonSecundario,
  cabecera,
  etiqueta,
  malCaja,
  malTexto,
  okCaja,
  okTexto,
  tituloBloque,
} from '@/components/interactive/estilos';

type Modo = 'misma' | 'copia';

interface Tarea {
  id: number;
  titulo: string;
}

const INICIALES: Tarea[] = [
  { id: 1, titulo: 'Dummy' },
  { id: 2, titulo: 'Dummy2' },
];

/** Tope de tareas para que la demo no crezca sin fin. */
const MAXIMO = 7;

const LINEA: Record<Modo, string> = {
  misma: '_taskFlow.value = _taskList',
  copia: '_taskFlow.value = _taskList.toList()',
};

/**
 * Simula el repositorio en memoria de la ToDoApp: una lista mutable dentro de
 * un MutableStateFlow. Enseña por qué asignar la misma lista no emite (StateFlow
 * compara con equals) y por qué una copia sí.
 */
export function StateFlowIgualdad({ titulo = '¿Emite el StateFlow?' }: { titulo?: string }) {
  const reducir = useReducedMotion();
  const [modo, setModo] = useState<Modo>('misma');
  const [interna, setInterna] = useState<Tarea[]>(INICIALES);
  const [pintada, setPintada] = useState<Tarea[]>(INICIALES);
  const [emisiones, setEmisiones] = useState(1);
  const [ultimo, setUltimo] = useState<null | boolean>(null);

  const reiniciar = () => {
    setInterna(INICIALES);
    setPintada(INICIALES);
    setEmisiones(1);
    setUltimo(null);
  };

  const cambiarModo = (m: Modo) => {
    setModo(m);
    reiniciar();
  };

  const lleno = interna.length >= MAXIMO;

  const crear = () => {
    if (lleno) return;
    const n = interna.length + 1;
    const lista = [...interna, { id: n, titulo: `Tarea ${n}` }];
    setInterna(lista);
    if (modo === 'copia') {
      setPintada(lista);
      setEmisiones((e) => e + 1);
      setUltimo(true);
    } else {
      setUltimo(false);
    }
  };

  const desfase = interna.length !== pintada.length;

  return (
    <section aria-label={titulo} className={bloque}>
      <div className={cabecera}>
        <span className={etiqueta}>Demo</span>
        <p className={cn(tituloBloque, 'min-w-0 flex-1')}>{titulo}</p>
      </div>

      <div className="space-y-4 px-4 py-4 sm:px-5">
        <div role="group" aria-label="Qué se asigna al StateFlow" className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={modo === 'misma'}
            onClick={() => cambiarModo('misma')}
            className={cn(botonSecundario, modo === 'misma' && 'border-fd-foreground bg-fd-accent')}
          >
            Así se hizo en clase
          </button>
          <button
            type="button"
            aria-pressed={modo === 'copia'}
            onClick={() => cambiarModo('copia')}
            className={cn(botonSecundario, modo === 'copia' && 'border-fd-foreground bg-fd-accent')}
          >
            Con una copia
          </button>
        </div>

        <pre className="overflow-x-auto rounded-md border bg-fd-muted/40 px-3 py-2 text-[13px] leading-relaxed">
          <code>
            <span className="text-fd-muted-foreground">{'if (_taskList.add(newTask)) {\n    nextId++\n    '}</span>
            <span className="font-semibold text-fd-foreground">{LINEA[modo]}</span>
            <span className="text-fd-muted-foreground">{'\n}'}</span>
          </code>
        </pre>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={crear}
            aria-disabled={lleno}
            className={cn(
              botonPrimario,
              'aria-disabled:cursor-not-allowed aria-disabled:bg-fd-muted aria-disabled:text-fd-muted-foreground',
            )}
          >
            <Plus className="size-4" aria-hidden />
            create(...)
          </button>
          <button type="button" onClick={reiniciar} className={botonSecundario}>
            <RotateCcw className="size-3.5" aria-hidden />
            Reiniciar
          </button>
          <span className="text-xs text-fd-muted-foreground tabular-nums">
            Emisiones del StateFlow: {emisiones}
          </span>
        </div>
        {lleno && (
          <p className="text-xs text-fd-muted-foreground">
            La demo llega hasta {MAXIMO} tareas. Pulsa Reiniciar para volver a empezar.
          </p>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <Panel titulo="Dentro del repositorio" subtitulo="_taskList (la lista mutable)" tareas={interna} reducir={!!reducir} />
          <Panel
            titulo="Lo que pinta la pantalla"
            subtitulo="último valor emitido"
            tareas={pintada}
            reducir={!!reducir}
            aviso={desfase}
          />
        </div>

        <div aria-live="polite" className="min-h-6">
          {ultimo === false && (
            <p className={cn('rounded-md border px-3 py-2 text-sm', malCaja)}>
              <span className={cn('font-medium', malTexto)}>No emite. </span>
              Al <code>MutableStateFlow</code> le llega el mismo objeto que ya tenía. Compara el valor nuevo con el
              anterior con <code>equals</code> y, como es la misma lista, considera que no ha cambiado. La tarea está en
              memoria, pero la pantalla no se vuelve a pintar: <code>_taskList</code> tiene {interna.length} tareas y la
              pantalla sigue pintando {pintada.length}.
            </p>
          )}
          {ultimo === true && (
            <p className={cn('rounded-md border px-3 py-2 text-sm', okCaja)}>
              <span className={cn('font-medium', okTexto)}>Emite. </span>
              <code>toList()</code> crea una lista nueva con una tarea más. Es distinta de la anterior, así que el
              StateFlow emite y Compose vuelve a pintar la lista, que ya tiene {pintada.length} tareas.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function Panel({
  titulo,
  subtitulo,
  tareas,
  reducir,
  aviso = false,
}: {
  titulo: string;
  subtitulo: string;
  tareas: Tarea[];
  reducir: boolean;
  aviso?: boolean;
}) {
  return (
    <div className={cn('rounded-md border', aviso && 'border-red-600/40 dark:border-red-400/40')}>
      <div className="border-b px-3 py-2">
        <p className="text-sm font-medium">{titulo}</p>
        <p className="font-mono text-xs text-fd-muted-foreground">{subtitulo}</p>
      </div>
      <ul className="space-y-1.5 p-3" aria-label={titulo}>
        <AnimatePresence initial={false}>
          {tareas.map((t) => (
            <motion.li
              key={t.id}
              layout={!reducir}
              initial={reducir ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducir ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: reducir ? 0 : 0.25, ease: 'easeOut' }}
              className="flex items-center justify-between rounded border bg-fd-card px-2.5 py-1.5 text-sm"
            >
              <span>{t.titulo}</span>
              <span className="font-mono text-xs text-fd-muted-foreground">id={t.id}</span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
