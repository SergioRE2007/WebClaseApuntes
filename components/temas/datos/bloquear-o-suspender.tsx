'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { LoaderCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  avisoTexto,
  bloque,
  botonPrimario,
  botonSecundario,
  cabecera,
  etiqueta,
  malTexto,
  okTexto,
  tituloBloque,
} from '@/components/interactive/estilos';
import { Opciones } from './opciones';

type Modo = 'launch' | 'runBlocking' | 'global';
type Fase = 'espera' | 'cargando' | 'hecho' | 'cerrada';
type Tono = 'normal' | 'ok' | 'mal' | 'aviso';

interface Linea {
  id: number;
  texto: string;
  tono: Tono;
}

const MODOS = [
  { valor: 'launch', texto: 'viewModelScope.launch', codigo: true },
  { valor: 'runBlocking', texto: 'runBlocking', codigo: true },
  { valor: 'global', texto: 'GlobalScope.launch', codigo: true },
] as const;

const CODIGO: Record<Modo, string> = {
  launch: 'fun load() {\n    viewModelScope.launch {\n        val tasks = _repository.readAll()\n        _state.value = Success(tasks)\n    }\n}',
  runBlocking: 'fun load() {\n    runBlocking {\n        val tasks = _repository.readAll()\n        _state.value = Success(tasks)\n    }\n}',
  global: 'fun load() {\n    GlobalScope.launch {\n        val tasks = _repository.readAll()\n        _state.value = Success(tasks)\n    }\n}',
};

const ESPERA_MS = 3000;
const tonos: Record<Tono, string> = { normal: '', ok: okTexto, mal: malTexto, aviso: avisoTexto };

/**
 * Demo: qué le pasa a la pantalla mientras se espera a la red según cómo se
 * lance el trabajo. Con runBlocking el hilo principal se congela; con
 * viewModelScope la corrutina se cancela al cerrar la pantalla; con
 * GlobalScope sigue viva aunque la pantalla ya no exista.
 */
export function BloquearOSuspender({ titulo = 'Esperar a la red sin congelar la pantalla' }: { titulo?: string }) {
  const [modo, setModo] = useState<Modo>('launch');
  const [fase, setFase] = useState<Fase>('espera');
  const [fotogramas, setFotogramas] = useState(0);
  const [toques, setToques] = useState(0);
  const [perdidos, setPerdidos] = useState(0);
  const [log, setLog] = useState<Linea[]>([]);
  const reducir = useReducedMotion();

  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const siguienteId = useRef(0);
  const bloqueado = modo === 'runBlocking' && fase === 'cargando';
  const bloqueadoRef = useRef(bloqueado);
  const faseRef = useRef(fase);
  useEffect(() => {
    bloqueadoRef.current = bloqueado;
    faseRef.current = fase;
  }, [bloqueado, fase]);

  const anotar = useCallback((texto: string, tono: Tono = 'normal') => {
    siguienteId.current += 1;
    const id = siguienteId.current;
    setLog((l) => [...l, { id, texto, tono }].slice(-6));
  }, []);

  useEffect(() => {
    const intervalo = setInterval(() => {
      if (!bloqueadoRef.current) setFotogramas((f) => f + 1);
    }, 100);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(
    () => () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    },
    [],
  );

  const reiniciar = (m: Modo = modo) => {
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = null;
    setModo(m);
    setFase('espera');
    setToques(0);
    setPerdidos(0);
    setLog([]);
  };

  const cargar = () => {
    if (fase === 'cargando') return;
    setFase('cargando');
    setToques(0);
    setPerdidos(0);
    setLog([]);
    if (modo === 'launch') {
      anotar('viewModelScope.launch: la corrutina se suspende en readAll() y suelta el hilo principal. La pantalla sigue respondiendo.');
    } else if (modo === 'runBlocking') {
      anotar('runBlocking: el hilo principal se queda esperando a readAll(). No se pinta nada ni se atiende ningún toque.', 'mal');
    } else {
      anotar('GlobalScope.launch: la pantalla sigue respondiendo, pero la corrutina no pertenece a nadie.', 'aviso');
    }
    const modoAlCargar = modo;
    temporizador.current = setTimeout(() => {
      temporizador.current = null;
      if (faseRef.current === 'cerrada') {
        anotar('La corrutina termina e intenta actualizar un ViewModel que ya no usa nadie: trabajo y memoria tirados.', 'mal');
        return;
      }
      anotar(
        modoAlCargar === 'runBlocking'
          ? 'Llegan los datos y el hilo se desbloquea de golpe. Con más de unos 5 s, Android habría mostrado el aviso de que la app no responde (ANR).'
          : 'Llegan los datos: _state pasa a Success y Compose pinta la lista.',
        modoAlCargar === 'runBlocking' ? 'aviso' : 'ok',
      );
      setFase('hecho');
    }, ESPERA_MS);
  };

  const cerrarPantalla = () => {
    if (fase !== 'cargando' || bloqueado) return;
    if (modo === 'launch') {
      if (temporizador.current) clearTimeout(temporizador.current);
      temporizador.current = null;
      anotar('Cierras la pantalla: el ViewModel se destruye (onCleared) y viewModelScope cancela la corrutina. No se desperdicia nada.', 'ok');
    } else {
      anotar('Cierras la pantalla, pero GlobalScope no se entera: la corrutina sigue en marcha.', 'aviso');
    }
    setFase('cerrada');
  };

  const tocar = () => {
    if (bloqueado) setPerdidos((p) => p + 1);
    else setToques((t) => t + 1);
  };

  const girando = fase === 'cargando' && !bloqueado && !reducir;

  return (
    <section aria-label={titulo} className={bloque}>
      <div className={cabecera}>
        <span className={etiqueta}>Demo</span>
        <p className={cn(tituloBloque, 'min-w-0 flex-1')}>{titulo}</p>
      </div>

      <div className="grid gap-4 px-4 py-4 sm:px-5">
        <Opciones
          leyenda="Cómo se lanza la carga"
          opciones={MODOS}
          valor={modo}
          onCambio={(m) => reiniciar(m)}
          desactivado={fase === 'cargando'}
        />

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,15rem)]">
          <pre className="overflow-x-auto rounded-md border bg-fd-muted/40 p-3 font-mono text-[0.8125rem] leading-relaxed">
            <code>{CODIGO[modo]}</code>
          </pre>

          <div
            className={cn(
              'flex min-h-52 flex-col rounded-lg border p-3 transition-colors',
              bloqueado ? 'border-red-600/50 dark:border-red-400/50' : 'border-fd-border',
            )}
            role="group"
            aria-label="Pantalla simulada"
          >
            <p className="text-xs font-medium text-fd-muted-foreground">TaskListScreen</p>
            <div className="flex flex-1 flex-col items-center justify-center gap-2 py-3 text-center text-sm">
              {fase === 'espera' && <p className="text-fd-muted-foreground">Sin datos todavía</p>}
              {fase === 'cargando' && (
                <>
                  <motion.span
                    animate={girando ? { rotate: 360 } : { rotate: 0 }}
                    transition={girando ? { repeat: Infinity, ease: 'linear', duration: 1 } : { duration: 0 }}
                    className="inline-flex"
                  >
                    <LoaderCircle className={cn('size-6', bloqueado && 'text-fd-muted-foreground')} aria-hidden />
                  </motion.span>
                  <p className={cn(bloqueado && malTexto)}>{bloqueado ? 'Congelada' : 'Cargando…'}</p>
                </>
              )}
              {fase === 'hecho' && <p className={okTexto}>3 tareas cargadas</p>}
              {fase === 'cerrada' && <p className="text-fd-muted-foreground">Pantalla cerrada</p>}
            </div>
            <p className="text-xs tabular-nums text-fd-muted-foreground">
              Fotogramas pintados: {fotogramas}
              {bloqueado && <span className={malTexto}> (parado)</span>}
            </p>
            <p className="text-xs tabular-nums text-fd-muted-foreground">
              Toques atendidos: {toques}
              {perdidos > 0 && <span className={malTexto}> · sin respuesta: {perdidos}</span>}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" className={botonPrimario} onClick={cargar} disabled={fase === 'cargando'}>
            Cargar datos (3 s)
          </button>
          <button type="button" className={botonSecundario} onClick={tocar} disabled={fase === 'cerrada'}>
            Tocar la pantalla
          </button>
          <button type="button" className={botonSecundario} onClick={cerrarPantalla} disabled={fase !== 'cargando' || bloqueado}>
            Cerrar la pantalla
          </button>
          <button type="button" className={botonSecundario} onClick={() => reiniciar()}>
            <RotateCcw className="size-3.5" aria-hidden />
            Reiniciar
          </button>
        </div>
        {bloqueado && (
          <p className="text-xs text-fd-muted-foreground">
            Con el hilo bloqueado tampoco podrías pulsar «Cerrar la pantalla»: Android no atiende ningún toque hasta que acabe.
          </p>
        )}

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
      </div>
    </section>
  );
}
