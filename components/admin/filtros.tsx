'use client';

import { useEffect, useId, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LoaderCircle, Search, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ESTADOS, ESTADOS_INFO, type EstadoAportacion } from '@/lib/aportaciones';
import { inputClase } from '@/components/aportaciones/ui';

type FiltroEstado = EstadoAportacion | 'todas';

export interface FiltrosProps {
  estado: FiltroEstado;
  modulo: string | null;
  q: string;
  contadores: Record<EstadoAportacion, number>;
  modulos: { slug: string; nombre: string }[];
}

function construirUrl(f: { estado: FiltroEstado; modulo: string | null; q: string }) {
  const sp = new URLSearchParams();
  if (f.estado !== 'pendiente') sp.set('estado', f.estado);
  if (f.modulo) sp.set('modulo', f.modulo);
  if (f.q) sp.set('q', f.q);
  const s = sp.toString();
  return `/admin${s ? `?${s}` : ''}`;
}

export function FiltrosAdmin({ estado, modulo, q, contadores, modulos }: FiltrosProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [texto, setTexto] = useState(q);
  const ids = { q: useId(), modulo: useId() };
  const primera = useRef(true);

  const navegar = (f: Partial<{ estado: FiltroEstado; modulo: string | null; q: string }>) => {
    const url = construirUrl({ estado, modulo, q: texto.trim(), ...f });
    startTransition(() => router.replace(url, { scroll: false }));
  };

  // Búsqueda con debounce
  useEffect(() => {
    if (primera.current) {
      primera.current = false;
      return;
    }
    const t = setTimeout(() => {
      if (texto.trim() !== q) navegar({ q: texto.trim() });
    }, 300);
    return () => clearTimeout(t);
  }, [texto]);

  const total = ESTADOS.reduce((a, e) => a + contadores[e], 0);
  const pestañas: { id: FiltroEstado; label: string; n: number }[] = [
    ...ESTADOS.map((e) => ({ id: e, label: ESTADOS_INFO[e].plural, n: contadores[e] })),
    { id: 'todas', label: 'Todas', n: total },
  ];

  return (
    <div className="space-y-3">
      <nav aria-label="Filtrar por estado" className="-mx-1 overflow-x-auto px-1 pb-1">
        <ul className="flex w-max gap-1 rounded-xl border bg-fd-muted/50 p-1">
          {pestañas.map((p) => {
            const activo = p.id === estado;
            return (
              <li key={p.id}>
                <Link
                  href={construirUrl({ estado: p.id, modulo, q: texto.trim() })}
                  scroll={false}
                  aria-current={activo ? 'page' : undefined}
                  onNavigate={(e) => {
                    e.preventDefault();
                    navegar({ estado: p.id });
                  }}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-fd-muted-foreground transition',
                    'hover:text-fd-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring',
                    activo && 'bg-fd-background text-fd-foreground shadow-sm',
                  )}
                >
                  {p.id !== 'todas' && (
                    <span className={cn('size-2 rounded-full', ESTADOS_INFO[p.id].dot)} aria-hidden />
                  )}
                  {p.label}
                  <span
                    className={cn(
                      'rounded-full px-1.5 text-xs tabular-nums',
                      activo ? 'bg-fd-muted text-fd-foreground' : 'bg-fd-background/60',
                    )}
                  >
                    {p.n}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor={ids.q} className="sr-only">
            Buscar por título
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fd-muted-foreground" aria-hidden />
          <input
            id={ids.q}
            type="search"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Buscar por título…"
            className={cn(inputClase, 'pl-9 pr-9')}
            maxLength={100}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {pending ? (
              <LoaderCircle className="size-4 animate-spin text-fd-muted-foreground" aria-label="Cargando" />
            ) : texto ? (
              <button
                type="button"
                onClick={() => setTexto('')}
                aria-label="Borrar búsqueda"
                className="flex rounded text-fd-muted-foreground hover:text-fd-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
              >
                <X className="size-4" aria-hidden />
              </button>
            ) : null}
          </span>
        </div>
        <div className="sm:w-60">
          <label htmlFor={ids.modulo} className="sr-only">
            Filtrar por módulo
          </label>
          <select
            id={ids.modulo}
            value={modulo ?? ''}
            onChange={(e) => navegar({ modulo: e.target.value || null })}
            className={inputClase}
          >
            <option value="">Todos los módulos</option>
            {modulos.map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
