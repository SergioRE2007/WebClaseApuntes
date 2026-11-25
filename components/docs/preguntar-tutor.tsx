'use client';

import { useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { abrirChat, urlLoginVolviendo } from '@/components/chat/abrir-chat';

/**
 * Botón de la cabecera de cada tema: abre el Tutor con una pregunta sobre la página.
 * Sin sesión (o sin código de clase) lo atiende el aviso del lanzador, que invita
 * a entrar. Si todavía no hay nada montado que lo atienda (la sesión se está
 * leyendo), lleva a entrar y vuelve después a este tema.
 */
export function PreguntarTutor({ titulo }: { titulo: string }) {
  const router = useRouter();

  const preguntar = () => {
    const atendido = abrirChat({
      pregunta: `Resúmeme las ideas clave del tema "${titulo}" y ponme un ejemplo sencillo.`,
    });
    if (!atendido) router.push(urlLoginVolviendo());
  };

  return (
    <button
      type="button"
      onClick={preguntar}
      className="dam-preguntar-tutor inline-flex h-10 items-center sm:h-8 gap-1.5 rounded-md border px-2.5 text-sm text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring print:hidden"
    >
      <MessageCircle className="size-3.5" aria-hidden />
      Preguntar al tutor sobre esta página
    </button>
  );
}
