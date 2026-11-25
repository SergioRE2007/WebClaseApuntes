'use client';

import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  BookOpen,
  Compass,
  ListChecks,
  RotateCcw,
  Send,
  Sparkles,
  Square,
  Trash2,
  Upload,
  X,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';
import { LIMITES } from '@/lib/ai/protocolo';
import { EVENTO_ABRIR_CHAT, type DetalleAbrirChat } from './abrir-chat';
import { ChatMarkdown } from './chat-markdown';
import { useChat, type MensajeUI } from './use-chat';

interface ChatPanelProps {
  nombre: string | null;
  /** false si el servidor no tiene ANTHROPIC_API_KEY. */
  disponible: boolean;
}

interface Sugerencia {
  icono: LucideIcon;
  texto: string;
}

const MOVIL = '(max-width: 639px)';

function esMovil() {
  return typeof window !== 'undefined' && window.matchMedia(MOVIL).matches;
}

function esMac() {
  return typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent);
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
  const [mac, setMac] = useState(false);
  const reducir = useReducedMotion();

  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lanzadorRef = useRef<HTMLButtonElement>(null);
  const pegadoRef = useRef(true);
  const tituloId = useId();
  const ayudaId = useId();

  useEffect(() => setMac(esMac()), []);
  const atajo = mac ? '⌘J' : 'Ctrl+J';

  const enDocs = pathname === '/docs' || pathname.startsWith('/docs/');
  const sugerencias: Sugerencia[] = enDocs
    ? [
        { icono: BookOpen, texto: 'Explícame esta página más fácil' },
        { icono: ListChecks, texto: 'Hazme 3 preguntas tipo test de esta página' },
        { icono: Compass, texto: '¿Dónde están los apuntes de bases de datos?' },
        { icono: Upload, texto: '¿Cómo envío una captura al profe?' },
      ]
    : [
        { icono: Compass, texto: '¿Dónde están los apuntes de bases de datos?' },
        { icono: BookOpen, texto: '¿Qué módulos hay en los apuntes?' },
        { icono: ListChecks, texto: '¿Cómo marco mi progreso en los temas?' },
        { icono: Upload, texto: '¿Cómo envío una captura al profe?' },
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

  // Bloquea el scroll del body en móvil (pantalla completa)
  useEffect(() => {
    if (!abierto || !esMovil()) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previo;
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
    if (abierto && pegadoRef.current) irAbajo();
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

  const onKeyDownPanel = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      if (enviando) detener();
      else cerrar();
    }
  };

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
      <AnimatePresence>
        {!abierto && (
          <motion.div
            key="lanzador"
            initial={reducir ? { opacity: 0 } : { opacity: 0, scale: 0.6, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reducir ? { opacity: 0 } : { opacity: 0, scale: 0.6, y: 12 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className="group fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6 print:hidden"
            style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -inset-1 rounded-full bg-gradient-to-tr from-fd-primary/60 via-fd-primary/25 to-fd-primary/60 opacity-60 blur-md transition-opacity duration-300 group-hover:opacity-100 motion-safe:animate-pulse"
            />
            <button
              ref={lanzadorRef}
              type="button"
              onClick={abrir}
              aria-label={`Abrir Tutor DAM (${atajo})`}
              aria-haspopup="dialog"
              aria-expanded={false}
              aria-keyshortcuts="Control+J Meta+J"
              className="relative flex size-13 items-center justify-center rounded-full border border-fd-primary/30 bg-gradient-to-br from-fd-primary to-fd-primary/80 text-fd-primary-foreground shadow-lg shadow-fd-primary/25 transition-transform duration-200 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2 focus-visible:ring-offset-fd-background"
            >
              <Sparkles className="size-6" aria-hidden />
            </button>
            <span
              role="tooltip"
              className="pointer-events-none absolute right-0 bottom-full mb-3 hidden whitespace-nowrap rounded-lg border bg-fd-popover px-2.5 py-1.5 text-xs font-medium text-fd-popover-foreground opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 sm:block"
            >
              Pregunta al Tutor DAM{' '}
              <kbd className="ms-1 rounded border bg-fd-muted px-1 font-mono text-[10px] text-fd-muted-foreground">{atajo}</kbd>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- Panel ---------- */}
      <AnimatePresence>
        {abierto && (
          <motion.div
            key="panel"
            ref={panelRef}
            role="dialog"
            aria-modal="false"
            aria-labelledby={tituloId}
            onKeyDown={onKeyDownPanel}
            tabIndex={-1}
            initial={reducir ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reducir ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 24 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            style={{ transformOrigin: 'bottom right' }}
            className={cn(
              'fixed z-50 flex flex-col overflow-hidden bg-fd-background text-fd-foreground outline-none print:hidden',
              // móvil: hoja a pantalla completa
              'inset-0 h-dvh w-full',
              // escritorio: tarjeta flotante
              'sm:inset-auto sm:right-6 sm:bottom-6 sm:h-[min(680px,calc(100dvh-3rem))] sm:w-[400px] sm:rounded-2xl sm:border sm:shadow-2xl sm:shadow-black/20',
            )}
          >
            {/* Cabecera */}
            <header className="flex shrink-0 items-center gap-3 border-b bg-fd-card/80 px-4 py-3 backdrop-blur pt-[max(0.75rem,env(safe-area-inset-top))] sm:pt-3">
              <div className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-fd-primary to-fd-primary/70 text-fd-primary-foreground shadow-sm">
                <Sparkles className="size-4.5" aria-hidden />
                <span
                  aria-hidden
                  className={cn(
                    'absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-fd-card',
                    disponible ? 'bg-green-500' : 'bg-amber-500',
                  )}
                />
              </div>
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
                className="flex size-9 items-center justify-center rounded-lg text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring disabled:pointer-events-none disabled:opacity-40"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={cerrar}
                title={`Cerrar (${atajo} o Esc)`}
                aria-label="Cerrar Tutor DAM"
                className="flex size-9 items-center justify-center rounded-lg text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
              >
                <X className="size-4.5" aria-hidden />
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
                    className="absolute bottom-3 left-1/2 flex size-8 -translate-x-1/2 items-center justify-center rounded-full border bg-fd-card text-fd-muted-foreground shadow-md hover:text-fd-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
                  >
                    <ArrowDown className="size-4" aria-hidden />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Entrada */}
            <form
              onSubmit={onSubmit}
              className="shrink-0 border-t bg-fd-card/60 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
            >
              <div className="flex items-end gap-2 rounded-xl border bg-fd-background px-3 py-2 shadow-sm transition-shadow focus-within:border-fd-primary/50 focus-within:ring-2 focus-within:ring-fd-ring/30">
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
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-fd-secondary text-fd-secondary-foreground transition-colors hover:bg-fd-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
                  >
                    <Square className="size-3.5 fill-current" aria-hidden />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!texto.trim() || !disponible || sinMensajes}
                    aria-label="Enviar pregunta"
                    title="Enviar (Enter)"
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-fd-primary text-fd-primary-foreground transition-[opacity,transform] hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring disabled:pointer-events-none disabled:opacity-40"
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
  sugerencias: Sugerencia[];
  onElegir: (texto: string) => void;
  deshabilitado: boolean;
}) {
  return (
    <div className="flex min-h-full flex-col justify-center gap-5 py-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-fd-primary/20 to-fd-primary/5 text-fd-primary ring-1 ring-fd-primary/20">
          <Sparkles className="size-7" aria-hidden />
        </div>
        <div>
          <p className="text-base font-semibold">{nombre ? `¡Hola, ${nombre}!` : '¡Hola!'} Soy tu Tutor DAM</p>
          <p className="mx-auto mt-1 max-w-[30ch] text-sm text-fd-muted-foreground">
            Te ayudo a entender los apuntes, a encontrar temas y a practicar para el examen.
          </p>
        </div>
      </div>

      {!disponible && (
        <div role="status" className="flex gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>
            El tutor aún no está activado. Si eres el propietario, añade <code className="font-mono text-xs">ANTHROPIC_API_KEY</code> a
            las variables de entorno del servidor.
          </p>
        </div>
      )}

      <ul className="grid gap-2" aria-label="Sugerencias">
        {sugerencias.map(({ icono: Icono, texto }) => (
          <li key={texto}>
            <button
              type="button"
              disabled={deshabilitado}
              onClick={() => onElegir(texto)}
              className="group flex w-full items-center gap-3 rounded-xl border bg-fd-card px-3 py-2.5 text-start text-sm transition-colors hover:border-fd-primary/40 hover:bg-fd-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring disabled:pointer-events-none disabled:opacity-50"
            >
              <Icono className="size-4 shrink-0 text-fd-primary" aria-hidden />
              <span className="flex-1">{texto}</span>
              <Send className="size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
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
  const animacion = reducir ? {} : { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 } };

  if (mensaje.role === 'user') {
    return (
      <motion.li {...animacion} className="flex justify-end">
        <span className="sr-only">Tú:</span>
        <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-fd-primary px-3.5 py-2 text-sm text-fd-primary-foreground shadow-sm">
          {mensaje.content}
        </div>
      </motion.li>
    );
  }

  const escribiendo = mensaje.estado === 'streaming';
  return (
    <motion.li {...animacion} className="flex gap-2.5">
      <div
        aria-hidden
        className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-fd-primary/10 text-fd-primary ring-1 ring-fd-primary/15"
      >
        <Sparkles className="size-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="sr-only">Tutor DAM:</span>
        {mensaje.content ? (
          <ChatMarkdown texto={mensaje.content} enStreaming={escribiendo} onNavegar={onNavegar} />
        ) : escribiendo ? (
          <IndicadorEscribiendo />
        ) : null}

        {escribiendo && mensaje.content && esUltimo && (
          <span aria-hidden className="ms-0.5 inline-block h-4 w-1.5 translate-y-0.5 animate-pulse rounded-sm bg-fd-primary/60" />
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
            className="mt-1 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p className="flex-1">{mensaje.error ?? 'Ha fallado la respuesta.'}</p>
          </div>
        )}
        {puedeReintentar && (
          <button
            type="button"
            onClick={onReintentar}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg border bg-fd-card px-2.5 py-1 text-xs font-medium text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
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
    <div className="flex h-6 items-center gap-1" role="status" aria-label="El tutor está escribiendo">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-bounce rounded-full bg-fd-muted-foreground/70"
          style={{ animationDelay: `${i * 150}ms`, animationDuration: '900ms' }}
        />
      ))}
    </div>
  );
}
