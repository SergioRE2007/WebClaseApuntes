import { cn } from '@/lib/cn';
import type { AlumnoAdmin } from './datos';

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
    <div className="overflow-hidden rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
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
            {alumnos.map((a) => {
              const cerca = a.mensajesHoy >= limiteChat * 0.8;
              return (
                <tr key={a.id} className="hover:bg-fd-accent/30">
                  <th scope="row" className="px-4 py-2.5 font-medium">
                    {a.nombre ?? <span className="font-normal italic text-fd-muted-foreground">Sin nombre</span>}
                  </th>
                  <td className="max-w-[14rem] truncate px-4 py-2.5 text-fd-muted-foreground" title={a.email}>
                    {a.email}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={cn(
                        'text-xs',
                        a.clase_ok ? 'text-fd-foreground' : 'text-fd-muted-foreground',
                      )}
                    >
                      {a.clase_ok ? 'Sí' : 'Sin código'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    {a.rol === 'admin' ? (
                      <span className="text-xs font-medium">
                        Admin
                      </span>
                    ) : (
                      <span className="text-xs text-fd-muted-foreground">Alumno</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    <span className={cn(cerca && a.mensajesHoy > 0 && 'font-semibold text-amber-600 dark:text-amber-400')}>
                      {a.mensajesHoy}
                    </span>
                    <span className="text-fd-muted-foreground"> / {limiteChat}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{a.aportaciones}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
