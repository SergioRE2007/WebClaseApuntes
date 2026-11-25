'use client';

import { Sparkles } from 'lucide-react';
import { abrirChat } from '@/components/chat/abrir-chat';

/** Botón de la cabecera de cada tema: abre el Tutor con una pregunta sobre la página. */
export function PreguntarTutor({ titulo }: { titulo: string }) {
  return (
    <button
      type="button"
      onClick={() =>
        abrirChat({
          pregunta: `Resúmeme las ideas clave del tema "${titulo}" y ponme un ejemplo sencillo.`,
        })
      }
      className="inline-flex items-center gap-1.5 rounded-full border bg-fd-card px-3 py-1.5 text-sm font-medium text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
    >
      <Sparkles className="size-4 text-fd-primary" aria-hidden />
      Preguntar al Tutor sobre esta página
    </button>
  );
}
