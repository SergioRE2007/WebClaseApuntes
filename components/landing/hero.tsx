'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, Bot, Sparkles } from 'lucide-react';
import { abrirChat } from '@/components/chat/abrir-chat';
import { cn } from '@/lib/cn';
import { HeroMock } from './hero-mock';
import { ctaPrimario, ctaSecundario } from './estilos';

export interface HeroProps {
  /** Hay sesión iniciada. */
  logueado: boolean;
  /** Es miembro de la clase (tiene el chat montado). */
  enClase: boolean;
  nombre: string | null;
  totalPaginas: number;
  totalModulos: number;
}

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero({ logueado, enClase, nombre, totalPaginas, totalModulos }: HeroProps) {
  const primerNombre = nombre?.trim().split(/\s+/)[0];

  return (
    <section className="relative isolate overflow-hidden">
      <HeroFondo />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pt-14 pb-16 sm:px-6 sm:pt-20 md:pb-24 lg:grid-cols-[1.1fr_1fr] lg:gap-10 lg:pt-24">
        <div className="text-center lg:text-start">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border bg-fd-card/70 px-3 py-1 text-xs font-medium text-fd-muted-foreground backdrop-blur">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60 motion-reduce:hidden" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              {primerNombre ? `Hola, ${primerNombre} · ` : ''}Desarrollo de Aplicaciones Multiplataforma
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease }}
            className="mt-6 text-[2.6rem] leading-[1.05] font-semibold tracking-[-0.035em] text-balance sm:text-6xl lg:text-[4.25rem]"
          >
            Todo DAM,{' '}
            <span className="text-gradient">en un solo sitio</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease }}
            className="mx-auto mt-5 max-w-xl text-base text-pretty text-fd-muted-foreground sm:text-lg lg:mx-0"
          >
            Los apuntes de clase de 2º (y de 1º para repasar), con tests, flashcards y un tutor IA que se los sabe de memoria.
            Estudia a tu ritmo y no pierdas el hilo de ningún módulo.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease }}
            className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center lg:justify-start"
          >
            <Link href="/docs" className={ctaPrimario}>
              {logueado ? 'Ir a mis apuntes' : 'Empezar a estudiar'}
              <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            {enClase ? (
              <button type="button" onClick={() => abrirChat()} className={ctaSecundario}>
                <Bot aria-hidden className="size-4 text-fd-primary" />
                Preguntar al Tutor IA
              </button>
            ) : (
              <Link href={logueado ? '/unirse?next=/' : '/login?next=/'} className={ctaSecundario}>
                <Bot aria-hidden className="size-4 text-fd-primary" />
                Preguntar al Tutor IA
              </Link>
            )}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-5 text-sm text-fd-muted-foreground"
          >
            {logueado ? (
              <>
                <Sparkles aria-hidden className="me-1 inline size-3.5 -translate-y-px text-fd-primary" />
                {totalModulos > 0
                  ? `${totalModulos} ${totalModulos === 1 ? 'módulo' : 'módulos'}${
                      totalPaginas > 0 ? ` y ${totalPaginas} ${totalPaginas === 1 ? 'tema' : 'temas'} esperándote.` : ': los temas van llegando.'
                    }`
                  : 'Los apuntes se están cargando: vuelve pronto.'}
              </>
            ) : (
              <>
                ¿Ya eres de la clase?{' '}
                <Link
                  href="/login"
                  className="font-medium text-fd-foreground underline decoration-fd-primary/40 underline-offset-4 hover:decoration-fd-primary"
                >
                  Entrar
                </Link>
              </>
            )}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15, ease }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          <HeroMock />
        </motion.div>
      </div>
    </section>
  );
}

/** Aurora + rejilla, solo en la landing. */
function HeroFondo() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_40%,transparent_100%)]" />
      <div
        className={cn(
          'animate-aurora absolute -top-40 left-1/2 h-[36rem] w-[56rem] max-w-[160vw] -translate-x-1/2 rounded-full opacity-90 blur-3xl',
          'bg-[radial-gradient(closest-side,var(--dam-glow-1),transparent),radial-gradient(closest-side_at_80%_60%,var(--dam-glow-2),transparent)]',
        )}
      />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-fd-background" />
    </div>
  );
}
