import type { Metadata } from 'next';
import Link from 'next/link';
import { Database, Info, Inbox, LayoutDashboard, TriangleAlert, Users } from 'lucide-react';
import { requireAdmin } from '@/lib/auth';
import { env, isSupabaseConfigured } from '@/lib/env';
import { getModulos, getNombresModulos } from '@/components/aportaciones/modulos';
import { getDatosAdmin, parseFiltros, LIMITE_LISTA } from '@/components/admin/datos';
import { StatCards } from '@/components/admin/stat-cards';
import { FiltrosAdmin } from '@/components/admin/filtros';
import { ListaAportaciones } from '@/components/admin/lista-aportaciones';
import { AlumnosTabla } from '@/components/admin/alumnos-tabla';
import { MODULO_OTRO } from '@/lib/aportaciones';

export const metadata: Metadata = {
  title: 'Panel de administración',
  robots: { index: false, follow: false },
};

export default async function AdminPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const perfil = await requireAdmin();
  const filtros = parseFiltros(await props.searchParams);
  const { stats, aportaciones, hayMas, alumnos, error } = await getDatosAdmin(filtros);
  const nombresModulos = getNombresModulos();
  const modulos = [...getModulos().map((m) => ({ slug: m.slug, nombre: m.grupo ? `${m.nombre} · ${m.grupo}` : m.nombre })), { slug: MODULO_OTRO, nombre: 'Otro' }];
  const demo = !isSupabaseConfigured;
  const hayFiltros = Boolean(filtros.q || filtros.modulo);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-fd-primary/10 px-3 py-1 text-xs font-medium text-fd-primary">
            <LayoutDashboard className="size-3.5" aria-hidden />
            Panel de administración
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Hola, {perfil.nombre ?? 'admin'}</h1>
          <p className="mt-1 text-fd-muted-foreground">Revisa lo que manda la clase y controla el uso del chat.</p>
        </div>
        <nav aria-label="Secciones del panel" className="flex gap-2 text-sm">
          <a href="#aportaciones" className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-medium transition hover:bg-fd-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring">
            <Inbox className="size-4" aria-hidden /> Aportaciones
          </a>
          <a href="#alumnos" className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-medium transition hover:bg-fd-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring">
            <Users className="size-4" aria-hidden /> Alumnos
          </a>
        </nav>
      </header>

      {demo && (
        <div role="status" className="mb-6 flex gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200">
          <Database className="mt-0.5 size-4 shrink-0" aria-hidden />
          <div>
            <p className="font-medium">Modo demo: sin base de datos</p>
            <p className="mt-1 opacity-90">
              Este panel funciona con Supabase. Configura <code>NEXT_PUBLIC_SUPABASE_URL</code>,{' '}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> y <code>SUPABASE_SERVICE_ROLE_KEY</code>, ejecuta{' '}
              <code>supabase/schema.sql</code> y hazte admin con la última línea del script. Mientras tanto verás el
              panel vacío.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div role="alert" className="mb-6 flex gap-3 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-800 dark:text-red-200">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          <div>
            <p className="font-medium">Algunos datos no se han podido cargar</p>
            <p className="mt-1 break-words opacity-90">{error}</p>
          </div>
        </div>
      )}

      <section aria-label="Resumen">
        <StatCards stats={stats} />
      </section>

      <section id="aportaciones" aria-labelledby="titulo-aportaciones" className="mt-12 scroll-mt-20">
        <h2 id="titulo-aportaciones" className="mb-4 text-xl font-semibold tracking-tight">
          Aportaciones
        </h2>
        <FiltrosAdmin
          estado={filtros.estado}
          modulo={filtros.modulo}
          q={filtros.q}
          contadores={{ pendiente: stats.pendiente, aprobada: stats.aprobada, descartada: stats.descartada }}
          modulos={modulos}
        />
        <div className="mt-4">
          <ListaAportaciones
            key={`${filtros.estado}|${filtros.modulo ?? ''}|${filtros.q}`}
            aportaciones={aportaciones}
            filtroEstado={filtros.estado}
            hayFiltros={hayFiltros}
            nombresModulos={nombresModulos}
          />
          {hayMas && (
            <p className="mt-4 flex items-center justify-center gap-2 text-center text-sm text-fd-muted-foreground">
              <Info className="size-4" aria-hidden />
              Mostrando las {LIMITE_LISTA} más {filtros.estado === 'pendiente' ? 'antiguas' : 'recientes'}. Usa la
              búsqueda o los filtros para encontrar el resto.
            </p>
          )}
          {demo && (
            <p className="mt-4 text-center text-sm text-fd-muted-foreground">
              Sin Supabase no hay aportaciones que mostrar. Puedes ver cómo se envían en{' '}
              <Link href="/aportar" className="font-medium text-fd-primary hover:underline">
                Aportar
              </Link>
              .
            </p>
          )}
        </div>
      </section>

      <section id="alumnos" aria-labelledby="titulo-alumnos" className="mt-12 scroll-mt-20">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="titulo-alumnos" className="text-xl font-semibold tracking-tight">
            Alumnos
          </h2>
          <span className="text-sm text-fd-muted-foreground">
            {stats.alumnos} en la clase · límite de chat {env.chatLimiteDiario}/día
          </span>
        </div>
        <AlumnosTabla alumnos={alumnos} limiteChat={env.chatLimiteDiario} />
      </section>
    </main>
  );
}
