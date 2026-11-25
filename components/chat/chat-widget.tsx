import { Suspense } from 'react';
import { getPerfil } from '@/lib/auth';
import { ChatPanel } from './chat-panel';
import { ChatBloqueado } from './chat-bloqueado';

async function ChatWidgetInterno() {
  let perfil: Awaited<ReturnType<typeof getPerfil>> = null;
  try {
    perfil = await getPerfil();
  } catch {
    perfil = null;
  }
  // Los apuntes son públicos: quien no puede usar el tutor ve el botón con un aviso para entrar.
  if (!perfil?.clase_ok) return <ChatBloqueado logueado={Boolean(perfil)} />;

  const nombre = perfil.nombre?.trim().split(/\s+/)[0] ?? null;
  return <ChatPanel nombre={nombre} disponible={Boolean(process.env.ANTHROPIC_API_KEY)} />;
}

/**
 * Tutor DAM flotante. Se monta una vez en app/layout.tsx dentro de <RootProvider>.
 * El panel solo se monta para miembros de la clase (o en modo demo); el resto
 * ve el lanzador con un aviso para entrar. Va envuelto en
 * <Suspense> para no bloquear el resto de la página mientras se lee la sesión.
 */
export async function ChatWidget() {
  return (
    <Suspense fallback={null}>
      <ChatWidgetInterno />
    </Suspense>
  );
}
