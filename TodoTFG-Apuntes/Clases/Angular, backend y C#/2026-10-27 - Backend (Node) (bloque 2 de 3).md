# Clase del 2026-10-27 (bloque 2 de 3) · Backend (Node)

# Node.js + Express + TypeScript + Prisma: recorrido por el repo del profesor (parte 2, min 0-27)

Proyecto `node-server-26-27` del profesor (Juan Antonio García). Va versionado con tags de Git de v0.1.0 a v1.1.3. El profesor hace checkout de **v0.4.0** y repasa cómo está montado el backend, archivo por archivo.

## 1. Qué se explicó, en orden

| Minuto | Contenido |
|---|---|
| 0:06 | `CHANGELOG.md` con una sección por versión. Ejemplo: v0.1.0 "Proyecto base" (npm, TypeScript, estructura modular, scripts de desarrollo y build, nodemon). |
| 0:11-2:39 | Selector de tags y Git Graph para recorrer el historial (detalle en la parte de Git). Qué archivos añade cada commit: v0.1.0 la base, v0.2.0 `env.ts`, `error.ts`, `app.ts` e `index.ts`, v0.3.0 Prisma y Docker, v0.4.0 Zod y el módulo de usuarios. |
| 2:55-3:42 | `package.json`: diferencia entre `dependencies` y `devDependencies`, qué significa `^` en las versiones, para qué sirven los paquetes `@types/*`, y los scripts `start` y `test`. |
| 4:03-4:37 | `nodemon.json`: claves `watch`, `ext` y `exec`. En v1.0.2 se cambió `ts-node` por `tsx` para que funcionaran bien los ES Modules. |
| 5:05-5:44 | Commit v0.3.0: carpeta `prisma/migrations/<fecha>_init/` con `migration.sql`, `migration_lock.toml`, `schema.prisma`, `src/config/db.ts` y `docker-compose.yml`. `db.ts` exporta un único `PrismaClient`. |
| 5:57-8:11 | `schema.prisma`: bloques `generator` y `datasource` (postgresql, `env("DATABASE_URL")`) y modelo `User` con `@id @default(autoincrement())`, `@unique`, `passwordHash` y `@default(now())`. Después enseña el SQL que genera la migración. |
| 8:31-9:14 | Diff de `app.ts` entre v0.4.0 y v0.5.0: se añade el import de `usersRoutes` y `app.use('/api/users', usersRoutes)`. |
| 9:22-10:17 | `index.ts`: arranque con `app.listen(env.PORT)` y cierre limpio con `SIGTERM` y `SIGINT`. **Demostración:** borra `const app = express();` para enseñar los errores "Cannot find name 'app'" (10 problemas) y luego lo restaura. |
| 10:27-10:48 | `.env` con `PORT`, `NODE_ENV` y `DATABASE_URL` (Postgres en `localhost:5432/app_db`). |
| 10:59-12:34 | `config/env.ts`: carga con `dotenv/config`, función `required()` que lanza un error si falta una variable, valores por defecto con `??` y `Number()`. Explica que `process.env.X` es de tipo `string | undefined`. |
| 12:41-13:32 | `app.ts` completo: middlewares globales en orden (`helmet`, `cors`, `express.json`, `morgan('dev')`), `/health`, el router montado por prefijo y `errorHandler` siempre al final. |
| 13:35-14:15 | Estructura por módulos: `src/modules/users/` con `users.controller.ts`, `users.routes.ts`, `users.schema.ts` y `users.service.ts`. |
| 14:22-17:13 | `users.routes.ts` con `Router()` y las rutas GET `/`, GET `/:id`, PATCH `/:id` (con `validate(schema)`) y DELETE `/:id`. **Demostraciones:** escribe `app.use('api/users/', (req, resp) => {...})` para enseñar un manejador en línea (sin la barra inicial) y lo borra. Añade `router.post('/', createUserCtrl)` y sale "Cannot find name 'createUserCtrl'", porque ese controlador no existe en esta versión. |
| 17:08-18:00 | `users.controller.ts`: funciones `async` con `try/catch`, `res.json`, 500 con el mensaje del error, `Number(req.params.id)` + `isNaN` y 400 "ID inválido". Enseña con tooltips los tipos de `Request` y `Response` (`Promise<void>`, `ParamsDictionary`, `ParsedQs`). |
| 18:15-20:18 | `users.service.ts` con Prisma: `findUnique`, `findMany` con `select` y `orderBy`, y `update`. El `select` sirve para no devolver nunca `passwordHash`. Repasa el tooltip de `prisma.user`, que lista las operaciones CRUD del modelo. El editor marca un aviso en `schema.prisma` porque `url` ya no se admite en el datasource. |
| 23:59-26:15 | `middleware/validate.ts`: función que devuelve un middleware, `schema.safeParse(req.body)`, 400 con `errors`, `req.body = parsed.data` y `next()`. El editor avisa de que `ZodSchema` y `.flatten()` están **obsoletos** en Zod 4 (aviso `ts(6387)`). |
| 27:14-27:28 | `users.schema.ts`: `registerSchema`, `loginSchema` y `updateUserSchema` (todos los campos `.optional()` para que el PATCH sea parcial), con mensajes en español y tipos sacados con `z.infer`. |

## 2. Conceptos y patrones

**Arquitectura en capas por módulo**
- Las capas son rutas → (middleware de validación) → controlador → servicio → Prisma.
- Cada recurso tiene su carpeta en `src/modules/<recurso>/`.

**Separar `app.ts` de `index.ts`**
- `app.ts` configura Express y lo exporta.
- `index.ts` solo arranca el servidor y lo cierra bien al recibir una señal.

**Configuración centralizada (`env.ts`)**
- La app no arranca si falta una variable obligatoria (`JWT_SECRET`, `DATABASE_URL`).
- Las opcionales tienen valor por defecto: `PORT` 3000, `NODE_ENV` development y `BCRYPT_SALT_ROUNDS` 10.

**Orden de los middlewares**
- Primero los de seguridad y parseo, luego las rutas, y el manejador de errores el último.

**Validación reutilizable**
- Hay un solo `validate(schema)` para cualquier ruta.
- Usa `safeParse`, que no lanza excepciones, y devuelve 400.
- Sustituye el body por los datos ya validados.

**Prisma**
- Un único cliente, exportado desde `config/db.ts`.
- El `select` elige qué campos se devuelven.
- `orderBy` ordena los resultados.
- Las migraciones con fecha se guardan en el repo.

**Códigos HTTP**
- 200 con `res.json`.
- 400 cuando el id o el body no son válidos.
- 500 en el `catch`.

**Imports y tipos**
- Se usa ESM, así que los imports llevan extensión `.js` aunque el archivo sea `.ts`.
- Los tipos se importan con `import type`.

**Versionado incremental**
- Cada etapa es un commit con su tag y su entrada en el CHANGELOG.

## 3. Código del profesor reconstruido

```json
// package.json (v0.1.0 / v0.4.0)
"scripts": { "start": "node dist/index.js", "test": "jest" },
"dependencies": {
  "bcrypt": "^6.0.0", "cors": "^2.8.5", "dotenv": "^17.2.3", "express": "^5.1.0",
  "helmet": "^8.1.0", "jsonwebtoken": "^9.0.2", "morgan": "^1.10.1", "zod": "^4.1.12"
},
"devDependencies": {
  "@types/bcrypt": "^6.0.0", "@types/cors": "^2.8.19", "@types/express": "^5.0.5",
  "@types/jsonwebtoken": "^9.0.x", "@types/morgan": "^1.9.10", "@types/node": "^24.10.0",
  "nodemon": "^3.1.10", "ts-node": "^10.9.2", "typescript": "^5.9.3"
}
```
La versión exacta de `@types/jsonwebtoken` no se lee [dudoso]. Seguramente había más scripts (`dev`, `build`) en líneas que no se ven [dudoso].

```json
// nodemon.json (en v1.0.2, "ts-node src/index.ts" pasa a "tsx src/index.ts")
{ "watch": ["src"], "ext": "ts", "exec": "tsx src/index.ts" }
```

```prisma
// prisma/schema.prisma
generator client { provider = "prisma-client-js" }
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
model User {
  id           Int      @id @default(autoincrement())
  email        String   @unique
  name         String
  passwordHash String
  createdAt    DateTime @default(now())
}
```

```sql
-- prisma/migrations/20251104112830_init/migration.sql
CREATE TABLE "User" (
  "id" SERIAL NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email"); -- [dudoso: final cortado]
```

```ts
// src/config/db.ts
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();
```

```ts
// src/config/env.ts
import 'dotenv/config';
const required = (v: string | undefined, k: string) => {
  if (!v) throw new Error(`Falta variable de entorno: ${k}`);
  return v;
};
export const env = {
  PORT: Number(process.env.PORT ?? 3000),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  JWT_SECRET: required(process.env.JWT_SECRET, 'JWT_SECRET'),
  DATABASE_URL: required(process.env.DATABASE_URL, 'DATABASE_URL'),
  BCRYPT_SALT_ROUNDS: Number(process.env.BCRYPT_SALT_ROUNDS ?? 10),
};
```

```ts
// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/error.js';
import usersRoutes from './modules/users/users.routes.js';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/users', usersRoutes);
app.use(errorHandler);
export default app;
```

```ts
// src/index.ts
import app from './app.js';
import { env } from './config/env.js';
const server = app.listen(env.PORT, () => {
  console.log(`API escuchando en http://localhost:${env.PORT}`);
});
process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
```

```ts
// src/modules/users/users.routes.ts
import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { updateUserSchema } from './users.schema.js';
import { listUsersCtrl, getUserCtrl, updateUserCtrl, deleteUserCtrl } from './users.controller.js';

const router = Router();
router.get('/', listUsersCtrl);
router.get('/:id', getUserCtrl);
router.patch('/:id', validate(updateUserSchema), updateUserCtrl);
router.delete('/:id', deleteUserCtrl);
export default router;
```

```ts
// src/modules/users/users.controller.ts
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

export async function getUserCtrl(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    const user = await findUserById(id);
    // [dudoso] resto no visible (probablemente 404 si no existe y res.json(user))
  } catch (error: any) { /* [dudoso] */ }
}
```

```ts
// src/modules/users/users.service.ts
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
// findUserByEmail(email: string) y deleteUser existen, pero no se ve su cuerpo [dudoso]
```

```ts
// src/middleware/validate.ts
import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';            // obsoleto en Zod 4

export const validate = (schema: ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() }); // flatten() obsoleto en Zod 4
  }
  req.body = parsed.data;
  next();
};
```

```ts
// src/modules/users/users.schema.ts
export const registerSchema = z.object({
  // email y name [dudoso: líneas fuera de pantalla]
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres')
});
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres')
});
export const updateUserSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
```

```env
# .env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:<contraseña>@localhost:5432/app_db"
```

## 4. Librerías, comandos y versiones

**Dependencias de producción**
- express ^5.1.0
- cors ^2.8.5
- helmet ^8.1.0
- morgan ^1.10.1
- dotenv ^17.2.3
- zod ^4.1.12
- bcrypt ^6.0.0
- jsonwebtoken ^9.0.2

**Dependencias de desarrollo**
- typescript ^5.9.3
- nodemon ^3.1.10
- ts-node ^10.9.2 (sustituido por `tsx` en v1.0.2)
- @types/node ^24.10.0
- Los `@types` de cada librería

**Base de datos y entorno**
- Prisma (`prisma-client-js`, `@prisma/client`, Prisma Migrate)
- PostgreSQL en Docker (`docker-compose.yml`)

**Lo que aparece en versiones posteriores (mensajes de los tags)**
- express-rate-limit y Winston (v0.8.0)
- Jest y Supertest (v0.9.0)
- Swagger/OpenAPI (v1.0.1 y v1.1.3)
- Cloudinary para subir archivos (v1.1.0)
- Despliegue en Vercel (rama `vercel-deployment`)

**Scripts y terminal**
- `npm start` ejecuta `node dist/index.js`.
- `npm test` ejecuta `jest`.
- La terminal está en la rama `git:(v0.4.0)`.

## 5. Lo dudoso o ilegible

- No se ve el contenido de `middleware/error.ts` (`errorHandler`).
- Del controlador tampoco se ven el final de `getUserCtrl`, `updateUserCtrl` y `deleteUserCtrl`.
- `registerSchema` está cortado: solo se lee `password`.
- Tampoco se ve cómo se importa `z` (seguramente `import { z } from 'zod'`).
- El aviso del editor sobre `url` en el `datasource` ("Move connection URLs fo...") sale probablemente porque la extensión de Prisma ya es de la versión 7. El repo está en Prisma 6 y el profesor no lo comenta.
- Los avisos de `ZodSchema` y `.flatten()` como obsoletos se deben a que el código usa la API de Zod 3 con Zod 4 instalado. El profesor lo enseña en el tooltip, pero no se ve que lo cambie.
- Las rutas de auth (`register` y `login`) llegan en v0.5.0 y v0.6.0. En esta clase solo aparecen en los mensajes de commit.
- En el diff de `package.json` de v0.3.0 los contadores pequeños (+1 -1 o +1 -0) se leen mal.
