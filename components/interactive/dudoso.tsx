'use client';

import type { ReactNode } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from 'fumadocs-ui/components/ui/popover';
import { TextoEnriquecido } from './utils';

export const TEXTO_DUDOSO = 'No se leía bien en las capturas de clase; puede no ser exacto.';

export interface DudosoProps {
  /** Detalle opcional: "Otra captura lee `add_24dp`". Admite `código`. */
  nota?: string;
  /** El texto dudoso. Sin children solo se pinta la marca [dudoso]. */
  children?: ReactNode;
}

/**
 * Marca en línea de algo que no se leía bien en las capturas: subrayado
 * discontinuo + "[dudoso]". Al pulsarlo (o con Intro/espacio) explica por qué.
 */
export function Dudoso({ nota, children }: DudosoProps) {
  const conTexto = children !== undefined && children !== null && children !== '';
  return (
    <Popover>
      <PopoverTrigger className="inline cursor-help rounded-sm text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring">
        {conTexto && (
          <span className="underline decoration-amber-600/70 decoration-dashed decoration-1 underline-offset-4 dark:decoration-amber-400/70">
            {children}
          </span>
        )}
        <span className="ms-0.5 align-[0.12em] font-mono text-[0.7em] font-normal not-italic text-fd-muted-foreground">
          [dudoso]
        </span>
      </PopoverTrigger>
      <PopoverContent className="not-prose max-w-xs p-3 text-sm" sideOffset={6}>
        <p className="mb-1 font-semibold text-fd-foreground">Lectura dudosa</p>
        <p className="leading-relaxed text-fd-muted-foreground">{TEXTO_DUDOSO}</p>
        {nota && (
          <p className="mt-2 leading-relaxed text-fd-foreground">
            <TextoEnriquecido texto={nota} />
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}
