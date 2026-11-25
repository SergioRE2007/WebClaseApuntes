'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { bloque, botonPrimario, botonSecundario, cabecera, etiqueta, tituloBloque } from '@/components/interactive/estilos';

type Modo = 'todoapp' | 'grafos';
type Pantalla = 'TaskList' | 'TaskCreate' | 'TaskDetail' | 'Settings';

interface Entrada {
  clave: number;
  pantalla: Pantalla;
  id?: number;
  grafo?: string;
}

interface Accion {
  texto: string;
  codigo: string;
  aplicar: (pila: Entrada[], nueva: (e: Omit<Entrada, 'clave'>) => Entrada) => Entrada[];
}

function nombreRuta(modo: Modo, e: Entrada) {
  const prefijo = modo === 'todoapp' ? 'Route' : 'Routes';
  return e.pantalla === 'TaskDetail' ? `${prefijo}.TaskDetail(id = ${e.id})` : `${prefijo}.${e.pantalla}`;
}

function acciones(modo: Modo, actual: Entrada): Accion[] {
  if (modo === 'todoapp') {
    if (actual.pantalla === 'TaskList') {
      return [
        {
          texto: 'Botón + (toCreate)',
          codigo: 'controller.navigate(Route.TaskCreate)',
          aplicar: (p, n) => [...p, n({ pantalla: 'TaskCreate' })],
        },
        ...[1, 2].map((id) => ({
          texto: `Tarjeta Dummy${id === 1 ? '' : '2'} (toDetail(${id}))`,
          codigo: `controller.navigate(Route.TaskDetail(id = ${id}))`,
          aplicar: (p: Entrada[], n: (e: Omit<Entrada, 'clave'>) => Entrada) => [...p, n({ pantalla: 'TaskDetail', id })],
        })),
      ];
    }
    return [];
  }
  if (actual.pantalla === 'TaskList') {
    return [
      {
        texto: 'Botón + (toTaskCreate)',
        codigo: 'navController.navigate(Routes.TaskCreate)',
        aplicar: (p, n) => [...p, n({ pantalla: 'TaskCreate', grafo: 'TaskFeature' })],
      },
      {
        texto: 'Engranaje (onSettings)',
        codigo: 'navController.navigate(Routes.SettingsFeature)',
        aplicar: (p, n) => [...p, n({ pantalla: 'Settings', grafo: 'SettingsFeature' })],
      },
    ];
  }
  if (actual.pantalla === 'TaskCreate') {
    return [
      {
        texto: 'Volver (onBack)',
        codigo: 'navController.popBackStack()',
        aplicar: (p) => p.slice(0, -1),
      },
    ];
  }
  return [];
}

const DESCRIPCION: Record<Pantalla, string> = {
  TaskList: 'Lista de tareas',
  TaskCreate: 'Crear tarea',
  TaskDetail: 'Detalle',
  Settings: 'Ajustes',
};

/**
 * La pila de navegación (back stack) de la ToDoApp: cada callback de la
 * pantalla llama a navigate() o a popBackStack() en el NavHost y se ve cómo
 * crece o se vacía la pila.
 */
export function PilaNavegacion() {
  const reducir = useReducedMotion();
  const contador = useRef(1);
  const [modo, setModo] = useState<Modo>('todoapp');
  const inicio = (m: Modo): Entrada[] => [{ clave: 0, pantalla: 'TaskList', grafo: m === 'grafos' ? 'TaskFeature' : undefined }];
  const [pila, setPila] = useState<Entrada[]>(inicio('todoapp'));
  const [ultimo, setUltimo] = useState<string>(
    'NavHost(navController = controller, startDestination = Route.TaskList)',
  );
  const [cerrada, setCerrada] = useState(false);

  const nueva = (e: Omit<Entrada, 'clave'>): Entrada => ({ ...e, clave: contador.current++ });
  const actual = pila[pila.length - 1];

  const reiniciar = (m: Modo = modo) => {
    setPila(inicio(m));
    setCerrada(false);
    setUltimo(
      m === 'todoapp'
        ? 'NavHost(navController = controller, startDestination = Route.TaskList)'
        : 'NavHost(startDestination = Routes.TaskFeature, ...)  // abre TaskList, su startDestination',
    );
  };

  const cambiarModo = (m: Modo) => {
    setModo(m);
    reiniciar(m);
  };

  const hacer = (a: Accion) => {
    setPila((p) => a.aplicar(p, nueva));
    setUltimo(a.codigo);
  };

  const atras = () => {
    if (pila.length === 1) {
      setCerrada(true);
      setUltimo('// Atrás en la pantalla de inicio: Navigation no la saca, el botón atrás le llega a la Activity y se cierra');
      return;
    }
    setPila((p) => p.slice(0, -1));
    setUltimo('// Botón atrás del sistema: quita la pantalla de arriba (como popBackStack())');
  };

  const botones = cerrada ? [] : acciones(modo, actual);

  return (
    <section aria-label="Pila de navegación" className={bloque}>
      <div className={cabecera}>
        <span className={etiqueta}>Demo</span>
        <p className={cn(tituloBloque, 'min-w-0 flex-1')}>La pila de navegación</p>
      </div>

      <div className="space-y-4 px-4 py-4 sm:px-5">
        <div role="group" aria-label="Proyecto" className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={modo === 'todoapp'}
            onClick={() => cambiarModo('todoapp')}
            className={cn(botonSecundario, modo === 'todoapp' && 'border-fd-foreground bg-fd-accent')}
          >
            ToDoApp (09/10)
          </button>
          <button
            type="button"
            aria-pressed={modo === 'grafos'}
            onClick={() => cambiarModo('grafos')}
            className={cn(botonSecundario, modo === 'grafos' && 'border-fd-foreground bg-fd-accent')}
          >
            Grafos anidados (18/11)
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
          <div className="mx-auto w-full max-w-60 rounded-2xl border p-2">
            <div className="flex h-64 flex-col overflow-hidden rounded-xl border bg-fd-card">
              <div className="flex items-center justify-between border-b px-3 py-2">
                <span className="text-sm font-medium">{cerrada ? 'Inicio' : DESCRIPCION[actual.pantalla]}</span>
                {!cerrada && actual.pantalla === 'TaskList' && modo === 'grafos' && (
                  <span className="text-xs text-fd-muted-foreground">engranaje</span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-3">
                {cerrada ? (
                  <p className="m-auto text-center text-xs text-fd-muted-foreground">La app se ha cerrado</p>
                ) : (
                  <>
                    <p className="font-mono text-[11px] text-fd-muted-foreground">{nombreRuta(modo, actual)}</p>
                    {actual.pantalla === 'TaskDetail' && <p className="text-sm">Tarea {actual.id}</p>}
                    {actual.pantalla === 'TaskCreate' && <p className="text-sm">Formulario</p>}
                    {actual.pantalla === 'Settings' && <p className="text-sm">Dark Mode</p>}
                    {botones.map((b) => (
                      <button key={b.texto} type="button" onClick={() => hacer(b)} className={cn(botonPrimario, 'w-full text-xs')}>
                        {b.texto}
                      </button>
                    ))}
                    {botones.length === 0 && (
                      <p className="text-xs text-fd-muted-foreground">Esta pantalla no recibe callbacks: solo se sale con atrás.</p>
                    )}
                  </>
                )}
              </div>
              <div className="flex justify-center gap-2 border-t p-1.5">
                <button type="button" onClick={atras} disabled={cerrada} className={cn(botonSecundario, 'min-h-8 text-xs')}>
                  <ArrowLeft className="size-3.5" aria-hidden />
                  Atrás
                </button>
                <button type="button" onClick={() => reiniciar()} className={cn(botonSecundario, 'min-h-8 text-xs')}>
                  <RotateCcw className="size-3.5" aria-hidden />
                  Reiniciar
                </button>
              </div>
            </div>
          </div>

          <div className="min-w-0 space-y-3">
            <div>
              <p className="mb-1.5 text-xs font-medium text-fd-muted-foreground">Pila (arriba, la pantalla que se ve)</p>
              <ol className="flex flex-col-reverse gap-1.5" aria-label="Pila de navegación">
                <AnimatePresence initial={false}>
                  {pila.map((e, i) => (
                    <motion.li
                      key={e.clave}
                      layout={!reducir}
                      initial={reducir ? false : { opacity: 0, x: 12 }}
                      animate={{ opacity: cerrada ? 0.4 : 1, x: 0 }}
                      exit={reducir ? { opacity: 0 } : { opacity: 0, x: 12 }}
                      transition={{ duration: reducir ? 0 : 0.22, ease: 'easeOut' }}
                      className={cn(
                        'flex flex-wrap items-baseline justify-between gap-x-3 rounded-md border px-3 py-1.5',
                        i === pila.length - 1 && !cerrada ? 'border-fd-foreground bg-fd-accent' : 'bg-fd-card',
                      )}
                    >
                      <span className="min-w-0 break-words font-mono text-xs">{nombreRuta(modo, e)}</span>
                      {e.grafo && <span className="text-[11px] text-fd-muted-foreground">grafo {e.grafo}</span>}
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ol>
            </div>
            <div aria-live="polite">
              <p className="mb-1 text-xs font-medium text-fd-muted-foreground">Lo que ha ejecutado el NavHost</p>
              <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-md border bg-fd-muted/40 px-3 py-2 text-[12.5px]">
                <code>{ultimo}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
