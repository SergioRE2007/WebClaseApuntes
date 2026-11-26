import { NextResponse, type NextRequest } from 'next/server';
import { rutaSegura } from '@/lib/ruta-segura';
import { createClient } from '@/lib/supabase/server';

function destinoSeguro(next: string | null) {
  // Evita redirecciones abiertas: solo rutas internas
  return rutaSegura(next);
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const next = destinoSeguro(searchParams.get('next'));

  // Supabase añade ?error=...&error_code=otp_expired cuando el enlace ya se usó o caducó
  const errorCode = searchParams.get('error_code');
  if (errorCode === 'otp_expired') return NextResponse.redirect(`${origin}/login?error=caducado`);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    // Pasa por /unirse: si aún no ha metido el código de clase se lo pide; si ya está dentro, /unirse redirige a `next`.
    if (!error) return NextResponse.redirect(`${origin}/unirse?next=${encodeURIComponent(next)}`);
    console.error('[auth/callback] exchangeCodeForSession:', error.code ?? error.message);
    // Sin la cookie de verificación (otro navegador/dominio) el intercambio falla
    return NextResponse.redirect(`${origin}/login?error=navegador`);
  }
  return NextResponse.redirect(`${origin}/login?error=enlace`);
}
