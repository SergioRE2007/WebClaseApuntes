'use client';

import Link from 'next/link';
import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { completadas, useProgresoLocal } from './use-progreso-local';

export interface ModuloIndice {
  id: string;
  nombre: string;
  descripcion: string | null;
  url: string;
  paginas: string[];
}

export interface CursoIndice {
  id: string;
  nombre: string;
  url: string | null;
  modulos: ModuloIndice[];
  paginas: string[];
}

const foco =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2 focus-visible:ring-offset-fd-background';

/** Cursos en pestañas (el actual primero) y sus módulos en tarjetas. */
export function Indice({ cursos }: { cursos: CursoIndice[] }) {
  const [activo, setActivo] = useState(0);
  const botones = useRef<(HTMLButtonElement | null)[]>([]);
  const base = useId();

  if (cursos.length === 0) {
    return (
      <section aria-label="Módulos" className="mt-12 border-t pt-6 text-sm text-fd-muted-foreground">
        Todavía no hay apuntes publicados.
      </section>
    );
  }

  const mover = (e: KeyboardEvent<HTMLButtonElement>) => {
    const n = cursos.length;
    const destino =
      e.key === 'ArrowRight' ? (activo + 1) % n
      : e.key === 'ArrowLeft' ? (activo - 1 + n) % n
      : e.key === 'Home' ? 0
      : e.key === 'End' ? n - 1
      : null;
    if (destino === null) return;
    e.preventDefault();
    setActivo(destino);
    botones.current[destino]?.focus();
  };

  return (
    <section aria-label="Cursos y módulos" className="mt-12">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b">
        <div role="tablist" aria-label="Curso" className="-mb-px flex gap-5">
          {cursos.map((c, i) => (
            <button
              key={c.id}
              ref={(el) => {
                botones.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${base}-tab-${i}`}
              aria-selected={i === activo}
              aria-controls={`${base}-panel-${i}`}
              tabIndex={i === activo ? 0 : -1}
              onClick={() => setActivo(i)}
              onKeyDown={mover}
              className={`rounded-t-sm border-b-2 pb-2.5 text-[15px] font-semibold tracking-tight transition-colors ${foco} ${
                i === activo
                  ? 'border-fd-primary text-fd-foreground'
                  : 'border-transparent text-fd-muted-foreground hover:text-fd-foreground'
              }`}
            >
              {c.nombre}
            </button>
          ))}
        </div>
        <ResumenCurso curso={cursos[activo]!} />
      </div>

      {cursos.map((c, i) => (
        <div
          key={c.id}
          role="tabpanel"
          id={`${base}-panel-${i}`}
          aria-labelledby={`${base}-tab-${i}`}
          hidden={i !== activo}
          className="pt-5"
        >
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {c.modulos.map((m) => (
              <li key={m.id} className="flex">
                <TarjetaModulo modulo={m} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

function ResumenCurso({ curso }: { curso: CursoIndice }) {
  const progreso = useProgresoLocal();
  const total = curso.paginas.length;
  const hechas = completadas(progreso, curso.paginas);
  const modulos = `${curso.modulos.length} ${curso.modulos.length === 1 ? 'módulo' : 'módulos'}`;
  const temas = total === 0 ? 'sin temas todavía' : hechas > 0 ? `${hechas}/${total} temas` : `${total} temas`;
  return (
    <p className="flex items-center gap-4 pb-2.5 text-sm tabular-nums text-fd-muted-foreground">
      <span>
        {modulos} · {temas}
      </span>
      {curso.url ? (
        <Link href={curso.url} className={`rounded-sm font-medium text-fd-foreground underline-offset-4 hover:underline ${foco}`}>
          Portada del curso <span aria-hidden>→</span>
        </Link>
      ) : null}
    </p>
  );
}

function TarjetaModulo({ modulo }: { modulo: ModuloIndice }) {
  const progreso = useProgresoLocal();
  const total = modulo.paginas.length;
  const vacio = total === 0;
  const hechas = completadas(progreso, modulo.paginas);
  const pct = total > 0 ? Math.round((hechas / total) * 100) : 0;

  return (
    <Link
      href={modulo.url}
      className={`group flex w-full flex-col rounded-lg border p-4 transition-colors ${foco} ${
        vacio
          ? 'border-dashed text-fd-muted-foreground hover:border-fd-foreground/30 hover:text-fd-foreground'
          : 'bg-fd-card hover:border-fd-primary/60'
      }`}
    >
      <span className="flex items-start justify-between gap-3">
        <span className={`text-[15px] leading-snug ${vacio ? '' : 'font-medium group-hover:text-fd-primary'}`}>
          {modulo.nombre}
        </span>
        <span
          aria-hidden
          className="mt-0.5 shrink-0 text-fd-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
        >
          →
        </span>
      </span>
      {modulo.descripcion ? (
        <span className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-fd-muted-foreground">
          {modulo.descripcion}
        </span>
      ) : null}
      <span className="mt-auto pt-4">
        {vacio ? (
          <span className="text-xs">Próximamente</span>
        ) : (
          <>
            <span className="flex items-baseline justify-between text-xs tabular-nums text-fd-muted-foreground">
              <span>
                {total} {total === 1 ? 'tema' : 'temas'}
              </span>
              {hechas > 0 ? (
                <span className={hechas === total ? 'text-fd-foreground' : undefined}>
                  <span className="sr-only">Completados </span>
                  {hechas}/{total}
                </span>
              ) : null}
            </span>
            <span aria-hidden className="mt-2 block h-1 overflow-hidden rounded-full bg-fd-muted">
              <span
                className="block h-full rounded-full bg-fd-primary transition-[width] duration-500 motion-reduce:transition-none"
                style={{ width: `${pct}%` }}
              />
            </span>
          </>
        )}
      </span>
    </Link>
  );
}
