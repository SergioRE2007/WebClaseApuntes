'use client';

import { useState } from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { bloque, botonSecundario, cabecera, etiqueta, tituloBloque } from '@/components/interactive/estilos';

/**
 * Demo de ejemplo para la guía del autor: cómo se ve y se importa una demo a
 * medida desde components/temas/<grupo>/. Muestra que cambiar el estado vuelve
 * a pintar la interfaz (la idea de fondo de Compose, Angular signals o React).
 */
export function DemoEstado({ titulo = 'Estado que repinta la interfaz', inicial = 0 }: { titulo?: string; inicial?: number }) {
  const [valor, setValor] = useState(inicial);
  const [pintados, setPintados] = useState(1);

  const cambiar = (n: number) => {
    setValor(n);
    setPintados((p) => p + 1);
  };

  return (
    <section aria-label={titulo} className={bloque}>
      <div className={cabecera}>
        <span className={etiqueta}>Demo</span>
        <p className={cn(tituloBloque, 'min-w-0 flex-1')}>{titulo}</p>
      </div>
      <div className="flex flex-wrap items-center gap-4 px-4 py-4 sm:px-5">
        <p className="min-w-24 text-3xl font-semibold tabular-nums" aria-live="polite">
          {valor}
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={() => cambiar(valor - 1)} aria-label="Restar uno" className={botonSecundario}>
            <Minus className="size-4" aria-hidden />
          </button>
          <button type="button" onClick={() => cambiar(valor + 1)} aria-label="Sumar uno" className={botonSecundario}>
            <Plus className="size-4" aria-hidden />
          </button>
          <button type="button" onClick={() => cambiar(inicial)} className={botonSecundario}>
            <RotateCcw className="size-3.5" aria-hidden />
            Reiniciar
          </button>
        </div>
        <p className="w-full text-xs text-fd-muted-foreground">
          La interfaz se ha pintado {pintados} {pintados === 1 ? 'vez' : 'veces'}: cada cambio de estado provoca un repintado.
        </p>
      </div>
    </section>
  );
}
