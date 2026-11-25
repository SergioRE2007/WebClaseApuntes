import { ExternalLink, Inbox, MessageSquareQuote, Paperclip } from 'lucide-react';
import {
  TIPOS_INFO,
  formatBytes,
  formatFecha,
  formatRelativo,
  type AportacionRow,
} from '@/lib/aportaciones';
import { EstadoBadge } from './ui';

export function MisAportaciones({
  aportaciones,
  nombresModulos,
}: {
  aportaciones: AportacionRow[];
  nombresModulos: Record<string, string>;
}) {
  if (aportaciones.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed p-8 text-center">
        <Inbox className="size-8 text-fd-muted-foreground" aria-hidden />
        <p className="font-medium">Aún no has enviado nada</p>
        <p className="max-w-sm text-sm text-fd-muted-foreground">
          Esa foto de la pizarra o ese vídeo que lo explica genial le vienen bien a toda la clase.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {aportaciones.map((a) => {
        const info = TIPOS_INFO[a.tipo];
        const Icon = info?.icon ?? Paperclip;
        return (
          <li key={a.id} className="rounded-xl border bg-fd-card p-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-fd-muted text-fd-muted-foreground">
                <Icon className="size-4" aria-hidden />
                <span className="sr-only">{info?.label ?? a.tipo}</span>
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                  <h3 className="min-w-0 break-words font-medium leading-snug">{a.titulo}</h3>
                  <EstadoBadge estado={a.estado} />
                </div>
                <p className="mt-1 text-xs text-fd-muted-foreground">
                  {nombresModulos[a.modulo] ?? a.modulo}
                  {a.tema && ` · ${a.tema}`} ·{' '}
                  <time dateTime={a.creado_en} title={formatFecha(a.creado_en)} suppressHydrationWarning>
                    {formatRelativo(a.creado_en)}
                  </time>
                </p>
                {(a.archivo_nombre || a.enlace) && (
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {a.archivo_nombre && (
                      <span className="inline-flex max-w-full items-center gap-1 rounded-md bg-fd-muted px-2 py-1 text-fd-muted-foreground">
                        <Paperclip className="size-3 shrink-0" aria-hidden />
                        <span className="truncate">{a.archivo_nombre}</span>
                        {a.archivo_bytes != null && <span className="shrink-0">· {formatBytes(a.archivo_bytes)}</span>}
                      </span>
                    )}
                    {a.enlace && (
                      <a
                        href={a.enlace}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="inline-flex max-w-full items-center gap-1 rounded-md bg-fd-muted px-2 py-1 text-fd-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
                      >
                        <ExternalLink className="size-3 shrink-0" aria-hidden />
                        <span className="truncate">{a.enlace.replace(/^https?:\/\//, '')}</span>
                      </a>
                    )}
                  </div>
                )}
                {a.nota_admin && (
                  <div className="mt-3 flex gap-2 rounded-lg border-l-2 border-fd-primary bg-fd-muted/60 p-3 text-sm">
                    <MessageSquareQuote className="mt-0.5 size-4 shrink-0 text-fd-primary" aria-hidden />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-fd-muted-foreground">Nota de quien revisa</p>
                      <p className="whitespace-pre-wrap break-words">{a.nota_admin}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
