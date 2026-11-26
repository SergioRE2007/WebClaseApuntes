'use client';

import { useId, useState } from 'react';
import { motion, MotionConfig } from 'motion/react';
import { Check, Copy, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { bloque, botonSecundario, cabecera, etiqueta, malTexto, okTexto, tituloBloque } from '@/components/interactive/estilos';

/*
 * Rellena la plantilla SMART de clase campo a campo y comprueba en vivo la
 * "regla de oro": que el objetivo se pueda comprobar (métrica con número,
 * horas estimadas, un plazo concreto y no elástico...). Las comprobaciones son
 * orientativas: miran el texto, no si el objetivo tiene sentido.
 */

type Campo = 'que' | 'medida' | 'viabilidad' | 'relevancia' | 'plazo' | 'entregables';

const CAMPOS: { id: Campo; letra: string; nombre: string; ayuda: string }[] = [
  { id: 'que', letra: 'S', nombre: 'Qué / Para quién', ayuda: 'Concreto: qué se entrega y a quién le sirve.' },
  { id: 'medida', letra: 'M', nombre: 'Medida de éxito', ayuda: 'Una métrica y su umbral (un número).' },
  { id: 'viabilidad', letra: 'A', nombre: 'Viabilidad', ayuda: 'Tecnologías y horas estimadas.' },
  { id: 'relevancia', letra: 'R', nombre: 'Relevancia', ayuda: 'Por qué importa.' },
  { id: 'plazo', letra: 'T', nombre: 'Plazo', ayuda: 'Un sprint, un hito (H9) o una fecha concretos.' },
  { id: 'entregables', letra: '', nombre: 'Entregables', ayuda: 'La prueba de que se ha conseguido.' },
];

type Valores = Record<Campo, string>;

const VACIO: Valores = { que: '', medida: '', viabilidad: '', relevancia: '', plazo: '', entregables: '' };

const EJEMPLO_CLASE: Valores = {
  que: 'Login con OAuth2 + JWT para Alumno y Profesor',
  medida: '≥ 95 % de logins correctos con datos válidos y 0 endpoints críticos sin proteger',
  viabilidad: 'Spring Boot + Spring Security; 12-14 h',
  relevancia: 'Acceso a recursos y protección de datos (RGPD/OWASP)',
  plazo: 'Antes del Sprint 2',
  entregables: '/auth/login y /auth/refresh, ≥ 15 pruebas unitarias y de integración, OpenAPI y un ADR',
};

const VAGO: Valores = { ...VACIO, que: 'Mejorar la seguridad', plazo: 'Más adelante' };

const palabras = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const ELASTICA = /m[aá]s adelante|cuando (se pueda|haya tiempo)|lo antes posible|pronto|alg[uú]n d[ií]a/i;

function comprobar(v: Valores): Record<Campo, { ok: boolean; motivo: string }> {
  const plazoElastico = ELASTICA.test(v.plazo);
  const plazoConcreto = /sprint\s*\d|hito\s*h?\d|\bh\d{1,2}\b|\d{1,2}\/\d{1,2}|\d{1,2} de [a-záéíóú]+|semana|antes de|fin de|mitad de/i.test(v.plazo);
  return {
    que: { ok: palabras(v.que) >= 5, motivo: palabras(v.que) >= 5 ? 'Concreto' : 'Demasiado corto: ¿qué exactamente y para quién?' },
    medida: { ok: /\d/.test(v.medida), motivo: /\d/.test(v.medida) ? 'Tiene métrica y umbral' : 'Sin número no se puede comprobar (error: no medir)' },
    viabilidad: {
      ok: /\d+\s*(-\s*\d+\s*)?(h\b|horas)/i.test(v.viabilidad),
      motivo: /\d+\s*(-\s*\d+\s*)?(h\b|horas)/i.test(v.viabilidad) ? 'Con horas estimadas' : 'Faltan las horas estimadas (p. ej. "10 h")',
    },
    relevancia: { ok: palabras(v.relevancia) >= 3, motivo: palabras(v.relevancia) >= 3 ? 'Justificado' : 'Di por qué importa' },
    plazo: {
      ok: plazoConcreto && !plazoElastico,
      motivo: plazoElastico ? 'Fecha elástica: pon un sprint o una fecha' : plazoConcreto ? 'Plazo concreto' : 'Pon un sprint o una fecha',
    },
    entregables: { ok: palabras(v.entregables) >= 2, motivo: palabras(v.entregables) >= 2 ? 'Hay prueba' : '¿Qué enseñarás para demostrarlo?' },
  };
}

export function ObjetivoSmart({ titulo = 'Escribe un objetivo SMART con la plantilla de clase' }: { titulo?: string }) {
  const base = useId();
  const [v, setV] = useState<Valores>(VACIO);
  const [copiado, setCopiado] = useState(false);
  const r = comprobar(v);
  const cumplidos = CAMPOS.filter((c) => r[c.id].ok).length;

  const texto = [
    `Qué / Para quién (S): ${v.que}`,
    `Medida de éxito (M): ${v.medida}`,
    `Viabilidad (A): ${v.viabilidad}`,
    `Relevancia (R): ${v.relevancia}`,
    `Plazo (T): ${v.plazo}`,
    `Entregables: ${v.entregables}`,
  ].join('\n');

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      setCopiado(false);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <section aria-label={titulo} className={bloque}>
        <div className={cabecera}>
          <span className={etiqueta}>Demo</span>
          <p className={cn(tituloBloque, 'min-w-0 flex-1')}>{titulo}</p>
          <span className={cn(etiqueta, 'tabular-nums')} aria-live="polite">
            {cumplidos} de {CAMPOS.length} campos comprobables
          </span>
        </div>

        <div className="flex flex-wrap gap-2 border-b px-4 py-3 sm:px-5">
          <button type="button" className={botonSecundario} onClick={() => setV(EJEMPLO_CLASE)}>
            Cargar el ejemplo de clase
          </button>
          <button type="button" className={botonSecundario} onClick={() => setV(VAGO)}>
            Cargar una frase vaga
          </button>
          <button type="button" className={botonSecundario} onClick={() => setV(VACIO)}>
            Vaciar
          </button>
        </div>

        <div className="space-y-3 px-4 py-4 sm:px-5">
          {CAMPOS.map((c) => {
            const id = `${base}-${c.id}`;
            const estado = r[c.id];
            const vacio = v[c.id].trim() === '';
            return (
              <div key={c.id}>
                <label htmlFor={id} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm font-medium">
                  {c.letra ? (
                    <span className="inline-flex size-5 shrink-0 items-center justify-center rounded border font-mono text-xs">{c.letra}</span>
                  ) : null}
                  {c.nombre}
                  <span className="text-xs font-normal text-fd-muted-foreground">{c.ayuda}</span>
                </label>
                <input
                  id={id}
                  value={v[c.id]}
                  onChange={(e) => setV((x) => ({ ...x, [c.id]: e.target.value }))}
                  className="mt-1 w-full rounded-md border bg-fd-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
                  aria-describedby={`${id}-estado`}
                />
                <motion.p
                  id={`${id}-estado`}
                  key={`${estado.ok}-${estado.motivo}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn(
                    'mt-1 flex items-center gap-1 text-xs',
                    vacio ? 'text-fd-muted-foreground' : estado.ok ? okTexto : malTexto,
                  )}
                >
                  {vacio ? null : estado.ok ? <Check className="size-3.5" aria-hidden /> : <X className="size-3.5" aria-hidden />}
                  {vacio ? 'Sin rellenar' : estado.motivo}
                </motion.p>
              </div>
            );
          })}
        </div>

        <div className="border-t px-4 py-4 sm:px-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Tu objetivo, listo para pegarlo en la historia de Jira</p>
            <button type="button" className={botonSecundario} onClick={copiar}>
              {copiado ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
              {copiado ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <pre className="mt-2 overflow-x-auto rounded-md border bg-fd-muted/50 px-3 py-2 font-mono text-xs leading-5 whitespace-pre-wrap">{texto}</pre>
          <p className="mt-2 text-xs text-fd-muted-foreground">
            Las comprobaciones son orientativas: miran si hay número, horas y plazo, no si el objetivo tiene sentido.
          </p>
        </div>
      </section>
    </MotionConfig>
  );
}
