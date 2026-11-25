import { redirect } from 'next/navigation';
import { getPerfil } from '@/lib/auth';
import { LoginForm } from './login-form';

export const metadata = { title: 'Entrar' };

export default async function LoginPage(props: PageProps<'/login'>) {
  const sp = await props.searchParams;
  const next = typeof sp.next === 'string' ? sp.next : '/docs';
  const perfil = await getPerfil();
  if (perfil?.clase_ok) redirect(next);
  if (perfil) redirect(`/unirse?next=${encodeURIComponent(next)}`);

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl border bg-fd-card p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">Entrar a DAM Apuntes</h1>
        <p className="mt-2 text-sm text-fd-muted-foreground">
          Te enviamos un enlace a tu correo. Sin contraseñas.
        </p>
        {sp.error === 'enlace' && (
          <p className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
            El enlace ha caducado o no es válido. Pide uno nuevo.
          </p>
        )}
        <LoginForm next={next} />
      </div>
    </main>
  );
}
