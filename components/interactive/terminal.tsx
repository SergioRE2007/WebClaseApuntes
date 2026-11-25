'use client';

import { isValidElement, useState, type ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface TerminalProps {
  /** Título de la ventana (p. ej. "bash", "PowerShell", "mysql"). */
  titulo?: string;
  /**
   * Prompt que identifica las líneas de comando. Por defecto se reconocen
   * `$ `, `> `, `PS> `, `C:\…> `, `mysql> ` (y su continuación `-> `), `sql> ` y `jshell> `.
   */
  prompt?: string;
  /** Contenido: un string (usa {`...`}) con una línea por renglón. */
  children?: ReactNode;
  /** Alternativa a children. */
  contenido?: string;
}

const PROMPTS = [/^\$ /, /^> /, /^PS[^>]*> /, /^[A-Z]:\\[^>]*> /, /^mysql> /, /^sql> /, /^jshell> /, /^\s+-> /, /^[\w.-]+@[\w.-]+:[^$#]*[$#] /];

function textoDe(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textoDe).join('');
  if (isValidElement<{ children?: ReactNode }>(node)) {
    const t = textoDe(node.props.children);
    return node.type === 'p' ? `${t}\n` : t;
  }
  return '';
}

function desindentar(texto: string) {
  const lineas = texto.replace(/^\n+|\s+$/g, '').split('\n');
  const sangria = Math.min(...lineas.filter((l) => l.trim()).map((l) => l.match(/^\s*/)?.[0].length ?? 0));
  return Number.isFinite(sangria) && sangria > 0 ? lineas.map((l) => l.slice(sangria)) : lineas;
}

export function Terminal({ titulo = 'Terminal', prompt, children, contenido }: TerminalProps) {
  const [copiado, setCopiado] = useState(false);
  const lineas = desindentar(contenido ?? textoDe(children));

  const analizadas = lineas.map((l) => {
    if (prompt) {
      const p = prompt.endsWith(' ') ? prompt : `${prompt} `;
      if (l.startsWith(p)) return { tipo: 'cmd' as const, prompt: p.trimEnd(), texto: l.slice(p.length) };
      return { tipo: 'out' as const, texto: l };
    }
    for (const re of PROMPTS) {
      const m = l.match(re);
      if (m) return { tipo: 'cmd' as const, prompt: m[0].trimEnd(), texto: l.slice(m[0].length) };
    }
    return { tipo: 'out' as const, texto: l };
  });

  const comandos = analizadas.filter((l) => l.tipo === 'cmd').map((l) => l.texto);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText((comandos.length ? comandos : lineas).join('\n'));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1600);
    } catch {
      // Portapapeles no disponible
    }
  };

  return (
    <figure className="not-prose my-6 overflow-hidden rounded-lg border bg-fd-muted/40 text-fd-foreground dark:bg-fd-muted/50">
      <div className="flex items-center gap-2 border-b px-3 py-1.5">
        <figcaption className="flex-1 truncate font-mono text-xs text-fd-muted-foreground">{titulo}</figcaption>
        <button
          type="button"
          onClick={copiar}
          aria-label={copiado ? 'Copiado' : comandos.length ? 'Copiar comandos' : 'Copiar salida'}
          title={comandos.length ? 'Copiar comandos' : 'Copiar'}
          className="rounded-md p-2.5 text-fd-muted-foreground transition-colors hover:bg-fd-accent sm:p-1 hover:text-fd-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
        >
          {copiado ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-3 font-mono text-[13px] leading-6">
        <code>
          {analizadas.map((l, i) => (
            <span key={i} className={cn('block min-h-6 whitespace-pre', l.tipo === 'out' && 'text-fd-muted-foreground')}>
              {l.tipo === 'cmd' ? (
                <>
                  <span className="select-none text-fd-muted-foreground">{l.prompt} </span>
                  <span className="text-fd-foreground">{l.texto}</span>
                </>
              ) : (
                l.texto || ' '
              )}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}
