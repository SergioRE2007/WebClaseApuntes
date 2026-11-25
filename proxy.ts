import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { demoPermitido } from '@/lib/env';

// Los apuntes y su buscador son públicos; el chat, aportar y admin requieren sesión.
const PUBLICAS = ['/', '/login', '/unirse', '/auth', '/docs', '/api/search'];

function esPublica(pathname: string) {
  return PUBLICAS.some((p) => (p === '/' ? pathname === '/' : pathname === p || pathname.startsWith(`${p}/`)));
}

/**
 * Refresca la sesión de Supabase en cada navegación y protege las rutas
 * privadas (chat, aportar, admin). Sin Supabase configurado solo deja pasar
 * en desarrollo (o con DAM_DEMO=1); en producción falla cerrada con un 503.
 */
export default async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    if (demoPermitido) return NextResponse.next();
    return new NextResponse('Supabase no configurado: define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY antes del build.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  // 1) Dominio canónico: el login usa una cookie (PKCE) atada al dominio donde se pidió
  //    el enlace, así que en producción todos los alias de Vercel redirigen al dominio oficial.
  const canonico = dominioCanonico();
  if (canonico && request.nextUrl.host !== canonico.host) {
    const destino = new URL(request.nextUrl.pathname + request.nextUrl.search, canonico.origin);
    return NextResponse.redirect(destino, 308);
  }

  // 2) Si Supabase nos devuelve el ?code= a otra página (p. ej. a la Site URL "/"),
  //    lo mandamos al callback para completar el login igualmente.
  const code = request.nextUrl.searchParams.get('code');
  if (code && !request.nextUrl.pathname.startsWith('/auth/')) {
    const cb = request.nextUrl.clone();
    cb.pathname = '/auth/callback';
    cb.search = `?code=${encodeURIComponent(code)}&next=/docs`;
    return NextResponse.redirect(cb);
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        // Cabeceras anti-caché que @supabase/ssr pide al renovar la sesión (que ninguna CDN la comparta)
        for (const [k, v] of Object.entries(headers ?? {})) response.headers.set(k, v);
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  if (!user && !esPublica(pathname)) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    const login = request.nextUrl.clone();
    login.pathname = '/login';
    login.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(login);
  }
  return response;
}

function dominioCanonico(): URL | null {
  if (process.env.VERCEL_ENV !== 'production') return null;
  try {
    return process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : null;
  } catch {
    return null;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};
