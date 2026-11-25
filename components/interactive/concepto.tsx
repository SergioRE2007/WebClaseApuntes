'use client';

import { type ReactNode } from 'react';
import { BookMarked } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from 'fumadocs-ui/components/ui/popover';
import { Contenido, TextoEnriquecido } from './utils';

export interface ConceptoProps {
  /** Definición breve que aparece al pulsar el término. Admite `código`. */
  definicion: string;
  /** Nombre formal del concepto si difiere del texto (p. ej. texto «objetos», término «Objeto»). */
  termino?: string;
  /** El texto subrayado dentro del párrafo. */
  children: ReactNode;
}

/** Término subrayado en línea que muestra su definición en un popover. */
export function Concepto({ definicion, termino, children }: ConceptoProps) {
  return (
    <Popover>
      <PopoverTrigger
        className="cursor-help rounded-sm font-medium text-fd-foreground underline decoration-fd-primary/60 decoration-dotted decoration-2 underline-offset-4 transition hover:decoration-fd-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
        aria-label={`${termino ?? textoPlano(children)}: ver definición`}
      >
        {children}
      </PopoverTrigger>
      <PopoverContent className="not-prose max-w-xs p-3 text-sm" sideOffset={6}>
        <p className="mb-1 flex items-center gap-1.5 font-semibold text-fd-foreground">
          <BookMarked className="size-4 text-fd-primary" aria-hidden />
          {termino ?? <Contenido>{children}</Contenido>}
        </p>
        <p className="leading-relaxed text-fd-muted-foreground">
          <TextoEnriquecido texto={definicion} />
        </p>
      </PopoverContent>
    </Popover>
  );
}

function textoPlano(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textoPlano).join('');
  return 'término';
}

export interface GlosarioProps {
  titulo?: string;
  children: ReactNode;
}

/** Lista de definiciones. Úsalo con hijos <Termino nombre="...">definición</Termino>. */
export function Glosario({ titulo = 'Glosario', children }: GlosarioProps) {
  return (
    <section className="my-6 rounded-2xl border bg-fd-card p-4 sm:p-5">
      <p className="not-prose mb-3 flex items-center gap-2 font-semibold">
        <BookMarked className="size-5 text-fd-primary" aria-hidden />
        {titulo}
      </p>
      <dl className="not-prose grid gap-3 sm:grid-cols-2">{children}</dl>
    </section>
  );
}

export function Termino({ nombre, children }: { nombre: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border bg-fd-background p-3">
      <dt className="font-semibold text-fd-foreground">
        <TextoEnriquecido texto={nombre} />
      </dt>
      <dd className="mt-1 text-sm leading-relaxed text-fd-muted-foreground [&_code]:rounded [&_code]:border [&_code]:bg-fd-muted [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.9em] [&_p]:m-0">
        <Contenido>{children}</Contenido>
      </dd>
    </div>
  );
}
