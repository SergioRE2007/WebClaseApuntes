'use client';

import { useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { Home, Plus, Settings, Star } from 'lucide-react';
import { cn } from '@/lib/cn';
import { bloque, cabecera, etiqueta, tituloBloque } from '@/components/interactive/estilos';
import { CodigoDemo } from './comun';

/**
 * Anatomía de un Scaffold: qué hueco ocupa cada slot y por qué hay que usar
 * el innerPadding. La app va edge-to-edge (enableEdgeToEdge), así que la barra
 * de estado también forma parte del innerPadding.
 */

const BARRA_ESTADO = 20;
const ALTO_TOP = 44;
const ALTO_BOTTOM = 48;

export function AnatomiaScaffold() {
  const [top, setTop] = useState(true);
  const [fab, setFab] = useState(true);
  const [bottom, setBottom] = useState(false);
  const [usarPadding, setUsarPadding] = useState(false);

  const arriba = BARRA_ESTADO + (top ? ALTO_TOP : 0);
  const abajo = bottom ? ALTO_BOTTOM : 0;

  const slots = [
    top && '    topBar = { TopAppBar(title = { Text("Tareas") }) },',
    bottom && '    bottomBar = { NavigationBar { /* ... */ } },',
    fab && '    floatingActionButton = {\n        FloatingActionButton(onClick = toCreate) { Icon(...) }\n    },',
  ].filter(Boolean);

  const codigo = `Scaffold(
    modifier = Modifier.fillMaxSize(),
${slots.join('\n')}${slots.length ? '\n' : ''}) { innerPadding ->
    LazyColumn(
        modifier = Modifier${
          usarPadding ? '\n            .consumeWindowInsets(innerPadding)\n            .padding(innerPadding)' : ''
        }
    ) { /* ... */ }
}`;

  const casillas: [string, boolean, (v: boolean) => void][] = [
    ['topBar', top, setTop],
    ['floatingActionButton', fab, setFab],
    ['bottomBar', bottom, setBottom],
    ['.padding(innerPadding)', usarPadding, setUsarPadding],
  ];

  return (
    <MotionConfig reducedMotion="user" transition={{ type: 'spring', bounce: 0.1, duration: 0.45 }}>
      <section aria-label="Anatomía de un Scaffold" className={cn(bloque, '@container')}>
        <div className={cabecera}>
          <span className={etiqueta}>Demo</span>
          <p className={cn(tituloBloque, 'min-w-0 flex-1')}>Anatomía de un Scaffold</p>
        </div>
        <div className="grid gap-5 p-4 sm:p-5 @xl:grid-cols-[auto_minmax(0,1fr)]">
          <div className="flex justify-center">
            <div className="relative h-[380px] w-[210px] overflow-hidden rounded-[1.6rem] border-2 border-fd-foreground/20 bg-fd-background">
              <motion.div
                layout
                className="absolute inset-x-0 overflow-hidden"
                style={{ top: usarPadding ? arriba : 0, bottom: usarPadding ? abajo : 0 }}
              >
                <ul className="divide-y">
                  {Array.from({ length: 12 }, (_, i) => (
                    <li key={i} className="px-3 py-2.5 text-xs">
                      Tarea {i + 1}
                    </li>
                  ))}
                </ul>
              </motion.div>

              {usarPadding && (
                <>
                  <motion.div
                    layout
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 border-b border-dashed border-fd-primary/60 bg-fd-primary/5"
                    style={{ height: arriba }}
                  />
                  {abajo > 0 && (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 bottom-0 border-t border-dashed border-fd-primary/60 bg-fd-primary/5"
                      style={{ height: abajo }}
                    />
                  )}
                </>
              )}

              <div
                className="absolute inset-x-0 top-0 flex items-center justify-between bg-fd-muted px-4 font-mono text-[9px] text-fd-muted-foreground"
                style={{ height: BARRA_ESTADO }}
              >
                <span>12:00</span>
                <span>barra de estado</span>
              </div>

              <AnimatePresence>
                {top && (
                  <motion.div
                    key="top"
                    initial={{ y: -ALTO_TOP }}
                    animate={{ y: 0 }}
                    exit={{ y: -ALTO_TOP - BARRA_ESTADO }}
                    className="absolute inset-x-0 flex items-center justify-between border-b bg-fd-card px-3"
                    style={{ top: BARRA_ESTADO, height: ALTO_TOP }}
                  >
                    <span className="text-sm font-medium">Tareas</span>
                    <Settings className="size-4 text-fd-muted-foreground" aria-hidden />
                  </motion.div>
                )}
                {bottom && (
                  <motion.div
                    key="bottom"
                    initial={{ y: ALTO_BOTTOM }}
                    animate={{ y: 0 }}
                    exit={{ y: ALTO_BOTTOM }}
                    className="absolute inset-x-0 bottom-0 flex items-center justify-around border-t bg-fd-card"
                    style={{ height: ALTO_BOTTOM }}
                  >
                    <Home className="size-4" aria-hidden />
                    <Star className="size-4 text-fd-muted-foreground" aria-hidden />
                    <Settings className="size-4 text-fd-muted-foreground" aria-hidden />
                  </motion.div>
                )}
                {fab && (
                  <motion.div
                    key="fab"
                    layout
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute right-3 flex size-11 items-center justify-center rounded-xl bg-fd-primary text-fd-primary-foreground"
                    style={{ bottom: abajo + 12 }}
                  >
                    <Plus className="size-5" aria-hidden />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="min-w-0 space-y-3">
            <fieldset className="grid gap-1.5">
              <legend className="mb-1.5 text-xs font-medium text-fd-muted-foreground">Slots y padding</legend>
              {casillas.map(([nombre, valor, cambiar]) => (
                <label
                  key={nombre}
                  className="flex min-h-9 cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={valor}
                    onChange={(e) => cambiar(e.target.checked)}
                    className="size-4 shrink-0 accent-fd-primary"
                  />
                  <code className="truncate font-mono text-[12.5px]">{nombre}</code>
                </label>
              ))}
            </fieldset>
            <p className="border-l-2 border-fd-primary/60 pl-3 text-sm" aria-live="polite">
              {usarPadding
                ? `Con padding(innerPadding) la lista empieza debajo de la barra de estado${top ? ' y de la TopAppBar' : ''}${
                    bottom ? ' y acaba encima de la barra inferior' : ''
                  }. La zona discontinua es el innerPadding.`
                : `Sin el innerPadding, la lista empieza en el borde de la pantalla: las primeras tareas quedan debajo de la barra de estado${
                    top ? ' y de la TopAppBar' : ''
                  }${bottom ? ', y las últimas, debajo de la barra inferior' : ''}.`}
            </p>
            <CodigoDemo codigo={codigo} titulo="TaskListScreen.kt" />
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
