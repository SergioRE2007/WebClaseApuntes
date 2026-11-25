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
    <figure className="not-prose my-6 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-100 shadow-lg">
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-3 py-2">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </span>
        <figcaption className="flex-1 truncate text-center font-mono text-xs text-neutral-400">{titulo}</figcaption>
        <button
          type="button"
          onClick={copiar}
          aria-label={comandos.length ? 'Copiar comandos' : 'Copiar salida'}
          title={comandos.length ? 'Copiar comandos' : 'Copiar'}
          className="rounded-md p-1 text-neutral-400 transition hover:bg-white/10 hover:text-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
        >
          {copiado ? <Check className="size-3.5 text-green-400" /> : <Copy className="size-3.5" />}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-3 font-mono text-[13px] leading-6">
        <code>
          {analizadas.map((l, i) => (
            <span key={i} className={cn('block min-h-6 whitespace-pre', l.tipo === 'out' && 'text-neutral-300')}>
              {l.tipo === 'cmd' ? (
                <>
                  <span className="select-none text-green-400">{l.prompt} </span>
                  <span className="text-neutral-50">{l.texto}</span>
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
