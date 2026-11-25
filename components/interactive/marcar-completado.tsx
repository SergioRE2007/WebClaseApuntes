'use client';

import { usePathname } from 'next/navigation';
import { Check, Undo2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';
import { normalizarUrl, useProgreso } from '@/lib/progreso';
import { botonPrimario, botonSecundario } from './estilos';

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
      toast('Tema completado', { description: 'Tu progreso se guarda en este navegador.' });
    } else {
      toast('Tema marcado como pendiente');
    }
  };

  return (
    <div className="not-prose my-10 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1" aria-live="polite">
        <p className="flex items-center gap-1.5 text-sm font-medium">
          {hecho ? <Check className="size-4 text-green-700 dark:text-green-400" aria-hidden /> : null}
          {hecho ? 'Tema completado' : '¿Has terminado este tema?'}
        </p>
        <p className="mt-0.5 text-sm text-fd-muted-foreground">
          {hecho && fecha
            ? `Lo marcaste el ${formatoFecha.format(new Date(fecha))}. Se guarda en este navegador.`
            : 'Márcalo para llevar la cuenta de lo que ya has estudiado.'}
        </p>
      </div>
      <button
        type="button"
        onClick={onClick}
        disabled={!listo}
        className={cn(hecho ? botonSecundario : botonPrimario, 'self-start sm:self-auto')}
      >
        {hecho ? (
          <>
            <Undo2 className="size-4" aria-hidden />
            Desmarcar
          </>
        ) : (
          <>
            <Check className="size-4" aria-hidden />
            Marcar como completado
          </>
        )}
      </button>
    </div>
  );
}
