'use client';

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { LayoutGroup, motion, MotionConfig, useReducedMotion } from 'motion/react';
import { ChevronLeft, ChevronRight, RotateCcw, Tag } from 'lucide-react';
import { cn } from '@/lib/cn';
import { bloque, botonPrimario, botonSecundario, cabecera, etiqueta, tituloBloque } from '@/components/interactive/estilos';

/*
 * Grafo de Git en vertical, como lo pinta la extensión Git Graph: el commit
 * más nuevo arriba, un carril por rama y las etiquetas (ramas, tags, HEAD) a
 * la derecha de cada commit. Dos demos:
 *  - HistorialVersiones: el repositorio de referencia del backend, un tag por
 *    versión. Al hacer checkout de un tag antiguo, HEAD queda separado y los
 *    commits posteriores "no están incluidos en HEAD".
 *  - RamaDeTrabajo: la secuencia del 18/11 (rama de refactor, commit, push,
 *    Preview de Vercel y PR de revisión), paso a paso.
 */

const FILA = 32;
const CARRIL = 18;
const X0 = 12;

type TipoChip = 'rama' | 'remota' | 'head' | 'tag' | 'despliegue' | 'pr';

interface Chip {
  texto: string;
  tipo: TipoChip;
  /** Si se da, el chip se desplaza animado cuando cambia de fila. */
  id?: string;
}

interface FilaGrafo {
  id: string;
  carril: number;
  padres: string[];
  visible?: boolean;
  atenuado?: boolean;
  resaltado?: boolean;
}

const xCarril = (c: number) => X0 + c * CARRIL;
const yFila = (i: number) => i * FILA + FILA / 2;

// Carril 0: la rama principal (gris). Carril 1: la rama de trabajo (acento).
const trazoCarril = ['stroke-fd-muted-foreground', 'stroke-fd-primary'];

function LineasGrafo({ filas, reducir }: { filas: FilaGrafo[]; reducir: boolean }) {
  const indice = new Map(filas.map((f, i) => [f.id, i]));
  const maxCarril = Math.max(0, ...filas.map((f) => f.carril));
  const ancho = X0 * 2 + maxCarril * CARRIL;
  const alto = filas.length * FILA;

  return (
    <svg width={ancho} height={alto} className="shrink-0 overflow-visible" aria-hidden>
      {filas.map((f, i) =>
        f.visible === false
          ? null
          : f.padres.map((p) => {
              const j = indice.get(p);
              const padre = j === undefined ? undefined : filas[j];
              if (j === undefined || !padre || padre.visible === false) return null;
              const x1 = xCarril(f.carril);
              const y1 = yFila(i);
              const x2 = xCarril(padre.carril);
              const y2 = yFila(j);
              const d =
                x1 === x2
                  ? `M ${x1} ${y1} L ${x2} ${y2}`
                  : `M ${x1} ${y1} L ${x1} ${y2 - FILA} C ${x1} ${y2 - FILA / 2}, ${x2} ${y2 - FILA / 2}, ${x2} ${y2}`;
              return (
                <motion.path
                  key={`${f.id}-${p}`}
                  d={d}
                  fill="none"
                  strokeWidth={2}
                  strokeLinecap="round"
                  className={trazoCarril[f.carril] ?? trazoCarril[0]}
                  initial={reducir ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1, opacity: f.atenuado ? 0.3 : 1 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                />
              );
            }),
      )}
      {filas.map((f, i) =>
        f.visible === false ? null : (
          <motion.circle
            key={f.id}
            cx={xCarril(f.carril)}
            cy={yFila(i)}
            r={f.resaltado ? 6 : 5}
            strokeWidth={2}
            className={cn(trazoCarril[f.carril] ?? trazoCarril[0], f.resaltado ? 'fill-fd-primary' : 'fill-fd-background')}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            initial={reducir ? false : { scale: 0 }}
            animate={{ scale: 1, opacity: f.atenuado ? 0.35 : 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 26 }}
          />
        ),
      )}
    </svg>
  );
}

const estiloChip: Record<TipoChip, string> = {
  rama: 'border-fd-foreground/30 text-fd-foreground',
  remota: 'border-dashed text-fd-muted-foreground',
  head: 'border-fd-primary bg-fd-primary text-fd-primary-foreground',
  tag: 'text-fd-muted-foreground',
  despliegue: 'border-fd-primary/40 text-fd-primary',
  pr: 'border-dashed border-fd-primary/60 text-fd-primary',
};

/**
 * `encoger`: en pantallas estrechas el chip se recorta con puntos suspensivos
 * (el nombre completo queda en `title` y en la terminal de la demo) en vez de
 * obligar a hacer scroll horizontal dentro de la fila.
 */
function ChipGit({ chip, encoger = false }: { chip: Chip; encoger?: boolean }) {
  const recortable = encoger && chip.tipo !== 'head';
  return (
    <motion.span
      layout="position"
      layoutId={chip.id}
      title={recortable ? chip.texto : undefined}
      className={cn(
        'inline-flex items-center gap-1 rounded border bg-fd-background px-1.5 py-px font-mono text-[11px] leading-4',
        recortable ? 'min-w-0 shrink' : 'shrink-0',
        estiloChip[chip.tipo],
      )}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
    >
      {chip.tipo === 'tag' ? <Tag className="size-3 shrink-0" aria-hidden /> : null}
      <span className={recortable ? 'min-w-0 truncate' : undefined}>{chip.texto}</span>
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
/* 1. Historial por versiones (tags)                                   */
/* ------------------------------------------------------------------ */

const VERSIONES: { tag: string; titulo: string; detalle: string }[] = [
  { tag: 'v0.1.0', titulo: 'Proyecto base', detalle: 'npm, TypeScript y la estructura de carpetas. Es el primer commit: no tiene padre (Parents: None).' },
  { tag: 'v0.2.0', titulo: 'Express básico', detalle: 'Servidor, middlewares y el endpoint /health.' },
  { tag: 'v0.3.0', titulo: 'PostgreSQL + Docker con Prisma', detalle: 'schema.prisma, migraciones y el cliente de la base de datos.' },
  { tag: 'v0.4.0', titulo: 'Validación con Zod', detalle: 'Schemas, el middleware validate y el CRUD de usuarios.' },
  { tag: 'v0.5.0', titulo: 'Módulo Auth', detalle: 'Registro, login, bcrypt y JWT.' },
  { tag: 'v0.6.0', titulo: 'Middleware de autenticación', detalle: 'JWT, rutas protegidas y /me.' },
  { tag: 'v0.7.0', titulo: 'Mejoras en Users', detalle: 'Actualizar el perfil y cambiar la contraseña.' },
  { tag: 'v0.8.0', titulo: 'Seguridad adicional', detalle: 'Rate limiting con express-rate-limit y logging con Winston.' },
  { tag: 'v0.9.0', titulo: 'Testing con Jest y Supertest', detalle: 'jest.config.js y los tests de auth y users.' },
  { tag: 'v1.0.0', titulo: 'Producción y documentación', detalle: 'Dockerfile, docker-compose.prod.yml y Swagger en /api-docs.' },
  { tag: 'v1.0.1', titulo: 'Swagger/OpenAPI completo', detalle: 'Documentación de todas las rutas.' },
  { tag: 'v1.0.2', titulo: 'De ts-node a tsx', detalle: 'Para que los ES Modules funcionen bien.' },
  { tag: 'v1.1.0', titulo: 'Subida de archivos con Cloudinary', detalle: 'El módulo media.' },
  { tag: 'v1.1.1', titulo: 'Variables de Cloudinary', detalle: 'En env.production.example.' },
  { tag: 'v1.1.2', titulo: 'Errores de TypeScript en media', detalle: 'Arreglos del módulo media.' },
  { tag: 'v1.1.3', titulo: 'Swagger con todos los endpoints', detalle: 'La última versión del repositorio.' },
];

export function HistorialVersiones({ titulo = 'Recorre las versiones del backend de referencia' }: { titulo?: string }) {
  const reducir = useReducedMotion() ?? false;
  const grupo = useId();
  const ultimo = VERSIONES.length - 1;
  // null = HEAD apunta a la rama main (en la punta). Un número = checkout de ese tag.
  const [checkout, setCheckout] = useState<number | null>(null);
  const actual = checkout ?? ultimo;
  const separado = checkout !== null;
  const fueraDeHead = ultimo - actual;
  const v = VERSIONES[actual] ?? VERSIONES[ultimo]!;
  const lista = useRef<HTMLOListElement>(null);

  // Más nuevo arriba.
  const orden = VERSIONES.map((_, i) => ultimo - i);
  const filas: FilaGrafo[] = orden.map((i) => ({
    id: `c${i}`,
    carril: 0,
    padres: i > 0 ? [`c${i - 1}`] : [],
    atenuado: i > actual,
    resaltado: i === actual,
  }));

  // Ir a la punta es volver a la rama main (HEAD deja de estar separado).
  const elegir = (i: number) => setCheckout(i >= ultimo ? null : Math.max(0, i));

  // Con el teclado, el foco acompaña a la versión elegida (la lista va del
  // más nuevo al más antiguo, así que la versión i está en la posición ultimo - i).
  const elegirConFoco = (i: number) => {
    const destino = Math.max(0, Math.min(ultimo, i));
    elegir(destino);
    lista.current?.querySelectorAll<HTMLButtonElement>('button')[ultimo - destino]?.focus();
  };

  const teclas = (e: KeyboardEvent<HTMLOListElement>) => {
    if (e.key === 'ArrowUp' && actual < ultimo) {
      e.preventDefault();
      elegirConFoco(actual + 1);
    } else if (e.key === 'ArrowDown' && actual > 0) {
      e.preventDefault();
      elegirConFoco(actual - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      elegirConFoco(ultimo);
    } else if (e.key === 'End') {
      e.preventDefault();
      elegirConFoco(0);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <section aria-label={titulo} className={cn(bloque, '@container')}>
        <div className={cabecera}>
          <span className={etiqueta}>Demo</span>
          <p className={cn(tituloBloque, 'min-w-0 flex-1')}>{titulo}</p>
        </div>

        <div className="grid @2xl:grid-cols-[minmax(0,1fr)_15rem]">
          <LayoutGroup id={grupo}>
            <div className="flex min-w-0 px-3 py-3 sm:px-4">
              <LineasGrafo filas={filas} reducir={reducir} />
              <ol
                ref={lista}
                className="min-w-0 flex-1"
                aria-label="Commits del repositorio, del más nuevo al más antiguo. Flechas arriba y abajo para cambiar de versión."
                onKeyDown={teclas}
              >
                {orden.map((i) => {
                  const ver = VERSIONES[i]!;
                  const chips: Chip[] = [];
                  if (i === actual) chips.push({ texto: separado ? 'HEAD' : 'HEAD → main', tipo: 'head', id: 'head' });
                  if (i === ultimo) {
                    if (separado) chips.push({ texto: 'main', tipo: 'rama' });
                    chips.push({ texto: 'origin/main', tipo: 'remota' });
                  }
                  chips.push({ texto: ver.tag, tipo: 'tag' });
                  return (
                    <li key={ver.tag} style={{ height: FILA }} className="flex min-w-0 items-center">
                      <button
                        type="button"
                        onClick={() => elegir(i)}
                        aria-current={i === actual ? 'true' : undefined}
                        className={cn(
                          'flex h-full min-w-0 flex-1 items-center gap-1.5 rounded-md px-2 text-left text-sm transition-colors hover:bg-fd-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring',
                          i > actual && 'text-fd-muted-foreground/70',
                        )}
                      >
                        {chips.map((c) => (
                          <ChipGit key={c.id ?? c.texto} chip={c} />
                        ))}
                        <span className={cn('min-w-0 truncate', i === actual && 'font-medium')}>{ver.titulo}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          </LayoutGroup>

          <div className="border-t px-4 py-4 text-sm @2xl:border-l @2xl:border-t-0" aria-live="polite">
            <p className={etiqueta}>Checkout Branch/Tag…</p>
            <p className="mt-1 font-mono text-sm font-semibold">{separado ? v.tag : 'main'}</p>
            <p className="mt-2 text-fd-muted-foreground">
              <span className="font-medium text-fd-foreground">{v.tag}:</span> {v.titulo}. {v.detalle}
            </p>
            {separado ? (
              <p className="mt-3 rounded-md border border-dashed px-3 py-2 text-xs text-fd-muted-foreground">
                HEAD separado (detached). Los {fueraDeHead} {fueraDeHead === 1 ? 'commit de arriba no está' : 'commits de arriba no están'}{' '}
                incluidos en HEAD: estás viendo el código tal como era en {v.tag}.
              </p>
            ) : (
              <p className="mt-3 text-xs text-fd-muted-foreground">HEAD apunta a la rama main: ves la última versión.</p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className={botonSecundario}
                onClick={() => elegir(actual - 1)}
                disabled={actual === 0}
              >
                <ChevronLeft className="size-4" aria-hidden />
                Anterior
              </button>
              <button
                type="button"
                className={botonSecundario}
                onClick={() => elegir(actual + 1)}
                disabled={actual === ultimo}
              >
                Siguiente
                <ChevronRight className="size-4" aria-hidden />
              </button>
              <button type="button" className={botonSecundario} onClick={() => setCheckout(null)} disabled={!separado}>
                <RotateCcw className="size-3.5" aria-hidden />
                Volver a main
              </button>
            </div>
          </div>
        </div>
        <p className="border-t px-4 py-2.5 text-xs text-fd-muted-foreground sm:px-5">
          Historial simplificado: un commit por versión. En el repositorio real hay además commits sueltos de documentación y la rama{' '}
          <code>vercel-deployment</code>.
        </p>
      </section>
    </MotionConfig>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Rama de trabajo, push, Preview y PR (18/11)                      */
/* ------------------------------------------------------------------ */

interface PasoRama {
  titulo: string;
  comandos: string[];
  salida: string[];
  texto: ReactNode;
  visibles: string[];
  chips: Record<string, Chip[]>;
}

const FILAS_RAMA: Omit<FilaGrafo, 'visible'>[] = [
  { id: 'b1', carril: 1, padres: ['m2'] },
  { id: 'm2', carril: 0, padres: ['m1'] },
  { id: 'm1', carril: 0, padres: [] },
];

const TEXTO_FILA: Record<string, string> = {
  b1: 'commit "." (el refactor y vercel.json)',
  m2: 'master: el formulario con ngModel',
  m1: 'commits anteriores',
};

const HEAD = (texto: string): Chip => ({ texto, tipo: 'head', id: 'head' });
const MASTER: Chip = { texto: 'master', tipo: 'rama', id: 'master' };
const RAMA: Chip = { texto: 'refactor/reactive-form2', tipo: 'rama', id: 'rama' };

const PASOS_RAMA: PasoRama[] = [
  {
    titulo: 'Volver a la rama estable',
    comandos: ['git branch', 'git switch master'],
    salida: ['  master', '* refactor/reactive-form', "Switched to branch 'master'"],
    texto: (
      <>
        <code>git branch</code> lista las ramas (la del asterisco es la actual). Ya existía <code>refactor/reactive-form</code> con el
        refactor hecho; para repetirlo en directo, el profesor vuelve a <code>master</code>.
      </>
    ),
    visibles: ['m1', 'm2'],
    chips: { m2: [HEAD('HEAD'), MASTER] },
  },
  {
    titulo: 'Crear la rama del refactor',
    comandos: ['git switch -c refactor/reactive-form2'],
    salida: ["Switched to a new branch 'refactor/reactive-form2'"],
    texto: (
      <>
        <code>switch -c</code> crea la rama <strong>en el commit actual</strong> y se cambia a ella. Todavía no hay ningún commit nuevo: las
        dos ramas apuntan al mismo sitio.
      </>
    ),
    visibles: ['m1', 'm2'],
    chips: { m2: [HEAD('HEAD'), RAMA, MASTER] },
  },
  {
    titulo: 'Trabajar y hacer commit',
    comandos: ['git add -A .', 'git commit -m "."'],
    salida: ['[refactor/reactive-form2 52bc022] .', ' 3 files changed, 63 insertions(+), 36 deletions(-)', ' create mode 100644 vercel.json'],
    texto: (
      <>
        El commit nuevo solo mueve la rama actual: <code>master</code> se queda donde estaba. El mensaje <code>"."</code> es el de la demo; la
        guía pide <code>refactor: migrate game form to reactive forms</code>.
      </>
    ),
    visibles: ['m1', 'm2', 'b1'],
    chips: { b1: [HEAD('HEAD'), RAMA], m2: [MASTER] },
  },
  {
    titulo: 'Subir la rama a GitHub',
    comandos: ['git push origin refactor/reactive-form2'],
    salida: [' * [new branch]      refactor/reactive-form2 -> refactor/reactive-form2'],
    texto: (
      <>
        Aparece la rama remota <code>origin/refactor/reactive-form2</code> y GitHub responde con el enlace para crear la Pull Request. Con la
        guía: <code>git push -u origin feature/reactive-forms</code>.
      </>
    ),
    visibles: ['m1', 'm2', 'b1'],
    chips: {
      b1: [HEAD('HEAD'), RAMA, { texto: 'origin/refactor/reactive-form2', tipo: 'remota', id: 'origin-rama' }],
      m2: [MASTER, { texto: 'origin/master', tipo: 'remota' }],
    },
  },
  {
    titulo: 'Vercel: Production y Preview',
    comandos: ['(vercel.com) Add New → Project → Import → Deploy'],
    salida: ['Deployed to Production in 30 seconds'],
    texto: (
      <>
        La rama principal se publica en <strong>Production</strong>. Cada push de otra rama crea una <strong>Preview</strong> con su propia URL
        (en el panel, Recent Previews).
      </>
    ),
    visibles: ['m1', 'm2', 'b1'],
    chips: {
      b1: [HEAD('HEAD'), RAMA, { texto: 'Preview', tipo: 'despliegue', id: 'preview' }],
      m2: [MASTER, { texto: 'Production', tipo: 'despliegue', id: 'production' }],
    },
  },
  {
    titulo: 'PR de revisión (se deja abierta)',
    comandos: ['(GitHub) base: main  ←  compare: feature/reactive-forms'],
    salida: ['Pull Request "Refactorizar: formularios reactivos" abierta'],
    texto: (
      <>
        Paso E de la guía: en <em>Files changed</em> se revisan los cambios. La PR <strong>no se fusiona</strong>: se deja abierta para la
        revisión. Producción sigue en la rama principal.
      </>
    ),
    visibles: ['m1', 'm2', 'b1'],
    chips: {
      b1: [HEAD('HEAD'), RAMA, { texto: 'Preview', tipo: 'despliegue', id: 'preview' }, { texto: 'PR abierta', tipo: 'pr', id: 'pr' }],
      m2: [MASTER, { texto: 'Production', tipo: 'despliegue', id: 'production' }],
    },
  },
];

export function RamaDeTrabajo({ titulo = 'Una rama por refactor: del switch a la Preview' }: { titulo?: string }) {
  const reducir = useReducedMotion() ?? false;
  const grupo = useId();
  const [paso, setPaso] = useState(0);
  const total = PASOS_RAMA.length;
  const p = PASOS_RAMA[paso] ?? PASOS_RAMA[0]!;

  const filas: FilaGrafo[] = FILAS_RAMA.map((f) => ({ ...f, visible: p.visibles.includes(f.id) }));
  const ir = (n: number) => setPaso(Math.max(0, Math.min(total - 1, n)));

  const teclas = (e: KeyboardEvent<HTMLElement>) => {
    if (e.target instanceof HTMLButtonElement && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      ir(paso + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      ir(paso - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      ir(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      ir(total - 1);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <section aria-label={titulo} className={bloque} onKeyDown={teclas}>
        <div className={cabecera}>
          <span className={etiqueta}>Demo</span>
          <p className={cn(tituloBloque, 'min-w-0 flex-1')}>{titulo}</p>
          <span className={cn(etiqueta, 'tabular-nums')}>
            Paso {paso + 1} de {total}
          </span>
        </div>

        <LayoutGroup id={grupo}>
          <div className="flex min-w-0 px-3 pb-2 pt-3 sm:px-4">
            <LineasGrafo filas={filas} reducir={reducir} />
            <ol className="min-w-0 flex-1" aria-label="Grafo de commits, del más nuevo al más antiguo">
              {filas.map((f) => (
                <li key={f.id} style={{ height: FILA }} className="flex min-w-0 items-center gap-1.5 overflow-hidden px-2">
                  {f.visible ? (
                    <>
                      {(p.chips[f.id] ?? []).map((c) => (
                        <ChipGit key={c.id ?? c.texto} chip={c} encoger />
                      ))}
                      <motion.span
                        className="min-w-0 shrink-[4] truncate text-sm text-fd-muted-foreground"
                        initial={reducir ? false : { opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        {TEXTO_FILA[f.id]}
                      </motion.span>
                    </>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </LayoutGroup>

        <div className="mx-3 mb-3 overflow-x-auto rounded-md border bg-fd-muted/50 px-3 py-2.5 font-mono text-xs leading-5 sm:mx-4">
          <motion.div key={paso} initial={reducir ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
            {p.comandos.map((c) => (
              <p key={c} className="whitespace-pre text-fd-foreground">
                <span className="select-none text-fd-muted-foreground">$ </span>
                {c}
              </p>
            ))}
            {p.salida.map((s) => (
              <p key={s} className="whitespace-pre text-fd-muted-foreground">
                {s}
              </p>
            ))}
          </motion.div>
        </div>

        <div className="border-t px-4 py-3 sm:px-5" aria-live="polite">
          <p className="text-sm font-semibold">{p.titulo}</p>
          <p className="mt-1 text-sm text-fd-muted-foreground">{p.texto}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t px-4 py-3 sm:px-5">
          <button type="button" className={botonSecundario} onClick={() => ir(paso - 1)} disabled={paso === 0}>
            <ChevronLeft className="size-4" aria-hidden />
            Anterior
          </button>
          {paso < total - 1 ? (
            <button type="button" className={botonPrimario} onClick={() => ir(paso + 1)}>
              Siguiente
              <ChevronRight className="size-4" aria-hidden />
            </button>
          ) : (
            <button type="button" className={botonPrimario} onClick={() => ir(0)}>
              <RotateCcw className="size-3.5" aria-hidden />
              Otra vez
            </button>
          )}
          <div className="ml-auto flex gap-1" role="group" aria-label="Ir a un paso">
            {PASOS_RAMA.map((x, i) => (
              <button
                key={x.titulo}
                type="button"
                onClick={() => ir(i)}
                aria-label={`Paso ${i + 1}: ${x.titulo}`}
                aria-current={i === paso ? 'step' : undefined}
                className={cn(
                  'size-7 rounded-md border text-xs tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring',
                  i === paso ? 'border-fd-primary bg-fd-primary text-fd-primary-foreground' : 'hover:bg-fd-accent',
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
