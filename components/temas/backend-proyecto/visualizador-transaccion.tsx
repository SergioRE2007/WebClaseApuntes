'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Pause, Play, RotateCcw, StepForward } from 'lucide-react';
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
 * Visualizador de la operación "confirmar pedido" dentro de una transacción de
 * Prisma. El alumno elige un escenario (todo bien, sin stock, ya confirmado, no
 * existe) y si se hace con `tx` o con `prisma` suelto, y avanza paso a paso:
 * ve qué cambios quedan pendientes dentro de la transacción, cuándo se guardan
 * (COMMIT) y cómo se deshacen (ROLLBACK), o cómo sin transacción el stock se
 * queda restado a medias.
 */

interface ProductoDemo {
  id: number;
  nombre: string;
  stock: number;
}

const PRODUCTOS: ProductoDemo[] = [
  { id: 1, nombre: 'Teclado mecánico', stock: 12 },
  { id: 2, nombre: 'Ratón inalámbrico', stock: 30 },
  { id: 3, nombre: 'Monitor de 27 pulgadas', stock: 5 },
];

type Escenario = 'ok' | 'sin-stock' | 'confirmado' | 'no-existe';

const ESCENARIOS: { id: Escenario; nombre: string; detalle: string }[] = [
  { id: 'ok', nombre: 'Todo bien', detalle: 'Hay stock de las tres líneas.' },
  { id: 'sin-stock', nombre: 'Sin stock en la 3.ª línea', detalle: 'Pide 6 monitores y solo hay 5.' },
  { id: 'confirmado', nombre: 'Ya confirmado', detalle: 'El pedido ya no está PENDIENTE.' },
  { id: 'no-existe', nombre: 'No existe', detalle: 'Se pide el pedido 99.' },
];

interface Foto {
  stocks: Record<number, number>;
  estado: string;
}

type Tono = 'neutro' | 'ok' | 'error' | 'aviso';
type Fase = 'inicio' | 'abierta' | 'commit' | 'rollback' | 'sin-tx' | 'sin-tx-error' | 'sin-tx-ok';

interface PasoDemo {
  titulo: string;
  codigo: string;
  resultado: string;
  tono: Tono;
  guardado: Foto;
  pendiente: Foto | null;
  descartado?: Foto;
  fase: Fase;
  http?: { status: number; cuerpo: string };
}

const copiar = (f: Foto): Foto => ({ stocks: { ...f.stocks }, estado: f.estado });

function construirPasos(escenario: Escenario, conTx: boolean): PasoDemo[] {
  const p = conTx ? 'tx' : 'prisma';
  const pedidoId = escenario === 'no-existe' ? 99 : 1;
  const lineas = [
    { productoId: 1, cantidad: 2 },
    { productoId: 2, cantidad: 1 },
    { productoId: 3, cantidad: escenario === 'sin-stock' ? 6 : 3 },
  ];
  let guardado: Foto = {
    stocks: Object.fromEntries(PRODUCTOS.map((x) => [x.id, x.stock])),
    estado: escenario === 'confirmado' ? 'CONFIRMADO' : 'PENDIENTE',
  };
  let pendiente: Foto | null = null;
  const pasos: PasoDemo[] = [];
  const empujar = (paso: Omit<PasoDemo, 'guardado' | 'pendiente'>) =>
    pasos.push({ ...paso, guardado: copiar(guardado), pendiente: pendiente ? copiar(pendiente) : null });

  const fallar = (status: number, mensaje: string) => {
    empujar({
      titulo: 'Se lanza el error',
      codigo: `throw new HttpError(${status}, '${mensaje}');`,
      resultado: conTx ? 'El error sale del callback de $transaction.' : 'El error sale de la función.',
      tono: 'error',
      fase: conTx ? 'abierta' : 'sin-tx',
    });
    const cuerpo = JSON.stringify({ error: mensaje }, null, 2);
    if (conTx) {
      const antes = pendiente ? copiar(pendiente) : undefined;
      pendiente = null;
      empujar({
        titulo: 'ROLLBACK',
        codigo: '-- Prisma deshace todo lo que se hizo con tx',
        resultado: 'La base de datos queda exactamente como estaba antes del BEGIN.',
        tono: 'ok',
        fase: 'rollback',
        ...(antes ? { descartado: antes } : {}),
        http: { status, cuerpo },
      });
    } else {
      const tocado = PRODUCTOS.some((x) => guardado.stocks[x.id] !== x.stock);
      empujar({
        titulo: tocado ? 'Datos a medias' : 'No había cambiado nada',
        codigo: '-- sin transacción, no hay nada que deshacer',
        resultado: tocado
          ? 'El stock de las primeras líneas ya está restado y guardado, pero el pedido sigue PENDIENTE.'
          : 'Esta vez el error llegó antes de cambiar nada, así que no queda nada a medias. Si el fallo llega a mitad (prueba "Sin stock en la 3.ª línea"), sí.',
        tono: tocado ? 'error' : 'aviso',
        fase: 'sin-tx-error',
        http: { status, cuerpo },
      });
    }
    return pasos;
  };

  empujar({
    titulo: 'Llega la petición',
    codigo: `POST /api/pedidos/${pedidoId}/confirmar`,
    resultado: `requireAuth deja pasar y el controlador llama a confirmarPedido(${pedidoId}).`,
    tono: 'neutro',
    fase: 'inicio',
  });

  if (conTx) {
    pendiente = copiar(guardado);
    empujar({
      titulo: 'BEGIN',
      codigo: 'return prisma.$transaction(async (tx) => {',
      resultado: 'Se abre la transacción. Lo que se haga con tx no lo ve nadie más hasta el COMMIT.',
      tono: 'neutro',
      fase: 'abierta',
    });
  }

  const fase: Fase = conTx ? 'abierta' : 'sin-tx';

  if (escenario === 'no-existe') {
    empujar({
      titulo: 'Busca el pedido',
      codigo: `const pedido = await ${p}.pedido.findUnique({ where: { id: ${pedidoId} }, include: { lineas: true } });`,
      resultado: 'null: no hay ningún pedido con ese id.',
      tono: 'aviso',
      fase,
    });
    return fallar(404, 'Pedido no encontrado');
  }

  empujar({
    titulo: 'Busca el pedido',
    codigo: `const pedido = await ${p}.pedido.findUnique({ where: { id: ${pedidoId} }, include: { lineas: true } });`,
    resultado: `{ id: 1, estado: '${guardado.estado}', lineas: [3 líneas] }`,
    tono: 'neutro',
    fase,
  });

  if (escenario === 'confirmado') {
    empujar({
      titulo: 'Comprueba el estado',
      codigo: "if (pedido.estado !== 'PENDIENTE')",
      resultado: 'El estado es CONFIRMADO: no se puede confirmar otra vez.',
      tono: 'aviso',
      fase,
    });
    return fallar(409, 'El pedido ya no está pendiente');
  }

  empujar({
    titulo: 'Comprueba el estado',
    codigo: "if (pedido.estado !== 'PENDIENTE')",
    resultado: 'Está PENDIENTE: sigue.',
    tono: 'neutro',
    fase,
  });

  for (const linea of lineas) {
    const destino = conTx ? pendiente! : guardado;
    const actual = destino.stocks[linea.productoId] ?? 0;
    const nombre = PRODUCTOS.find((x) => x.id === linea.productoId)?.nombre ?? '';
    const codigo = `await ${p}.producto.updateMany({\n  where: { id: ${linea.productoId}, stock: { gte: ${linea.cantidad} } },\n  data: { stock: { decrement: ${linea.cantidad} } },\n});`;
    if (actual >= linea.cantidad) {
      destino.stocks[linea.productoId] = actual - linea.cantidad;
      if (!conTx) guardado = destino;
      empujar({
        titulo: `Resta ${linea.cantidad} de ${nombre}`,
        codigo,
        resultado: `{ count: 1 }: stock ${actual} → ${actual - linea.cantidad}${conTx ? ' (pendiente)' : ' (ya guardado)'}`,
        tono: 'neutro',
        fase,
      });
    } else {
      empujar({
        titulo: `No llega el stock de ${nombre}`,
        codigo,
        resultado: `{ count: 0 }: hay ${actual} y se piden ${linea.cantidad}; el where no encuentra la fila.`,
        tono: 'aviso',
        fase,
      });
      return fallar(409, `No hay stock suficiente del producto ${linea.productoId}`);
    }
  }

  if (conTx) pendiente!.estado = 'CONFIRMADO';
  else guardado.estado = 'CONFIRMADO';
  empujar({
    titulo: 'Pasa el pedido a CONFIRMADO',
    codigo: `return ${p}.pedido.update({ where: { id: 1 }, data: { estado: 'CONFIRMADO' } });`,
    resultado: conTx ? 'Cambio pendiente dentro de la transacción.' : 'Guardado al momento.',
    tono: 'neutro',
    fase,
  });

  const cuerpo = JSON.stringify({ id: 1, estado: 'CONFIRMADO', createdAt: '2026-11-20T10:00:00.000Z' }, null, 2);
  if (conTx) {
    guardado = copiar(pendiente!);
    pendiente = null;
    empujar({
      titulo: 'COMMIT',
      codigo: '});  // el callback termina sin errores',
      resultado: 'Se guardan todos los cambios a la vez.',
      tono: 'ok',
      fase: 'commit',
      http: { status: 200, cuerpo },
    });
  } else {
    empujar({
      titulo: 'Responde',
      codigo: 'res.json(pedido)',
      resultado: 'Ha salido bien, pero solo porque no ha fallado nada por el camino.',
      tono: 'aviso',
      fase: 'sin-tx-ok',
      http: { status: 200, cuerpo },
    });
  }
  return pasos;
}

const tonoTexto: Record<Tono, string> = {
  neutro: 'text-fd-muted-foreground',
  ok: okTexto,
  error: malTexto,
  aviso: avisoTexto,
};

function Valor({ valor, reducir }: { valor: number | string; reducir: boolean }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={String(valor)}
        initial={reducir ? false : { opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reducir ? { opacity: 0 } : { opacity: 0, y: 6 }}
        transition={{ duration: reducir ? 0 : 0.22 }}
        className="inline-block font-mono tabular-nums"
      >
        {valor}
      </motion.span>
    </AnimatePresence>
  );
}

export function VisualizadorTransaccion({ titulo = 'Confirmar un pedido: con y sin transacción' }: { titulo?: string }) {
  const id = useId();
  const reducir = useReducedMotion() ?? false;
  const [escenario, setEscenario] = useState<Escenario>('sin-stock');
  const [conTx, setConTx] = useState(true);
  const [paso, setPaso] = useState(0);
  const [reproduciendo, setReproduciendo] = useState(false);
  const listaRef = useRef<HTMLOListElement>(null);

  const pasos = useMemo(() => construirPasos(escenario, conTx), [escenario, conTx]);
  const actual = pasos[Math.min(paso, pasos.length - 1)]!;
  const alFinal = paso >= pasos.length - 1;

  useEffect(() => {
    if (!reproduciendo) return;
    if (alFinal) {
      setReproduciendo(false);
      return;
    }
    const t = setTimeout(() => setPaso((x) => x + 1), reducir ? 500 : 1100);
    return () => clearTimeout(t);
  }, [reproduciendo, alFinal, paso, reducir]);

  useEffect(() => {
    const lista = listaRef.current;
    const ultimo = lista?.lastElementChild as HTMLElement | null;
    if (lista && ultimo) lista.scrollTo({ top: ultimo.offsetTop, behavior: reducir ? 'auto' : 'smooth' });
  }, [paso, reducir]);

  const reiniciar = (e: Escenario = escenario, tx: boolean = conTx) => {
    setEscenario(e);
    setConTx(tx);
    setPaso(0);
    setReproduciendo(false);
  };

  const original = Object.fromEntries(PRODUCTOS.map((x) => [x.id, x.stock])) as Record<number, number>;
  const inconsistente = actual.fase === 'sin-tx-error' && PRODUCTOS.some((x) => actual.guardado.stocks[x.id] !== original[x.id]);

  const resumen = `Paso ${paso + 1} de ${pasos.length}: ${actual.titulo}. ${actual.resultado}${
    actual.http ? ` Respuesta HTTP ${actual.http.status}.` : ''
  }${inconsistente ? ' Datos inconsistentes: el stock ya se ha restado y el pedido sigue PENDIENTE.' : ''}`;

  const pastilla = 'rounded-md border px-2.5 py-1.5 text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring';

  return (
    <section aria-label={titulo} className={bloque}>
      <div className={cabecera}>
        <span className={etiqueta}>Demo</span>
        <p className={cn(tituloBloque, 'min-w-0 flex-1')}>{titulo}</p>
      </div>

      {/* Configuración */}
      <div className="grid gap-3 border-b px-4 py-4 sm:px-5">
        <div>
          <p id={`${id}-esc`} className="mb-1.5 text-xs font-medium text-fd-muted-foreground">
            Escenario
          </p>
          <div role="group" aria-labelledby={`${id}-esc`} className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {ESCENARIOS.map((e) => (
              <button
                key={e.id}
                type="button"
                aria-pressed={escenario === e.id}
                onClick={() => reiniciar(e.id)}
                className={cn(pastilla, escenario === e.id ? 'border-fd-primary bg-fd-primary/10' : 'hover:bg-fd-accent')}
              >
                <span className="block font-medium text-fd-foreground">{e.nombre}</span>
                <span className="block text-fd-muted-foreground">{e.detalle}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <p id={`${id}-modo`} className="mb-1.5 text-xs font-medium text-fd-muted-foreground">
            Cómo se escribe
          </p>
          <div role="group" aria-labelledby={`${id}-modo`} className="grid grid-cols-2 gap-1.5 sm:max-w-md">
            {[
              { tx: true, nombre: 'Con transacción', detalle: 'prisma.$transaction y tx' },
              { tx: false, nombre: 'Sin transacción', detalle: 'prisma suelto, una consulta tras otra' },
            ].map((m) => (
              <button
                key={String(m.tx)}
                type="button"
                aria-pressed={conTx === m.tx}
                onClick={() => reiniciar(escenario, m.tx)}
                className={cn(pastilla, conTx === m.tx ? 'border-fd-primary bg-fd-primary/10' : 'hover:bg-fd-accent')}
              >
                <span className="block font-medium text-fd-foreground">{m.nombre}</span>
                <span className="block text-fd-muted-foreground">{m.detalle}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Estado de la base de datos */}
      <div className="grid gap-3 px-4 pt-4 sm:grid-cols-2 sm:px-5">
        <div className="min-w-0 rounded-md border">
          <p className="border-b px-3 py-2 text-xs font-medium">Base de datos guardada</p>
          <p className="px-3 pt-1.5 text-[11px] text-fd-muted-foreground">Lo que ve cualquier otra petición</p>
          <table className="w-full text-xs sm:text-sm">
            <thead className="sr-only">
              <tr>
                <th scope="col">Fila</th>
                <th scope="col">Valor guardado</th>
              </tr>
            </thead>
            <tbody>
              {PRODUCTOS.map((x) => {
                const v = actual.guardado.stocks[x.id] ?? 0;
                const cambiado = v !== x.stock;
                return (
                  <tr key={x.id} className="border-b last:border-b-0">
                    <td className="px-3 py-1.5">{x.nombre}</td>
                    <td className={cn('px-3 py-1.5 text-right', cambiado && (inconsistente ? malTexto : 'font-semibold'))}>
                      <Valor valor={v} reducir={reducir} />
                    </td>
                  </tr>
                );
              })}
              <tr>
                <td className="px-3 py-1.5">Pedido {escenario === 'no-existe' ? '99' : '1'}</td>
                <td className="px-3 py-1.5 text-right text-xs">
                  {escenario === 'no-existe' ? <span className="text-fd-muted-foreground">no existe</span> : <Valor valor={actual.guardado.estado} reducir={reducir} />}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={cn('min-w-0 rounded-md border', !conTx && 'border-dashed')}>
          <p className="border-b px-3 py-2 text-xs font-medium">Dentro de la transacción</p>
          {!conTx ? (
            <p className="px-3 py-3 text-xs text-fd-muted-foreground">
              Sin transacción no hay zona intermedia: cada consulta se guarda en cuanto se ejecuta.
            </p>
          ) : actual.pendiente ? (
            <>
              <p className="px-3 pt-1.5 text-[11px] text-fd-muted-foreground">Cambios pendientes: solo los ve tx</p>
              <table className="w-full text-xs sm:text-sm">
                <thead className="sr-only">
                  <tr>
                    <th scope="col">Fila</th>
                    <th scope="col">Valor pendiente</th>
                  </tr>
                </thead>
                <tbody>
                  {PRODUCTOS.map((x) => {
                    const v = actual.pendiente!.stocks[x.id] ?? 0;
                    const g = actual.guardado.stocks[x.id] ?? 0;
                    return (
                      <tr key={x.id} className="border-b last:border-b-0">
                        <td className="px-3 py-1.5">{x.nombre}</td>
                        <td className={cn('px-3 py-1.5 text-right', v !== g && avisoTexto)}>
                          <Valor valor={v} reducir={reducir} />
                        </td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td className="px-3 py-1.5">Pedido</td>
                    <td className={cn('px-3 py-1.5 text-right text-xs', actual.pendiente.estado !== actual.guardado.estado && avisoTexto)}>
                      <Valor valor={actual.pendiente.estado} reducir={reducir} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </>
          ) : actual.fase === 'rollback' ? (
            <div className="px-3 py-2">
              <p className={cn('text-xs font-medium', okTexto)}>ROLLBACK: cambios descartados</p>
              {actual.descartado && (
                <ul className="mt-1 grid gap-0.5 text-xs text-fd-muted-foreground">
                  {PRODUCTOS.filter((x) => actual.descartado!.stocks[x.id] !== actual.guardado.stocks[x.id]).map((x) => (
                    <motion.li key={x.id} initial={reducir ? false : { opacity: 1 }} animate={{ opacity: 0.6 }} className="line-through">
                      {x.nombre}: {actual.descartado!.stocks[x.id]}
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
          ) : actual.fase === 'commit' ? (
            <p className={cn('px-3 py-3 text-xs font-medium', okTexto)}>COMMIT: todo se ha copiado a la base de datos guardada.</p>
          ) : (
            <p className="px-3 py-3 text-xs text-fd-muted-foreground">Aún no se ha abierto.</p>
          )}
        </div>
      </div>

      {/* Registro de pasos */}
      <div className="px-4 py-4 sm:px-5">
        <p className="mb-1.5 text-xs font-medium text-fd-muted-foreground">
          Paso {paso + 1} de {pasos.length}
        </p>
        <ol
          ref={listaRef}
          tabIndex={0}
          aria-label="Registro de pasos"
          className="relative grid max-h-72 gap-1.5 overflow-y-auto rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
        >
          {pasos.slice(0, paso + 1).map((p, i) => (
            <motion.li
              key={`${escenario}-${conTx}-${i}`}
              initial={reducir ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={cn('min-w-0 rounded-md border px-3 py-2', i === paso ? 'border-fd-primary' : 'opacity-70')}
            >
              <p className="text-xs font-semibold">
                {i + 1}. {p.titulo}
              </p>
              <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-fd-foreground">{p.codigo}</pre>
              <p className={cn('mt-1 text-xs', tonoTexto[p.tono])}>{p.resultado}</p>
            </motion.li>
          ))}
        </ol>

        {actual.http && (
          <motion.div
            initial={reducir ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn('mt-3 rounded-md border px-3 py-2', actual.http.status < 400 ? okCaja : malCaja)}
          >
            <p className={cn('text-xs font-semibold', actual.http.status < 400 ? okTexto : malTexto)}>
              Respuesta HTTP {actual.http.status}
            </p>
            <pre className="mt-1 overflow-x-auto font-mono text-[11px] text-fd-foreground">{actual.http.cuerpo}</pre>
          </motion.div>
        )}

        {inconsistente && (
          <p className={cn('mt-3 rounded-md border px-3 py-2 text-xs', avisoCaja)}>
            <span className={cn('font-semibold', avisoTexto)}>Datos inconsistentes: </span>
            el cliente recibe un error, pero el stock ya se ha restado y el pedido sigue PENDIENTE. Si lo reintenta, se vuelve a restar.
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => setPaso((x) => x + 1)} disabled={alFinal || reproduciendo} className={botonPrimario}>
            <StepForward className="size-4" aria-hidden />
            Siguiente paso
          </button>
          <button
            type="button"
            onClick={() => {
              if (alFinal) setPaso(0);
              setReproduciendo((r) => !r);
            }}
            className={botonSecundario}
          >
            {reproduciendo ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
            {reproduciendo ? 'Pausa' : alFinal ? 'Otra vez' : 'Reproducir'}
          </button>
          <button type="button" onClick={() => reiniciar()} className={botonSecundario}>
            <RotateCcw className="size-3.5" aria-hidden />
            Reiniciar
          </button>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {resumen}
      </p>
    </section>
  );
}
