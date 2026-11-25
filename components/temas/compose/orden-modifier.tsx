'use client';

import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { ArrowDown, ArrowUp, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { bloque, botonSecundario, cabecera, etiqueta, tituloBloque } from '@/components/interactive/estilos';
import { CodigoDemo } from './comun';

/**
 * Playground del orden de los Modifier: cada modificador envuelve a los que
 * vienen detrás, como en Compose (el primero de la cadena es la capa de fuera).
 */

type Tipo = 'padding' | 'background' | 'clip' | 'clickable';

interface Mod {
  id: Tipo;
  activo: boolean;
}

const CODIGO: Record<Tipo, string> = {
  padding: '.padding(16.dp)',
  background: '.background(Color.LightGray)',
  clip: '.clip(RoundedCornerShape(16.dp))',
  clickable: '.clickable { clics++ }',
};

const PRESETS: { nombre: string; orden: Tipo[] }[] = [
  { nombre: 'Fondo y luego padding', orden: ['background', 'padding', 'clip', 'clickable'] },
  { nombre: 'Padding y luego fondo', orden: ['padding', 'background', 'clip', 'clickable'] },
  { nombre: 'Recorta y luego pinta', orden: ['padding', 'clip', 'background', 'clickable'] },
];

const INICIAL: Mod[] = [
  { id: 'padding', activo: true },
  { id: 'background', activo: true },
  { id: 'clip', activo: false },
  { id: 'clickable', activo: true },
];

function explicar(mods: Mod[]): string[] {
  const act = mods.filter((m) => m.activo).map((m) => m.id);
  const pos = (t: Tipo) => act.indexOf(t);
  const frases: string[] = [];
  const p = pos('padding');
  const b = pos('background');
  const c = pos('clip');
  const k = pos('clickable');
  if (p >= 0 && b >= 0) {
    frases.push(
      b < p
        ? 'El fondo va antes que el padding: pinta toda la caja, margen incluido. El padding queda dentro, como el padding de CSS.'
        : 'El padding va antes que el fondo: deja un hueco transparente alrededor y el fondo solo pinta lo de dentro, como un margin de CSS.',
    );
  }
  if (c >= 0 && b >= 0) {
    frases.push(
      c < b
        ? 'El clip va antes que el fondo, así que el fondo sale con las esquinas redondeadas.'
        : 'El clip va después del fondo: el fondo ya está pintado y no se recorta. El clip solo afecta a lo que viene detrás.',
    );
  }
  if (k >= 0 && p >= 0) {
    frases.push(
      p < k
        ? 'El clickable va después del padding: el margen exterior no responde al toque.'
        : 'El clickable va antes que el padding: también responde si tocas en el margen.',
    );
  }
  if (c >= 0 && k >= 0 && k < c) {
    frases.push('El clickable va antes que el clip: la onda del toque sale cuadrada, sin redondear.');
  }
  if (!frases.length) frases.push('Activa varios modificadores para ver cómo influye el orden.');
  return frases;
}

export function OrdenModifier() {
  const [mods, setMods] = useState<Mod[]>(INICIAL);
  const [clics, setClics] = useState(0);
  const [onda, setOnda] = useState(0);

  const mover = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= mods.length) return;
    const copia = [...mods];
    [copia[i], copia[j]] = [copia[j], copia[i]];
    setMods(copia);
  };

  const alternar = (id: Tipo) => setMods(mods.map((m) => (m.id === id ? { ...m, activo: !m.activo } : m)));

  const aplicarPreset = (orden: Tipo[]) => setMods(orden.map((id) => ({ id, activo: true })));

  const activos = mods.filter((m) => m.activo);

  const pintar = (i: number): ReactNode => {
    if (i >= activos.length) {
      return (
        <motion.span layout className="block px-1 font-mono text-sm text-fd-foreground">
          Hola
        </motion.span>
      );
    }
    const m = activos[i];
    const dentro = pintar(i + 1);
    switch (m.id) {
      case 'padding':
        return (
          <motion.div
            layout
            className="rounded-[2px] p-4 outline-1 -outline-offset-1 outline-fd-muted-foreground/50 outline-dashed"
          >
            {dentro}
          </motion.div>
        );
      case 'background':
        return (
          <motion.div layout className="bg-fd-muted-foreground/25">
            {dentro}
          </motion.div>
        );
      case 'clip':
        return (
          <motion.div layout className="overflow-hidden rounded-2xl">
            {dentro}
          </motion.div>
        );
      case 'clickable':
        return (
          <motion.div
            layout
            role="button"
            tabIndex={0}
            aria-label="Zona que responde al toque"
            onClick={() => {
              setClics((c) => c + 1);
              setOnda((o) => o + 1);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setClics((c) => c + 1);
                setOnda((o) => o + 1);
              }
            }}
            className="relative cursor-pointer focus-visible:outline-2 focus-visible:outline-fd-ring"
          >
            <AnimatePresence>
              {onda > 0 && (
                <motion.span
                  key={onda}
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-fd-foreground/15"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              )}
            </AnimatePresence>
            {dentro}
          </motion.div>
        );
    }
  };

  const codigo = `Text(
    text = "Hola",
    modifier = Modifier${activos.length ? '\n' : ''}${activos.map((m) => `        ${CODIGO[m.id]}`).join('\n')}
)`;

  return (
    <MotionConfig reducedMotion="user" transition={{ type: 'spring', bounce: 0.1, duration: 0.4 }}>
      <section aria-label="El orden de los Modifier" className={cn(bloque, '@container')}>
        <div className={cabecera}>
          <span className={etiqueta}>Demo</span>
          <p className={cn(tituloBloque, 'min-w-0 flex-1')}>El orden de los Modifier</p>
        </div>

        <div className="grid gap-5 p-4 sm:p-5 @2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-4">
            <div>
              <p className="mb-2 text-xs font-medium text-fd-muted-foreground">
                Cadena (de fuera hacia dentro). Mueve y activa cada modificador:
              </p>
              <ol className="space-y-1.5">
                {mods.map((m, i) => (
                  <motion.li
                    layout
                    key={m.id}
                    className={cn(
                      'flex items-center gap-2 rounded-md border px-2 py-1.5',
                      m.activo ? 'bg-fd-background' : 'bg-fd-muted/40 opacity-60',
                    )}
                  >
                    <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={m.activo}
                        onChange={() => alternar(m.id)}
                        className="size-4 shrink-0 accent-fd-primary"
                      />
                      <code className="truncate font-mono text-[12.5px]">{CODIGO[m.id]}</code>
                    </label>
                    <button
                      type="button"
                      onClick={() => mover(i, -1)}
                      disabled={i === 0}
                      aria-label={`Subir ${CODIGO[m.id]}`}
                      className={cn(botonSecundario, 'min-h-8 px-2')}
                    >
                      <ArrowUp className="size-3.5" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => mover(i, 1)}
                      disabled={i === mods.length - 1}
                      aria-label={`Bajar ${CODIGO[m.id]}`}
                      className={cn(botonSecundario, 'min-h-8 px-2')}
                    >
                      <ArrowDown className="size-3.5" aria-hidden />
                    </button>
                  </motion.li>
                ))}
              </ol>
            </div>

            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button key={p.nombre} type="button" onClick={() => aplicarPreset(p.orden)} className={botonSecundario}>
                  {p.nombre}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setMods(INICIAL);
                  setClics(0);
                }}
                className={botonSecundario}
              >
                <RotateCcw className="size-3.5" aria-hidden />
                Reiniciar
              </button>
            </div>

            <CodigoDemo codigo={codigo} titulo="Lo que estás escribiendo" />
          </div>

          <div className="min-w-0 space-y-3">
            <div className="flex min-h-56 items-center justify-center rounded-md border bg-fd-card p-6">
              <motion.div layout className="inline-block">
                {pintar(0)}
              </motion.div>
            </div>
            <p className="text-xs text-fd-muted-foreground">
              Línea discontinua: el espacio que añade el <code className="font-mono">padding</code>. Pulsa la caja para ver
              qué zona responde al toque. Clics: <span className="tabular-nums text-fd-foreground">{clics}</span>
            </p>
            <ul className="space-y-1.5 text-sm" aria-live="polite">
              {explicar(mods).map((f) => (
                <li key={f} className="border-l-2 border-fd-primary/60 pl-3">
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
