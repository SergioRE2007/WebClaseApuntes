'use client';

import { useId, useState, type ReactNode } from 'react';
import { motion, MotionConfig } from 'motion/react';
import { cn } from '@/lib/cn';
import { bloque, botonSecundario, cabecera, etiqueta, tituloBloque } from '@/components/interactive/estilos';

/**
 * Enseña qué elementos del DOM alcanza una regla de app.component.css según la
 * encapsulación de AppComponent: con Emulated (la de por defecto) Angular
 * reescribe el selector con el atributo _ngcontent / _nghost del componente;
 * con None la regla se copia tal cual al <head> y vale para toda la página.
 * El hijo (LamparaComponent) sigue con Emulated en los dos casos.
 */

type Modo = 'Emulated' | 'None';
type Regla = 'span' | 'cab' | 'hijo' | 'host';

const REGLAS: { id: Regla; css: string }[] = [
  { id: 'span', css: 'span { color: white; }' },
  { id: 'cab', css: '.cab { background-color: blue; }' },
  { id: 'hijo', css: 'app-lampara { flex: 1; }' },
  { id: 'host', css: ':host { display: flex; }' },
];

type Nodo = 'root' | 'cab' | 'spanPadre' | 'lampara' | 'spanHijo';

function compilado(regla: Regla, modo: Modo): string {
  if (modo === 'None') {
    return REGLAS.find((r) => r.id === regla)?.css ?? '';
  }
  switch (regla) {
    case 'span':
      return 'span[_ngcontent-ng-c1] { color: white; }';
    case 'cab':
      return '.cab[_ngcontent-ng-c1] { background-color: blue; }';
    case 'hijo':
      return 'app-lampara[_ngcontent-ng-c1] { flex: 1; }';
    case 'host':
      return '[_nghost-ng-c1] { display: flex; }';
  }
}

function alcanza(regla: Regla, modo: Modo): Nodo[] {
  switch (regla) {
    case 'span':
      return modo === 'Emulated' ? ['spanPadre'] : ['spanPadre', 'spanHijo'];
    case 'cab':
      return ['cab'];
    case 'hijo':
      return ['lampara'];
    case 'host':
      return modo === 'Emulated' ? ['root'] : [];
  }
}

function explicacion(regla: Regla, modo: Modo): string {
  if (regla === 'span') {
    return modo === 'Emulated'
      ? 'Solo el <span> de la plantilla del padre lleva _ngcontent-ng-c1. El <span> del hijo lleva el atributo del hijo (c2), así que la regla no le llega.'
      : 'Sin encapsulación, "span" vale para cualquier <span> de la página, también el que está dentro del hijo.';
  }
  if (regla === 'cab') {
    return modo === 'Emulated'
      ? 'El div.cab es de la plantilla del padre: lleva _ngcontent-ng-c1 y la regla le llega.'
      : 'Le llega igual, pero ahora también le llegaría a cualquier otro .cab de la aplicación.';
  }
  if (regla === 'hijo') {
    return modo === 'Emulated'
      ? 'La etiqueta <app-lampara> está escrita en la plantilla del padre, así que lleva _ngcontent-ng-c1: por eso el padre puede darle flex: 1.'
      : 'Le llega igual. Ojo: el interior del hijo sigue sin ser cosa del padre.';
  }
  return modo === 'Emulated'
    ? ':host se reescribe como [_nghost-ng-c1], el atributo que Angular pone en el propio <app-root>.'
    : 'Con None, Angular no reescribe :host y la regla no le llega a ningún elemento.';
}

function Linea({
  nivel,
  activo,
  children,
}: {
  nivel: number;
  activo: boolean;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      {activo ? (
        <motion.span
          aria-hidden
          className="absolute inset-y-0 left-0 right-0 origin-left rounded-sm border-l-2 border-fd-primary bg-fd-primary/10"
          initial={{ opacity: 0, scaleX: 0.6 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      ) : null}
      <code
        className={cn(
          'relative block whitespace-pre-wrap break-all py-0.5 pr-2 font-mono text-xs leading-relaxed',
          activo ? 'text-fd-foreground' : 'text-fd-muted-foreground',
        )}
        style={{ paddingLeft: `${0.5 + nivel * 1}rem` }}
      >
        {children}
        {activo ? <span className="sr-only"> (le llega la regla)</span> : null}
      </code>
    </div>
  );
}

const Attr = ({ children, visible }: { children: ReactNode; visible: boolean }) =>
  visible ? <span className="text-fd-primary"> {children}</span> : null;

export function EncapsulacionEstilos({ titulo = '¿A qué elementos llega cada regla?' }: { titulo?: string }) {
  const [modo, setModo] = useState<Modo>('Emulated');
  const [regla, setRegla] = useState<Regla>('span');
  const idSelect = useId();
  const marcados = alcanza(regla, modo);
  const emulado = modo === 'Emulated';
  const m = (n: Nodo) => marcados.includes(n);

  return (
    <MotionConfig reducedMotion="user">
      <section aria-label={titulo} className={bloque}>
        <div className={cabecera}>
          <span className={etiqueta}>Demo</span>
          <p className={cn(tituloBloque, 'min-w-0 flex-1')}>{titulo}</p>
        </div>

        <div className="flex flex-col gap-4 px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <label htmlFor={idSelect} className={etiqueta}>
                Regla de app.component.css
              </label>
              <select
                id={idSelect}
                value={regla}
                onChange={(e) => setRegla(e.target.value as Regla)}
                className="min-h-10 w-full rounded-md border bg-fd-background px-2 py-1.5 font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring sm:min-h-8"
              >
                {REGLAS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.css}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1" role="group" aria-label="Encapsulación de AppComponent">
              <span className={etiqueta}>encapsulation de AppComponent</span>
              <div className="flex gap-2">
                {(['Emulated', 'None'] as const).map((op) => (
                  <button
                    key={op}
                    type="button"
                    aria-pressed={modo === op}
                    onClick={() => setModo(op)}
                    className={cn(botonSecundario, 'font-mono', modo === op && 'border-fd-primary text-fd-primary')}
                  >
                    {op}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className={cn(etiqueta, 'mb-1')}>Lo que llega al navegador</p>
            <motion.pre
              key={`${regla}-${modo}`}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-x-auto rounded-md border bg-fd-muted/40 px-3 py-2 font-mono text-xs"
            >
              {compilado(regla, modo)}
            </motion.pre>
          </div>

          <div>
            <p className={cn(etiqueta, 'mb-1')}>DOM en DevTools (Elements)</p>
            <div className="overflow-hidden rounded-md border py-1.5">
              <Linea nivel={0} activo={m('root')}>
                {'<app-root'}
                <Attr visible={emulado}>_nghost-ng-c1</Attr>
                {'>'}
              </Linea>
              <Linea nivel={1} activo={m('cab')}>
                {'<div'}
                <Attr visible={emulado}>_ngcontent-ng-c1</Attr>
                {' class="cab">'}
              </Linea>
              <Linea nivel={2} activo={m('spanPadre')}>
                {'<span'}
                <Attr visible={emulado}>_ngcontent-ng-c1</Attr>
                {'>Estado conexión eléctrica: DESENCHUFADO</span>'}
              </Linea>
              <Linea nivel={1} activo={false}>
                {'</div>'}
              </Linea>
              <Linea nivel={1} activo={m('lampara')}>
                {'<app-lampara'}
                <Attr visible={emulado}>_ngcontent-ng-c1</Attr>
                <span className="text-fd-primary"> _nghost-ng-c2</span>
                {'>'}
              </Linea>
              <Linea nivel={2} activo={m('spanHijo')}>
                {'<span'}
                <span className="text-fd-primary"> _ngcontent-ng-c2</span>
                {'>APAGADA</span>'}
              </Linea>
              <Linea nivel={1} activo={false}>
                {'</app-lampara>'}
              </Linea>
              <Linea nivel={0} activo={false}>
                {'</app-root>'}
              </Linea>
            </div>
            <p className="mt-1 text-[11px] text-fd-muted-foreground">
              c1 y c2 abrevian los sufijos reales (por ejemplo, <code>_ngcontent-ng-c3538846781</code>). El hijo sigue con
              Emulated.
            </p>
          </div>

          <p className="text-sm" aria-live="polite">
            {explicacion(regla, modo)}
          </p>
        </div>
      </section>
    </MotionConfig>
  );
}
