'use client';

import { useEffect, useId, useState } from 'react';
import { motion, MotionConfig } from 'motion/react';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { avisoTexto, bloque, botonSecundario, cabecera, etiqueta, malTexto, okTexto, tituloBloque } from '@/components/interactive/estilos';

/*
 * Lista de requisitos del proyecto agrupada por área, con el estado en clase
 * (Dado / A medias / No dado) y una casilla para que cada alumno marque lo que
 * ya tiene hecho. Se guarda solo en su navegador (localStorage).
 */

export type EstadoRequisito = 'dado' | 'medias' | 'no';

export interface GrupoRequisitos {
  titulo: string;
  enlace?: string;
  items: { nombre: string; estado: EstadoRequisito }[];
}

const CLAVE = 'dam:proyecto-checklist';

const NOMBRE_ESTADO: Record<EstadoRequisito, string> = { dado: 'Dado', medias: 'A medias', no: 'No dado' };
const COLOR_ESTADO: Record<EstadoRequisito, string> = { dado: okTexto, medias: avisoTexto, no: malTexto };

type Filtro = 'todo' | EstadoRequisito;

function leer(): Record<string, boolean> {
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    const datos: unknown = crudo ? JSON.parse(crudo) : {};
    return datos && typeof datos === 'object' ? (datos as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

function guardar(datos: Record<string, boolean>) {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(datos));
  } catch {
    // Sin almacenamiento (modo privado...): la lista sigue funcionando sin recordar.
  }
}

export function ChecklistRequisitos({ grupos, titulo = 'Tu checklist del proyecto' }: { grupos: GrupoRequisitos[]; titulo?: string }) {
  const base = useId();
  const [hecho, setHecho] = useState<Record<string, boolean>>({});
  const [filtro, setFiltro] = useState<Filtro>('todo');

  useEffect(() => {
    setHecho(leer());
  }, []);

  const marcar = (clave: string, valor: boolean) => {
    setHecho((h) => {
      const nuevo = { ...h, [clave]: valor };
      guardar(nuevo);
      return nuevo;
    });
  };

  const reiniciar = () => {
    setHecho({});
    guardar({});
  };

  const total = grupos.reduce((s, g) => s + g.items.length, 0);
  const totalHecho = grupos.reduce((s, g) => s + g.items.filter((i) => hecho[`${g.titulo}/${i.nombre}`]).length, 0);

  const filtros: { id: Filtro; texto: string }[] = [
    { id: 'todo', texto: 'Todo' },
    { id: 'no', texto: 'No dado' },
    { id: 'medias', texto: 'A medias' },
    { id: 'dado', texto: 'Dado' },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <section aria-label={titulo} className={cn(bloque, '@container')}>
        <div className={cabecera}>
          <span className={etiqueta}>Demo</span>
          <p className={cn(tituloBloque, 'min-w-0 flex-1')}>{titulo}</p>
          <span className={cn(etiqueta, 'tabular-nums')} aria-live="polite">
            {totalHecho} de {total} hechos
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3 sm:px-5">
          <span className={etiqueta}>Ver:</span>
          {filtros.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filtro === f.id}
              onClick={() => setFiltro(f.id)}
              className={cn(
                'min-h-8 rounded-md border px-2.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring',
                filtro === f.id ? 'border-fd-primary bg-fd-primary/10 text-fd-foreground' : 'text-fd-muted-foreground hover:bg-fd-accent',
              )}
            >
              {f.texto}
            </button>
          ))}
          <button type="button" className={cn(botonSecundario, 'ml-auto')} onClick={reiniciar}>
            <RotateCcw className="size-3.5" aria-hidden />
            Desmarcar todo
          </button>
        </div>

        <div className="grid gap-px bg-fd-border @2xl:grid-cols-3">
          {grupos.map((g, gi) => {
            const hechos = g.items.filter((i) => hecho[`${g.titulo}/${i.nombre}`]).length;
            const pct = g.items.length ? (hechos / g.items.length) * 100 : 0;
            const visibles = g.items.filter((i) => filtro === 'todo' || i.estado === filtro);
            return (
              <div key={g.titulo} className="min-w-0 bg-fd-background px-4 py-3">
                <div className="flex items-baseline justify-between gap-2">
                  {g.enlace ? (
                    <a href={g.enlace} className="text-sm font-semibold underline-offset-2 hover:underline">
                      {g.titulo}
                    </a>
                  ) : (
                    <p className="text-sm font-semibold">{g.titulo}</p>
                  )}
                  <span className="text-xs tabular-nums text-fd-muted-foreground">
                    {hechos}/{g.items.length}
                  </span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-fd-muted" aria-hidden>
                  <motion.div className="h-full bg-fd-primary" initial={false} animate={{ width: `${pct}%` }} transition={{ duration: 0.35 }} />
                </div>
                <ul className="mt-3 space-y-1.5">
                  {visibles.map((i) => {
                    const clave = `${g.titulo}/${i.nombre}`;
                    // Id sin espacios ni barras: índice del grupo y del requisito.
                    const id = `${base}-${gi}-${g.items.indexOf(i)}`;
                    return (
                      <li key={i.nombre} className="flex items-start gap-2">
                        <input
                          id={id}
                          type="checkbox"
                          checked={!!hecho[clave]}
                          onChange={(e) => marcar(clave, e.target.checked)}
                          className="mt-0.5 size-4 shrink-0 accent-[var(--color-fd-primary)]"
                        />
                        <label htmlFor={id} className={cn('min-w-0 flex-1 text-sm leading-snug', hecho[clave] && 'text-fd-muted-foreground line-through')}>
                          {i.nombre}
                        </label>
                        <span className={cn('shrink-0 text-[11px] font-medium', COLOR_ESTADO[i.estado])}>{NOMBRE_ESTADO[i.estado]}</span>
                      </li>
                    );
                  })}
                  {visibles.length === 0 ? <li className="text-xs text-fd-muted-foreground">Nada con ese estado.</li> : null}
                </ul>
              </div>
            );
          })}
        </div>
        <p className="border-t px-4 py-2.5 text-xs text-fd-muted-foreground sm:px-5">
          El estado dice si se dio en clase, no si lo tienes hecho. Lo que marques se guarda solo en este navegador.
        </p>
      </section>
    </MotionConfig>
  );
}
