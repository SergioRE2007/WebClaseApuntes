import { useCallback, useMemo, useSyncExternalStore } from 'react';

/**
 * Progreso de estudio del alumno, guardado solo en su navegador.
 *
 * Contrato compartido:
 *  - localStorage['dam:progreso'] = JSON Record<urlDePagina, { completado, fecha (ISO) }>
 *  - Cada cambio lanza window.dispatchEvent(new Event('dam:progreso')).
 *  - Entre pestañas se sincroniza con el evento nativo 'storage'.
 *
 * Los componentes que solo LEEN el progreso pueden usar este hook o leer
 * localStorage directamente (con try/catch) y escuchar 'dam:progreso'.
 */
export const PROGRESO_KEY = 'dam:progreso';
export const PROGRESO_EVENTO = 'dam:progreso';

export interface EntradaProgreso {
  completado: boolean;
  /** Fecha ISO del último cambio. */
  fecha: string;
}

export type Progreso = Record<string, EntradaProgreso>;

/** Normaliza una URL de página: sin query/hash y sin barra final. */
export function normalizarUrl(url: string): string {
  const limpia = url.split(/[?#]/)[0] ?? url;
  return limpia.length > 1 ? limpia.replace(/\/+$/, '') : limpia;
}

function leerCrudo(): string | null {
  try {
    return window.localStorage.getItem(PROGRESO_KEY);
  } catch {
    return null;
  }
}

function parsear(raw: string | null): Progreso {
  if (!raw) return {};
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
    const out: Progreso = {};
    for (const [url, v] of Object.entries(data as Record<string, unknown>)) {
      if (v && typeof v === 'object' && 'completado' in v) {
        const e = v as Partial<EntradaProgreso>;
        out[url] = { completado: Boolean(e.completado), fecha: typeof e.fecha === 'string' ? e.fecha : '' };
      }
    }
    return out;
  } catch {
    return {};
  }
}

/** Lee el progreso actual (objeto vacío en servidor o si hay error). */
export function leerProgreso(): Progreso {
  if (typeof window === 'undefined') return {};
  return parsear(leerCrudo());
}

/** Guarda el progreso completo y avisa al resto de componentes. */
export function guardarProgreso(progreso: Progreso): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PROGRESO_KEY, JSON.stringify(progreso));
  } catch {
    // Almacenamiento lleno o bloqueado (modo privado): seguimos sin persistir.
  }
  try {
    window.dispatchEvent(new Event(PROGRESO_EVENTO));
  } catch {
    // Entornos sin Event constructor: ignorar.
  }
}

/** Marca (o desmarca) una página como completada. */
export function marcarPagina(url: string, completado: boolean): void {
  const actual = leerProgreso();
  const clave = normalizarUrl(url);
  if (completado) {
    actual[clave] = { completado: true, fecha: new Date().toISOString() };
  } else {
    delete actual[clave];
  }
  guardarProgreso(actual);
}

function suscribir(callback: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === PROGRESO_KEY) callback();
  };
  window.addEventListener(PROGRESO_EVENTO, callback);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(PROGRESO_EVENTO, callback);
    window.removeEventListener('storage', onStorage);
  };
}

const getServerSnapshot = () => null;

export interface UseProgreso {
  /** Mapa completo url → entrada. Vacío durante SSR/hidratación. */
  progreso: Progreso;
  /** false hasta que el componente se hidrata y puede leer localStorage. */
  listo: boolean;
  estaCompletado: (url: string) => boolean;
  fechaDe: (url: string) => string | null;
  marcar: (url: string, completado: boolean) => void;
  alternar: (url: string) => boolean;
  /** Número de páginas completadas (opcionalmente filtrado por prefijo de URL). */
  contar: (prefijo?: string) => number;
  reiniciar: () => void;
}

/** Hook SSR-safe para leer y escribir el progreso. */
export function useProgreso(): UseProgreso {
  const raw = useSyncExternalStore<string | null | undefined>(
    suscribir,
    () => leerCrudo() ?? '',
    getServerSnapshot,
  );
  const listo = raw !== null && raw !== undefined;
  const progreso = useMemo(() => parsear(raw || null), [raw]);

  const estaCompletado = useCallback(
    (url: string) => progreso[normalizarUrl(url)]?.completado === true,
    [progreso],
  );
  const fechaDe = useCallback(
    (url: string) => {
      const e = progreso[normalizarUrl(url)];
      return e?.completado && e.fecha ? e.fecha : null;
    },
    [progreso],
  );
  const marcar = useCallback((url: string, completado: boolean) => marcarPagina(url, completado), []);
  const alternar = useCallback((url: string) => {
    const siguiente = !(leerProgreso()[normalizarUrl(url)]?.completado === true);
    marcarPagina(url, siguiente);
    return siguiente;
  }, []);
  const contar = useCallback(
    (prefijo?: string) => {
      const p = prefijo ? normalizarUrl(prefijo) : null;
      return Object.entries(progreso).filter(
        ([url, e]) => e.completado && (!p || url === p || url.startsWith(`${p}/`)),
      ).length;
    },
    [progreso],
  );
  const reiniciar = useCallback(() => guardarProgreso({}), []);

  return { progreso, listo, estaCompletado, fechaDe, marcar, alternar, contar, reiniciar };
}
