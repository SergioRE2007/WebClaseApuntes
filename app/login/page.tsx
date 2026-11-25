import { redirect } from 'next/navigation';
import { rutaSegura } from '@/lib/ruta-segura';
import { getPerfil } from '@/lib/auth';
import { AuthShell } from '@/components/layout/auth-shell';
import { LoginForm } from './login-form';

export const metadata = { title: 'Entrar' };

export default async function LoginPage(props: PageProps<'/login'>) {
  const sp = await props.searchParams;
  const next = rutaSegura(sp.next);
  const perfil = await getPerfil();
  if (perfil?.clase_ok) redirect(next);
  if (perfil) redirect(`/unirse?next=${encodeURIComponent(next)}`);

  return (
    <AuthShell
      titulo="Entrar a DAM Apuntes"
      subtitulo="Te enviamos un enlace a tu correo. Sin contraseñas."
      pie="Solo para la clase de DAM. La primera vez te pediremos el código de clase."
    >
      {sp.error === 'enlace' && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300"
        >
          El enlace ha caducado o no es válido. Pide uno nuevo.
        </p>
      )}
      <LoginForm next={next} />
    </AuthShell>
  );
}
