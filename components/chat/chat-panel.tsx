'use client';

import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { AlertCircle, ArrowDown, ArrowUp, RotateCcw, Square, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';
import { LIMITES } from '@/lib/ai/protocolo';
import { EVENTO_ABRIR_CHAT, type DetalleAbrirChat } from './abrir-chat';
import { ChatMarkdown } from './chat-markdown';
import { useChat, type MensajeUI } from './use-chat';
import { esPaginaDeAcceso, Lanzador, useAtajoChat } from './lanzador';

interface ChatPanelProps {
  nombre: string | null;
  /** false si el servidor no tiene ANTHROPIC_API_KEY. */
  disponible: boolean;
}

const MOVIL = '(max-width: 639px)';

function esMovil() {
  return typeof window !== 'undefined' && window.matchMedia(MOVIL).matches;
}

export function ChatPanel({ nombre, disponible }: ChatPanelProps) {
  const pathname = usePathname() ?? '/';
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;
  const getPagina = useCallback(() => pathnameRef.current, []);

  const { mensajes, restantes, enviando, enviar, reintentar, detener, limpiar } = useChat(getPagina);
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState('');
  const [pegadoAbajo, setPegadoAbajo] = useState(true);
  const reducir = useReducedMotion();

  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lanzadorRef = useRef<HTMLButtonElement>(null);
  const pegadoRef = useRef(true);
  const tituloId = useId();
  const ayudaId = useId();

  const atajo = useAtajoChat();

  const enDocs = pathname === '/docs' || pathname.startsWith('/docs/');
  const sugerencias: string[] = enDocs
    ? [
        'Explícame esta página más fácil',
        'Hazme 3 preguntas tipo test de esta página',
        '¿Dónde están los apuntes de bases de datos?',
        '¿Cómo envío una captura al profe?',
      ]
    : [
        '¿Dónde están los apuntes de bases de datos?',
        '¿Qué módulos hay en los apuntes?',
        '¿Cómo marco mi progreso en los temas?',
        '¿Cómo envío una captura al profe?',
      ];

  // ---------- abrir / cerrar ----------
  const cerrar = useCallback(() => {
    setAbierto(false);
    requestAnimationFrame(() => lanzadorRef.current?.focus());
  }, []);

  const abrir = useCallback(() => setAbierto(true), []);

  useEffect(() => {
    if (!abierto) return;
    const id = window.setTimeout(() => {
      const el = textareaRef.current;
      // Si el tutor no está disponible el textarea está deshabilitado: enfocamos
      // el panel para que Esc y el Tab sigan funcionando.
      if (el && !el.disabled) el.focus({ preventScroll: true });
      else panelRef.current?.focus({ preventScroll: true });
    }, 60);
    return () => window.clearTimeout(id);
  }, [abierto]);

  // Ctrl/⌘ + J alterna el chat
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setAbierto((v) => {
          if (v) requestAnimationFrame(() => lanzadorRef.current?.focus());
          return !v;
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // En móvil el panel ocupa toda la pantalla: es modal. Bloquea el scroll del
  // body y deja el resto de la página inerte para que el Tab no se escape.
  const [modal, setModal] = useState(false);
  useEffect(() => {
    if (!abierto || !esMovil()) {
      setModal(false);
      return;
    }
    setModal(true);
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const fondo = document.querySelector('#nd-docs-layout, #nd-home-layout');
    fondo?.setAttribute('inert', '');
    return () => {
      document.body.style.overflow = previo;
      fondo?.removeAttribute('inert');
    };
  }, [abierto]);

  // ---------- autosize del textarea ----------
  const ajustarAltura = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, []);
  useEffect(ajustarAltura, [texto, abierto, ajustarAltura]);

  // ---------- evento global para abrir con pregunta ----------
  const enviarRef = useRef(enviar);
  enviarRef.current = enviar;
  useEffect(() => {
    const onAbrir = (e: Event) => {
      const detalle = ((e as CustomEvent<DetalleAbrirChat>).detail ?? {}) as DetalleAbrirChat;
      setAbierto(true);
      const pregunta = detalle.pregunta?.trim();
      if (!pregunta) return;
      pegadoRef.current = true;
      if (detalle.enviar && enviarRef.current(pregunta)) {
        setTexto('');
      } else {
        setTexto(pregunta.slice(0, LIMITES.caracteres));
        requestAnimationFrame(() => {
          const el = textareaRef.current;
          if (el) {
            el.focus();
            el.setSelectionRange(el.value.length, el.value.length);
          }
        });
      }
    };
    window.addEventListener(EVENTO_ABRIR_CHAT, onAbrir);
    return () => window.removeEventListener(EVENTO_ABRIR_CHAT, onAbrir);
  }, []);

  // ---------- autoscroll que respeta al usuario ----------
  const irAbajo = useCallback((suave = false) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: suave && !reducir ? 'smooth' : 'auto' });
  }, [reducir]);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const abajo = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
    pegadoRef.current = abajo;
    setPegadoAbajo(abajo);
  }, []);

  useEffect(() => {
    if (abierto && pegadoRef.current && mensajes.length > 0) irAbajo();
  }, [mensajes, abierto, irAbajo]);

  // ---------- acciones ----------
  const mandar = (contenido: string) => {
    if (!contenido.trim() || enviando) return;
    pegadoRef.current = true;
    setPegadoAbajo(true);
    if (enviar(contenido)) setTexto('');
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    mandar(texto);
  };

  const onKeyDownTextarea = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      mandar(texto);
    }
  };

  // Esc cierra el panel (o detiene la respuesta) aunque el foco esté fuera de él.
  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      // Deja que otros diálogos abiertos (buscador, menús) gestionen su propio Esc.
      if (!panelRef.current?.contains(document.activeElement) && document.querySelector('[role="dialog"][data-state="open"]'))
        return;
      e.preventDefault();
      if (enviando) detener();
      else cerrar();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [abierto, enviando, cerrar, detener]);

  const borrar = () => {
    if (mensajes.length === 0) return;
    limpiar();
    setTexto('');
    toast.success('Conversación borrada');
    textareaRef.current?.focus();
  };

  const onNavegar = useCallback(() => {
    if (esMovil()) setAbierto(false);
  }, []);

  const ultimo = mensajes.at(-1);
  const puedeReintentar = !enviando && ultimo?.role === 'assistant' && (ultimo.estado === 'error' || ultimo.estado === 'detenido');
  const sinMensajes = restantes === 0;
  const caracteres = texto.length;
  const cercaLimite = caracteres > LIMITES.caracteres * 0.8;

  return (
    <>
      {/* ---------- Lanzador ---------- */}
      {!abierto && !esPaginaDeAcceso(pathname) && (
        <Lanzador
          ref={lanzadorRef}
          atajo={atajo}
          onClick={abrir}
          aria-label={`Abrir Tutor DAM (${atajo})`}
          aria-haspopup="dialog"
          aria-expanded={false}
        />
      )}

      {/* ---------- Panel ---------- */}
      <AnimatePresence>
        {abierto && (
          <motion.div
            key="panel"
            ref={panelRef}
            role="dialog"
            aria-modal={modal ? 'true' : 'false'}
            aria-labelledby={tituloId}
            tabIndex={-1}
            initial={reducir ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducir ? { opacity: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'fixed z-50 flex flex-col overflow-hidden bg-fd-background text-fd-foreground outline-none print:hidden',
              // móvil: hoja a pantalla completa
              'inset-0 h-dvh w-full',
              // escritorio: tarjeta flotante
              'sm:inset-auto sm:right-6 sm:bottom-6 sm:h-[min(640px,calc(100dvh-3rem))] sm:w-[400px] sm:rounded-lg sm:border sm:shadow-sm',
            )}
          >
            {/* Cabecera */}
            <header className="flex shrink-0 items-center gap-2 border-b px-4 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] sm:pt-2.5">
              <div className="min-w-0 flex-1">
                <h2 id={tituloId} className="truncate text-sm font-semibold leading-tight">
                  Tutor DAM
                </h2>
                <p className="truncate text-xs text-fd-muted-foreground">
                  {enviando ? 'Escribiendo…' : disponible ? 'Responde con los apuntes de clase' : 'No disponible ahora mismo'}
                </p>
              </div>
              <button
                type="button"
                onClick={borrar}
                disabled={mensajes.length === 0}
                title="Borrar conversación"
                aria-label="Borrar conversación"
                className="flex size-10 items-center justify-center rounded-md text-fd-muted-foreground transition-colors hover:bg-fd-accent sm:size-8 hover:text-fd-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring disabled:pointer-events-none disabled:opacity-40"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={cerrar}
                title={`Cerrar (${atajo} o Esc)`}
                aria-label="Cerrar Tutor DAM"
                className="flex size-10 items-center justify-center rounded-md text-fd-muted-foreground transition-colors hover:bg-fd-accent sm:size-8 hover:text-fd-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
              >
                <X className="size-4" aria-hidden />
              </button>
            </header>

            {/* Mensajes */}
            <div className="relative min-h-0 flex-1">
              <div
                ref={scrollRef}
                onScroll={onScroll}
                className="h-full overflow-y-auto overscroll-contain px-4 py-4"
                role="log"
                aria-live="polite"
                aria-relevant="additions"
                aria-busy={enviando}
                aria-label="Conversación con el Tutor DAM"
              >
                {mensajes.length === 0 ? (
                  <EstadoVacio
                    nombre={nombre}
                    disponible={disponible}
                    sugerencias={sugerencias}
                    onElegir={(s) => mandar(s)}
                    deshabilitado={!disponible || enviando || sinMensajes}
                  />
                ) : (
                  <ol className="flex flex-col gap-4">
                    {mensajes.map((m, i) => (
                      <Burbuja
                        key={m.id}
                        mensaje={m}
                        esUltimo={i === mensajes.length - 1}
                        puedeReintentar={puedeReintentar && i === mensajes.length - 1}
                        onReintentar={reintentar}
                        onNavegar={onNavegar}
                      />
                    ))}
                  </ol>
                )}
              </div>

              <AnimatePresence>
                {!pegadoAbajo && mensajes.length > 0 && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    onClick={() => {
                      pegadoRef.current = true;
                      setPegadoAbajo(true);
                      irAbajo(true);
                    }}
                    aria-label="Ir al último mensaje"
                    className="absolute bottom-3 left-1/2 flex size-8 -translate-x-1/2 items-center justify-center rounded-md border bg-fd-background text-fd-muted-foreground shadow-sm hover:text-fd-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
                  >
                    <ArrowDown className="size-4" aria-hidden />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Entrada */}
            <form
              onSubmit={onSubmit}
              className="shrink-0 border-t px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
            >
              <div className="flex items-end gap-2 rounded-md border bg-fd-background px-3 py-1.5 transition-colors focus-within:border-fd-primary">
                <label htmlFor={`${tituloId}-entrada`} className="sr-only">
                  Escribe tu pregunta
                </label>
                <textarea
                  id={`${tituloId}-entrada`}
                  ref={textareaRef}
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  onKeyDown={onKeyDownTextarea}
                  rows={1}
                  maxLength={LIMITES.caracteres}
                  disabled={!disponible || sinMensajes}
                  aria-describedby={ayudaId}
                  placeholder={
                    !disponible
                      ? 'El tutor no está activado'
                      : sinMensajes
                        ? 'Has llegado al límite de hoy'
                        : 'Pregunta lo que quieras de los apuntes…'
                  }
                  className="max-h-40 min-h-6 flex-1 resize-none bg-transparent py-1 text-base leading-6 outline-none placeholder:text-fd-muted-foreground disabled:cursor-not-allowed sm:text-sm"
                />
                {enviando ? (
                  <button
                    type="button"
                    onClick={detener}
                    aria-label="Detener respuesta"
                    title="Detener (Esc)"
                    className="flex size-8 shrink-0 items-center justify-center rounded-md bg-fd-secondary text-fd-secondary-foreground transition-colors hover:bg-fd-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
                  >
                    <Square className="size-3.5 fill-current" aria-hidden />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!texto.trim() || !disponible || sinMensajes}
                    aria-label="Enviar pregunta"
                    title="Enviar (Enter)"
                    className="flex size-8 shrink-0 items-center justify-center rounded-md bg-fd-foreground text-fd-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring disabled:pointer-events-none disabled:bg-fd-muted disabled:text-fd-muted-foreground disabled:opacity-100"
                  >
                    <ArrowUp className="size-4" aria-hidden />
                  </button>
                )}
              </div>
              <div id={ayudaId} className="mt-1.5 flex items-center justify-between gap-2 px-1 text-[11px] text-fd-muted-foreground">
                <span className="truncate">
                  {restantes !== null ? (
                    <span className={cn(restantes <= 5 && 'font-medium text-amber-600 dark:text-amber-400')}>
                      {restantes === 0
                        ? 'Sin mensajes por hoy'
                        : `Te ${restantes === 1 ? 'queda 1 mensaje' : `quedan ${restantes} mensajes`} hoy`}
                    </span>
                  ) : (
                    <span className="hidden sm:inline">Enter para enviar · Shift+Enter nueva línea</span>
                  )}
                  <span className="sm:hidden">{restantes === null ? 'Puede equivocarse: revisa los apuntes' : ''}</span>
                </span>
                {cercaLimite ? (
                  <span
                    className={cn('shrink-0 tabular-nums', caracteres >= LIMITES.caracteres && 'text-red-600 dark:text-red-400')}
                    aria-live="polite"
                  >
                    {caracteres}/{LIMITES.caracteres}
                  </span>
                ) : (
                  <span className="hidden shrink-0 sm:inline">Puede equivocarse</span>
                )}
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function EstadoVacio({
  nombre,
  disponible,
  sugerencias,
  onElegir,
  deshabilitado,
}: {
  nombre: string | null;
  disponible: boolean;
  sugerencias: string[];
  onElegir: (texto: string) => void;
  deshabilitado: boolean;
}) {
  return (
    <div className="flex min-h-full flex-col justify-start gap-5 py-1">
      <div>
        <p className="text-sm font-medium">{nombre ? `Hola, ${nombre}.` : 'Hola.'}</p>
        <p className="mt-1 text-sm leading-relaxed text-fd-muted-foreground">
          Pregunta lo que quieras de los apuntes: te lo explico, te digo dónde está o te pongo preguntas para practicar.
        </p>
      </div>

      {!disponible && (
        <div role="status" className="flex gap-2 rounded-md border border-amber-600/25 bg-amber-500/5 p-3 text-sm text-amber-900 dark:text-amber-200">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>
            El tutor aún no está activado. Si eres el propietario, añade <code className="font-mono text-xs">ANTHROPIC_API_KEY</code> a
            las variables de entorno del servidor.
          </p>
        </div>
      )}

      <div>
        <p className="mb-1 text-xs text-fd-muted-foreground">Por ejemplo</p>
        <ul className="divide-y divide-fd-border border-y" aria-label="Sugerencias">
          {sugerencias.map((texto) => (
            <li key={texto}>
              <button
                type="button"
                disabled={deshabilitado}
                onClick={() => onElegir(texto)}
                className="w-full px-1 py-2 text-start text-sm text-fd-foreground transition-colors hover:text-fd-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring disabled:pointer-events-none disabled:opacity-50"
              >
                {texto}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Burbuja({
  mensaje,
  esUltimo,
  puedeReintentar,
  onReintentar,
  onNavegar,
}: {
  mensaje: MensajeUI;
  esUltimo: boolean;
  puedeReintentar: boolean;
  onReintentar: () => void;
  onNavegar: () => void;
}) {
  const reducir = useReducedMotion();
  const animacion = reducir ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.15 } };

  if (mensaje.role === 'user') {
    return (
      <motion.li {...animacion} className="flex justify-end">
        <span className="sr-only">Tú:</span>
        <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-lg bg-fd-muted px-3 py-2 text-sm text-fd-foreground">
          {mensaje.content}
        </div>
      </motion.li>
    );
  }

  const escribiendo = mensaje.estado === 'streaming';
  return (
    <motion.li {...animacion} className="flex">
      <div className="min-w-0 flex-1">
        <span className="sr-only">Tutor DAM:</span>
        {mensaje.content ? (
          <ChatMarkdown texto={mensaje.content} enStreaming={escribiendo} onNavegar={onNavegar} />
        ) : escribiendo ? (
          <IndicadorEscribiendo />
        ) : null}

        {escribiendo && mensaje.content && esUltimo && (
          <span aria-hidden className="ms-0.5 inline-block h-4 w-1.5 translate-y-0.5 animate-pulse rounded-sm bg-fd-muted-foreground/60" />
        )}

        {mensaje.estado === 'detenido' && (
          <p className="mt-1.5 text-xs text-fd-muted-foreground">Respuesta detenida.</p>
        )}
        {mensaje.estado === 'ok' && mensaje.motivo === 'max_tokens' && (
          <p className="mt-1.5 text-xs text-fd-muted-foreground">
            La respuesta se ha cortado por larga. Pídele “continúa” para seguir.
          </p>
        )}
        {mensaje.estado === 'error' && (
          <div
            role="alert"
            className="mt-1 flex items-start gap-2 rounded-md border border-red-600/20 bg-red-600/5 px-3 py-2 text-sm text-red-800 dark:text-red-300"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p className="flex-1">{mensaje.error ?? 'Ha fallado la respuesta.'}</p>
          </div>
        )}
        {puedeReintentar && (
          <button
            type="button"
            onClick={onReintentar}
            className="mt-2 inline-flex items-center gap-1.5 rounded-md border bg-fd-background px-2.5 py-1 text-xs font-medium text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
          >
            <RotateCcw className="size-3.5" aria-hidden />
            Reintentar
          </button>
        )}
      </div>
    </motion.li>
  );
}

function IndicadorEscribiendo() {
  return (
    <p role="status" className="text-sm text-fd-muted-foreground motion-safe:animate-pulse">
      Escribiendo…
    </p>
  );
}
