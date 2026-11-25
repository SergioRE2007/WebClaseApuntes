# Clase del 2026-10-27 (bloque 3 de 3) · Backend (Node)

# Node.js + Express + Zod + Prisma: repaso de la v0.4.0 (validación) y de la v0.5.0 (auth)

Aunque la carpeta se llama "Angular - Servicios", este bloque es todo del backend: el proyecto `node-server-26-27` del profesor, abierto en Cursor. Al principio está en la etiqueta de Git `v0.4.0` y al final pasa a la `v0.5.0`.

## 1. Qué se explicó, en orden

| Minuto aprox. | Tema |
|---|---|
| p2 28:21 – 29:00 | `users.schema.ts`: el editor tacha `z.string().email()` como obsoleto (*deprecated*, ts 6385) y el aviso dice "Use z.email() instead". Se cambia en `updateUserSchema`. |
| p2 29:15 – 29:43 | `package.json`: se revisan las dependencias y se abre `node_modules/zod/package.json` para ver la versión instalada (**4.1.12**). |
| p2 30:07 | El mismo cambio a `z.email()` en `loginSchema`. |
| p2 30:13 – 32:42 | Middleware `validate.ts`. `ZodSchema` y `parsed.error.flatten()` salen tachados. Se cambia `flatten()` por `z.treeifyError(...)`, y por el camino van apareciendo errores (ver el punto 3). |
| p2 32:51 – 33:32 | Búsqueda en Google de "ZodSchema deprecated" y lectura del issue #4877 de `colinhacks/zod`: en Zod 4, `ZodSchema` es un alias de `z.ZodType`. |
| p2 33:51 – 35:00 | Se le pregunta al agente de Cursor. Comprueba la versión (4.1.12), busca usos con `rg` y propone usar `ZodType`. |
| p2 35:00 – 35:54 | Queda el `validate.ts` definitivo con `ZodType` y `z.treeifyError(parsed.error)`. |
| p2 36:16 – 37:17 | Otra vez `package.json`. El tooltip de `express` dice que la última versión es la 5.3.0 y el proyecto usa la `^5.1.0`. |
| p2 38:50 – 39:47 | La web de TuxCare: ciclo de vida de los paquetes, CVEs y soporte después del fin de vida (EOL). Sirve de contexto sobre la seguridad de las dependencias; no hay código. |
| p3 00:11 – 00:49 | Repaso del módulo `users`: schema, controller (`listUsersCtrl`, `getUserCtrl`) y service (`createUser`, `findUserByEmail`, `findUserById`). |
| p3 01:23 – 02:01 | `updateUserCtrl`: comprueba el id (400) y traduce los errores de Prisma P2025 → 404 y P2002 → 409. El resto da 500. Se prueba a tipar `const user: UpdateUserInput`. |
| p3 02:04 – 05:48 | Se intenta tipar `updateUser(id, data: UpdateUserInput)` en el servicio y sale un error de tipos por `exactOptionalPropertyTypes`. Se prueban una `interface` escrita a mano y un genérico. Al final se vuelve al tipo escrito en línea `{ name?: string; email?: string }`. |
| p3 06:19 – 07:19 | Tooltip de `UpdateUserInput`: `{ name?: string \| undefined; email?: string \| undefined }`. |
| p3 07:25 – 07:55 | `users.routes.ts` (GET, GET /:id, PATCH con `validate`, DELETE) y `config/db.ts` con `PrismaClient`. |
| p3 08:59 – 09:12 | Git Graph con las etiquetas v0.1.0 a v0.6.0 (ver la parte "otra"). |
| p3 10:08 – 10:38 | v0.5.0: `auth.routes.ts`, `app.ts` (middlewares globales, `/health`, prefijos `/api/auth` y `/api/users`, `errorHandler`) y la estructura de carpetas. |
| p3 10:38 – 14:12 | `auth.controller.ts`, función `registerCtrl`: `registerSchema.parse`, 201, 409 si el email ya está registrado y 400 para lo demás. |
| p3 12:19 – 17:50 | `auth.service.ts`, función `register`: comprueba si el email ya existe, hace `bcrypt.hash` con `BCRYPT_SALT_ROUNDS`, llama a `createUser` y firma el token con `jwt.sign` (`sub`, `email`, `expiresIn: '7d'`). Se leen los tooltips de `jwt.sign` y de `env.JWT_SECRET: string`. |
| p3 17:56 – 21:22 | `loginCtrl`: `loginSchema.parse`, `res.json` (200) y 401 con "Credenciales inválidas". |
| p3 21:38 – 23:02 | Servicio `login`: `findUserByEmail`, `bcrypt.compare` y el mismo mensaje genérico en los dos fallos. Devuelve `{ user: {id, email, name, createdAt}, token }`, sin `passwordHash`. |
| p3 23:09 – 27:21 | Se repasan las rutas de auth, se cambia de etiqueta de Git (v0.5.0) y se mira el `.env` (`PORT`, `NODE_ENV`, `DATABASE_URL`). |

## 2. Conceptos y patrones

- **Arquitectura en capas por módulo**: `modules/<x>/` con `x.routes.ts`, `x.controller.ts`, `x.service.ts` y `x.schema.ts`. Además, `config/` (`db.ts`, `env.ts`) y `middleware/` (`validate.ts`, `error.ts`).
- **Zod 4**:
  - `z.object`, `z.string().min(n, 'mensaje')` y `.optional()` para actualizaciones parciales.
  - **`z.email()`** sustituye a `z.string().email()`, que está obsoleto.
  - **`z.infer<typeof schema>`** saca los tipos (`RegisterInput`, `LoginInput`, `UpdateUserInput`).
  - `safeParse` no lanza excepciones (devuelve `success`, `data` y `error`). `parse` sí lanza.
  - **`z.treeifyError(err)`** sustituye a `err.flatten()`, que está obsoleto.
  - **`ZodType`** sustituye a `ZodSchema`, que en Zod 4 es un alias de compatibilidad con Zod 3.
- **Middleware "fábrica"**: `validate(schema)` devuelve un `(req, res, next)`. Si los datos no valen, responde 400. Si valen, cambia `req.body` por los datos ya validados y llama a `next()`.
- **`import type` frente a `import`**: con `import type` solo se importan tipos, que desaparecen al compilar. `z` se usa como valor (`z.treeifyError`), así que tiene que ir en un `import` normal. Si no, TypeScript da el error "'z' cannot be used as a value because it was imported using 'import type'". El quick fix del editor ofrece "Remove 'type' from import declaration".
- **Avisos de obsoleto en TypeScript** (ts 6385/6387): aparecen tachados en el editor. Para resolverlos se consultan la documentación, la guía de migración y los issues de GitHub.
- **Prisma**:
  - `findMany` con `select` y `orderBy`. `findUnique` con `where`. `create`, `update` y `delete`.
  - Con `select` nunca se devuelve `passwordHash`.
  - Los códigos de error se traducen a HTTP: **P2025 → 404** (no existe) y **P2002 → 409** (valor único repetido).
  - Hay un solo `PrismaClient`, exportado desde `config/db.ts`.
- **`exactOptionalPropertyTypes`** (tsconfig): con esta opción, `name?: string` no admite `undefined` de forma explícita. El tipo inferido por Zod (`string | undefined`) no encaja con `UserUpdateInput` de Prisma. Por eso el servicio se queda con el tipo escrito en línea.
- **Códigos HTTP**: 200 (`res.json`), 201 (crear), 400 (validación o id que no es un número), 401 (credenciales), 404, 409 y 500.
- **Autenticación**:
  - La contraseña se guarda con `bcrypt.hash` y las rondas salen de una variable de entorno. Al entrar se comprueba con `bcrypt.compare`.
  - El JWT lleva el *claim* `sub` (el id del usuario) y el email, y caduca a los 7 días. El secreto está en `env.JWT_SECRET`.
  - Si falla el email o la contraseña, el mensaje es el mismo ("Credenciales inválidas"), para no dar pistas.
  - El servicio lanza `throw new Error('...')` y el controlador traduce el mensaje a un código HTTP.
- **Módulos ES en TypeScript**: los imports locales llevan la extensión `.js` (`'./auth.service.js'`).
- **Herramientas**: tooltips de tipos, quick fix, el agente de Cursor ("Fix with Agent", aceptar o deshacer el diff) y el panel Problems.

## 3. Código de ejemplo del profesor

### `src/modules/users/users.schema.ts` (después de los cambios de la clase)
```ts
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email inválido'), // [dudoso] en esta clase no se vio si este también pasa a z.email()
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres')
});

export const loginSchema = z.object({
  email: z.email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres')
});

export const updateUserSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  email: z.email('Email inválido').optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
```

### `src/middleware/validate.ts`
Versión original, con dos avisos de obsoleto:
```ts
import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }
  req.body = parsed.data;
  next();
};
```
Versión final para Zod 4 (p2 35:42):
```ts
import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';
import { z } from 'zod';

export const validate = (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: z.treeifyError(parsed.error) });
  }
  req.body = parsed.data;
  next();
};
```
Intentos que fallaron por el camino (no copiarlos):
- `z.treeifyError(err)`: `err` no existe.
- `import type { z, ZodSchema }`: `z` no se puede usar como valor.
- `import type { ZodSchema } from 'zod/v3'`: da "No overload matches this call" porque mezcla tipos de Zod 3 con funciones de Zod 4.
- Los casts `as $ZodError<unknown>` y `z.treeifyError(parsed.error.flatten().fieldErrors)`.

### `src/modules/users/users.service.ts`
```ts
import { prisma } from '../../config/db.js';

const publicFields = undefined; // no existe: el profesor repite el select en cada función

export async function createUser(email: string, name: string, passwordHash: string) {
  return prisma.user.create({
    data: { email, name, passwordHash },
    select: { id: true, email: true, name: true, createdAt: true }
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function findUserById(id: number) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, createdAt: true }
  });
}

export async function listUsers() {
  return prisma.user.findMany({
    select: { id: true, email: true, name: true, createdAt: true },
    orderBy: { id: 'asc' }
  });
}

export async function updateUser(id: number, data: { name?: string; email?: string }) {
  return prisma.user.update({
    where: { id },
    data,
    select: { id: true, email: true, name: true, createdAt: true }
  });
}

export async function deleteUser(id: number) {
  return prisma.user.delete({ where: { id } });
}
```
Ojo: la línea `const publicFields` no es del profesor. Está solo para señalar que él repite el `select` en cada función; al copiar el archivo, no la pongas. Si se pone `data: UpdateUserInput`, sale el error: "Type '{ name?: string | undefined; email?: string | undefined; }' is not assignable to type '(Without<UserUpdateInput, UserUncheckedUpdateInput> & UserUncheckedUpdateInput) | …' with 'exactOptionalPropertyTypes: true'".

### `src/modules/users/users.controller.ts`
```ts
import type { Request, Response } from 'express';
import { listUsers, findUserById, updateUser, deleteUser } from './users.service.js';

export async function listUsersCtrl(_req: Request, res: Response) {
  try {
    const users = await listUsers();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function updateUserCtrl(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }
    const user = await updateUser(id, req.body);
    res.json(user);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'El email ya está en uso' });
    }
    res.status(500).json({ message: error.message });
  }
}
```

### `src/modules/users/users.routes.ts`
```ts
import { Router } from 'express';            // [dudoso] la línea no se ve en la captura
import { validate } from '../../middleware/validate.js'; // [dudoso] la ruta no se ve en la captura
import { updateUserSchema } from './users.schema.js';
import { listUsersCtrl, getUserCtrl, updateUserCtrl, deleteUserCtrl } from './users.controller.js';

const router = Router();

router.get('/', listUsersCtrl);
router.get('/:id', getUserCtrl);
router.patch('/:id', validate(updateUserSchema), updateUserCtrl);
router.delete('/:id', deleteUserCtrl);

export default router;
```

### `src/config/db.ts`
```ts
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
```

### `src/app.ts` (v0.5.0)
```ts
// imports y const app = express() [no se ven en la captura]
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);

app.use(errorHandler);

export default app;
```

### `src/modules/auth/auth.routes.ts`
```ts
import { Router } from 'express';
import { registerCtrl, loginCtrl } from './auth.controller.js';

const router = Router();

router.post('/register', registerCtrl);
router.post('/login', loginCtrl);

export default router;
```

### `src/modules/auth/auth.controller.ts`
```ts
import type { Request, Response } from 'express';
import { register, login } from './auth.service.js';
import { registerSchema, loginSchema } from '../users/users.schema.js';

export async function registerCtrl(req: Request, res: Response) {
  try {
    const { email, name, password } = registerSchema.parse(req.body);
    const data = await register(email, name, password);
    res.status(201).json(data);
  } catch (e: any) {
    if (e.message === 'Email ya registrado') {
      return res.status(409).json({ message: e.message });
    }
    res.status(400).json({ message: e.message });
  }
}

export async function loginCtrl(req: Request, res: Response) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const data = await login(email, password);
    res.json(data);
  } catch (e: any) {
    if (e.message === 'Credenciales inválidas') {
      return res.status(401).json({ message: e.message });
    }
    res.status(400).json({ message: e.message });
  }
}
```

### `src/modules/auth/auth.service.ts`
```ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { createUser, findUserByEmail } from '../users/users.service.js';

export async function register(email: string, name: string, password: string) {
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new Error('Email ya registrado');
  }
  const hash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
  const user = await createUser(email, name, hash);
  const token = jwt.sign({ sub: user.id, email: user.email }, env.JWT_SECRET, { expiresIn: '7d' });
  return { user, token };
}

export async function login(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error('Credenciales inválidas');
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new Error('Credenciales inválidas');
  }
  const token = jwt.sign({ sub: user.id, email: user.email }, env.JWT_SECRET, { expiresIn: '7d' });
  return {
    user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
    token
  };
}
```
El tipo que se ve en el tooltip de `register` es `Promise<{ user: { id: number; email: string; name: string; createdAt: Date }; token: string }>`.

### `.env`
```
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:<contraseña>@localhost:5432/app_db"
```
El proyecto también tiene un `.env.example`.

## 4. Librerías, versiones y comandos

**dependencies**
- `@prisma/client` ^6.18.0
- `bcrypt` ^6.0.0
- `cors` ^2.8.5
- `dotenv` ^17.2.3
- `express` ^5.1.0 (según el tooltip, la última es la 5.3.0)
- `helmet` ^8.1.0
- `jsonwebtoken` ^9.0.2
- `morgan` ^1.10.1
- `zod` 4.1.12 (es la versión instalada que se comprobó en `node_modules`)

**devDependencies**
- `@types/bcrypt` ^6.0.0, `@types/cors` ^2.8.19, `@types/express` ^5.0.5, `@types/jsonwebtoken` ^9.0.10, `@types/morgan` ^1.9.10 y `@types/node` ^24.10.0
- `nodemon` ^3.1.10

**Archivos del proyecto**: `docker-compose.yml`, `nodemon.json`, `tsconfig.json` (con `exactOptionalPropertyTypes: true`, según el mensaje de error), `prisma/schema.prisma` + `migrations`, `CHANGELOG.md` y `docs/API_EXAMPLES.md`.

**Imports de Zod**: `zod` y la subruta `zod/v3`, que sirve para la compatibilidad con Zod 3 y no se recomienda.

**Comandos**: el agente usó `rg` para buscar usos de `ZodSchema|ZodType` y leyó la versión de zod con `node`. El cambio de versión del proyecto se hace con *Checkout Branch/Tag* de Git, desde la barra de estado de Cursor.

## 5. Dudoso o ilegible

- **Versión de zod en `package.json`**: unas capturas dicen `"^4.1.12"` y otras `"4.1.12"`, sin `^`. Puede que se quitara el `^` para fijar la versión, pero no se ve el cambio.
- **Etiqueta de Git**: en p3 07:55 la barra de estado dice v0.5.0 mientras la terminal sigue en `git:(v0.4.0)`. Los cambios a `z.email()` y a `validate.ts` no salen en el `registerSchema` de la v0.5.0, que vuelve a usar `z.string().email()` y lleva comas finales. Seguramente se cambió de etiqueta sin hacer commit de esos cambios (Git Graph marcaba 3 archivos modificados). No queda claro si se guardaron.
- **`registerSchema`**: no se ve si su email también pasó a `z.email()`.
- **El error de `updateUser` con `UpdateUserInput` no se resuelve.** Se acaba con el tipo escrito en línea. Tampoco se ve si se tocó el `tsconfig`.
- **`users.routes.ts`**: no se ven los imports de `Router` ni de `validate`.
- **`app.ts`**: no se ven los imports ni `const app = express()`.
- **Capturas p2 35:27 y 35:30**: aparece algo como `z.treeifyError(parsed.error).?latten()`, ilegible. La versión final no lo lleva.
- **Tooltip de `sub` en `jwt.sign`**: muestra `String.sub()` (obsoleto). Es un falso positivo del editor: en el JWT, `sub` es solo la clave del payload.
- **Contraseña de `DATABASE_URL`**: se ha omitido a propósito.
- **`registerSchema.parse`**: en el controlador de auth se usa `parse` dentro del `try`, en vez del middleware `validate`. Un error de Zod acaba en el 400 genérico con `e.message`. No se comentó si se va a cambiar.
