import type { Metadata } from 'next';
import { requireAlumno } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/env';
import { createClient } from '@/lib/supabase/server';
import type { AportacionRow } from '@/lib/aportaciones';
import { getModulos, getNombresModulos } from '@/components/aportaciones/modulos';
import { AportarForm } from '@/components/aportaciones/aportar-form';
import { MisAportaciones } from '@/components/aportaciones/mis-aportaciones';

export const metadata: Metadata = {
  title: 'Aportar',
  description: 'Envía capturas, vídeos, documentos o enlaces para mejorar los apuntes de la clase.',
};

async function getMisAportaciones(userId: string): Promise<{ filas: AportacionRow[]; error: boolean }> {
  if (!isSupabaseConfigured) return { filas: [], error: false };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('aportaciones')
    .select('*')
    .eq('autor_id', userId)
    .order('creado_en', { ascending: false })
    .limit(50);
  return { filas: (data ?? []) as AportacionRow[], error: Boolean(error) };
}

export default async function AportarPage() {
  const perfil = await requireAlumno('/aportar');
  const modulos = getModulos();
  const nombresModulos = getNombresModulos();
  const { filas, error } = await getMisAportaciones(perfil.id);
  const demo = !isSupabaseConfigured;

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-[-0.015em] sm:text-3xl">Aportar</h1>
        <p className="mt-2 max-w-[62ch] text-[15px] leading-relaxed text-fd-muted-foreground">
          Una foto de la pizarra, un vídeo que lo explica mejor o un error que has visto. Se revisa y, si encaja, se
          añade a los apuntes. Solo lo ve quien revisa.
        </p>
      </header>

      {demo && (
        <div
          role="status"
          className="mb-6 rounded-md border border-amber-600/25 bg-amber-500/[0.06] p-4 text-sm dark:border-amber-400/25"
        >
          <p className="font-medium text-amber-800 dark:text-amber-300">Modo demo: el envío está desactivado</p>
          <p className="mt-1 text-fd-muted-foreground">
            Para subir aportaciones hay que configurar Supabase (variables <code>NEXT_PUBLIC_SUPABASE_URL</code> y{' '}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>) y ejecutar <code>supabase/schema.sql</code>.
          </p>
        </div>
      )}

      <section aria-labelledby="nueva-aportacion">
        <h2 id="nueva-aportacion" className="sr-only">
          Nueva aportación
        </h2>
        <AportarForm userId={perfil.id} modulos={modulos} disabled={demo} />
      </section>

      <section aria-labelledby="mis-aportaciones" className="mt-12">
        <div className="mb-4 flex items-baseline justify-between gap-2 border-b pb-2">
          <h2 id="mis-aportaciones" className="text-base font-semibold tracking-tight">
            Mis aportaciones
          </h2>
          {filas.length > 0 && (
            <span className="text-sm text-fd-muted-foreground">
              {filas.length} {filas.length === 1 ? 'envío' : 'envíos'}
            </span>
          )}
        </div>
        {error ? (
          <p role="alert" className="rounded-md border border-red-600/25 bg-red-600/[0.05] p-4 text-sm text-red-700 dark:border-red-400/25 dark:text-red-300">
            No se han podido cargar tus aportaciones. Recarga la página en un momento.
          </p>
        ) : (
          <MisAportaciones aportaciones={filas} nombresModulos={nombresModulos} />
        )}
      </section>
    </div>
  );
}
