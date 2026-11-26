import type { ReactNode } from 'react';
import { indexarHijos } from './hijos';
import { FlujoCliente, Mensaje, type MensajeMeta } from './flujo-cliente';

export interface FlujoProps {
  /** Participantes, en orden: ["Pantalla", "ViewModel", "Repositorio", "Retrofit", "API"]. Hasta 7 caben en fila. */
  nodos: string[];
  /** Título del bloque: "Cargar la lista de tareas". */
  titulo?: string;
  /** Milisegundos entre pasos al reproducir. Por defecto 2800. */
  intervalo?: number;
  /** Hijos <Mensaje de="…" a="…" titulo="…">explicación</Mensaje>, en orden. */
  children?: ReactNode;
}

/**
 * Diagrama de secuencia animado. Componente de servidor: lee los <Mensaje> en
 * orden y el cliente (flujo-cliente.tsx) dibuja y anima.
 */
export function Flujo({ nodos, titulo, intervalo = 2800, children }: FlujoProps) {
  const { hijos, props } = indexarHijos<MensajeMeta>(
    children,
    (h) => h.type === Mensaje || ('de' in h.props && 'a' in h.props),
  );
  const mensajes = props.map((p) => ({ de: p.de, a: p.a, titulo: p.titulo, tipo: p.tipo }));
  return (
    <FlujoCliente
      nodos={Array.isArray(nodos) ? nodos.map(String) : []}
      titulo={titulo}
      intervalo={Math.max(800, Number(intervalo) || 2800)}
      mensajes={mensajes}
    >
      {hijos}
    </FlujoCliente>
  );
}

export { Mensaje };
