'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from 'motion/react';
import { Heart, RotateCcw, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { bloque, botonSecundario, cabecera, etiqueta, tituloBloque } from '@/components/interactive/estilos';
import { CodigoDemo, Segmentado } from './comun';

/**
 * Dos experimentos con listas:
 * 1) LazyColumn solo compone las filas que se ven; Column las compone todas.
 * 2) Sin key, el estado recordado de cada fila va con la posición; con key, va con el elemento.
 */

const TOTAL = 1000;
const ALTO = 40;
const VISTA = 240;

function Composicion({ anunciar }: { anunciar: (texto: string) => void }) {
  const reducir = useReducedMotion();
  const [modo, setModo] = useState<'lazy' | 'column'>('lazy');
  const [scroll, setScroll] = useState(0);
  const vistas = useRef<Set<number>>(new Set());
  const [totalCompuestas, setTotalCompuestas] = useState(0);
  const contenedor = useRef<HTMLDivElement>(null);

  const primero = Math.max(0, Math.floor(scroll / ALTO));
  const ultimo = Math.min(TOTAL - 1, Math.floor((scroll + VISTA) / ALTO) + 1);
  const visibles: number[] = [];
  for (let i = primero; i <= ultimo; i++) visibles.push(i);

  useEffect(() => {
    if (modo !== 'lazy') return;
    let nuevas = 0;
    for (const i of visibles) {
      if (!vistas.current.has(i)) {
        vistas.current.add(i);
        nuevas++;
      }
    }
    if (nuevas) setTotalCompuestas((t) => t + nuevas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primero, ultimo, modo]);

  const cambiar = (m: 'lazy' | 'column') => {
    setModo(m);
    vistas.current = new Set();
    setTotalCompuestas(m === 'column' ? TOTAL : 0);
    setScroll(0);
    if (contenedor.current) contenedor.current.scrollTop = 0;
    anunciar(
      m === 'column'
        ? `Column: se han compuesto las ${TOTAL} filas de golpe.`
        : 'LazyColumn: solo se componen las filas que se ven.',
    );
  };

  const codigo =
    modo === 'lazy'
      ? `LazyColumn {
    items(items = pokemons, key = { it.id }) { pokemon ->
        Text(pokemon.name)
    }
}`
      : `Column(
    modifier = Modifier.verticalScroll(rememberScrollState())
) {
    for (pokemon in pokemons) {
        Text(pokemon.name)
    }
}`;

  return (
    <div className="space-y-4">
      <Segmentado
        etiqueta="Tipo de lista"
        opciones={[
          { valor: 'lazy', texto: 'LazyColumn' },
          { valor: 'column', texto: 'Column' },
        ]}
        valor={modo}
        onCambio={cambiar}
      />
      <div className="grid gap-4 @2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-2">
          <div
            ref={contenedor}
            onScroll={(e) => setScroll(e.currentTarget.scrollTop)}
            tabIndex={0}
            role="region"
            aria-label={`Lista de ${TOTAL} pokémon, desplázate para ver más`}
            className="relative overflow-y-auto rounded-md border bg-fd-card focus-visible:outline-2 focus-visible:outline-fd-ring"
            style={{ height: VISTA }}
          >
            <div style={{ height: TOTAL * ALTO }} className="relative">
              {modo === 'lazy'
                ? visibles.map((i) => (
                    /* El destello marca la fila que se acaba de componer. */
                    <motion.div
                      key={`lazy-${i}`}
                      initial={reducir ? false : { backgroundColor: 'rgba(127,127,127,0.25)' }}
                      animate={{ backgroundColor: 'rgba(127,127,127,0)' }}
                      transition={{ duration: 0.7 }}
                      className="absolute inset-x-0 flex items-center justify-between border-b px-3 text-sm"
                      style={{ top: i * ALTO, height: ALTO }}
                    >
                      <span>Pokémon #{i + 1}</span>
                      <span className="font-mono text-[10px] text-fd-muted-foreground">compuesto</span>
                    </motion.div>
                  ))
                : /* Column: las 1000 filas existen siempre (divs normales, sin animar). */
                  Array.from({ length: TOTAL }, (_, i) => (
                    <div
                      key={`column-${i}`}
                      className="absolute inset-x-0 flex items-center border-b px-3 text-sm"
                      style={{ top: i * ALTO, height: ALTO }}
                    >
                      Pokémon #{i + 1}
                    </div>
                  ))}
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="rounded-md border px-2 py-1.5">
              <dt className="text-fd-muted-foreground">Filas compuestas ahora</dt>
              <dd className="font-mono text-base tabular-nums">{modo === 'lazy' ? visibles.length : TOTAL}</dd>
            </div>
            <div className="rounded-md border px-2 py-1.5">
              <dt className="text-fd-muted-foreground">Composiciones en total</dt>
              <dd className="font-mono text-base tabular-nums">{totalCompuestas}</dd>
            </div>
          </dl>
        </div>
        <div className="min-w-0 space-y-3">
          <CodigoDemo codigo={codigo} titulo="PokemonList.kt" />
          <p className="border-l-2 border-fd-primary/60 pl-3 text-sm">
            {modo === 'lazy'
              ? 'LazyColumn solo compone las filas que caben en la pantalla (y alguna más). Al desplazarte, compone las que entran y descarta las que salen.'
              : `Column compone las ${TOTAL} filas al entrar en la pantalla, aunque solo veas unas pocas. Con listas largas va lento y gasta memoria.`}
          </p>
        </div>
      </div>
    </div>
  );
}

const POKEMON = [
  { id: 1, nombre: 'Bulbasaur' },
  { id: 2, nombre: 'Ivysaur' },
  { id: 3, nombre: 'Venusaur' },
  { id: 4, nombre: 'Charmander' },
  { id: 5, nombre: 'Charmeleon' },
];

function Claves({ anunciar }: { anunciar: (texto: string) => void }) {
  const [conKey, setConKey] = useState(false);
  const [lista, setLista] = useState(POKEMON);
  /** Sin key: el estado recordado está en la posición (índice). */
  const [porPosicion, setPorPosicion] = useState<boolean[]>([true, false, false, false, false]);
  /** Con key: el estado recordado va con el id del elemento. */
  const [porId, setPorId] = useState<Record<number, boolean>>({ 1: true });

  const reiniciar = (k: boolean = conKey) => {
    setConKey(k);
    setLista(POKEMON);
    setPorPosicion([true, false, false, false, false]);
    setPorId({ 1: true });
  };

  const borrarPrimero = () => {
    if (!lista.length) return;
    const [quitado, ...resto] = lista;
    const favoritos = resto.filter((p, i) => (conKey ? porId[p.id] : porPosicion[i])).map((p) => p.nombre);
    anunciar(
      `Has borrado ${quitado.nombre}. ${
        favoritos.length ? `Favoritos ahora: ${favoritos.join(', ')}.` : 'Ya no queda ningún favorito.'
      }`,
    );
    setLista(resto);
    setPorPosicion((p) => p.slice(0, resto.length));
    setPorId((m) => {
      const copia = { ...m };
      delete copia[quitado.id];
      return copia;
    });
  };

  const esFavorito = (i: number, id: number) => (conKey ? Boolean(porId[id]) : Boolean(porPosicion[i]));
  const alternar = (i: number, id: number) => {
    if (conKey) setPorId((m) => ({ ...m, [id]: !m[id] }));
    else setPorPosicion((p) => p.map((v, j) => (j === i ? !v : v)));
  };

  const codigo = `LazyColumn {
    items(items = pokemons${conKey ? ', key = { it.id }' : ''}) { pokemon ->
        var favorito by remember { mutableStateOf(false) }
        PokemonFila(
            nombre = pokemon.name,
            favorito = favorito,
            onFavorito = { favorito = !favorito }
        )
    }
}`;

  return (
    <div className="space-y-4">
      <Segmentado
        etiqueta="Con o sin key"
        opciones={[
          { valor: 'no', texto: 'items(pokemons)' },
          { valor: 'si', texto: 'items(pokemons, key = { it.id })' },
        ]}
        valor={conKey ? 'si' : 'no'}
        onCambio={(v) => reiniciar(v === 'si')}
      />
      <div className="grid gap-4 @2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-2">
          <ul className="relative overflow-hidden rounded-md border bg-fd-card" aria-label="Lista de pokémon">
            <AnimatePresence initial={false} mode="popLayout">
              {lista.map((p, i) => {
                const fav = esFavorito(i, p.id);
                return (
                  <motion.li
                    layout
                    key={conKey ? p.id : i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -24 }}
                    className="flex items-center justify-between border-b px-3 py-2 text-sm last:border-b-0"
                  >
                    <span>{p.nombre}</span>
                    <button
                      type="button"
                      onClick={() => alternar(i, p.id)}
                      aria-pressed={fav}
                      aria-label={`Favorito: ${p.nombre}`}
                      className={cn(botonSecundario, 'min-h-8 px-2', fav && 'text-fd-primary')}
                    >
                      <Heart className={cn('size-4', fav && 'fill-current')} aria-hidden />
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
            {!lista.length && <li className="px-3 py-2 text-sm text-fd-muted-foreground">Lista vacía</li>}
          </ul>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={borrarPrimero} disabled={!lista.length} className={botonSecundario}>
              <Trash2 className="size-3.5" aria-hidden />
              Borrar el primero
            </button>
            <button type="button" onClick={() => reiniciar()} className={botonSecundario}>
              <RotateCcw className="size-3.5" aria-hidden />
              Reiniciar
            </button>
          </div>
        </div>
        <div className="min-w-0 space-y-3">
          <CodigoDemo codigo={codigo} titulo="PokemonList.kt" />
          <p className="border-l-2 border-fd-primary/60 pl-3 text-sm">
            {conKey
              ? 'Con key, Compose sabe qué fila es cada pokémon. Al borrar Bulbasaur, su estado se va con él y el corazón no salta a otro.'
              : 'Bulbasaur es favorito. Bórralo: sin key, el estado recordado va con la posición, así que ahora Ivysaur sale como favorito aunque nadie lo ha marcado.'}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ListaPerezosa() {
  const [pestana, setPestana] = useState<'compone' | 'key'>('compone');
  /** Única región viva de la demo: fuera de los experimentos, que se montan y desmontan. */
  const [aviso, setAviso] = useState('');
  return (
    <MotionConfig reducedMotion="user" transition={{ type: 'spring', bounce: 0.1, duration: 0.4 }}>
      <section aria-label="Listas en Compose" className={cn(bloque, '@container')}>
        <div className={cabecera}>
          <span className={etiqueta}>Demo</span>
          <p className={cn(tituloBloque, 'min-w-0 flex-1')}>Listas: qué se compone y para qué sirve key</p>
        </div>
        <div className="space-y-4 p-4 sm:p-5">
          <Segmentado
            etiqueta="Experimento"
            opciones={[
              { valor: 'compone', texto: '1. Qué se compone' },
              { valor: 'key', texto: '2. Para qué sirve key' },
            ]}
            valor={pestana}
            onCambio={(v) => {
              setPestana(v);
              setAviso('');
            }}
          />
          {pestana === 'compone' ? <Composicion anunciar={setAviso} /> : <Claves anunciar={setAviso} />}
          <p className="sr-only" aria-live="polite">
            {aviso}
          </p>
        </div>
      </section>
    </MotionConfig>
  );
}
