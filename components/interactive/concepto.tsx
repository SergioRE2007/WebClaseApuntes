'use client';

import { type ReactNode } from 'react';
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
        className="cursor-help rounded-sm text-fd-foreground underline decoration-fd-muted-foreground/60 decoration-dotted decoration-1 underline-offset-4 transition-colors hover:decoration-fd-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
        aria-label={`${termino ?? textoPlano(children)}: ver definición`}
      >
        {children}
      </PopoverTrigger>
      <PopoverContent className="not-prose max-w-xs p-3 text-sm" sideOffset={6}>
        <p className="mb-1 font-semibold text-fd-foreground">
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
    <section className="not-prose my-8 rounded-lg border">
      <p className="border-b px-4 py-2.5 text-xs font-medium text-fd-muted-foreground sm:px-5">{titulo}</p>
      <dl className="divide-y divide-fd-border">{children}</dl>
    </section>
  );
}

export function Termino({ nombre, children }: { nombre: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 px-4 py-3 sm:grid-cols-[11rem_1fr] sm:gap-4 sm:px-5">
      <dt className="text-sm font-semibold text-fd-foreground">
        <TextoEnriquecido texto={nombre} />
      </dt>
      <dd className="text-sm leading-relaxed text-fd-muted-foreground [&_code]:rounded [&_code]:border [&_code]:bg-fd-muted [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.9em] [&_p]:m-0">
        <Contenido>{children}</Contenido>
      </dd>
    </div>
  );
}
