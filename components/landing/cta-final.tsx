import Link from 'next/link';
import { ArrowRight, Upload } from 'lucide-react';
import { ctaPrimario, ctaSecundario } from './estilos';
import { Reveal } from './reveal';

export function CtaFinal({ logueado }: { logueado: boolean }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 md:pb-28">
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-3xl border bg-fd-card px-6 py-12 text-center sm:px-12 sm:py-16">
          <div
            aria-hidden
            className="bg-dots absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,#000_20%,transparent_75%)]"
          />
          <div
            aria-hidden
            className="absolute -bottom-32 left-1/2 -z-10 h-64 w-[40rem] max-w-[150%] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--dam-glow-1),transparent)] blur-2xl"
          />
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Los apuntes los hacemos <span className="text-gradient">entre todos</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-pretty text-fd-muted-foreground">
            ¿Tienes una captura de la pizarra, un vídeo que lo explica genial o tus propios resúmenes? Súbelo y ayuda a
            toda la clase.
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link href={logueado ? '/docs' : '/login'} className={ctaPrimario}>
              {logueado ? 'Ir a mis apuntes' : 'Entrar'}
              <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href="/aportar" className={ctaSecundario}>
              <Upload aria-hidden className="size-4 text-fd-primary" />
              Aportar un recurso
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
