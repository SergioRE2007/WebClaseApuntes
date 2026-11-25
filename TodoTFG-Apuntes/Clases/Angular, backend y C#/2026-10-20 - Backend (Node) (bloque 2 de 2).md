# Clase del 2026-10-20 (bloque 2 de 2) · Backend (Node)

# Node + TypeScript + Express: servidor básico, variables de entorno, middlewares y primer vistazo a Prisma y Docker (20/10, bloque 2)

## 1. Qué se explicó, en orden

La clase tiene dos partes:
- **De 27:39 a 39:32** el profesor monta en directo un proyecto pequeño (`node-server`).
- **Desde 39:37** abre su proyecto de referencia (`node-server-26-27`, con tags `v1.0.0` y `v1.1.0`) y explica cómo está hecho de verdad.

| Minuto | Qué se hizo |
|---|---|
| 27:39 | `src/app.ts`: crea la app con `express()` y la exporta con `export default app`. Ahí ya está importado `morgan`, aunque todavía no se usa. |
| 27:46 | `src/index.ts`: importa la app y la configuración (`./config/env.js`) y arranca el servidor con `app.listen(env.NODE_PORT, ...)`. |
| 27:49 | Arranca con `npm run dev`, que ejecuta nodemon y este lanza `npx tsx watch src/index.ts`. |
| 28:00 | Error: `SyntaxError: The requested module './app.js' does not provide an export named 'default'` (Node v22.20.0). En ese momento `app.ts` estaba sin guardar. Además, `index.ts` tenía un `export default app` que sobraba. Lo quita: el fichero de arranque no exporta nada. |
| 28:16 | Funciona: `Server is running on port 3000`. La terminal muestra `injected env (2) from .env`. |
| 28:16 – 29:35 | `src/config/env.ts` con `dotenv.config()` y `process.env.X \|\| valorPorDefecto`. Con el tooltip del editor enseña que `process.env.NODE_PORT` es de tipo `string \| undefined`. Prueba a escribir el puerto a mano (`NODE_PORT: 3000`) y a cambiar el valor por defecto para ver de dónde sale la configuración. |
| 29:07 – 29:57 | Fichero `.env` con `NODE_PORT` y `NODE_ENV`. Cambia el puerto (3000 → 3001) para ver que nodemon reinicia. |
| 30:13 | Cambia `import dotenv` + `dotenv.config()` por `import "dotenv/config"`, que hace lo mismo en una línea. |
| 30:49 – 31:12 | Cambia el `console.log` del arranque para que lea el puerto con una plantilla de texto. Primero lo escribe con comillas simples y el editor da error (`Unterminated string literal`). Lo arregla con backticks y `${env.NODE_PORT}`. |
| 31:29 – 32:37 | Más pruebas con el puerto, tanto en el `.env` como en el valor por defecto de `env.ts`. La terminal acaba diciendo puerto 3010. |
| 32:56 | En el navegador, `localhost:3010` responde `Cannot GET /`: es el 404 que da Express por defecto cuando no hay ninguna ruta. |
| 33:16 | Añade `app.use(morgan('dev'))` para que salgan las peticiones en la consola. |
| 34:10 – 34:13 | Añade `app.use(express.json())` y lo vuelve a quitar. Para el servidor con Ctrl+C y sale `Previous process hasn't exited yet. Force killing...`. |
| 34:38 | Con morgan funcionando se ve `GET / 404 3.110 ms - 139`. |
| 35:17 – 35:43 | Primera ruta, `app.get('/health', ...)`, que responde `res.status(200).json({ message: 'OK' })`. Por el camino comete errores de llaves (`'}' expected`). En el navegador sale `{"message":"OK"}`, y en la consola `GET /health 200` y `GET /favicon.ico 404`. |
| 36:35 – 37:40 | Explora el objeto `req` con el autocompletado (`headers`, `hostname`, `ip`, `method`...) y escribe `console.log(req.ip)`. Pasa el ratón por `res.json` para leer su documentación (`res.status(404).json(...)`, etc.). Prueba `console.log('Health check')` y una segunda ruta `/health-check` a medio escribir, y luego deja solo `/health`. |
| 38:46 – 39:32 | Revisa el `package.json` del proyecto: `"type": "module"`, el script `dev` y las dependencias. |
| 39:37 | **Proyecto de referencia.** `env.ts` con una función `required()` que lanza un error si falta una variable, más `??` y `Number(...)`. |
| 39:50 | `tsconfig.json` con `module: nodenext` y modo estricto. |
| 40:02 | Ramas y tags del repo de referencia (`v1.0.0`, `v1.1.0`). |
| 40:13 – 40:22 | Estructura de carpetas: `src/config`, `src/middleware/error.ts`, `app.ts` e `index.ts`. |
| 40:27 – 41:59 | `index.ts` guarda lo que devuelve `app.listen` en una constante (`const server = app.listen(...)`) y cierra el servidor de forma ordenada con `process.on('SIGTERM' / 'SIGINT', () => server.close())`. Lo reescribe con llaves (con errores de sintaxis por el camino) y lo deja en una línea. |
| 42:05 – 47:36 | `app.ts` completo: `helmet`, `cors`, `express.json()` y `morgan`, luego `/health`, y al final `errorHandler`. Insiste en el orden. Prueba `helmet({ contentSecurityPolicy: false })` y vuelve a `helmet()`. |
| 47:39 – 48:48 | `src/middleware/error.ts`: middleware de errores con cuatro parámetros. |
| 49:00 | `src/config/db.ts`: una única instancia de `PrismaClient` exportada para toda la app. |
| 49:21 – 49:50 | `package.json` de referencia: dependencias y devDependencies con sus versiones. |
| 49:59 – 50:02 | `CHANGELOG.md`, sección "v0.3.0 - PostgreSQL + Docker con Prisma", con los comandos de Docker y Prisma. |
| 50:07 – 54:23 | `prisma/schema.prisma`: `generator`, `datasource postgresql` y `model User`. El editor marca un error en `url = env("DATABASE_URL")`: con Prisma 7 esa propiedad ya no se admite, y el editor ofrece "Pin this workspace to Prisma 6". |
| 54:28 – 56:17 | `docker-compose.yml` con un servicio `postgres:16`, variables de entorno, puerto 5432, volumen `pgdata` y `healthcheck`. |

## 2. Conceptos y patrones

**Organización del servidor**
- **`app.ts` y `index.ts` separados.** `app.ts` crea y configura Express y lo exporta (`export default app`). `index.ts` solo arranca el servidor (`app.listen`) y no exporta nada. Así la app se puede importar en otros sitios, por ejemplo en los tests.
- **Módulos ES en TypeScript.** Con `"type": "module"`, los imports de ficheros propios llevan la extensión `.js` aunque el fichero sea `.ts` (`'./app.js'`, `'./config/env.js'`).
- **Estructura por capas:** `src/config` (env y db), `src/middleware` (error), `app.ts`, `index.ts` y `prisma/`. En el árbol del proyecto de referencia también aparecen `modules`, `utils`, `tests` y `logs`.

**Variables de entorno**
- Todo se lee desde un objeto `env` exportado en `config/env.ts`. El resto del código nunca usa `process.env` directamente.
- Se carga el `.env` con `dotenv.config()` o, más corto, con `import "dotenv/config"`.
- `process.env.X` es de tipo `string | undefined`, así que hace falta un valor por defecto (`||` o `??`) o una conversión (`Number(...)`).
- En la versión de referencia, las variables obligatorias pasan por `required()`, que lanza un error y hace que la app no arranque si falta alguna (`JWT_SECRET`, `DATABASE_URL`, Cloudinary).

**Desarrollo y depuración**
- **nodemon + tsx.** nodemon vigila `src/**/*` (extensión `ts`) y ejecuta `npx tsx watch src/index.ts`. Reinicia al guardar, y `rs` reinicia a mano.
- **Leer los errores:** la pestaña Problems del editor (llaves sin cerrar, cadenas sin terminar, `Identifier expected`) y el stack trace de la terminal (export default que no existe).
- **Plantillas de texto:** backticks con `${...}`. Con comillas simples, el `${}` no se sustituye por el valor.

**Rutas de Express**
- Se declaran con `app.get(ruta, (req, res) => ...)` y responden con `res.status(código).json(obj)`.
- **Ruta de salud `/health`** para comprobar que el servidor está vivo.
- Si un parámetro no se usa, se escribe con guion bajo delante (`_req`, `_next`).
- Express responde `Cannot GET /` (404) a las rutas que no existen. El 404 de `favicon.ico` lo provoca el navegador, no es un fallo de la app.

**Middlewares**
- Se registran con `app.use()` y **el orden importa:**
  1. Seguridad: `helmet()` (cabeceras) y `cors()`.
  2. `express.json()`, para leer el body JSON.
  3. `morgan('dev')`, para el log de peticiones.
  4. Las rutas.
  5. **`errorHandler`, siempre el último.**
- **Middleware de errores:** Express lo reconoce porque tiene cuatro parámetros `(err, req, res, next)`. Escribe el error en consola, usa `err.status || 500` y responde con JSON `{ message }` (por defecto `'Error interno'`).
- **helmet admite opciones:** por ejemplo, `{ contentSecurityPolicy: false }` desactiva la CSP. Lo probó, pero lo dejó con la configuración por defecto.

**Cierre ordenado (graceful shutdown)**
- Se guarda el `server` que devuelve `app.listen`.
- Con `process.on('SIGTERM')` y `process.on('SIGINT')` se llama a `server.close()`, que deja de aceptar conexiones antes de que el proceso termine (al pulsar Ctrl+C o cuando Docker para el contenedor).

**Prisma**
- `schema.prisma` tiene tres bloques: `generator`, `datasource` (provider `postgresql` con `DATABASE_URL`) y `model`.
- Atributos que aparecen: `@id`, `@default(autoincrement())`, `@unique` y `@default(now())`.
- La contraseña se guarda como `passwordHash`, nunca en claro.
- `PrismaClient` se instancia una sola vez en `config/db.ts`.

**Docker Compose**
- La base de datos PostgreSQL corre en un contenedor.
- Se configura con:
  - variables `POSTGRES_USER`, `POSTGRES_PASSWORD` y `POSTGRES_DB`;
  - el puerto `host:contenedor`;
  - un volumen con nombre para que los datos no se pierdan;
  - un `healthcheck` con `pg_isready`.
- El tooltip de `retries` explica que es el número de fallos seguidos que hacen falta para marcar el contenedor como *unhealthy* (por defecto, 3).

## 3. Código de ejemplo del profesor

### Proyecto en directo (`node-server`)

`src/config/env.ts` (versión final):
```ts
import "dotenv/config";

export const env = {
  NODE_PORT: process.env.NODE_PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
};
```
Primera versión, antes de cambiarla:
```ts
import dotenv from 'dotenv';
dotenv.config();
```

`.env`:
```
NODE_PORT=3000
NODE_ENV=development
```

`src/app.ts`:
```ts
import express from 'express';
import morgan from 'morgan';

const app = express();

app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.status(200).json({ message: 'OK' });
});

export default app;
```

`src/index.ts`:
```ts
import app from './app.js';
import { env } from './config/env.js';

app.listen(env.NODE_PORT, () => {
  console.log(`Server is running on port ${env.NODE_PORT}`);
});
```

### Proyecto de referencia (`node-server-26-27`)

`src/config/env.ts`:
```ts
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
  CLOUDINARY_CLOUD_NAME: required(process.env.CLOUDINARY_CLOUD_NAME, 'CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: required(process.env.CLOUDINARY_API_KEY, 'CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: required(process.env.CLOUDINARY_API_SECRET, 'CLOUDINARY_API_SECRET'),
};
```

`src/index.ts`:
```ts
import app from './app.js';
import { env } from './config/env.js';

const server = app.listen(env.PORT, () => {
  console.log(`API escuchando en http://localhost:${env.PORT}`);
});

process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
```

`src/app.ts`:
```ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/error.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use(errorHandler);

export default app;
```
La variante que probó: `app.use(helmet({ contentSecurityPolicy: false }));`.

`src/middleware/error.ts`:
```ts
import type { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Error interno' });
}
```

`src/config/db.ts`:
```ts
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
```

`prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")   // con Prisma 7 el editor lo marca como no soportado
}

model User {
  id           Int      @id @default(autoincrement())
  email        String   @unique
  name         String
  passwordHash String
  createdAt    DateTime @default(now())
}
```

`docker-compose.yml`:
```yaml
version: '3.9'

services:
  postgres:
    image: postgres:16
    container_name: node-server-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

`tsconfig.json` (opciones que se leen):
- `module: "nodenext"`, `target: "esnext"`, `types: ["node"]`
- `sourceMap`, `declaration`, `declarationMap`
- `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- `verbatimModuleSyntax`, `isolatedModules`, `noUncheckedSideEffectImports`, `moduleDetection: "force"`
- `skipLibCheck`, `esModuleInterop`
- `jsx: "react-jsx"`, que viene de la plantilla
- `rootDir: ./src` y `outDir: ./dist`, que aparecen comentados

## 4. Librerías, comandos y versiones

**Proyecto en directo** (`package.json`: `name: server`, `version: 1.0.0`, `type: module`, script `"dev": "npx nodemon"`)
- express ^5.3.0
- morgan ^1.12.1
- dotenv ^18.0.8 [dudoso, ver sección 5]
- nodemon 3.1.14
- tsx
- Node.js v22.20.0

**Proyecto de referencia**
- dependencies:
  - @prisma/client ^6.18.0
  - bcrypt ^6.0.0
  - cors ^2.8.5
  - dotenv ^17.2.3
  - express ^5.1.0
  - helmet ^8.1.0
  - jsonwebtoken ^9.0.2
  - morgan ^1.10.1
  - zod ^4.1.12
- devDependencies:
  - @types/bcrypt ^6.0.0
  - @types/cors ^2.8.19
  - @types/express ^5.0.5
  - @types/jsonwebtoken ^9.0.10
  - @types/morgan ^1.9.10
  - @types/node ^24.10.0
  - nodemon ^3.1.10
  - ts-node ^10.9.2
  - typescript ^5.9.3
- PostgreSQL 16 (imagen Docker) y Docker Compose
- Carpetas y ficheros que se ven en el árbol: `.env.example`, `Dockerfile`, `jest.config.js`, `README.md`, `CHANGELOG.md`, `scripts/` y `prisma/migrations`

**Comandos**
```bash
npm run dev                                     # nodemon -> npx tsx watch src/index.ts
rs                                              # reiniciar nodemon a mano
mkdir dist
docker-compose down
npx prisma migrate dev --name nombre_migracion
npx prisma studio
npx prisma generate
```

## 5. Dudoso o ilegible

- **Puertos:** la terminal enseña 3000, 3001 y 3010 en momentos distintos, mientras el `.env` y el valor por defecto de `env.ts` iban cambiando. No siempre se ve con qué valor reinició el servidor. Al final se prueba en `localhost:3010` y luego en `localhost:3000`, con el `.env` otra vez en 3000.
- **Error del `export default` (28:00):** no se ve claro qué lo provocó. Lo más probable es que `app.ts` estuviera sin guardar. La solución que se ve es quitar el `export` que sobraba en `index.ts`.
- **dotenv ^18.0.8** en el proyecto en directo: es raro, porque el de referencia usa ^17.2.3. Puede ser un error de lectura.
- **Texto gris superpuesto** en varias capturas (`export default app.listen(...)`, `|| 3001`...): parecen sugerencias del autocompletado de Cursor, no código real.
- **`console.log` de 32:13:** acaba con algo como `in ${env.NODE_ENV} no...`, cortado por el borde. La versión que se ve después solo muestra el puerto.
- **`console.log` del `index.ts` de referencia:** se lee con comillas simples y `${env.PORT}`, cosa que no interpolaría. Lo normal es que sean backticks.
- **Ruta `/health`:** se vio `console.log(req.ip)`, luego `console.log('Health check')`, y al final ninguno de los dos se ve en la versión limpia.
- **Mapeo de puertos de Docker (55:34):** se estaba editando y se lee `"5432:543…"`. La versión que queda es `"5432:5432"`.
- **Aviso de Prisma 7 sobre `url`:** no se ve cómo lo resuelve el profesor (si fija Prisma 6 o cambia la configuración). El proyecto usa `@prisma/client` ^6.18.0.
- **Firma de `errorHandler` en el tooltip:** algunas partes de los tipos (`ParamsDictionary`, `QueryString.ParsedQs`) se leen mal, pero no afecta al código.
