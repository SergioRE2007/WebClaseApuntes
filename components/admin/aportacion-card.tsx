'use client';

import { useEffect, useId, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronDown, LoaderCircle, MessageSquarePlus, Paperclip, RotateCcw, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { TIPOS_INFO, formatFecha, formatRelativo, type EstadoAportacion } from '@/lib/aportaciones';
import { EstadoBadge, inputClase } from '@/components/aportaciones/ui';
import { Adjunto } from './adjunto';
import type { AportacionAdmin } from './datos';

export type AccionAdmin =
  | { tipo: 'estado'; id: string; estado: EstadoAportacion; nota?: string }
  | { tipo: 'borrar'; id: string };

const boton =
  'inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-1 focus-visible:ring-offset-fd-card disabled:pointer-events-none disabled:opacity-50';

export function AportacionCard({
  a,
  nombreModulo,
  ocupado,
  onAccion,
}: {
  a: AportacionAdmin;
  nombreModulo: string;
  ocupado: boolean;
  onAccion: (accion: AccionAdmin) => void;
}) {
  const uid = useId();
  const [nota, setNota] = useState(a.nota_admin ?? '');
  const [verNota, setVerNota] = useState(Boolean(a.nota_admin));
  const [confirmarBorrar, setConfirmarBorrar] = useState(false);
  const [expandida, setExpandida] = useState(false);
  const info = TIPOS_INFO[a.tipo];
  const Icon = info?.icon ?? Paperclip;
  const desc = a.descripcion ?? '';
  const larga = desc.length > 320 || desc.split('\n').length > 5;

  useEffect(() => setNota(a.nota_admin ?? ''), [a.nota_admin]);
  useEffect(() => {
    if (!confirmarBorrar) return;
    const t = setTimeout(() => setConfirmarBorrar(false), 4000);
    return () => clearTimeout(t);
  }, [confirmarBorrar]);

  const cambiar = (estado: EstadoAportacion) => onAccion({ tipo: 'estado', id: a.id, estado, nota: nota.trim() || undefined });
  const autor = a.autor?.nombre || a.autor?.email || 'Alumno desconocido';

  return (
    <article
      aria-labelledby={`${uid}-titulo`}
      aria-busy={ocupado}
      className={cn('rounded-2xl border bg-fd-card p-4 shadow-xs transition sm:p-5', ocupado && 'opacity-70')}
    >
      <header className="flex items-start gap-3">
        <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-fd-muted text-fd-muted-foreground">
          <Icon className="size-5" aria-hidden />
          <span className="sr-only">{info?.label ?? a.tipo}</span>
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
            <h3 id={`${uid}-titulo`} className="min-w-0 break-words font-semibold leading-snug">
              {a.titulo}
            </h3>
            <EstadoBadge estado={a.estado} />
          </div>
          <p className="mt-1 text-xs text-fd-muted-foreground">
            <span className="font-medium text-fd-foreground">{autor}</span>
            {a.autor?.nombre && a.autor.email && <span className="break-all"> · {a.autor.email}</span>}
          </p>
          <p className="mt-0.5 flex flex-wrap gap-x-1.5 text-xs text-fd-muted-foreground">
            <span className="rounded bg-fd-muted px-1.5 py-px font-medium">{nombreModulo}</span>
            {a.tema && <span>· {a.tema}</span>}
            <span>·</span>
            <time dateTime={a.creado_en} title={formatFecha(a.creado_en)} suppressHydrationWarning>
              {formatRelativo(a.creado_en)}
            </time>
          </p>
        </div>
      </header>

      {desc && (
        <div className="mt-3">
          <p className={cn('whitespace-pre-wrap break-words text-sm leading-relaxed', larga && !expandida && 'line-clamp-5')}>
            {desc}
          </p>
          {larga && (
            <button
              type="button"
              onClick={() => setExpandida((v) => !v)}
              aria-expanded={expandida}
              className="mt-1 inline-flex items-center gap-1 rounded text-xs font-medium text-fd-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
            >
              {expandida ? 'Ver menos' : 'Ver todo'}
              <ChevronDown className={cn('size-3.5 transition', expandida && 'rotate-180')} aria-hidden />
            </button>
          )}
        </div>
      )}

      <div className="mt-3">
        <Adjunto a={a} />
      </div>

      <AnimatePresence initial={false}>
        {verNota && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-1.5 pt-3">
              <label htmlFor={`${uid}-nota`} className="text-xs font-medium text-fd-muted-foreground">
                Nota para el alumno (la verá en «Mis aportaciones»)
              </label>
              <textarea
                id={`${uid}-nota`}
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                maxLength={1000}
                rows={2}
                placeholder="p. ej. ¡Gracias! La he añadido al tema 3."
                className={cn(inputClase, 'resize-y')}
                disabled={ocupado}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3">
        {a.estado !== 'aprobada' && (
          <button
            type="button"
            disabled={ocupado}
            onClick={() => cambiar('aprobada')}
            className={cn(boton, 'bg-green-600 text-white hover:bg-green-700 dark:bg-green-600/90 dark:hover:bg-green-600')}
          >
            {ocupado ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <Check className="size-4" aria-hidden />}
            Aprobar
          </button>
        )}
        {a.estado !== 'descartada' && (
          <button
            type="button"
            disabled={ocupado}
            onClick={() => cambiar('descartada')}
            className={cn(boton, 'border border-red-500/40 text-red-700 hover:bg-red-500/10 dark:text-red-300')}
          >
            <X className="size-4" aria-hidden />
            Descartar
          </button>
        )}
        {a.estado !== 'pendiente' && (
          <button
            type="button"
            disabled={ocupado}
            onClick={() => cambiar('pendiente')}
            className={cn(boton, 'border bg-fd-secondary text-fd-secondary-foreground hover:bg-fd-accent')}
          >
            <RotateCcw className="size-4" aria-hidden />
            A pendientes
          </button>
        )}
        {!verNota && (
          <button
            type="button"
            disabled={ocupado}
            onClick={() => setVerNota(true)}
            className={cn(boton, 'text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground')}
          >
            <MessageSquarePlus className="size-4" aria-hidden />
            Nota
          </button>
        )}
        {verNota && nota.trim() !== (a.nota_admin ?? '') && (
          <button
            type="button"
            disabled={ocupado}
            onClick={() => cambiar(a.estado)}
            className={cn(boton, 'text-fd-primary hover:bg-fd-primary/10')}
          >
            Guardar nota
          </button>
        )}
        <button
          type="button"
          disabled={ocupado}
          onClick={() => {
            if (confirmarBorrar) {
              setConfirmarBorrar(false);
              onAccion({ tipo: 'borrar', id: a.id });
            } else setConfirmarBorrar(true);
          }}
          aria-live="polite"
          className={cn(
            boton,
            'ml-auto',
            confirmarBorrar
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'text-fd-muted-foreground hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400',
          )}
        >
          <Trash2 className="size-4" aria-hidden />
          {confirmarBorrar ? '¿Seguro? Pulsa otra vez' : <span className="sr-only sm:not-sr-only">Eliminar</span>}
        </button>
      </footer>
    </article>
  );
}
