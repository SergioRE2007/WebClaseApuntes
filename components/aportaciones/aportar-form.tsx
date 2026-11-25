'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';
import { Ban, LoaderCircle, Send } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  MODULO_OTRO,
  TIPOS_INFO,
  erroresPorCampo,
  nuevaAportacionSchema,
  resolverMime,
  rutaArchivo,
  tipoParaMime,
  validarArchivo,
  type Modulo,
  type NuevaAportacion,
  type TipoAportacion,
} from '@/lib/aportaciones';
import { cancelarSubida, crearAportacion } from '@/app/aportar/actions';
import { subirArchivo, SubidaCancelada } from './subir';
import { TipoSelector } from './tipo-selector';
import { Dropzone } from './dropzone';
import { Campo, botonPrimario, botonSecundario, inputClase } from './ui';

const TEMA_OTRO = '__otro';

type Fase = 'idle' | 'subiendo' | 'guardando';

function nombreCaptura(mime: string) {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  const ext = mime.split('/')[1]?.replace('jpeg', 'jpg') ?? 'png';
  return `captura-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}.${ext}`;
}

export function AportarForm({
  userId,
  modulos,
  disabled = false,
}: {
  userId: string;
  modulos: Modulo[];
  disabled?: boolean;
}) {
  const router = useRouter();
  const uid = useId();
  const ids = {
    modulo: `${uid}-modulo`,
    tema: `${uid}-tema`,
    temaLibre: `${uid}-tema-libre`,
    titulo: `${uid}-titulo`,
    descripcion: `${uid}-descripcion`,
    enlace: `${uid}-enlace`,
    archivo: `${uid}-archivo`,
  };

  const [tipo, setTipo] = useState<TipoAportacion>('captura');
  const [modulo, setModulo] = useState('');
  const [temaSel, setTemaSel] = useState('');
  const [temaLibre, setTemaLibre] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [enlace, setEnlace] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [fase, setFase] = useState<Fase>('idle');
  const [progreso, setProgreso] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const info = TIPOS_INFO[tipo];
  const ocupado = fase !== 'idle';
  const bloqueado = disabled || ocupado;
  const moduloActual = useMemo(() => modulos.find((m) => m.slug === modulo), [modulos, modulo]);
  const temas = moduloActual?.temas ?? [];
  const conSelectTema = temas.length > 0 && modulo !== MODULO_OTRO;

  const limpiarError = (campo: string) =>
    setErrores((e) => {
      if (!(campo in e)) return e;
      const { [campo]: _, ...resto } = e;
      return resto;
    });

  // ---------- Archivo ----------
  const elegirArchivo = useCallback(
    (f: File | null, origen: 'pegar' | 'soltar' | 'elegir' = 'elegir') => {
      if (!f) {
        setArchivo(null);
        limpiarError('archivo');
        return;
      }
      const mime = resolverMime(f.name, f.type);
      let file = f;
      if (origen === 'pegar' && mime.startsWith('image/') && (!f.name || /^image\.\w+$/i.test(f.name))) {
        file = new File([f], nombreCaptura(mime), { type: mime, lastModified: Date.now() });
      }
      let tipoFinal = tipo;
      if (!TIPOS_INFO[tipo].mimes.includes(mime)) {
        const sugerido = tipoParaMime(mime);
        if (sugerido) {
          tipoFinal = sugerido;
          setTipo(sugerido);
          if (sugerido !== tipo) toast.info(`Tipo cambiado a «${TIPOS_INFO[sugerido].label}» para este archivo`);
        }
      }
      const err = validarArchivo(tipoFinal, { name: file.name, size: file.size, type: mime });
      if (err) {
        setErrores((e) => ({ ...e, archivo: err }));
        toast.error(err);
        return;
      }
      setArchivo(file);
      limpiarError('archivo');
      if (origen === 'pegar') toast.success('Captura pegada desde el portapapeles');
    },
    [tipo],
  );

  // Pegar (Ctrl+V) una captura en cualquier parte de la página
  useEffect(() => {
    if (bloqueado) return;
    const onPaste = (e: ClipboardEvent) => {
      const items = Array.from(e.clipboardData?.items ?? []);
      const item = items.find((i) => i.kind === 'file');
      const f = item?.getAsFile();
      if (!f) return; // texto normal: que se pegue donde esté el cursor
      if (!TIPOS_INFO[tipo].mimes.length && !tipoParaMime(resolverMime(f.name, f.type))) return;
      e.preventDefault();
      elegirArchivo(f, 'pegar');
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [bloqueado, elegirArchivo, tipo]);

  // Avisar si se intenta salir a mitad de subida
  useEffect(() => {
    if (!ocupado) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [ocupado]);

  const cambiarTipo = (t: TipoAportacion) => {
    setTipo(t);
    setErrores({});
    if (archivo) {
      const err = TIPOS_INFO[t].archivo === 'no' ? null : validarArchivo(t, { name: archivo.name, size: archivo.size, type: resolverMime(archivo.name, archivo.type) });
      if (TIPOS_INFO[t].archivo === 'no') setArchivo(null);
      else if (err) setErrores({ archivo: err });
    }
  };

  const resetear = () => {
    setTipo('captura');
    setModulo('');
    setTemaSel('');
    setTemaLibre('');
    setTitulo('');
    setDescripcion('');
    setEnlace('');
    setArchivo(null);
    setErrores({});
    setProgreso(null);
  };

  // ---------- Envío ----------
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (bloqueado) return;

    const tema = !conSelectTema || temaSel === TEMA_OTRO ? temaLibre : (temas.find((t) => t.url === temaSel)?.titulo ?? '');

    const usaArchivo = info.archivo !== 'no' && archivo;
    const path = usaArchivo ? rutaArchivo(userId, archivo.name) : null;
    const payload: NuevaAportacion = {
      tipo,
      modulo,
      tema,
      titulo,
      descripcion,
      enlace: info.enlace === 'no' ? undefined : enlace,
      archivo: usaArchivo && path ? { path, nombre: archivo.name } : undefined,
    };

    const parsed = nuevaAportacionSchema.safeParse(payload);
    const campos = parsed.success ? {} : erroresPorCampo(parsed.error);
    if (usaArchivo) {
      const err = validarArchivo(tipo, { name: archivo.name, size: archivo.size, type: resolverMime(archivo.name, archivo.type) });
      if (err) campos.archivo = err;
    }
    if (Object.keys(campos).length) {
      setErrores(campos);
      toast.error('Revisa los campos marcados');
      const primero = Object.keys(campos)[0] as keyof typeof ids;
      document.getElementById(ids[primero] ?? '')?.focus();
      return;
    }

    let subido = false;
    try {
      if (usaArchivo && path) {
        setFase('subiendo');
        setProgreso(0);
        const ctrl = new AbortController();
        abortRef.current = ctrl;
        await subirArchivo(path, archivo, resolverMime(archivo.name, archivo.type), setProgreso, ctrl.signal);
        subido = true;
      }
      setFase('guardando');
      const res = await crearAportacion(payload);
      if (!res.ok) {
        setErrores(res.campos ?? {});
        toast.error(res.error);
        return;
      }
      toast.success(res.mensaje ?? 'Aportación enviada', {
        description: 'Te avisaremos aquí abajo cuando se revise.',
      });
      resetear();
      router.refresh();
    } catch (err) {
      if (err instanceof SubidaCancelada) toast('Subida cancelada');
      else toast.error(err instanceof Error ? err.message : 'Algo ha fallado. Inténtalo de nuevo.');
      if (path && (subido || err instanceof SubidaCancelada)) void cancelarSubida(path).catch(() => {});
    } finally {
      abortRef.current = null;
      setFase('idle');
      setProgreso(null);
    }
  }

  const describedBy = (campo: keyof typeof ids) => (errores[campo] ? `${ids[campo]}-error` : `${ids[campo]}-ayuda`);

  return (
    <form onSubmit={onSubmit} noValidate aria-busy={ocupado} className="space-y-6">
      <fieldset disabled={bloqueado} className="space-y-6 disabled:opacity-100">
        <TipoSelector value={tipo} onChange={cambiarTipo} disabled={bloqueado} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id={ids.modulo} label="Módulo" error={errores.modulo}>
            <select
              id={ids.modulo}
              value={modulo}
              onChange={(e) => {
                setModulo(e.target.value);
                setTemaSel('');
                limpiarError('modulo');
              }}
              aria-invalid={Boolean(errores.modulo)}
              aria-describedby={errores.modulo ? `${ids.modulo}-error` : undefined}
              className={inputClase}
              required
            >
              <option value="" disabled>
                Elige un módulo…
              </option>
              {modulos.map((m) => (
                <option key={m.slug} value={m.slug}>
                  {m.nombre}
                </option>
              ))}
              <option value={MODULO_OTRO}>Otro</option>
            </select>
          </Campo>

          <Campo id={conSelectTema ? ids.tema : ids.temaLibre} label="Tema" opcional error={errores.tema}>
            {conSelectTema ? (
              <select
                id={ids.tema}
                value={temaSel}
                onChange={(e) => setTemaSel(e.target.value)}
                className={inputClase}
              >
                <option value="">Sin tema concreto</option>
                {temas.map((t) => (
                  <option key={t.url} value={t.url}>
                    {t.titulo}
                  </option>
                ))}
                <option value={TEMA_OTRO}>Otro tema (escribirlo)…</option>
              </select>
            ) : (
              <input
                id={ids.temaLibre}
                value={temaLibre}
                onChange={(e) => setTemaLibre(e.target.value)}
                maxLength={120}
                placeholder={modulo ? 'p. ej. Herencia y polimorfismo' : 'Elige antes el módulo'}
                className={inputClase}
              />
            )}
          </Campo>
        </div>

        <AnimatePresence initial={false}>
          {conSelectTema && temaSel === TEMA_OTRO && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <Campo id={ids.temaLibre} label="¿Qué tema?">
                <input
                  id={ids.temaLibre}
                  value={temaLibre}
                  onChange={(e) => setTemaLibre(e.target.value)}
                  maxLength={120}
                  placeholder="Escribe el tema"
                  className={inputClase}
                  autoFocus
                />
              </Campo>
            </motion.div>
          )}
        </AnimatePresence>

        <Campo id={ids.titulo} label="Título" error={errores.titulo} ayuda={`${titulo.trim().length}/140`}>
          <input
            id={ids.titulo}
            value={titulo}
            onChange={(e) => {
              setTitulo(e.target.value);
              limpiarError('titulo');
            }}
            maxLength={140}
            required
            placeholder="p. ej. Pizarra del ejercicio de JOINs del martes"
            aria-invalid={Boolean(errores.titulo)}
            aria-describedby={describedBy('titulo')}
            className={inputClase}
          />
        </Campo>

        <Campo
          id={ids.descripcion}
          label={tipo === 'texto' ? 'Texto' : 'Descripción'}
          opcional={tipo !== 'texto'}
          error={errores.descripcion}
          ayuda={`${descripcion.length}/4000 · Cuenta qué es y dónde encaja en los apuntes`}
        >
          <textarea
            id={ids.descripcion}
            value={descripcion}
            onChange={(e) => {
              setDescripcion(e.target.value);
              limpiarError('descripcion');
            }}
            maxLength={4000}
            rows={tipo === 'texto' ? 8 : 4}
            placeholder={
              tipo === 'texto'
                ? 'Escribe la explicación, corrección o idea. Puedes usar Markdown.'
                : 'Contexto útil para quien revise: de qué clase es, qué falta en los apuntes…'
            }
            aria-invalid={Boolean(errores.descripcion)}
            aria-describedby={describedBy('descripcion')}
            className={cn(inputClase, 'min-h-24 resize-y')}
          />
        </Campo>

        <AnimatePresence initial={false} mode="popLayout">
          {info.enlace !== 'no' && (
            <motion.div
              key="enlace"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <Campo
                id={ids.enlace}
                label={tipo === 'video' ? 'Enlace al vídeo' : 'Enlace'}
                opcional={info.enlace === 'opcional'}
                error={errores.enlace}
                ayuda={
                  tipo === 'video'
                    ? 'Para vídeos largos mejor súbelo a YouTube (oculto) o Drive y pega aquí el enlace.'
                    : 'YouTube, Google Drive, documentación oficial… Debe empezar por https://'
                }
              >
                <input
                  id={ids.enlace}
                  type="url"
                  inputMode="url"
                  value={enlace}
                  onChange={(e) => {
                    setEnlace(e.target.value);
                    limpiarError('enlace');
                  }}
                  placeholder="https://"
                  aria-invalid={Boolean(errores.enlace)}
                  aria-describedby={describedBy('enlace')}
                  className={inputClase}
                />
              </Campo>
            </motion.div>
          )}
        </AnimatePresence>

        {info.archivo !== 'no' && (
          <Dropzone
            id={ids.archivo}
            tipo={tipo}
            archivo={archivo}
            onArchivo={elegirArchivo}
            error={errores.archivo}
            opcional={info.archivo === 'opcional'}
            disabled={bloqueado}
          />
        )}
      </fieldset>

      <div className="space-y-3">
        <AnimatePresence>
          {fase !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-lg border bg-fd-muted/50 p-3">
                <div className="mb-2 flex items-center justify-between gap-2 text-sm" aria-live="polite">
                  <span className="flex items-center gap-2 font-medium">
                    <LoaderCircle className="size-4 animate-spin" aria-hidden />
                    {fase === 'subiendo' ? 'Subiendo archivo…' : 'Guardando aportación…'}
                  </span>
                  {fase === 'subiendo' && progreso != null && (
                    <span className="tabular-nums text-fd-muted-foreground">{Math.round(progreso * 100)}%</span>
                  )}
                </div>
                <div
                  role="progressbar"
                  aria-label="Progreso de la subida"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={fase === 'subiendo' && progreso != null ? Math.round(progreso * 100) : undefined}
                  className="h-2 overflow-hidden rounded-full bg-fd-secondary"
                >
                  {fase === 'subiendo' && progreso != null ? (
                    <motion.div
                      className="h-full rounded-full bg-fd-primary"
                      animate={{ width: `${Math.max(2, progreso * 100)}%` }}
                      transition={{ ease: 'easeOut', duration: 0.2 }}
                    />
                  ) : (
                    <motion.div
                      className="h-full w-1/3 rounded-full bg-fd-primary"
                      animate={{ x: ['-100%', '300%'] }}
                      transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          {fase === 'subiendo' ? (
            <button type="button" onClick={() => abortRef.current?.abort()} className={botonSecundario}>
              <Ban className="size-4" aria-hidden />
              Cancelar subida
            </button>
          ) : (
            <button type="button" onClick={resetear} disabled={bloqueado} className={botonSecundario}>
              Limpiar
            </button>
          )}
          <button type="submit" disabled={bloqueado} className={cn(botonPrimario, 'sm:min-w-44')}>
            {ocupado ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
            ) : (
              <Send className="size-4" aria-hidden />
            )}
            {ocupado ? 'Enviando…' : 'Enviar aportación'}
          </button>
        </div>
      </div>
    </form>
  );
}
