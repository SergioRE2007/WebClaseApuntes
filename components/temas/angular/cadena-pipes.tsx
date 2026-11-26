'use client';

import { useId, useState } from 'react';
import { motion, MotionConfig } from 'motion/react';
import { cn } from '@/lib/cn';
import { bloque, botonSecundario, cabecera, etiqueta, tituloBloque } from '@/components/interactive/estilos';

/**
 * Cadena de pipes: un valor de la clase entra por la izquierda del primer `|`
 * y el resultado de cada pipe entra en el siguiente. Cada paso enseña el valor
 * intermedio; al cambiar la cadena, los valores aparecen uno detrás de otro,
 * en el orden en que Angular aplica los pipes. La propiedad de la clase no
 * cambia nunca: solo cambia lo que se pinta.
 */

type PipeId = 'uppercase' | 'lowercase' | 'titlecase' | 'slice:0:4' | 'recortar:6' | 'json';
type Hueco = PipeId | '';

// Angular separa las palabras por letras y dígitos (Unicode).
const PALABRA = new RegExp('[\\p{L}\\p{N}]+', 'gu');

const PIPES: Record<PipeId, { explicacion: string; aplicar: (s: string) => string }> = {
  uppercase: { explicacion: 'todo en mayúsculas', aplicar: (s) => s.toUpperCase() },
  lowercase: { explicacion: 'todo en minúsculas', aplicar: (s) => s.toLowerCase() },
  titlecase: {
    explicacion: 'mayúscula al principio de cada palabra y el resto en minúsculas',
    aplicar: (s) => s.replace(PALABRA, (p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()),
  },
  'slice:0:4': { explicacion: 'se queda con los caracteres de las posiciones 0 a 3', aplicar: (s) => s.slice(0, 4) },
  'recortar:6': {
    explicacion: 'pipe propio de esta página: si pasa de 6 caracteres, corta y añade …',
    aplicar: (s) => (s.length > 6 ? s.slice(0, 6) + '…' : s),
  },
  json: { explicacion: 'lo pasa a JSON: a un texto le pone comillas', aplicar: (s) => JSON.stringify(s, null, 2) },
};

const OPCIONES: PipeId[] = ['uppercase', 'lowercase', 'titlecase', 'slice:0:4', 'recortar:6', 'json'];

const EJEMPLOS: { nombre: string; huecos: [Hueco, Hueco, Hueco] }[] = [
  { nombre: 'Uno solo', huecos: ['titlecase', '', ''] },
  { nombre: 'Encadenados', huecos: ['titlecase', 'slice:0:4', ''] },
  { nombre: 'lowercase | titlecase', huecos: ['lowercase', 'titlecase', ''] },
  { nombre: 'titlecase | lowercase', huecos: ['titlecase', 'lowercase', ''] },
  { nombre: 'Pipe propio', huecos: ['recortar:6', 'uppercase', ''] },
];

export function CadenaPipes({ titulo = 'Cadena de pipes' }: { titulo?: string }) {
  const baseId = useId();
  const [valor, setValor] = useState('neon racer');
  const [huecos, setHuecos] = useState<[Hueco, Hueco, Hueco]>(['titlecase', '', '']);

  const cadena = huecos.filter((h): h is PipeId => h !== '');
  const pasos: { pipe: PipeId; resultado: string }[] = [];
  let actual = valor;
  for (const pipe of cadena) {
    actual = PIPES[pipe].aplicar(actual);
    pasos.push({ pipe, resultado: actual });
  }
  const expresion = `{{ titulo${cadena.map((p) => ` | ${p}`).join('')} }}`;
  const ejemploActivo = EJEMPLOS.find((e) => e.huecos.every((h, i) => h === huecos[i]))?.nombre;

  const cambiarHueco = (i: number, h: Hueco) => {
    setHuecos((prev) => {
      const nuevo: [Hueco, Hueco, Hueco] = [...prev];
      nuevo[i] = h;
      return nuevo;
    });
  };

  return (
    <MotionConfig reducedMotion="user">
      <section aria-label={titulo} className={bloque}>
        <div className={cabecera}>
          <span className={etiqueta}>Demo</span>
          <p className={cn(tituloBloque, 'min-w-0 flex-1')}>{titulo}</p>
        </div>

        <div className="flex flex-col gap-4 px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Ejemplos ya montados">
            <span className={etiqueta}>Ejemplos:</span>
            {EJEMPLOS.map((e) => (
              <button
                key={e.nombre}
                type="button"
                onClick={() => setHuecos([...e.huecos])}
                aria-pressed={ejemploActivo === e.nombre}
                className={cn(botonSecundario, ejemploActivo === e.nombre && 'border-fd-primary text-fd-primary')}
              >
                {e.nombre}
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <label className="flex min-w-0 flex-col gap-1">
              <span className={etiqueta}>titulo (en la clase)</span>
              <input
                value={valor}
                maxLength={40}
                onChange={(e) => setValor(e.target.value)}
                className="min-h-10 w-full rounded-md border bg-fd-background px-2 py-1.5 font-mono text-xs text-fd-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring sm:min-h-8"
              />
            </label>
            {huecos.map((h, i) => (
              <div key={i} className="flex min-w-0 flex-col gap-1">
                <label htmlFor={`${baseId}-pipe-${i}`} className={etiqueta}>
                  Pipe {i + 1}
                </label>
                <select
                  id={`${baseId}-pipe-${i}`}
                  value={h}
                  onChange={(e) => {
                    const v = e.target.value;
                    cambiarHueco(i, v === '' ? '' : (OPCIONES.find((o) => o === v) ?? ''));
                  }}
                  className="min-h-10 w-full rounded-md border bg-fd-background px-2 py-1.5 font-mono text-xs text-fd-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring sm:min-h-8"
                >
                  <option value="">(ninguno)</option>
                  {OPCIONES.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div>
            <p className={cn(etiqueta, 'mb-1')}>Plantilla</p>
            <pre className="overflow-x-auto rounded-md border bg-fd-muted/40 px-3 py-2 font-mono text-xs text-fd-foreground">
              {expresion}
            </pre>
          </div>

          {/* La cadena, paso a paso */}
          <ol className="flex flex-col" aria-label="Cómo pasa el valor por cada pipe">
            <Paso
              indice={0}
              etiquetaPaso="valor de la clase"
              valorPaso={valor}
              explicacionPaso="entra por la izquierda del primer |"
              ultimo={pasos.length === 0}
            />
            {pasos.map((p, i) => (
              <Paso
                key={`${i}-${p.pipe}`}
                indice={i + 1}
                etiquetaPaso={`| ${p.pipe}`}
                valorPaso={p.resultado}
                explicacionPaso={PIPES[p.pipe].explicacion}
                ultimo={i === pasos.length - 1}
              />
            ))}
          </ol>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="min-w-0 rounded-md border">
              <p className={cn(etiqueta, 'border-b px-3 py-1.5')}>Navegador (vista)</p>
              <p className="min-h-10 whitespace-pre-wrap break-all px-3 py-2 text-lg font-semibold" aria-live="polite">
                {actual}
              </p>
            </div>
            <div className="min-w-0 rounded-md border">
              <p className={cn(etiqueta, 'border-b px-3 py-1.5')}>La clase sigue igual</p>
              <code className="block break-all px-3 py-2 font-mono text-xs leading-relaxed">titulo = &apos;{valor}&apos;;</code>
            </div>
          </div>

          <p className="text-xs text-fd-muted-foreground">
            Prueba los dos ejemplos con <code>lowercase</code> y <code>titlecase</code>: en una cadena manda el último pipe, así
            que el orden cambia el resultado.
          </p>
        </div>
      </section>
    </MotionConfig>
  );
}

function Paso({
  indice,
  etiquetaPaso,
  valorPaso,
  explicacionPaso,
  ultimo,
}: {
  indice: number;
  etiquetaPaso: string;
  valorPaso: string;
  explicacionPaso: string;
  ultimo: boolean;
}) {
  return (
    <li className="relative flex gap-3 pb-3 last:pb-0">
      {/* Línea vertical que une los pasos */}
      {!ultimo ? <span aria-hidden className="absolute left-[0.6875rem] top-6 bottom-0 w-px bg-fd-border" /> : null}
      <span
        aria-hidden
        className="relative mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border bg-fd-background font-mono text-[11px] text-fd-muted-foreground"
      >
        {indice}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
        <span className="shrink-0 font-mono text-xs font-semibold text-fd-foreground sm:w-32">{etiquetaPaso}</span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <motion.code
            key={valorPaso}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.22, delay: indice * 0.08, ease: 'easeOut' }}
            className="w-fit max-w-full whitespace-pre-wrap break-all rounded border bg-fd-muted/40 px-1.5 py-0.5 font-mono text-xs text-fd-foreground"
          >
            {valorPaso === '' ? ' ' : valorPaso}
          </motion.code>
          <span className="text-[11px] text-fd-muted-foreground">{explicacionPaso}</span>
        </div>
      </div>
    </li>
  );
}
