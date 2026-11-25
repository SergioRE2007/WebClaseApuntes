'use client';

import { useEffect, useId, useState } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'motion/react';
import { AlertTriangle, Maximize2, X } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface MermaidProps {
  /** Definición del diagrama (usa una plantilla: chart={`classDiagram ...`}). */
  chart: string;
  /** Pie de figura opcional. */
  titulo?: string;
  className?: string;
}

type MermaidApi = typeof import('mermaid').default;
let cargaMermaid: Promise<MermaidApi> | null = null;
function cargarMermaid() {
  cargaMermaid ??= import('mermaid').then((m) => m.default);
  return cargaMermaid;
}

// Mermaid usa configuración global: serializamos los renders para que no se pisen.
let cola: Promise<unknown> = Promise.resolve();
function enCola<T>(tarea: () => Promise<T>): Promise<T> {
  const r = cola.then(tarea, tarea);
  cola = r.catch(() => undefined);
  return r;
}

/** Quita la indentación común (cómodo al escribir el diagrama dentro de MDX). */
function desindentar(texto: string) {
  const lineas = texto.replace(/^\n+|\s+$/g, '').split('\n');
  const sangria = Math.min(
    ...lineas.filter((l) => l.trim()).map((l) => l.match(/^\s*/)?.[0].length ?? 0),
  );
  return lineas.map((l) => l.slice(Number.isFinite(sangria) ? sangria : 0)).join('\n');
}

export function Mermaid({ chart, titulo, className }: MermaidProps) {
  const idBase = useId().replace(/[^a-zA-Z0-9]/g, '');
  const { resolvedTheme } = useTheme();
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ampliado, setAmpliado] = useState(false);

  useEffect(() => {
    let cancelado = false;
    const oscuro =
      resolvedTheme === 'dark' ||
      (!resolvedTheme && document.documentElement.classList.contains('dark'));

    enCola(async () => {
      const mermaid = await cargarMermaid();
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        // Tema 'base' para que apliquen las variables: nodos planos con borde de 1px, sin sombras.
        theme: 'base',
        fontFamily: 'inherit',
        themeCSS:
          '.node rect,.node circle,.node polygon,.node path,rect.basic,g.classGroup rect{filter:none!important}' +
          '.edgeLabel,.edgeLabel p{color:currentColor}',
        themeVariables: {
          fontSize: '14px',
          ...(oscuro
            ? {
                darkMode: true,
                background: '#0a0a0b',
                primaryColor: '#0a0a0b',
                secondaryColor: '#18181b',
                tertiaryColor: '#111113',
                primaryBorderColor: '#3f3f46',
                secondaryBorderColor: '#3f3f46',
                tertiaryBorderColor: '#3f3f46',
                lineColor: '#a1a1aa',
                primaryTextColor: '#ededef',
                secondaryTextColor: '#ededef',
                tertiaryTextColor: '#ededef',
                textColor: '#ededef',
                edgeLabelBackground: '#0a0a0b',
                clusterBkg: '#111113',
                clusterBorder: '#3f3f46',
              }
            : {
                background: '#ffffff',
                primaryColor: '#ffffff',
                secondaryColor: '#f4f4f5',
                tertiaryColor: '#fafafa',
                primaryBorderColor: '#d4d4d8',
                secondaryBorderColor: '#d4d4d8',
                tertiaryBorderColor: '#d4d4d8',
                lineColor: '#71717a',
                primaryTextColor: '#18181b',
                secondaryTextColor: '#18181b',
                tertiaryTextColor: '#18181b',
                textColor: '#18181b',
                edgeLabelBackground: '#ffffff',
                clusterBkg: '#fafafa',
                clusterBorder: '#d4d4d8',
              }),
        },
      });
      const id = `mermaid-${idBase}-${Math.random().toString(36).slice(2, 8)}`;
      try {
        const { svg } = await mermaid.render(id, desindentar(chart));
        return { svg };
      } finally {
        // Mermaid deja nodos temporales en <body> si falla.
        document.getElementById(id)?.remove();
        document.getElementById(`d${id}`)?.remove();
      }
    })
      .then(({ svg }) => {
        if (cancelado) return;
        setSvg(svg);
        setError(null);
      })
      .catch((e: unknown) => {
        if (cancelado) return;
        setError(e instanceof Error ? e.message : String(e));
      });

    return () => {
      cancelado = true;
    };
  }, [chart, resolvedTheme, idBase]);

  useEffect(() => {
    if (!ampliado) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setAmpliado(false);
    window.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [ampliado]);

  if (error) {
    return (
      <div role="alert" className={cn('not-prose my-6 rounded-lg border border-red-600/25 bg-red-600/[0.04] p-4 dark:border-red-400/25', className)}>
        <p className="flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-400">
          <AlertTriangle className="size-4" aria-hidden />
          No se ha podido dibujar el diagrama
        </p>
        <p className="mt-1 text-xs text-fd-muted-foreground">{error.split('\n')[0]}</p>
        <pre className="mt-3 max-h-64 overflow-auto rounded-md bg-fd-muted p-3 font-mono text-xs">{desindentar(chart)}</pre>
      </div>
    );
  }

  return (
    <figure className={cn('not-prose group relative my-6', className)}>
      <div
        className="relative flex min-h-32 items-center justify-center overflow-x-auto rounded-lg border bg-fd-background p-4"
        aria-busy={!svg}
      >
        {svg ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            role="img"
            aria-label={titulo ?? 'Diagrama'}
            className="w-full [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <div className="flex w-full flex-col items-center gap-2 py-6" aria-label="Cargando diagrama">
            <div className="h-24 w-2/3 max-w-sm rounded-md bg-fd-muted/60" />
            <span className="text-xs text-fd-muted-foreground">Dibujando diagrama…</span>
          </div>
        )}
        {svg && (
          <button
            type="button"
            onClick={() => setAmpliado(true)}
            aria-label="Ampliar diagrama"
            className="absolute right-2 top-2 rounded-md border bg-fd-background p-2.5 sm:p-1.5 text-fd-muted-foreground opacity-100 transition hover:text-fd-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
          >
            <Maximize2 className="size-4" />
          </button>
        )}
      </div>
      {titulo && <figcaption className="mt-2 text-center text-xs text-fd-muted-foreground">{titulo}</figcaption>}

      {ampliado && svg && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={titulo ?? 'Diagrama ampliado'}
          className="fixed inset-0 z-50 flex items-center justify-center bg-fd-background/95 p-4"
          onClick={() => setAmpliado(false)}
        >
          <button
            type="button"
            autoFocus
            onClick={() => setAmpliado(false)}
            aria-label="Cerrar"
            className="absolute right-4 top-4 rounded-md border bg-fd-background p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
          >
            <X className="size-5" />
          </button>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="max-h-full w-full max-w-5xl overflow-auto rounded-lg border bg-fd-background p-4 [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:w-full [&_svg]:max-w-none"
            onClick={(e) => e.stopPropagation()}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </div>
      )}
    </figure>
  );
}
