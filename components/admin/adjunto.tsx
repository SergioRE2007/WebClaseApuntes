'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Download, ExternalLink, FileArchive, FileText, Link2, Play, TriangleAlert, X, ZoomIn } from 'lucide-react';
import { formatBytes, youtubeId } from '@/lib/aportaciones';
import type { AportacionAdmin } from './datos';

const enlaceBoton =
  'inline-flex items-center gap-1.5 rounded-lg border bg-fd-background px-3 py-1.5 text-sm font-medium transition hover:bg-fd-accent hover:text-fd-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring';

function Lightbox({ src, alt, abierto, onCerrar }: { src: string; alt: string; abierto: boolean; onCerrar: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (abierto && !d.open) d.showModal();
    if (!abierto && d.open) d.close();
  }, [abierto]);

  return (
    <dialog
      ref={ref}
      aria-label={alt}
      onClose={onCerrar}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
      className="m-auto max-h-none max-w-none bg-transparent p-0 backdrop:bg-black/80 backdrop:backdrop-blur-sm"
    >
      <div className="relative flex h-dvh w-screen items-center justify-center p-4" onClick={onCerrar}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
        <div className="absolute right-4 top-4 flex gap-2">
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Abrir imagen en otra pestaña"
          >
            <ExternalLink className="size-5" aria-hidden />
          </a>
          <button
            type="button"
            onClick={onCerrar}
            autoFocus
            className="rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Cerrar"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
      </div>
    </dialog>
  );
}

function YouTube({ id, url }: { id: string; url: string }) {
  const [reproducir, setReproducir] = useState(false);
  if (reproducir) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg border bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
          title="Vídeo de YouTube"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="size-full"
        />
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setReproducir(true)}
        className="group relative block aspect-video w-full overflow-hidden rounded-lg border bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
        aria-label="Reproducir vídeo de YouTube aquí"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
          alt=""
          loading="lazy"
          className="size-full object-cover opacity-90 transition group-hover:scale-[1.02] group-hover:opacity-100"
        />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition group-hover:scale-110">
            <Play className="ml-0.5 size-6 fill-current" aria-hidden />
          </span>
        </span>
      </button>
      <EnlaceExterno url={url} />
    </div>
  );
}

function EnlaceExterno({ url }: { url: string }) {
  let host = url;
  try {
    host = new URL(url).hostname.replace(/^www\./, '');
  } catch {
    // url ya validada al crearse
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="flex min-w-0 items-center gap-3 rounded-lg border bg-fd-background p-3 transition hover:bg-fd-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-fd-primary/10 text-fd-primary">
        <Link2 className="size-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{host}</span>
        <span className="block truncate text-xs text-fd-muted-foreground">{url}</span>
      </span>
      <ExternalLink className="size-4 shrink-0 text-fd-muted-foreground" aria-hidden />
    </a>
  );
}

export function Adjunto({ a }: { a: AportacionAdmin }) {
  const [zoom, setZoom] = useState(false);
  const mime = a.archivo_mime ?? '';
  const yt = youtubeId(a.enlace);
  const partes: ReactNode[] = [];

  if (a.archivo_path) {
    if (!a.archivoUrl) {
      partes.push(
        <p key="err" className="flex items-center gap-2 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
          <TriangleAlert className="size-4 shrink-0" aria-hidden />
          No se ha podido generar el enlace al archivo ({a.archivo_nombre}).
        </p>,
      );
    } else if (mime.startsWith('image/')) {
      const alt = a.archivo_nombre ?? a.titulo;
      partes.push(
        <div key="img">
          <button
            type="button"
            onClick={() => setZoom(true)}
            className="group relative block w-full overflow-hidden rounded-lg border bg-fd-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
            aria-label={`Ampliar imagen ${alt}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={a.archivoUrl} alt={alt} loading="lazy" className="mx-auto max-h-80 w-auto object-contain" />
            <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
              <ZoomIn className="size-3.5" aria-hidden /> Ampliar
            </span>
          </button>
          <Lightbox src={a.archivoUrl} alt={alt} abierto={zoom} onCerrar={() => setZoom(false)} />
        </div>,
      );
    } else if (mime.startsWith('video/')) {
      partes.push(
        <video key="video" src={a.archivoUrl} controls preload="metadata" className="max-h-96 w-full rounded-lg border bg-black">
          Tu navegador no puede reproducir este vídeo.
        </video>,
      );
    }

    if (a.archivoUrl) {
      const Icono = mime.includes('zip') ? FileArchive : FileText;
      partes.push(
        <div key="file" className="flex flex-wrap items-center gap-3 rounded-lg border bg-fd-background p-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-fd-muted text-fd-muted-foreground">
            <Icono className="size-4" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium" title={a.archivo_nombre ?? undefined}>
              {a.archivo_nombre}
            </span>
            <span className="block text-xs text-fd-muted-foreground">
              {formatBytes(a.archivo_bytes)} · {mime || 'desconocido'}
            </span>
          </span>
          <span className="flex gap-2">
            {(mime === 'application/pdf' || mime.startsWith('text/')) && (
              <a href={a.archivoUrl} target="_blank" rel="noopener noreferrer" className={enlaceBoton}>
                <ExternalLink className="size-4" aria-hidden /> Abrir
              </a>
            )}
            {a.descargaUrl && (
              <a href={a.descargaUrl} className={enlaceBoton}>
                <Download className="size-4" aria-hidden /> Descargar
              </a>
            )}
          </span>
        </div>,
      );
    }
  }

  if (a.enlace) {
    partes.push(yt ? <YouTube key="yt" id={yt} url={a.enlace} /> : <EnlaceExterno key="link" url={a.enlace} />);
  }

  if (!partes.length) return null;
  return <div className="space-y-2">{partes}</div>;
}
