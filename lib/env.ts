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
