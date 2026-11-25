'use client';

import { useActionState } from 'react';
import { enviarEnlace, type LoginState } from './actions';

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(enviarEnlace, null);
  return (
    <form action={action} className="mt-6 space-y-3">
      <input type="hidden" name="next" value={next} />
      <label className="block text-sm font-medium" htmlFor="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="tu@correo.com"
        className="w-full rounded-lg border bg-fd-background px-3 py-2 outline-none focus:ring-2 focus:ring-fd-primary"
      />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-fd-primary px-3 py-2 font-medium text-fd-primary-foreground disabled:opacity-60"
      >
        {pending ? 'Enviando…' : 'Enviar enlace'}
      </button>
      {state && (
        <p className={state.ok ? 'text-sm text-green-600 dark:text-green-400' : 'text-sm text-red-600 dark:text-red-400'}>
          {state.mensaje}
        </p>
      )}
    </form>
  );
}
