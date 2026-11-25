'use client';

import { useOptimistic, useState, useTransition } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';
import { ESTADOS_INFO, type EstadoAportacion } from '@/lib/aportaciones';
import { eliminarAportacion, revisarAportacion } from '@/app/admin/actions';
import { AportacionCard, type AccionAdmin } from './aportacion-card';
import type { AportacionAdmin } from './datos';

export function ListaAportaciones({
  aportaciones,
  filtroEstado,
  hayFiltros,
  nombresModulos,
}: {
  aportaciones: AportacionAdmin[];
  filtroEstado: EstadoAportacion | 'todas';
  hayFiltros: boolean;
  nombresModulos: Record<string, string>;
}) {
  const [, startTransition] = useTransition();
  const [ocupados, setOcupados] = useState<Set<string>>(new Set());
  const [optimistas, aplicar] = useOptimistic(aportaciones, (estado: AportacionAdmin[], accion: AccionAdmin) => {
    if (accion.tipo === 'borrar') return estado.filter((a) => a.id !== accion.id);
    return estado
      .map((a) =>
        a.id === accion.id
          ? {
              ...a,
              estado: accion.estado,
              nota_admin: accion.nota ?? null,
              revisado_en: accion.estado === 'pendiente' ? null : new Date().toISOString(),
            }
          : a,
      )
      .filter((a) => filtroEstado === 'todas' || a.estado === filtroEstado);
  });

  const marcar = (id: string, on: boolean) =>
    setOcupados((s) => {
      const n = new Set(s);
      if (on) n.add(id);
      else n.delete(id);
      return n;
    });

  const ejecutar = (accion: AccionAdmin) => {
    marcar(accion.id, true);
    startTransition(async () => {
      aplicar(accion);
      try {
        const res =
          accion.tipo === 'borrar'
            ? await eliminarAportacion({ id: accion.id })
            : await revisarAportacion({ id: accion.id, estado: accion.estado, nota: accion.nota });
        if (res.ok) toast.success(res.mensaje ?? 'Hecho');
        else toast.error(res.error);
      } catch {
        toast.error('Error de conexión. Inténtalo de nuevo.');
      } finally {
        marcar(accion.id, false);
      }
    });
  };

  if (optimistas.length === 0) {
    return (
      <div className="rounded-md border border-dashed px-4 py-8 text-center">
        <p className="text-sm font-medium">
          {hayFiltros
            ? 'Nada coincide con estos filtros'
            : filtroEstado === 'pendiente'
              ? 'No hay aportaciones pendientes'
              : filtroEstado === 'todas'
                ? 'Todavía no hay aportaciones'
                : `No hay aportaciones ${ESTADOS_INFO[filtroEstado].plural.toLowerCase()}`}
        </p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-fd-muted-foreground">
          {hayFiltros ? 'Prueba con otra búsqueda o quita el filtro de módulo.' : 'Cuando la clase envíe algo desde «Aportar», aparecerá aquí.'}
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      <AnimatePresence initial={false} mode="popLayout">
        {optimistas.map((a) => (
          <motion.li
            key={a.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={{ duration: 0.15 }}
          >
            <AportacionCard
              a={a}
              nombreModulo={nombresModulos[a.modulo] ?? a.modulo}
              ocupado={ocupados.has(a.id)}
              onAccion={ejecutar}
            />
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
