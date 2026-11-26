'use client';

import { useId, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { z } from 'zod';
import { cn } from '@/lib/cn';
import { bloque, cabecera, etiqueta, malCaja, malTexto, okCaja, okTexto, tituloBloque } from '@/components/interactive/estilos';

/**
 * Playground de Zod 4 con los tres schemas de users.schema.ts. Valida de
 * verdad (usa la librería zod) y enseña lo que haría el middleware validate:
 * 400 con z.treeifyError(...) o req.body = parsed.data.
 */

const SCHEMAS = {
  updateUserSchema: {
    schema: z.object({
      name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
      email: z.email('Email inválido').optional(),
    }),
    codigo: `z.object({
  name: z.string().min(2, '...').optional(),
  email: z.email('Email inválido').optional(),
})`,
    tipo: '{ name?: string | undefined; email?: string | undefined }',
    ejemplo: '{ "name": "A", "email": "ana@", "rol": "admin" }',
  },
  registerSchema: {
    schema: z.object({
      email: z.email('Email inválido'),
      name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
      password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    }),
    codigo: `z.object({
  email: z.email('Email inválido'),   // en clase: z.string().email(...)
  name: z.string().min(2, '...'),
  password: z.string().min(8, '...'),
})`,
    tipo: '{ email: string; name: string; password: string }',
    ejemplo: '{ "email": "eva@example.com", "name": "Eva", "password": "1234" }',
  },
  loginSchema: {
    schema: z.object({
      email: z.email('Email inválido'),
      password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    }),
    codigo: `z.object({
  email: z.email('Email inválido'),
  password: z.string().min(8, '...'),
})`,
    tipo: '{ email: string; password: string }',
    ejemplo: '{ "email": "ana@example.com", "password": "password123" }',
  },
} as const;

type Nombre = keyof typeof SCHEMAS;
const NOMBRES = Object.keys(SCHEMAS) as Nombre[];

type Salida =
  | { tipo: 'json-roto'; mensaje: string }
  | { tipo: 'ok'; datos: unknown; quitadas: string[] }
  | { tipo: 'error'; arbol: unknown; mensajes: { ruta: string; mensaje: string }[] };

export function PlaygroundZod({ titulo = 'Prueba los schemas de users.schema.ts' }: { titulo?: string }) {
  const reducir = useReducedMotion();
  const idTexto = useId();
  const [nombre, setNombre] = useState<Nombre>('updateUserSchema');
  const [texto, setTexto] = useState<string>(SCHEMAS.updateUserSchema.ejemplo);

  const salida = useMemo<Salida>(() => {
    let body: unknown;
    try {
      body = texto.trim() === '' ? undefined : JSON.parse(texto);
    } catch (e) {
      return { tipo: 'json-roto', mensaje: e instanceof Error ? e.message : 'JSON inválido' };
    }
    const r = SCHEMAS[nombre].schema.safeParse(body);
    if (r.success) {
      const quitadas =
        body && typeof body === 'object' && !Array.isArray(body)
          ? Object.keys(body).filter((k) => !(k in (r.data as Record<string, unknown>)) && !(k in SCHEMAS[nombre].schema.shape))
          : [];
      return { tipo: 'ok', datos: r.data, quitadas };
    }
    return {
      tipo: 'error',
      arbol: z.treeifyError(r.error),
      mensajes: r.error.issues.map((i) => ({ ruta: i.path.join('.') || '(raíz)', mensaje: i.message })),
    };
  }, [nombre, texto]);

  const s = SCHEMAS[nombre];

  return (
    <section aria-label={titulo} className={bloque}>
      <div className={cabecera}>
        <span className={etiqueta}>Demo</span>
        <p className={cn(tituloBloque, 'min-w-0 flex-1')}>{titulo}</p>
      </div>

      <div className="space-y-4 px-4 py-4 sm:px-5">
        <div role="group" aria-label="Schema" className="flex flex-wrap gap-1.5">
          {NOMBRES.map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={n === nombre}
              onClick={() => {
                setNombre(n);
                setTexto(SCHEMAS[n].ejemplo);
              }}
              className={cn(
                'min-h-8 rounded-md border px-2.5 py-1 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring',
                n === nombre ? 'border-fd-primary/60 bg-fd-primary/10 text-fd-foreground' : 'text-fd-muted-foreground hover:bg-fd-accent',
              )}
            >
              {n}
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="min-w-0 space-y-2">
            <pre className="overflow-x-auto rounded-md border bg-fd-secondary/40 px-3 py-2 font-mono text-xs text-fd-foreground">{s.codigo}</pre>
            <p className="text-xs text-fd-muted-foreground">
              <code className="font-mono">z.infer</code> da: <code className="break-words font-mono text-fd-foreground">{s.tipo}</code>
            </p>
          </div>
          <div className="min-w-0">
            <label htmlFor={idTexto} className="mb-1 block text-xs font-medium text-fd-muted-foreground">
              req.body que llega (JSON; vacío = undefined)
            </label>
            <textarea
              id={idTexto}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={4}
              spellCheck={false}
              className="w-full resize-y rounded-md border bg-fd-background px-3 py-2 font-mono text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
            />
          </div>
        </div>

        <div aria-live="polite">
        <motion.div
          key={salida.tipo}
          initial={reducir ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className={cn('rounded-md border', salida.tipo === 'ok' ? okCaja : malCaja)}
        >
          {salida.tipo === 'json-roto' && (
            <p className="px-3 py-2 text-sm">
              <span className={cn('font-semibold', malTexto)}>No es JSON válido.</span> Esto ni llega a Zod: lo rechaza antes{' '}
              <code className="font-mono">express.json()</code> ({salida.mensaje}).
            </p>
          )}
          {salida.tipo === 'ok' && (
            <div className="space-y-1 px-3 py-2">
              <p className={cn('text-sm font-semibold', okTexto)}>success: true → req.body = parsed.data y next()</p>
              <pre className="overflow-x-auto whitespace-pre-wrap break-all font-mono text-xs">{JSON.stringify(salida.datos, null, 2)}</pre>
              {salida.quitadas.length > 0 && (
                <p className="text-xs text-fd-muted-foreground">
                  Fuera: {salida.quitadas.map((k) => `«${k}»`).join(', ')}. <code className="font-mono">z.object</code> quita las claves que no
                  están en el schema.
                </p>
              )}
            </div>
          )}
          {salida.tipo === 'error' && (
            <div className="space-y-2 px-3 py-2">
              <p className={cn('text-sm font-semibold', malTexto)}>success: false → 400</p>
              <ul className="space-y-0.5 text-sm">
                {salida.mensajes.map((m, i) => (
                  <li key={i}>
                    <code className="font-mono text-xs">{m.ruta}</code>: {m.mensaje}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-fd-muted-foreground">
                Body que manda <code className="font-mono">validate</code>:
              </p>
              <pre className="max-h-56 overflow-auto whitespace-pre-wrap break-all font-mono text-xs">
                {JSON.stringify({ errors: salida.arbol }, null, 2)}
              </pre>
            </div>
          )}
        </motion.div>
        </div>
      </div>
    </section>
  );
}
