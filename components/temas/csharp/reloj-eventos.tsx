'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  bloque,
  botonPrimario,
  botonSecundario,
  cabecera,
  etiqueta,
  malTexto,
  tituloBloque,
} from '@/components/interactive/estilos';

/**
 * Simulador del reloj de la clase del 19/11: `Reloj` lanza el evento
 * `OnSegundo` cada segundo y los manejadores suscritos con += se ejecutan en
 * el orden de suscripción. La lambda cuenta segundos (captura `segundo`) y, a
 * los 20, da de baja a ImprimeHaPasadoUnSegundo con -=.
 */

type IdManejador = 'imprime' | 'lambda' | 'anonimo';

const MANEJADORES: { id: IdManejador; codigo: string; forma: string }[] = [
  { id: 'imprime', codigo: 'ImprimeHaPasadoUnSegundo', forma: 'método con nombre' },
  { id: 'lambda', codigo: '() => { segundo = segundo + 1; ... }', forma: 'lambda' },
  { id: 'anonimo', codigo: 'delegate () { ... }', forma: 'método anónimo' },
];

interface Linea {
  id: number;
  texto: string;
  tipo: 'salida' | 'nota' | 'error';
}

interface Estado {
  segundo: number;
  suscritos: IdManejador[];
  lineas: Linea[];
  siguiente: number;
  corriendo: boolean;
  excepcion: boolean;
  tick: number;
  /** Manejadores que se han ejecutado en el último tick (para iluminarlos). */
  ultimos: IdManejador[];
}

const INICIAL: Estado = {
  segundo: 0,
  suscritos: ['imprime', 'lambda'],
  lineas: [],
  siguiente: 0,
  corriendo: false,
  excepcion: false,
  tick: 0,
  ultimos: [],
};

const MAX_LINEAS = 12;

function avanzar(prev: Estado, conBaja: boolean): Estado {
  let siguiente = prev.siguiente;
  const linea = (texto: string, tipo: Linea['tipo'] = 'salida'): Linea => ({ id: siguiente++, texto, tipo });

  if (prev.suscritos.length === 0) {
    return {
      ...prev,
      lineas: [
        ...prev.lineas,
        linea('Excepción no controlada. System.NullReferenceException: Referencia a objeto no establecida como instancia de un objeto.', 'error'),
        linea('(OnSegundo es null porque nadie está suscrito y OnSegundo.Invoke() no lo comprueba)', 'nota'),
      ].slice(-MAX_LINEAS),
      siguiente,
      corriendo: false,
      excepcion: true,
      tick: prev.tick + 1,
      ultimos: [],
    };
  }

  // Invoke() recorre la lista que había al empezar este segundo.
  const lista = [...prev.suscritos];
  let suscritos = [...prev.suscritos];
  let segundo = prev.segundo;
  const nuevas: Linea[] = [];
  for (const h of lista) {
    if (h === 'imprime') nuevas.push(linea('Ha pasado un segundo'));
    if (h === 'anonimo') nuevas.push(linea('Ha pasado un segundo (función anónima)'));
    if (h === 'lambda') {
      segundo = segundo + 1;
      nuevas.push(linea(`Han pasado ${segundo} segundos`));
      if (conBaja && segundo === 20 && suscritos.includes('imprime')) {
        suscritos = suscritos.filter((s) => s !== 'imprime');
        nuevas.push(linea('reloj.OnSegundo -= ImprimeHaPasadoUnSegundo;', 'nota'));
      }
    }
  }
  return {
    ...prev,
    segundo,
    suscritos,
    lineas: [...prev.lineas, ...nuevas].slice(-MAX_LINEAS),
    siguiente,
    tick: prev.tick + 1,
    ultimos: lista,
  };
}

export function RelojEventos() {
  const reducir = useReducedMotion();
  const [estado, setEstado] = useState<Estado>(INICIAL);
  const [rapido, setRapido] = useState(false);
  const [conBaja, setConBaja] = useState(true);

  useEffect(() => {
    if (!estado.corriendo) return;
    const t = setInterval(() => setEstado((p) => avanzar(p, conBaja)), rapido ? 150 : 1000);
    return () => clearInterval(t);
  }, [estado.corriendo, rapido, conBaja]);

  const suscribir = (id: IdManejador) =>
    setEstado((p) => ({
      ...p,
      suscritos: p.suscritos.includes(id) ? p.suscritos.filter((s) => s !== id) : [...p.suscritos, id],
    }));

  const iniciarPausar = () =>
    setEstado((p) => (p.corriendo ? { ...p, corriendo: false } : { ...p, corriendo: true, excepcion: false }));

  return (
    <section aria-label="Simulador del reloj con eventos" className={bloque}>
      <div className={cabecera}>
        <span className={etiqueta}>Demo</span>
        <p className={cn(tituloBloque, 'min-w-0 flex-1')}>El reloj que lanza un evento cada segundo</p>
      </div>

      <div className="flex flex-col gap-4 px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
          {/* Emisor */}
          <div className="flex shrink-0 flex-col justify-center gap-1 rounded-md border px-3 py-2.5 sm:w-44">
            <span className={etiqueta}>Emisor</span>
            <span className="flex items-center gap-2 font-mono text-sm">
              <span className="relative inline-flex size-2.5">
                <AnimatePresence>
                  {!reducir && estado.corriendo && (
                    <motion.span
                      key={estado.tick}
                      initial={{ scale: 1, opacity: 0.6 }}
                      animate={{ scale: 2.6, opacity: 0 }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-0 rounded-full bg-fd-primary"
                      aria-hidden
                    />
                  )}
                </AnimatePresence>
                <span className={cn('relative size-2.5 rounded-full', estado.corriendo ? 'bg-fd-primary' : 'bg-fd-muted-foreground/40')} />
              </span>
              reloj.OnSegundo
            </span>
            <span className="font-mono text-xs text-fd-muted-foreground">segundo = {estado.segundo}</span>
          </div>

          {/* Receptores */}
          <ol className="flex min-w-0 flex-1 flex-col gap-1.5" aria-label="Manejadores">
            {MANEJADORES.map((m) => {
              const pos = estado.suscritos.indexOf(m.id);
              const suscrito = pos >= 0;
              const recien = estado.ultimos.includes(m.id);
              return (
                <li key={m.id} className={cn('relative flex items-center gap-2 overflow-hidden rounded-md border px-3 py-1.5', !suscrito && 'border-dashed')}>
                  {recien && !reducir && (
                    <motion.span
                      key={estado.tick}
                      initial={{ opacity: 0.35 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 0.7 }}
                      className="absolute inset-0 bg-fd-primary/20"
                      aria-hidden
                    />
                  )}
                  <span className="relative w-5 shrink-0 text-center font-mono text-xs text-fd-muted-foreground">{suscrito ? pos + 1 : ''}</span>
                  <span className="relative min-w-0 flex-1">
                    <span className={cn('block break-words font-mono text-xs', !suscrito && 'text-fd-muted-foreground')}>{m.codigo}</span>
                    <span className="text-xs text-fd-muted-foreground">{m.forma}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => suscribir(m.id)}
                    aria-label={suscrito ? `Dar de baja ${m.codigo}` : `Suscribir ${m.codigo}`}
                    className={cn(botonSecundario, 'relative w-12 shrink-0 font-mono')}
                  >
                    {suscrito ? '-=' : '+='}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={iniciarPausar} className={botonPrimario}>
            {estado.corriendo ? <Pause className="size-3.5" aria-hidden /> : <Play className="size-3.5" aria-hidden />}
            {estado.corriendo ? 'Pausar' : 'reloj.Iniciar()'}
          </button>
          <button type="button" onClick={() => setEstado(INICIAL)} className={botonSecundario}>
            <RotateCcw className="size-3.5" aria-hidden />
            Reiniciar
          </button>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={rapido} onChange={(e) => setRapido(e.target.checked)} className="size-4 accent-fd-primary" />
            Acelerar
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={conBaja} onChange={(e) => setConBaja(e.target.checked)} className="size-4 accent-fd-primary" />
            <span>
              Con el <code className="font-mono text-xs">if (segundo == 20)</code> que da de baja
            </span>
          </label>
        </div>

        {/* justify-end: si las líneas no caben (en móvil se parten), se recortan las más antiguas, no las nuevas. */}
        <div className="flex h-56 flex-col justify-end overflow-hidden rounded-md border bg-fd-muted/40 px-3 py-2 font-mono text-xs leading-relaxed">
          {estado.lineas.length === 0 && <p className="mb-auto text-fd-muted-foreground">Pulsa reloj.Iniciar() para que empiece a lanzar el evento.</p>}
          {estado.lineas.map((l) => (
            <motion.p
              key={l.id}
              initial={reducir ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className={cn(
                'whitespace-pre-wrap',
                l.tipo === 'nota' && 'text-fd-muted-foreground italic',
                l.tipo === 'error' && cn(malTexto, 'font-semibold'),
              )}
              role={l.tipo === 'error' ? 'alert' : undefined}
            >
              {l.texto}
            </motion.p>
          ))}
        </div>
        <p className="text-xs leading-relaxed text-fd-muted-foreground">
          Los números son el orden de la lista de invocación: el evento llama a los manejadores en el orden en que se suscribieron. Prueba a dar de baja a todos y a iniciar el reloj:
          como en clase se llama a <code className="font-mono">OnSegundo.Invoke()</code> sin comprobar null, el programa revienta.
          En C# de verdad, para dar de baja la lambda o el método anónimo con <code className="font-mono">-=</code> hay que haberlos guardado antes en una variable: si los vuelves a escribir, es otro delegado y no se quita nada.
        </p>
      </div>
    </section>
  );
}
