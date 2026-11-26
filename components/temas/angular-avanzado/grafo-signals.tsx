'use client';

import { useId, useRef, useState } from 'react';
import { motion, MotionConfig, useReducedMotion } from 'motion/react';
import { Plus, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { bloque, botonSecundario, cabecera, etiqueta, tituloBloque } from '@/components/interactive/estilos';

/**
 * Grafo de signals: dos writable (searchText, products), tres computed y un
 * effect. Cada nodo cuenta cuántas veces se ha calculado y parpadea cuando
 * lo hace. Reglas que imita (las de Angular):
 * - set() con el mismo valor no avisa a nadie (igualdad con Object.is).
 * - Un computed solo se recalcula si cambia algo de lo que lee.
 * - filteredProducts devuelve un array nuevo cada vez, así que lo que depende
 *   de él se recalcula; visibleCount es un número y, si no cambia, el effect
 *   no se vuelve a ejecutar.
 * - Cambiar una propiedad normal (no signal) no avisa a nadie.
 */

interface Producto {
  id: number;
  title: string;
  price: number;
}

const BASE: Producto[] = [
  { id: 1, title: 'Keyboard', price: 100 },
  { id: 2, title: 'Microphone', price: 35 },
  { id: 3, title: 'Web camera', price: 79 },
  { id: 4, title: 'Tablet', price: 500 },
];
const EXTRA: Producto[] = [
  { id: 5, title: 'Headphones', price: 60 },
  { id: 6, title: 'Mouse', price: 25 },
  { id: 7, title: 'Monitor', price: 229 },
];

type Nodo = 'searchText' | 'products' | 'filteredProducts' | 'catalogCount' | 'visibleCount' | 'effect';

const filtrar = (lista: Producto[], texto: string) => {
  const t = texto.trim().toLowerCase();
  return lista.filter((p) => p.title.toLowerCase().includes(t));
};

const CERO: Record<Nodo, number> = { searchText: 0, products: 0, filteredProducts: 1, catalogCount: 1, visibleCount: 1, effect: 1 };

export function GrafoSignals({ titulo = 'Qué se recalcula cuando cambia un signal' }: { titulo?: string }) {
  const [search, setSearch] = useState('');
  const [borrador, setBorrador] = useState('');
  const [products, setProducts] = useState(BASE);
  const [cuentas, setCuentas] = useState(CERO);
  const [pulso, setPulso] = useState<Record<Nodo, number>>({ ...CERO });
  const [plano, setPlano] = useState(0);
  const [aviso, setAviso] = useState('Al arrancar, cada computed y el effect se calculan una vez.');
  const reducir = useReducedMotion();
  const idBusqueda = useId();
  const ultimoCount = useRef(filtrar(BASE, '').length);

  const filtrados = filtrar(products, search);

  const marcar = (nodos: Nodo[]) => {
    setCuentas((c) => {
      const n = { ...c };
      for (const k of nodos) n[k] += 1;
      return n;
    });
    setPulso((p) => {
      const n = { ...p };
      for (const k of nodos) n[k] += 1;
      return n;
    });
  };

  const propagar = (origen: Nodo, nuevaLista: Producto[], nuevoTexto: string) => {
    const nodos: Nodo[] = [origen, 'filteredProducts', 'visibleCount'];
    if (origen === 'products') nodos.push('catalogCount');
    const nuevoCount = filtrar(nuevaLista, nuevoTexto).length;
    const efecto = nuevoCount !== ultimoCount.current;
    if (efecto) nodos.push('effect');
    ultimoCount.current = nuevoCount;
    marcar(nodos);
    return efecto;
  };

  const buscar = () => {
    if (borrador === search) {
      setAviso(`searchText.set('${borrador}'): es el mismo valor, así que no avisa a nadie. Nada se recalcula.`);
      return;
    }
    const efecto = propagar('searchText', products, borrador);
    setSearch(borrador);
    setAviso(
      `searchText.set('${borrador}'): se recalculan filteredProducts y visibleCount. catalogCount no lee searchText y conserva su valor (memoización).` +
        (efecto ? ' El número de visibles cambia y el effect se ejecuta.' : ' El número de visibles no cambia, así que el effect no se ejecuta.'),
    );
  };

  const anadir = () => {
    const siguiente = EXTRA.find((e) => !products.some((p) => p.id === e.id));
    if (!siguiente) return;
    const lista = [...products, siguiente];
    const efecto = propagar('products', lista, search);
    setProducts(lista);
    setAviso(
      `products.update(lista => [...lista, ${siguiente.title}]): cambia la fuente de todo, así que se recalculan los tres computed.` +
        (efecto ? ' El effect se ejecuta.' : ' El número de visibles no cambia y el effect no se ejecuta.'),
    );
  };

  const cambiarPlano = () => {
    setPlano((p) => p + 1);
    setAviso('this.contador++ en una propiedad normal: no es un signal, así que ningún computed se entera.');
  };

  const reiniciar = () => {
    setSearch('');
    setBorrador('');
    setProducts(BASE);
    setCuentas(CERO);
    setPulso({ ...CERO });
    setPlano(0);
    ultimoCount.current = filtrar(BASE, '').length;
    setAviso('Al arrancar, cada computed y el effect se calculan una vez.');
  };

  const valor: Record<Nodo, string> = {
    searchText: `'${search}'`,
    products: `${products.length} productos`,
    filteredProducts: `${filtrados.length} → ${filtrados.map((p) => p.title).join(', ') || '[]'}`,
    catalogCount: String(products.length),
    visibleCount: String(filtrados.length),
    effect: `console.log(${filtrados.length})`,
  };

  const tarjeta = (n: Nodo, tipo: string) => (
    <motion.div
      key={`${n}-${pulso[n]}`}
      initial={reducir || pulso[n] <= CERO[n] ? false : { scale: 0.97 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.25 }}
      className={cn('relative min-w-0 rounded-md border bg-fd-card px-3 py-2', pulso[n] > CERO[n] && 'border-fd-primary/50')}
    >
      {!reducir && pulso[n] > CERO[n] && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-md bg-fd-primary/10"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.9 }}
        />
      )}
      <p className="text-[11px] text-fd-muted-foreground">{tipo}</p>
      <p className="truncate font-mono text-sm font-semibold">{n}</p>
      <p className="truncate font-mono text-xs text-fd-muted-foreground" title={valor[n]}>
        {valor[n]}
      </p>
      {n !== 'searchText' && n !== 'products' && (
        <p className="mt-1 text-xs tabular-nums">
          {n === 'effect' ? 'Ejecutado' : 'Calculado'} {cuentas[n]} {cuentas[n] === 1 ? 'vez' : 'veces'}
        </p>
      )}
    </motion.div>
  );

  return (
    <MotionConfig reducedMotion="user">
      <section aria-label={titulo} className={bloque}>
        <div className={cabecera}>
          <span className={etiqueta}>Demo</span>
          <p className={cn(tituloBloque, 'min-w-0 flex-1')}>{titulo}</p>
        </div>
        <div className="grid gap-4 px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor={idBusqueda}>
              Texto de búsqueda
            </label>
            <input
              id={idBusqueda}
              value={borrador}
              placeholder="Buscar producto"
              onChange={(e) => setBorrador(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') buscar();
              }}
              className="min-h-10 w-40 rounded-md border bg-fd-background px-2 py-1 text-sm sm:min-h-8"
            />
            <button type="button" className={botonSecundario} onClick={buscar}>
              searchText.set(...)
            </button>
            <button type="button" className={botonSecundario} onClick={anadir} disabled={products.length >= BASE.length + EXTRA.length}>
              <Plus className="size-3.5" aria-hidden />
              Añadir producto
            </button>
            <button type="button" className={botonSecundario} onClick={cambiarPlano}>
              Propiedad normal ({plano})
            </button>
            <button type="button" className={botonSecundario} onClick={reiniciar} aria-label="Reiniciar la demo">
              <RotateCcw className="size-3.5" aria-hidden />
            </button>
          </div>

          <div className="grid gap-2">
            <p className="text-xs font-medium text-fd-muted-foreground">Fuentes (writable signals)</p>
            <div className="grid grid-cols-2 gap-2">
              {tarjeta('searchText', 'signal')}
              {tarjeta('products', 'signal')}
            </div>
            <p className="text-center text-fd-muted-foreground" aria-hidden>
              ↓
            </p>
            <p className="text-xs font-medium text-fd-muted-foreground">Derivados (computed, de solo lectura)</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {tarjeta('filteredProducts', 'lee products y searchText')}
              {tarjeta('visibleCount', 'lee filteredProducts')}
              {tarjeta('catalogCount', 'lee solo products')}
            </div>
            <p className="text-center text-fd-muted-foreground" aria-hidden>
              ↓
            </p>
            <p className="text-xs font-medium text-fd-muted-foreground">Efecto secundario</p>
            {tarjeta('effect', 'effect: lee visibleCount')}
          </div>

          <p role="status" className="rounded-md border px-3 py-2 text-sm">
            {aviso}
          </p>
        </div>
      </section>
    </MotionConfig>
  );
}
