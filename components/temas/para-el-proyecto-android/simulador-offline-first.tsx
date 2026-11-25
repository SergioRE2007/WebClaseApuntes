'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { RefreshCw, Trash2, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  avisoCaja,
  avisoTexto,
  bloque,
  botonPrimario,
  botonSecundario,
  cabecera,
  etiqueta,
  malCaja,
  malTexto,
  okCaja,
  okTexto,
  tituloBloque,
} from '@/components/interactive/estilos';

interface Producto {
  id: number;
  nombre: string;
  precio: string;
}

const API_INICIAL: Producto[] = [
  { id: 1, nombre: 'Ratón inalámbrico', precio: '24.5' },
  { id: 2, nombre: 'Teclado mecánico', precio: '59.9' },
  { id: 3, nombre: 'Monitor 24"', precio: '129' },
];

type Panel = 'api' | 'room' | 'ui';

/**
 * Simula el patrón "Room como fuente de verdad": la pantalla solo lee de Room,
 * refresh() copia de la API a Room, y sin red se enseñan los datos viejos.
 * El estado de la pantalla se calcula como en el combine del ViewModel.
 */
export function SimuladorOfflineFirst() {
  const [api, setApi] = useState<Producto[]>(API_INICIAL);
  const [room, setRoom] = useState<Producto[]>([]);
  const [wifi, setWifi] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [arrancando, setArrancando] = useState(true);
  const [activo, setActivo] = useState<Panel | null>(null);
  const [registro, setRegistro] = useState<string[]>(['Se abre la app: el ViewModel llama a refresh() en su init.']);
  const temporizadores = useRef<number[]>([]);

  const apuntar = (linea: string) => setRegistro((r) => [linea, ...r].slice(0, 5));
  const despues = (ms: number, fn: () => void) => {
    temporizadores.current.push(window.setTimeout(fn, ms));
  };

  useEffect(() => {
    const lista = temporizadores.current;
    return () => lista.forEach((t) => window.clearTimeout(t));
  }, []);

  const refresh = (conWifi = wifi) => {
    if (cargando) return;
    setCargando(true);
    setError(null);
    setActivo('api');
    despues(900, () => {
      if (conWifi) {
        setRoom(api.map((p) => ({ ...p })));
        setActivo('room');
        apuntar(`200 OK: upsert de ${api.length} productos en Room. El Flow de Room emite.`);
        despues(500, () => setActivo('ui'));
        despues(1100, () => setActivo(null));
      } else {
        setError('No hay conexión');
        setActivo(null);
        apuntar('IOException: no hay red. Se guarda el mensaje en _error.');
      }
      setCargando(false);
    });
  };

  // Al abrir la pantalla, el uiState vale su initialValue (Loading) hasta que
  // Room emite lo que tiene guardado, que es casi enseguida, aunque esté vacío.
  const abrirApp = () => {
    setArrancando(true);
    despues(250, () => {
      setArrancando(false);
      apuntar('Room emite enseguida lo que tiene guardado: la pantalla pasa de Loading a Success.');
    });
  };

  // Primera carga al montar, como el init del ViewModel. (En modo estricto se
  // monta dos veces: la limpieza de arriba cancela el temporizador de la primera.)
  useEffect(() => {
    abrirApp();
    refresh(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const borrarDatos = () => {
    setRoom([]);
    setError(null);
    apuntar('Datos de la app borrados: Room está vacía. Se vuelve a abrir la app.');
    abrirApp();
    refresh();
  };

  const cambiarPrecio = () => {
    setApi((lista) => lista.map((p) => (p.id === 1 ? { ...p, precio: (Number(p.precio) + 1).toFixed(1) } : p)));
    apuntar('Alguien cambia el precio del producto 1 en la API. Room no se entera hasta el próximo refresh().');
  };

  const estado: 'Loading' | 'Success' | 'Error' =
    arrancando ? 'Loading' : room.length === 0 && error ? 'Error' : 'Success';

  const panel = (id: Panel) =>
    cn(
      'flex min-w-0 flex-col rounded-lg border bg-fd-card transition-colors duration-300',
      activo === id && 'border-fd-primary',
    );

  return (
    <MotionConfig reducedMotion="user">
      <section aria-label="Simulador de offline first" className={bloque}>
        <div className={cabecera}>
          <span className={etiqueta}>Demo</span>
          <p className={cn(tituloBloque, 'min-w-0 flex-1')}>Room como fuente de verdad</p>
        </div>

        <div className="flex flex-wrap gap-2 border-b px-4 py-3 sm:px-5">
          <button type="button" onClick={() => refresh()} disabled={cargando} className={botonPrimario}>
            <RefreshCw className={cn('size-3.5', cargando && 'animate-spin motion-reduce:animate-none')} aria-hidden />
            refresh()
          </button>
          <button
            type="button"
            aria-pressed={!wifi}
            onClick={() => {
              setWifi((w) => !w);
              apuntar(wifi ? 'Se quita el wifi.' : 'Vuelve el wifi.');
            }}
            className={botonSecundario}
          >
            {wifi ? <Wifi className="size-3.5" aria-hidden /> : <WifiOff className="size-3.5" aria-hidden />}
            {wifi ? 'Quitar el wifi' : 'Poner el wifi'}
          </button>
          <button type="button" onClick={cambiarPrecio} className={botonSecundario}>
            Cambiar un precio en la API
          </button>
          <button type="button" onClick={borrarDatos} disabled={cargando} className={botonSecundario}>
            <Trash2 className="size-3.5" aria-hidden />
            Borrar datos y abrir
          </button>
        </div>

        <div className="grid gap-3 px-4 py-4 sm:grid-cols-3 sm:px-5">
          <div className={panel('api')}>
            <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
              <span className="text-xs font-medium">API (red)</span>
              <span className={cn('text-xs', wifi ? okTexto : malTexto)}>{wifi ? 'Con red' : 'Sin red'}</span>
            </div>
            <ul className={cn('flex flex-col gap-1 px-3 py-2 text-xs', !wifi && 'opacity-50')}>
              {api.map((p) => (
                <li key={p.id} className="flex justify-between gap-2">
                  <span className="truncate">{p.nombre}</span>
                  <span className="font-mono text-fd-muted-foreground">&quot;{p.precio}&quot;</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={panel('room')}>
            <div className="border-b px-3 py-2 text-xs font-medium">Room (tabla producto)</div>
            <ul className="flex min-h-16 flex-col gap-1 px-3 py-2 text-xs">
              <AnimatePresence initial={false}>
                {room.map((p) => (
                  <motion.li
                    key={`${p.id}-${p.precio}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex justify-between gap-2"
                  >
                    <span className="truncate">{p.nombre}</span>
                    <span className="font-mono text-fd-muted-foreground">{Number(p.precio).toFixed(1)}</span>
                  </motion.li>
                ))}
              </AnimatePresence>
              {room.length === 0 && <li className="text-fd-muted-foreground">Vacía</li>}
            </ul>
          </div>

          <div className={panel('ui')}>
            <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
              <span className="text-xs font-medium">Pantalla</span>
              <span
                className={cn(
                  'rounded border px-1.5 py-0.5 font-mono text-[0.7rem]',
                  estado === 'Success' && okCaja,
                  estado === 'Error' && malCaja,
                  estado === 'Loading' && avisoCaja,
                )}
              >
                {estado}
              </span>
            </div>
            <div className="px-3 py-2 text-xs" aria-live="polite">
              {estado === 'Loading' && <p className="text-fd-muted-foreground">Cargando…</p>}
              {estado === 'Error' && <p className={malTexto}>{error}. No hay nada guardado que enseñar.</p>}
              {estado === 'Success' && room.length === 0 && (
                <p className="text-fd-muted-foreground">
                  Lista vacía: Room aún no tiene datos{cargando ? ' y la API todavía no ha respondido' : ''}.
                </p>
              )}
              {estado === 'Success' && room.length > 0 && (
                <ul className="flex flex-col gap-1">
                  {room.map((p) => (
                    <li key={p.id} className="truncate">
                      {p.nombre} · {Number(p.precio).toFixed(1)} €
                    </li>
                  ))}
                </ul>
              )}
              {estado === 'Success' && room.length > 0 && error && (
                <p className={cn('mt-2', avisoTexto)}>Sin red: son los datos guardados la última vez.</p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t px-4 py-3 sm:px-5">
          <p className="mb-1 text-xs font-medium text-fd-muted-foreground">Qué ha pasado (lo último arriba)</p>
          <ol className="flex flex-col gap-0.5 text-xs" aria-live="polite">
            {registro.map((l, i) => (
              <li key={`${i}-${l}`} className={i === 0 ? 'text-fd-foreground' : 'text-fd-muted-foreground'}>
                {l}
              </li>
            ))}
          </ol>
        </div>
      </section>
    </MotionConfig>
  );
}
