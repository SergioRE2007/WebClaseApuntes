'use client';

import { useSyncExternalStore } from 'react';

/**
 * Lectura de solo-lectura del progreso (contrato 'dam:progreso').
 * El dueño del progreso es lib/progreso.ts; aquí solo leemos localStorage
 * y escuchamos el evento 'dam:progreso' (y 'storage' entre pestañas).
 */
export type ProgresoLocal = Record<string, { completado: boolean; fecha: string }>;

const KEY = 'dam:progreso';
const VACIO: ProgresoLocal = {};

let cacheRaw: string | null = null;
let cacheVal: ProgresoLocal = VACIO;

function normalizar(url: string): string {
  const limpia = url.split(/[?#]/)[0] ?? url;
  return limpia.length > 1 ? limpia.replace(/\/+$/, '') : limpia;
}

function leer(): ProgresoLocal {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    raw = null;
  }
  if (raw === cacheRaw) return cacheVal;
  cacheRaw = raw;
  cacheVal = VACIO;
  if (raw) {
    try {
      const data: unknown = JSON.parse(raw);
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const out: ProgresoLocal = {};
        for (const [url, v] of Object.entries(data as Record<string, unknown>)) {
          if (v && typeof v === 'object' && 'completado' in v) {
            const e = v as { completado?: unknown; fecha?: unknown };
            out[normalizar(url)] = {
              completado: Boolean(e.completado),
              fecha: typeof e.fecha === 'string' ? e.fecha : '',
            };
          }
        }
        cacheVal = out;
      }
    } catch {
      cacheVal = VACIO;
    }
  }
  return cacheVal;
}

function subscribe(cb: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === KEY) cb();
  };
  window.addEventListener('dam:progreso', cb);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener('dam:progreso', cb);
    window.removeEventListener('storage', onStorage);
  };
}

export function useProgresoLocal(): ProgresoLocal {
  return useSyncExternalStore(subscribe, leer, () => VACIO);
}

export function completadas(progreso: ProgresoLocal, urls: readonly string[]): number {
  let n = 0;
  for (const u of urls) if (progreso[normalizar(u)]?.completado) n++;
  return n;
}

export { normalizar as normalizarUrlProgreso };
