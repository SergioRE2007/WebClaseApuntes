'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Bot, Check, Flame, Layers, X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Pregunta {
  modulo: string;
  enunciado: string;
  codigo?: string;
  opciones: string[];
  correcta: number;
  pista: string;
}

const PREGUNTAS: Pregunta[] = [
  {
    modulo: 'Bases de Datos',
    enunciado: '¿Qué cláusula filtra grupos después de un GROUP BY?',
    opciones: ['WHERE', 'HAVING', 'ORDER BY'],
    correcta: 1,
    pista: 'WHERE filtra filas antes de agrupar; HAVING filtra los grupos ya agregados.',
  },
  {
    modulo: 'Programación',
    enunciado: '¿Qué imprime este código en Java?',
    codigo: 'String a = "dam";\nSystem.out.println(a == "dam");',
    opciones: ['true', 'false', 'Error de compilación'],
    correcta: 0,
    pista: 'Los literales se internan en el pool de Strings, pero compara con equals() siempre.',
  },
  {
    modulo: 'Acceso a Datos',
    enunciado: '¿Qué interfaz de JDBC evita la inyección SQL?',
    opciones: ['Statement', 'ResultSet', 'PreparedStatement'],
    correcta: 2,
    pista: 'PreparedStatement envía los parámetros separados de la consulta.',
  },
];

/** Fases de la animación: 0 pregunta · 1 respuesta marcada · 2 tutor explica. */
type Fase = 0 | 1 | 2;

export function HeroMock() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [fase, setFase] = useState<Fase>(0);

  useEffect(() => {
    if (reduce) {
      setFase(2);
      return;
    }
    const tiempos: Record<Fase, number> = { 0: 1600, 1: 1300, 2: 3600 };
    const t = setTimeout(() => {
      if (fase === 2) {
        setFase(0);
        setI((v) => (v + 1) % PREGUNTAS.length);
      } else {
        setFase((fase + 1) as Fase);
      }
    }, tiempos[fase]);
    return () => clearTimeout(t);
  }, [fase, reduce]);

  const p = PREGUNTAS[i]!;

  return (
    <div className="relative" role="img" aria-label="Ejemplo de test interactivo con explicación del Tutor IA">
      {/* Tarjeta trasera: flashcards */}
      <div
        aria-hidden
        className="glass absolute -top-5 -right-2 hidden w-48 rotate-6 rounded-2xl border p-4 shadow-xl sm:block lg:-right-6"
      >
        <div className="flex items-center gap-2 text-xs font-medium text-fd-muted-foreground">
          <Layers className="size-3.5 text-fd-primary" /> Flashcards
        </div>
        <p className="mt-3 text-sm font-medium">¿Qué es un Intent en Android?</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-fd-muted">
          <div className="bg-brand-gradient h-full w-2/3 rounded-full" />
        </div>
      </div>

      {/* Tarjeta principal: test */}
      <div aria-hidden className="ring-gradient glass relative rounded-3xl border p-5 shadow-2xl shadow-fd-primary/10 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-red-400/80" />
            <span className="size-2.5 rounded-full bg-amber-400/80" />
            <span className="size-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/12 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
            <Flame className="size-3" /> Racha de 5
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            <p className="mt-5 text-xs font-medium tracking-wide text-fd-primary uppercase">
              {p.modulo} · Test rápido
            </p>
            <p className="mt-1.5 text-[15px] leading-snug font-semibold sm:text-base">{p.enunciado}</p>
            {p.codigo && (
              <pre className="mt-3 overflow-x-auto rounded-xl border bg-fd-background/70 px-3 py-2.5 font-mono text-[12px] leading-relaxed">
                {p.codigo}
              </pre>
            )}
            <ul className="mt-4 space-y-2">
              {p.opciones.map((op, k) => {
                const correcta = fase >= 1 && k === p.correcta;
                return (
                  <li
                    key={op}
                    className={cn(
                      'flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-sm transition-colors duration-300',
                      correcta
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'
                        : 'bg-fd-background/50',
                      fase >= 1 && !correcta && 'opacity-60',
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          'inline-flex size-5 items-center justify-center rounded-md border font-mono text-[10px] font-semibold',
                          correcta && 'border-emerald-500 bg-emerald-500 text-white',
                        )}
                      >
                        {String.fromCharCode(65 + k)}
                      </span>
                      <code className="font-mono text-[13px]">{op}</code>
                    </span>
                    {correcta ? (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 22 }}>
                        <Check className="size-4 text-emerald-600 dark:text-emerald-400" />
                      </motion.span>
                    ) : fase >= 1 ? (
                      <X className="size-3.5 text-fd-muted-foreground/60" />
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Burbuja del tutor */}
      <div aria-hidden className="relative -mt-4 ms-6 me-2 min-h-[5.5rem] sm:ms-12 sm:-me-6">
        <AnimatePresence>
          {fase === 2 && (
            <motion.div
              key={`tutor-${i}`}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="glass flex items-start gap-3 rounded-2xl border p-3.5 shadow-xl"
            >
              <span className="bg-brand-gradient inline-flex size-8 shrink-0 items-center justify-center rounded-full text-white shadow">
                <Bot className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold">Tutor DAM</p>
                <p className="mt-0.5 text-[13px] leading-snug text-fd-muted-foreground">{p.pista}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
