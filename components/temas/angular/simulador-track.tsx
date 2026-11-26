'use client';

import { useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { cn } from '@/lib/cn';
import { bloque, botonSecundario, cabecera, etiqueta, tituloBloque } from '@/components/interactive/estilos';

/**
 * Qué hace Angular con los elementos del DOM de un @for cuando cambia la lista,
 * según lo que se ponga en `track`. Cada <li> pintado es un "nodo" con su
 * propia identidad: con `track game.id` el nodo va con el juego (se mueve con
 * él); con `track $index` el nodo va con la posición (se queda quieto y se le
 * cambia el texto). Las etiquetas "nuevo", "movido" y "texto cambiado" dicen
 * qué ha tenido que hacer Angular en el último cambio.
 */

type Modo = 'id' | 'index';
type Marca = 'nuevo' | 'movido' | 'texto' | null;

interface Juego {
  id: number;
  title: string;
}

const INICIAL: Juego[] = [
  { id: 1, title: 'Pixel Runner' },
  { id: 2, title: 'Neon Racer' },
  { id: 3, title: 'Space Farm' },
];

const NUEVOS = ['Retro Kart', 'Cloud Chef', 'Moon Golf', 'Dungeon Mail', 'Robo Garden'];
const MAX = 6;

/** Clave del nodo del DOM: lo que Angular usa para reconocerlo. */
const clave = (modo: Modo, juego: Juego, i: number) => (modo === 'id' ? `id-${juego.id}` : `i-${i}`);

/**
 * Posiciones (dentro de `seq`) de una subsecuencia creciente más larga. Los
 * nodos que ya existían y forman parte de ella no hace falta moverlos: basta
 * con mover los demás (el mínimo de movimientos). Que un nodo solo "se corra"
 * porque se ha borrado o añadido otro antes no cuenta como movimiento.
 */
function subsecuenciaCreciente(seq: number[]): Set<number> {
  const largo = seq.map(() => 1);
  const previo = seq.map(() => -1);
  for (let i = 0; i < seq.length; i++) {
    for (let j = 0; j < i; j++) {
      if ((seq[j] ?? 0) < (seq[i] ?? 0) && (largo[j] ?? 0) + 1 > (largo[i] ?? 0)) {
        largo[i] = (largo[j] ?? 0) + 1;
        previo[i] = j;
      }
    }
  }
  let fin = -1;
  largo.forEach((l, i) => {
    if (fin === -1 || l > (largo[fin] ?? 0)) fin = i;
  });
  const resultado = new Set<number>();
  for (let i = fin; i !== -1; i = previo[i] ?? -1) resultado.add(i);
  return resultado;
}

function calcularMarcas(modo: Modo, antes: Juego[], despues: Juego[]) {
  const previo = new Map(antes.map((j, i) => [clave(modo, j, i), { j, i }]));
  const marcas: Record<string, Marca> = {};
  let nuevos = 0;
  let movidos = 0;
  let cambiados = 0;

  // Nodos que ya existían, en el orden nuevo, con su posición antigua
  const conservados = despues.flatMap((j, i) => {
    const p = previo.get(clave(modo, j, i));
    return p ? [{ k: clave(modo, j, i), antes: p.i }] : [];
  });
  const quietos = subsecuenciaCreciente(conservados.map((c) => c.antes));
  const seMueve = new Set(conservados.filter((_, n) => !quietos.has(n)).map((c) => c.k));

  despues.forEach((j, i) => {
    const k = clave(modo, j, i);
    const p = previo.get(k);
    if (!p) {
      marcas[k] = 'nuevo';
      nuevos++;
    } else if (p.j.title !== j.title) {
      marcas[k] = 'texto';
      cambiados++;
    } else if (seMueve.has(k)) {
      marcas[k] = 'movido';
      movidos++;
    } else {
      marcas[k] = null;
    }
  });
  const nuevasClaves = new Set(despues.map((j, i) => clave(modo, j, i)));
  const borrados = [...previo.keys()].filter((k) => !nuevasClaves.has(k)).length;
  return { marcas, nuevos, movidos, cambiados, borrados };
}

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

export function SimuladorTrack({ titulo = '¿Qué toca Angular en el DOM?' }: { titulo?: string }) {
  const [modo, setModo] = useState<Modo>('id');
  const [juegos, setJuegos] = useState<Juego[]>(INICIAL);
  const [siguiente, setSiguiente] = useState(4);
  const [marcas, setMarcas] = useState<Record<string, Marca>>({});
  const [version, setVersion] = useState(0);
  const [resumen, setResumen] = useState('');

  const aplicar = (nueva: Juego[], accion: string) => {
    const r = calcularMarcas(modo, juegos, nueva);
    setJuegos(nueva);
    setMarcas(r.marcas);
    setVersion((v) => v + 1);
    const partes = [
      r.nuevos ? plural(r.nuevos, 'nodo creado', 'nodos creados') : '',
      r.borrados ? plural(r.borrados, 'nodo borrado', 'nodos borrados') : '',
      r.movidos ? plural(r.movidos, 'nodo movido', 'nodos movidos') : '',
      r.cambiados ? plural(r.cambiados, 'nodo con el texto cambiado', 'nodos con el texto cambiado') : '',
    ].filter(Boolean);
    setResumen(`${accion}: ${partes.length ? partes.join(', ') : 'nada que tocar'}.`);
  };

  const anadir = () => {
    if (juegos.length >= MAX) return;
    const title = NUEVOS[(siguiente - 4) % NUEVOS.length] ?? 'Nuevo juego';
    aplicar([{ id: siguiente, title }, ...juegos], 'Añadir al principio');
    setSiguiente((s) => s + 1);
  };

  const quitar = () => {
    if (juegos.length === 0) return;
    aplicar(juegos.slice(1), 'Quitar el primero');
  };

  const invertir = () => {
    if (juegos.length < 2) return;
    aplicar([...juegos].reverse(), 'Invertir el orden');
  };

  const reiniciar = () => {
    setJuegos(INICIAL);
    setSiguiente(4);
    setMarcas({});
    setResumen('');
  };

  const cambiarModo = (m: Modo) => {
    setModo(m);
    setMarcas({});
    setResumen('');
  };

  const expresionTrack = modo === 'id' ? 'game.id' : '$index';

  return (
    <MotionConfig reducedMotion="user">
      <section aria-label={titulo} className={bloque}>
        <div className={cabecera}>
          <span className={etiqueta}>Demo</span>
          <p className={cn(tituloBloque, 'min-w-0 flex-1')}>{titulo}</p>
        </div>

        <div className="flex flex-col gap-4 px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1" role="group" aria-label="Qué se pone en track">
              <span className={etiqueta}>track</span>
              <div className="flex gap-2">
                {(['id', 'index'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={modo === m}
                    onClick={() => cambiarModo(m)}
                    className={cn(botonSecundario, 'font-mono', modo === m && 'border-fd-primary text-fd-primary')}
                  >
                    {m === 'id' ? 'game.id' : '$index'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1" role="group" aria-label="Cambiar la lista">
              <span className={etiqueta}>Cambia la lista</span>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={anadir} disabled={juegos.length >= MAX} className={botonSecundario}>
                  Añadir al principio
                </button>
                <button type="button" onClick={quitar} disabled={juegos.length === 0} className={botonSecundario}>
                  Quitar el primero
                </button>
                <button type="button" onClick={invertir} disabled={juegos.length < 2} className={botonSecundario}>
                  Invertir el orden
                </button>
                <button type="button" onClick={reiniciar} className={botonSecundario}>
                  Reiniciar
                </button>
              </div>
            </div>
          </div>

          <div>
            <p className={cn(etiqueta, 'mb-1')}>Plantilla</p>
            <pre className="overflow-x-auto rounded-md border bg-fd-muted/40 px-3 py-2 font-mono text-xs leading-relaxed text-fd-foreground">
              {`<ul>\n  @for (game of games; track ${expresionTrack}) {\n    <li>{{ game.title }}</li>\n  } @empty {\n    <li>No hay juegos</li>\n  }\n</ul>`}
            </pre>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="min-w-0 rounded-md border">
              <p className={cn(etiqueta, 'border-b px-3 py-1.5')}>games (en la clase)</p>
              <code className="block whitespace-pre-wrap break-words px-3 py-2 font-mono text-xs leading-relaxed">
                {juegos.length === 0
                  ? '[]'
                  : `[\n${juegos.map((j) => `  { id: ${j.id}, title: '${j.title}' }`).join(',\n')}\n]`}
              </code>
            </div>

            <div className="min-w-0 rounded-md border">
              <p className={cn(etiqueta, 'border-b px-3 py-1.5')}>DOM (los &lt;li&gt; pintados)</p>
              <ul className="flex flex-col gap-1.5 px-3 py-2">
                <AnimatePresence initial={false} mode="popLayout">
                  {juegos.length === 0 ? (
                    <motion.li
                      key="vacio"
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="rounded-md border border-dashed px-2.5 py-1.5 text-sm text-fd-muted-foreground"
                    >
                      No hay juegos <span className="font-mono text-[11px]">(@empty)</span>
                    </motion.li>
                  ) : (
                    juegos.map((j, i) => {
                      const k = clave(modo, j, i);
                      const marca = marcas[k] ?? null;
                      return (
                        <motion.li
                          key={`${modo}-${k}`}
                          layout
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 8 }}
                          transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                          className="relative flex min-h-9 items-center justify-between gap-2 overflow-hidden rounded-md border px-2.5 py-1.5"
                        >
                          {marca ? (
                            <motion.span
                              key={version}
                              aria-hidden
                              className="absolute inset-0 bg-fd-primary/15"
                              initial={{ opacity: 1 }}
                              animate={{ opacity: 0 }}
                              transition={{ duration: 1.2, ease: 'easeOut' }}
                            />
                          ) : null}
                          <span className="relative min-w-0 truncate text-sm">{j.title}</span>
                          <span className="relative flex shrink-0 items-center gap-2">
                            {marca ? (
                              <span className="font-mono text-[11px] text-fd-primary">
                                {marca === 'texto' ? 'texto cambiado' : marca}
                              </span>
                            ) : null}
                            <span className="font-mono text-[11px] text-fd-muted-foreground">
                              {modo === 'id' ? `id ${j.id}` : `$index ${i}`}
                            </span>
                          </span>
                        </motion.li>
                      );
                    })
                  )}
                </AnimatePresence>
              </ul>
            </div>
          </div>

          <p className="min-h-5 text-sm" aria-live="polite">
            {resumen ||
              (modo === 'id'
                ? 'Con track game.id cada <li> va unido a su juego: si el juego cambia de sitio, Angular mueve el nodo.'
                : 'Con track $index cada <li> va unido a su posición: Angular deja los nodos donde están y les cambia el texto.')}
          </p>
        </div>
      </section>
    </MotionConfig>
  );
}
