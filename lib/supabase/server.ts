import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { createClient as createAdminSupabase } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { env } from '@/lib/env';

/** Cliente con la sesión del usuario (respeta RLS). */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Llamado desde un Server Component: el proxy ya refresca la sesión.
        }
      },
    },
  });
}

/**
 * Cliente con service role: SOLO en servidor y solo para tareas que el usuario
 * no puede hacer con RLS (p. ej. contar uso del chat). Nunca exponer al cliente.
 */
export function createServiceClient() {
  if (!env.supabaseServiceRoleKey) throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY');
  return createAdminSupabase(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
