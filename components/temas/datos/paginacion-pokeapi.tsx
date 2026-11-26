'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { bloque, botonSecundario, cabecera, etiqueta, tituloBloque } from '@/components/interactive/estilos';
import { Opciones } from './opciones';

/** Los 151 primeros nombres tal como los devuelve PokeAPI. */
const NOMBRES = (
  'bulbasaur ivysaur venusaur charmander charmeleon charizard squirtle wartortle blastoise caterpie ' +
  'metapod butterfree weedle kakuna beedrill pidgey pidgeotto pidgeot rattata raticate ' +
  'spearow fearow ekans arbok pikachu raichu sandshrew sandslash nidoran-f nidorina ' +
  'nidoqueen nidoran-m nidorino nidoking clefairy clefable vulpix ninetales jigglypuff wigglytuff ' +
  'zubat golbat oddish gloom vileplume paras parasect venonat venomoth diglett ' +
  'dugtrio meowth persian psyduck golduck mankey primeape growlithe arcanine poliwag ' +
  'poliwhirl poliwrath abra kadabra alakazam machop machoke machamp bellsprout weepinbell ' +
  'victreebel tentacool tentacruel geodude graveler golem ponyta rapidash slowpoke slowbro ' +
  'magnemite magneton farfetchd doduo dodrio seel dewgong grimer muk shellder ' +
  'cloyster gastly haunter gengar onix drowzee hypno krabby kingler voltorb ' +
  'electrode exeggcute exeggutor cubone marowak hitmonlee hitmonchan lickitung koffing weezing ' +
  'rhyhorn rhydon chansey tangela kangaskhan horsea seadra goldeen seaking staryu ' +
  'starmie mr-mime scyther jynx electabuzz magmar pinsir tauros magikarp gyarados ' +
  'lapras ditto eevee vaporeon jolteon flareon porygon omanyte omastar kabuto ' +
  'kabutops aerodactyl snorlax articuno zapdos moltres dratini dragonair dragonite mewtwo ' +
  'mew'
).split(' ');

const BASE = 'https://pokeapi.co/api/v2/pokemon/';
const LIMITES = [
  { valor: 5, texto: 'limit=5' },
  { valor: 10, texto: 'limit=10' },
  { valor: 20, texto: 'limit=20' },
] as const;

function enlace(offset: number, limit: number) {
  return `${BASE}?offset=${offset}&limit=${limit}`;
}

/**
 * Demo: paginación de PokeAPI con limit y offset. Se siguen los enlaces next y
 * previous de la respuesta, como haría una app que carga página a página.
 */
export function PaginacionPokeApi({ titulo = 'Paginar el listado con limit y offset' }: { titulo?: string }) {
  const [limit, setLimit] = useState<number>(20);
  const [offset, setOffset] = useState(0);
  const reducir = useReducedMotion();

  const count = NOMBRES.length;
  const next = offset + limit < count ? enlace(offset + limit, limit) : null;
  const previous = offset > 0 ? enlace(Math.max(0, offset - limit), limit) : null;
  const results = NOMBRES.slice(offset, offset + limit).map((name, i) => ({ name, url: `${BASE}${offset + i + 1}/` }));

  const cambiarLimit = (l: number) => {
    setLimit(l);
    setOffset((o) => Math.min(o, Math.max(0, count - 1)));
  };

  return (
    <section aria-label={titulo} className={bloque}>
      <div className={cabecera}>
        <span className={etiqueta}>Demo</span>
        <p className={cn(tituloBloque, 'min-w-0 flex-1')}>{titulo}</p>
      </div>

      <div className="grid gap-4 px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
          <Opciones leyenda="Tamaño de página" opciones={LIMITES} valor={limit} onCambio={cambiarLimit} />
          <div className="flex flex-wrap gap-2">
            <button type="button" className={botonSecundario} disabled={!previous} onClick={() => setOffset(Math.max(0, offset - limit))}>
              <ChevronLeft className="size-4" aria-hidden />
              Seguir <code>previous</code>
            </button>
            <button type="button" className={botonSecundario} disabled={!next} onClick={() => setOffset(offset + limit)}>
              Seguir <code>next</code>
              <ChevronRight className="size-4" aria-hidden />
            </button>
            <button type="button" className={botonSecundario} disabled={offset === 0} onClick={() => setOffset(0)}>
              <RotateCcw className="size-3.5" aria-hidden />
              Primera página
            </button>
          </div>
        </div>

        <p className="break-all font-mono text-[0.8125rem]" aria-live="polite">
          <span className="text-fd-muted-foreground">GET </span>
          {enlace(offset, limit)}
        </p>

        <pre
          tabIndex={0}
          aria-label="Respuesta JSON del listado"
          className="max-h-80 overflow-auto rounded-md border bg-fd-muted/40 p-3 font-mono text-[0.8125rem] leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
        >
          <code>
            {'{\n  "count": '}
            <span className="font-semibold">{count}</span>
            {',\n  "next": '}
            <span className={cn(next ? 'text-fd-foreground' : 'text-fd-muted-foreground')}>{next ? `"${next}"` : 'null'}</span>
            {',\n  "previous": '}
            <span className={cn(previous ? 'text-fd-foreground' : 'text-fd-muted-foreground')}>{previous ? `"${previous}"` : 'null'}</span>
            {',\n  "results": [\n'}
            <span key={`${offset}-${limit}`} className="block">
              {results.map((r, i) => (
                <motion.span
                  key={r.name}
                  className="block"
                  initial={reducir ? { opacity: 0 } : { opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: reducir ? 0.1 : 0.18, delay: reducir ? 0 : Math.min(i, 10) * 0.02 }}
                >
                  {'    { "name": '}
                  <span className="font-semibold">{`"${r.name}"`}</span>
                  {`, "url": "${r.url}" }${i < results.length - 1 ? ',' : ''}`}
                </motion.span>
              ))}
            </span>
            {'  ]\n}'}
          </code>
        </pre>

        <p className="text-sm text-fd-muted-foreground">
          Esta página trae {results.length} nombres, pero ninguna imagen. Para pintarlos con su foto, como hace <code>readAllPokemon()</code> en clase, hacen falta 1 petición del listado + {results.length} de detalle = <strong className="text-fd-foreground">{results.length + 1} peticiones</strong>.
        </p>
        <p className="text-xs text-fd-muted-foreground">
          Simulación con los 151 primeros pokémon, así que aquí <code>count</code> vale 151. En Postman, en clase, la API real devolvió <code>count: 1351</code>. Las URLs de <code>next</code> y <code>previous</code> siguen el formato que se vio allí.
        </p>
      </div>
    </section>
  );
}
