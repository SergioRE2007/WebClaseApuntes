import 'server-only';
import { isSupabaseConfigured } from '@/lib/env';
import { createClient } from '@/lib/supabase/server';
import {
  BUCKET_APORTACIONES,
  ESTADOS,
  SIGNED_URL_SEGUNDOS,
  hoyMadrid,
  type AportacionRow,
  type EstadoAportacion,
} from '@/lib/aportaciones';

export const LIMITE_LISTA = 60;

export interface AportacionAdmin extends AportacionRow {
  autor: { nombre: string | null; email: string } | null;
  /** URL firmada (1 h) para previsualizar el adjunto. */
  archivoUrl: string | null;
  /** URL firmada que fuerza la descarga con el nombre original. */
  descargaUrl: string | null;
}

export interface AlumnoAdmin {
  id: string;
  nombre: string | null;
  email: string;
  rol: 'alumno' | 'admin';
  clase_ok: boolean;
  creado_en: string | null;
  mensajesHoy: number;
  aportaciones: number;
}

export interface Stats {
  pendiente: number;
  aprobada: number;
  descartada: number;
  alumnos: number;
  mensajesHoy: number;
}

export interface Filtros {
  estado: EstadoAportacion | 'todas';
  modulo: string | null;
  q: string;
}

const STATS_VACIAS: Stats = { pendiente: 0, aprobada: 0, descartada: 0, alumnos: 0, mensajesHoy: 0 };

export async function getDatosAdmin(filtros: Filtros): Promise<{
  stats: Stats;
  aportaciones: AportacionAdmin[];
  hayMas: boolean;
  alumnos: AlumnoAdmin[];
  error: string | null;
}> {
  if (!isSupabaseConfigured) {
    return { stats: STATS_VACIAS, aportaciones: [], hayMas: false, alumnos: [], error: null };
  }
  const supabase = await createClient();
  const hoy = hoyMadrid();

  const contar = (estado: EstadoAportacion) =>
    supabase.from('aportaciones').select('id', { count: 'exact', head: true }).eq('estado', estado);

  let consulta = supabase
    .from('aportaciones')
    .select('*, autor:perfiles(nombre, email)')
    .order('creado_en', { ascending: filtros.estado === 'pendiente' })
    .limit(LIMITE_LISTA + 1);
  if (filtros.estado !== 'todas') consulta = consulta.eq('estado', filtros.estado);
  if (filtros.modulo) consulta = consulta.eq('modulo', filtros.modulo);
  if (filtros.q) {
    const patron = `%${filtros.q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
    consulta = consulta.ilike('titulo', patron);
  }

  const [cPend, cApr, cDesc, perfilesRes, chatRes, listaRes, autoresRes] = await Promise.all([
    contar('pendiente'),
    contar('aprobada'),
    contar('descartada'),
    supabase.from('perfiles').select('id, nombre, email, rol, clase_ok, creado_en').order('nombre', { ascending: true }),
    supabase.from('chat_uso').select('usuario_id, mensajes').eq('dia', hoy),
    consulta,
    supabase.from('aportaciones').select('autor_id'),
  ]);

  const error =
    [cPend, cApr, cDesc, perfilesRes, chatRes, listaRes].find((r) => r.error)?.error?.message ?? null;

  const chatPorUsuario = new Map<string, number>();
  for (const r of (chatRes.data ?? []) as { usuario_id: string; mensajes: number }[]) {
    chatPorUsuario.set(r.usuario_id, (chatPorUsuario.get(r.usuario_id) ?? 0) + (r.mensajes ?? 0));
  }
  const aportPorUsuario = new Map<string, number>();
  for (const r of (autoresRes.data ?? []) as { autor_id: string }[]) {
    aportPorUsuario.set(r.autor_id, (aportPorUsuario.get(r.autor_id) ?? 0) + 1);
  }

  const perfiles = (perfilesRes.data ?? []) as Omit<AlumnoAdmin, 'mensajesHoy' | 'aportaciones'>[];
  const alumnos: AlumnoAdmin[] = perfiles
    .map((p) => ({ ...p, mensajesHoy: chatPorUsuario.get(p.id) ?? 0, aportaciones: aportPorUsuario.get(p.id) ?? 0 }))
    .sort((a, b) => Number(b.clase_ok) - Number(a.clase_ok) || (a.nombre ?? a.email).localeCompare(b.nombre ?? b.email, 'es'));

  const filas = ((listaRes.data ?? []) as (AportacionRow & { autor: AportacionAdmin['autor'] | AportacionAdmin['autor'][] })[]).map(
    (f) => ({ ...f, autor: Array.isArray(f.autor) ? (f.autor[0] ?? null) : f.autor }),
  );
  const hayMas = filas.length > LIMITE_LISTA;
  const visibles = filas.slice(0, LIMITE_LISTA);

  // URLs firmadas de corta duración, en lote
  // Solo firmamos adjuntos que estén en la carpeta de su autor (defensa extra contra filas falsificadas)
  const propio = (f: { archivo_path: string | null; autor_id: string }) =>
    Boolean(f.archivo_path && f.archivo_path.startsWith(`${f.autor_id}/`));
  const paths = visibles.filter(propio).map((f) => f.archivo_path as string);
  const urls = new Map<string, string>();
  if (paths.length) {
    const { data } = await supabase.storage.from(BUCKET_APORTACIONES).createSignedUrls(paths, SIGNED_URL_SEGUNDOS);
    for (const d of data ?? []) if (d.path && d.signedUrl) urls.set(d.path, d.signedUrl);
  }

  const aportaciones: AportacionAdmin[] = visibles.map((f) => {
    const url = f.archivo_path && propio(f) ? (urls.get(f.archivo_path) ?? null) : null;
    const descarga = url
      ? `${url}${url.includes('?') ? '&' : '?'}download=${encodeURIComponent(f.archivo_nombre ?? 'archivo')}`
      : null;
    return { ...f, archivoUrl: url, descargaUrl: descarga };
  });

  const stats: Stats = {
    pendiente: cPend.count ?? 0,
    aprobada: cApr.count ?? 0,
    descartada: cDesc.count ?? 0,
    alumnos: perfiles.filter((p) => p.clase_ok).length,
    mensajesHoy: [...chatPorUsuario.values()].reduce((a, b) => a + b, 0),
  };

  return { stats, aportaciones, hayMas, alumnos, error };
}

export function parseFiltros(sp: Record<string, string | string[] | undefined>): Filtros {
  const uno = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';
  const e = uno(sp.estado);
  const estado = e === 'todas' || (ESTADOS as readonly string[]).includes(e) ? (e as Filtros['estado']) : 'pendiente';
  const modulo = uno(sp.modulo).slice(0, 80) || null;
  const q = uno(sp.q).trim().slice(0, 100);
  return { estado, modulo, q };
}
