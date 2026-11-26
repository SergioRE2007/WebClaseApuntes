'use client';

import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { avisoCaja, avisoTexto, bloque, botonSecundario, cabecera, etiqueta, okTexto, tituloBloque } from '@/components/interactive/estilos';

/**
 * Simulador del experimento del 03/11: renombrar a mano la tabla Media en
 * Supabase y ver qué dicen migrate status, migrate dev, migrate reset y
 * db pull. Las salidas de terminal están resumidas.
 */

type NombreTabla = 'Media' | 'MediaElement';

interface Estado {
  bd: NombreTabla;
  schema: NombreTabla;
  cliente: NombreTabla;
  filasUser: number;
}

const INICIAL: Estado = { bd: 'Media', schema: 'Media', cliente: 'Media', filasUser: 2 };
const MIGRACIONES = ['20251104112830_init', '20251120090028_add_media_table'];
const ESPERADA: NombreTabla = 'Media';
const camel = (n: NombreTabla) => n.charAt(0).toLowerCase() + n.slice(1);

interface Salida {
  comando: string;
  lineas: string[];
  nota: string;
}

type Accion = 'renombrar' | 'status' | 'dev' | 'reset' | 'pull' | 'generate' | 'deshacer';

function ejecutar(e: Estado, a: Accion): { e: Estado; s: Salida } {
  const drift = e.bd !== ESPERADA;
  switch (a) {
    case 'renombrar':
      return {
        e: { ...e, bd: 'MediaElement' },
        s: {
          comando: 'Supabase → Table Editor → renombrar "Media" a "MediaElement"',
          lineas: ['ALTER TABLE "Media" RENAME TO "MediaElement";'],
          nota: 'La base de datos se ha cambiado a mano, fuera de Prisma. Ya no coincide con lo que dicen las migraciones: eso es el drift.',
        },
      };
    case 'status':
      return {
        e,
        s: {
          comando: 'npx prisma migrate status',
          lineas: ['2 migrations found in prisma/migrations', '', 'Database schema is up to date!'],
          nota: drift
            ? 'No ve el drift: migrate status solo compara la carpeta prisma/migrations con la tabla _prisma_migrations, y las dos siguen diciendo lo mismo.'
            : 'Las dos migraciones de la carpeta están apuntadas en _prisma_migrations.',
        },
      };
    case 'dev':
      if (drift)
        return {
          e,
          s: {
            comando: 'npx prisma migrate dev',
            lineas: [
              'Drift detected: Your database schema is not in sync with your migration history.',
              '',
              '[+] Added tables',
              `  - ${e.bd}`,
              '',
              '[-] Removed tables',
              '  - Media',
              '',
              '(… también salen los índices y la clave ajena)',
              '',
              '? We need to reset the "public" schema at "…pooler.supabase.com:5432"',
              'Do you want to continue? All data will be lost. › (y/N)',
            ],
            nota: 'migrate dev sí compara la base real con la que dejarían las migraciones, detecta el drift y propone un reset (se pierden los datos). En clase se arregló con migrate reset.',
          },
        };
      if (e.schema !== ESPERADA)
        return {
          e,
          s: {
            comando: 'npx prisma migrate dev',
            lineas: ['? Enter a name for the new migration: ›'],
            nota: `La base coincide con las migraciones, pero schema.prisma dice ${e.schema}: migrate dev quiere crear una migración nueva para llegar a ese schema (Prisma no detecta renombrados: borraría Media y crearía ${e.schema}).`,
          },
        };
      return {
        e,
        s: {
          comando: 'npx prisma migrate dev',
          lineas: ['Already in sync, no schema change or pending migration was found.'],
          nota: 'schema.prisma, las migraciones y la base dicen lo mismo: no hay nada que hacer.',
        },
      };
    case 'reset':
      return {
        e: { ...e, bd: ESPERADA, filasUser: 0, cliente: e.schema },
        s: {
          comando: 'npx prisma migrate reset',
          lineas: [
            '? Are you sure you want to reset your database? All data will be lost. › y',
            '',
            'Database reset successful',
            '',
            'The following migration(s) have been applied:',
            '',
            'migrations/',
            ...MIGRACIONES.flatMap((m) => [`  └─ ${m}/`, '    └─ migration.sql']),
            '',
            'Generated Prisma Client (v6.19.0) to ./node_modules/@prisma/client',
          ],
          nota: 'Borra la base, la vuelve a crear aplicando todas las migraciones en orden y genera el cliente. La tabla vuelve a llamarse Media, pero los datos se han perdido.',
        },
      };
    case 'pull':
      return {
        e: { ...e, schema: e.bd },
        s: {
          comando: 'npx prisma db pull',
          lineas: ['Introspected 2 models and wrote them into prisma/schema.prisma', '', 'Run prisma generate to generate Prisma Client.'],
          nota:
            e.bd === e.schema
              ? 'schema.prisma ya coincidía con la base: se reescribe igual.'
              : e.bd !== ESPERADA
                ? `Ahora manda la base: schema.prisma se reescribe con el modelo ${e.bd}, con map: para los nombres de las restricciones (por ejemplo @id(map: "Media_pkey")). Falta prisma generate para que el cliente lo vea.`
                : `Ahora manda la base: schema.prisma vuelve a tener el modelo ${e.bd}, igual que la base. Falta prisma generate para que el cliente lo vea.`,
        },
      };
    case 'generate':
      return {
        e: { ...e, cliente: e.schema },
        s: {
          comando: 'npx prisma generate',
          lineas: ['Generated Prisma Client (v6.19.0) to ./node_modules/@prisma/client'],
          nota:
            e.schema !== ESPERADA
              ? `El cliente ahora tiene prisma.${camel(e.schema)} en vez de prisma.media: el código que usara prisma.media dejaría de compilar.`
              : 'El cliente se genera a partir de schema.prisma: prisma.user y prisma.media.',
        },
      };
    case 'deshacer':
      return {
        e: { ...e, schema: ESPERADA },
        s: {
          comando: 'Deshacer el cambio de prisma/schema.prisma',
          lineas: ['schema.prisma vuelve a tener model Media'],
          nota: 'El archivo vuelve a coincidir con las migraciones (el cliente generado no cambia hasta otro prisma generate).',
        },
      };
  }
}

function Panel({ titulo, children, aviso }: { titulo: string; children: ReactNode; aviso?: boolean }) {
  return (
    <div className={cn('min-w-0 rounded-md border px-3 py-2', aviso && avisoCaja)}>
      <p className={cn('mb-1.5 text-xs font-medium', aviso ? avisoTexto : 'text-fd-muted-foreground')}>{titulo}</p>
      <div className="space-y-0.5 font-mono text-xs">{children}</div>
    </div>
  );
}

function Nombre({ valor, reducir }: { valor: string; reducir: boolean | null }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={valor}
        initial={reducir ? false : { opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reducir ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: 4 }}
        transition={{ duration: 0.2 }}
        className="inline-block"
      >
        {valor}
      </motion.span>
    </AnimatePresence>
  );
}

const BOTONES: { a: Accion; texto: string; titulo: string }[] = [
  { a: 'renombrar', texto: 'Renombrar en Supabase', titulo: 'Cambiar la tabla a mano' },
  { a: 'status', texto: 'migrate status', titulo: 'npx prisma migrate status' },
  { a: 'dev', texto: 'migrate dev', titulo: 'npx prisma migrate dev' },
  { a: 'reset', texto: 'migrate reset', titulo: 'npx prisma migrate reset' },
  { a: 'pull', texto: 'db pull', titulo: 'npx prisma db pull' },
  { a: 'generate', texto: 'generate', titulo: 'npx prisma generate' },
  { a: 'deshacer', texto: 'Deshacer schema.prisma', titulo: 'Volver a la versión del repositorio' },
];

export function SimuladorMigraciones({ titulo = 'Migraciones y drift con Prisma' }: { titulo?: string }) {
  const reducir = useReducedMotion();
  const [estado, setEstado] = useState<Estado>(INICIAL);
  const [salida, setSalida] = useState<Salida | null>(null);

  const drift = estado.bd !== ESPERADA;
  const schemaDistinto = estado.schema !== ESPERADA;

  const pulsar = (a: Accion) => {
    const r = ejecutar(estado, a);
    setEstado(r.e);
    setSalida(r.s);
  };

  const deshabilitado = (a: Accion) => (a === 'renombrar' && drift) || (a === 'deshacer' && !schemaDistinto);

  return (
    <section aria-label={titulo} className={bloque}>
      <div className={cabecera}>
        <span className={etiqueta}>Demo</span>
        <p className={cn(tituloBloque, 'min-w-0 flex-1')}>{titulo}</p>
        <span className={cn('text-xs font-medium', drift ? avisoTexto : okTexto)} aria-live="polite">
          {drift ? 'Hay drift' : 'Sin drift'}
        </span>
      </div>

      <div className="space-y-4 px-4 py-4 sm:px-5">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Panel titulo="prisma/migrations (repo)">
            {MIGRACIONES.map((m) => (
              <p key={m} className="truncate" title={m}>
                {m}/
              </p>
            ))}
          </Panel>
          <Panel titulo="Tabla _prisma_migrations">
            {MIGRACIONES.map((m) => (
              <p key={m} className="truncate" title={m}>
                {m.slice(15)} · aplicada
              </p>
            ))}
          </Panel>
          <Panel titulo="Tablas en la base (Supabase)" aviso={drift}>
            <p>&quot;User&quot; · {estado.filasUser} filas</p>
            <p>
              &quot;<Nombre valor={estado.bd} reducir={reducir} />&quot; · 0 filas
            </p>
            <p className="text-fd-muted-foreground">_prisma_migrations</p>
          </Panel>
          <Panel titulo="schema.prisma" aviso={schemaDistinto}>
            <p>model User</p>
            <p>
              model <Nombre valor={estado.schema} reducir={reducir} />
            </p>
            <p className="pt-1 text-fd-muted-foreground">
              cliente: prisma.user, prisma.<Nombre valor={camel(estado.cliente)} reducir={reducir} />
            </p>
          </Panel>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {BOTONES.map((b) => (
            <button
              key={b.a}
              type="button"
              title={b.titulo}
              onClick={() => pulsar(b.a)}
              disabled={deshabilitado(b.a)}
              className={cn(botonSecundario, b.a !== 'renombrar' && b.a !== 'deshacer' && 'font-mono text-xs')}
            >
              {b.texto}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setEstado(INICIAL);
              setSalida(null);
            }}
            className={cn(botonSecundario, 'ml-auto')}
          >
            <RotateCcw className="size-3.5" aria-hidden />
            Empezar de nuevo
          </button>
        </div>

        <div className="overflow-hidden rounded-md border" aria-live="polite">
          <div className="border-b px-3 py-1.5 text-xs font-medium text-fd-muted-foreground">Terminal (salida resumida)</div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={salida ? salida.comando + salida.lineas.join() + salida.nota : 'vacio'}
              initial={reducir ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: reducir ? 0 : 0.1 } }}
              transition={{ duration: 0.18 }}
            >
              {salida ? (
                <>
                  <pre className="max-h-72 overflow-auto px-3 py-2 font-mono text-xs leading-relaxed">
                    <span className="text-fd-muted-foreground">{salida.comando.startsWith('npx') ? '$ ' : '# '}</span>
                    <span className="font-semibold">{salida.comando}</span>
                    {'\n'}
                    {salida.lineas.join('\n')}
                  </pre>
                  <p className="border-t px-3 py-2 text-sm">{salida.nota}</p>
                </>
              ) : (
                <p className="px-3 py-3 text-sm text-fd-muted-foreground">
                  Empieza como en clase: renombra la tabla en Supabase y prueba <code className="font-mono">migrate status</code> y después{' '}
                  <code className="font-mono">migrate dev</code>.
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
