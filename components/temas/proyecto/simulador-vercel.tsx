'use client';

import { useState, type ReactNode } from 'react';
import { motion, MotionConfig, useReducedMotion } from 'motion/react';
import { RotateCw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { bloque, botonSecundario, cabecera, etiqueta, tituloBloque, malTexto, okTexto } from '@/components/interactive/estilos';

/*
 * Simula qué responde Vercel al abrir una URL de una SPA de Angular según la
 * Output Directory y si hay o no rewrite en vercel.json. Enseña la diferencia
 * entre navegar con un enlace (lo resuelve el Router de Angular, sin pedir
 * nada al servidor) y recargar o pegar la URL (petición nueva a Vercel).
 */

type Salida = 'browser' | 'dist';
type Origen = 'servidor' | 'enlace';

interface Linea {
  texto: string;
  tipo?: 'ok' | 'mal' | 'normal';
}

interface Resultado {
  lineas: Linea[];
  pagina: string | null; // ruta que pinta Angular, o null si es el 404 de Vercel
  url: string;
}

const PROYECTO = 'proyecto-rutas';
const DOMINIO = 'tu-proyecto.vercel.app';

const RUTAS: { url: string; nombre: string }[] = [
  { url: '/', nombre: '/' },
  { url: '/inicio', nombre: '/inicio' },
  { url: '/aula/materiales', nombre: '/aula/materiales' },
  { url: '/ayuda', nombre: '/ayuda' },
];

const PAGINAS: Record<string, { titulo: string; texto: string }> = {
  '/inicio': { titulo: 'Inicio', texto: 'InicioComponent' },
  '/aula/materiales': { titulo: 'Aula virtual > Materiales', texto: 'AulaComponent con MaterialesComponent en su router-outlet' },
  '/ayuda': { titulo: 'Ayuda', texto: 'AyudaComponent' },
};

function resolverEnAngular(url: string, lineas: Linea[]): string {
  if (url === '/') {
    lineas.push({ texto: "Angular Router: la ruta '' tiene redirectTo '/inicio' (pathMatch: 'full')." });
    url = '/inicio';
  }
  lineas.push({ texto: `Angular Router pinta ${PAGINAS[url]?.texto ?? 'la página'}.`, tipo: 'ok' });
  return url;
}

function pedirAlServidor(url: string, salida: Salida, rewrite: boolean): Resultado {
  const carpeta = salida === 'browser' ? `dist/${PROYECTO}/browser` : 'dist';
  const hayIndex = salida === 'browser';
  const lineas: Linea[] = [{ texto: `Navegador → Vercel: GET ${url}` }];

  // Vercel primero busca un archivo real en la carpeta publicada.
  if (url === '/') {
    if (hayIndex) {
      lineas.push({ texto: `Vercel encuentra index.html en ${carpeta} y lo sirve (200).`, tipo: 'ok' });
      lineas.push({ texto: 'El navegador descarga main-*.js y Angular arranca.' });
      return { lineas, pagina: resolverEnAngular(url, lineas), url: '/inicio' };
    }
    lineas.push({ texto: `En ${carpeta} no hay ningún index.html: está dentro de ${PROYECTO}/browser.`, tipo: 'mal' });
  } else {
    lineas.push({ texto: `En ${carpeta} no existe ningún archivo ${url}: esa ruta solo la conoce Angular.` });
  }

  if (rewrite) {
    lineas.push({ texto: 'vercel.json: el rewrite "/(.*)" → "/index.html" manda la petición a index.html.' });
    if (hayIndex) {
      lineas.push({ texto: 'Vercel sirve index.html (200) sin cambiar la URL.', tipo: 'ok' });
      lineas.push({ texto: 'Angular arranca y lee la URL del navegador.' });
      const final = resolverEnAngular(url, lineas);
      return { lineas, pagina: final, url: final };
    }
    lineas.push({ texto: `Tampoco existe /index.html en ${carpeta}.`, tipo: 'mal' });
  } else if (url !== '/') {
    lineas.push({ texto: 'No hay vercel.json con rewrite: Vercel no sabe qué hacer con esa ruta.', tipo: 'mal' });
  }
  lineas.push({ texto: 'Respuesta: 404: NOT_FOUND.', tipo: 'mal' });
  return { lineas, pagina: null, url };
}

function navegarConEnlace(url: string): Resultado {
  const lineas: Linea[] = [
    { texto: `Clic en routerLink="${url}".` },
    { texto: 'La app ya está cargada: Angular cambia la URL sin pedir nada a Vercel.' },
  ];
  const final = resolverEnAngular(url, lineas);
  return { lineas, pagina: final, url: final };
}

function Opcion({
  activa,
  onClick,
  children,
}: {
  activa: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={activa}
      onClick={onClick}
      className={cn(
        'min-h-9 rounded-md border px-2.5 py-1 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring',
        activa ? 'border-fd-primary bg-fd-primary/10 text-fd-foreground' : 'text-fd-muted-foreground hover:bg-fd-accent',
      )}
    >
      {children}
    </button>
  );
}

export function SimuladorVercel({ titulo = 'Qué hace Vercel cuando abres una ruta de tu SPA' }: { titulo?: string }) {
  const reducir = useReducedMotion() ?? false;
  const [salida, setSalida] = useState<Salida>('browser');
  const [rewrite, setRewrite] = useState(false);
  // n cuenta cada acción (para la traza); carga solo cuenta las peticiones a
  // Vercel: la app simulada se vuelve a montar (y parpadea) solo cuando hay una
  // carga de página real, no al navegar con un enlace.
  const [res, setRes] = useState<(Resultado & { origen: Origen; n: number; carga: number }) | null>(null);

  const abrir = (url: string) =>
    setRes((r) => ({ ...pedirAlServidor(url, salida, rewrite), origen: 'servidor', n: (r?.n ?? 0) + 1, carga: (r?.carga ?? 0) + 1 }));
  const enlace = (url: string) =>
    setRes((r) => ({ ...navegarConEnlace(url), origen: 'enlace', n: (r?.n ?? 0) + 1, carga: r?.carga ?? 0 }));
  const cambiarConfig = (fn: () => void) => {
    fn();
    setRes(null); // un cambio de configuración es un despliegue nuevo
  };

  const appCargada = res !== null && res.pagina !== null;
  const pagina = res?.pagina ? PAGINAS[res.pagina] : undefined;

  return (
    <MotionConfig reducedMotion="user">
      <section aria-label={titulo} className={bloque}>
        <div className={cabecera}>
          <span className={etiqueta}>Demo</span>
          <p className={cn(tituloBloque, 'min-w-0 flex-1')}>{titulo}</p>
        </div>

        <div className="space-y-4 px-4 py-4 sm:px-5">
          <div>
            <p className={etiqueta}>Output Directory en Vercel</p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              <Opcion activa={salida === 'browser'} onClick={() => cambiarConfig(() => setSalida('browser'))}>
                dist/{PROYECTO}/browser
              </Opcion>
              <Opcion activa={salida === 'dist'} onClick={() => cambiarConfig(() => setSalida('dist'))}>
                dist
              </Opcion>
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={rewrite}
              onChange={(e) => cambiarConfig(() => setRewrite(e.target.checked))}
              className="size-4 accent-[var(--color-fd-primary)]"
            />
            <span>
              Hay un <code>vercel.json</code> con el rewrite <code>/(.*)</code> → <code>/index.html</code>
            </span>
          </label>
          <div>
            <p className={etiqueta}>Escribe la URL en la barra (o recarga con F5)</p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {RUTAS.map((r) => (
                <button key={r.url} type="button" className={cn(botonSecundario, 'font-mono text-xs')} onClick={() => abrir(r.url)}>
                  <RotateCw className="size-3.5" aria-hidden />
                  {r.nombre}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Navegador simulado */}
        <div className="mx-4 mb-4 overflow-hidden rounded-md border sm:mx-5">
          <div className="flex items-center gap-2 border-b bg-fd-muted/50 px-3 py-1.5">
            <span className="flex gap-1" aria-hidden>
              <span className="size-2 rounded-full bg-fd-muted-foreground/30" />
              <span className="size-2 rounded-full bg-fd-muted-foreground/30" />
              <span className="size-2 rounded-full bg-fd-muted-foreground/30" />
            </span>
            <p className="min-w-0 flex-1 truncate rounded border bg-fd-background px-2 py-0.5 font-mono text-xs">
              https://{DOMINIO}
              {res ? (res.url === '/' ? '' : res.url) : ''}
            </p>
          </div>
          <div className="min-h-36 px-4 py-4" aria-live="polite">
            {!res ? (
              <p className="text-sm text-fd-muted-foreground">Elige una URL para abrirla.</p>
            ) : res.pagina === null ? (
              <motion.div key={res.carga} initial={reducir ? false : { opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="font-mono text-lg font-semibold">404: NOT_FOUND</p>
                <p className="mt-1 text-sm text-fd-muted-foreground">Página de error de Vercel. Tu app de Angular ni siquiera ha llegado a cargarse.</p>
              </motion.div>
            ) : (
              <motion.div key={res.carga} initial={reducir ? false : { opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="flex flex-wrap items-baseline justify-between gap-x-3 text-base font-semibold">
                  Portal educativo
                  <span className="text-xs font-normal text-fd-muted-foreground">
                    {res.origen === 'enlace' ? 'Navegación con routerLink: sin recargar' : 'Página cargada desde Vercel'}
                  </span>
                </p>
                <nav className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm" aria-label="Enlaces de la app simulada">
                  {['/inicio', '/aula/materiales', '/ayuda'].map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => enlace(u)}
                      className={cn(
                        'rounded underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring',
                        res.pagina === u ? 'font-medium text-fd-primary' : 'text-fd-muted-foreground',
                      )}
                    >
                      {PAGINAS[u]?.titulo}
                    </button>
                  ))}
                </nav>
                <div className="mt-3 border-t pt-3">
                  <p className="text-sm font-medium">{pagina?.titulo}</p>
                  <p className="text-xs text-fd-muted-foreground">{pagina?.texto}</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {res ? (
          <ol key={res.n} className="space-y-1 border-t px-4 py-3 font-mono text-xs sm:px-5" aria-label="Qué ha pasado">
            {res.lineas.map((l, i) => (
              <motion.li
                key={`${res.n}-${i}`}
                initial={reducir ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reducir ? 0 : i * 0.18, duration: 0.25 }}
                className={cn(
                  'flex gap-2',
                  l.tipo === 'ok' && okTexto,
                  l.tipo === 'mal' && malTexto,
                  (!l.tipo || l.tipo === 'normal') && 'text-fd-muted-foreground',
                )}
              >
                <span className="select-none tabular-nums opacity-60">{i + 1}.</span>
                <span className="min-w-0">{l.texto}</span>
              </motion.li>
            ))}
          </ol>
        ) : null}
        <p className="border-t px-4 py-2.5 text-xs text-fd-muted-foreground sm:px-5">
          {appCargada
            ? 'Prueba ahora los enlaces de la app: no hacen ninguna petición a Vercel. Después recarga una ruta interna con y sin rewrite.'
            : 'Consejo: empieza por / con la Output Directory buena, y luego recarga /aula/materiales con y sin rewrite.'}
        </p>
      </section>
    </MotionConfig>
  );
}
