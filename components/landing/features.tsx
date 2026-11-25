import { BookOpenText, Bot, ChartNoAxesColumnIncreasing, ListChecks, Upload } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Reveal } from './reveal';

interface Feature {
  titulo: string;
  texto: string;
  icono: ReactNode;
  clase?: string;
  acento: string;
}

const FEATURES: Feature[] = [
  {
    titulo: 'Apuntes interactivos',
    texto: 'Teoría clara, ejemplos de código que puedes copiar y diagramas. Con buscador instantáneo (pulsa ⌘K o Ctrl K).',
    icono: <BookOpenText />,
    clase: 'sm:col-span-2 lg:col-span-2',
    acento: 'from-brand-indigo/25',
  },
  {
    titulo: 'Tests y flashcards',
    texto: 'Comprueba lo que sabes al final de cada tema y repasa conceptos clave en segundos.',
    icono: <ListChecks />,
    acento: 'from-brand-violet/25',
  },
  {
    titulo: 'Tutor IA 24/7',
    texto: 'Pregúntale dudas a cualquier hora. Responde basándose en los apuntes de clase.',
    icono: <Bot />,
    acento: 'from-brand-cyan/30',
  },
  {
    titulo: 'Aporta recursos',
    texto: 'Sube capturas, vídeos, enlaces o documentos de clase. Se revisan y se suman a los apuntes.',
    icono: <Upload />,
    clase: 'sm:col-span-2 lg:col-span-2',
    acento: 'from-brand-violet/20',
  },
  {
    titulo: 'Tu progreso',
    texto: 'Marca temas como completados y retoma justo donde lo dejaste. Se guarda en tu navegador.',
    icono: <ChartNoAxesColumnIncreasing />,
    clase: 'sm:col-span-2 lg:col-span-2',
    acento: 'from-brand-cyan/20',
  },
];

export function Features() {
  return (
    <section aria-labelledby="features-titulo" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold text-fd-primary">Hecho para estudiar</p>
        <h2 id="features-titulo" className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Menos buscar, más aprender
        </h2>
        <p className="mt-3 text-pretty text-fd-muted-foreground">
          Todo lo que necesitas para sacar el ciclo adelante, sin saltar entre diez sitios distintos.
        </p>
      </Reveal>

      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f, i) => (
          <li key={f.titulo} className={cn(f.clase, i === 0 && 'lg:row-span-1')}>
            <Reveal delay={i * 0.06} className="h-full">
              <div className="group relative h-full overflow-hidden rounded-2xl border bg-fd-card p-6 transition-colors hover:border-fd-primary/30">
                <div
                  aria-hidden
                  className={cn(
                    'pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-gradient-to-br to-transparent opacity-60 blur-2xl transition-opacity group-hover:opacity-100',
                    f.acento,
                  )}
                />
                <span className="relative inline-flex size-10 items-center justify-center rounded-xl border bg-fd-background text-fd-primary shadow-sm [&_svg]:size-5">
                  {f.icono}
                </span>
                <h3 className="relative mt-5 font-semibold">{f.titulo}</h3>
                <p className="relative mt-1.5 text-sm leading-relaxed text-fd-muted-foreground">{f.texto}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
