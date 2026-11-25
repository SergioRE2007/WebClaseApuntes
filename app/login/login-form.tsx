'use client';

import { useActionState } from 'react';
import { CircleAlert, Loader2, MailCheck, Send } from 'lucide-react';
import { authBoton, authInput } from '@/components/layout/auth-estilos';
import { enviarEnlace, type LoginState } from './actions';

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(enviarEnlace, null);
  return (
    <form action={action} className="mt-6 space-y-4">
      <input type="hidden" name="next" value={next} />
      <div className="space-y-1.5">
        <label className="block text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="tu@correo.com"
          aria-describedby={state ? 'login-estado' : undefined}
          className={authInput}
        />
      </div>
      <button type="submit" disabled={pending} className={authBoton}>
        {pending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <Send aria-hidden className="size-4" />}
        {pending ? 'Enviando…' : 'Enviar enlace'}
      </button>
      {state && (
        <p
          id="login-estado"
          role="status"
          aria-live="polite"
          className={
            state.ok
              ? 'flex items-start gap-2 rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-300'
              : 'flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300'
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
