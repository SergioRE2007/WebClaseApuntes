'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { bloque, botonSecundario, cabecera, etiqueta, malTexto, okTexto, tituloBloque } from '@/components/interactive/estilos';

type Clave = 'remember' | 'saveable' | 'datastore';
type Accion = 'girar' | 'cerrar' | null;

const COLUMNAS: { clave: Clave; titulo: string; codigo: string }[] = [
  { clave: 'remember', titulo: 'Estado del composable', codigo: 'remember { mutableStateOf(false) }' },
  { clave: 'saveable', titulo: 'Estado guardado al girar', codigo: 'rememberSaveable { mutableStateOf(false) }' },
  { clave: 'datastore', titulo: 'Preferencia en DataStore', codigo: 'preferences[uiMode] ?: false' },
];

/** Qué sobrevive a cada acción. */
const SOBREVIVE: Record<Exclude<Accion, null>, Record<Clave, boolean>> = {
  girar: { remember: false, saveable: true, datastore: true },
  cerrar: { remember: false, saveable: false, datastore: true },
};

const LEER_MS = 500;

function Interruptor({ activo, onCambio, etiquetaAccesible, desactivado }: { activo: boolean; onCambio: (v: boolean) => void; etiquetaAccesible: string; desactivado?: boolean }) {
  const reducir = useReducedMotion();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={etiquetaAccesible}
      disabled={desactivado}
      onClick={() => onCambio(!activo)}
      className={cn(
        'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border px-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring disabled:opacity-50',
        activo ? 'justify-end border-fd-primary bg-fd-primary' : 'justify-start bg-fd-muted',
      )}
    >
      <motion.span
        layout={!reducir}
        transition={{ type: 'spring', stiffness: 500, damping: 34 }}
        className={cn('size-5 rounded-full border', activo ? 'bg-fd-primary-foreground' : 'bg-fd-background')}
      />
    </button>
  );
}

/**
 * Demo: por qué el modo oscuro se guarda en DataStore y no en el estado de
 * Compose. Compara qué se pierde al girar el móvil y al cerrar la app.
 */
export function PersistenciaDataStore({ titulo = 'Qué se conserva al girar y al cerrar la app' }: { titulo?: string }) {
  const [valores, setValores] = useState<Record<Clave, boolean>>({ remember: false, saveable: false, datastore: false });
  const [archivo, setArchivo] = useState(false);
  const [ultima, setUltima] = useState<Accion>(null);
  /** Cómo estaban los interruptores justo antes de la última acción. */
  const [antes, setAntes] = useState<Record<Clave, boolean>>({ remember: false, saveable: false, datastore: false });
  const [leyendo, setLeyendo] = useState(false);
  const [vez, setVez] = useState(0);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (t.current) clearTimeout(t.current);
    },
    [],
  );

  const cambiar = (c: Clave, v: boolean) => {
    setValores((s) => ({ ...s, [c]: v }));
    if (c === 'datastore') setArchivo(v);
    setUltima(null);
  };

  const accion = (a: Exclude<Accion, null>) => {
    if (t.current) clearTimeout(t.current);
    setAntes(valores);
    setUltima(a);
    setVez((n) => n + 1);
    if (a === 'cerrar') {
      setValores({ remember: false, saveable: false, datastore: false });
      setLeyendo(true);
      t.current = setTimeout(() => {
        t.current = null;
        setLeyendo(false);
        setValores((s) => ({ ...s, datastore: archivo }));
      }, LEER_MS);
    } else {
      setValores((s) => ({ remember: false, saveable: s.saveable, datastore: s.datastore }));
    }
  };

  const reiniciar = () => {
    if (t.current) clearTimeout(t.current);
    t.current = null;
    setValores({ remember: false, saveable: false, datastore: false });
    setArchivo(false);
    setUltima(null);
    setLeyendo(false);
  };

  return (
    <section aria-label={titulo} className={bloque}>
      <div className={cabecera}>
        <span className={etiqueta}>Demo</span>
        <p className={cn(tituloBloque, 'min-w-0 flex-1')}>{titulo}</p>
      </div>

      <div className="grid gap-4 px-4 py-4 sm:px-5">
        <p className="text-sm text-fd-muted-foreground">Enciende los tres interruptores de «Dark Mode» y después gira el móvil o cierra la app.</p>

        <div className="grid gap-3 sm:grid-cols-3">
          {COLUMNAS.map((c) => {
            const perdio = ultima !== null && !SOBREVIVE[ultima][c.clave];
            // Si estaba apagado, no hay nada que conservar ni que perder.
            const estabaEncendido = antes[c.clave];
            const leyendoEsta = c.clave === 'datastore' && leyendo;
            return (
              <motion.div
                key={`${c.clave}-${vez}`}
                initial={ultima ? { opacity: 0.4 } : false}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35 }}
                className="flex min-w-0 flex-col gap-2 rounded-md border px-3 py-3"
              >
                <p className="text-xs font-medium text-fd-muted-foreground">{c.titulo}</p>
                <code className="break-words font-mono text-[0.75rem]">{c.codigo}</code>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="text-sm">Dark Mode</span>
                  <Interruptor
                    activo={valores[c.clave]}
                    onCambio={(v) => cambiar(c.clave, v)}
                    etiquetaAccesible={`Dark Mode con ${c.codigo}`}
                    desactivado={c.clave === 'datastore' && leyendo}
                  />
                </div>
                <p
                  className={cn(
                    'min-h-5 text-xs',
                    ultima && !leyendoEsta && estabaEncendido && (perdio ? malTexto : okTexto),
                    ultima && (!estabaEncendido || leyendoEsta) && 'text-fd-muted-foreground',
                  )}
                  aria-live="polite"
                >
                  {leyendoEsta
                    ? 'Leyendo el archivo… (de momento, el initialValue: false)'
                    : ultima
                      ? !estabaEncendido
                        ? 'Estaba apagado: enciéndelo y repite'
                        : perdio
                          ? 'Se ha perdido: vuelve a false'
                          : 'Se conserva'
                      : ''}
                </p>
              </motion.div>
            );
          })}
        </div>

        <p className="font-mono text-[0.8125rem] text-fd-muted-foreground">
          Archivo de preferencias en el móvil: <span className="text-fd-foreground">ui_mode = {String(archivo)}</span>
        </p>

        <div className="flex flex-wrap gap-2">
          <button type="button" className={botonSecundario} onClick={() => accion('girar')} disabled={leyendo}>
            Girar el móvil
          </button>
          <button type="button" className={botonSecundario} onClick={() => accion('cerrar')} disabled={leyendo}>
            Cerrar la app del todo y abrirla
          </button>
          <button type="button" className={botonSecundario} onClick={reiniciar}>
            <RotateCcw className="size-3.5" aria-hidden />
            Reiniciar
          </button>
        </div>
      </div>
    </section>
  );
}
