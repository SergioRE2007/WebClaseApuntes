import type { Metadata } from 'next';
import { getPerfil, type Perfil } from '@/lib/auth';
import { CURSO_ACTUAL } from '@/lib/shared';
import { getCursos, getTitulos } from '@/components/landing/cursos';
import { Hero } from '@/components/landing/hero';
import { Indice } from '@/components/landing/indice';
import { Continua } from '@/components/landing/continua';
import { ComoUsar } from '@/components/landing/como-usar';
import { Footer } from '@/components/landing/footer';

export const metadata: Metadata = {
  title: { absolute: 'DAM Apuntes' },
};

export default async function HomePage() {
  let perfil: Perfil | null = null;
  try {
    perfil = await getPerfil();
  } catch {
    perfil = null;
  }

  const cursos = getCursos();
  const titulos = getTitulos();
  // Portada real del curso actual (sale del árbol de apuntes); si no se detecta, la ruta por convenio.
  const cursoActual = cursos.find((c) => c.numero === CURSO_ACTUAL);
  const urlCurso = cursoActual?.url ?? cursoActual?.modulos[0]?.url ?? `/docs/${CURSO_ACTUAL}-dam`;

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-5xl px-4 pt-12 pb-20 sm:px-6 sm:pt-16">
        <div className="grid items-start gap-8 md:grid-cols-[minmax(0,1fr)_17rem] lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-12">
          <Hero
            logueado={Boolean(perfil)}
            enClase={Boolean(perfil?.clase_ok)}
            urlCurso={urlCurso}
            curso={`${CURSO_ACTUAL}º`}
          />
          <ComoUsar />
        </div>
        <Continua
          cursos={cursos.map((c) => ({ id: c.id, nombre: c.nombre, numero: c.numero, paginas: c.paginas }))}
          titulos={titulos}
        />
        {/* Solo datos planos al componente cliente (sin los iconos, que son JSX). */}
        <Indice
          cursos={cursos.map((c) => ({
            id: c.id,
            nombre: c.nombre,
            url: c.url,
            paginas: c.paginas,
            modulos: c.modulos.map((m) => ({
              id: m.id,
              nombre: m.nombre,
              descripcion: m.descripcion,
              url: m.url,
              paginas: m.paginas,
            })),
          }))}
        />
      </div>
      <Footer logueado={Boolean(perfil)} />
    </div>
  );
}
