'use client';

import { useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/cn';
import { bloque, cabecera, etiqueta, malTexto, tituloBloque } from '@/components/interactive/estilos';

/**
 * Playground del formato compuesto de C#: {índice,alineación:especificador}.
 * Reproduce a mano las reglas de .NET 8 para los especificadores numéricos
 * estándar (C, D, E, F, G, N, P, X) en las culturas es-ES y en-US, con
 * agrupación de miles de 3 en 3 como hace .NET (no como Intl).
 */

type Cultura = 'es-ES' | 'en-US';
type Spec = '' | 'C' | 'D' | 'E' | 'F' | 'G' | 'N' | 'P' | 'X';

interface Valor {
  literal: string;
  numero: number;
  entero: boolean;
}

const VALORES: Valor[] = [
  { literal: '3.1416', numero: 3.1416, entero: false },
  { literal: '20', numero: 20, entero: true },
  { literal: '1234.56', numero: 1234.56, entero: false },
  { literal: '-123', numero: -123, entero: true },
  { literal: '-123.45', numero: -123.45, entero: false },
];

const SPECS: { id: Spec; nombre: string; explica: string }[] = [
  { id: '', nombre: 'ninguno', explica: 'Sin especificador se usa G (general): la forma más corta que representa el número.' },
  { id: 'C', nombre: 'C', explica: 'Moneda. La precisión son los decimales (por defecto 2). Símbolo y posición según la cultura.' },
  { id: 'D', nombre: 'D', explica: 'Entero en decimal. La precisión es el número mínimo de cifras (rellena con ceros). Solo enteros.' },
  { id: 'E', nombre: 'E', explica: 'Científico. La precisión son los decimales de la mantisa (por defecto 6). El exponente lleva al menos 3 cifras.' },
  { id: 'F', nombre: 'F', explica: 'Punto fijo. La precisión son los decimales (por defecto 2). Sin separador de miles.' },
  { id: 'G', nombre: 'G', explica: 'General: la forma más compacta. Con precisión, son las cifras significativas.' },
  { id: 'N', nombre: 'N', explica: 'Número con separador de miles. La precisión son los decimales (por defecto 2).' },
  { id: 'P', nombre: 'P', explica: 'Porcentaje: multiplica por 100 y añade %. La precisión son los decimales (por defecto 2).' },
  { id: 'X', nombre: 'X', explica: 'Hexadecimal. Solo enteros. La precisión es el número mínimo de cifras.' },
];

const PRECISIONES: (number | null)[] = [null, 0, 1, 2, 3, 4];
const ALINEACIONES: (number | null)[] = [null, 10, -10];

const SEP: Record<Cultura, { dec: string; miles: string }> = {
  'es-ES': { dec: ',', miles: '.' },
  'en-US': { dec: '.', miles: ',' },
};

function agrupar(entera: string, sep: string) {
  return entera.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}

function fijo(abs: number, decimales: number, cultura: Cultura, miles: boolean) {
  const [ent, frac] = abs.toFixed(decimales).split('.');
  const { dec, miles: sepMiles } = SEP[cultura];
  const parteEntera = miles ? agrupar(ent, sepMiles) : ent;
  return frac ? `${parteEntera}${dec}${frac}` : parteEntera;
}

function general(abs: number, precision: number | null, cultura: Cultura) {
  const { dec } = SEP[cultura];
  if (precision === null || precision === 0) return String(abs).replace('.', dec);
  const txt = abs.toPrecision(precision);
  if (txt.includes('e')) {
    const [mant, exp] = txt.split('e');
    const m = mant.includes('.') ? mant.replace(/0+$/, '').replace(/\.$/, '') : mant;
    const signo = exp.startsWith('-') ? '-' : '+';
    const cifras = exp.replace(/^[+-]/, '').padStart(2, '0');
    return `${m.replace('.', dec)}E${signo}${cifras}`;
  }
  const limpio = txt.includes('.') ? txt.replace(/0+$/, '').replace(/\.$/, '') : txt;
  return limpio.replace('.', dec);
}

type Resultado = { ok: true; texto: string } | { ok: false; error: string };

function formatear(v: Valor, spec: Spec, precision: number | null, cultura: Cultura): Resultado {
  const neg = v.numero < 0;
  const abs = Math.abs(v.numero);
  const menos = neg ? '-' : '';
  const { dec } = SEP[cultura];
  switch (spec) {
    case '':
      return { ok: true, texto: menos + general(abs, null, cultura) };
    case 'G':
      return { ok: true, texto: menos + general(abs, precision, cultura) };
    case 'C': {
      const s = fijo(abs, precision ?? 2, cultura, true);
      return { ok: true, texto: cultura === 'es-ES' ? `${menos}${s} €` : `${menos}$${s}` };
    }
    case 'D':
      if (!v.entero) return { ok: false, error: 'FormatException: D solo vale para enteros (int, long...).' };
      return { ok: true, texto: menos + String(abs).padStart(precision ?? 0, '0') };
    case 'E': {
      const [mant, exp] = abs.toExponential(precision ?? 6).split('e');
      const signo = exp.startsWith('-') ? '-' : '+';
      const cifras = exp.replace(/^[+-]/, '').padStart(3, '0');
      return { ok: true, texto: `${menos}${mant.replace('.', dec)}E${signo}${cifras}` };
    }
    case 'F':
      return { ok: true, texto: menos + fijo(abs, precision ?? 2, cultura, false) };
    case 'N':
      return { ok: true, texto: menos + fijo(abs, precision ?? 2, cultura, true) };
    case 'P': {
      const s = fijo(abs * 100, precision ?? 2, cultura, true);
      return { ok: true, texto: cultura === 'es-ES' ? `${menos}${s} %` : `${menos}${s}%` };
    }
    case 'X': {
      if (!v.entero) return { ok: false, error: 'FormatException: X solo vale para enteros (int, long...).' };
      const hex = (v.numero >>> 0).toString(16).toUpperCase();
      return { ok: true, texto: hex.padStart(precision ?? 0, '0') };
    }
  }
}

function Selector<T>({
  etiquetaGrupo,
  opciones,
  valor,
  onCambio,
  pintar,
}: {
  etiquetaGrupo: string;
  opciones: T[];
  valor: T;
  onCambio: (v: T) => void;
  pintar: (v: T) => string;
}) {
  const id = useId();
  const botones = useRef<(HTMLButtonElement | null)[]>([]);
  const actual = Math.max(0, opciones.indexOf(valor));

  // Patrón de radiogroup: un solo botón en el orden de tabulación y las flechas mueven la selección.
  const alTeclear = (e: KeyboardEvent<HTMLButtonElement>) => {
    const n = opciones.length;
    const destino =
      e.key === 'ArrowRight' || e.key === 'ArrowDown'
        ? (actual + 1) % n
        : e.key === 'ArrowLeft' || e.key === 'ArrowUp'
          ? (actual - 1 + n) % n
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? n - 1
              : null;
    if (destino === null) return;
    e.preventDefault();
    onCambio(opciones[destino]);
    botones.current[destino]?.focus();
  };

  return (
    <div role="radiogroup" aria-labelledby={id} className="flex flex-col gap-1.5">
      <span id={id} className={etiqueta}>
        {etiquetaGrupo}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {opciones.map((o, i) => {
          const activo = i === actual;
          return (
            <button
              key={i}
              ref={(el) => {
                botones.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={activo}
              tabIndex={activo ? 0 : -1}
              onKeyDown={alTeclear}
              onClick={() => onCambio(o)}
              className={cn(
                'min-h-9 rounded-md border px-2.5 py-1 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring sm:min-h-7',
                activo
                  ? 'border-fd-foreground bg-fd-foreground text-fd-background'
                  : 'bg-fd-background text-fd-foreground hover:bg-fd-accent',
              )}
            >
              {pintar(o)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function FormatoCompuesto({ titulo = 'Prueba el formato compuesto' }: { titulo?: string }) {
  const reducir = useReducedMotion();
  const [valor, setValor] = useState<Valor>(VALORES[0]);
  const [spec, setSpec] = useState<Spec>('P');
  const [precision, setPrecision] = useState<number | null>(null);
  const [alin, setAlin] = useState<number | null>(null);
  const [cultura, setCultura] = useState<Cultura>('es-ES');
  const [consola, setConsola] = useState(false);

  const marcador = `{0${alin !== null ? `,${alin}` : ''}${spec ? `:${spec}${precision ?? ''}` : ''}}`;
  const linea =
    cultura === 'es-ES'
      ? `Console.WriteLine("${marcador}", ${valor.literal});`
      : `Console.WriteLine(string.Format(new CultureInfo("en-US"), "${marcador}", ${valor.literal}));`;

  const res = useMemo(() => formatear(valor, spec, precision, cultura), [valor, spec, precision, cultura]);

  let texto = res.ok ? res.texto : '';
  if (consola) texto = texto.replace('€', '?');
  const relleno = res.ok && alin !== null ? Math.max(0, Math.abs(alin) - texto.length) : 0;
  // Alineación positiva: pegado a la derecha (el relleno va antes). Negativa: a la izquierda.
  const rellenoAntes = alin !== null && alin > 0;
  const info = SPECS.find((s) => s.id === spec)!;

  return (
    <section aria-label={titulo} className={bloque}>
      <div className={cabecera}>
        <span className={etiqueta}>Demo</span>
        <p className={cn(tituloBloque, 'min-w-0 flex-1')}>{titulo}</p>
      </div>

      <div className="grid gap-4 px-4 py-4 sm:grid-cols-2 sm:px-5">
        <Selector etiquetaGrupo="Valor" opciones={VALORES} valor={valor} onCambio={setValor} pintar={(v) => (v.entero ? `${v.literal} (int)` : `${v.literal} (double)`)} />
        <Selector etiquetaGrupo="Especificador" opciones={SPECS.map((s) => s.id)} valor={spec} onCambio={setSpec} pintar={(s) => (s === '' ? 'ninguno' : s)} />
        <Selector etiquetaGrupo="Precisión (número tras la letra)" opciones={PRECISIONES} valor={precision} onCambio={setPrecision} pintar={(p) => (p === null ? 'sin' : String(p))} />
        <Selector etiquetaGrupo="Alineación (número tras la coma)" opciones={ALINEACIONES} valor={alin} onCambio={setAlin} pintar={(a) => (a === null ? 'sin' : String(a))} />
        <Selector etiquetaGrupo="Cultura" opciones={['es-ES', 'en-US'] as Cultura[]} valor={cultura} onCambio={setCultura} pintar={(c) => c} />
        <label className="flex items-center gap-2 self-end text-sm">
          <input type="checkbox" checked={consola} onChange={(e) => setConsola(e.target.checked)} className="size-4 accent-fd-primary" />
          Consola de Windows (pinta el € como ?)
        </label>
      </div>

      <div className="border-t px-4 py-4 sm:px-5">
        <p className={etiqueta}>Código</p>
        <pre className="mt-1.5 overflow-x-auto rounded-md border bg-fd-muted/40 px-3 py-2 font-mono text-xs leading-relaxed">
          <code>{linea}</code>
        </pre>
        {cultura === 'en-US' && (
          <p className="mt-1.5 text-xs text-fd-muted-foreground">
            <code>CultureInfo</code> necesita <code>using System.Globalization;</code> arriba del archivo.
          </p>
        )}

        <p className={cn(etiqueta, 'mt-4')}>Salida</p>
        <div aria-live="polite" className="mt-1.5 min-h-10 overflow-x-auto rounded-md border bg-fd-muted/40 px-3 py-2 font-mono text-sm">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${linea}|${consola}`}
              initial={reducir ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducir ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="whitespace-pre"
            >
              {res.ok ? (
                <>
                  {rellenoAntes && relleno > 0 && (
                    <span className="text-fd-muted-foreground/60" aria-label={`${relleno} espacios`}>
                      {'·'.repeat(relleno)}
                    </span>
                  )}
                  <span>{texto}</span>
                  {!rellenoAntes && relleno > 0 && (
                    <span className="text-fd-muted-foreground/60" aria-label={`${relleno} espacios`}>
                      {'·'.repeat(relleno)}
                    </span>
                  )}
                </>
              ) : (
                <span className={malTexto}>{res.error}</span>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-fd-muted-foreground">
          {info.explica}
          {alin !== null &&
            ` Alineación ${alin}: ocupa al menos ${Math.abs(alin)} caracteres, ${alin > 0 ? 'pegado a la derecha' : 'pegado a la izquierda'} (los puntos son los espacios de relleno). Si el texto ya es más largo, no se recorta.`}
        </p>
      </div>
    </section>
  );
}
