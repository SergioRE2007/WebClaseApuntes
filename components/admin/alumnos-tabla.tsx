import { Shield, Users } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { AlumnoAdmin } from './datos';

export function AlumnosTabla({ alumnos, limiteChat }: { alumnos: AlumnoAdmin[]; limiteChat: number }) {
  if (alumnos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed p-10 text-center">
        <Users className="size-8 text-fd-muted-foreground" aria-hidden />
        <p className="font-medium">Nadie se ha registrado todavía</p>
        <p className="max-w-sm text-sm text-fd-muted-foreground">
          Comparte el enlace de la web y el código de clase para que se unan.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-fd-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <caption className="sr-only">Alumnos registrados</caption>
          <thead className="border-b bg-fd-muted/50 text-xs uppercase tracking-wide text-fd-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Nombre</th>
              <th scope="col" className="px-4 py-3 font-medium">Email</th>
              <th scope="col" className="px-4 py-3 font-medium">En la clase</th>
              <th scope="col" className="px-4 py-3 font-medium">Rol</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Chat hoy</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Aportaciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {alumnos.map((a) => {
              const cerca = a.mensajesHoy >= limiteChat * 0.8;
              return (
                <tr key={a.id} className="transition hover:bg-fd-accent/30">
                  <th scope="row" className="px-4 py-3 font-medium">
                    {a.nombre ?? <span className="font-normal italic text-fd-muted-foreground">Sin nombre</span>}
                  </th>
                  <td className="max-w-[14rem] truncate px-4 py-3 text-fd-muted-foreground" title={a.email}>
                    {a.email}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
                        a.clase_ok
                          ? 'bg-green-500/15 text-green-700 ring-green-500/30 dark:text-green-300'
                          : 'bg-fd-muted text-fd-muted-foreground ring-fd-border',
                      )}
                    >
                      {a.clase_ok ? 'Sí' : 'Sin código'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {a.rol === 'admin' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-fd-primary">
                        <Shield className="size-3.5" aria-hidden /> Admin
                      </span>
                    ) : (
                      <span className="text-xs text-fd-muted-foreground">Alumno</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <span className={cn(cerca && a.mensajesHoy > 0 && 'font-semibold text-amber-600 dark:text-amber-400')}>
                      {a.mensajesHoy}
                    </span>
                    <span className="text-fd-muted-foreground"> / {limiteChat}</span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{a.aportaciones}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
