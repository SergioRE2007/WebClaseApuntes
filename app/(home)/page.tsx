import type { Metadata } from 'next';
import { getPerfil, type Perfil } from '@/lib/auth';
import { getCursos, getTitulos } from '@/components/landing/cursos';
import { Hero } from '@/components/landing/hero';
import { Features } from '@/components/landing/features';
import { Modulos } from '@/components/landing/modulos';
import { Continua } from '@/components/landing/continua';
import { CtaFinal } from '@/components/landing/cta-final';
import { Footer } from '@/components/landing/footer';
import { MotionProvider } from '@/components/landing/reveal';

export const metadata: Metadata = {
  title: { absolute: 'DAM Apuntes · Todo DAM en un solo sitio' },
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
  const totalPaginas = new Set(cursos.flatMap((c) => c.paginas)).size;
  const totalModulos = cursos.reduce((n, c) => n + c.modulos.length, 0);

  return (
    <MotionProvider>
      <div className="flex flex-1 flex-col">
        <Hero
          logueado={Boolean(perfil)}
          enClase={Boolean(perfil?.clase_ok)}
          nombre={perfil?.nombre ?? null}
          totalPaginas={totalPaginas}
          totalModulos={totalModulos}
        />
        <Continua
          cursos={cursos.map((c) => ({ id: c.id, nombre: c.nombre, numero: c.numero, paginas: c.paginas }))}
          titulos={titulos}
        />
        <Modulos cursos={cursos} />
        <Features />
        <CtaFinal logueado={Boolean(perfil)} />
        <Footer logueado={Boolean(perfil)} />
      </div>
    </MotionProvider>
  );
}
