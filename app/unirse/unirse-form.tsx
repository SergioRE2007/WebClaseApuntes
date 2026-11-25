'use client';

import { useActionState } from 'react';
import { unirseClase, type UnirseState } from './actions';

export function UnirseForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<UnirseState, FormData>(unirseClase, null);
  return (
    <form action={action} className="mt-6 space-y-3">
      <input type="hidden" name="next" value={next} />
      <label className="block text-sm font-medium" htmlFor="nombre">Tu nombre</label>
      <input id="nombre" name="nombre" required maxLength={60}
        className="w-full rounded-lg border bg-fd-background px-3 py-2 outline-none focus:ring-2 focus:ring-fd-primary" />
      <label className="block text-sm font-medium" htmlFor="codigo">Código de clase</label>
      <input id="codigo" name="codigo" required autoComplete="off"
        className="w-full rounded-lg border bg-fd-background px-3 py-2 uppercase tracking-widest outline-none focus:ring-2 focus:ring-fd-primary" />
      <button type="submit" disabled={pending}
        className="w-full rounded-lg bg-fd-primary px-3 py-2 font-medium text-fd-primary-foreground disabled:opacity-60">
        {pending ? 'Comprobando…' : 'Entrar a la clase'}
      </button>
      {state && <p className="text-sm text-red-600 dark:text-red-400">{state.mensaje}</p>}
    </form>
  );
}
