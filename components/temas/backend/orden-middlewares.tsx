'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowDown, ArrowUp, RotateCcw, Send } from 'lucide-react';
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

/**
 * Playground del orden de los middlewares de Express (app.ts del repositorio
 * de clase). Se reordena la pila con los botones y se manda una petición: la
 * demo enseña qué piezas se ejecutan, cuáles se saltan y qué respuesta sale.
 */

type Id = 'helmet' | 'cors' | 'json' | 'logger' | 'limiter' | 'rutas' | 'error';

interface Pieza {
  id: Id;
  codigo: string;
  para: string;
}

const PIEZAS: Record<Id, Pieza> = {
  helmet: { id: 'helmet', codigo: 'helmet()', para: 'Cabeceras de seguridad' },
  cors: { id: 'cors', codigo: 'cors()', para: 'Cabeceras CORS para el navegador' },
  json: { id: 'json', codigo: "express.json({ limit: '10mb' })", para: 'Lee el body JSON y lo deja en req.body' },
  logger: { id: 'logger', codigo: 'requestLogger', para: 'Escribe una línea de log por petición' },
  limiter: { id: 'limiter', codigo: 'generalLimiter', para: '100 peticiones cada 15 min por IP' },
  rutas: { id: 'rutas', codigo: "app.use('/api/users', usersRoutes)", para: 'PATCH /:id → validate → controlador' },
  error: { id: 'error', codigo: 'errorHandler', para: 'Middleware de errores (4 parámetros)' },
};

const ORDEN_CLASE: Id[] = ['helmet', 'cors', 'json', 'logger', 'limiter', 'rutas', 'error'];

type EstadoPaso = 'pendiente' | 'ejecuta' | 'responde' | 'salta';

interface Resultado {
  pasos: EstadoPaso[];
  status: number;
  cuerpo: string;
  notas: { texto: string; tipo: 'ok' | 'mal' | 'aviso' }[];
}

function simular(orden: Id[], lanzaError: boolean): Resultado {
  const pasos: EstadoPaso[] = orden.map(() => 'pendiente');
  const hecho = new Set<Id>();
  let status = 0;
  let cuerpo = '';
  let respondido = false;
  let error = false;

  for (let i = 0; i < orden.length; i++) {
    const id = orden[i]!;
    if (respondido) {
      pasos[i] = 'salta';
      continue;
    }
    if (error) {
      // Con un error pendiente, Express salta los middlewares normales y busca uno de 4 parámetros.
      if (id === 'error') {
        pasos[i] = 'responde';
        status = 500;
        cuerpo = '{ "message": "Error de prueba en el controlador" }';
        respondido = true;
      } else pasos[i] = 'salta';
      continue;
    }
    if (id === 'error') {
      // Sin error, el manejador de errores no se ejecuta.
      pasos[i] = 'salta';
      continue;
    }
    if (id === 'rutas') {
      if (lanzaError) {
        pasos[i] = 'ejecuta';
        error = true;
        continue;
      }
      pasos[i] = 'responde';
      respondido = true;
      if (!hecho.has('json')) {
        status = 400;
        cuerpo = '{ "errors": { "errors": ["Invalid input: expected object, received undefined"] } }';
      } else {
        status = 200;
        cuerpo = '{ "id": 1, "email": "ana@example.com", "name": "Ana María", "createdAt": "…" }';
      }
      continue;
    }
    pasos[i] = 'ejecuta';
    hecho.add(id);
  }

  if (!respondido) {
    // Error sin manejador detrás: responde el manejador por defecto de Express.
    status = 500;
    cuerpo = '<!DOCTYPE html> … Internal Server Error (HTML de Express, no JSON)';
  }

  const notas: Resultado['notas'] = [];
  if (error && !orden.slice(orden.indexOf('rutas')).includes('error')) {
    notas.push({
      tipo: 'mal',
      texto: 'El errorHandler está antes de las rutas: el error no le llega y responde el manejador por defecto de Express, con HTML en vez de JSON.',
    });
  }
  if (!lanzaError && !hecho.has('json')) {
    notas.push({
      tipo: 'mal',
      texto: 'express.json() no se ha ejecutado antes de la ruta: req.body es undefined y validate responde 400.',
    });
  }
  notas.push(
    hecho.has('helmet')
      ? { tipo: 'ok', texto: 'helmet ha puesto sus cabeceras (por ejemplo X-Content-Type-Options: nosniff) y ha quitado X-Powered-By.' }
      : { tipo: 'aviso', texto: 'Esta respuesta sale sin las cabeceras de seguridad de helmet.' },
  );
  notas.push(
    hecho.has('cors')
      ? { tipo: 'ok', texto: 'Lleva Access-Control-Allow-Origin: *, así que una web en otro origen (Angular en el 4200) puede leerla.' }
      : { tipo: 'aviso', texto: 'Sin cabeceras CORS: el navegador bloquearía la respuesta a Angular. Postman no lo comprueba.' },
  );
  notas.push(
    hecho.has('logger')
      ? {
          tipo: 'ok',
          texto: `requestLogger escribe «PATCH /api/users/1 ${status} …ms» con nivel ${status >= 500 ? 'error' : status >= 400 ? 'warn' : 'http'}.`,
        }
      : { tipo: 'aviso', texto: 'No sale ninguna línea de log: requestLogger va detrás de quien responde.' },
  );
  notas.push(
    hecho.has('limiter')
      ? { tipo: 'ok', texto: 'La petición cuenta para el límite de 100 cada 15 minutos.' }
      : { tipo: 'aviso', texto: 'Esta ruta no tiene límite de peticiones: generalLimiter va detrás.' },
  );

  return { pasos, status, cuerpo, notas };
}

export function OrdenMiddlewares({ titulo = 'Orden de los middlewares en app.ts' }: { titulo?: string }) {
  const reducir = useReducedMotion();
  const [orden, setOrden] = useState<Id[]>(ORDEN_CLASE);
  const [lanzaError, setLanzaError] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [visibles, setVisibles] = useState(0);
  const temporizador = useRef<ReturnType<typeof setInterval> | null>(null);

  const parar = () => {
    if (temporizador.current) clearInterval(temporizador.current);
    temporizador.current = null;
  };
  useEffect(() => parar, []);

  const mover = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= orden.length) return;
    const nuevo = [...orden];
    [nuevo[i], nuevo[j]] = [nuevo[j]!, nuevo[i]!];
    parar();
    setOrden(nuevo);
    setResultado(null);
  };

  const enviar = () => {
    parar();
    const r = simular(orden, lanzaError);
    setResultado(r);
    if (reducir) {
      setVisibles(orden.length);
      return;
    }
    setVisibles(0);
    let n = 0;
    temporizador.current = setInterval(() => {
      n += 1;
      setVisibles(n);
      if (n >= orden.length) parar();
    }, 420);
  };

  const restaurar = () => {
    parar();
    setOrden(ORDEN_CLASE);
    setResultado(null);
  };

  const terminado = resultado !== null && visibles >= orden.length;
  const esClase = orden.every((id, i) => id === ORDEN_CLASE[i]);

  return (
    <section aria-label={titulo} className={bloque}>
      <div className={cabecera}>
        <span className={etiqueta}>Demo</span>
        <p className={cn(tituloBloque, 'min-w-0 flex-1')}>{titulo}</p>
        {esClase && <span className="text-xs text-fd-muted-foreground">Orden de clase</span>}
      </div>

      <div className="space-y-4 px-4 py-4 sm:px-5">
        <p className="text-sm text-fd-muted-foreground">
          Cambia el orden con las flechas y manda la petición <code className="font-mono text-fd-foreground">PATCH /api/users/1</code> con el
          body <code className="font-mono text-fd-foreground">{'{ "name": "Ana María" }'}</code>. Express ejecuta las piezas de arriba abajo
          hasta que una responde.
        </p>

        <ol className="space-y-1.5" aria-label="Pila de middlewares">
          {orden.map((id, i) => {
            const p = PIEZAS[id];
            const estado: EstadoPaso = resultado && i < visibles ? resultado.pasos[i]! : 'pendiente';
            return (
              <motion.li
                key={id}
                layout={!reducir}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={cn(
                  'flex items-center gap-3 rounded-md border px-3 py-2 transition-colors',
                  estado === 'ejecuta' && 'border-fd-primary/50 bg-fd-primary/5',
                  estado === 'responde' && cn(okCaja),
                  estado === 'salta' && 'opacity-50',
                )}
              >
                <span className="w-5 shrink-0 text-right text-xs tabular-nums text-fd-muted-foreground">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-[13px] text-fd-foreground">{p.codigo}</p>
                  <p className="text-xs text-fd-muted-foreground">{p.para}</p>
                </div>
                <span
                  className={cn(
                    'hidden shrink-0 text-xs sm:inline',
                    estado === 'responde' ? okTexto : estado === 'ejecuta' ? 'text-fd-primary' : 'text-fd-muted-foreground',
                  )}
                  aria-live="polite"
                >
                  {estado === 'ejecuta' && 'se ejecuta'}
                  {estado === 'responde' && 'responde'}
                  {estado === 'salta' && 'no se ejecuta'}
                </span>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => mover(i, -1)}
                    disabled={i === 0}
                    aria-label={`Subir ${p.codigo}`}
                    className={cn(botonSecundario, 'px-2')}
                  >
                    <ArrowUp className="size-3.5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => mover(i, 1)}
                    disabled={i === orden.length - 1}
                    aria-label={`Bajar ${p.codigo}`}
                    className={cn(botonSecundario, 'px-2')}
                  >
                    <ArrowDown className="size-3.5" aria-hidden />
                  </button>
                </div>
              </motion.li>
            );
          })}
        </ol>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={enviar} className={botonPrimario}>
            <Send className="size-3.5" aria-hidden />
            Enviar petición
          </button>
          <button type="button" onClick={restaurar} className={botonSecundario} disabled={esClase}>
            <RotateCcw className="size-3.5" aria-hidden />
            Orden de clase
          </button>
          <label className="ml-auto inline-flex min-h-10 cursor-pointer items-center gap-2 text-sm sm:min-h-8">
            <input
              type="checkbox"
              checked={lanzaError}
              onChange={(e) => {
                parar();
                setLanzaError(e.target.checked);
                setResultado(null);
              }}
              className="size-4 accent-current"
            />
            El controlador lanza un error
          </label>
        </div>

        {terminado && resultado && (
          <motion.div
            initial={reducir ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
            aria-live="polite"
          >
            <div className={cn('rounded-md border px-3 py-2.5', resultado.status < 400 ? okCaja : malCaja)}>
              <p className={cn('text-sm font-semibold', resultado.status < 400 ? okTexto : malTexto)}>
                Respuesta: {resultado.status}
              </p>
              <p className="mt-1 break-words font-mono text-xs text-fd-foreground">{resultado.cuerpo}</p>
            </div>
            <ul className="space-y-1.5">
              {resultado.notas.map((n) => (
                <li
                  key={n.texto}
                  className={cn(
                    'rounded-md border px-3 py-2 text-sm',
                    n.tipo === 'ok' && okCaja,
                    n.tipo === 'mal' && malCaja,
                    n.tipo === 'aviso' && avisoCaja,
                  )}
                >
                  <span className={cn('mr-1.5 font-medium', n.tipo === 'ok' ? okTexto : n.tipo === 'mal' ? malTexto : avisoTexto)}>
                    {n.tipo === 'ok' ? 'Bien.' : n.tipo === 'mal' ? 'Fallo.' : 'Ojo.'}
                  </span>
                  {n.texto}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </section>
  );
}
