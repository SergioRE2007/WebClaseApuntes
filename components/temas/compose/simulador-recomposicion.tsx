'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { RotateCcw, Smartphone } from 'lucide-react';
import { cn } from '@/lib/cn';
import { bloque, botonPrimario, botonSecundario, cabecera, etiqueta, tituloBloque } from '@/components/interactive/estilos';
import { CodigoDemo, Segmentado } from './comun';

/**
 * Simulador de recomposición: el mismo contador escrito de cuatro formas.
 * Enseña qué pasa al pulsar (¿se entera Compose?, ¿se pierde el valor al
 * recomponer?) y al girar el móvil (la Activity se recrea).
 */

type Variante = 'var' | 'sinRemember' | 'remember' | 'saveable';

const OPCIONES = [
  { valor: 'var', texto: 'var normal' },
  { valor: 'sinRemember', texto: 'sin remember' },
  { valor: 'remember', texto: 'remember' },
  { valor: 'saveable', texto: 'rememberSaveable' },
] as const;

const CODIGO: Record<Variante, string> = {
  var: `@Composable
fun Contador() {
    var clics = 0
    Column {
        Text("Has pulsado $clics veces")
        Button(onClick = { clics++ }) { Text("Pulsar") }
    }
}`,
  sinRemember: `@Composable
fun Contador() {
    var clics by mutableStateOf(0)
    Column {
        Text("Has pulsado $clics veces")
        Button(onClick = { clics++ }) { Text("Pulsar") }
    }
}`,
  remember: `@Composable
fun Contador() {
    var clics by remember { mutableStateOf(0) }
    Column {
        Text("Has pulsado $clics veces")
        Button(onClick = { clics++ }) { Text("Pulsar") }
    }
}`,
  saveable: `@Composable
fun Contador() {
    var clics by rememberSaveable { mutableStateOf(0) }
    Column {
        Text("Has pulsado $clics veces")
        Button(onClick = { clics++ }) { Text("Pulsar") }
    }
}`,
};

const RESUMEN: Record<Variante, string> = {
  var: 'Una variable normal: el clic la cambia, pero Compose no se entera y no vuelve a pintar. Y si recompusiera, volvería a valer 0.',
  sinRemember:
    'mutableStateOf sí avisa a Compose, pero sin remember cada recomposición crea un estado nuevo que empieza en 0. Compila, pero Android Studio lo subraya con un aviso de lint.',
  remember: 'remember guarda el estado entre recomposiciones. Funciona, pero al girar el móvil la Activity se recrea y se pierde.',
  saveable: 'rememberSaveable además lo guarda al recrear la Activity (giro de pantalla, cambio de tema...). Sobrevive al giro.',
};

interface Evento {
  id: number;
  texto: string;
}

export function SimuladorRecomposicion() {
  const reducir = useReducedMotion();
  const [variante, setVariante] = useState<Variante>('var');
  const [mostrado, setMostrado] = useState(0);
  const [memoria, setMemoriaEstado] = useState(0);
  /** Copia síncrona del valor, para que dos clics seguidos no lean un valor viejo. */
  const memRef = useRef(0);
  const setMemoria = (n: number) => {
    memRef.current = n;
    setMemoriaEstado(n);
  };
  const [recomposiciones, setRecomposiciones] = useState(0);
  const [pulso, setPulso] = useState(0);
  const [giro, setGiro] = useState(0);
  const [eventos, setEventos] = useState<Evento[]>([]);

  const anotar = (texto: string) =>
    setEventos((ev) => [{ id: Date.now() + Math.random(), texto }, ...ev].slice(0, 4));

  const reiniciar = (v: Variante = variante) => {
    setVariante(v);
    setMostrado(0);
    setMemoria(0);
    setRecomposiciones(0);
    setEventos([]);
  };

  const recomponer = () => {
    setRecomposiciones((r) => r + 1);
    setPulso((p) => p + 1);
  };

  const pulsar = () => {
    const nuevo = memRef.current + 1;
    switch (variante) {
      case 'var':
        setMemoria(nuevo);
        anotar(`onClick: clics vale ${nuevo} en memoria, pero no es estado. Compose no recompone.`);
        break;
      case 'sinRemember':
        setMemoria(0);
        setMostrado(0);
        recomponer();
        anotar(`onClick: clics = ${nuevo}. Compose recompone, mutableStateOf(0) crea otro estado y vuelve a 0.`);
        break;
      case 'remember':
      case 'saveable':
        setMemoria(nuevo);
        setMostrado(nuevo);
        recomponer();
        anotar(`onClick: clics = ${nuevo}. Compose recompone y remember devuelve el mismo estado.`);
        break;
    }
  };

  const girar = () => {
    setGiro((g) => g + 1);
    setPulso((p) => p + 1);
    setRecomposiciones(0);
    if (variante === 'saveable') {
      setMostrado(memRef.current);
      anotar(`Giro: la Activity se recrea. rememberSaveable recupera ${memRef.current} del Bundle.`);
    } else {
      setMemoria(0);
      setMostrado(0);
      anotar('Giro: la Activity se recrea y la composición empieza de cero. El contador vuelve a 0.');
    }
  };

  return (
    <section aria-label="Simulador de recomposición" className={cn(bloque, '@container')}>
      <div className={cabecera}>
        <span className={etiqueta}>Demo</span>
        <p className={cn(tituloBloque, 'min-w-0 flex-1')}>Simulador de recomposición</p>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <Segmentado etiqueta="Cómo se guarda el contador" opciones={OPCIONES} valor={variante} onCambio={(v) => reiniciar(v)} />

        <div className="grid gap-5 @2xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-3">
            <CodigoDemo codigo={CODIGO[variante]} titulo="Contador.kt" />
            <p className="border-l-2 border-fd-primary/60 pl-3 text-sm">{RESUMEN[variante]}</p>
          </div>

          <div className="min-w-0 space-y-3">
            <div className="flex justify-center overflow-hidden py-2">
              <motion.div
                key={giro}
                initial={giro && !reducir ? { rotate: -90 } : false}
                animate={{ rotate: 0 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className="w-48 rounded-[1.6rem] border-2 border-fd-foreground/20 bg-fd-background p-2"
              >
                <div className="relative flex h-56 flex-col items-center justify-center gap-3 rounded-[1.1rem] border bg-fd-card px-3 text-center">
                  {pulso > 0 && (
                    <motion.span
                      key={pulso}
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-[1.1rem] ring-2 ring-fd-primary ring-inset"
                      initial={{ opacity: reducir ? 0 : 1 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 0.9, ease: 'easeOut' }}
                    />
                  )}
                  <span className="absolute top-2 left-3 font-mono text-[10px] text-fd-muted-foreground">Contador()</span>
                  <p className="text-sm" aria-live="polite">
                    Has pulsado <span className="font-semibold tabular-nums">{mostrado}</span> veces
                  </p>
                  <button type="button" onClick={pulsar} className={cn(botonPrimario, 'rounded-full px-5')}>
                    Pulsar
                  </button>
                </div>
              </motion.div>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              <button type="button" onClick={girar} className={botonSecundario}>
                <Smartphone className="size-3.5 -rotate-90" aria-hidden />
                Girar el móvil
              </button>
              <button type="button" onClick={() => reiniciar()} className={botonSecundario}>
                <RotateCcw className="size-3.5" aria-hidden />
                Reiniciar
              </button>
            </div>

            <dl className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="rounded-md border px-2 py-1.5">
                <dt className="text-fd-muted-foreground">Recomposiciones</dt>
                <dd className="font-mono text-base tabular-nums">{recomposiciones}</dd>
              </div>
              <div className="rounded-md border px-2 py-1.5">
                <dt className="text-fd-muted-foreground">
                  Valor de <code className="font-mono">clics</code>
                </dt>
                <dd className="font-mono text-base tabular-nums">{memoria}</dd>
              </div>
            </dl>

            <ol className="space-y-1 text-xs text-fd-muted-foreground" aria-label="Qué ha pasado">
              <AnimatePresence initial={false}>
                {eventos.map((e) => (
                  <motion.li
                    key={e.id}
                    initial={reducir ? false : { opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded border bg-fd-muted/30 px-2 py-1"
                  >
                    {e.texto}
                  </motion.li>
                ))}
              </AnimatePresence>
              {!eventos.length && <li>Pulsa el botón o gira el móvil.</li>}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
