'use client';

import { useState } from 'react';
import { motion, MotionConfig } from 'motion/react';
import { cn } from '@/lib/cn';
import { bloque, cabecera, etiqueta, tituloBloque } from '@/components/interactive/estilos';
import { CodigoDemo, Segmentado } from './comun';

/**
 * Playground de Column, Row y Box con Arrangement y Alignment. Los tres hijos
 * son cuadrados de distinto tamaño para que se note la alineación.
 */

type Contenedor = 'Column' | 'Row' | 'Box';
type Arr = 'Start' | 'Center' | 'End' | 'SpaceBetween' | 'SpaceAround' | 'SpaceEvenly';
type Ali = 'Start' | 'Center' | 'End';

const JUSTIFY: Record<Arr, string> = {
  Start: 'justify-start',
  Center: 'justify-center',
  End: 'justify-end',
  SpaceBetween: 'justify-between',
  SpaceAround: 'justify-around',
  SpaceEvenly: 'justify-evenly',
};
const ITEMS: Record<Ali, string> = { Start: 'items-start', Center: 'items-center', End: 'items-end' };
const SELF_X: Record<Ali, string> = { Start: 'justify-self-start', Center: 'justify-self-center', End: 'justify-self-end' };
const SELF_Y: Record<Ali, string> = { Start: 'self-start', Center: 'self-center', End: 'self-end' };

/** Nombre en Compose de cada opción, según el eje. */
function nombreArr(c: Contenedor, a: Arr) {
  if (c === 'Column') return a === 'Start' ? 'Top' : a === 'End' ? 'Bottom' : a;
  return a;
}
function nombreAli(c: Contenedor, a: Ali) {
  if (c === 'Column') return a === 'Center' ? 'CenterHorizontally' : a;
  return a === 'Start' ? 'Top' : a === 'End' ? 'Bottom' : 'CenterVertically';
}
const BOX_Y: Record<Ali, string> = { Start: 'Top', Center: 'Center', End: 'Bottom' };
const BOX_X: Record<Ali, string> = { Start: 'Start', Center: 'Center', End: 'End' };
function nombreBox(y: Ali, x: Ali) {
  if (y === 'Center' && x === 'Center') return 'Center';
  if (y === 'Center') return `Center${BOX_X[x]}`;
  return `${BOX_Y[y]}${BOX_X[x]}`;
}

const HIJOS = [
  { n: '1', tam: 72, clase: 'size-[72px] bg-fd-muted-foreground/25' },
  { n: '2', tam: 48, clase: 'size-12 bg-fd-muted-foreground/45' },
  { n: '3', tam: 32, clase: 'size-8 bg-fd-primary/70 text-fd-primary-foreground' },
];

const ARRS: Arr[] = ['Start', 'Center', 'End', 'SpaceBetween', 'SpaceAround', 'SpaceEvenly'];
const ALIS: Ali[] = ['Start', 'Center', 'End'];

export function ColumnRowBox() {
  const [cont, setCont] = useState<Contenedor>('Column');
  const [arr, setArr] = useState<Arr>('Start');
  const [ali, setAli] = useState<Ali>('Start');
  const [boxX, setBoxX] = useState<Ali>('Start');
  const [boxY, setBoxY] = useState<Ali>('Start');

  const hijosCodigo = HIJOS.map((h) => `    Cuadro(tam = ${h.tam}.dp, texto = "${h.n}")`).join('\n');
  let codigo: string;
  if (cont === 'Column') {
    codigo = `Column(
    modifier = Modifier.fillMaxSize(),
    verticalArrangement = Arrangement.${nombreArr(cont, arr)},
    horizontalAlignment = Alignment.${nombreAli(cont, ali)}
) {
${hijosCodigo}
}`;
  } else if (cont === 'Row') {
    codigo = `Row(
    modifier = Modifier.fillMaxSize(),
    horizontalArrangement = Arrangement.${nombreArr(cont, arr)},
    verticalAlignment = Alignment.${nombreAli(cont, ali)}
) {
${hijosCodigo}
}`;
  } else {
    codigo = `Box(
    modifier = Modifier.fillMaxSize(),
    contentAlignment = Alignment.${nombreBox(boxY, boxX)}
) {
${hijosCodigo}
}`;
  }

  const opcionesArr = ARRS.map((a) => ({ valor: a, texto: nombreArr(cont, a) }));
  const opcionesAli = ALIS.map((a) => ({ valor: a, texto: nombreAli(cont, a) }));

  return (
    <MotionConfig reducedMotion="user" transition={{ type: 'spring', bounce: 0.15, duration: 0.45 }}>
      <section aria-label="Column, Row y Box" className={cn(bloque, '@container')}>
        <div className={cabecera}>
          <span className={etiqueta}>Demo</span>
          <p className={cn(tituloBloque, 'min-w-0 flex-1')}>Column, Row y Box</p>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <Segmentado
            etiqueta="Contenedor"
            opciones={[
              { valor: 'Column', texto: 'Column' },
              { valor: 'Row', texto: 'Row' },
              { valor: 'Box', texto: 'Box' },
            ]}
            valor={cont}
            onCambio={setCont}
          />

          {cont !== 'Box' ? (
            <div className="space-y-2">
              <p className="text-xs text-fd-muted-foreground">
                {cont === 'Column' ? 'verticalArrangement' : 'horizontalArrangement'}: cómo se reparten en el eje principal
              </p>
              <Segmentado etiqueta="Arrangement" opciones={opcionesArr} valor={arr} onCambio={setArr} />
              <p className="text-xs text-fd-muted-foreground">
                {cont === 'Column' ? 'horizontalAlignment' : 'verticalAlignment'}: dónde se colocan en el otro eje
              </p>
              <Segmentado etiqueta="Alignment" opciones={opcionesAli} valor={ali} onCambio={setAli} />
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-fd-muted-foreground">contentAlignment: vertical y horizontal</p>
              <div className="flex flex-wrap gap-2">
                <Segmentado
                  etiqueta="Vertical"
                  opciones={ALIS.map((a) => ({ valor: a, texto: BOX_Y[a] }))}
                  valor={boxY}
                  onCambio={setBoxY}
                />
                <Segmentado
                  etiqueta="Horizontal"
                  opciones={ALIS.map((a) => ({ valor: a, texto: BOX_X[a] }))}
                  valor={boxX}
                  onCambio={setBoxX}
                />
              </div>
            </div>
          )}

          <div className="grid gap-4 @2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div
              className={cn(
                'h-64 rounded-md border bg-fd-card p-2',
                cont === 'Column' && cn('flex flex-col', JUSTIFY[arr], ITEMS[ali]),
                cont === 'Row' && cn('flex flex-row', JUSTIFY[arr], ITEMS[ali]),
                cont === 'Box' && 'grid grid-cols-1 grid-rows-1',
              )}
              role="group"
              aria-label="Vista previa"
            >
              {HIJOS.map((h) => (
                <motion.div
                  layout
                  key={h.n}
                  className={cn(
                    'flex shrink-0 items-center justify-center rounded-sm font-mono text-xs',
                    h.clase,
                    cont === 'Box' && cn('col-start-1 row-start-1', SELF_X[boxX], SELF_Y[boxY]),
                  )}
                >
                  {h.n}
                </motion.div>
              ))}
            </div>
            <CodigoDemo codigo={codigo} titulo="Pantalla.kt" />
          </div>

          <p className="text-sm text-fd-muted-foreground">
            {cont === 'Column' && 'Column pone los hijos uno debajo de otro. El eje principal es el vertical.'}
            {cont === 'Row' && 'Row pone los hijos uno al lado de otro. El eje principal es el horizontal.'}
            {cont === 'Box' &&
              'Box apila los hijos como capas: todos en el mismo sitio y el último, encima. Fíjate en que el 3 tapa a los demás.'}
          </p>
        </div>
      </section>
    </MotionConfig>
  );
}
