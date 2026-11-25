'use client';

import { useActionState, useState } from 'react';
import { CircleAlert, Loader2, MailCheck } from 'lucide-react';
import { authBoton, authInput } from '@/components/layout/auth-estilos';
import { enviarEnlace, type LoginState } from './actions';

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(enviarEnlace, null);
  // Controlado: React 19 vacía los campos tras enviar el formulario y así no hay que reescribir el correo.
  const [email, setEmail] = useState('');
  return (
    <form action={action} className="mt-6 space-y-4">
      <input type="hidden" name="next" value={next} />
      <div className="space-y-1.5">
        <label className="block text-sm font-medium" htmlFor="email">
          Correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="tu@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={state && !state.ok ? true : undefined}
          aria-describedby={state ? 'login-estado' : undefined}
          className={authInput}
        />
      </div>
      <button type="submit" disabled={pending} className={authBoton}>
        {pending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : null}
        {pending ? 'Enviando…' : 'Enviar enlace'}
      </button>
      {state && (
        <p
          id="login-estado"
          role="status"
          aria-live="polite"
          className={
            state.ok
              ? 'flex items-start gap-2 rounded-md border border-green-600/20 bg-green-600/5 p-3 text-sm text-green-800 dark:text-green-300'
              : 'flex items-start gap-2 rounded-md border border-red-600/20 bg-red-600/5 p-3 text-sm text-red-800 dark:text-red-300'
          }
        >
          {state.ok ? (
            <MailCheck aria-hidden className="mt-0.5 size-4 shrink-0" />
          ) : (
            <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          )}
          {state.mensaje}
        </p>
      )}
    </form>
  );
}
