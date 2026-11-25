'use client';

import { motion } from 'motion/react';
import { useMemo } from 'react';
import { usePrefiereMenosMovimiento } from './utils';

const COLORES = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#a855f7', '#14b8a6', '#ef4444'];

/** Pequeña lluvia de confeti hecha con motion (sin dependencias extra). */
export function Celebracion({ piezas = 42 }: { piezas?: number }) {
  const reducir = usePrefiereMenosMovimiento();
  const datos = useMemo(
    () =>
      Array.from({ length: piezas }, (_, i) => {
        const angulo = (Math.PI * 2 * i) / piezas + Math.random() * 0.4;
        const distancia = 90 + Math.random() * 140;
        return {
          x: Math.cos(angulo) * distancia,
          y: Math.sin(angulo) * distancia - 60,
          rot: Math.random() * 720 - 360,
          color: COLORES[i % COLORES.length],
          ancho: 5 + Math.random() * 5,
          alto: 8 + Math.random() * 8,
          retraso: Math.random() * 0.15,
          redondo: i % 3 === 0,
        };
      }),
    [piezas],
  );

  if (reducir) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-visible">
      <div className="absolute left-1/2 top-1/3">
        {datos.map((d, i) => (
          <motion.span
            key={i}
            className="absolute block"
            style={{
              width: d.ancho,
              height: d.redondo ? d.ancho : d.alto,
              backgroundColor: d.color,
              borderRadius: d.redondo ? 999 : 2,
            }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.6 }}
            animate={{ x: d.x, y: [0, d.y, d.y + 160], opacity: [1, 1, 0], rotate: d.rot, scale: 1 }}
            transition={{ duration: 1.6, delay: d.retraso, ease: 'easeOut', times: [0, 0.45, 1] }}
          />
        ))}
      </div>
    </div>
  );
}
