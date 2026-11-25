import { icons, type LucideProps } from 'lucide-react';
import { Card as FdCard, type CardProps } from 'fumadocs-ui/components/card';
import type { ReactNode } from 'react';

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
 * <Card> de Fumadocs que además acepta `icon` como nombre de Lucide:
 *   <Card icon="Code" title="Programación" href="/docs/1-dam/programacion" />
 */
export function Card({ icon, ...props }: Omit<CardProps, 'icon'> & { icon?: ReactNode | string }) {
  return <FdCard icon={typeof icon === 'string' ? <Icono nombre={icon} /> : icon} {...props} />;
}
