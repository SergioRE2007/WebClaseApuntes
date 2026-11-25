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
      titulo="Entrar"
      subtitulo="Los apuntes son públicos. Entrar solo hace falta para usar el tutor y aportar material: te enviamos un enlace a tu correo, sin contraseñas."
      pie="La primera vez te pediremos el código de clase. El correo solo sirve para identificarte."
    >
      {typeof sp.error === 'string' && ERRORES[sp.error] && (
        <p
          role="alert"
          className="mt-5 rounded-md border border-red-600/20 bg-red-600/5 p-3 text-sm text-red-800 dark:text-red-300"
        >
          {ERRORES[sp.error]}
        </p>
      )}
      <LoginForm next={next} />
    </AuthShell>
  );
}

const ERRORES: Record<string, string> = {
  enlace: 'El enlace no es válido. Pide uno nuevo.',
  caducado: 'Ese enlace ya se usó o ha caducado. Pide uno nuevo y usa solo el último que te llegue.',
  navegador:
    'No se pudo completar el inicio de sesión. Abre el enlace en el mismo navegador (y dispositivo) donde lo pediste.',
};
