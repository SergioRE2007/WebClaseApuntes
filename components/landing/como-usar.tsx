import { Atajo } from './atajo';

/** Tres líneas sobre cómo sacarle partido a la web. */
export function ComoUsar() {
  return (
    <section aria-labelledby="como-usar" className="mt-14">
      <h2 id="como-usar" className="border-b pb-2 text-base font-semibold tracking-tight">
        Cómo usarlo
      </h2>
      <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[7rem_1fr]">
        <dt className="font-medium">Buscar</dt>
        <dd className="text-fd-muted-foreground">
          <Atajo tecla="K" /> desde cualquier página busca en todos los apuntes.
        </dd>
        <dt className="font-medium">Tutor</dt>
        <dd className="text-fd-muted-foreground">
          <Atajo tecla="J" /> abre el tutor, que responde con los apuntes. Requiere entrar con tu correo y el código de
          clase.
        </dd>
        <dt className="font-medium">Aportar</dt>
        <dd className="text-fd-muted-foreground">
          Fotos de la pizarra, enlaces o correcciones: se revisan y se añaden a los apuntes.
        </dd>
      </dl>
    </section>
  );
}
