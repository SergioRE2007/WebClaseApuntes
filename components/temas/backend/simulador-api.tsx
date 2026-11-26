'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ChevronRight, RotateCcw, Send } from 'lucide-react';
import { z } from 'zod';
import { cn } from '@/lib/cn';
import {
  avisoCaja,
  bloque,
  botonPrimario,
  botonSecundario,
  cabecera,
  etiqueta,
  malCaja,
  malTexto,
  okCaja,
  okTexto,
  tituloBloque,
} from '@/components/interactive/estilos';

/**
 * Simulador de la API del repositorio de clase en la v0.5.0: módulo users
 * (sin middleware de auth todavía) y módulo auth (registro y login). Todo pasa
 * en el navegador, con una tabla User en memoria. Enseña por qué capas pasa
 * cada petición y qué código HTTP devuelve. Lo que no se vio en clase
 * (deleteUserCtrl, el final de getUserCtrl) no se inventa.
 */

const CAPAS = ['express.json', 'Router', 'validate', 'Controlador', 'Servicio', 'Prisma', 'PostgreSQL', 'errorHandler'] as const;
type Capa = (typeof CAPAS)[number];

const METODOS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
type Metodo = (typeof METODOS)[number];

interface Usuario {
  id: number;
  email: string;
  name: string;
  password: string;
  createdAt: string;
}

interface Respuesta {
  status: number | null;
  cuerpo: string;
  capas: Capa[];
  ruta: string;
  nota?: string;
}

// Schemas de users.schema.ts (versión del 27/10). registerSchema usa z.email() aquí: en clase seguía con
// z.string().email(), que en Zod 4 está obsoleto pero valida igual.
const registerSchema = z.object({
  email: z.email('Email inválido'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});
const loginSchema = z.object({
  email: z.email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});
const updateUserSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  email: z.email('Email inválido').optional(),
});

const INICIALES: Usuario[] = [
  { id: 1, email: 'ana@example.com', name: 'Ana', password: 'password123', createdAt: '2026-10-27T09:00:00.000Z' },
  { id: 2, email: 'luis@example.com', name: 'Luis', password: 'password123', createdAt: '2026-10-27T09:05:00.000Z' },
];

const publico = (u: Usuario) => ({ id: u.id, email: u.email, name: u.name, createdAt: u.createdAt });
const json = (v: unknown) => JSON.stringify(v, null, 2);

function base64url(texto: string) {
  const bytes = new TextEncoder().encode(texto);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function token(u: Usuario) {
  const iat = Math.floor(Date.now() / 1000);
  const cab = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const carga = base64url(JSON.stringify({ sub: u.id, email: u.email, iat, exp: iat + 7 * 24 * 3600 }));
  return `${cab}.${carga}.firma-con-JWT_SECRET`;
}

interface Preset {
  etiqueta: string;
  metodo: Metodo;
  ruta: string;
  body?: string;
}

const PRESETS: Preset[] = [
  { etiqueta: 'GET /health', metodo: 'GET', ruta: '/health' },
  { etiqueta: 'Listar usuarios', metodo: 'GET', ruta: '/api/users' },
  { etiqueta: 'Usuario 1', metodo: 'GET', ruta: '/api/users/1' },
  { etiqueta: 'Id que no es número', metodo: 'GET', ruta: '/api/users/abc' },
  { etiqueta: 'Cambiar nombre', metodo: 'PATCH', ruta: '/api/users/1', body: '{ "name": "Ana María" }' },
  { etiqueta: 'Email repetido', metodo: 'PATCH', ruta: '/api/users/1', body: '{ "email": "luis@example.com" }' },
  { etiqueta: 'Email mal escrito', metodo: 'PATCH', ruta: '/api/users/1', body: '{ "email": "ana-arroba-example" }' },
  { etiqueta: 'Usuario que no existe', metodo: 'PATCH', ruta: '/api/users/99', body: '{ "name": "Nadie" }' },
  { etiqueta: 'PUT en vez de PATCH', metodo: 'PUT', ruta: '/api/users/1', body: '{ "name": "Ana" }' },
  { etiqueta: 'POST /api/users', metodo: 'POST', ruta: '/api/users', body: '{ "email": "eva@example.com", "name": "Eva" }' },
  {
    etiqueta: 'Registro',
    metodo: 'POST',
    ruta: '/api/auth/register',
    body: '{ "email": "eva@example.com", "name": "Eva", "password": "password123" }',
  },
  { etiqueta: 'Login', metodo: 'POST', ruta: '/api/auth/login', body: '{ "email": "ana@example.com", "password": "password123" }' },
  { etiqueta: 'Login fallido', metodo: 'POST', ruta: '/api/auth/login', body: '{ "email": "ana@example.com", "password": "otraClave99" }' },
  { etiqueta: 'JSON roto', metodo: 'PATCH', ruta: '/api/users/1', body: '{ "name": "Ana", }' },
];

const conBody = (m: Metodo) => m === 'POST' || m === 'PUT' || m === 'PATCH';

function atender(
  metodo: Metodo,
  rutaBruta: string,
  bodyTexto: string,
  usuarios: Usuario[],
): { r: Respuesta; usuarios: Usuario[] } {
  const ruta = (rutaBruta.trim().split('?')[0] || '/').replace(/(.)\/+$/, '$1');
  const capas: Capa[] = [];
  let lista = usuarios;

  // 1. express.json() va en app.use y se ejecuta en todas las peticiones, pero solo lee
  // un body JSON; si no lo hay, llama a next() sin tocar nada.
  let body: unknown = undefined;
  capas.push('express.json');
  if (conBody(metodo) && bodyTexto.trim()) {
    try {
      body = JSON.parse(bodyTexto);
    } catch (e) {
      capas.push('errorHandler');
      return {
        usuarios,
        r: {
          status: 400,
          cuerpo: json({ message: e instanceof Error ? e.message : 'JSON inválido' }),
          capas,
          ruta: 'express.json() → next(err)',
          nota: 'express.json() no puede leer el JSON y pasa el error (con status 400) al errorHandler, que responde con err.status y err.message.',
        },
      };
    }
  }

  capas.push('Router');
  const noExiste = (): { r: Respuesta; usuarios: Usuario[] } => ({
    usuarios,
    r: {
      status: 404,
      cuerpo: `Cannot ${metodo} ${ruta}`,
      capas,
      ruta: 'ninguna',
      nota: 'Ninguna ruta coincide con ese método y esa URL, así que responde el 404 por defecto de Express (en HTML, no en JSON).',
    },
  });

  if (ruta === '/health') {
    if (metodo !== 'GET') return noExiste();
    return { usuarios, r: { status: 200, cuerpo: json({ ok: true }), capas, ruta: "app.get('/health')" } };
  }

  if (ruta === '/api/users') {
    if (metodo !== 'GET') {
      const r = noExiste();
      r.r.nota =
        'En la v0.4.0 y la v0.5.0 no hay POST en /api/users: los usuarios se crean con /api/auth/register. En clase, al escribir router.post(\'/\', createUserCtrl), salía "Cannot find name \'createUserCtrl\'".';
      return r;
    }
    capas.push('Controlador', 'Servicio', 'Prisma', 'PostgreSQL');
    const datos = [...lista].sort((a, b) => a.id - b.id).map(publico);
    return {
      usuarios,
      r: {
        status: 200,
        cuerpo: json(datos),
        capas,
        ruta: "router.get('/', listUsersCtrl)",
        nota: 'findMany con select y orderBy: id ascendente y sin passwordHash.',
      },
    };
  }

  const m = ruta.match(/^\/api\/users\/([^/]+)$/);
  if (m) {
    const param = decodeURIComponent(m[1]!);
    const id = Number(param);

    if (metodo === 'GET') {
      capas.push('Controlador');
      if (isNaN(id)) {
        return { usuarios, r: { status: 400, cuerpo: json({ message: 'ID inválido' }), capas, ruta: "router.get('/:id', getUserCtrl)" } };
      }
      capas.push('Servicio', 'Prisma', 'PostgreSQL');
      if (!Number.isInteger(id)) {
        return {
          usuarios,
          r: {
            status: null,
            cuerpo: '(no se vio en clase)',
            capas,
            ruta: "router.get('/:id', getUserCtrl)",
            nota: `Number('${param}') no es NaN, así que pasa el filtro de isNaN, pero no es un entero: Prisma rechaza la consulta. El catch de getUserCtrl no se vio.`,
          },
        };
      }
      const u = lista.find((x) => x.id === id);
      if (u)
        return {
          usuarios,
          r: {
            status: 200,
            cuerpo: json(publico(u)),
            capas,
            ruta: "router.get('/:id', getUserCtrl)",
            nota: 'findUserById con select: sin passwordHash. El final de getUserCtrl no se vio; los tests de la v0.9.0 esperan un 200 con un id que existe.',
          },
        };
      return {
        usuarios,
        r: {
          status: 404,
          cuerpo: '(el cuerpo no se vio en clase)',
          capas,
          ruta: "router.get('/:id', getUserCtrl)",
          nota: 'findUnique devuelve null. El final de getUserCtrl no se vio; los tests de la v0.9.0 esperan un 404 con un id que no existe.',
        },
      };
    }

    if (metodo === 'PATCH') {
      capas.push('validate');
      const parsed = updateUserSchema.safeParse(body);
      if (!parsed.success) {
        return {
          usuarios,
          r: {
            status: 400,
            cuerpo: json({ errors: z.treeifyError(parsed.error) }),
            capas,
            ruta: "router.patch('/:id', validate(updateUserSchema), updateUserCtrl)",
            nota: 'validate corta la petición: el controlador ni se entera.',
          },
        };
      }
      capas.push('Controlador');
      if (isNaN(id)) {
        return {
          usuarios,
          r: {
            status: 400,
            cuerpo: json({ message: 'ID inválido' }),
            capas,
            ruta: "router.patch('/:id', validate(updateUserSchema), updateUserCtrl)",
            nota: 'El body ya pasó validate; el id se comprueba después, en el controlador.',
          },
        };
      }
      capas.push('Servicio', 'Prisma', 'PostgreSQL');
      const rutaPatch = "router.patch('/:id', validate(updateUserSchema), updateUserCtrl)";
      if (!Number.isInteger(id)) {
        return {
          usuarios,
          r: {
            status: 500,
            cuerpo: json({ message: '(mensaje de Prisma: id tiene que ser un Int)' }),
            capas,
            ruta: rutaPatch,
            nota: `Number('${param}') no es NaN, así que pasa el filtro de isNaN, pero no es un entero: Prisma rechaza la consulta y el catch responde 500.`,
          },
        };
      }
      const u = lista.find((x) => x.id === id);
      if (!u) {
        return {
          usuarios,
          r: { status: 404, cuerpo: json({ message: 'Usuario no encontrado' }), capas, ruta: rutaPatch, nota: 'Prisma lanza P2025 (no existe el registro) y el controlador lo traduce a 404.' },
        };
      }
      const datos = parsed.data;
      if (datos.email && lista.some((x) => x.email === datos.email && x.id !== id)) {
        return {
          usuarios,
          r: { status: 409, cuerpo: json({ message: 'El email ya está en uso' }), capas, ruta: rutaPatch, nota: 'email es @unique: PostgreSQL rechaza el duplicado, Prisma lanza P2002 y el controlador responde 409.' },
        };
      }
      const nuevo: Usuario = { ...u, ...(datos.name !== undefined && { name: datos.name }), ...(datos.email !== undefined && { email: datos.email }) };
      lista = lista.map((x) => (x.id === id ? nuevo : x));
      const quitados = body && typeof body === 'object' ? Object.keys(body).filter((k) => k !== 'name' && k !== 'email') : [];
      return {
        usuarios: lista,
        r: {
          status: 200,
          cuerpo: json(publico(nuevo)),
          capas,
          ruta: rutaPatch,
          nota: quitados.length
            ? `validate cambió req.body por parsed.data, que no trae ${quitados.map((k) => `«${k}»`).join(', ')}: z.object quita las claves que no conoce.`
            : 'update con select: se devuelve el usuario sin passwordHash.',
        },
      };
    }

    if (metodo === 'DELETE') {
      capas.push('Controlador');
      const existe = lista.some((x) => x.id === id);
      if (!isNaN(id)) {
        capas.push('Servicio', 'Prisma', 'PostgreSQL');
        lista = lista.filter((x) => x.id !== id);
      }
      return {
        usuarios: lista,
        r: {
          status: null,
          cuerpo: '(no se vio en clase)',
          capas,
          ruta: "router.delete('/:id', deleteUserCtrl)",
          nota: isNaN(id)
            ? 'deleteUserCtrl no se vio en clase: no se sabe si comprueba el id con isNaN como los demás.'
            : existe
            ? 'deleteUserCtrl no se vio en clase. Del servicio solo se sabe que hace prisma.user.delete({ where: { id } }): el usuario se ha borrado, pero la demo no inventa qué responde el controlador.'
            : 'deleteUserCtrl no se vio en clase. Con un id que no existe, prisma.user.delete lanza P2025; no se sabe cómo lo trata el controlador.',
        },
      };
    }

    return noExiste();
  }

  if (ruta === '/api/auth/register' && metodo === 'POST') {
    capas.push('Controlador');
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return {
        usuarios,
        r: {
          status: 400,
          cuerpo: json({ message: parsed.error.message }),
          capas,
          ruta: "router.post('/register', registerCtrl)",
          nota: 'En la v0.5.0 la ruta no lleva validate: registerSchema.parse lanza un ZodError dentro del try y el catch responde 400 con e.message, que es el JSON de los errores convertido en texto. En la v1.0.0 se añade validate(registerSchema) a la ruta.',
        },
      };
    }
    capas.push('Servicio', 'Prisma', 'PostgreSQL');
    const { email, name, password } = parsed.data;
    if (lista.some((x) => x.email === email)) {
      return {
        usuarios,
        r: { status: 409, cuerpo: json({ message: 'Email ya registrado' }), capas, ruta: "router.post('/register', registerCtrl)", nota: 'El servicio lanza new Error(\'Email ya registrado\') y el controlador compara el mensaje para responder 409.' },
      };
    }
    const nuevo: Usuario = { id: Math.max(0, ...lista.map((x) => x.id)) + 1, email, name, password, createdAt: new Date().toISOString() };
    lista = [...lista, nuevo];
    return {
      usuarios: lista,
      r: {
        status: 201,
        cuerpo: json({ user: publico(nuevo), token: token(nuevo) }),
        capas,
        ruta: "router.post('/register', registerCtrl)",
        nota: 'bcrypt.hash guarda el hash (passwordHash), createUser devuelve el usuario con select y jwt.sign firma { sub, email } con caducidad de 7 días.',
      },
    };
  }

  if (ruta === '/api/auth/login' && metodo === 'POST') {
    capas.push('Controlador');
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return {
        usuarios,
        r: { status: 400, cuerpo: json({ message: parsed.error.message }), capas, ruta: "router.post('/login', loginCtrl)", nota: 'loginSchema.parse lanza y el catch responde 400 con el mensaje de Zod.' },
      };
    }
    capas.push('Servicio', 'Prisma', 'PostgreSQL');
    const u = lista.find((x) => x.email === parsed.data.email);
    if (!u || u.password !== parsed.data.password) {
      return {
        usuarios,
        r: {
          status: 401,
          cuerpo: json({ message: 'Credenciales inválidas' }),
          capas,
          ruta: "router.post('/login', loginCtrl)",
          nota: u
            ? 'bcrypt.compare da false. El mensaje es el mismo que si el email no existiera, para no dar pistas.'
            : 'findUserByEmail devuelve null. El mensaje es el mismo que con la contraseña mal, para no dar pistas.',
        },
      };
    }
    return {
      usuarios,
      r: { status: 200, cuerpo: json({ user: publico(u), token: token(u) }), capas, ruta: "router.post('/login', loginCtrl)", nota: 'El servicio monta el user a mano, sin passwordHash.' },
    };
  }

  return noExiste();
}

export function SimuladorApi({ titulo = 'Simulador de la API de clase (v0.5.0)' }: { titulo?: string }) {
  const reducir = useReducedMotion();
  const idRuta = useId();
  const idBody = useId();
  const idMetodo = useId();
  const [usuarios, setUsuarios] = useState<Usuario[]>(INICIALES);
  const [metodo, setMetodo] = useState<Metodo>('GET');
  const [ruta, setRuta] = useState('/api/users');
  const [body, setBody] = useState('{ "name": "Ana María" }');
  const [resp, setResp] = useState<Respuesta | null>(null);
  const [encendidas, setEncendidas] = useState(0);
  const temporizador = useRef<ReturnType<typeof setInterval> | null>(null);

  const parar = () => {
    if (temporizador.current) clearInterval(temporizador.current);
    temporizador.current = null;
  };
  useEffect(() => parar, []);

  const enviar = () => {
    parar();
    const { r, usuarios: nuevos } = atender(metodo, ruta, body, usuarios);
    setUsuarios(nuevos);
    setResp(r);
    if (reducir) {
      setEncendidas(r.capas.length);
      return;
    }
    setEncendidas(0);
    let n = 0;
    temporizador.current = setInterval(() => {
      n += 1;
      setEncendidas(n);
      if (n >= r.capas.length) parar();
    }, 260);
  };

  const elegir = (p: Preset) => {
    parar();
    setMetodo(p.metodo);
    setRuta(p.ruta);
    if (p.body !== undefined) setBody(p.body);
    setResp(null);
  };

  const listo = resp !== null && encendidas >= resp.capas.length;
  const bien = resp?.status != null && resp.status < 400;

  return (
    <section aria-label={titulo} className={bloque}>
      <div className={cabecera}>
        <span className={etiqueta}>Demo</span>
        <p className={cn(tituloBloque, 'min-w-0 flex-1')}>{titulo}</p>
      </div>

      <div className="space-y-4 px-4 py-4 sm:px-5">
        <div>
          <p className="mb-2 text-xs font-medium text-fd-muted-foreground">Peticiones de ejemplo</p>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.etiqueta}
                type="button"
                onClick={() => elegir(p)}
                className="min-h-8 rounded-md border px-2.5 py-1 text-xs text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
              >
                {p.etiqueta}
              </button>
            ))}
          </div>
        </div>

        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            enviar();
          }}
        >
          <label htmlFor={idMetodo} className="sr-only">
            Método HTTP
          </label>
          <select
            id={idMetodo}
            value={metodo}
            onChange={(e) => setMetodo(e.target.value as Metodo)}
            className="min-h-10 rounded-md border bg-fd-background px-2 font-mono text-sm sm:min-h-8"
          >
            {METODOS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <label htmlFor={idRuta} className="sr-only">
            Ruta
          </label>
          <div className="flex min-w-0 flex-1 items-center rounded-md border bg-fd-background focus-within:ring-2 focus-within:ring-fd-ring">
            <span className="hidden pl-2.5 font-mono text-xs text-fd-muted-foreground sm:inline">localhost:3000</span>
            <input
              id={idRuta}
              value={ruta}
              onChange={(e) => setRuta(e.target.value)}
              spellCheck={false}
              autoComplete="off"
              className="min-h-10 min-w-0 flex-1 bg-transparent px-2 font-mono text-sm outline-none sm:min-h-8"
            />
          </div>
          <button type="submit" className={botonPrimario}>
            <Send className="size-3.5" aria-hidden />
            Enviar
          </button>
        </form>

        {conBody(metodo) && (
          <div>
            <label htmlFor={idBody} className="mb-1 block text-xs font-medium text-fd-muted-foreground">
              Body (JSON)
            </label>
            <textarea
              id={idBody}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              spellCheck={false}
              className="w-full resize-y rounded-md border bg-fd-background px-3 py-2 font-mono text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
            />
          </div>
        )}

        <ol className="flex flex-wrap items-center gap-y-1.5" aria-label="Capas por las que pasa la petición">
          {CAPAS.map((c, i) => {
            const pos = resp ? resp.capas.indexOf(c) : -1;
            const activa = pos !== -1 && pos < encendidas;
            const ultima = activa && pos === resp!.capas.length - 1;
            return (
              <li key={c} className="flex items-center">
                {i > 0 && <ChevronRight className="mx-0.5 size-3.5 text-fd-muted-foreground/60" aria-hidden />}
                <motion.span
                  initial={false}
                  animate={{ scale: activa && !reducir ? [1, 1.06, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    'inline-block rounded-md border px-2 py-1 font-mono text-xs transition-colors',
                    activa ? 'border-fd-primary/60 bg-fd-primary/10 text-fd-foreground' : 'text-fd-muted-foreground',
                    ultima && 'font-semibold',
                    c === 'errorHandler' && !activa && 'border-dashed',
                  )}
                >
                  {c}
                  {ultima && <span className="sr-only"> (hasta aquí llega)</span>}
                </motion.span>
              </li>
            );
          })}
        </ol>

        <div aria-live="polite">
        {listo && resp && (
          <motion.div
            initial={reducir ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={cn('rounded-md border', resp.status === null ? avisoCaja : bien ? okCaja : malCaja)}
          >
            <div className="flex flex-wrap items-baseline gap-x-3 border-b px-3 py-2">
              <p className={cn('text-sm font-semibold', resp.status === null ? '' : bien ? okTexto : malTexto)}>
                {resp.status === null ? 'Código: no se sabe' : `Código ${resp.status}`}
              </p>
              <p className="min-w-0 break-all font-mono text-xs text-fd-muted-foreground">{resp.ruta}</p>
            </div>
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all px-3 py-2 font-mono text-xs text-fd-foreground">{resp.cuerpo}</pre>
            {resp.nota && <p className="border-t px-3 py-2 text-sm">{resp.nota}</p>}
          </motion.div>
        )}
        </div>

        <div className="rounded-md border">
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <p className="flex-1 text-xs font-medium text-fd-muted-foreground">Tabla &quot;User&quot; (simulada; contraseña de todos: password123)</p>
            <button
              type="button"
              onClick={() => {
                parar();
                setUsuarios(INICIALES);
                setResp(null);
              }}
              className={cn(botonSecundario, 'min-h-8 px-2 text-xs')}
            >
              <RotateCcw className="size-3" aria-hidden />
              Reiniciar
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="text-fd-muted-foreground">
                <tr>
                  <th className="px-3 py-1.5 font-medium">id</th>
                  <th className="px-3 py-1.5 font-medium">email</th>
                  <th className="px-3 py-1.5 font-medium">name</th>
                  <th className="px-3 py-1.5 font-medium">passwordHash</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="px-3 py-1.5">{u.id}</td>
                    <td className="px-3 py-1.5">{u.email}</td>
                    <td className="px-3 py-1.5">{u.name}</td>
                    <td className="px-3 py-1.5 text-fd-muted-foreground">$2b$10$…</td>
                  </tr>
                ))}
                {usuarios.length === 0 && (
                  <tr className="border-t">
                    <td colSpan={4} className="px-3 py-1.5 text-fd-muted-foreground">
                      (vacía)
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
