'use client';

import { MessageCircle } from 'lucide-react';
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
      className="dam-preguntar-tutor inline-flex h-10 items-center sm:h-8 gap-1.5 rounded-md border px-2.5 text-sm text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
    >
      <MessageCircle className="size-3.5" aria-hidden />
      Preguntar al tutor sobre esta página
    </button>
  );
}
