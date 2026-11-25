/**
 * Aportaciones de la clase: constantes, esquemas zod y utilidades compartidas
 * entre cliente y servidor. Este archivo NO debe importar nada de servidor
 * (la lista de módulos vive en `components/aportaciones/modulos.ts`).
 */
import { z } from 'zod';
import { Camera, FileText, Link2, Type, Video, type LucideIcon } from 'lucide-react';

// ---------------------------------------------------------------------------
// Tipos y estados
// ---------------------------------------------------------------------------

export const TIPOS = ['captura', 'video', 'documento', 'enlace', 'texto'] as const;
export type TipoAportacion = (typeof TIPOS)[number];

export const ESTADOS = ['pendiente', 'aprobada', 'descartada'] as const;
export type EstadoAportacion = (typeof ESTADOS)[number];

/** Valor de `modulo` cuando el alumno elige "Otro". */
export const MODULO_OTRO = 'otro';

export const BUCKET_APORTACIONES = 'aportaciones';
export const MAX_BYTES = 50 * 1024 * 1024; // 50 MB (igual que el bucket)
export const SIGNED_URL_SEGUNDOS = 60 * 60; // 1 h

export const MIMES_IMAGEN = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'] as const;
export const MIMES_VIDEO = ['video/mp4', 'video/webm', 'video/quicktime'] as const;
export const MIMES_DOCUMENTO = [
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'text/plain',
  'text/markdown',
] as const;
export const MIMES_TEXTO = ['text/plain', 'text/markdown'] as const;

export const MIMES_PERMITIDOS: readonly string[] = [...MIMES_IMAGEN, ...MIMES_VIDEO, ...MIMES_DOCUMENTO];

/** Extensión → MIME (algunos navegadores dejan `file.type` vacío para .md o .zip). */
const MIME_POR_EXTENSION: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  mp4: 'video/mp4',
  m4v: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  pdf: 'application/pdf',
  zip: 'application/zip',
  txt: 'text/plain',
  md: 'text/markdown',
  markdown: 'text/markdown',
};

/** Atributo `accept` del input de archivo. */
export const ACCEPT_ARCHIVOS = [
  ...MIMES_PERMITIDOS,
  ...Object.keys(MIME_POR_EXTENSION).map((e) => `.${e}`),
].join(',');

export interface TipoInfo {
  id: TipoAportacion;
  label: string;
  descripcion: string;
  icon: LucideIcon;
  /** MIMEs que admite este tipo (vacío = sin archivo). */
  mimes: readonly string[];
  /** 'obligatorio' | 'opcional' | 'no' */
  archivo: 'obligatorio' | 'opcional' | 'no';
  /** Si admite (o exige) un enlace. */
  enlace: 'obligatorio' | 'opcional' | 'no';
}

export const TIPOS_INFO: Record<TipoAportacion, TipoInfo> = {
  captura: {
    id: 'captura',
    label: 'Captura',
    descripcion: 'Foto de la pizarra o pantallazo',
    icon: Camera,
    mimes: MIMES_IMAGEN,
    archivo: 'obligatorio',
    enlace: 'no',
  },
  video: {
    id: 'video',
    label: 'Vídeo',
    descripcion: 'Clip corto o enlace a uno largo',
    icon: Video,
    mimes: MIMES_VIDEO,
    archivo: 'opcional',
    enlace: 'opcional',
  },
  documento: {
    id: 'documento',
    label: 'Documento',
    descripcion: 'PDF, ZIP, apuntes en .txt/.md',
    icon: FileText,
    mimes: MIMES_DOCUMENTO,
    archivo: 'obligatorio',
    enlace: 'no',
  },
  enlace: {
    id: 'enlace',
    label: 'Enlace',
    descripcion: 'YouTube, Drive, una web útil…',
    icon: Link2,
    mimes: [],
    archivo: 'no',
    enlace: 'obligatorio',
  },
  texto: {
    id: 'texto',
    label: 'Texto',
    descripcion: 'Explicación, corrección o idea',
    icon: Type,
    mimes: MIMES_TEXTO,
    archivo: 'opcional',
    enlace: 'no',
  },
};

export const ESTADOS_INFO: Record<
  EstadoAportacion,
  { label: string; plural: string; badge: string; dot: string }
> = {
  pendiente: {
    label: 'Pendiente',
    plural: 'Pendientes',
    badge: 'bg-amber-500/15 text-amber-700 ring-amber-500/30 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  aprobada: {
    label: 'Aprobada',
    plural: 'Aprobadas',
    badge: 'bg-green-500/15 text-green-700 ring-green-500/30 dark:text-green-300',
    dot: 'bg-green-500',
  },
  descartada: {
    label: 'Descartada',
    plural: 'Descartadas',
    badge: 'bg-red-500/15 text-red-700 ring-red-500/30 dark:text-red-300',
    dot: 'bg-red-500',
  },
};

// ---------------------------------------------------------------------------
// Filas de la BD
// ---------------------------------------------------------------------------

export interface AportacionRow {
  id: string;
  autor_id: string;
  tipo: TipoAportacion;
  modulo: string;
  tema: string | null;
  titulo: string;
  descripcion: string | null;
  enlace: string | null;
  archivo_path: string | null;
  archivo_nombre: string | null;
  archivo_mime: string | null;
  archivo_bytes: number | null;
  estado: EstadoAportacion;
  nota_admin: string | null;
  creado_en: string;
  revisado_en: string | null;
}

/** Módulo derivado del árbol de Fumadocs (ver components/aportaciones/modulos.ts). */
export interface Modulo {
  slug: string;
  nombre: string;
  temas: { url: string; titulo: string }[];
  /** Curso al que pertenece ("1º DAM"), si lo hay. */
  grupo?: string;
}

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

export function extension(nombre: string): string {
  const i = nombre.lastIndexOf('.');
  return i > 0 ? nombre.slice(i + 1).toLowerCase() : '';
}

/** MIME efectivo de un archivo: el del navegador o, si falta, por extensión. */
export function resolverMime(nombre: string, mime?: string | null): string {
  const m = (mime ?? '').toLowerCase().split(';')[0].trim();
  if (m && m !== 'application/octet-stream') return m;
  return MIME_POR_EXTENSION[extension(nombre)] ?? m;
}

/** Tipo de aportación que mejor encaja con un MIME. */
export function tipoParaMime(mime: string): TipoAportacion | null {
  if ((MIMES_IMAGEN as readonly string[]).includes(mime)) return 'captura';
  if ((MIMES_VIDEO as readonly string[]).includes(mime)) return 'video';
  if ((MIMES_DOCUMENTO as readonly string[]).includes(mime)) return 'documento';
  return null;
}

export function mimeAdmitido(tipo: TipoAportacion, mime: string): boolean {
  return TIPOS_INFO[tipo].mimes.includes(mime);
}

/** Nombre de archivo seguro para Storage: ASCII, sin espacios raros, ≤ 80 caracteres. */
export function sanitizarNombre(nombre: string): string {
  const ext = extension(nombre);
  const base = (ext ? nombre.slice(0, -(ext.length + 1)) : nombre)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
    .slice(0, 70)
    .toLowerCase();
  const extLimpia = ext.replace(/[^a-z0-9]/g, '').slice(0, 10);
  return `${base || 'archivo'}${extLimpia ? `.${extLimpia}` : ''}`;
}

export function formatBytes(bytes: number | null | undefined): string {
  if (bytes == null || !Number.isFinite(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  const unidades = ['KB', 'MB', 'GB'];
  let v = bytes / 1024;
  let i = 0;
  while (v >= 1024 && i < unidades.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toLocaleString('es-ES', { maximumFractionDigits: v < 10 ? 1 : 0 })} ${unidades[i]}`;
}

const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
const PASOS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 60 * 60 * 24 * 365],
  ['month', 60 * 60 * 24 * 30],
  ['week', 60 * 60 * 24 * 7],
  ['day', 60 * 60 * 24],
  ['hour', 60 * 60],
  ['minute', 60],
];

/** "hace 5 minutos", "ayer", "hace 2 semanas"… */
export function formatRelativo(fecha: string | Date, ahora: Date = new Date()): string {
  const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
  const seg = Math.round((d.getTime() - ahora.getTime()) / 1000);
  for (const [unidad, s] of PASOS) {
    if (Math.abs(seg) >= s) return rtf.format(Math.round(seg / s), unidad);
  }
  return 'ahora mismo';
}

export function formatFecha(fecha: string | Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Madrid',
  }).format(typeof fecha === 'string' ? new Date(fecha) : fecha);
}

/** Fecha de hoy (YYYY-MM-DD) en Europe/Madrid, igual que `chat_uso.dia`. */
export function hoyMadrid(ahora: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(ahora);
}

/** ID de un vídeo de YouTube a partir de cualquier URL típica, o null. */
export function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\.|^m\./, '');
    let id: string | null = null;
    if (host === 'youtu.be') id = u.pathname.slice(1).split('/')[0];
    else if (host === 'youtube.com' || host === 'youtube-nocookie.com' || host === 'music.youtube.com') {
      if (u.pathname === '/watch') id = u.searchParams.get('v');
      else {
        const m = u.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/);
        id = m?.[1] ?? null;
      }
    }
    return id && /^[\w-]{6,20}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function esUrlHttp(valor: string): boolean {
  try {
    const u = new URL(valor);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Ruta en Storage para un archivo nuevo del usuario. */
export function rutaArchivo(userId: string, nombre: string): string {
  return `${userId}/${crypto.randomUUID()}-${sanitizarNombre(nombre)}`;
}

// ---------------------------------------------------------------------------
// Esquemas zod
// ---------------------------------------------------------------------------

const textoOpcional = (max: number, msg: string) =>
  z
    .string()
    .trim()
    .max(max, msg)
    .optional()
    .transform((v) => (v ? v : undefined));

export const enlaceSchema = z
  .string()
  .trim()
  .max(2000, 'El enlace es demasiado largo')
  .refine(esUrlHttp, 'Pon un enlace válido que empiece por http:// o https://');

export const archivoSubidoSchema = z.object({
  path: z
    .string()
    .min(3)
    .max(400)
    .regex(/^[0-9a-f-]{36}\/[0-9a-f-]{36}-[a-z0-9._-]+$/i, 'Ruta de archivo no válida'),
  nombre: z.string().trim().min(1).max(255),
});

/** Datos que el formulario envía al servidor (tras subir el archivo). */
export const nuevaAportacionSchema = z
  .object({
    tipo: z.enum(TIPOS, { error: 'Elige un tipo' }),
    modulo: z.string().trim().min(1, 'Elige un módulo').max(80),
    tema: textoOpcional(120, 'El tema es demasiado largo'),
    titulo: z
      .string()
      .trim()
      .min(3, 'El título necesita al menos 3 caracteres')
      .max(140, 'Máximo 140 caracteres'),
    descripcion: textoOpcional(4000, 'Máximo 4000 caracteres'),
    enlace: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v ? v : undefined))
      .pipe(enlaceSchema.optional()),
    archivo: archivoSubidoSchema.optional(),
  })
  .superRefine((d, ctx) => {
    const info = TIPOS_INFO[d.tipo];
    if (info.archivo === 'no' && d.archivo) {
      ctx.addIssue({ code: 'custom', path: ['archivo'], message: `Una aportación de tipo ${info.label.toLowerCase()} no lleva archivo` });
    }
    if (info.enlace === 'no' && d.enlace) {
      ctx.addIssue({ code: 'custom', path: ['enlace'], message: 'Este tipo no lleva enlace' });
    }
    if (info.enlace === 'obligatorio' && !d.enlace) {
      ctx.addIssue({ code: 'custom', path: ['enlace'], message: 'Pega el enlace' });
    }
    if (info.archivo === 'obligatorio' && !d.archivo) {
      ctx.addIssue({ code: 'custom', path: ['archivo'], message: 'Adjunta un archivo' });
    }
    if (d.tipo === 'video' && !d.archivo && !d.enlace) {
      ctx.addIssue({ code: 'custom', path: ['archivo'], message: 'Sube el vídeo o pega un enlace' });
    }
    if (d.tipo === 'texto' && !d.archivo && (d.descripcion?.length ?? 0) < 10) {
      ctx.addIssue({ code: 'custom', path: ['descripcion'], message: 'Escribe el texto (mínimo 10 caracteres) o adjunta un .txt/.md' });
    }
  });

export type NuevaAportacion = z.input<typeof nuevaAportacionSchema>;

export const revisarSchema = z.object({
  id: z.uuid(),
  estado: z.enum(ESTADOS),
  nota: textoOpcional(1000, 'La nota es demasiado larga'),
});

export const idSchema = z.object({ id: z.uuid() });

/** Valida un archivo en el navegador antes de subirlo. Devuelve el error o null. */
export function validarArchivo(tipo: TipoAportacion, archivo: { name: string; size: number; type: string }): string | null {
  const info = TIPOS_INFO[tipo];
  if (info.archivo === 'no') return `Las aportaciones de tipo ${info.label.toLowerCase()} no llevan archivo`;
  if (archivo.size <= 0) return 'El archivo está vacío';
  if (archivo.size > MAX_BYTES) return `El archivo pesa ${formatBytes(archivo.size)}; el máximo es ${formatBytes(MAX_BYTES)}. Para vídeos largos usa un enlace.`;
  const mime = resolverMime(archivo.name, archivo.type);
  if (!MIMES_PERMITIDOS.includes(mime)) return 'Formato no admitido. Usa imágenes, vídeo (mp4/webm/mov), PDF, ZIP o texto.';
  if (!info.mimes.includes(mime)) return `Ese archivo no encaja con el tipo ${info.label.toLowerCase()}`;
  return null;
}

/** Primer mensaje de error por campo de un ZodError. */
export function erroresPorCampo(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const k = String(issue.path[0] ?? 'form');
    if (!out[k]) out[k] = issue.message;
  }
  return out;
}

export type ResultadoAccion = { ok: true; mensaje?: string } | { ok: false; error: string; campos?: Record<string, string> };
