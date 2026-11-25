'use client';

import { useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  avisoTexto,
  bloque,
  botonPrimario,
  botonSecundario,
  cabecera,
  etiqueta,
  malTexto,
  okCaja,
  okTexto,
  tituloBloque,
} from '@/components/interactive/estilos';

/**
 * Simula el formulario reactivo de proj-game (18/11): tres FormControl con
 * los validadores de clase, sus estados (valid, touched, dirty), el objeto
 * `errors` y la condición con la que la plantilla decide si enseña el mensaje.
 * Las reglas imitan a Validators de Angular: min/max no dan error con el campo
 * vacío (de eso se encarga required).
 */

type Campo = 'title' | 'price' | 'stock';

interface Estado {
  valor: string;
  touched: boolean;
  dirty: boolean;
}

const INICIAL: Record<Campo, Estado> = {
  title: { valor: '', touched: false, dirty: false },
  price: { valor: '', touched: false, dirty: false },
  stock: { valor: '', touched: false, dirty: false },
};

const DEF: Record<Campo, { etiqueta: string; tipo: 'text' | 'number'; validadores: string; conSubmitted: boolean }> = {
  title: { etiqueta: 'Título', tipo: 'text', validadores: 'required, minLength(3)', conSubmitted: false },
  price: { etiqueta: 'Precio', tipo: 'number', validadores: 'required, min(0.01), max(100)', conSubmitted: true },
  stock: { etiqueta: 'Stock', tipo: 'number', validadores: 'required, min(0), max(999)', conSubmitted: true },
};

type Errores = Record<string, unknown> | null;

function validar(campo: Campo, valor: string): Errores {
  const e: Record<string, unknown> = {};
  // Validators.required solo falla con el valor vacío: unos espacios cuentan como texto.
  if (valor === '') return { required: true };
  if (campo === 'title') {
    if (valor.length < 3) e.minlength = { requiredLength: 3, actualLength: valor.length };
  } else {
    const n = Number(valor);
    const [min, max] = campo === 'price' ? [0.01, 100] : [0, 999];
    if (n < min) e.min = { min, actual: n };
    if (n > max) e.max = { max, actual: n };
  }
  return Object.keys(e).length ? e : null;
}

const json = (v: unknown) => (v === null ? 'null' : JSON.stringify(v).replace(/"(\w+)":/g, '$1: ').replace(/,/g, ', '));

function mensajes(campo: Campo, errores: Errores): string[] {
  if (!errores) return [];
  const m: string[] = [];
  if ('required' in errores) m.push(campo === 'title' ? 'Título obligatorio...' : `${DEF[campo].etiqueta} es obligatorio...`);
  if ('minlength' in errores) m.push('Longitud mínima 3...');
  if ('min' in errores || 'max' in errores) m.push(campo === 'price' ? 'Precio fuera de rango permitido [0.01-100]' : 'Stock fuera de rango permitido [0-999]');
  return m;
}

export function InspectorFormControl({ titulo = 'Inspector de un formulario reactivo' }: { titulo?: string }) {
  const [campos, setCampos] = useState(INICIAL);
  const [submitted, setSubmitted] = useState(false);
  const [barrera, setBarrera] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);

  const errores = (c: Campo) => validar(c, campos[c].valor);
  const formValido = (Object.keys(campos) as Campo[]).every((c) => errores(c) === null);

  const cambiar = (c: Campo, valor: string) => {
    setCampos((s) => ({ ...s, [c]: { ...s[c], valor, dirty: true } }));
    setResultado(null);
  };
  const tocar = (c: Campo) => setCampos((s) => ({ ...s, [c]: { ...s[c], touched: true } }));

  const guardar = () => {
    setSubmitted(true);
    if (barrera) setCampos((s) => ({ title: { ...s.title, touched: true }, price: { ...s.price, touched: true }, stock: { ...s.stock, touched: true } }));
    if (!formValido) {
      setResultado('form.invalid es true: return. No se llama a GameService (en Network no sale ninguna petición).');
      return;
    }
    const valor = `{ title: '${campos.title.valor}', price: ${Number(campos.price.valor)}, stock: ${Number(campos.stock.valor)} }`;
    setResultado(`gameService.create(form.value) → POST /games con ${valor}. Después form.resetForm().`);
    setCampos(INICIAL);
    setSubmitted(false);
  };

  const reiniciar = () => {
    setCampos(INICIAL);
    setSubmitted(false);
    setResultado(null);
  };

  return (
    <MotionConfig reducedMotion="user">
      <section aria-label={titulo} className={bloque}>
        <div className={cabecera}>
          <span className={etiqueta}>Demo</span>
          <p className={cn(tituloBloque, 'min-w-0 flex-1')}>{titulo}</p>
        </div>

        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            guardar();
          }}
          className="grid gap-4 px-4 py-4 sm:px-5"
        >
          {(Object.keys(DEF) as Campo[]).map((c) => {
            const d = DEF[c];
            const s = campos[c];
            const err = errores(c);
            const invalido = err !== null;
            const ver = invalido && (s.touched || s.dirty || (d.conSubmitted && submitted));
            const id = `inspector-${c}`;
            return (
              <div key={c} className="grid gap-2 rounded-md border p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] sm:gap-4">
                <div className="grid content-start gap-1.5">
                  <label htmlFor={id} className="text-sm font-medium">
                    {d.etiqueta} <span className="font-normal text-fd-muted-foreground">({d.validadores})</span>
                  </label>
                  <input
                    id={id}
                    type={d.tipo}
                    step="any"
                    value={s.valor}
                    onChange={(e) => cambiar(c, e.target.value)}
                    onBlur={() => tocar(c)}
                    className={cn(
                      'min-h-10 w-full rounded-md border bg-fd-background px-2 py-1 text-sm sm:min-h-8',
                      ver && 'border-red-600/60 dark:border-red-400/60',
                    )}
                  />
                  <div className="min-h-5 text-xs" aria-live="polite">
                    <AnimatePresence initial={false}>
                      {ver &&
                        mensajes(c, err).map((m) => (
                          <motion.p key={m} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={malTexto}>
                            {m}
                          </motion.p>
                        ))}
                    </AnimatePresence>
                  </div>
                </div>
                <dl className="grid grid-cols-[auto_minmax(0,1fr)] content-start gap-x-3 gap-y-0.5 font-mono text-xs">
                  <dt className="text-fd-muted-foreground">{c}.value</dt>
                  <dd className="truncate">{d.tipo === 'number' ? (s.valor === '' ? 'null' : Number(s.valor)) : `'${s.valor}'`}</dd>
                  <dt className="text-fd-muted-foreground">valid</dt>
                  <dd className={invalido ? malTexto : okTexto}>{String(!invalido)}</dd>
                  <dt className="text-fd-muted-foreground">touched</dt>
                  <dd>{String(s.touched)}</dd>
                  <dt className="text-fd-muted-foreground">dirty</dt>
                  <dd>{String(s.dirty)}</dd>
                  <dt className="text-fd-muted-foreground">errors</dt>
                  <dd className="break-words">{json(err)}</dd>
                  <dt className="text-fd-muted-foreground">¿mensaje?</dt>
                  <dd className={ver ? avisoTexto : undefined}>
                    {ver ? 'sí' : 'no'}{' '}
                    <span className="text-fd-muted-foreground">
                      (invalid && (touched || dirty{d.conSubmitted ? ' || submitted' : ''}))
                    </span>
                  </dd>
                </dl>
              </div>
            );
          })}

          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1" checked={barrera} onChange={(e) => setBarrera(e.target.checked)} />
            <span>
              Barrera de la guía: <code>markAllAsTouched()</code> antes de comprobar <code>invalid</code>
            </span>
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <button type="submit" className={botonPrimario}>
              Guardar
            </button>
            <button type="button" className={botonSecundario} onClick={reiniciar}>
              <RotateCcw className="size-3.5" aria-hidden />
              Empezar de nuevo
            </button>
            <span className="font-mono text-xs text-fd-muted-foreground">
              Válido: {String(formValido)} · Enviado: {String(submitted)}
            </span>
          </div>

          <AnimatePresence initial={false}>
            {resultado && (
              <motion.p
                key={resultado}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                role="status"
                className={cn('rounded-md border px-3 py-2 text-sm', resultado.startsWith('gameService') ? okCaja : 'bg-fd-card')}
              >
                {resultado}
              </motion.p>
            )}
          </AnimatePresence>
        </form>
      </section>
    </MotionConfig>
  );
}
