'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Check, RotateCcw, X, TriangleExclamationPoint } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  avisoCaja,
  avisoTexto,
  bloque,
  botonSecundario,
  cabecera,
  etiqueta,
  malCaja,
  malTexto,
  okCaja,
  okTexto,
  tituloBloque,
} from '@/components/interactive/estilos';

type Pieza =
  | 'app'
  | 'manifest'
  | 'activity'
  | 'vmAnot'
  | 'vmInject'
  | 'repoInject'
  | 'binds'
  | 'singleton'
  | 'hiltVm';

const GRUPOS: { archivo: string; piezas: { id: Pieza; texto: string }[] }[] = [
  {
    archivo: 'ToDoApplication.kt y AndroidManifest.xml',
    piezas: [
      { id: 'app', texto: '@HiltAndroidApp en ToDoApplication' },
      { id: 'manifest', texto: 'android:name=".di.ToDoApplication" en <application>' },
    ],
  },
  {
    archivo: 'MainActivity.kt',
    piezas: [{ id: 'activity', texto: '@AndroidEntryPoint en MainActivity' }],
  },
  {
    archivo: 'TaskListViewModel.kt y TaskListScreen.kt',
    piezas: [
      { id: 'vmAnot', texto: '@HiltViewModel en TaskListViewModel' },
      { id: 'vmInject', texto: '@Inject constructor(...) en TaskListViewModel' },
      { id: 'hiltVm', texto: 'La pantalla usa hiltViewModel() (si no, viewModel())' },
    ],
  },
  {
    archivo: 'TaskRepositoryInMemory.kt y ApplicationModule.kt',
    piezas: [
      { id: 'repoInject', texto: '@Inject constructor() en TaskRepositoryInMemory' },
      { id: 'binds', texto: '@Binds bindTaskRepository(...) en ApplicationModule' },
      { id: 'singleton', texto: '@Singleton en ese @Binds' },
    ],
  },
];

const TODAS: Record<Pieza, boolean> = {
  app: true,
  manifest: true,
  activity: true,
  vmAnot: true,
  vmInject: true,
  repoInject: true,
  binds: true,
  singleton: true,
  hiltVm: true,
};

type Tipo = 'compila' | 'ejecuta' | 'aviso' | 'ok';

interface Resultado {
  id: string;
  tipo: Tipo;
  donde: string;
  mensaje?: string;
  explicacion: string;
  deClase?: string;
}

function evaluar(p: Record<Pieza, boolean>): Resultado {
  if (p.vmAnot && !p.vmInject) {
    return {
      id: 'vm-sin-inject',
      tipo: 'compila',
      donde: 'Build Output (no compila)',
      mensaje: '@HiltViewModel annotated class should contain exactly one @Inject annotated constructor.',
      explicacion:
        'Un ViewModel con @HiltViewModel necesita un constructor con @Inject, aunque no reciba nada: @Inject constructor().',
      deClase: '13/11, con MainViewModel',
    };
  }
  if (!p.binds) {
    return {
      id: 'sin-binds',
      tipo: 'compila',
      donde: 'Build Output (no compila)',
      mensaje: '[Dagger/MissingBinding] TaskRepository cannot be provided without an @Provides-annotated method.',
      explicacion:
        'TaskRepository es una interfaz y Hilt no sabe qué implementación usar. El @Binds del módulo es el que se lo dice.',
    };
  }
  if (!p.repoInject) {
    return {
      id: 'repo-sin-inject',
      tipo: 'compila',
      donde: 'Build Output (no compila)',
      mensaje:
        '[Dagger/MissingBinding] TaskRepositoryInMemory cannot be provided without an @Inject constructor or an @Provides-annotated method.',
      explicacion:
        'El @Binds dice "usa TaskRepositoryInMemory", pero Hilt no sabe construirla. Le falta @Inject constructor().',
    };
  }
  if (!p.activity && p.hiltVm) {
    return {
      id: 'sin-entry-point',
      tipo: 'ejecuta',
      donde: 'Logcat (la app se cae al abrir la lista)',
      mensaje:
        'IllegalStateException: Given component holder class ...MainActivity does not implement interface dagger.hilt.internal.GeneratedComponent or interface dagger.hilt.internal.GeneratedComponentManager',
      explicacion:
        'hiltViewModel() busca el contenedor de Hilt de la Activity y no lo encuentra: sin @AndroidEntryPoint, la Activity no es un punto de entrada de Hilt.',
    };
  }
  if (!p.app || !p.manifest) {
    return {
      id: 'sin-app',
      tipo: 'ejecuta',
      donde: 'Logcat (la app se cae al arrancar)',
      mensaje:
        "IllegalStateException: Hilt Activity must be attached to an @HiltAndroidApp Application. Did you forget to specify your Application's class name in your manifest's <application />'s android:name attribute?",
      explicacion: !p.app
        ? 'La clase Application no lleva @HiltAndroidApp, así que Hilt no crea el contenedor de la app.'
        : 'ToDoApplication tiene @HiltAndroidApp, pero el manifest no la usa: Android arranca con la Application por defecto.',
      deClase: !p.app
        ? '26/10, a la Application se le puso primero @AndroidEntryPoint en vez de @HiltAndroidApp y se cambió'
        : undefined,
    };
  }
  if (!p.hiltVm) {
    return {
      id: 'viewmodel-normal',
      tipo: 'ejecuta',
      donde: 'Logcat (la app se cae al abrir la lista)',
      mensaje:
        'RuntimeException: Cannot create an instance of class ...TaskListViewModel\nCaused by: NoSuchMethodException: ...TaskListViewModel.<init> []',
      explicacion:
        'Dentro de un NavHost, viewModel() usa la fábrica normal, que solo sabe llamar a un constructor vacío. Con Hilt y Navigation hay que usar hiltViewModel().',
    };
  }
  if (!p.vmAnot) {
    return {
      id: 'sin-hiltviewmodel',
      tipo: 'ejecuta',
      donde: 'Logcat (la app se cae al abrir la lista)',
      mensaje:
        'RuntimeException: Cannot create an instance of class ...TaskListViewModel\nCaused by: NoSuchMethodException: ...TaskListViewModel.<init> []',
      explicacion:
        'Sin @HiltViewModel, Hilt no conoce ese ViewModel e intenta crearlo con un constructor vacío, que no existe.',
      deClase: '18/11, con SettingsViewModel',
    };
  }
  if (!p.singleton) {
    return {
      id: 'sin-singleton',
      tipo: 'aviso',
      donde: 'Compila y arranca, pero falla en silencio',
      explicacion:
        'Sin @Singleton, Hilt crea un TaskRepositoryInMemory nuevo para cada ViewModel. La tarea que crea TaskCreateViewModel se guarda en una lista que TaskListViewModel nunca ve.',
    };
  }
  return {
    id: 'ok',
    tipo: 'ok',
    donde: 'BUILD SUCCESSFUL y la app funciona',
    explicacion:
      'Hilt construye TaskListViewModel, le pasa el TaskRepository atado con @Binds y, gracias a @Singleton, todas las pantallas comparten la misma lista.',
  };
}

const ESTILO: Record<Tipo, { caja: string; texto: string; titulo: string }> = {
  compila: { caja: malCaja, texto: malTexto, titulo: 'Error de compilación' },
  ejecuta: { caja: malCaja, texto: malTexto, titulo: 'Error al ejecutar' },
  aviso: { caja: avisoCaja, texto: avisoTexto, titulo: 'Funciona, pero mal' },
  ok: { caja: okCaja, texto: okTexto, titulo: 'Todo bien' },
};

/**
 * Quita o pon las piezas de Hilt de la ToDoApp y mira qué error sale (y si
 * sale al compilar o al ejecutar).
 */
export function SimuladorHilt() {
  const reducir = useReducedMotion();
  const [piezas, setPiezas] = useState<Record<Pieza, boolean>>(TODAS);
  const resultado = evaluar(piezas);
  const estilo = ESTILO[resultado.tipo];
  const Icono = resultado.tipo === 'ok' ? Check : resultado.tipo === 'aviso' ? TriangleExclamationPoint : X;

  return (
    <section aria-label="Simulador de Hilt" className={bloque}>
      <div className={cabecera}>
        <span className={etiqueta}>Demo</span>
        <p className={cn(tituloBloque, 'min-w-0 flex-1')}>Quita una pieza de Hilt y mira qué pasa</p>
        <button type="button" onClick={() => setPiezas(TODAS)} className={cn(botonSecundario, 'min-h-8 text-xs')}>
          <RotateCcw className="size-3.5" aria-hidden />
          Ponerlo todo
        </button>
      </div>

      <div className="grid gap-4 px-4 py-4 sm:px-5 md:grid-cols-2">
        <div className="space-y-3">
          {GRUPOS.map((g) => (
            <fieldset key={g.archivo} className="rounded-md border px-3 pb-2.5 pt-1.5">
              <legend className="px-1 font-mono text-xs text-fd-muted-foreground">{g.archivo}</legend>
              <div className="space-y-1.5">
                {g.piezas.map((pz) => (
                  <label key={pz.id} className="flex cursor-pointer items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="mt-0.5 size-4 shrink-0 accent-current"
                      checked={piezas[pz.id]}
                      onChange={(e) => setPiezas((p) => ({ ...p, [pz.id]: e.target.checked }))}
                    />
                    <span className={cn('font-mono text-[12.5px] break-words', !piezas[pz.id] && 'text-fd-muted-foreground line-through')}>
                      {pz.texto}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        <div aria-live="polite" className="md:sticky md:top-20 md:self-start">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={resultado.id}
              initial={reducir ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducir ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: reducir ? 0 : 0.2, ease: 'easeOut' }}
              className={cn('rounded-md border p-3', estilo.caja)}
            >
              <p className={cn('flex items-center gap-1.5 text-sm font-semibold', estilo.texto)}>
                <Icono className="size-4" aria-hidden />
                {estilo.titulo}
              </p>
              <p className="mt-0.5 text-xs text-fd-muted-foreground">{resultado.donde}</p>
              {resultado.mensaje && (
                <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words rounded border bg-fd-background px-2 py-1.5 font-mono text-[11.5px] leading-relaxed">
                  {resultado.mensaje}
                </pre>
              )}
              <p className="mt-2 text-sm">{resultado.explicacion}</p>
              {resultado.deClase && (
                <p className="mt-2 text-xs font-medium text-fd-muted-foreground">Salió en clase: {resultado.deClase}</p>
              )}
            </motion.div>
          </AnimatePresence>
          <p className="mt-2 text-xs text-fd-muted-foreground">
            Si quitas varias piezas, sale el primer error que encontrarías: primero los de compilación y después los del
            arranque.
          </p>
        </div>
      </div>
    </section>
  );
}
