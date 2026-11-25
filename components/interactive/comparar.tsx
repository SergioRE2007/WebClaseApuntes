import type { ReactNode } from 'react';
import { indexarHijos } from './hijos';
import { CompararCliente, Lado, type LadoMeta } from './comparar-cliente';

export interface CompararProps {
  /** Título opcional del bloque (p. ej. "Proveer Room con Hilt"). */
  titulo?: string;
  /**
   * Si es true, en pantallas anchas los lados se ven en dos columnas y en móvil
   * con conmutador. Úsalo con código corto (líneas de menos de ~45 caracteres).
   * Por defecto, conmutador siempre.
   */
  columnas?: boolean;
  /** Dos o más <Lado>. */
  children: ReactNode;
}

/**
 * Comparación entre dos (o más) formas de hacer algo: la de clase y la buena,
 * o dos alternativas. Componente de servidor: lee los <Lado> en orden para que
 * el conmutador salga ya renderizado, y el resto lo hace el cliente.
 */
export function Comparar({ titulo, columnas = false, children }: CompararProps) {
  const { hijos, props } = indexarHijos<LadoMeta>(
    children,
    (h) => h.type === Lado || 'tipo' in h.props || 'titulo' in h.props,
  );
  const lados = props.map((p) => ({ titulo: p.titulo, tipo: p.tipo }));
  return (
    <CompararCliente titulo={titulo} columnas={columnas && lados.length === 2} lados={lados}>
      {hijos}
    </CompararCliente>
  );
}

export { Lado };
