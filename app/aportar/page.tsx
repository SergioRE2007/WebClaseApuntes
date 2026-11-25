import type { Metadata } from 'next';
import { Camera, ClipboardPaste, Info, ShieldCheck, Sparkles } from 'lucide-react';
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
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8">
        <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-fd-primary/10 px-3 py-1 text-xs font-medium text-fd-primary">
          <Sparkles className="size-3.5" aria-hidden />
          Entre todos, mejores apuntes
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Aportar</h1>
        <p className="mt-2 text-fd-muted-foreground">
          ¿Tienes una foto de la pizarra, un vídeo que lo explica mejor o has visto un error? Mándalo y, tras revisarlo,
          se añadirá a los apuntes.
        </p>
        <ul className="mt-4 grid gap-2 text-sm text-fd-muted-foreground sm:grid-cols-3">
          <li className="hidden items-center gap-2 [@media(pointer:fine)]:flex">
            <ClipboardPaste className="size-4 shrink-0 text-fd-primary" aria-hidden />
            Pega capturas con Ctrl+V
          </li>
          <li className="flex items-center gap-2">
            <Camera className="size-4 shrink-0 text-fd-primary" aria-hidden />
            Desde el móvil, haz la foto y súbela
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="size-4 shrink-0 text-fd-primary" aria-hidden />
            Solo lo ve quien revisa
          </li>
        </ul>
      </header>

      {demo && (
        <div
          role="status"
          className="mb-6 flex gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200"
        >
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          <div>
            <p className="font-medium">Modo demo: el envío está desactivado</p>
            <p className="mt-1 opacity-90">
              Para subir aportaciones hay que configurar Supabase (variables <code>NEXT_PUBLIC_SUPABASE_URL</code> y{' '}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>) y ejecutar <code>supabase/schema.sql</code>.
            </p>
          </div>
        </div>
      )}

      <section aria-labelledby="nueva-aportacion" className="rounded-2xl border bg-fd-card p-4 shadow-sm sm:p-6">
        <h2 id="nueva-aportacion" className="sr-only">
          Nueva aportación
        </h2>
        <AportarForm userId={perfil.id} modulos={modulos} disabled={demo} />
      </section>

      <section aria-labelledby="mis-aportaciones" className="mt-12">
        <div className="mb-4 flex items-baseline justify-between gap-2">
          <h2 id="mis-aportaciones" className="text-xl font-semibold tracking-tight">
            Mis aportaciones
          </h2>
          {filas.length > 0 && (
            <span className="text-sm text-fd-muted-foreground">
              {filas.length} {filas.length === 1 ? 'envío' : 'envíos'}
            </span>
          )}
        </div>
        {error ? (
          <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
            No se han podido cargar tus aportaciones. Recarga la página en un momento.
          </p>
        ) : (
          <MisAportaciones aportaciones={filas} nombresModulos={nombresModulos} />
        )}
      </section>
    </main>
  );
}
