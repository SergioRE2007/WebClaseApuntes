'use client';

import { useState } from 'react';
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { avisoCaja, avisoTexto, bloque, botonSecundario, cabecera, etiqueta, tituloBloque } from '@/components/interactive/estilos';

/**
 * Simulador del listado paginado de proj-game contra JSON Server 0.17
 * (`?_page=&_limit=` y `observe: 'response'`). Enseña qué URL sale, qué
 * devuelve el servidor (cuerpo + cabecera X-Total-Count) y cómo se calcula
 * el total de páginas. Los títulos 5-12 son de relleno: en clase no se leen.
 */
const CONOCIDOS: Record<number, string> = {
  1: 'Pixel Runner',
  2: 'Space Colony',
  3: 'Neon Racer',
  4: 'Dungeon Quest',
  13: 'Shadow Castle',
  14: 'Pro Basketball',
  15: 'Robot Factory',
  16: 'Pixel Runner 2',
  17: 'Space Colony 2',
  18: 'Neon Racer 2',
  19: 'Dungeon Quest 2',
};

const JUEGOS = Array.from({ length: 19 }, (_, i) => ({ id: i + 1, title: CONOCIDOS[i + 1] ?? `Juego ${i + 1}` }));

export function SimuladorPaginacion({ titulo = 'Paginación con JSON Server' }: { titulo?: string }) {
  const [tam, setTam] = useState(5);
  const [pag, setPag] = useState(1);
  const [conRespuesta, setConRespuesta] = useState(true);
  const [volverAUno, setVolverAUno] = useState(true);
  const reducir = useReducedMotion();

  const total = JUEGOS.length;
  const totalPag = Math.ceil(total / tam);
  const inicio = (pag - 1) * tam;
  const pagina = JUEGOS.slice(inicio, inicio + tam);
  const url = `http://localhost:3000/games?_page=${pag}&_limit=${tam}`;

  const cambiarTam = (nuevo: number) => {
    setTam(nuevo);
    if (volverAUno) setPag(1);
  };

  return (
    <MotionConfig reducedMotion="user">
      <section aria-label={titulo} className={bloque}>
        <div className={cabecera}>
          <span className={etiqueta}>Demo</span>
          <p className={cn(tituloBloque, 'min-w-0 flex-1')}>{titulo}</p>
        </div>

        <div className="grid gap-4 px-4 py-4 sm:px-5">
          {/* Controles: lo mismo que app.component.html */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <label className="flex items-center gap-2">
              <span className="text-fd-muted-foreground">Tamaño</span>
              <select
                value={tam}
                onChange={(e) => cambiarTam(Number(e.target.value))}
                className="min-h-10 rounded-md border bg-fd-background px-2 py-1 text-sm sm:min-h-8"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
              </select>
            </label>
            <button type="button" className={botonSecundario} disabled={pag === 1} onClick={() => setPag((p) => p - 1)}>
              <ChevronLeft className="size-4" aria-hidden />
              Anterior
            </button>
            <span className="min-w-16 text-center tabular-nums" aria-live="polite">
              {pag} de {conRespuesta ? totalPag : '?'}
            </span>
            <button
              type="button"
              className={botonSecundario}
              disabled={conRespuesta ? pag >= totalPag : false}
              onClick={() => setPag((p) => p + 1)}
            >
              Siguiente
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>

          <div className="flex flex-col gap-1.5 text-sm">
            <label className="flex items-start gap-2">
              <input type="checkbox" className="mt-1" checked={conRespuesta} onChange={(e) => {
                  setConRespuesta(e.target.checked);
                  if (e.target.checked && pag > totalPag) setPag(totalPag);
                }}
              />
              <span>
                Pedir con <code>{"{ observe: 'response' }"}</code> (respuesta completa con cabeceras)
              </span>
            </label>
            <label className="flex items-start gap-2">
              <input type="checkbox" className="mt-1" checked={volverAUno} onChange={(e) => setVolverAUno(e.target.checked)} />
              <span>Volver a la página 1 al cambiar el tamaño</span>
            </label>
          </div>

          {/* Petición */}
          <div className="rounded-md border">
            <p className="border-b px-3 py-1.5 text-xs font-medium text-fd-muted-foreground">Petición que manda GameService</p>
            <p className="overflow-x-auto px-3 py-2 font-mono text-xs sm:text-sm">
              <span className="font-semibold">GET</span>{' '}
              <span className="break-all">
                .../games?_page=
                <motion.span key={`p${pag}`} initial={reducir ? false : { opacity: 0.2 }} animate={{ opacity: 1 }} className="font-semibold text-fd-primary">
                  {pag}
                </motion.span>
                &amp;_limit=
                <motion.span key={`t${tam}`} initial={reducir ? false : { opacity: 0.2 }} animate={{ opacity: 1 }} className="font-semibold text-fd-primary">
                  {tam}
                </motion.span>
              </span>
            </p>
            <p className="sr-only">{url}</p>
          </div>

          {/* Respuesta */}
          <div className="rounded-md border">
            <p className="border-b px-3 py-1.5 text-xs font-medium text-fd-muted-foreground">
              Lo que recibe el componente en el <code>subscribe</code>
            </p>
            <div className="grid gap-2 px-3 py-2 font-mono text-xs sm:text-sm">
              {conRespuesta ? (
                <>
                  <p>
                    <span className="text-fd-muted-foreground">status:</span> 200
                  </p>
                  <p>
                    <span className="text-fd-muted-foreground">headers.get(&apos;X-Total-Count&apos;):</span>{' '}
                    <span className="font-semibold">&apos;{total}&apos;</span>
                  </p>
                  <p className="text-fd-muted-foreground">body:</p>
                </>
              ) : (
                <p className="text-fd-muted-foreground">Solo el cuerpo (un Game[]):</p>
              )}
              <ul className="grid gap-1" aria-live="polite">
                <AnimatePresence mode="popLayout" initial={false}>
                  {pagina.length === 0 ? (
                    <motion.li key="vacio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn('rounded border px-2 py-1', avisoCaja, avisoTexto)}>
                      [] (página vacía)
                    </motion.li>
                  ) : (
                    pagina.map((j) => (
                      <motion.li
                        key={j.id}
                        layout
                        initial={reducir ? false : { opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ duration: 0.2 }}
                        className="truncate rounded border bg-fd-card px-2 py-1"
                      >
                        {`{ id: ${j.id}, title: '${j.title}', ... }`}
                      </motion.li>
                    ))
                  )}
                </AnimatePresence>
              </ul>
            </div>
          </div>

          {/* Cálculo */}
          <div className="rounded-md border px-3 py-2 text-sm">
            {conRespuesta ? (
              <p>
                <code>totalPag = Math.ceil({total} / {tam})</code> = <strong className="tabular-nums">{totalPag}</strong>. Con{' '}
                <code>observe: &apos;response&apos;</code> el componente puede leer la cabecera y saber cuántas páginas hay.
              </p>
            ) : (
              <p className={avisoTexto}>
                Sin <code>observe: &apos;response&apos;</code> solo llega el array: no hay forma de saber cuántos juegos hay en total,
                así que &laquo;Siguiente&raquo; no sabe cuándo pararse.
              </p>
            )}
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
