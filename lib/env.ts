/**
 * Configuración centralizada. Si Supabase no está configurado (desarrollo local
 * sin .env), la web funciona en "modo demo": sin login, sin subidas y con el
 * chat accesible solo si hay ANTHROPIC_API_KEY.
 */
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  claseCodigo: process.env.CLASE_CODIGO ?? '',
  chatLimiteDiario: Number(process.env.CHAT_LIMITE_DIARIO ?? '40'),
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
};

export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);

/**
 * El "modo demo" (admin ficticio, sin login, chat sin límite) solo se permite en
 * desarrollo o si se activa explícitamente con DAM_DEMO=1. En producción, si faltan
 * las variables de Supabase (que Next incrusta en tiempo de BUILD), la web falla
 * cerrada en vez de abrirse a cualquiera.
 */
export const demoPermitido = process.env.NODE_ENV !== 'production' || process.env.DAM_DEMO === '1';

/** true si la app está en modo demo y se permite (sin Supabase y demoPermitido). */
export const modoDemo = !isSupabaseConfigured && demoPermitido;

let avisado = false;
/** Avisa una sola vez en logs si la app arranca sin Supabase en producción. */
export function avisarConfiguracion() {
  if (avisado || isSupabaseConfigured || process.env.NODE_ENV !== 'production') return;
  avisado = true;
  console.error(
    demoPermitido
      ? '[config] Supabase NO configurado: modo demo activo en producción (DAM_DEMO=1). Cualquiera es admin.'
      : '[config] Supabase NO configurado en producción: el acceso queda bloqueado. Define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY antes del build.',
  );
}
