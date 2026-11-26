'use client';

import { useId, useState } from 'react';
import { motion, MotionConfig } from 'motion/react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { bloque, botonSecundario, cabecera, etiqueta, tituloBloque } from '@/components/interactive/estilos';

/**
 * Playground de Flexbox: el navegador hace el layout de verdad (display: flex
 * con los valores elegidos) y motion anima el cambio de posición de cada caja.
 * Debajo se ve el CSS equivalente, listo para copiar a un componente Angular.
 */

type Direccion = 'row' | 'column';
type Justify = 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
type Align = 'stretch' | 'flex-start' | 'center' | 'flex-end';
type Wrap = 'nowrap' | 'wrap';

interface Caja {
  selector: string;
  flex: string;
}

interface Estado {
  direccion: Direccion;
  justify: Justify;
  align: Align;
  wrap: Wrap;
  gap: number;
  cajas: Caja[];
}

const FLEX_OPCIONES = ['0 1 auto', '1', '2', '0 0 30%', '0 0 120px', '1 1 120px'] as const;

const PRESETS: Record<string, { nombre: string; estado: Estado }> = {
  lampara: {
    nombre: 'Lámpara (14/10)',
    estado: {
      direccion: 'column',
      justify: 'flex-start',
      align: 'stretch',
      wrap: 'nowrap',
      gap: 0,
      cajas: [
        { selector: '.cab', flex: '0 0 30%' },
        { selector: 'app-lampara', flex: '1' },
      ],
    },
  },
  lateral: {
    nombre: 'Lateral + contenido',
    estado: {
      direccion: 'row',
      justify: 'flex-start',
      align: 'stretch',
      wrap: 'nowrap',
      gap: 0,
      cajas: [
        { selector: 'app-aside', flex: '0 0 30%' },
        { selector: 'app-main', flex: '1' },
      ],
    },
  },
  cabecera: {
    nombre: 'Cabecera',
    estado: {
      direccion: 'row',
      justify: 'space-between',
      align: 'center',
      wrap: 'nowrap',
      gap: 16,
      cajas: [
        { selector: '.logo', flex: '0 1 auto' },
        { selector: 'nav', flex: '0 1 auto' },
      ],
    },
  },
  tarjetas: {
    nombre: 'Tarjetas',
    estado: {
      direccion: 'row',
      justify: 'flex-start',
      align: 'stretch',
      wrap: 'wrap',
      gap: 16,
      cajas: [
        { selector: '.card-1', flex: '1 1 120px' },
        { selector: '.card-2', flex: '1 1 120px' },
        { selector: '.card-3', flex: '1 1 120px' },
        { selector: '.card-4', flex: '1 1 120px' },
        { selector: '.card-5', flex: '1 1 120px' },
      ],
    },
  },
};

const DEFAULTS = { justify: 'flex-start', align: 'stretch', wrap: 'nowrap' } as const;

function explicarFlex(flex: string): string {
  switch (flex) {
    case '0 1 auto':
      return 'valor por defecto: mide lo que su contenido, no crece y puede encogerse';
    case '1':
      return 'flex: 1 1 0%: se reparte el espacio que sobra';
    case '2':
      return 'como flex: 1, pero se lleva el doble de espacio sobrante';
    case '0 0 30%':
      return 'tamaño fijo del 30 % del contenedor: ni crece ni encoge';
    case '0 0 120px':
      return 'tamaño fijo de 120px: ni crece ni encoge';
    case '1 1 120px':
      return 'parte de 120px y puede crecer y encoger (tarjetas adaptables)';
    default:
      return '';
  }
}

function Selector<T extends string | number>({
  etiquetaTexto,
  valor,
  opciones,
  onChange,
}: {
  etiquetaTexto: string;
  valor: T;
  opciones: readonly T[];
  onChange: (v: T) => void;
}) {
  const id = useId();
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor={id} className={etiqueta}>
        {etiquetaTexto}
      </label>
      <select
        id={id}
        value={String(valor)}
        onChange={(e) => {
          const crudo = e.target.value;
          const encontrado = opciones.find((o) => String(o) === crudo);
          if (encontrado !== undefined) onChange(encontrado);
        }}
        className="min-h-10 w-full rounded-md border bg-fd-background px-2 py-1.5 font-mono text-xs text-fd-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring sm:min-h-8"
      >
        {opciones.map((o) => (
          <option key={String(o)} value={String(o)}>
            {typeof o === 'number' ? `${o}px` : o}
          </option>
        ))}
      </select>
    </div>
  );
}

export function FlexboxPlayground({
  titulo = 'Playground de Flexbox',
  preset = 'lampara',
}: {
  titulo?: string;
  preset?: 'lampara' | 'lateral' | 'cabecera' | 'tarjetas';
}) {
  const [estado, setEstado] = useState<Estado>(() => structuredClone((PRESETS[preset] ?? PRESETS.lampara).estado));
  const [presetActivo, setPresetActivo] = useState<string | null>(preset);
  const [seleccionada, setSeleccionada] = useState(0);

  const cambiar = (parcial: Partial<Estado>) => {
    setEstado((e) => ({ ...e, ...parcial }));
    setPresetActivo(null);
  };

  const cambiarFlex = (i: number, flex: string) => {
    setEstado((e) => ({ ...e, cajas: e.cajas.map((c, j) => (j === i ? { ...c, flex } : c)) }));
    setPresetActivo(null);
  };

  const anadir = () => {
    if (estado.cajas.length >= 6) return;
    const n = estado.cajas.length + 1;
    setEstado((e) => ({ ...e, cajas: [...e.cajas, { selector: `.caja-${n}`, flex: '0 1 auto' }] }));
    setPresetActivo(null);
  };

  const quitar = () => {
    if (estado.cajas.length <= 1) return;
    setEstado((e) => ({ ...e, cajas: e.cajas.slice(0, -1) }));
    setSeleccionada((s) => Math.min(s, estado.cajas.length - 2));
    setPresetActivo(null);
  };

  const aplicarPreset = (clave: string) => {
    const p = PRESETS[clave];
    if (!p) return;
    setEstado(structuredClone(p.estado));
    setPresetActivo(clave);
    setSeleccionada(0);
  };

  const horizontal = estado.direccion === 'row';
  const caja = estado.cajas[seleccionada] ?? estado.cajas[0];

  const lineasCss = [
    ':host {',
    '  display: flex;',
    `  flex-direction: ${estado.direccion};`,
    ...(estado.justify !== DEFAULTS.justify ? [`  justify-content: ${estado.justify};`] : []),
    ...(estado.align !== DEFAULTS.align ? [`  align-items: ${estado.align};`] : []),
    ...(estado.wrap !== DEFAULTS.wrap ? [`  flex-wrap: ${estado.wrap};`] : []),
    ...(estado.gap ? [`  gap: ${estado.gap}px;`] : []),
    '}',
    ...estado.cajas.filter((c) => c.flex !== '0 1 auto').map((c) => `${c.selector} { flex: ${c.flex}; }`),
  ];

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
            {Object.entries(PRESETS).map(([clave, p]) => (
              <button
                key={clave}
                type="button"
                onClick={() => aplicarPreset(clave)}
                aria-pressed={presetActivo === clave}
                className={cn(botonSecundario, presetActivo === clave && 'border-fd-primary text-fd-primary')}
              >
                {p.nombre}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Selector
              etiquetaTexto="flex-direction"
              valor={estado.direccion}
              opciones={['row', 'column'] as const}
              onChange={(v) => cambiar({ direccion: v })}
            />
            <Selector
              etiquetaTexto="justify-content"
              valor={estado.justify}
              opciones={['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'] as const}
              onChange={(v) => cambiar({ justify: v })}
            />
            <Selector
              etiquetaTexto="align-items"
              valor={estado.align}
              opciones={['stretch', 'flex-start', 'center', 'flex-end'] as const}
              onChange={(v) => cambiar({ align: v })}
            />
            <Selector
              etiquetaTexto="flex-wrap"
              valor={estado.wrap}
              opciones={['nowrap', 'wrap'] as const}
              onChange={(v) => cambiar({ wrap: v })}
            />
            <Selector
              etiquetaTexto="gap"
              valor={estado.gap}
              opciones={[0, 8, 16, 24] as const}
              onChange={(v) => cambiar({ gap: v })}
            />
          </div>

          <p className="text-xs text-fd-muted-foreground" aria-live="polite">
            Eje principal: <strong className="text-fd-foreground">{horizontal ? 'horizontal (→)' : 'vertical (↓)'}</strong>.{' '}
            <code>justify-content</code> reparte las cajas a lo largo de él y <code>align-items</code> las coloca en el eje{' '}
            {horizontal ? 'vertical' : 'horizontal'}.
          </p>

          {/* Contenedor flex real */}
          <div className="relative">
            <span className="absolute -top-2.5 left-3 bg-fd-background px-1 font-mono text-[11px] text-fd-muted-foreground">
              :host (contenedor flex)
            </span>
            <div
              className="h-60 overflow-hidden rounded-md border border-dashed p-2"
              style={{
                display: 'flex',
                flexDirection: estado.direccion,
                justifyContent: estado.justify,
                alignItems: estado.align,
                flexWrap: estado.wrap,
                gap: estado.gap,
              }}
            >
              {estado.cajas.map((c, i) => (
                <motion.button
                  layout
                  key={c.selector}
                  type="button"
                  onClick={() => setSeleccionada(i)}
                  aria-pressed={i === seleccionada}
                  aria-label={`Seleccionar ${c.selector} (flex: ${c.flex})`}
                  transition={{ type: 'spring', stiffness: 420, damping: 38 }}
                  className={cn(
                    'flex min-h-10 min-w-0 flex-col items-start justify-center gap-0.5 overflow-hidden rounded-md border px-2.5 py-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring',
                    i === seleccionada ? 'border-fd-primary bg-fd-primary/10' : 'bg-fd-muted/60 hover:bg-fd-accent',
                  )}
                  style={{ flex: c.flex }}
                >
                  <motion.span layout="position" className="truncate font-mono text-xs font-semibold text-fd-foreground">
                    {c.selector}
                  </motion.span>
                  <motion.span layout="position" className="truncate font-mono text-[11px] text-fd-muted-foreground">
                    flex: {c.flex}
                  </motion.span>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-44 flex-1">
              <Selector
                etiquetaTexto={`flex de ${caja?.selector ?? ''} (pulsa una caja para elegirla)`}
                valor={caja?.flex ?? '0 1 auto'}
                opciones={FLEX_OPCIONES}
                onChange={(v) => cambiarFlex(seleccionada, v)}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={quitar}
                disabled={estado.cajas.length <= 1}
                aria-label="Quitar una caja"
                className={botonSecundario}
              >
                <Minus className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={anadir}
                disabled={estado.cajas.length >= 6}
                aria-label="Añadir una caja"
                className={botonSecundario}
              >
                <Plus className="size-4" aria-hidden />
              </button>
            </div>
          </div>
          {caja ? (
            <p className="-mt-2 text-xs text-fd-muted-foreground">
              <code>flex: {caja.flex}</code>: {explicarFlex(caja.flex)}.
            </p>
          ) : null}

          <div>
            <p className={cn(etiqueta, 'mb-1')}>CSS equivalente</p>
            <pre className="overflow-x-auto rounded-md border bg-fd-muted/40 px-3 py-2 font-mono text-xs leading-relaxed text-fd-foreground">
              {lineasCss.join('\n')}
            </pre>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
