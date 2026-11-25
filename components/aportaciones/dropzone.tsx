'use client';

import { useEffect, useRef, useState, type DragEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ClipboardPaste, CloudUpload, FileArchive, FileText, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  ACCEPT_ARCHIVOS,
  MAX_BYTES,
  formatBytes,
  resolverMime,
  type TipoAportacion,
} from '@/lib/aportaciones';

function usePreviewUrl(file: File | null) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  return url;
}

const FORMATOS: Record<TipoAportacion, string> = {
  captura: 'PNG, JPG, WEBP o GIF',
  video: 'MP4, WEBM o MOV',
  documento: 'PDF, ZIP, TXT o MD',
  enlace: '',
  texto: 'TXT o MD',
};

export function Dropzone({
  id,
  tipo,
  archivo,
  onArchivo,
  error,
  opcional,
  disabled,
}: {
  id: string;
  tipo: TipoAportacion;
  archivo: File | null;
  onArchivo: (f: File | null, origen?: 'pegar' | 'soltar' | 'elegir') => void;
  error?: string;
  opcional?: boolean;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const profundidad = useRef(0);
  const url = usePreviewUrl(archivo);
  const mime = archivo ? resolverMime(archivo.name, archivo.type) : '';

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    profundidad.current = 0;
    setArrastrando(false);
    if (disabled) return;
    const f = e.dataTransfer.files?.[0];
    if (f) onArchivo(f, 'soltar');
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline gap-2 text-sm font-medium text-fd-foreground">
        <span id={`${id}-label`}>Archivo</span>
        {opcional && <span className="text-xs font-normal text-fd-muted-foreground">(opcional)</span>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ARCHIVOS}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        disabled={disabled}
        onChange={(e) => {
          onArchivo(e.target.files?.[0] ?? null, 'elegir');
          e.target.value = '';
        }}
      />

      <AnimatePresence mode="wait" initial={false}>
        {archivo ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className={cn('overflow-hidden rounded-xl border bg-fd-card', error && 'border-red-500')}
          >
            {url && mime.startsWith('image/') && (
              <div className="flex max-h-80 justify-center bg-fd-muted/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Vista previa de ${archivo.name}`} className="max-h-80 w-auto object-contain" />
              </div>
            )}
            {url && mime.startsWith('video/') && (
              <video src={url} controls preload="metadata" className="max-h-80 w-full bg-black" />
            )}
            <div className="flex items-center gap-3 p-3">
              {!mime.startsWith('image/') && !mime.startsWith('video/') && (
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-fd-muted text-fd-muted-foreground">
                  {mime.includes('zip') ? <FileArchive className="size-5" aria-hidden /> : <FileText className="size-5" aria-hidden />}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium" title={archivo.name}>
                  {archivo.name}
                </p>
                <p className="text-xs text-fd-muted-foreground">
                  {formatBytes(archivo.size)} · {mime || 'tipo desconocido'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={disabled}
                className="rounded-md px-2 py-1 text-xs font-medium text-fd-muted-foreground transition hover:bg-fd-accent hover:text-fd-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring disabled:opacity-50"
              >
                Cambiar
              </button>
              <button
                type="button"
                onClick={() => onArchivo(null)}
                disabled={disabled}
                aria-label={`Quitar ${archivo.name}`}
                className="rounded-md p-1.5 text-fd-muted-foreground transition hover:bg-red-500/10 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring disabled:opacity-50 dark:hover:text-red-400"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="zona"
            id={id}
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            onDragEnter={(e) => {
              e.preventDefault();
              profundidad.current++;
              setArrastrando(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = disabled ? 'none' : 'copy';
            }}
            onDragLeave={() => {
              profundidad.current = Math.max(0, profundidad.current - 1);
              if (profundidad.current === 0) setArrastrando(false);
            }}
            onDrop={onDrop}
            aria-labelledby={`${id}-label`}
            aria-describedby={error ? `${id}-error` : `${id}-ayuda`}
            aria-invalid={Boolean(error)}
            className={cn(
              'flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition',
              'hover:border-fd-primary/60 hover:bg-fd-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2 focus-visible:ring-offset-fd-background',
              'disabled:cursor-not-allowed disabled:opacity-60',
              arrastrando && 'border-fd-primary bg-fd-primary/10',
              error && 'border-red-500/70',
            )}
          >
            <motion.span
              animate={arrastrando ? { y: -4, scale: 1.08 } : { y: 0, scale: 1 }}
              className="flex size-12 items-center justify-center rounded-full bg-fd-primary/10 text-fd-primary"
            >
              <CloudUpload className="size-6" aria-hidden />
            </motion.span>
            <span className="text-sm font-medium text-fd-foreground">
              {arrastrando ? 'Suelta el archivo aquí' : 'Arrastra un archivo o haz clic para elegirlo'}
            </span>
            <span className="inline-flex flex-wrap items-center justify-center gap-1 text-xs text-fd-muted-foreground">
              <ClipboardPaste className="size-3.5" aria-hidden />
              También puedes pegar una captura con
              <kbd className="rounded border bg-fd-muted px-1 font-mono text-[11px]">Ctrl</kbd>+
              <kbd className="rounded border bg-fd-muted px-1 font-mono text-[11px]">V</kbd>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : (
        <p id={`${id}-ayuda`} className="text-xs text-fd-muted-foreground">
          {FORMATOS[tipo]} · máximo {formatBytes(MAX_BYTES)}
          {tipo === 'video' && ' · ¿Es largo? Mejor pega un enlace de YouTube o Drive.'}
        </p>
      )}
    </div>
  );
}
