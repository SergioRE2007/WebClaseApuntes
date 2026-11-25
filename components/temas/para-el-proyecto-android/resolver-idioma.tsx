'use client';

import { useId, useState } from 'react';
import { motion, MotionConfig } from 'motion/react';
import { cn } from '@/lib/cn';
import { avisoTexto, bloque, cabecera, etiqueta, tituloBloque } from '@/components/interactive/estilos';

type Clave = 'app_name' | 'productos' | 'pedidos' | 'ajustes' | 'saludo';

const VALUES: Record<Clave, string> = {
  app_name: 'Shop',
  productos: 'Products',
  pedidos: 'Orders',
  ajustes: 'Settings',
  saludo: 'Hi, %1$s',
};

const VALUES_ES: Record<Clave, string> = {
  app_name: 'Tienda',
  productos: 'Productos',
  pedidos: 'Pedidos',
  ajustes: 'Ajustes',
  saludo: 'Hola, %1$s',
};

const IDIOMAS = [
  { codigo: 'es-ES', nombre: 'Español (España)' },
  { codigo: 'es-MX', nombre: 'Español (México)' },
  { codigo: 'en-US', nombre: 'English (United States)' },
  { codigo: 'fr-FR', nombre: 'Français' },
  { codigo: 'de-DE', nombre: 'Deutsch' },
];

const CLAVES: Clave[] = ['app_name', 'productos', 'pedidos', 'ajustes', 'saludo'];

/**
 * Enseña cómo elige Android el strings.xml según el idioma del móvil:
 * values-es para cualquier español y values para el resto, texto a texto.
 */
export function ResolverIdioma({ nombre = 'Ana' }: { nombre?: string }) {
  const [idioma, setIdioma] = useState('es-ES');
  const [faltaPedidos, setFaltaPedidos] = useState(false);
  const idSelect = useId();

  const espanol = idioma.startsWith('es');
  const enEs = (c: Clave) => !(faltaPedidos && c === 'pedidos');
  const origen = (c: Clave): 'values-es' | 'values' => (espanol && enEs(c) ? 'values-es' : 'values');
  const texto = (c: Clave) => (origen(c) === 'values-es' ? VALUES_ES[c] : VALUES[c]);
  const formatear = (plantilla: string) => plantilla.replace('%1$s', nombre);

  const carpeta = (titulo: 'values' | 'values-es', datos: Record<Clave, string>) => (
    <div className={cn('min-w-0 rounded-lg border bg-fd-card', espanol === (titulo === 'values-es') && 'border-fd-primary')}>
      <div className="border-b px-3 py-2 font-mono text-xs">
        res/{titulo}/strings.xml {titulo === 'values' && <span className="text-fd-muted-foreground">(por defecto)</span>}
      </div>
      <ul className="flex flex-col px-3 py-2 font-mono text-[0.7rem] leading-5">
        {CLAVES.map((c) => {
          const existe = titulo === 'values' || enEs(c);
          const usada = existe && origen(c) === titulo;
          return (
            <li
              key={c}
              className={cn(
                'flex justify-between gap-2 rounded px-1',
                usada ? 'bg-fd-primary/10 text-fd-foreground' : 'text-fd-muted-foreground',
                !existe && 'line-through opacity-60',
              )}
            >
              <span className="truncate">{c}</span>
              <span className="truncate">{existe ? datos[c] : 'falta'}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <MotionConfig reducedMotion="user">
      <section aria-label="Cómo elige Android el idioma" className={bloque}>
        <div className={cabecera}>
          <span className={etiqueta}>Demo</span>
          <p className={cn(tituloBloque, 'min-w-0 flex-1')}>Qué strings.xml usa el móvil</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b px-4 py-3 text-sm sm:px-5">
          <label htmlFor={idSelect} className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-fd-muted-foreground">Idioma del móvil</span>
            <select
              id={idSelect}
              value={idioma}
              onChange={(e) => setIdioma(e.target.value)}
              className="min-h-9 rounded-md border bg-fd-background px-2 text-sm"
            >
              {IDIOMAS.map((i) => (
                <option key={i.codigo} value={i.codigo}>
                  {i.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={faltaPedidos}
              onChange={(e) => setFaltaPedidos(e.target.checked)}
              className="accent-fd-primary"
            />
            Olvidar traducir <code>pedidos</code> en values-es
          </label>
        </div>

        <div className="grid gap-4 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,14rem)] sm:px-5">
          <div className="grid min-w-0 gap-3">
            {carpeta('values', VALUES)}
            {carpeta('values-es', VALUES_ES)}
          </div>

          <motion.div
            key={`${espanol}-${faltaPedidos}`}
            initial={{ opacity: 0.4, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="mx-auto flex h-64 w-full max-w-56 flex-col overflow-hidden rounded-lg border bg-fd-background"
            aria-label="Pantalla de ejemplo"
            role="group"
          >
            <div className="border-b px-3 py-2 text-sm font-semibold">{texto('app_name')}</div>
            <div className="flex-1 px-3 py-3 text-sm">{formatear(texto('saludo'))}</div>
            <div className="grid grid-cols-3 border-t text-center text-[0.7rem]">
              {(['productos', 'pedidos', 'ajustes'] as Clave[]).map((c) => (
                <span
                  key={c}
                  className={cn('truncate px-1 py-2', c === 'pedidos' && faltaPedidos && espanol && avisoTexto)}
                >
                  {texto(c)}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        <p className="border-t px-4 py-3 text-xs text-fd-muted-foreground sm:px-5" aria-live="polite">
          {espanol
            ? `Con ${IDIOMAS.find((i) => i.codigo === idioma)?.nombre} Android usa values-es${
                idioma === 'es-MX' ? ' (no hay values-es-rMX, así que vale la de español general)' : ''
              }${faltaPedidos ? ', y el texto que falta lo coge de values: sale «Orders» en inglés' : ''}.`
            : 'No hay carpeta para este idioma, así que Android usa values, la de por defecto (en inglés).'}
        </p>
      </section>
    </MotionConfig>
  );
}
