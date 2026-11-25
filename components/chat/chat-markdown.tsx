'use client';

import { memo, type ComponentProps, type ReactNode } from 'react';
import Link from 'next/link';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ChatMarkdownProps {
  texto: string;
  /** Mientras llega el texto se evita el resaltado (re-render constante). */
  enStreaming?: boolean;
  /** Se llama al pulsar un enlace interno (para cerrar el panel en móvil). */
  onNavegar?: () => void;
}

function textoDe(nodo: ReactNode): string {
  if (nodo == null || typeof nodo === 'boolean') return '';
  if (typeof nodo === 'string' || typeof nodo === 'number') return String(nodo);
  if (Array.isArray(nodo)) return nodo.map(textoDe).join('');
  if (typeof nodo === 'object' && 'props' in nodo) {
    return textoDe((nodo.props as { children?: ReactNode }).children);
  }
  return '';
}

function esInterno(href: string) {
  return href.startsWith('/') && !href.startsWith('//');
}

function crearComponentes(enStreaming: boolean, onNavegar?: () => void): Components {
  return {
    a({ href = '', children, node: _node, ...rest }) {
      const clase =
        'text-fd-primary underline decoration-fd-primary/40 underline-offset-2 hover:decoration-fd-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring rounded-sm';
      if (esInterno(href) || href.startsWith('#')) {
        return (
          <Link href={href} className={clase} onClick={() => onNavegar?.()}>
            {children}
          </Link>
        );
      }
      if (!/^(https?:|mailto:)/i.test(href)) return <span>{children}</span>;
      return (
        <a {...rest} href={href} target="_blank" rel="noopener noreferrer" className={cn(clase, 'inline-flex items-center gap-0.5')}>
          {children}
          <ExternalLink aria-hidden className="size-3 shrink-0" />
          <span className="sr-only"> (se abre en otra pestaña)</span>
        </a>
      );
    },
    pre({ children }) {
      const hijo = Array.isArray(children) ? children[0] : children;
      const props = (hijo && typeof hijo === 'object' && 'props' in hijo ? hijo.props : {}) as {
        className?: string;
        children?: ReactNode;
      };
      const lang = /language-([\w+#-]+)/.exec(props.className ?? '')?.[1]?.toLowerCase() ?? 'text';
      const code = textoDe(props.children).replace(/\n$/, '');
      const titulo = lang !== 'text' ? lang : undefined;
      if (enStreaming) {
        // Mientras llega el texto: la misma caja que el bloque final de Fumadocs
        // (borde, radio, barra de título y márgenes), sin resaltado, para que
        // no salte al terminar.
        return (
          <div className="my-2">
            <figure className="not-prose relative overflow-hidden rounded-xl border bg-fd-card text-sm">
              {titulo && (
                <div className="flex h-9.5 items-center border-b px-4 text-fd-muted-foreground">
                  <span className="truncate">{titulo}</span>
                </div>
              )}
              <pre className="max-h-[600px] overflow-auto px-4 py-3.5 font-mono text-[0.8125rem]">
                <code>{code}</code>
              </pre>
            </figure>
          </div>
        );
      }
      return (
        <div className="my-2 [&_figure]:my-0">
          <DynamicCodeBlock lang={lang} code={code} codeblock={{ title: titulo }} />
        </div>
      );
    },
    code({ className, children, node: _node, ...rest }) {
      return (
        <code
          {...rest}
          className={cn('rounded border bg-fd-muted px-1 py-px font-mono text-[0.85em]', className)}
        >
          {children}
        </code>
      );
    },
    table({ children }) {
      return (
        <div className="my-2 overflow-x-auto rounded-md border">
          <table className="w-full border-collapse text-left text-[13px] [&_tr:last-child>td]:border-b-0">{children}</table>
        </div>
      );
    },
    th({ children, node: _node, ...rest }: ComponentProps<'th'> & { node?: unknown }) {
      return (
        <th {...rest} className="border-b bg-fd-muted px-2 py-1.5 font-semibold">
          {children}
        </th>
      );
    },
    td({ children, node: _node, ...rest }: ComponentProps<'td'> & { node?: unknown }) {
      return (
        <td {...rest} className="border-b px-2 py-1.5 align-top">
          {children}
        </td>
      );
    },
  };
}

export const ChatMarkdown = memo(function ChatMarkdown({ texto, enStreaming = false, onNavegar }: ChatMarkdownProps) {
  return (
    <div
      className={cn(
        'min-w-0 break-words text-sm leading-relaxed',
        // Sin margen arriba/abajo en el primer y último bloque (aunque sea un título o una lista).
        // (y, como antes, el primer/último párrafo dentro de citas u otros bloques).
        '[&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&>:first-child]:mt-0 [&>:last-child]:mb-0',
        '[&_ul]:my-2 [&_ul]:list-disc [&_ul]:ps-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:ps-5 [&_li]:my-0.5',
        // Listas "sueltas" (con líneas en blanco): el <p> de cada punto no añade hueco extra.
        '[&_li>p]:my-0 [&_li_ul]:my-1 [&_li_ol]:my-1',
        '[&_h1]:mt-3 [&_h1]:mb-1.5 [&_h1]:text-base [&_h1]:font-semibold',
        '[&_h2]:mt-3 [&_h2]:mb-1.5 [&_h2]:text-[15px] [&_h2]:font-semibold',
        '[&_h3]:mt-2.5 [&_h3]:mb-1 [&_h3]:text-sm [&_h3]:font-semibold',
        '[&_blockquote]:my-2 [&_blockquote]:border-s-2 [&_blockquote]:ps-3 [&_blockquote]:text-fd-muted-foreground',
        '[&_hr]:my-3 [&_strong]:font-semibold',
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={crearComponentes(enStreaming, onNavegar)}>
        {texto}
      </ReactMarkdown>
    </div>
  );
});
