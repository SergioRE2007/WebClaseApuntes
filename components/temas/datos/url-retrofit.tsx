'use client';

import { useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/cn';
import {
  avisoCaja,
  avisoTexto,
  bloque,
  cabecera,
  etiqueta,
  malCaja,
  malTexto,
  okCaja,
  okTexto,
  tituloBloque,
} from '@/components/interactive/estilos';
import { Opciones } from './opciones';

const BASES = [
  { valor: 'https://pokeapi.co/api/v2/', texto: 'https://pokeapi.co/api/v2/', codigo: true },
  { valor: 'https://pokeapi.co/api/v2', texto: 'https://pokeapi.co/api/v2', codigo: true },
] as const;

const RUTAS = [
  { valor: 'pokemon/{name}', texto: 'pokemon/{name}', codigo: true },
  { valor: '/pokemon/{name}', texto: '/pokemon/{name}', codigo: true },
] as const;

type Resultado =
  | { tipo: 'error'; mensaje: string }
  | { tipo: 'ok'; origen: string; camino: string; ruta: string }
  | { tipo: 'perdido'; origen: string; perdido: string; ruta: string };

/** Imita cómo Retrofit junta la baseUrl y la ruta de @GET (HttpUrl.resolve). */
function resolver(base: string, ruta: string, valor: string): Resultado {
  if (!base.endsWith('/')) {
    return { tipo: 'error', mensaje: `IllegalArgumentException: baseUrl must end in /: ${base}` };
  }
  const url = new URL(base);
  const rutaFinal = ruta.replace('{name}', encodeURIComponent(valor));
  if (rutaFinal.startsWith('/')) {
    return { tipo: 'perdido', origen: url.origin, perdido: url.pathname.replace(/\/$/, ''), ruta: rutaFinal };
  }
  return { tipo: 'ok', origen: url.origin, camino: url.pathname, ruta: rutaFinal };
}

/**
 * Demo: cómo forma Retrofit la URL final a partir de la baseUrl y de la ruta
 * de @GET. Enseña el error de clase del 26/10 (baseUrl sin "/" final y rutas
 * que empiezan por "/").
 */
export function ConstructorUrlRetrofit({ titulo = 'De la baseUrl y el @GET a la URL final' }: { titulo?: string }) {
  const [base, setBase] = useState<string>(BASES[0].valor);
  const [ruta, setRuta] = useState<string>(RUTAS[0].valor);
  const [nombre, setNombre] = useState('pikachu');
  const reducir = useReducedMotion();
  const idNombre = useId();

  const valor = nombre.trim();
  const res = valor ? resolver(base, ruta, valor) : null;
  const clave = res ? `${res.tipo}-${base}-${ruta}` : 'vacio';

  return (
    <section aria-label={titulo} className={bloque}>
      <div className={cabecera}>
        <span className={etiqueta}>Demo</span>
        <p className={cn(tituloBloque, 'min-w-0 flex-1')}>{titulo}</p>
      </div>

      <div className="grid gap-4 px-4 py-4 sm:px-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Opciones leyenda="baseUrl en el NetworkModule" opciones={BASES} valor={base} onCambio={setBase} />
          <Opciones leyenda="Ruta en @GET" opciones={RUTAS} valor={ruta} onCambio={setRuta} />
        </div>

        <div className="grid gap-1.5">
          <label htmlFor={idNombre} className="text-xs font-medium text-fd-muted-foreground">
            Valor de <code>@Path(&quot;name&quot;)</code>
          </label>
          <input
            id={idNombre}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            className="min-h-10 w-full max-w-xs rounded-md border bg-fd-background px-3 py-1.5 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring sm:min-h-8"
          />
        </div>

        <pre
          tabIndex={0}
          aria-label="Código de Retrofit con las opciones elegidas"
          className="overflow-x-auto rounded-md border bg-fd-muted/40 p-3 font-mono text-[0.8125rem] leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
        >
          <code>
            <span className="text-fd-muted-foreground">{'// NetworkModule.kt'}</span>
            {'\nRetrofit.Builder()\n    .baseUrl("'}
            <span className="font-semibold text-fd-foreground">{base}</span>
            {'")\n\n'}
            <span className="text-fd-muted-foreground">{'// PokeApi.kt'}</span>
            {'\n@GET("'}
            <span className="font-semibold text-fd-foreground">{ruta}</span>
            {'")\nsuspend fun readPokemonByName(@Path("name") name: String): Response<PokemonResult>\n\n'}
            <span className="text-fd-muted-foreground">{'// La llamada'}</span>
            {'\napi.readPokemonByName("'}
            <span className="font-semibold text-fd-foreground">{nombre}</span>
            {'")'}
          </code>
        </pre>

        <div aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={clave}
              initial={reducir ? { opacity: 0 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducir ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: reducir ? 0.1 : 0.2 }}
            >
              {!res && <p className="text-sm text-fd-muted-foreground">Escribe un nombre de pokémon (en minúsculas, como los da la API).</p>}

              {res?.tipo === 'error' && (
                <div className={cn('rounded-md border px-3 py-2.5 text-sm', malCaja)}>
                  <p className={cn('font-medium', malTexto)}>La app se cae al crear Retrofit</p>
                  <p className="mt-1 break-all font-mono text-[0.8125rem]">{res.mensaje}</p>
                  <p className="mt-1.5 text-fd-muted-foreground">
                    Salta en <code>.baseUrl(...)</code>, cuando Hilt ejecuta el <code>@Provides</code> del <code>NetworkModule</code>. No llega a hacerse ninguna petición.
                  </p>
                </div>
              )}

              {res && res.tipo !== 'error' && (
                <div className={cn('rounded-md border px-3 py-2.5 text-sm', res.tipo === 'ok' ? okCaja : avisoCaja)}>
                  <p className={cn('font-medium', res.tipo === 'ok' ? okTexto : avisoTexto)}>
                    {res.tipo === 'ok' ? 'Petición correcta' : 'Compila y se lanza, pero a la URL equivocada'}
                  </p>
                  <p className="mt-1 break-all font-mono text-[0.8125rem]">
                    <span className="text-fd-muted-foreground">GET </span>
                    <span>{res.origen}</span>
                    {res.tipo === 'ok' ? (
                      <span className="underline decoration-fd-primary decoration-2 underline-offset-4">{res.camino}</span>
                    ) : (
                      <span className="text-fd-muted-foreground line-through">{res.perdido}</span>
                    )}
                    <span className="font-semibold">{res.ruta}</span>
                  </p>
                  <p className="mt-1.5 text-fd-muted-foreground">
                    {res.tipo === 'ok' ? (
                      <>La ruta se añade detrás de <code>/api/v2/</code>. Es la combinación que queda en clase el 09/11.</>
                    ) : (
                      <>
                        Una ruta que empieza por <code>/</code> se cuelga de la raíz del dominio y se pierde <code>{res.perdido}</code>: esa URL no es la de la API y no devuelve el JSON del pokémon.
                      </>
                    )}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
