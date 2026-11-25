import Link from 'next/link';
import type { CursoResumen } from './cursos';
import { ModuloProgreso } from './modulo-progreso';

/** Índice de cursos y módulos: una lista sencilla por curso. */
export function Indice({ cursos }: { cursos: CursoResumen[] }) {
  if (cursos.length === 0) {
    return (
      <section aria-label="Módulos" className="mt-14 border-t pt-6 text-sm text-fd-muted-foreground">
        Todavía no hay apuntes publicados.
      </section>
    );
  }

  return (
    <div className="mt-14 space-y-12">
      {cursos.map((curso) => (
        <section key={curso.id} aria-labelledby={`curso-${curso.id}`}>
          <div className="flex items-baseline justify-between gap-4 border-b pb-2">
            <h2 id={`curso-${curso.id}`} className="text-base font-semibold tracking-tight">
              {curso.nombre}
            </h2>
            <span className="text-sm text-fd-muted-foreground">
              {curso.modulos.length} {curso.modulos.length === 1 ? 'módulo' : 'módulos'}
              {curso.paginas.length === 0 ? ' · sin temas todavía' : ''}
            </span>
          </div>
          <ul className="divide-y divide-fd-border">
            {curso.modulos.map((m) => {
              const vacio = m.paginas.length === 0;
              return (
                <li key={m.id}>
                  <Link
                    href={m.url}
                    className="group -mx-2 flex items-baseline gap-4 rounded-md px-2 py-3 transition-colors hover:bg-fd-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
                  >
                    <span className="min-w-0 flex-1">
                      <span
                        className={
                          vacio
                            ? 'block text-[15px] text-fd-muted-foreground group-hover:text-fd-foreground'
                            : 'block text-[15px] font-medium group-hover:text-fd-primary'
                        }
                      >
                        {m.nombre}
                      </span>
                      {m.descripcion && (
                        <span className="mt-0.5 line-clamp-2 text-sm text-fd-muted-foreground">{m.descripcion}</span>
                      )}
                    </span>
                    <span className="shrink-0 text-sm tabular-nums text-fd-muted-foreground">
                      <ModuloProgreso paginas={m.paginas} />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
