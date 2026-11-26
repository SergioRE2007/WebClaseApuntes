'use client';

import { Fragment, useCallback, useLayoutEffect, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { motion, useReducedMotion } from 'motion/react';

export const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Renderiza un texto plano convirtiendo `entre comillas invertidas` en <code>.
 * Útil para props de texto (enunciados, frentes de tarjeta…) escritos en MDX.
 */
export function TextoEnriquecido({ texto }: { texto: string }) {
  const partes = texto.split(/(`[^`]+`)/g);
  return (
    <>
      {partes.map((p, i) =>
        p.startsWith('`') && p.endsWith('`') && p.length > 2 ? (
          <code
            key={i}
            className="rounded border bg-fd-muted px-1 py-px font-mono text-[0.88em] text-fd-foreground"
          >
            {p.slice(1, -1)}
          </code>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

/** Contenido que puede ser un string (con `código`) o nodos React. */
export function Contenido({ children }: { children: ReactNode }) {
  if (typeof children === 'string') return <TextoEnriquecido texto={children} />;
  return <>{children}</>;
}

/**
 * Registro de hijos en orden de aparición en el DOM.
 *
 * Los componentes compuestos (Quiz → Pregunta, Flashcards → Tarjeta…) reciben
 * sus hijos desde MDX/RSC, así que no podemos inspeccionarlos con
 * React.Children de forma fiable. En su lugar cada hijo se registra con un id
 * y el padre calcula el orden leyendo `[data-attr]` dentro de su contenedor.
 */
export function useRegistroOrdenado(contenedor: RefObject<HTMLElement | null>, atributo: string) {
  const [ids, setIds] = useState<string[]>([]);
  const [version, setVersion] = useState(0);

  const registrar = useCallback(() => {
    setVersion((v) => v + 1);
    return () => setVersion((v) => v + 1);
  }, []);

  useIsoLayoutEffect(() => {
    const el = contenedor.current;
    if (!el) return;
    const encontrados = Array.from(el.querySelectorAll<HTMLElement>(`[${atributo}]`))
      // Ignora hijos de componentes anidados del mismo tipo
      .filter((n) => n.closest('[data-registro-raiz]') === el)
      .map((n) => n.getAttribute(atributo))
      .filter((v): v is string => Boolean(v));
    setIds((prev) =>
      prev.length === encontrados.length && prev.every((p, i) => p === encontrados[i]) ? prev : encontrados,
    );
  }, [version, contenedor, atributo]);

  return { ids, registrar };
}

export function barajar<T>(lista: readonly T[]): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j] as T, copia[i] as T];
  }
  return copia;
}

export function usePrefiereMenosMovimiento(): boolean {
  const [reducir, setReducir] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducir(mq.matches);
    const on = () => setReducir(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reducir;
}

/**
 * Contenedor cuya altura se anima con suavidad cuando cambia su contenido
 * (al pasar de un paso a otro, de una pestaña a otra…). Sin animación si el
 * usuario prefiere menos movimiento.
 */
export function AlturaSuave({ children, className }: { children: ReactNode; className?: string }) {
  const reducir = useReducedMotion();
  const interior = useRef<HTMLDivElement>(null);
  const [altura, setAltura] = useState<number | 'auto'>('auto');

  useIsoLayoutEffect(() => {
    const el = interior.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const medir = () => setAltura(el.offsetHeight);
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <motion.div
      initial={false}
      animate={{ height: altura }}
      transition={{ duration: reducir ? 0 : 0.25, ease: 'easeOut' }}
      style={{ overflow: 'hidden' }}
    >
      <div ref={interior} className={className}>
        {children}
      </div>
    </motion.div>
  );
}
