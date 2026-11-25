import { Suspense } from 'react';
import { getPerfil } from '@/lib/auth';
import { ChatPanel } from './chat-panel';

async function ChatWidgetInterno() {
  let perfil: Awaited<ReturnType<typeof getPerfil>> = null;
  try {
    perfil = await getPerfil();
  } catch {
    perfil = null;
  }
  if (!perfil?.clase_ok) return null;

  const nombre = perfil.nombre?.trim().split(/\s+/)[0] ?? null;
  return <ChatPanel nombre={nombre} disponible={Boolean(process.env.ANTHROPIC_API_KEY)} />;
}

/**
 * Tutor DAM flotante. Se monta una vez en app/layout.tsx dentro de <RootProvider>.
 * Solo se renderiza para miembros de la clase (o en modo demo). Va envuelto en
 * <Suspense> para no bloquear el resto de la página mientras se lee la sesión.
 */
export async function ChatWidget() {
  return (
    <Suspense fallback={null}>
      <ChatWidgetInterno />
    </Suspense>
  );
}
