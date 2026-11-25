'use client';

import Link from 'next/link';
import { completadas, normalizarUrlProgreso, useProgresoLocal } from './use-progreso-local';

export interface CursoProgresoInfo {
  id: string;
  nombre: string;
  numero: number | null;
  paginas: string[];
}

interface Props {
  cursos: CursoProgresoInfo[];
  titulos: Record<string, string>;
}

function fechaRelativa(iso: string): string | null {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  // Días de calendario (hora local), no bloques de 24 h
  const dia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dias = Math.round((dia(new Date()) - dia(new Date(t))) / 86_400_000);
  if (dias <= 0) return 'hoy';
  if (dias === 1) return 'ayer';
  if (dias < 7) return `hace ${dias} días`;
  return new Date(t).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

/**
 * "Continúa donde lo dejaste": solo aparece si el alumno tiene progreso guardado
 * en este navegador (localStorage 'dam:progreso').
 */
export function Continua({ cursos, titulos }: Props) {
  const progreso = useProgresoLocal();

  const hechas = Object.entries(progreso).filter(([, v]) => v.completado);
  if (hechas.length === 0) return null;

  // Última página completada (por fecha).
  const ms = (fecha: string) => Date.parse(fecha) || 0; // sin fecha → la más antigua
  const [ultimaUrl, ultima] = hechas.reduce((a, b) => (ms(b[1].fecha) > ms(a[1].fecha) ? b : a));

  // Siguiente tema pendiente dentro del mismo curso, en el orden del temario.
  const cursoDeUltima = cursos.find((c) => c.paginas.some((u) => normalizarUrlProgreso(u) === ultimaUrl));
  let siguiente: string | null = null;
  if (cursoDeUltima) {
    const orden = cursoDeUltima.paginas.map(normalizarUrlProgreso);
    const idx = orden.indexOf(ultimaUrl);
    const resto = [...orden.slice(idx + 1), ...orden.slice(0, idx)];
    siguiente = resto.find((u) => !progreso[u]?.completado) ?? null;
  }

  const titulo = (url: string) =>
    titulos[url] ?? titulos[`${url}/`] ?? decodeURIComponent(url.split('/').filter(Boolean).pop() ?? url);

  const cuando = fechaRelativa(ultima.fecha);

  const curso = cursoDeUltima;
  const hechasCurso = curso ? completadas(progreso, curso.paginas) : 0;
  const destino = siguiente ?? ultimaUrl;

  return (
    <section aria-labelledby="continua-titulo" className="mt-10 border-y py-3 text-sm">
      <h2 id="continua-titulo" className="sr-only">
        Continúa donde lo dejaste
      </h2>
      <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-fd-muted-foreground">{siguiente ? 'Continúa con' : 'Último tema'}</span>
        <Link href={destino} className="font-medium text-fd-primary underline-offset-4 hover:underline">
          {titulo(destino)} <span aria-hidden>→</span>
        </Link>
        <span className="text-fd-muted-foreground sm:ms-auto">
          {curso && curso.paginas.length > 0 ? `${curso.nombre}: ${hechasCurso}/${curso.paginas.length} temas` : ''}
          {curso && cuando ? ' · ' : ''}
          {cuando ? `último completado ${cuando}` : ''}
        </span>
      </p>
    </section>
  );
}
