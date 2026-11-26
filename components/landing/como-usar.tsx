import Link from 'next/link';
import { Atajo } from './atajo';

const fila = 'flex items-center justify-between gap-3 py-2.5';

/** Panel corto junto a la cabecera: cómo sacarle partido a la web. */
export function ComoUsar() {
  return (
    <section aria-labelledby="como-usar" className="hidden rounded-lg border px-4 pt-3.5 pb-1.5 text-sm md:block">
      <h2 id="como-usar" className="font-semibold tracking-tight">
        Cómo usarlo
      </h2>
      <ul className="mt-1.5 divide-y divide-fd-border">
        <li className={fila}>
          <span className="text-fd-muted-foreground">
            <span className="font-medium text-fd-foreground">Buscar</span> en todos los apuntes
          </span>
          <span className="shrink-0">
            <Atajo tecla="K" />
          </span>
        </li>
        <li className={fila}>
          <span className="text-fd-muted-foreground">
            <span className="font-medium text-fd-foreground">Tutor</span> con el código de clase
          </span>
          <span className="shrink-0">
            <Atajo tecla="J" />
          </span>
        </li>
        <li className={fila}>
          <span className="text-fd-muted-foreground">
            <span className="font-medium text-fd-foreground">Aportar</span> fotos, enlaces o fallos
          </span>
          <span className="shrink-0">
            <Link
              href="/aportar"
              className="rounded-sm font-medium text-fd-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
            >
              Abrir <span aria-hidden>→</span>
            </Link>
          </span>
        </li>
      </ul>
    </section>
  );
}
