'use client';

import { useId, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  bloque,
  botonSecundario,
  cabecera,
  etiqueta,
  malCaja,
  malTexto,
  okTexto,
  tituloBloque,
} from '@/components/interactive/estilos';

/**
 * Simulador del listado paginado del backend: el alumno cambia los criterios
 * (búsqueda, filtro, orden, página y tamaño) y ve, a la vez, la URL que manda
 * Angular, lo que valida Zod, la consulta de Prisma que se construye (y su SQL
 * aproximado), qué filas de la tabla se descartan, se saltan o se devuelven, y
 * el JSON de respuesta con el total.
 */

interface Categoria {
  id: number;
  nombre: string;
}

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  categoriaId: number;
  creado: string; // dd/mm, solo para enseñarlo
  orden: number; // createdAt simulado (más alto = más nuevo)
}

const CATEGORIAS: Categoria[] = [
  { id: 1, nombre: 'Periféricos' },
  { id: 2, nombre: 'Monitores' },
  { id: 3, nombre: 'Almacenamiento' },
];

const PRODUCTOS: Producto[] = [
  { id: 1, nombre: 'Teclado mecánico', precio: 59.9, stock: 12, categoriaId: 1, creado: '02/11', orden: 1 },
  { id: 2, nombre: 'Ratón inalámbrico', precio: 24.5, stock: 30, categoriaId: 1, creado: '03/11', orden: 2 },
  { id: 3, nombre: 'Monitor de 27 pulgadas', precio: 229, stock: 5, categoriaId: 2, creado: '04/11', orden: 3 },
  { id: 4, nombre: 'Teclado compacto', precio: 39.95, stock: 8, categoriaId: 1, creado: '05/11', orden: 4 },
  { id: 5, nombre: 'Alfombrilla XL', precio: 14.99, stock: 40, categoriaId: 1, creado: '06/11', orden: 5 },
  { id: 6, nombre: 'Monitor portátil', precio: 149, stock: 3, categoriaId: 2, creado: '07/11', orden: 6 },
  { id: 7, nombre: 'Disco SSD de 1 TB', precio: 79.9, stock: 20, categoriaId: 3, creado: '08/11', orden: 7 },
  { id: 8, nombre: 'Memoria USB de 64 GB', precio: 9.5, stock: 100, categoriaId: 3, creado: '09/11', orden: 8 },
  { id: 9, nombre: 'Webcam HD', precio: 34, stock: 15, categoriaId: 1, creado: '10/11', orden: 9 },
  { id: 10, nombre: 'Monitor curvo', precio: 389, stock: 2, categoriaId: 2, creado: '11/11', orden: 10 },
  { id: 11, nombre: 'Disco duro externo', precio: 69, stock: 10, categoriaId: 3, creado: '12/11', orden: 11 },
  { id: 12, nombre: 'Ratón vertical', precio: 29.9, stock: 6, categoriaId: 1, creado: '13/11', orden: 12 },
];

type Orden = 'nombre' | 'precio' | 'createdAt' | 'passwordHash';
type Dir = 'asc' | 'desc';

const nombreCategoria = (id: number) => CATEGORIAS.find((c) => c.id === id)?.nombre ?? '?';
const comillas = (s: string) => `'${s.replace(/'/g, "\\'")}'`;

function validar(orden: Orden, page: number, limit: number) {
  const errores: Record<string, string[]> = {};
  if (orden === 'passwordHash') errores.orden = ['Invalid option: expected one of "nombre"|"precio"|"createdAt"'];
  if (page < 1) errores.page = ['Too small: expected number to be >=1'];
  if (limit < 1) errores.limit = ['Too small: expected number to be >=1'];
  if (limit > 50) errores.limit = ['Too big: expected number to be <=50'];
  return errores;
}

const LIMITES = [2, 3, 5, 10, 60];

export function SimuladorListado({ titulo = 'Simulador del listado paginado' }: { titulo?: string }) {
  const id = useId();
  const reducir = useReducedMotion();
  const [q, setQ] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | ''>('');
  const [orden, setOrden] = useState<Orden>('createdAt');
  const [dir, setDir] = useState<Dir>('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [vista, setVista] = useState<'prisma' | 'sql'>('prisma');

  const reiniciar = () => {
    setQ('');
    setCategoriaId('');
    setOrden('createdAt');
    setDir('desc');
    setPage(1);
    setLimit(5);
  };

  // 1) La URL que monta Angular con HttpParams (se saltan los vacíos)
  const url = useMemo(() => {
    const partes: string[] = [];
    if (q !== '') partes.push(`q=${encodeURIComponent(q)}`);
    if (categoriaId !== '') partes.push(`categoriaId=${categoriaId}`);
    partes.push(`orden=${orden}`, `dir=${dir}`, `page=${page}`, `limit=${limit}`);
    return `/api/productos?${partes.join('&')}`;
  }, [q, categoriaId, orden, dir, page, limit]);

  // 2) Zod
  const errores = validar(orden, page, limit);
  const valido = Object.keys(errores).length === 0;
  const qLimpio = q.trim();

  // 3) Prisma: where, orderBy, skip y take
  const resultado = useMemo(() => {
    const cumple = (p: Producto) =>
      (qLimpio === '' || p.nombre.toLowerCase().includes(qLimpio.toLowerCase())) &&
      (categoriaId === '' || p.categoriaId === categoriaId);
    const campo = orden === 'passwordHash' ? 'createdAt' : orden;
    const comparar = (a: Producto, b: Producto) => {
      let r = 0;
      if (campo === 'nombre') r = a.nombre.localeCompare(b.nombre, 'es');
      else if (campo === 'precio') r = a.precio - b.precio;
      else r = a.orden - b.orden;
      return dir === 'asc' ? r : -r;
    };
    const filtrados = PRODUCTOS.filter(cumple).sort(comparar);
    const descartados = PRODUCTOS.filter((p) => !cumple(p));
    const skip = (Math.max(page, 1) - 1) * Math.max(limit, 1);
    const pagina = filtrados.slice(skip, skip + limit);
    return { filtrados, descartados, skip, pagina, total: filtrados.length };
  }, [qLimpio, categoriaId, orden, dir, page, limit]);

  const totalPages = Math.ceil(resultado.total / Math.max(limit, 1));

  const whereTexto = (() => {
    const lineas: string[] = [];
    if (qLimpio !== '') lineas.push(`    nombre: { contains: ${comillas(qLimpio)}, mode: 'insensitive' },`);
    if (categoriaId !== '') lineas.push(`    categoriaId: ${categoriaId},`);
    return lineas.length ? `{\n${lineas.join('\n')}\n  }` : '{}';
  })();

  const codigoPrisma = `const where = ${whereTexto.replace(/\n {2}/g, '\n')};

const [total, items] = await prisma.$transaction([
  prisma.producto.count({ where }),
  prisma.producto.findMany({
    where,
    orderBy: { ${orden}: '${dir}' },
    skip: ${resultado.skip},   // (${page} - 1) * ${limit}
    take: ${limit},
    select: {
      id: true, nombre: true, precio: true, stock: true,
      categoria: { select: { id: true, nombre: true } },
    },
  }),
]);`;

  const condiciones: string[] = [];
  if (qLimpio !== '') condiciones.push(`p."nombre" ILIKE '%${qLimpio.replace(/'/g, "''")}%'`);
  if (categoriaId !== '') condiciones.push(`p."categoriaId" = ${categoriaId}`);
  const whereSql = condiciones.length ? `\nWHERE ${condiciones.join('\n  AND ')}` : '';
  const codigoSql = `SELECT count(*) FROM "Producto" p${whereSql};

SELECT p."id", p."nombre", p."precio", p."stock",
       c."id", c."nombre"
FROM "Producto" p
JOIN "Categoria" c ON c."id" = p."categoriaId"${whereSql}
ORDER BY p."${orden}" ${dir.toUpperCase()}
LIMIT ${limit} OFFSET ${resultado.skip};`;

  const respuesta = valido
    ? JSON.stringify(
        {
          items: resultado.pagina.map((p) => ({
            id: p.id,
            nombre: p.nombre,
            precio: String(p.precio),
            stock: p.stock,
            categoria: { id: p.categoriaId, nombre: nombreCategoria(p.categoriaId) },
          })),
          total: resultado.total,
          page,
          limit,
          totalPages,
        },
        null,
        2,
      )
    : JSON.stringify(
        { error: { errors: [], properties: Object.fromEntries(Object.entries(errores).map(([k, v]) => [k, { errors: v }])) } },
        null,
        2,
      );

  const transicion = reducir ? { duration: 0 } : { type: 'spring' as const, stiffness: 420, damping: 36 };
  const enPagina = new Set(resultado.pagina.map((p) => p.id));

  const campo = 'w-full min-w-0 rounded-md border bg-fd-background px-2.5 py-1.5 text-sm text-fd-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring';
  const etiquetaCampo = 'mb-1 block text-xs font-medium text-fd-muted-foreground';
  const pre = 'overflow-x-auto rounded-md border bg-fd-muted/40 p-3 font-mono text-xs leading-relaxed text-fd-foreground';
  const foco = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring';

  // Resumen para lectores de pantalla (un solo aria-live, siempre montado)
  const resumen = valido
    ? `Página ${page}. 200 OK: ${resultado.total} ${resultado.total === 1 ? 'producto cumple' : 'productos cumplen'} el filtro, ${totalPages} ${totalPages === 1 ? 'página' : 'páginas'}; esta página devuelve ${resultado.pagina.length}.`
    : `Página ${page}. 400 Bad Request: Zod rechaza ${Object.keys(errores).join(' y ')}.`;

  return (
    <section aria-label={titulo} className={bloque}>
      <div className={cabecera}>
        <span className={etiqueta}>Demo</span>
        <p className={cn(tituloBloque, 'min-w-0 flex-1')}>{titulo}</p>
        <button type="button" onClick={reiniciar} className={cn(botonSecundario, 'min-h-8 px-2 py-1 text-xs')}>
          <RotateCcw className="size-3.5" aria-hidden />
          Reiniciar
        </button>
      </div>

      {/* Controles: lo que el usuario toca en Angular */}
      <div className="grid grid-cols-2 gap-3 border-b px-4 py-4 sm:grid-cols-3 sm:px-5">
        <div className="col-span-2 sm:col-span-1">
          <label htmlFor={`${id}-q`} className={etiquetaCampo}>
            Buscar (q)
          </label>
          <input
            id={`${id}-q`}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="teclado, monitor…"
            className={campo}
            autoComplete="off"
          />
        </div>
        <div>
          <label htmlFor={`${id}-cat`} className={etiquetaCampo}>
            Categoría (categoriaId)
          </label>
          <select
            id={`${id}-cat`}
            value={categoriaId}
            onChange={(e) => {
              setCategoriaId(e.target.value === '' ? '' : Number(e.target.value));
              setPage(1);
            }}
            className={campo}
          >
            <option value="">Todas</option>
            {CATEGORIAS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} · {c.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-orden`} className={etiquetaCampo}>
            Ordenar por (orden)
          </label>
          <select id={`${id}-orden`} value={orden} onChange={(e) => setOrden(e.target.value as Orden)} className={campo}>
            <option value="createdAt">createdAt</option>
            <option value="nombre">nombre</option>
            <option value="precio">precio</option>
            <option value="passwordHash">passwordHash (no permitido)</option>
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-dir`} className={etiquetaCampo}>
            Dirección (dir)
          </label>
          <select id={`${id}-dir`} value={dir} onChange={(e) => setDir(e.target.value as Dir)} className={campo}>
            <option value="asc">asc</option>
            <option value="desc">desc</option>
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-limit`} className={etiquetaCampo}>
            Por página (limit)
          </label>
          <select
            id={`${id}-limit`}
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className={campo}
          >
            {LIMITES.map((l) => (
              <option key={l} value={l}>
                {l}
                {l > 50 ? ' (más de 50)' : ''}
              </option>
            ))}
          </select>
        </div>
        <div>
          <span id={`${id}-page`} className={etiquetaCampo}>
            Página (page)
          </span>
          <div role="group" aria-labelledby={`${id}-page`} className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 0}
              aria-label="Página anterior"
              className={cn(botonSecundario, 'min-h-8 px-2.5 py-1')}
            >
              −
            </button>
            <span className="min-w-8 text-center text-sm font-semibold tabular-nums">{page}</span>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= 9}
              aria-label="Página siguiente"
              className={cn(botonSecundario, 'min-h-8 px-2.5 py-1')}
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-5 px-4 py-4 sm:px-5">
        {/* Paso 1: la URL */}
        <div className="min-w-0">
          <p className="mb-1.5 text-xs font-medium text-fd-muted-foreground">1. Angular manda los criterios en la URL</p>
          <p className={cn(pre, 'break-all whitespace-pre-wrap')}>
            <span className="text-fd-muted-foreground">GET </span>
            {url}
          </p>
        </div>

        {/* Paso 2: Zod */}
        <div className="min-w-0">
          <p className="mb-1.5 text-xs font-medium text-fd-muted-foreground">2. Zod valida y convierte con <code className="font-mono">safeParse(req.query)</code></p>
          {valido ? (
            <p className={cn('text-sm', okTexto)}>
              Todo correcto: <code className="font-mono text-xs">page</code> y <code className="font-mono text-xs">limit</code> pasan de
              texto a número y el servicio recibe <code className="font-mono text-xs">resultado.data</code>.
            </p>
          ) : (
            <div className={cn('rounded-md border px-3 py-2 text-sm', malCaja)}>
              <p className={cn('font-medium', malTexto)}>No pasa la validación: responde 400 y no se consulta la base de datos.</p>
              <ul className="mt-1 list-disc pl-5 text-fd-muted-foreground">
                {Object.entries(errores).map(([k, v]) => (
                  <li key={k}>
                    <code className="font-mono text-xs">{k}</code>: {v.join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Paso 3: la consulta */}
        <div className={cn('min-w-0 transition-opacity', !valido && 'opacity-40')}>
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-medium text-fd-muted-foreground">3. El servicio monta la consulta con Prisma</p>
            <div role="group" aria-label="Formato de la consulta" className="inline-flex rounded-md border p-0.5">
              {(['prisma', 'sql'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={vista === v}
                  onClick={() => setVista(v)}
                  className={cn(
                    'rounded px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring',
                    vista === v ? 'bg-fd-foreground text-fd-background' : 'text-fd-muted-foreground hover:text-fd-foreground',
                  )}
                >
                  {v === 'prisma' ? 'Prisma' : 'SQL aproximado'}
                </button>
              ))}
            </div>
          </div>
          <pre
            className={cn(pre, foco)}
            tabIndex={0}
            role="region"
            aria-label={vista === 'prisma' ? 'Consulta de Prisma' : 'SQL aproximado'}
          >
            {vista === 'prisma' ? codigoPrisma : codigoSql}
          </pre>
        </div>

        {/* Paso 4: la tabla */}
        <div className={cn('min-w-0 transition-opacity', !valido && 'opacity-40')}>
          <p className="mb-1.5 text-xs font-medium text-fd-muted-foreground">
            4. Qué hace Postgres con las {PRODUCTOS.length} filas de la tabla
          </p>
          <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-fd-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-fd-primary" aria-hidden /> Se devuelve (take)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm border" aria-hidden /> Cumple el filtro pero se salta (skip) o queda después
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm border border-dashed" aria-hidden /> No cumple el where
            </span>
          </div>
          <ol className="grid gap-1">
            {resultado.filtrados.map((p, i) => {
              const dentro = enPagina.has(p.id) && valido;
              const saltada = i < resultado.skip;
              return (
                <motion.li
                  key={p.id}
                  layout={!reducir}
                  transition={transicion}
                  className={cn(
                    'flex min-w-0 items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs sm:text-sm',
                    dentro ? 'border-fd-primary bg-fd-primary/10' : 'bg-fd-background',
                  )}
                >
                  <span className="w-5 shrink-0 text-right font-mono text-fd-muted-foreground tabular-nums">{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate font-medium">{p.nombre}</span>
                  <span className="hidden shrink-0 text-fd-muted-foreground sm:inline">{nombreCategoria(p.categoriaId)}</span>
                  <span className="shrink-0 font-mono tabular-nums">{p.precio} €</span>
                  <span className="hidden w-12 shrink-0 text-right font-mono text-fd-muted-foreground sm:inline">{p.creado}</span>
                  <span className={cn('w-16 shrink-0 text-right text-[11px] font-medium', dentro ? 'text-fd-primary' : 'text-fd-muted-foreground')}>
                    {dentro ? 'devuelta' : saltada ? 'skip' : 'después'}
                  </span>
                </motion.li>
              );
            })}
            {resultado.descartados.map((p) => (
              <motion.li
                key={p.id}
                layout={!reducir}
                transition={transicion}
                className="flex min-w-0 items-center gap-2 rounded-md border border-dashed px-2.5 py-1.5 text-xs text-fd-muted-foreground opacity-60 sm:text-sm"
              >
                <span className="w-5 shrink-0" aria-hidden />
                <span className="min-w-0 flex-1 truncate line-through">{p.nombre}</span>
                <span className="hidden shrink-0 sm:inline">{nombreCategoria(p.categoriaId)}</span>
                <span className="shrink-0 font-mono tabular-nums">{p.precio} €</span>
                <span className="hidden w-12 shrink-0 sm:inline" aria-hidden />
                <span className="w-16 shrink-0 text-right text-[11px] font-medium">where</span>
              </motion.li>
            ))}
          </ol>
          {valido && resultado.pagina.length === 0 && (
            <p className="mt-2 text-xs text-fd-muted-foreground">
              Esta página está vacía: <code className="font-mono">skip</code> ({resultado.skip}) es mayor o igual que el total (
              {resultado.total}). En Angular saldría el estado vacío.
            </p>
          )}
        </div>

        {/* Paso 5: la respuesta */}
        <div className="min-w-0">
          <p className="mb-1.5 text-xs font-medium text-fd-muted-foreground">
            5. Respuesta:{' '}
            <span className={valido ? okTexto : malTexto}>{valido ? '200 OK' : '400 Bad Request'}</span>
            {valido && (
              <span>
                {' '}
                · {resultado.total} {resultado.total === 1 ? 'producto cumple' : 'productos cumplen'} el filtro, {totalPages}{' '}
                {totalPages === 1 ? 'página' : 'páginas'}
              </span>
            )}
          </p>
          <pre className={cn(pre, foco, 'max-h-80')} tabIndex={0} role="region" aria-label="JSON de la respuesta">
            {respuesta}
          </pre>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {resumen}
      </p>
    </section>
  );
}
