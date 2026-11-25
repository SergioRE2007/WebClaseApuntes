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
      <div className="mx-auto w-full max-w-3xl px-4 pt-14 pb-20 sm:px-6 sm:pt-20">
        <Hero
          logueado={Boolean(perfil)}
          enClase={Boolean(perfil?.clase_ok)}
          urlCurso={urlCurso}
          curso={`${CURSO_ACTUAL}º`}
        />
        <Continua
          cursos={cursos.map((c) => ({ id: c.id, nombre: c.nombre, numero: c.numero, paginas: c.paginas }))}
          titulos={titulos}
        />
        <Indice cursos={cursos} />
        <ComoUsar />
      </div>
      <Footer logueado={Boolean(perfil)} />
    </div>
  );
}
