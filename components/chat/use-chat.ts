'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CABECERA_RESTANTES,
  crearLectorEventos,
  LIMITES,
  type EventoChat,
  type MensajeChat,
  type MotivoFin,
} from '@/lib/ai/protocolo';

export type EstadoMensaje = 'ok' | 'streaming' | 'error' | 'detenido';

export interface MensajeUI {
  id: string;
  role: MensajeChat['role'];
  content: string;
  estado: EstadoMensaje;
  error?: string;
  motivo?: MotivoFin;
}

const CLAVE_STORAGE = 'dam:chat';

function nuevoId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function leerStorage(): { mensajes: MensajeUI[]; restantes: number | null } | null {
  try {
    const raw = sessionStorage.getItem(CLAVE_STORAGE);
    if (!raw) return null;
    const datos = JSON.parse(raw) as { mensajes?: MensajeUI[]; restantes?: number | null };
    if (!Array.isArray(datos.mensajes)) return null;
    return {
      mensajes: datos.mensajes
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .map((m) => (m.estado === 'streaming' ? { ...m, estado: m.content ? 'detenido' : 'error', error: m.content ? undefined : 'Respuesta interrumpida.' } : m)),
      restantes: typeof datos.restantes === 'number' ? datos.restantes : null,
    };
  } catch {
    return null;
  }
}

function guardarStorage(mensajes: MensajeUI[], restantes: number | null) {
  try {
    if (mensajes.length === 0) sessionStorage.removeItem(CLAVE_STORAGE);
    else sessionStorage.setItem(CLAVE_STORAGE, JSON.stringify({ mensajes, restantes }));
  } catch {
    // almacenamiento no disponible: la conversación vive solo en memoria
  }
}

/** Historial que se envía a la API: sin errores, recortado a los límites del protocolo. */
function historialParaApi(mensajes: MensajeUI[]): MensajeChat[] {
  const validos = mensajes
    .filter((m) => m.estado !== 'error' && m.content.trim())
    .map((m) => ({
      role: m.role,
      content: m.content.length > LIMITES.caracteres ? `${m.content.slice(0, LIMITES.caracteres - 1)}…` : m.content,
    }));
  const recortado = validos.slice(-LIMITES.mensajes);
  while (recortado.length > 0 && recortado[0]!.role !== 'user') recortado.shift();
  return recortado;
}

export function useChat(getPagina: () => string) {
  const [mensajes, setMensajes] = useState<MensajeUI[]>([]);
  const [restantes, setRestantes] = useState<number | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [cargado, setCargado] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const mensajesRef = useRef<MensajeUI[]>([]);
  mensajesRef.current = mensajes;

  useEffect(() => {
    const guardado = leerStorage();
    if (guardado) {
      setMensajes(guardado.mensajes);
      setRestantes(guardado.restantes);
    }
    setCargado(true);
  }, []);

  useEffect(() => {
    if (!cargado) return;
    guardarStorage(mensajes, restantes);
  }, [mensajes, restantes, cargado]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const actualizar = useCallback((id: string, cambio: Partial<MensajeUI> | ((m: MensajeUI) => Partial<MensajeUI>)) => {
    setMensajes((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...(typeof cambio === 'function' ? cambio(m) : cambio) } : m)),
    );
  }, []);

  /** Lanza una petición con el historial dado; añade un mensaje del asistente que se va rellenando. */
  const ejecutar = useCallback(
    async (historial: MensajeUI[]) => {
      const idRespuesta = nuevoId();
      setMensajes([...historial, { id: idRespuesta, role: 'assistant', content: '', estado: 'streaming' }]);
      setEnviando(true);

      const controller = new AbortController();
      abortRef.current = controller;
      let acumulado = '';
      let frame = 0;
      const volcar = () => {
        frame = 0;
        const texto = acumulado;
        actualizar(idRespuesta, { content: texto });
      };
      const programar = () => {
        if (!frame) frame = requestAnimationFrame(volcar);
      };

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: historialParaApi(historial), pagina: getPagina() }),
          signal: controller.signal,
        });

        const cabecera = res.headers.get(CABECERA_RESTANTES);
        if (cabecera !== null && cabecera !== '' && Number.isFinite(Number(cabecera))) setRestantes(Number(cabecera));

        if (!res.ok || !res.body) {
          let mensaje = 'No se ha podido contactar con el tutor. Inténtalo de nuevo.';
          try {
            const datos = (await res.json()) as { error?: string };
            if (datos.error) mensaje = datos.error;
          } catch {
            if (res.status === 401) mensaje = 'Tu sesión ha caducado. Vuelve a iniciar sesión.';
          }
          actualizar(idRespuesta, { estado: 'error', error: mensaje });
          return;
        }

        const lector = res.body.getReader();
        const decoder = new TextDecoder();
        const eventos = crearLectorEventos();
        let final: EventoChat | null = null;

        const manejar = (evento: EventoChat) => {
          if (evento.t === 'd') {
            acumulado += evento.v;
            programar();
          } else {
            final = evento;
          }
        };

        while (true) {
          const { done, value } = await lector.read();
          if (done) break;
          eventos.push(decoder.decode(value, { stream: true })).forEach(manejar);
        }
        eventos.push(decoder.decode()).forEach(manejar);
        eventos.flush().forEach(manejar);

        if (frame) cancelAnimationFrame(frame);
        const fin = final as EventoChat | null;
        if (fin?.t === 'error') {
          actualizar(idRespuesta, { content: acumulado, estado: 'error', error: fin.mensaje });
        } else if (fin?.t === 'fin') {
          actualizar(idRespuesta, { content: acumulado, estado: 'ok', motivo: fin.motivo });
        } else {
          actualizar(idRespuesta, {
            content: acumulado,
            estado: acumulado ? 'detenido' : 'error',
            error: acumulado ? undefined : 'La respuesta se ha cortado. Inténtalo de nuevo.',
          });
        }
      } catch (e) {
        if (frame) cancelAnimationFrame(frame);
        if (controller.signal.aborted) {
          actualizar(idRespuesta, (m) => ({
            content: acumulado || m.content,
            estado: acumulado ? 'detenido' : 'error',
            error: acumulado ? undefined : 'Has detenido la respuesta.',
          }));
        } else {
          console.error(e);
          actualizar(idRespuesta, {
            content: acumulado,
            estado: 'error',
            error: 'Se ha perdido la conexión con el tutor. Revisa tu conexión e inténtalo de nuevo.',
          });
        }
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
        setEnviando(false);
      }
    },
    [actualizar, getPagina],
  );

  const enviar = useCallback(
    (texto: string) => {
      const limpio = texto.trim().slice(0, LIMITES.caracteres);
      if (!limpio || abortRef.current) return false;
      const usuario: MensajeUI = { id: nuevoId(), role: 'user', content: limpio, estado: 'ok' };
      void ejecutar([...mensajesRef.current, usuario]);
      return true;
    },
    [ejecutar],
  );

  /** Reintenta la última respuesta fallida (o detenida). */
  const reintentar = useCallback(() => {
    if (abortRef.current) return;
    const lista = [...mensajesRef.current];
    while (lista.length > 0 && lista.at(-1)!.role === 'assistant') lista.pop();
    if (lista.at(-1)?.role !== 'user') return;
    void ejecutar(lista);
  }, [ejecutar]);

  const detener = useCallback(() => abortRef.current?.abort(), []);

  const limpiar = useCallback(() => {
    abortRef.current?.abort();
    setMensajes([]);
    try {
      sessionStorage.removeItem(CLAVE_STORAGE);
    } catch {
      // nada
    }
  }, []);

  return { mensajes, restantes, enviando, enviar, reintentar, detener, limpiar };
}
