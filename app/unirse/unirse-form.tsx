'use client';

import { useActionState, useState } from 'react';
import { CircleAlert, Loader2 } from 'lucide-react';
import { authBoton, authInput } from '@/components/layout/auth-estilos';
import { cn } from '@/lib/cn';
import { unirseClase, type UnirseState } from './actions';

export function UnirseForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<UnirseState, FormData>(unirseClase, null);
  // Controlados: React 19 vacía los campos tras enviar el formulario.
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  return (
    <form action={action} className="mt-6 space-y-4">
      <input type="hidden" name="next" value={next} />
      <div className="space-y-1.5">
        <label className="block text-sm font-medium" htmlFor="nombre">
          Tu nombre
        </label>
        <input
          id="nombre"
          name="nombre"
          required
          maxLength={60}
          autoComplete="name"
          placeholder="Nombre y apellido"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className={authInput}
        />
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium" htmlFor="codigo">
          Código de clase
        </label>
        <input
          id="codigo"
          name="codigo"
          required
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          aria-invalid={state ? true : undefined}
          aria-describedby={state ? 'unirse-estado codigo-ayuda' : 'codigo-ayuda'}
          className={cn(authInput, 'font-mono uppercase tracking-[0.25em]')}
        />
        <p id="codigo-ayuda" className="text-xs text-fd-muted-foreground">
          Te lo da quien gestiona la web. Da igual mayúsculas o minúsculas.
        </p>
      </div>
      <button type="submit" disabled={pending} className={authBoton}>
        {pending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : null}
        {pending ? 'Comprobando…' : 'Entrar a la clase'}
      </button>
      {state && (
        <p
          id="unirse-estado"
          role="alert"
          className="flex items-start gap-2 rounded-md border border-red-600/20 bg-red-600/5 p-3 text-sm text-red-800 dark:text-red-300"
        >
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          {state.mensaje}
        </p>
      )}
    </form>
  );
}
