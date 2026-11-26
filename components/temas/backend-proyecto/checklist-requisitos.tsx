'use client';

import { useEffect, useId, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/cn';
import { avisoTexto, bloque, botonSecundario, cabecera, etiqueta, malTexto, okTexto, tituloBloque } from '@/components/interactive/estilos';

/**
 * Lista de comprobación de los requisitos mínimos de backend y base de datos.
 * Cada fila dice si se dio en clase (Dado, A medias, No dado) y enlaza a la
 * página que lo explica. El alumno marca lo que ya tiene hecho en su proyecto;
 * se guarda solo en su navegador (localStorage), así que no es nada oficial.
 */

export type EstadoClase = 'dado' | 'a-medias' | 'no-dado';

export interface RequisitoItem {
  id: string;
  texto: string;
  estado: EstadoClase;
  enlace?: string;
}

const CLAVE = 'dam:backend-proyecto:requisitos';

const textoEstado: Record<EstadoClase, string> = { dado: 'Dado', 'a-medias': 'A medias', 'no-dado': 'No dado' };
const colorEstado: Record<EstadoClase, string> = { dado: okTexto, 'a-medias': avisoTexto, 'no-dado': malTexto };

type Filtro = 'todos' | EstadoClase | 'pendientes';

export function ChecklistRequisitos({
  titulo = 'Tu proyecto: requisitos mínimos de backend',
  items,
}: {
  titulo?: string;
  items: RequisitoItem[];
}) {
  const id = useId();
  const reducir = useReducedMotion();
  const [hechos, setHechos] = useState<Record<string, boolean>>({});
  const [filtro, setFiltro] = useState<Filtro>('todos');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CLAVE);
      if (raw) setHechos(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      /* sin almacenamiento: la lista funciona igual, solo que no se recuerda */
    }
  }, []);

  const cambiar = (clave: string, valor: boolean) => {
    setHechos((prev) => {
      const nuevo = { ...prev, [clave]: valor };
      try {
        localStorage.setItem(CLAVE, JSON.stringify(nuevo));
      } catch {
        /* nada */
      }
      return nuevo;
    });
  };

  const total = items.length;
  const listos = items.filter((i) => hechos[i.id]).length;
  const visibles = items.filter((i) =>
    filtro === 'todos' ? true : filtro === 'pendientes' ? !hechos[i.id] : i.estado === filtro,
  );

  const filtros: { id: Filtro; texto: string }[] = [
    { id: 'todos', texto: 'Todos' },
    { id: 'pendientes', texto: 'Me faltan' },
    { id: 'no-dado', texto: 'No dados' },
    { id: 'a-medias', texto: 'A medias' },
    { id: 'dado', texto: 'Dados' },
  ];

  return (
    <section aria-label={titulo} className={bloque}>
      <div className={cabecera}>
        <span className={etiqueta}>Lista de comprobación</span>
        <p className={cn(tituloBloque, 'min-w-0 flex-1')}>{titulo}</p>
        <p className="text-xs tabular-nums text-fd-muted-foreground" aria-live="polite">
          {listos} de {total} hechos
        </p>
      </div>
      <div className="h-1 w-full bg-fd-muted" aria-hidden>
        <motion.div
          className="h-full bg-fd-primary"
          initial={false}
          animate={{ width: `${total ? (listos / total) * 100 : 0}%` }}
          transition={{ duration: reducir ? 0 : 0.35 }}
        />
      </div>
      <div role="group" aria-label="Filtrar" className="flex flex-wrap gap-1.5 border-b px-4 py-3 sm:px-5">
        {filtros.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filtro === f.id}
            onClick={() => setFiltro(f.id)}
            className={cn(
              botonSecundario,
              'min-h-8 px-2.5 py-1 text-xs',
              filtro === f.id && 'border-fd-primary bg-fd-primary/10',
            )}
          >
            {f.texto}
          </button>
        ))}
      </div>
      <ul className="divide-y">
        {visibles.map((item) => {
          const marcado = !!hechos[item.id];
          return (
            <li key={item.id} className="flex min-w-0 items-start gap-3 px-4 py-2.5 sm:px-5">
              <input
                id={`${id}-${item.id}`}
                type="checkbox"
                checked={marcado}
                onChange={(e) => cambiar(item.id, e.target.checked)}
                className="mt-1 size-4 shrink-0 accent-[var(--color-fd-primary)]"
              />
              <div className="min-w-0 flex-1">
                <label
                  htmlFor={`${id}-${item.id}`}
                  className={cn('block text-sm', marcado && 'text-fd-muted-foreground line-through')}
                >
                  {item.texto}
                </label>
                <p className="mt-0.5 text-xs">
                  <span className={cn('font-medium', colorEstado[item.estado])}>{textoEstado[item.estado]} en clase</span>
                  {item.enlace && (
                    <>
                      <span className="text-fd-muted-foreground"> · </span>
                      <a
                        href={item.enlace}
                        className="rounded-sm text-fd-muted-foreground underline underline-offset-2 hover:text-fd-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
                      >
                        Cómo se hace<span className="sr-only">: {item.texto}</span>
                      </a>
                    </>
                  )}
                </p>
              </div>
            </li>
          );
        })}
        {visibles.length === 0 && <li className="px-4 py-3 text-sm text-fd-muted-foreground sm:px-5">Nada con este filtro.</li>}
      </ul>
      <p className="border-t px-4 py-2 text-[11px] text-fd-muted-foreground sm:px-5">
        Lo que marques se guarda solo en este navegador.
      </p>
    </section>
  );
}
