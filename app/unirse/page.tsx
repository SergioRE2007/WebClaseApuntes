import { redirect } from 'next/navigation';
import { rutaSegura } from '@/lib/ruta-segura';
import { getPerfil } from '@/lib/auth';
import { AuthShell } from '@/components/layout/auth-shell';
import { UnirseForm } from './unirse-form';

export const metadata = { title: 'Únete a la clase' };

export default async function UnirsePage(props: PageProps<'/unirse'>) {
  const sp = await props.searchParams;
  const next = rutaSegura(sp.next);
  const perfil = await getPerfil();
  if (!perfil) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (perfil.clase_ok) redirect(next);

  return (
    <AuthShell
      titulo="Únete a la clase"
      subtitulo="Mete el código de clase. Solo hace falta la primera vez."
      pie={`Has entrado como ${perfil.email}`}
    >
      <UnirseForm next={next} />
    </AuthShell>
  );
}
