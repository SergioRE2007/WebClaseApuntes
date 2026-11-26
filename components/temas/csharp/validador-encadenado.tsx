'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Play, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  bloque,
  botonPrimario,
  botonSecundario,
  cabecera,
  etiqueta,
  malTexto,
  okTexto,
  tituloBloque,
} from '@/components/interactive/estilos';

/**
 * Simulador del Validador de la clase del 18/11: un delegado multicast
 * `ValidarNumero` con cinco métodos encadenados. Compara la primera versión de
 * `Ejecutar` (invocar el delegado directamente: solo cuenta el último) con la
 * final (recorrer GetInvocationList() con un acumulador && y cortocircuito).
 */

interface Validacion {
  id: string;
  codigo: string;
  forma: string;
  prueba: (n: number) => boolean;
  /** Lo que escribe en consola (null si no escribe nada). */
  mensaje: ((n: number, r: boolean) => string) | null;
}

const bool = (b: boolean) => (b ? 'True' : 'False');

const VALIDACIONES: Validacion[] = [
  {
    id: 'positivo',
    codigo: 'Validador.EsPositivo',
    forma: 'método con nombre',
    prueba: (n) => n > 0,
    mensaje: (n, r) => `El resultado de la funcion EsPositivo para ${n} es: ${bool(r)}`,
  },
  {
    id: 'par',
    codigo: 'Validador.EsPar',
    forma: 'método con nombre',
    prueba: (n) => n % 2 === 0,
    mensaje: (n, r) => `El resultado de la funcion EsPar para ${n} es: ${bool(r)}`,
  },
  {
    id: 'tres',
    codigo: 'delegate (int numero) { ... numero % 3 == 0 ... }',
    forma: 'método anónimo',
    prueba: (n) => n % 3 === 0,
    mensaje: (n, r) => `El resultado de la función anónima para ${n} es divisible por 3: ${bool(r)}`,
  },
  {
    id: 'diez',
    codigo: '(int numero) => { ... numero > 10 ... }',
    forma: 'lambda de bloque',
    prueba: (n) => n > 10,
    mensaje: (n, r) => `El resultado de la función lambda para ${n} es mayor que 10: ${bool(r)}`,
  },
  {
    id: 'veinte',
    codigo: '(int numero) => numero > 20',
    forma: 'lambda de expresión (no escribe nada)',
    prueba: (n) => n > 20,
    mensaje: null,
  },
];

type Modo = 'directo' | 'final';

interface Linea {
  texto: string;
  tipo: 'entrada' | 'paso' | 'ok' | 'mal' | 'nota';
}

interface Traza {
  lineas: { linea: Linea; validacion?: string }[];
  llamadas: string[];
  resultado: boolean;
}

function simular(n: number, activas: Validacion[], modo: Modo): Traza {
  const lineas: Traza['lineas'] = [{ linea: { texto: `Ingrese un número entero: ${n}`, tipo: 'entrada' } }];
  const llamadas: string[] = [];
  let resultado: boolean;
  if (modo === 'directo') {
    // validate(x): se ejecutan todos y solo se recibe lo que devuelve el último.
    let ultimo = false;
    for (const v of activas) {
      const r = v.prueba(n);
      llamadas.push(v.id);
      if (v.mensaje) lineas.push({ linea: { texto: v.mensaje(n, r), tipo: 'paso' }, validacion: v.id });
      else lineas.push({ linea: { texto: `(la lambda de expresión devuelve ${bool(r)} sin escribir nada)`, tipo: 'nota' }, validacion: v.id });
      ultimo = r;
    }
    resultado = ultimo;
  } else {
    // resultado = resultado && paso(x): en cuanto uno da false, no se llama a los siguientes.
    resultado = true;
    for (const v of activas) {
      if (!resultado) break;
      const r = v.prueba(n);
      llamadas.push(v.id);
      if (v.mensaje) lineas.push({ linea: { texto: v.mensaje(n, r), tipo: 'paso' }, validacion: v.id });
      else lineas.push({ linea: { texto: `(la lambda de expresión devuelve ${bool(r)} sin escribir nada)`, tipo: 'nota' }, validacion: v.id });
      resultado = resultado && r;
    }
  }
  lineas.push({
    linea: {
      texto: resultado ? `El numero ${n} cumple con las validaciones` : `El numero ${n} NO cumple con las validaciones`,
      tipo: resultado ? 'ok' : 'mal',
    },
  });
  return { lineas, llamadas, resultado };
}

export function ValidadorEncadenado({ inicial = -6 }: { inicial?: number }) {
  const reducir = useReducedMotion();
  const [texto, setTexto] = useState(String(inicial));
  const [modo, setModo] = useState<Modo>('directo');
  const [activas, setActivas] = useState<string[]>(['positivo', 'par', 'tres']);
  const [traza, setTraza] = useState<Traza | null>(null);
  const [visibles, setVisibles] = useState(0);
  const temporizador = useRef<ReturnType<typeof setInterval> | null>(null);

  const numero = Number.parseInt(texto, 10);
  const valido = /^-?\d{1,6}$/.test(texto.trim()) && Number.isFinite(numero);

  useEffect(() => () => {
    if (temporizador.current) clearInterval(temporizador.current);
  }, []);

  const limpiar = () => {
    if (temporizador.current) clearInterval(temporizador.current);
    temporizador.current = null;
    setTraza(null);
    setVisibles(0);
  };

  const ejecutar = () => {
    if (!valido) return;
    if (temporizador.current) clearInterval(temporizador.current);
    const lista = VALIDACIONES.filter((v) => activas.includes(v.id));
    const t = simular(numero, lista, modo);
    setTraza(t);
    if (reducir) {
      setVisibles(t.lineas.length);
      return;
    }
    setVisibles(1);
    let i = 1;
    temporizador.current = setInterval(() => {
      i += 1;
      setVisibles(i);
      if (i >= t.lineas.length && temporizador.current) {
        clearInterval(temporizador.current);
        temporizador.current = null;
      }
    }, 450);
  };

  const alternar = (id: string) => {
    limpiar();
    setActivas((a) => {
      if (a.includes(id)) return a.length > 1 ? a.filter((x) => x !== id) : a;
      return VALIDACIONES.map((v) => v.id).filter((x) => x === id || a.includes(x));
    });
  };

  const primeraActiva = VALIDACIONES.find((v) => activas.includes(v.id))?.id;
  const enCurso = traza ? traza.lineas[Math.min(visibles, traza.lineas.length) - 1]?.validacion : undefined;
  const terminado = traza !== null && visibles >= traza.lineas.length;

  return (
    <section aria-label="Simulador del validador encadenado" className={bloque}>
      <div className={cabecera}>
        <span className={etiqueta}>Demo</span>
        <p className={cn(tituloBloque, 'min-w-0 flex-1')}>Validador con delegado multicast</p>
      </div>

      <div className="flex flex-col gap-4 px-4 py-4 sm:px-5">
        <div role="radiogroup" aria-label="Versión de Ejecutar" className="flex flex-wrap gap-1.5">
          {(
            [
              ['directo', 'Primera versión: validate(x)'],
              ['final', 'Versión final: GetInvocationList() + &&'],
            ] as [Modo, string][]
          ).map(([m, txt]) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={modo === m}
              tabIndex={modo === m ? 0 : -1}
              onClick={() => {
                limpiar();
                setModo(m);
              }}
              onKeyDown={(e) => {
                // Patrón de radiogroup con dos opciones: cualquier flecha cambia a la otra.
                if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
                e.preventDefault();
                const otro: Modo = m === 'directo' ? 'final' : 'directo';
                limpiar();
                setModo(otro);
                const grupo = e.currentTarget.parentElement;
                grupo?.querySelector<HTMLButtonElement>(`[data-modo="${otro}"]`)?.focus();
              }}
              data-modo={m}
              className={cn(
                'min-h-9 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring sm:min-h-7',
                modo === m ? 'border-fd-foreground bg-fd-foreground text-fd-background' : 'hover:bg-fd-accent',
              )}
            >
              {txt}
            </button>
          ))}
        </div>

        <fieldset>
          <legend className={etiqueta}>Métodos en la lista de invocación (en el orden de los +=)</legend>
          <ol className="mt-1.5 flex flex-col gap-1.5">
            {VALIDACIONES.map((v) => {
              const activa = activas.includes(v.id);
              const llamada = traza?.llamadas.includes(v.id) && traza.lineas.slice(0, visibles).some((l) => l.validacion === v.id);
              const saltada = terminado && activa && !traza?.llamadas.includes(v.id);
              return (
                <li key={v.id}>
                  <label
                    className={cn(
                      'relative flex cursor-pointer items-start gap-2.5 overflow-hidden rounded-md border px-3 py-2 text-sm transition-colors',
                      !activa && 'opacity-50',
                    )}
                  >
                    {enCurso === v.id && (
                      <motion.span
                        layoutId={reducir ? undefined : 'validador-actual'}
                        className="absolute inset-0 bg-fd-primary/10"
                        transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                        aria-hidden
                      />
                    )}
                    <input type="checkbox" checked={activa} onChange={() => alternar(v.id)} className="relative mt-0.5 size-4 accent-fd-primary" />
                    <span className="relative min-w-0 flex-1">
                      <span className="block font-mono text-xs break-words">
                        {v.id === primeraActiva ? 'validar = ' : 'validar += '}
                        {v.codigo}
                      </span>
                      <span className="text-xs text-fd-muted-foreground">{v.forma}</span>
                    </span>
                    <span className="relative shrink-0 text-xs text-fd-muted-foreground">
                      {llamada ? 'llamado' : saltada ? 'no se llama' : ''}
                    </span>
                  </label>
                </li>
              );
            })}
          </ol>
        </fieldset>

        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1">
            <span className={etiqueta}>Número</span>
            <input
              type="text"
              inputMode="numeric"
              value={texto}
              onChange={(e) => {
                setTexto(e.target.value);
                limpiar();
              }}
              onKeyDown={(e) => e.key === 'Enter' && ejecutar()}
              aria-invalid={!valido}
              className="h-10 w-28 rounded-md border bg-fd-background px-3 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring sm:h-8"
            />
          </label>
          <button type="button" onClick={ejecutar} disabled={!valido} className={botonPrimario}>
            <Play className="size-3.5" aria-hidden />
            Ejecutar
          </button>
          <button type="button" onClick={limpiar} className={botonSecundario}>
            <RotateCcw className="size-3.5" aria-hidden />
            Limpiar
          </button>
          {[-6, 8, 7, 24].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => {
                setTexto(String(n));
                limpiar();
              }}
              className={cn(botonSecundario, 'font-mono')}
            >
              {n}
            </button>
          ))}
        </div>

        <div
          aria-live="polite"
          className="min-h-32 overflow-x-auto rounded-md border bg-fd-muted/40 px-3 py-2 font-mono text-xs leading-relaxed"
        >
          {!traza && <p className="text-fd-muted-foreground">Elige un número y pulsa Ejecutar.</p>}
          {traza?.lineas.slice(0, visibles).map(({ linea }, i) => (
            <motion.p
              key={`${i}-${linea.texto}`}
              initial={reducir ? false : { opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'whitespace-pre-wrap',
                linea.tipo === 'ok' && cn(okTexto, 'font-semibold'),
                linea.tipo === 'mal' && cn(malTexto, 'font-semibold'),
                linea.tipo === 'nota' && 'italic text-fd-muted-foreground',
              )}
            >
              {linea.texto}
            </motion.p>
          ))}
        </div>

        {terminado && traza && (
          <p className="text-xs leading-relaxed text-fd-muted-foreground">
            {modo === 'directo'
              ? `Se han llamado los ${traza.llamadas.length} métodos, pero validate(x) solo devuelve lo del último (${bool(traza.resultado)}). Lo que digan los anteriores no cuenta.`
              : traza.llamadas.length < activas.length
                ? `Cortocircuito: en cuanto un paso da False, resultado && paso(x) ya es false y no se llama a los ${activas.length - traza.llamadas.length} métodos que quedan.`
                : `Se han llamado los ${traza.llamadas.length} métodos y el resultado es ${bool(traza.resultado)} porque todos han dado True${traza.resultado ? '' : ' menos el último'}.`}
          </p>
        )}
      </div>
    </section>
  );
}
