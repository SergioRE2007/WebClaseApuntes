'use client';

import Link from 'next/link';
import { abrirChat } from '@/components/chat/abrir-chat';
import { botonPrimario, enlaceTexto } from './estilos';

export interface HeroProps {
  /** Hay sesión iniciada. */
  logueado: boolean;
  /** Es miembro de la clase (puede usar el tutor). */
  enClase: boolean;
  /** Ruta de los apuntes del curso actual. */
  urlCurso: string;
  /** Nombre corto del curso actual ("2º"). */
  curso: string;
}

export function Hero({ logueado, enClase, urlCurso, curso }: HeroProps) {
  return (
    <header>
      <h1 className="text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">Apuntes de {curso} de DAM</h1>
      <p className="mt-3 max-w-xl text-[17px] leading-relaxed text-fd-muted-foreground">
        Temas, ejercicios y tests de cada módulo. Si te atascas, pregunta al tutor.
      </p>
      <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link href={urlCurso} className={botonPrimario}>
          Ver apuntes de {curso}
        </Link>
        {enClase ? (
          <button type="button" onClick={() => abrirChat()} className={enlaceTexto}>
            Preguntar al tutor <span aria-hidden>→</span>
          </button>
        ) : (
          <Link href={logueado ? '/unirse?next=/' : '/login?next=/'} className={enlaceTexto}>
            Preguntar al tutor <span aria-hidden>→</span>
          </Link>
        )}
      </div>
    </header>
  );
}
