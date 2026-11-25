'use client';

import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, Circle, Undo2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';
import { normalizarUrl, useProgreso } from '@/lib/progreso';

export interface MarcarCompletadoProps {
  /** URL de la página a marcar. Por defecto, la página actual. */
  url?: string;
}

const formatoFecha = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

/** Botón para el final de cada tema: guarda el progreso en este navegador. */
export function MarcarCompletado({ url }: MarcarCompletadoProps) {
  const pathname = usePathname();
  const pagina = normalizarUrl(url ?? pathname ?? '/');
  const { estaCompletado, fechaDe, alternar, listo } = useProgreso();
  const hecho = listo && estaCompletado(pagina);
  const fecha = fechaDe(pagina);

  const onClick = () => {
    const ahora = alternar(pagina);
    if (ahora) {
      toast.success('¡Tema completado!', { description: 'Tu progreso se guarda en este navegador.' });
    } else {
      toast('Tema marcado como pendiente');
    }
  };

  return (
    <div
      className={cn(
        'not-prose my-10 flex flex-col items-center gap-3 rounded-2xl border p-5 text-center transition-colors sm:flex-row sm:text-left',
        hecho ? 'border-green-500/40 bg-green-500/5' : 'border-dashed bg-fd-card',
      )}
    >
      <div className="relative flex size-11 shrink-0 items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {hecho ? (
            <motion.span
              key="si"
              initial={{ scale: 0.3, rotate: -45, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.3, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="text-green-600 dark:text-green-400"
            >
              <CheckCircle2 className="size-10" aria-hidden />
            </motion.span>
          ) : (
            <motion.span
              key="no"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              className="text-fd-muted-foreground"
            >
              <Circle className="size-10" aria-hidden />
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div className="min-w-0 flex-1" aria-live="polite">
        <p className="font-semibold">{hecho ? '¡Tema completado!' : '¿Has terminado este tema?'}</p>
        <p className="text-sm text-fd-muted-foreground">
          {hecho && fecha
            ? `Lo marcaste el ${formatoFecha.format(new Date(fecha))}.`
            : 'Márcalo para llevar la cuenta de lo que ya has estudiado.'}
        </p>
      </div>
      <button
        type="button"
        onClick={onClick}
        disabled={!listo}
        aria-pressed={hecho}
        className={cn(
          'inline-flex min-h-10 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2 focus-visible:ring-offset-fd-background disabled:opacity-50',
          hecho
            ? 'border bg-fd-background text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground'
            : 'bg-fd-primary text-fd-primary-foreground hover:opacity-90',
        )}
      >
        {hecho ? (
          <>
            <Undo2 className="size-4" aria-hidden />
            Desmarcar
          </>
        ) : (
          <>
            <CheckCircle2 className="size-4" aria-hidden />
            Marcar como completado
          </>
        )}
      </button>
    </div>
  );
}
