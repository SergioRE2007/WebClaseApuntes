import { ExternalLink, Paperclip } from 'lucide-react';
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
      <p className="py-2 text-sm text-fd-muted-foreground">Aún no has enviado nada.</p>
    );
  }

  return (
    <ul className="divide-y divide-fd-border">
      {aportaciones.map((a) => {
        const info = TIPOS_INFO[a.tipo];
        const Icon = info?.icon ?? Paperclip;
        return (
          <li key={a.id} className="py-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0 text-fd-muted-foreground">
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
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    {a.archivo_nombre && (
                      <span className="inline-flex max-w-full items-center gap-1 text-fd-muted-foreground">
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
                        className="inline-flex max-w-full items-center gap-1 rounded-sm text-fd-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
                      >
                        <ExternalLink className="size-3 shrink-0" aria-hidden />
                        <span className="truncate">{a.enlace.replace(/^https?:\/\//, '')}</span>
                      </a>
                    )}
                  </div>
                )}
                {a.nota_admin && (
                  <div className="mt-3 flex gap-2 border-l-2 ps-3 text-sm">
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
