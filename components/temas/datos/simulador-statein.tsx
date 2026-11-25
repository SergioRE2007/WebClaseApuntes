'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  avisoTexto,
  bloque,
  botonSecundario,
  cabecera,
  etiqueta,
  okTexto,
  tituloBloque,
} from '@/components/interactive/estilos';
import { Opciones } from './opciones';

type Arriba = 'parado' | 'activo' | 'parando';
type Tono = 'normal' | 'ok' | 'aviso';

interface Linea {
  id: number;
  texto: string;
  tono: Tono;
}

const TIEMPOS = [
  { valor: 5000, texto: 'WhileSubscribed(5_000L)', codigo: true },
  { valor: 0, texto: 'WhileSubscribed()', codigo: true },
] as const;

const RESPUESTA_MS = 900;
const GIRO_MS = 600;
const tonos: Record<Tono, string> = { normal: '', ok: okTexto, aviso: avisoTexto };

/**
 * Demo: qué hace stateIn con SharingStarted.WhileSubscribed. Cuenta cuántas
 * veces se vuelve a ejecutar el flow de arriba (y por tanto cuántas peticiones
 * a la API hace un flow { emit(readAllPokemon()) }) al girar el móvil o al
 * mandar la app a segundo plano.
 */
export function SimuladorStateIn({ titulo = 'stateIn y WhileSubscribed: cuándo se vuelve a pedir' }: { titulo?: string }) {
  const [espera, setEspera] = useState<number>(5000);
  const [suscrito, setSuscrito] = useState(false);
  const [girando, setGirando] = useState(false);
  const [arriba, setArriba] = useState<Arriba>('parado');
  const [valor, setValor] = useState<'Loading' | 'Loaded'>('Loading');
  const [peticiones, setPeticiones] = useState(0);
  const [restante, setRestante] = useState(0);
  const [log, setLog] = useState<Linea[]>([]);
  const reducir = useReducedMotion();

  const m = useRef({ arriba: 'parado' as Arriba, generacion: 0, peticiones: 0, fin: 0, espera: 5000 });
  const tParar = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tRespuesta = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tGiro = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sigId = useRef(0);

  const anotar = useCallback((texto: string, tono: Tono = 'normal') => {
    sigId.current += 1;
    const id = sigId.current;
    setLog((l) => [...l, { id, texto, tono }].slice(-5));
  }, []);

  const ponerArriba = (a: Arriba) => {
    m.current.arriba = a;
    setArriba(a);
  };

  const limpiar = () => {
    for (const t of [tParar, tRespuesta, tGiro]) {
      if (t.current) clearTimeout(t.current);
      t.current = null;
    }
  };

  useEffect(() => limpiar, []);

  useEffect(() => {
    if (arriba !== 'parando') return;
    const tic = () => setRestante(Math.max(0, m.current.fin - Date.now()));
    tic();
    const i = setInterval(tic, 200);
    return () => clearInterval(i);
  }, [arriba]);

  const parar = () => {
    tParar.current = null;
    m.current.generacion += 1;
    if (tRespuesta.current) clearTimeout(tRespuesta.current);
    tRespuesta.current = null;
    ponerArriba('parado');
    anotar('Se para el flow de arriba. state no se borra: conserva su último valor.');
  };

  const arrancar = () => {
    m.current.generacion += 1;
    const gen = m.current.generacion;
    m.current.peticiones += 1;
    setPeticiones(m.current.peticiones);
    ponerArriba('activo');
    anotar(`Arranca el flow de arriba: flow { emit(readAllPokemon()) } llama a la API (petición ${m.current.peticiones}).`, m.current.peticiones > 1 ? 'aviso' : 'normal');
    tRespuesta.current = setTimeout(() => {
      tRespuesta.current = null;
      if (m.current.generacion !== gen) return;
      setValor('Loaded');
      anotar('Llega la respuesta: state pasa a Loaded y la lista se pinta.', 'ok');
    }, RESPUESTA_MS);
  };

  const suscribir = () => {
    setSuscrito(true);
    if (m.current.arriba === 'parando') {
      if (tParar.current) clearTimeout(tParar.current);
      tParar.current = null;
      ponerArriba('activo');
      anotar('Vuelve un suscriptor antes de que acabe la espera: el flow de arriba sigue vivo y no se repite la petición.', 'ok');
    } else if (m.current.arriba === 'parado') {
      arrancar();
    }
  };

  const desuscribir = () => {
    setSuscrito(false);
    if (m.current.espera === 0) {
      parar();
      return;
    }
    m.current.fin = Date.now() + m.current.espera;
    ponerArriba('parando');
    anotar(`Ya no hay nadie recogiendo state: empieza la espera de ${m.current.espera / 1000} s.`);
    tParar.current = setTimeout(parar, m.current.espera);
  };

  const girar = () => {
    setGirando(true);
    anotar('Giras el móvil: la Activity se destruye y se vuelve a crear. El ViewModel sobrevive.');
    desuscribir();
    tGiro.current = setTimeout(() => {
      tGiro.current = null;
      setGirando(false);
      suscribir();
    }, GIRO_MS);
  };

  const reiniciar = (e: number = espera) => {
    limpiar();
    m.current = { arriba: 'parado', generacion: m.current.generacion + 1, peticiones: 0, fin: 0, espera: e };
    setEspera(e);
    setSuscrito(false);
    setGirando(false);
    setArriba('parado');
    setValor('Loading');
    setPeticiones(0);
    setLog([]);
  };

  const estadoArriba =
    arriba === 'activo' ? 'Activo' : arriba === 'parando' ? `Se para en ${Math.ceil(restante / 1000)} s` : 'Parado';

  return (
    <section aria-label={titulo} className={bloque}>
      <div className={cabecera}>
        <span className={etiqueta}>Demo</span>
        <p className={cn(tituloBloque, 'min-w-0 flex-1')}>{titulo}</p>
      </div>

      <div className="grid gap-4 px-4 py-4 sm:px-5">
        <Opciones leyenda="started =" opciones={TIEMPOS} valor={espera} onCambio={(e) => reiniciar(e)} />

        <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <div className="rounded-md border px-3 py-2">
            <dt className="text-xs text-fd-muted-foreground">Pantalla</dt>
            <dd className="font-medium">{girando ? 'Girando…' : suscrito ? 'Visible, recogiendo' : 'No recoge'}</dd>
          </div>
          <div className="relative overflow-hidden rounded-md border px-3 py-2">
            <dt className="text-xs text-fd-muted-foreground">Flow de arriba</dt>
            <dd className={cn('font-medium tabular-nums', arriba === 'parando' && avisoTexto)}>{estadoArriba}</dd>
            {arriba === 'parando' && !reducir && (
              <motion.span
                key={m.current.fin}
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-amber-500/70"
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: espera / 1000, ease: 'linear' }}
              />
            )}
          </div>
          <div className="rounded-md border px-3 py-2">
            <dt className="text-xs text-fd-muted-foreground">
              <code>state.value</code>
            </dt>
            <dd className="font-mono text-[0.8125rem] font-medium">{valor}</dd>
          </div>
          <div className="rounded-md border px-3 py-2">
            <dt className="text-xs text-fd-muted-foreground">Peticiones a la API</dt>
            <dd className={cn('font-medium tabular-nums', peticiones > 1 && avisoTexto)}>{peticiones}</dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-2">
          <button type="button" className={botonSecundario} onClick={suscribir} disabled={suscrito || girando}>
            {peticiones === 0 && !suscrito ? 'Abrir la pantalla' : 'Volver a la app'}
          </button>
          <button type="button" className={botonSecundario} onClick={girar} disabled={!suscrito || girando}>
            Girar el móvil
          </button>
          <button type="button" className={botonSecundario} onClick={desuscribir} disabled={!suscrito || girando}>
            Mandar la app a segundo plano
          </button>
          <button type="button" className={botonSecundario} onClick={() => reiniciar()}>
            <RotateCcw className="size-3.5" aria-hidden />
            Reiniciar
          </button>
        </div>

        <ol className="grid gap-1.5 text-sm" aria-live="polite">
          <AnimatePresence initial={false}>
            {log.map((l) => (
              <motion.li
                key={l.id}
                initial={reducir ? { opacity: 0 } : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={cn('rounded-md border px-3 py-2', tonos[l.tono])}
              >
                {l.texto}
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>
        <p className="text-xs text-fd-muted-foreground">
          Prueba a girar el móvil con las dos opciones. Con <code>WhileSubscribed()</code> (espera 0) cada giro para el flow y vuelve a pedir los datos; con 5 s, no. Si la app pasa más de 5 s en segundo plano, al volver sí se repite la petición.
        </p>
      </div>
    </section>
  );
}
