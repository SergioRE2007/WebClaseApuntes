'use client';

import { Fragment, useId, useMemo, useRef, useState } from 'react';
import { Check, Eye, RotateCcw, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { resaltar } from './resaltado';
import { bloque, botonPrimario, botonSecundario, cabecera, etiqueta, malTexto, okTexto, tituloBloque } from './estilos';

export interface CompletarCodigoProps {
  /**
   * Código con huecos. Dos formas de marcar un hueco:
   *  - `[[respuesta]]` o `[[resp1|resp2]]` (varias respuestas válidas) — recomendado.
   *  - `___` (tres guiones bajos) junto con la prop `respuestas` en el mismo orden.
   */
  codigo: string;
  /** Respuestas para los huecos `___`, en orden. Cada una puede ser un string o una lista de alternativas. */
  respuestas?: (string | string[])[];
  lenguaje?: string;
  titulo?: string;
  /** Instrucciones breves encima del código. */
  enunciado?: string;
  /** Comparar ignorando mayúsculas (útil en SQL). Por defecto false. */
  ignorarMayusculas?: boolean;
}

type Segmento = { tipo: 'texto'; valor: string } | { tipo: 'hueco'; validas: string[]; indice: number };

function parsear(codigo: string, respuestas: (string | string[])[] = []): Segmento[] {
  const limpio = codigo.replace(/^\n+/, '').replace(/\s+$/, '');
  const segmentos: Segmento[] = [];
  const re = /\[\[([^\]]+)\]\]|_{3,}/g;
  let ultimo = 0;
  let n = 0;
  let nGuiones = 0;
  for (const m of limpio.matchAll(re)) {
    const idx = m.index ?? 0;
    if (idx > ultimo) segmentos.push({ tipo: 'texto', valor: limpio.slice(ultimo, idx) });
    let validas: string[];
    if (m[1] !== undefined) {
      validas = m[1].split('|').map((s) => s.trim());
    } else {
      const r = respuestas[nGuiones++];
      validas = r === undefined ? [] : Array.isArray(r) ? r : [r];
    }
    segmentos.push({ tipo: 'hueco', validas, indice: n++ });
    ultimo = idx + m[0].length;
  }
  if (ultimo < limpio.length) segmentos.push({ tipo: 'texto', valor: limpio.slice(ultimo) });
  return segmentos;
}

export function CompletarCodigo({
  codigo,
  respuestas,
  lenguaje = 'java',
  titulo,
  enunciado = 'Rellena los huecos y pulsa «Comprobar».',
  ignorarMayusculas = false,
}: CompletarCodigoProps) {
  const segmentos = useMemo(() => parsear(codigo, respuestas), [codigo, respuestas]);
  const huecos = segmentos.filter((s): s is Extract<Segmento, { tipo: 'hueco' }> => s.tipo === 'hueco');
  const [valores, setValores] = useState<string[]>(() => huecos.map(() => ''));
  const [comprobado, setComprobado] = useState(false);
  const [solucion, setSolucion] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const baseId = useId();

  const norm = (s: string) => {
    const t = s.trim().replace(/\s+/g, ' ');
    return ignorarMayusculas ? t.toLowerCase() : t;
  };
  const esCorrecto = (i: number) => {
    const h = huecos[i];
    return Boolean(h && h.validas.some((v) => norm(v) === norm(valores[i] ?? '')));
  };
  const aciertos = huecos.filter((_, i) => esCorrecto(i)).length;
  const todo = aciertos === huecos.length;

  const cambiar = (i: number, v: string) => {
    setValores((prev) => {
      const n = [...prev];
      n[i] = v;
      return n;
    });
    if (comprobado) setComprobado(false);
  };

  const comprobar = () => {
    setComprobado(true);
    const primero = huecos.findIndex((_, i) => !esCorrecto(i));
    if (primero >= 0) inputs.current[primero]?.focus();
  };

  const verSolucion = () => {
    setValores(huecos.map((h) => h.validas[0] ?? ''));
    setSolucion(true);
    setComprobado(true);
  };

  const reiniciar = () => {
    setValores(huecos.map(() => ''));
    setComprobado(false);
    setSolucion(false);
    inputs.current[0]?.focus();
  };

  return (
    <section className={bloque}>
      <div className={cabecera}>
        <p className={tituloBloque}>{titulo ?? 'Completa el código'}</p>
        <span className={cn(etiqueta, 'ms-auto font-mono')}>{lenguaje}</span>
        <p className="w-full text-sm text-fd-muted-foreground">{enunciado}</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          comprobar();
        }}
      >
        <pre className="overflow-x-auto bg-fd-muted/40 px-4 py-4 font-mono text-[13px] leading-9 sm:px-5 sm:leading-7">
          <code>
            {segmentos.map((s, k) => {
              if (s.tipo === 'texto') return <Fragment key={k}>{resaltar(s.valor, lenguaje)}</Fragment>;
              const i = s.indice;
              const ok = comprobado && esCorrecto(i);
              const mal = comprobado && !esCorrecto(i);
              const ancho = Math.max(3, ...s.validas.map((v) => v.length)) + 1;
              return (
                <span key={k} className="relative inline-block align-baseline">
                  <label htmlFor={`${baseId}-${i}`} className="sr-only">
                    Hueco {i + 1} de {huecos.length}
                  </label>
                  <input
                    ref={(el) => {
                      inputs.current[i] = el;
                    }}
                    id={`${baseId}-${i}`}
                    value={valores[i] ?? ''}
                    onChange={(e) => cambiar(i, e.target.value)}
                    readOnly={solucion}
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    aria-invalid={mal || undefined}
                    style={{ width: `${ancho + 1}ch` }}
                    className={cn(
                      'mx-0.5 h-8 rounded border sm:h-6 border-fd-muted-foreground/40 bg-fd-background px-1 text-center font-mono text-[13px] text-fd-foreground outline-none transition-colors focus:border-fd-primary focus-visible:ring-2 focus-visible:ring-fd-ring/40',
                      ok && 'border-green-600/50 bg-green-600/[0.06] dark:border-green-400/50',
                      mal && 'border-red-600/50 bg-red-600/[0.06] dark:border-red-400/50',
                    )}
                  />
                </span>
              );
            })}
          </code>
        </pre>

        <div className="flex flex-wrap items-center gap-2 border-t px-4 py-3 sm:px-5">
          <p className="mr-auto flex items-center gap-1.5 text-sm" aria-live="polite">
            {comprobado ? (
              todo ? (
                <span className={cn('flex items-center gap-1.5 font-medium', okTexto)}>
                  <Check className="size-4" aria-hidden />
                  {solucion ? 'Esta es la solución.' : 'Todo correcto.'}
                </span>
              ) : (
                <span className={cn('flex items-center gap-1.5', malTexto)}>
                  <X className="size-4" aria-hidden />
                  {aciertos} de {huecos.length} huecos correctos
                </span>
              )
            ) : (
              <span className="text-fd-muted-foreground">
                {huecos.length} {huecos.length === 1 ? 'hueco' : 'huecos'} por rellenar
              </span>
            )}
          </p>
          <button type="button" onClick={reiniciar} className={botonSecundario} aria-label="Reiniciar ejercicio">
            <RotateCcw className="size-4" aria-hidden />
          </button>
          {!solucion && (
            <button type="button" onClick={verSolucion} className={botonSecundario}>
              <Eye className="size-4" aria-hidden />
              Solución
            </button>
          )}
          <button type="submit" disabled={solucion} className={botonPrimario}>
            Comprobar
          </button>
        </div>
      </form>
    </section>
  );
}
