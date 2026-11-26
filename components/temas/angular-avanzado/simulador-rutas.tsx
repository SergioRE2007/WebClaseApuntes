'use client';

import { useId, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from 'motion/react';
import { CornerDownRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { avisoCaja, avisoTexto, bloque, botonSecundario, cabecera, etiqueta, malCaja, malTexto, tituloBloque } from '@/components/interactive/estilos';

/**
 * Simulador del "Portal educativo" de proyecto-rutas (19/11). Resuelve la URL
 * con la misma tabla de rutas de clase (first-match-wins, rutas hijas y
 * redirecciones) y pinta qué componente cae en cada <router-outlet />.
 * Opciones: exact en routerLinkActiveOptions, routerLinkActive también en el
 * menú principal (en clase solo iba en el del aula), la redirección por
 * defecto dentro de children (apartado 4.3 del enunciado) y el experimento de
 * la ruta plana 'aula/avisos'.
 */

type Comp = 'InicioComponent' | 'AulaComponent' | 'AyudaComponent' | 'MaterialesComponent' | 'AvisosComponent';

interface Resultado {
  url: string;
  principal?: Comp;
  hija?: Comp | null;
  redirecciones: string[];
  error?: string;
}

interface Opciones {
  exacto: boolean;
  activoPrincipal: boolean;
  porDefecto: boolean;
  plana: boolean;
}

function resolver(entrada: string, o: Opciones): Resultado {
  const redirecciones: string[] = [];
  let url = '/' + entrada.split('/').filter(Boolean).join('/');
  for (let vuelta = 0; vuelta < 3; vuelta++) {
    const s = url.split('/').filter(Boolean);
    if (s.length === 0) {
      redirecciones.push("'' → redirectTo: '/inicio'");
      url = '/inicio';
      continue;
    }
    if (s.length === 1 && s[0] === 'inicio') return { url, principal: 'InicioComponent', redirecciones };
    if (s.length === 1 && s[0] === 'ayuda') return { url, principal: 'AyudaComponent', redirecciones };
    if (o.plana && s.length === 2 && s[0] === 'aula' && s[1] === 'avisos') return { url, principal: 'AvisosComponent', redirecciones };
    if (s[0] === 'aula') {
      if (s.length === 1) {
        if (o.porDefecto) {
          redirecciones.push("aula > '' → redirectTo: 'materiales'");
          url = '/aula/materiales';
          continue;
        }
        return { url, principal: 'AulaComponent', hija: null, redirecciones };
      }
      if (s.length === 2 && s[1] === 'materiales') return { url, principal: 'AulaComponent', hija: 'MaterialesComponent', redirecciones };
      if (s.length === 2 && s[1] === 'avisos' && !o.plana) return { url, principal: 'AulaComponent', hija: 'AvisosComponent', redirecciones };
    }
    return { url, redirecciones, error: `NG04002: Cannot match any routes. URL Segment: '${s.join('/')}'` };
  }
  return { url, redirecciones, error: 'Demasiadas redirecciones' };
}

const activo = (enlace: string, url: string, exacto: boolean) => {
  if (exacto) return url === enlace;
  const a = enlace.split('/').filter(Boolean);
  const b = url.split('/').filter(Boolean);
  return a.every((seg, i) => b[i] === seg);
};

const TEXTO: Record<Comp, string> = {
  InicioComponent: 'inicio works!',
  AyudaComponent: 'ayuda works!',
  AulaComponent: 'aula works!',
  MaterialesComponent: 'materiales works!',
  AvisosComponent: 'avisos works!',
};

function Outlet({ nombre, children, clave }: { nombre: string; children: ReactNode; clave: string }) {
  const reducir = useReducedMotion();
  return (
    <div className="rounded-md border border-dashed p-2">
      <p className="mb-1.5 font-mono text-[11px] text-fd-muted-foreground">{`<router-outlet />`} de {nombre}</p>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={clave}
          initial={reducir ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducir ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function SimuladorRutas({ titulo = 'Simulador del Portal educativo' }: { titulo?: string }) {
  const [opc, setOpc] = useState<Opciones>({ exacto: true, activoPrincipal: true, porDefecto: false, plana: false });
  const [url, setUrl] = useState('/inicio');
  const [escrita, setEscrita] = useState('/');
  const idUrl = useId();
  const [res, setRes] = useState<Resultado>(() => resolver('/inicio', { exacto: true, activoPrincipal: true, porDefecto: false, plana: false }));

  const ir = (destino: string, o = opc) => {
    const r = resolver(destino, o);
    setRes(r);
    setUrl(r.url);
    setEscrita(r.url);
  };

  const cambiarOpcion = (k: keyof Opciones, v: boolean) => {
    const o = { ...opc, [k]: v };
    setOpc(o);
    if (k === 'porDefecto' || k === 'plana') ir(url, o);
  };

  const enlacesPrincipal = [
    { href: '/inicio', texto: 'Inicio' },
    { href: '/aula', texto: 'Aula' },
    { href: '/aula/materiales', texto: 'Aula > Materiales' },
    ...(opc.plana ? [{ href: '/aula/avisos', texto: 'Aula > Avisos' }] : []),
    { href: '/ayuda', texto: 'Ayuda' },
  ];

  const enlace = (href: string, texto: string, marcar: boolean) => {
    const on = marcar && activo(href, url, opc.exacto);
    return (
      <button
        key={href + texto}
        type="button"
        onClick={() => ir(href)}
        aria-current={on ? 'page' : undefined}
        className={cn(
          'rounded px-1.5 py-0.5 text-sm underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring',
          on ? 'bg-fd-primary/10 font-semibold text-fd-primary' : 'text-fd-foreground',
        )}
      >
        {texto}
      </button>
    );
  };

  const caja = (nombre: string, hijos: ReactNode) => (
    <div className="rounded-md border bg-fd-card p-2.5">
      <p className="mb-1 font-mono text-[11px] text-fd-muted-foreground">{nombre}</p>
      {hijos}
    </div>
  );

  const hija = res.hija;

  return (
    <MotionConfig reducedMotion="user">
      <section aria-label={titulo} className={bloque}>
        <div className={cabecera}>
          <span className={etiqueta}>Demo</span>
          <p className={cn(tituloBloque, 'min-w-0 flex-1')}>{titulo}</p>
        </div>
        <div className="grid gap-4 px-4 py-4 sm:px-5">
          {/* Barra de direcciones */}
          <form
            className="flex flex-wrap items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              ir(escrita);
            }}
          >
            <label htmlFor={idUrl} className="text-xs text-fd-muted-foreground">
              localhost:4200
            </label>
            <input
              id={idUrl}
              value={escrita}
              onChange={(e) => setEscrita(e.target.value)}
              className="min-h-10 min-w-0 flex-1 rounded-md border bg-fd-background px-2 py-1 font-mono text-sm sm:min-h-8"
              spellCheck={false}
            />
            <button type="submit" className={botonSecundario}>
              Ir
            </button>
          </form>

          <AnimatePresence initial={false}>
            {res.redirecciones.length > 0 && (
              <motion.div
                key={res.redirecciones.join('|') + res.url}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={cn('overflow-hidden rounded-md border px-3 py-2 text-xs', avisoCaja, avisoTexto)}
              >
                {res.redirecciones.map((r) => (
                  <p key={r} className="flex items-center gap-1.5 font-mono">
                    <CornerDownRight className="size-3.5 shrink-0" aria-hidden />
                    {r}
                  </p>
                ))}
                <p className="mt-1">URL final: {res.url}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AppComponent */}
          {caja(
            'AppComponent',
            <div className="grid gap-2">
              <p className="text-base font-semibold">Portal educativo</p>
              <nav aria-label="Menú principal (simulado)" className="flex flex-wrap gap-1">
                {enlacesPrincipal.map((l) => enlace(l.href, l.texto, opc.activoPrincipal))}
              </nav>
              <Outlet nombre="AppComponent" clave={res.error ? 'error' : (res.principal ?? 'nada')}>
                {res.error ? (
                  <p className={cn('rounded border px-2 py-1.5 font-mono text-xs', malCaja, malTexto)}>
                    ERROR {res.error}
                    <span className="mt-1 block font-sans text-fd-muted-foreground">
                      No hay ruta comodín ** en el proyecto de clase: la navegación falla y en la consola sale este error.
                    </span>
                  </p>
                ) : res.principal === 'AulaComponent' ? (
                  caja(
                    'AulaComponent',
                    <div className="grid gap-2">
                      <p className="text-sm">{TEXTO.AulaComponent}</p>
                      <p className="font-semibold">Aula virtual</p>
                      <nav aria-label="Menú del aula (simulado)" className="flex flex-wrap gap-1">
                        {enlace('/aula/materiales', 'Materiales', true)}
                        {enlace('/aula/avisos', 'Avisos', true)}
                      </nav>
                      <Outlet nombre="AulaComponent" clave={hija ?? 'vacio'}>
                        {hija ? (
                          caja(hija, <p className="text-sm">{TEXTO[hija]}</p>)
                        ) : (
                          <p className="text-xs text-fd-muted-foreground">(vacío: /aula no tiene hija por defecto)</p>
                        )}
                      </Outlet>
                    </div>,
                  )
                ) : res.principal ? (
                  caja(res.principal, <p className="text-sm">{TEXTO[res.principal]}</p>)
                ) : null}
              </Outlet>
            </div>,
          )}

          <fieldset className="grid gap-1.5 text-sm">
            <legend className="mb-1 text-xs font-medium text-fd-muted-foreground">Opciones</legend>
            <label className="flex items-start gap-2">
              <input type="checkbox" className="mt-1" checked={opc.exacto} onChange={(e) => cambiarOpcion('exacto', e.target.checked)} />
              <span>
                <code>[routerLinkActiveOptions]=&quot;{'{exact: true}'}&quot;</code>
              </span>
            </label>
            <label className="flex items-start gap-2">
              <input type="checkbox" className="mt-1" checked={opc.activoPrincipal} onChange={(e) => cambiarOpcion('activoPrincipal', e.target.checked)} />
              <span>
                <code>routerLinkActive</code> también en el menú principal <span className="text-fd-muted-foreground">(en clase solo en el del aula)</span>
              </span>
            </label>
            <label className="flex items-start gap-2">
              <input type="checkbox" className="mt-1" checked={opc.porDefecto} onChange={(e) => cambiarOpcion('porDefecto', e.target.checked)} />
              <span>
                Redirección por defecto en <code>children</code> <span className="text-fd-muted-foreground">(4.3 del enunciado)</span>
              </span>
            </label>
            <label className="flex items-start gap-2">
              <input type="checkbox" className="mt-1" checked={opc.plana} onChange={(e) => cambiarOpcion('plana', e.target.checked)} />
              <span>
                Experimento: ruta plana <code>&apos;aula/avisos&apos;</code> en la raíz
              </span>
            </label>
          </fieldset>
        </div>
      </section>
    </MotionConfig>
  );
}
