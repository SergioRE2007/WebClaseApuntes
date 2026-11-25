'use client';

import { useId, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  avisoCaja,
  avisoTexto,
  bloque,
  botonSecundario,
  cabecera,
  etiqueta,
  malCaja,
  malTexto,
  okCaja,
  okTexto,
  tituloBloque,
} from '@/components/interactive/estilos';

interface Categoria {
  id: number;
  nombre: string;
  version: number;
}

interface Producto {
  id: number;
  nombre: string;
  categoriaId: number;
}

type OnDelete = 'CASCADE' | 'RESTRICT';
type Tipo = 'ok' | 'error' | 'aviso';

const CATEGORIAS: Categoria[] = [
  { id: 1, nombre: 'Periféricos', version: 0 },
  { id: 2, nombre: 'Monitores', version: 0 },
];

const PRODUCTOS: Producto[] = [
  { id: 1, nombre: 'Ratón inalámbrico', categoriaId: 1 },
  { id: 2, nombre: 'Teclado mecánico', categoriaId: 1 },
  { id: 3, nombre: 'Monitor 24"', categoriaId: 2 },
];

/**
 * Laboratorio de claves ajenas en Room: qué pasa al guardar hijos antes que
 * padres, al borrar un padre con CASCADE o RESTRICT y al volver a guardar los
 * padres con @Insert(REPLACE) frente a @Upsert.
 */
export function LaboratorioClaves() {
  const [categorias, setCategorias] = useState<Categoria[]>(CATEGORIAS);
  const [productos, setProductos] = useState<Producto[]>(PRODUCTOS);
  const [onDelete, setOnDelete] = useState<OnDelete>('CASCADE');
  const [mensaje, setMensaje] = useState<{ tipo: Tipo; texto: string; codigo: string } | null>(null);
  const idGrupo = useId();

  const reiniciar = (vacia = false) => {
    setCategorias(vacia ? [] : CATEGORIAS);
    setProductos(vacia ? [] : PRODUCTOS);
    setMensaje(
      vacia
        ? { tipo: 'aviso', texto: 'Base vacía. Prueba a guardar en un orden y en el otro.', codigo: '// base de datos recién creada' }
        : null,
    );
  };

  const guardarProductosPrimero = () => {
    const faltan = PRODUCTOS.filter((p) => !categorias.some((c) => c.id === p.categoriaId));
    if (faltan.length > 0) {
      setMensaje({
        tipo: 'error',
        texto: `SQLiteConstraintException: FOREIGN KEY constraint failed (code 787). "${faltan[0].nombre}" apunta a la categoría ${faltan[0].categoriaId}, que todavía no existe. No se guarda nada.`,
        codigo: 'dao.upsertProductos(productos)',
      });
      return;
    }
    setProductos(PRODUCTOS);
    setMensaje({ tipo: 'ok', texto: 'Las categorías ya estaban, así que los productos se guardan sin problema.', codigo: 'dao.upsertProductos(productos)' });
  };

  const guardarEnOrden = () => {
    setCategorias((cs) => CATEGORIAS.map((c) => cs.find((x) => x.id === c.id) ?? c));
    setProductos(PRODUCTOS);
    setMensaje({
      tipo: 'ok',
      texto: 'Primero los padres y después los hijos: cada producto encuentra su categoría.',
      codigo: 'dao.upsertCategorias(categorias)\ndao.upsertProductos(productos)',
    });
  };

  const borrarPerifericos = () => {
    if (!categorias.some((c) => c.id === 1)) {
      setMensaje({ tipo: 'aviso', texto: 'La categoría 1 ya no existe. Reinicia para probar otra vez.', codigo: '' });
      return;
    }
    const hijos = productos.filter((p) => p.categoriaId === 1);
    if (onDelete === 'RESTRICT' && hijos.length > 0) {
      setMensaje({
        tipo: 'error',
        texto: `SQLiteConstraintException: FOREIGN KEY constraint failed. Con RESTRICT no se puede borrar una categoría que tiene ${hijos.length} productos.`,
        codigo: 'DELETE FROM categoria WHERE id = 1',
      });
      return;
    }
    setCategorias((cs) => cs.filter((c) => c.id !== 1));
    setProductos((ps) => ps.filter((p) => p.categoriaId !== 1));
    setMensaje({
      tipo: hijos.length ? 'aviso' : 'ok',
      texto: hijos.length
        ? `CASCADE: al borrar «Periféricos» se borran también sus ${hijos.length} productos.`
        : 'Se borra la categoría (no tenía productos).',
      codigo: 'DELETE FROM categoria WHERE id = 1',
    });
  };

  const guardarCategoriasReplace = () => {
    if (onDelete !== 'CASCADE') {
      setMensaje({
        tipo: 'aviso',
        texto: 'Esta prueba enseña el problema de REPLACE con CASCADE. Marca onDelete = ForeignKey.CASCADE arriba y vuelve a pulsar.',
        codigo: '',
      });
      return;
    }
    if (!categorias.length) {
      setMensaje({ tipo: 'aviso', texto: 'No hay categorías que volver a guardar. Reinicia primero.', codigo: '' });
      return;
    }
    const perdidos = productos.length;
    setCategorias((cs) => cs.map((c) => ({ ...c, version: c.version + 1 })));
    setProductos([]);
    setMensaje({
      tipo: 'error',
      texto: `REPLACE borra cada categoría y la vuelve a crear. Con CASCADE, ese borrado se lleva por delante ${perdidos} productos.`,
      codigo: '@Insert(onConflict = OnConflictStrategy.REPLACE)\nsuspend fun insertCategorias(categorias: List<CategoriaEntity>)',
    });
  };

  const guardarCategoriasUpsert = () => {
    if (!categorias.length) {
      setMensaje({ tipo: 'aviso', texto: 'No hay categorías. Reinicia primero.', codigo: '' });
      return;
    }
    setMensaje({
      tipo: 'ok',
      texto: '@Upsert actualiza la fila que ya existe sin borrarla: los productos siguen en su sitio.',
      codigo: '@Upsert\nsuspend fun upsertCategorias(categorias: List<CategoriaEntity>)',
    });
  };

  const fila = 'flex justify-between gap-2 rounded px-2 py-1 font-mono text-[0.7rem]';

  return (
    <MotionConfig reducedMotion="user">
      <section aria-label="Laboratorio de claves ajenas en Room" className={bloque}>
        <div className={cabecera}>
          <span className={etiqueta}>Demo</span>
          <p className={cn(tituloBloque, 'min-w-0 flex-1')}>Laboratorio de claves ajenas</p>
          <button type="button" onClick={() => reiniciar()} className={botonSecundario}>
            <RotateCcw className="size-3.5" aria-hidden />
            Reiniciar
          </button>
        </div>

        <fieldset className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b px-4 py-3 text-xs sm:px-5">
          <legend className="sr-only">onDelete de la clave ajena</legend>
          <span className="font-medium text-fd-muted-foreground">onDelete =</span>
          {(['CASCADE', 'RESTRICT'] as OnDelete[]).map((v) => (
            <label key={v} className="flex items-center gap-1.5">
              <input
                type="radio"
                name={`${idGrupo}-ondelete`}
                checked={onDelete === v}
                onChange={() => setOnDelete(v)}
                className="accent-fd-primary"
              />
              <code>ForeignKey.{v}</code>
            </label>
          ))}
        </fieldset>

        <div className="grid gap-2 border-b px-4 py-3 sm:grid-cols-2 sm:px-5">
          <button type="button" onClick={() => reiniciar(true)} className={botonSecundario}>
            Empezar con la base vacía
          </button>
          <button type="button" onClick={guardarProductosPrimero} className={botonSecundario}>
            Guardar los productos primero
          </button>
          <button type="button" onClick={guardarEnOrden} className={botonSecundario}>
            Guardar categorías y luego productos
          </button>
          <button type="button" onClick={borrarPerifericos} className={botonSecundario}>
            Borrar la categoría «Periféricos»
          </button>
          <button type="button" onClick={guardarCategoriasReplace} className={botonSecundario}>
            Volver a guardar categorías con REPLACE
          </button>
          <button type="button" onClick={guardarCategoriasUpsert} className={botonSecundario}>
            Volver a guardar categorías con @Upsert
          </button>
        </div>

        <div className="grid gap-3 px-4 py-4 sm:grid-cols-2 sm:px-5">
          <div className="min-w-0 rounded-lg border bg-fd-card">
            <div className="border-b px-3 py-2 text-xs font-medium">Tabla categoria (padre)</div>
            <ul className="flex min-h-20 flex-col gap-1 p-2">
              <AnimatePresence initial={false}>
                {categorias.map((c) => (
                  <motion.li
                    key={`${c.id}-${c.version}`}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.25 }}
                    className={fila}
                  >
                    <span>id {c.id}</span>
                    <span className="truncate">{c.nombre}</span>
                  </motion.li>
                ))}
              </AnimatePresence>
              {categorias.length === 0 && <li className="px-2 py-1 text-xs text-fd-muted-foreground">Vacía</li>}
            </ul>
          </div>
          <div className="min-w-0 rounded-lg border bg-fd-card">
            <div className="border-b px-3 py-2 text-xs font-medium">Tabla producto (hija)</div>
            <ul className="flex min-h-20 flex-col gap-1 p-2">
              <AnimatePresence initial={false}>
                {productos.map((p) => (
                  <motion.li
                    key={p.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.25 }}
                    className={fila}
                  >
                    <span className="truncate">{p.nombre}</span>
                    <span className="shrink-0 text-fd-muted-foreground">categoriaId {p.categoriaId}</span>
                  </motion.li>
                ))}
              </AnimatePresence>
              {productos.length === 0 && <li className="px-2 py-1 text-xs text-fd-muted-foreground">Vacía</li>}
            </ul>
          </div>
        </div>

        <div aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {mensaje && (
            <motion.div
              key={mensaje.texto}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="px-4 pb-4 sm:px-5"
            >
              <div
                className={cn(
                  'rounded-md border px-3 py-2 text-xs',
                  mensaje.tipo === 'ok' && cn(okCaja, okTexto),
                  mensaje.tipo === 'error' && cn(malCaja, malTexto),
                  mensaje.tipo === 'aviso' && cn(avisoCaja, avisoTexto),
                )}
              >
                {mensaje.texto}
              </div>
              {mensaje.codigo && (
                <pre className="mt-2 overflow-x-auto rounded-md border bg-fd-card p-3 text-xs leading-relaxed">
                  <code>{mensaje.codigo}</code>
                </pre>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </section>
    </MotionConfig>
  );
}
