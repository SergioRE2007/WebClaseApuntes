'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from 'motion/react';
import { Lightbulb, LightbulbOff } from 'lucide-react';
import { cn } from '@/lib/cn';
import { bloque, botonPrimario, botonSecundario, cabecera, etiqueta, tituloBloque } from '@/components/interactive/estilos';

/**
 * Simulador de los cuatro tipos de data binding de Angular. A la izquierda,
 * el estado de la clase del componente; a la derecha, la plantilla ya pintada.
 * Cada cambio lanza un punto por la pista "Clase ↔ Vista" en el sentido en el
 * que viaja el dato, y el valor que cambia parpadea.
 */

type Tipo = 'interpolacion' | 'propiedad' | 'evento' | 'twoway';
type Sentido = 'cv' | 'vc';

const PESTANAS: { id: Tipo; nombre: string; sentido: string; plantilla: string }[] = [
  {
    id: 'interpolacion',
    nombre: 'Interpolación',
    sentido: 'Clase → Vista',
    plantilla: '<h1>Hola, {{ titulo }}</h1>',
  },
  {
    id: 'propiedad',
    nombre: 'Propiedad',
    sentido: 'Clase → Vista',
    plantilla:
      '<div class="bombilla" [class.encendida]="enchufado"></div>\n<button [disabled]="!enchufado">Encender</button>',
  },
  {
    id: 'evento',
    nombre: 'Evento',
    sentido: 'Vista → Clase (y la vista se repinta)',
    plantilla:
      '@if (enchufado) {\n  <button (click)="alternar()">DESENCHUFAR</button>\n} @else {\n  <button (click)="alternar()">ENCHUFAR</button>\n}',
  },
  {
    id: 'twoway',
    nombre: 'Two-way',
    sentido: 'Clase ↔ Vista',
    plantilla: '<input name="nombre" [(ngModel)]="nombre" />\n<p>Hola, {{ nombre }}</p>',
  },
];

/** Un valor que parpadea con el color de acento cada vez que cambia. */
function Valor({ children, cambio }: { children: ReactNode; cambio: number }) {
  return (
    <span className="relative inline-block rounded px-1">
      {cambio > 0 ? (
        <motion.span
          key={cambio}
          aria-hidden
          className="absolute inset-0 rounded bg-fd-primary/25"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        />
      ) : null}
      <span className="relative">{children}</span>
    </span>
  );
}

export function SimuladorBinding({ titulo = 'Simulador de data binding' }: { titulo?: string }) {
  const reducir = useReducedMotion();
  const baseId = useId();
  const [tipo, setTipo] = useState<Tipo>('interpolacion');
  const [titulo1, setTitulo1] = useState('proj-lamp');
  const [enchufado, setEnchufado] = useState(false);
  const [nombre, setNombre] = useState('');
  const [cambioClase, setCambioClase] = useState(0);
  const [cambioVista, setCambioVista] = useState(0);
  const [pulso, setPulso] = useState<{ sentido: Sentido; id: number } | null>(null);
  const [aviso, setAviso] = useState('');
  const temporizadores = useRef<number[]>([]);
  const contadorPulsos = useRef(0);
  const refsPestanas = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    return () => temporizadores.current.forEach((t) => window.clearTimeout(t));
  }, []);

  const lanzar = (sentido: Sentido) => {
    contadorPulsos.current += 1;
    setPulso({ sentido, id: contadorPulsos.current });
    if (sentido === 'cv') setCambioVista((n) => n + 1);
    else setCambioClase((n) => n + 1);
  };

  const cambiarDesdeClase = (texto: string) => {
    setCambioClase((n) => n + 1);
    lanzar('cv');
    setAviso(texto);
  };

  const pestana = PESTANAS.find((p) => p.id === tipo) ?? PESTANAS[0];

  const cambiarTipo = (nuevo: Tipo) => {
    // Que el segundo salto del evento no aparezca en otra pestaña
    temporizadores.current.forEach((t) => window.clearTimeout(t));
    temporizadores.current = [];
    setTipo(nuevo);
    setAviso('');
    setPulso(null);
    setCambioClase(0);
    setCambioVista(0);
  };

  const alternarDesdeVista = () => {
    setEnchufado((v) => !v);
    lanzar('vc');
    setAviso('(click) llama a alternar(): cambia enchufado en la clase y Angular vuelve a pintar la plantilla.');
    // Segundo salto: la clase ha cambiado y la plantilla se actualiza
    const t = window.setTimeout(() => lanzar('cv'), reducir ? 0 : 650);
    temporizadores.current.push(t);
  };

  const onTeclaPestanas = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = PESTANAS.findIndex((p) => p.id === tipo);
    let j = i;
    if (e.key === 'ArrowRight') j = (i + 1) % PESTANAS.length;
    else if (e.key === 'ArrowLeft') j = (i - 1 + PESTANAS.length) % PESTANAS.length;
    else if (e.key === 'Home') j = 0;
    else if (e.key === 'End') j = PESTANAS.length - 1;
    else return;
    e.preventDefault();
    const siguiente = PESTANAS[j];
    if (!siguiente) return;
    cambiarTipo(siguiente.id);
    refsPestanas.current[j]?.focus();
  };

  const lineaClase = (contenido: ReactNode) => (
    <code className="block whitespace-pre-wrap break-words font-mono text-xs leading-relaxed">{contenido}</code>
  );

  return (
    <MotionConfig reducedMotion="user">
      <section aria-label={titulo} className={bloque}>
        <div className={cabecera}>
          <span className={etiqueta}>Demo</span>
          <p className={cn(tituloBloque, 'min-w-0 flex-1')}>{titulo}</p>
        </div>

        <div
          role="tablist"
          aria-label="Tipo de binding"
          onKeyDown={onTeclaPestanas}
          className="flex gap-1 overflow-x-auto border-b px-2 pt-2 sm:px-3"
        >
          {PESTANAS.map((p, i) => (
            <button
              key={p.id}
              ref={(el) => {
                refsPestanas.current[i] = el;
              }}
              id={`${baseId}-tab-${p.id}`}
              role="tab"
              type="button"
              aria-selected={tipo === p.id}
              aria-controls={`${baseId}-panel`}
              tabIndex={tipo === p.id ? 0 : -1}
              onClick={() => cambiarTipo(p.id)}
              className={cn(
                'relative shrink-0 rounded-t-md px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring',
                tipo === p.id ? 'text-fd-foreground' : 'text-fd-muted-foreground hover:text-fd-foreground',
              )}
            >
              {p.nombre}
              {tipo === p.id ? (
                <motion.span
                  layoutId={`${baseId}-indicador`}
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded bg-fd-primary"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              ) : null}
            </button>
          ))}
        </div>

        <div
          id={`${baseId}-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${tipo}`}
          className="flex flex-col gap-4 px-4 py-4 sm:px-5"
        >
          <div>
            <p className={cn(etiqueta, 'mb-1')}>
              Plantilla · sentido del dato: <span className="text-fd-foreground">{pestana.sentido}</span>
            </p>
            <pre className="overflow-x-auto rounded-md border bg-fd-muted/40 px-3 py-2 font-mono text-xs leading-relaxed">
              {pestana.plantilla}
            </pre>
          </div>

          {/* Pista Clase ↔ Vista */}
          <div className="flex items-center gap-3" aria-hidden>
            <span className="w-12 shrink-0 text-right text-xs font-medium text-fd-muted-foreground">Clase</span>
            <div className="relative h-2 flex-1 rounded-full bg-fd-muted">
              {/* Recorrido del punto: todo el ancho menos su propio tamaño */}
              <div className="absolute inset-y-0 left-0 right-3">
                <AnimatePresence>
                  {pulso ? (
                    <motion.span
                      key={pulso.id}
                      className="absolute top-1/2 size-3 -translate-y-1/2 rounded-full bg-fd-primary"
                      initial={{ left: pulso.sentido === 'cv' ? '0%' : '100%', opacity: 1 }}
                      animate={{ left: pulso.sentido === 'cv' ? '100%' : '0%', opacity: [1, 1, 0] }}
                      transition={{ duration: reducir ? 0 : 0.6, ease: 'easeInOut' }}
                    />
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
            <span className="w-12 shrink-0 text-xs font-medium text-fd-muted-foreground">Vista</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {/* Clase */}
            <div className="min-w-0 rounded-md border">
              <p className={cn(etiqueta, 'border-b px-3 py-1.5')}>app.component.ts (estado)</p>
              <div className="flex flex-col gap-3 px-3 py-3">
                {tipo === 'interpolacion' ? (
                  <>
                    {lineaClase(
                      <>
                        titulo = <Valor cambio={cambioClase}>&apos;{titulo1}&apos;</Valor>;
                      </>,
                    )}
                    <label className="flex flex-col gap-1">
                      <span className={etiqueta}>Cambia el valor en la clase</span>
                      <input
                        value={titulo1}
                        maxLength={30}
                        onChange={(e) => {
                          setTitulo1(e.target.value);
                          cambiarDesdeClase('Cambia la propiedad y Angular vuelve a evaluar {{ titulo }}.');
                        }}
                        className="min-h-10 rounded-md border bg-fd-background px-2 py-1.5 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring sm:min-h-8"
                      />
                    </label>
                  </>
                ) : null}

                {tipo === 'propiedad' ? (
                  <>
                    {lineaClase(
                      <>
                        enchufado = <Valor cambio={cambioClase}>{String(enchufado)}</Valor>;
                      </>,
                    )}
                    <button
                      type="button"
                      className={botonSecundario}
                      onClick={() => {
                        setEnchufado((v) => !v);
                        cambiarDesdeClase('[class.encendida] y [disabled] se recalculan con el nuevo valor.');
                      }}
                    >
                      Cambiar enchufado en la clase
                    </button>
                  </>
                ) : null}

                {tipo === 'evento' ? (
                  lineaClase(
                    <>
                      enchufado = <Valor cambio={cambioClase}>{String(enchufado)}</Valor>;{'\n\n'}alternar() {'{'}
                      {'\n'}  this.enchufado = !this.enchufado;{'\n'}
                      {'}'}
                    </>,
                  )
                ) : null}

                {tipo === 'twoway' ? (
                  <>
                    {lineaClase(
                      <>
                        nombre = <Valor cambio={cambioClase}>&apos;{nombre}&apos;</Valor>;
                      </>,
                    )}
                    <button
                      type="button"
                      className={botonSecundario}
                      onClick={() => {
                        setNombre('DAM');
                        cambiarDesdeClase('La clase pone nombre = "DAM" y el input se rellena solo.');
                      }}
                    >
                      Poner &apos;DAM&apos; desde la clase
                    </button>
                  </>
                ) : null}
              </div>
            </div>

            {/* Vista */}
            <div className="min-w-0 rounded-md border">
              <p className={cn(etiqueta, 'border-b px-3 py-1.5')}>Navegador (vista)</p>
              <div className="flex min-h-28 flex-col items-start justify-center gap-3 px-3 py-3">
                {tipo === 'interpolacion' ? (
                  <p className="text-xl font-semibold break-all">
                    Hola, <Valor cambio={cambioVista}>{titulo1}</Valor>
                  </p>
                ) : null}

                {tipo === 'propiedad' ? (
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'flex size-12 items-center justify-center rounded-full border transition-colors',
                        enchufado ? 'border-amber-500/50 bg-amber-400/20 text-amber-600 dark:text-amber-300' : 'text-fd-muted-foreground',
                      )}
                    >
                      {enchufado ? <Lightbulb className="size-6" aria-hidden /> : <LightbulbOff className="size-6" aria-hidden />}
                    </span>
                    <button type="button" disabled={!enchufado} className={botonPrimario}>
                      Encender
                    </button>
                    <span className="sr-only">{enchufado ? 'Botón activo' : 'Botón desactivado'}</span>
                  </div>
                ) : null}

                {tipo === 'evento' ? (
                  <>
                    <p className="text-sm">
                      Estado conexión eléctrica:{' '}
                      <strong>
                        <Valor cambio={cambioVista}>{enchufado ? 'ENCHUFADO' : 'DESENCHUFADO'}</Valor>
                      </strong>
                    </p>
                    <button type="button" className={botonPrimario} onClick={alternarDesdeVista}>
                      {enchufado ? 'DESENCHUFAR' : 'ENCHUFAR'}
                    </button>
                  </>
                ) : null}

                {tipo === 'twoway' ? (
                  <>
                    <input
                      value={nombre}
                      maxLength={30}
                      placeholder="Escribe aquí"
                      aria-label="Input enlazado con [(ngModel)]"
                      onChange={(e) => {
                        setNombre(e.target.value);
                        lanzar('vc');
                        setAviso('Al escribir, ngModel actualiza nombre en la clase, y {{ nombre }} se repinta.');
                      }}
                      className="min-h-10 w-full rounded-md border bg-fd-background px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring sm:min-h-8"
                    />
                    <p className="text-sm break-all">
                      Hola, <Valor cambio={cambioVista}>{nombre}</Valor>
                    </p>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <p className="min-h-5 text-xs text-fd-muted-foreground" aria-live="polite">
            {aviso ||
              (tipo === 'evento'
                ? 'Pulsa el botón de la vista: el dato viaja de la vista a la clase y luego vuelve.'
                : tipo === 'twoway'
                  ? 'Escribe en el input o pulsa el botón de la clase: el dato viaja en los dos sentidos.'
                  : 'Cambia el valor en la clase y mira cómo se actualiza la vista.')}
          </p>
        </div>
      </section>
    </MotionConfig>
  );
}
