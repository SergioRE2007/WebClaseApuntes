'use client';

import { useId, useRef, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
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
  tituloBloque,
} from '@/components/interactive/estilos';

type Pantalla = 'Login' | 'Productos' | 'Pedidos' | 'Ajustes' | 'CrearProducto';
type Estrategia = 'nada' | 'inicio' | 'productos';

interface Entrada {
  id: number;
  pantalla: Pantalla;
}

const PESTANAS: Pantalla[] = ['Productos', 'Pedidos', 'Ajustes'];

const ESTRATEGIAS: { valor: Estrategia; texto: string }[] = [
  { valor: 'nada', texto: 'Sin opciones' },
  { valor: 'inicio', texto: 'popUpTo(findStartDestination().id)' },
  { valor: 'productos', texto: 'popUpTo<Ruta.Productos>' },
];

/**
 * Simula la pila de navegación (back stack) de la app de ejemplo: login,
 * tres pestañas con barra inferior y una pantalla de crear. Enseña qué hacen
 * popUpTo, inclusive y launchSingleTop, y cuántas veces hay que pulsar atrás.
 */
export function PilaNavegacion() {
  const siguienteId = useRef(1);
  const nueva = (pantalla: Pantalla): Entrada => ({ id: siguienteId.current++, pantalla });

  const [pila, setPila] = useState<Entrada[]>(() => [{ id: 0, pantalla: 'Login' }]);
  const [quitarLogin, setQuitarLogin] = useState(true);
  const [estrategia, setEstrategia] = useState<Estrategia>('productos');
  const [codigo, setCodigo] = useState('NavHost(startDestination = Ruta.Login)');
  const [aviso, setAviso] = useState<string | null>(null);
  const [cerrada, setCerrada] = useState(false);
  const idOpciones = useId();
  // El botón pulsado dentro del móvil desaparece al cambiar de pantalla: el foco
  // pasa al marco del móvil (que no se desmonta) para no perderlo con el teclado.
  const pantallaRef = useRef<HTMLDivElement>(null);
  const enfocarPantalla = () => pantallaRef.current?.focus({ preventScroll: true });

  const cima = pila[pila.length - 1]?.pantalla;
  const mostrarBarra = cima !== undefined && PESTANAS.includes(cima);

  const reiniciar = () => {
    siguienteId.current = 1;
    setPila([{ id: 0, pantalla: 'Login' }]);
    setCodigo('NavHost(startDestination = Ruta.Login)');
    setAviso(null);
    setCerrada(false);
  };

  const entrar = () => {
    if (quitarLogin) {
      setPila([nueva('Productos')]);
      setCodigo('navController.navigate(Ruta.Productos) {\n    popUpTo<Ruta.Login> { inclusive = true }\n}');
    } else {
      const entrada = nueva('Productos');
      setPila((p) => [...p, entrada]);
      setCodigo('navController.navigate(Ruta.Productos)');
    }
    setAviso(null);
    enfocarPantalla();
  };

  const irPestana = (destino: Pantalla) => {
    if (estrategia === 'nada') {
      const entrada = nueva(destino);
      setPila((p) => [...p, entrada]);
      setCodigo(`navController.navigate(Ruta.${destino})`);
      setAviso(cima === destino ? 'Sin launchSingleTop, tocar la pestaña en la que ya estás la apila otra vez.' : null);
      return;
    }
    const objetivo: Pantalla = estrategia === 'inicio' ? 'Login' : 'Productos';
    const indice = pila.map((e) => e.pantalla).lastIndexOf(objetivo);
    let resultado = indice >= 0 ? pila.slice(0, indice + 1) : pila;
    let nuevoAviso: string | null = null;
    if (indice < 0) {
      nuevoAviso =
        objetivo === 'Login'
          ? 'El destino inicial es el login y ya no está en la pila: popUpTo no quita nada y las pantallas se acumulan.'
          : 'Productos no está en la pila: popUpTo no quita nada.';
    }
    if (resultado[resultado.length - 1]?.pantalla !== destino) {
      resultado = [...resultado, nueva(destino)];
    } else if (!nuevoAviso) {
      nuevoAviso = 'launchSingleTop: ya estás en esa pestaña, así que no se abre otra vez.';
    }
    setPila(resultado);
    setCodigo(
      `navController.navigate(Ruta.${destino}) {\n    ${
        estrategia === 'inicio' ? 'popUpTo(navController.graph.findStartDestination().id)' : 'popUpTo<Ruta.Productos>'
      } { saveState = true }\n    launchSingleTop = true\n    restoreState = true\n}`,
    );
    setAviso(nuevoAviso);
  };

  const anadir = () => {
    const entrada = nueva('CrearProducto');
    setPila((p) => [...p, entrada]);
    setCodigo('navController.navigate(Ruta.CrearProducto)');
    setAviso(null);
    enfocarPantalla();
  };

  const quitarCima = (texto: string) => {
    if (pila.length <= 1) {
      setPila([]);
      setCerrada(true);
      setCodigo(texto);
      setAviso(null);
      return;
    }
    setPila((p) => p.slice(0, -1));
    setCodigo(texto);
    setAviso(null);
  };

  return (
    <MotionConfig reducedMotion="user">
      <section aria-label="Simulador de la pila de navegación" className={bloque}>
        <div className={cabecera}>
          <span className={etiqueta}>Demo</span>
          <p className={cn(tituloBloque, 'min-w-0 flex-1')}>La pila de navegación, paso a paso</p>
          <button type="button" onClick={reiniciar} className={botonSecundario}>
            <RotateCcw className="size-3.5" aria-hidden />
            Reiniciar
          </button>
        </div>

        <div className="grid gap-4 border-b px-4 py-3 text-sm sm:grid-cols-2 sm:px-5">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={quitarLogin}
              onChange={(e) => setQuitarLogin(e.target.checked)}
              className="mt-1 accent-fd-primary"
            />
            <span>
              Al entrar, <code className="text-xs">{'popUpTo<Ruta.Login> { inclusive = true }'}</code>
            </span>
          </label>
          <fieldset className="min-w-0">
            <legend className="mb-1 text-xs font-medium text-fd-muted-foreground">Al tocar la barra inferior</legend>
            <div className="flex flex-col gap-1">
              {ESTRATEGIAS.map((e) => (
                <label key={e.valor} className="flex items-start gap-2">
                  <input
                    type="radio"
                    name={`${idOpciones}-estrategia`}
                    checked={estrategia === e.valor}
                    onChange={() => setEstrategia(e.valor)}
                    className="mt-1 accent-fd-primary"
                  />
                  <code className="break-all text-xs">{e.texto}</code>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="grid gap-4 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:px-5">
          {/* El móvil */}
          <div className="flex flex-col gap-3">
            <div
              ref={pantallaRef}
              tabIndex={-1}
              role="group"
              aria-label={cerrada ? 'Móvil simulado: la app se ha cerrado' : `Móvil simulado: pantalla ${cima}`}
              className="mx-auto flex h-72 w-full max-w-64 flex-col overflow-hidden rounded-lg border bg-fd-card outline-none"
            >
              <div className="border-b px-3 py-2 text-xs text-fd-muted-foreground">Pantalla actual</div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={cerrada ? 'cerrada' : (pila[pila.length - 1]?.id ?? 'vacia')}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.18 }}
                  className="flex flex-1 flex-col items-center justify-center gap-3 px-3 text-center"
                >
                  {cerrada ? (
                    <>
                      <p className="text-sm font-medium">La app se ha cerrado</p>
                      <p className="text-xs text-fd-muted-foreground">La pila se ha quedado vacía.</p>
                      <button
                        type="button"
                        onClick={() => {
                          reiniciar();
                          enfocarPantalla();
                        }}
                        className={botonSecundario}
                      >
                        Abrir otra vez
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-base font-semibold">{cima}</p>
                      {cima === 'Login' && (
                        <button type="button" onClick={entrar} className={botonPrimario}>
                          Entrar
                        </button>
                      )}
                      {cima === 'Productos' && (
                        <button type="button" onClick={anadir} className={botonPrimario}>
                          Añadir producto
                        </button>
                      )}
                      {cima === 'CrearProducto' && (
                        <>
                          <p className="text-xs text-fd-muted-foreground">Formulario (sin barra inferior)</p>
                          <button
                            type="button"
                            onClick={() => {
                              quitarCima('// el estado pasa a Created\nonCreado()  // = navController.popBackStack()');
                              enfocarPantalla();
                            }}
                            className={botonPrimario}
                          >
                            Guardar
                          </button>
                        </>
                      )}
                      {(cima === 'Pedidos' || cima === 'Ajustes') && (
                        <p className="text-xs text-fd-muted-foreground">Contenido de la pestaña</p>
                      )}
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
              {mostrarBarra && !cerrada && (
                <nav aria-label="Barra inferior simulada" className="grid grid-cols-3 border-t">
                  {PESTANAS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      aria-pressed={cima === p}
                      onClick={() => irPestana(p)}
                      className={cn(
                        'min-h-10 px-1 py-2 text-xs transition-colors hover:bg-fd-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring',
                        cima === p ? 'font-semibold text-fd-primary' : 'text-fd-muted-foreground',
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </nav>
              )}
            </div>
            <button
              type="button"
              onClick={() => quitarCima('// botón atrás del sistema\nnavController.popBackStack()')}
              disabled={cerrada}
              className={cn(botonSecundario, 'mx-auto')}
            >
              <ArrowLeft className="size-4" aria-hidden />
              Atrás (botón del sistema)
            </button>
          </div>

          {/* La pila */}
          <div className="flex min-w-0 flex-col gap-3">
            <div>
              <p className="mb-2 text-xs font-medium text-fd-muted-foreground">
                Pila (arriba, la que se ve) · {pila.length} {pila.length === 1 ? 'pantalla' : 'pantallas'}
              </p>
              <ol className="flex min-h-24 flex-col gap-1.5" aria-live="polite">
                <AnimatePresence initial={false}>
                  {[...pila].reverse().map((e, i) => (
                    <motion.li
                      key={e.id}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 24 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        'rounded-md border px-3 py-1.5 font-mono text-xs',
                        i === 0 ? 'border-fd-primary/50 bg-fd-primary/5 text-fd-foreground' : 'text-fd-muted-foreground',
                      )}
                    >
                      Ruta.{e.pantalla}
                    </motion.li>
                  ))}
                </AnimatePresence>
                {pila.length === 0 && <li className={cn('rounded-md border px-3 py-1.5 text-xs', malCaja)}>Vacía</li>}
              </ol>
              {!cerrada && (
                <p className="mt-2 text-xs text-fd-muted-foreground">
                  Para cerrar la app hay que pulsar atrás {pila.length} {pila.length === 1 ? 'vez' : 'veces'}.
                </p>
              )}
            </div>
            <div className="min-w-0">
              <p className="mb-1 text-xs font-medium text-fd-muted-foreground">Lo que se ha ejecutado</p>
              <pre className="overflow-x-auto rounded-md border bg-fd-card p-3 text-xs leading-relaxed">
                <code>{codigo}</code>
              </pre>
            </div>
            {aviso && <p className={cn('rounded-md border px-3 py-2 text-xs', avisoCaja, avisoTexto)}>{aviso}</p>}
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
