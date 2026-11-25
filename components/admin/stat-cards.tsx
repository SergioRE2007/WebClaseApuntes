import Link from 'next/link';
import { cn } from '@/lib/cn';
import type { Stats } from './datos';

interface Tarjeta {
  label: string;
  valor: number;
  href?: string;
  pista?: string;
}

export function StatCards({ stats }: { stats: Stats }) {
  const tarjetas: Tarjeta[] = [
    {
      label: 'Pendientes',
      valor: stats.pendiente,
      href: '/admin?estado=pendiente#aportaciones',
      pista: stats.pendiente ? 'Por revisar' : 'Todo al día',
    },
    {
      label: 'Aprobadas',
      valor: stats.aprobada,
      href: '/admin?estado=aprobada#aportaciones',
    },
    {
      label: 'Descartadas',
      valor: stats.descartada,
      href: '/admin?estado=descartada#aportaciones',
    },
    {
      label: 'Alumnos',
      valor: stats.alumnos,
      href: '#alumnos',
      pista: 'En la clase',
    },
    {
      label: 'Chat hoy',
      valor: stats.mensajesHoy,
      pista: 'Mensajes (hora de Madrid)',
    },
  ];

  return (
    <ul className="grid grid-cols-2 divide-fd-border overflow-hidden rounded-md border sm:grid-cols-5 sm:divide-x">
      {tarjetas.map((t, i) => {
        const contenido = (
          <>
            <span className="text-xs font-medium text-fd-muted-foreground">{t.label}</span>
            <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">{t.valor.toLocaleString('es-ES')}</p>
            {t.pista && <p className="mt-0.5 truncate text-xs text-fd-muted-foreground">{t.pista}</p>}
          </>
        );
        const clase = 'block h-full p-4';
        return (
          <li
            key={t.label}
            className={cn('border-fd-border max-sm:border-b max-sm:odd:border-r', i === tarjetas.length - 1 && 'col-span-2 max-sm:border-b-0 sm:col-span-1')}
          >
            {t.href ? (
              <Link
                href={t.href}
                className={cn(clase, 'transition-colors hover:bg-fd-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fd-ring')}
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
