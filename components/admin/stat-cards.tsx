import Link from 'next/link';
import { CircleCheck, CircleX, Clock, MessageSquare, Users, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Stats } from './datos';

interface Tarjeta {
  label: string;
  valor: number;
  icon: LucideIcon;
  tono: string;
  href?: string;
  pista?: string;
}

export function StatCards({ stats }: { stats: Stats }) {
  const tarjetas: Tarjeta[] = [
    {
      label: 'Pendientes',
      valor: stats.pendiente,
      icon: Clock,
      tono: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
      href: '/admin?estado=pendiente#aportaciones',
      pista: stats.pendiente ? 'Por revisar' : 'Todo al día',
    },
    {
      label: 'Aprobadas',
      valor: stats.aprobada,
      icon: CircleCheck,
      tono: 'bg-green-500/15 text-green-600 dark:text-green-400',
      href: '/admin?estado=aprobada#aportaciones',
    },
    {
      label: 'Descartadas',
      valor: stats.descartada,
      icon: CircleX,
      tono: 'bg-red-500/15 text-red-600 dark:text-red-400',
      href: '/admin?estado=descartada#aportaciones',
    },
    {
      label: 'Alumnos',
      valor: stats.alumnos,
      icon: Users,
      tono: 'bg-fd-primary/10 text-fd-primary',
      href: '#alumnos',
      pista: 'En la clase',
    },
    {
      label: 'Chat hoy',
      valor: stats.mensajesHoy,
      icon: MessageSquare,
      tono: 'bg-fd-primary/10 text-fd-primary',
      pista: 'Mensajes (hora de Madrid)',
    },
  ];

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {tarjetas.map((t, i) => {
        const Icon = t.icon;
        const contenido = (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-fd-muted-foreground">{t.label}</span>
              <span className={cn('flex size-8 items-center justify-center rounded-lg', t.tono)}>
                <Icon className="size-4" aria-hidden />
              </span>
            </div>
            <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight">{t.valor.toLocaleString('es-ES')}</p>
            {t.pista && <p className="mt-0.5 truncate text-xs text-fd-muted-foreground">{t.pista}</p>}
          </>
        );
        const clase = 'block h-full rounded-xl border bg-fd-card p-4 transition';
        return (
          <li key={t.label} className={cn(i === tarjetas.length - 1 && 'col-span-2 sm:col-span-1')}>
            {t.href ? (
              <Link
                href={t.href}
                className={cn(
                  clase,
                  'hover:border-fd-primary/40 hover:bg-fd-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring',
                )}
              >
                {contenido}
              </Link>
            ) : (
              <div className={clase}>{contenido}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
