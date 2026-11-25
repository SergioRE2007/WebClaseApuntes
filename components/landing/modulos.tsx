import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  Briefcase,
  Building2,
  CodeXml,
  Compass,
  Cpu,
  Database,
  DatabaseZap,
  FileCode2,
  Gamepad2,
  Languages,
  LayoutDashboard,
  Leaf,
  Rocket,
  Server,
  Smartphone,
  Sparkles,
  Wrench,
} from 'lucide-react';
import type { CursoResumen } from './cursos';
import { ModuloProgreso } from './modulo-progreso';
import { Reveal } from './reveal';

/** Icono de respaldo según el nombre del módulo, si su meta.json no define uno. */
function iconoPorNombre(nombre: string): ReactNode {
  const n = nombre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const reglas: [RegExp, ReactNode][] = [
    [/acceso a datos|\bad\b/, <DatabaseZap key="i" />],
    [/base[s]? de datos|\bbd\b|sql/, <Database key="i" />],
    [/programacion multimedia|movil|android|\bpmdm\b/, <Smartphone key="i" />],
    [/interfa|\bdi\b/, <LayoutDashboard key="i" />],
    [/servicios|procesos|\bpsp\b/, <Cpu key="i" />],
    [/gestion empresarial|\bsge\b|erp/, <Building2 key="i" />],
    [/programacion|\bprog\b|java/, <CodeXml key="i" />],
    [/marcas|\blm\b|xml|html/, <FileCode2 key="i" />],
    [/sistemas informaticos|\bsi\b|sistemas/, <Server key="i" />],
    [/entornos|\bed\b/, <Wrench key="i" />],
    [/ingles|english/, <Languages key="i" />],
    [/fol|empleabilidad|empresa|eie|itinerario/, <Briefcase key="i" />],
    [/proyecto|\btfg\b/, <Rocket key="i" />],
    [/digitaliz/, <Sparkles key="i" />],
    [/sostenib/, <Leaf key="i" />],
    [/juego|videojuego/, <Gamepad2 key="i" />],
    [/orienta|guia|empez/, <Compass key="i" />],
  ];
  for (const [re, icono] of reglas) if (re.test(n)) return icono;
  return <BookOpen />;
}

export function Modulos({ cursos }: { cursos: CursoResumen[] }) {
  return (
    <section
      id="modulos"
      aria-labelledby="modulos-titulo"
      className="relative mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 md:py-24"
    >
      <Reveal className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-fd-primary">El temario</p>
          <h2 id="modulos-titulo" className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Elige módulo y a por ello
          </h2>
        </div>
        <Link
          href="/docs"
          className="group inline-flex items-center gap-1 self-start rounded text-sm font-medium text-fd-muted-foreground transition-colors hover:text-fd-foreground sm:self-auto"
        >
          Ver todos los apuntes
          <ArrowUpRight aria-hidden className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </Reveal>

      {cursos.length === 0 ? (
        <Reveal className="mt-10">
          <div className="rounded-2xl border border-dashed bg-fd-card/50 p-10 text-center">
            <BookOpen aria-hidden className="mx-auto size-8 text-fd-muted-foreground" />
            <p className="mt-3 font-medium">Los apuntes están en camino</p>
            <p className="mt-1 text-sm text-fd-muted-foreground">
              En cuanto se publiquen los primeros módulos aparecerán aquí.
            </p>
          </div>
        </Reveal>
      ) : (
        <div className="mt-10 space-y-14">
          {cursos.map((curso) => (
            <div key={curso.id} aria-labelledby={`curso-${curso.id}`} role="group">
              <Reveal className="mb-5 flex items-center gap-3">
                <span
                  aria-hidden
                  className="bg-brand-gradient inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-bold text-white shadow-md shadow-fd-primary/20"
                >
                  {curso.numero ? `${curso.numero}º` : <BookOpen className="size-4" />}
                </span>
                <h3 id={`curso-${curso.id}`} className="text-xl font-semibold tracking-tight">
                  {curso.nombre}
                </h3>
                <span className="text-sm text-fd-muted-foreground">
                  · {curso.modulos.length} {curso.modulos.length === 1 ? 'módulo' : 'módulos'}
                </span>
                <span aria-hidden className="ms-2 h-px flex-1 bg-gradient-to-r from-fd-border to-transparent" />
              </Reveal>

              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {curso.modulos.map((m, i) => (
                  <li key={m.id}>
                    <Reveal delay={Math.min(i, 8) * 0.04} className="h-full">
                      <Link
                        href={m.url}
                        className="group relative flex h-full flex-col rounded-2xl border bg-fd-card p-5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-fd-primary/40 hover:shadow-lg hover:shadow-fd-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-fd-primary/10 text-fd-primary ring-1 ring-fd-primary/15 transition-colors group-hover:bg-fd-primary group-hover:text-fd-primary-foreground [&_svg]:size-5">
                            {m.icono ?? iconoPorNombre(m.nombre)}
                          </span>
                          <ArrowUpRight
                            aria-hidden
                            className="size-4 text-fd-muted-foreground opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:opacity-100"
                          />
                        </div>
                        <h4 className="mt-4 font-semibold leading-snug">{m.nombre}</h4>
                        {m.descripcion && (
                          <p className="mt-1 line-clamp-2 text-sm text-fd-muted-foreground">{m.descripcion}</p>
                        )}
                        <p className="mt-auto pt-3 text-xs font-medium text-fd-muted-foreground">
                          {m.paginas.length === 0
                            ? 'Próximamente'
                            : `${m.paginas.length} ${m.paginas.length === 1 ? 'tema' : 'temas'}`}
                        </p>
                        <ModuloProgreso paginas={m.paginas} nombre={m.nombre} />
                      </Link>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
