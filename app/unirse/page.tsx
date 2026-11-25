import { redirect } from 'next/navigation';
import { getPerfil } from '@/lib/auth';
import { UnirseForm } from './unirse-form';

export const metadata = { title: 'Únete a la clase' };

export default async function UnirsePage(props: PageProps<'/unirse'>) {
  const sp = await props.searchParams;
  const next = typeof sp.next === 'string' ? sp.next : '/docs';
  const perfil = await getPerfil();
  if (!perfil) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (perfil.clase_ok) redirect(next);

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl border bg-fd-card p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">Únete a la clase</h1>
        <p className="mt-2 text-sm text-fd-muted-foreground">
          Mete el código de clase. Solo hace falta la primera vez.
        </p>
        <UnirseForm next={next} />
      </div>
    </main>
  );
}
