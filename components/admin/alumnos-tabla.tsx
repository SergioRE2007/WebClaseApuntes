import { cn } from '@/lib/cn';
import type { AlumnoAdmin } from './datos';

function Nombre({ a }: { a: AlumnoAdmin }) {
  return a.nombre ? <>{a.nombre}</> : <span className="font-normal italic text-fd-muted-foreground">Sin nombre</span>;
}

/** Mensajes de hoy frente al límite: ámbar al acercarse (80 %), rojo al agotarlo. */
function ChatHoy({ a, limite }: { a: AlumnoAdmin; limite: number }) {
  const cerca = a.mensajesHoy > 0 && a.mensajesHoy >= limite * 0.8;
  const agotado = a.mensajesHoy > 0 && a.mensajesHoy >= limite;
  return (
    <span
      className="tabular-nums"
      title={agotado ? 'Ha llegado al límite de hoy' : cerca ? 'Cerca del límite de hoy' : undefined}
    >
      <span
        className={cn(
          cerca && 'font-semibold',
          agotado ? 'text-red-600 dark:text-red-400' : cerca && 'text-amber-600 dark:text-amber-400',
        )}
      >
        {a.mensajesHoy}
      </span>
      <span className="text-fd-muted-foreground"> / {limite}</span>
      {agotado && <span className="sr-only"> (límite alcanzado)</span>}
      {cerca && !agotado && <span className="sr-only"> (cerca del límite)</span>}
    </span>
  );
}

export function AlumnosTabla({ alumnos, limiteChat }: { alumnos: AlumnoAdmin[]; limiteChat: number }) {
  if (alumnos.length === 0) {
    return (
      <div className="rounded-md border border-dashed px-4 py-8 text-center">
        <p className="text-sm font-medium">Nadie se ha registrado todavía</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-fd-muted-foreground">
          Comparte el enlace de la web y el código de clase para que se unan.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Móvil: lista, sin scroll horizontal */}
      <ul className="divide-y rounded-md border sm:hidden">
        {alumnos.map((a) => (
          <li key={a.id} className="px-4 py-3">
            <div className="flex items-baseline justify-between gap-3">
              <p className="min-w-0 truncate text-sm font-medium">
                <Nombre a={a} />
              </p>
              {a.rol === 'admin' && <span className="shrink-0 text-xs font-medium">Admin</span>}
            </div>
            <p className="truncate text-xs text-fd-muted-foreground" title={a.email}>
              {a.email}
            </p>
            <p className="mt-1 text-xs text-fd-muted-foreground">
              {a.clase_ok ? 'En la clase' : <span className="text-fd-foreground">Sin código</span>} · Chat hoy{' '}
              <ChatHoy a={a} limite={limiteChat} /> · {a.aportaciones}{' '}
              {a.aportaciones === 1 ? 'aportación' : 'aportaciones'}
            </p>
          </li>
        ))}
      </ul>

      {/* Escritorio: tabla */}
      <div className="hidden overflow-hidden rounded-md border sm:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Alumnos registrados</caption>
            <thead className="border-b text-xs text-fd-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-medium">Nombre</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Email</th>
                <th scope="col" className="px-4 py-2.5 font-medium">En la clase</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Rol</th>
                <th scope="col" className="px-4 py-2.5 text-right font-medium">Chat hoy</th>
                <th scope="col" className="px-4 py-2.5 text-right font-medium">Aportaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {alumnos.map((a) => (
                <tr key={a.id} className="hover:bg-fd-accent/30">
                  <th scope="row" className="px-4 py-2.5 font-medium">
                    <Nombre a={a} />
                  </th>
                  <td className="max-w-[14rem] truncate px-4 py-2.5 text-fd-muted-foreground" title={a.email}>
                    {a.email}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <span className={cn('text-xs', a.clase_ok ? 'text-fd-foreground' : 'text-fd-muted-foreground')}>
                      {a.clase_ok ? 'Sí' : 'Sin código'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    {a.rol === 'admin' ? (
                      <span className="text-xs font-medium">Admin</span>
                    ) : (
                      <span className="text-xs text-fd-muted-foreground">Alumno</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-right">
                    <ChatHoy a={a} limite={limiteChat} />
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{a.aportaciones}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
