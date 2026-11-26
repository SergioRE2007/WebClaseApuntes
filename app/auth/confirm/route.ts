import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { rutaSegura } from '@/lib/ruta-segura';
import { createClient } from '@/lib/supabase/server';
import { COOKIE_NEXT } from '@/lib/login-next';

/** Tipos de enlace de correo que aceptamos para entrar (registro y enlace mágico). */
const TIPOS = new Set(['email', 'magiclink', 'signup']);

/**
 * Entrada desde el enlace del correo con `token_hash` (plantillas de Supabase
 * "Confirm signup" y "Magic Link"). A diferencia de /auth/callback (PKCE), no
 * depende de ninguna cookie: funciona aunque el correo se abra en otro navegador
 * o dispositivo, o aunque se hayan pedido varios enlaces.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get('token_hash');
  const tipo = searchParams.get('type') ?? 'email';
  if (!tokenHash || !TIPOS.has(tipo)) return NextResponse.redirect(`${origin}/login?error=enlace`);

  const supabase = await createClient();
  // 'email' vale tanto para el primer registro como para los siguientes inicios de sesión.
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'email' });
  if (error) {
    console.error('[auth/confirm] verifyOtp:', error.code ?? error.message);
    return NextResponse.redirect(`${origin}/login?error=caducado`);
  }

  // Vuelve a la página desde la que pidió el enlace si es este mismo navegador; si no, a los apuntes.
  const cookieStore = await cookies();
  const next = rutaSegura(cookieStore.get(COOKIE_NEXT)?.value);
  cookieStore.delete(COOKIE_NEXT);
  // /unirse pide el código de clase si aún no lo ha metido; si ya está dentro, redirige a `next`.
  return NextResponse.redirect(`${origin}/unirse?next=${encodeURIComponent(next)}`);
}
