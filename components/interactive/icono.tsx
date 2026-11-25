import { icons, type LucideProps } from 'lucide-react';
import { Card as FdCard, Cards as FdCards, type CardProps } from 'fumadocs-ui/components/card';
import { cn } from '@/lib/cn';
import type { ComponentProps, ReactNode } from 'react';

export interface IconoProps extends LucideProps {
  /** Nombre del icono de Lucide en PascalCase, p. ej. "Code", "Database" (https://lucide.dev/icons). */
  nombre: string;
}

/** Icono de Lucide por nombre, utilizable desde MDX sin imports. */
export function Icono({ nombre, ...props }: IconoProps) {
  const Componente = icons[nombre as keyof typeof icons];
  if (!Componente) return null;
  return <Componente aria-hidden {...props} />;
}

/**
 * <Card> de Fumadocs. Acepta `icon` (nombre de Lucide) por compatibilidad con
 * el contenido existente, pero no lo pinta: filas con título y texto, separadas por una línea.
 *   <Card icon="Code" title="Programación" href="/docs/1-dam/programacion" />
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Card({ icon, className, ...props }: Omit<CardProps, 'icon'> & { icon?: ReactNode | string }) {
  return (
    <FdCard
      className={cn(
        'rounded-none border-0 border-b bg-transparent px-0 py-3 shadow-none hover:bg-transparent hover:[&_h3]:text-fd-primary [&_h3]:text-[15px] [&_h3]:transition-colors',
        className,
      )}
      {...props}
    />
  );
}

/** Rejilla de <Card>: lista a dos columnas con líneas finas, sin cajas. */
export function Cards({ className, ...props }: ComponentProps<typeof FdCards>) {
  return <FdCards className={cn('not-prose my-6 gap-x-8 gap-y-0 border-t', className)} {...props} />;
}
