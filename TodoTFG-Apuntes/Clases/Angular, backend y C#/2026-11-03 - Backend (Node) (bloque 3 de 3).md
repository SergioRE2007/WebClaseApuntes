# Clase del 2026-11-03 (bloque 3 de 3) · Backend (Node)

# Clase 03-11 (Prisma / Swagger), bloque 3 de 3: tests, Docker de producción y Swagger en la API Express

El profesor recorre su repo de referencia `node-server-26-27` en Cursor, versión a versión (tags de Git). En este bloque explica la **v0.9.0** (tests), la **v1.0.0** (producción con Docker y documentación con Swagger) y, por encima, las versiones posteriores (v1.0.1 a v1.1.3).

## 1. Qué se explicó, en orden

| Minuto | Tema |
|---|---|
| 19:21-19:43 | `src/tests/users.test.ts`: tests de `PATCH /api/users/me/password` (bien, contraseña actual incorrecta, sin token) y de `GET /api/users/:id` (bien y 404). |
| 20:22 | `src/tests/auth.test.ts`: test de `POST /api/auth/register`. |
| 20:25-27:16 | Historial de versiones en Git Graph (ver la parte de Git). |
| 27:31-28:11 | README como "Manual completo" y CHANGELOG: resumen de la v0.9.0 (scripts `test`, `test:watch` y `test:coverage`, rate limiting desactivado en tests) y "Seguridad en producción" de la v1.0.0. |
| 28:34-30:30 | README de la v1.0.0. Paso 1: instalar Swagger. Paso 2: crear `src/config/swagger.ts`. |
| 30:49 | README: paso 5 (`.dockerignore`) y paso 6 (`docker-compose.prod.yml`). |
| 31:07 | `env.production.example`. |
| 32:03 | `.gitignore`. |
| 32:31-37:08 | **Dockerfile multietapa**, línea a línea. También `.dockerignore` (33:08) y `src/index.ts` con el apagado controlado (36:15). |
| 37:30 | `docker-compose.yml` de desarrollo (solo Postgres). |
| 37:44-41:00 | **`docker-compose.prod.yml`**, clave a clave, con los tooltips del esquema compose-spec (`interval`, `retries`...). Muestra también `.env` (Supabase) y `env.production.example` (40:04-40:15). |
| 41:13-41:25 | Diff de `app.ts` en la v1.0.0: `helmet()` pasa a `helmet({ contentSecurityPolicy: false })` y se importan `swaggerUi` y `swaggerSpec`. |
| 41:35-43:04 | `src/config/swagger.ts`: `info`, `servers`, `securitySchemes` (bearer JWT), `schemas`, `tags` y `apis`. |
| 43:36-45:02 | Estructura por módulos. Diff de `auth.routes.ts` (se añade `validate(schema)` a register y login) y `users.schema.ts` con Zod. |
| 45:26-49:05 | Versiones posteriores en Git Graph (v1.0.1 a v1.1.3). |
| 49:21-51:31 | `app.ts` final: `/api-docs` con `swaggerUi.serve` y `swaggerUi.setup(swaggerSpec)`. Compara con un artículo de freeCodeCamp que usa **swagger-autogen**. |

## 2. Conceptos y patrones

### Tests (Jest + Supertest)
- Se importa la `app` de Express sin levantar el servidor: `request(app)`.
- Para que el email no se repita entre ejecuciones se usa `` `test${Date.now()}@example.com` ``.
- Se comprueba tanto el estado HTTP como el mensaje del body: `expect(res.status).toBe(...)` y `res.body.message`.
- Hay que comprobar que la respuesta no expone el hash de la contraseña: `not.toHaveProperty('passwordHash')`.
- Se prueban casos negativos: 400 con datos incorrectos, sin token (401) y 404 con un id que no existe.
- Se encadenan peticiones: después de cambiar la contraseña, se comprueba que el login funciona con la nueva.
- En `app.ts`, el rate limiting se desactiva cuando `NODE_ENV === 'test'`.
- Cuenta de tests: 8 en Auth y 13 en Users.

### Docker de producción
- **Build multietapa.** La etapa `builder` instala todo, hace `prisma generate` y compila TypeScript. La etapa final copia solo `dist`, el cliente generado `node_modules/.prisma` y la carpeta `prisma/`.
- `COPY package*.json` va antes de `COPY . .` para aprovechar la caché de capas.
- `npm ci` instala exactamente lo que dice el lockfile. En la imagen final se instalan solo las dependencias de producción.
- `dumb-init` hace de PID 1, así las señales (SIGTERM) llegan bien a Node.
- El contenedor no corre como root: `USER node`.
- `ENV NODE_ENV=production`, `EXPOSE 3000` y `CMD` en forma de array.
- `.dockerignore` deja fuera de la imagen `node_modules`, `dist`, los `.env`, `.git`, los `*.md`, etc.

### Apagado controlado
En `index.ts`, `process.on('SIGTERM' | 'SIGINT')` llama a `server.close()` y después a `process.exit(0)`.

### Docker Compose
- Variables con valor por defecto: `${VAR:-valor}`.
- El host de la base de datos es el nombre del servicio (`db:5432`).
- `healthcheck` con `pg_isready`. El tooltip da los valores por defecto: `interval` 30s y `retries` 3.
- `depends_on` con `condition: service_healthy`.
- Red `bridge` propia, volumen con nombre `pgdata` y `restart: unless-stopped`.
- El compose de desarrollo solo levanta Postgres con el puerto 5432 publicado. El de producción levanta `db` y `api` (`build: .`).

### Secretos
- `.env` y `.env.production` no se suben (están en `.gitignore`).
- Se versiona una plantilla, `env.production.example`, sin secretos reales.
- `JWT_SECRET` se pasa desde el entorno y no se escribe en el YAML.

### Swagger / OpenAPI
- `swagger-jsdoc` genera la especificación OpenAPI 3.0.0 a partir de comentarios JSDoc en los `*.routes.ts`.
- `swagger-ui-express` la sirve en `/api-docs`.
- Hace falta `helmet` sin CSP para que se vea Swagger UI.
- `securitySchemes.bearerAuth` permite probar las rutas protegidas con el JWT.
- `tags` agrupa los endpoints (Auth, Users).
- Alternativa vista en freeCodeCamp: swagger-autogen, que lee el código y genera `swagger_output.json`.

### Validación con Zod
- Middleware `validate(schema)` delante del controlador en cada ruta.
- Esquemas en `users.schema.ts` con mensajes de error propios.
- `.optional()` para las actualizaciones parciales.
- Los tipos se sacan del esquema con `z.infer<typeof ...>`.

### Estructura del proyecto
- `src/config`: `db.ts`, `env.ts`, `swagger.ts`.
- `src/middleware`: `auth`, `error`, `rateLimiter`, `requestLogger`, `validate`.
- `src/modules/<feature>/`: controller, routes, service y schema.
- Además: `tests`, `utils`, y `prisma/` con `schema.prisma` y las migraciones.
- Imports ESM con extensión `.js`.

## 3. Código del profesor (reconstruido)

### Tests
```ts
// src/tests/auth.test.ts
import request from 'supertest';
import app from '../app';

describe('Auth Endpoints', () => {
  const testUser = {
    email: `test${Date.now()}@example.com`,
    name: 'Test User',
    password: 'password123',
  };

  describe('POST /api/auth/register', () => {
    it('debe registrar un nuevo usuario', async () => {
      const res = await request(app).post('/api/auth/register').send(testUser);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user).not.toHaveProperty('passwordHash');
    });
  });
});
```

```ts
// src/tests/users.test.ts (fragmento)
// authToken, userId y testUser vienen de un beforeAll que no se ve [dudoso]
describe('PATCH /api/users/me/password', () => {
  it('debe cambiar contraseña correctamente', async () => {
    const res = await request(app)
      .patch('/api/users/me/password')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ currentPassword: 'password123', newPassword: 'newpassword456' });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Contraseña actualizada correctamente');

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'newpassword456' });
    expect(loginRes.status).toBe(200);
  });

  it('debe fallar con contraseña actual incorrecta', async () => {
    // misma petición con currentPassword: 'wrongpassword'
    // → expect 400 y message 'Contraseña actual incorrecta'
  });

  it('debe fallar sin autenticación', async () => {
    // misma petición sin .set('Authorization', ...)
    // → el expect no se ve; será 401 [dudoso]
  });
});

describe('GET /api/users/:id', () => {
  it('debe fallar con ID inexistente', async () => {
    const res = await request(app)
      .get('/api/users/99999')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(404);
  });
});
```

### Dockerfile
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache dumb-init
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma
ENV NODE_ENV=production
USER node
EXPOSE 3000
CMD ["dumb-init", "node", "dist/index.js"]
```

### docker-compose.prod.yml
```yaml
version: '3.9'
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: ${POSTGRES_DB:-app_db}
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks: [app-network]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
  api:
    build: .
    ports: ["3000:3000"]
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD:-postgres}@db:5432/${POSTGRES_DB:-app_db}
      JWT_SECRET: ${JWT_SECRET}
      BCRYPT_SALT_ROUNDS: ${BCRYPT_SALT_ROUNDS:-10}
    depends_on:
      db:
        condition: service_healthy
    networks: [app-network]
    restart: unless-stopped
volumes:
  pgdata:
networks:
  app-network:
    driver: bridge
```
El `docker-compose.yml` de desarrollo es parecido, pero solo con el servicio `postgres`:
- `container_name: node-server-postgres`.
- `POSTGRES_USER`, `POSTGRES_PASSWORD` y `POSTGRES_DB` escritos tal cual (`postgres` / `postgres` / `app_db`).
- Puerto `"5432:5432"`, el volumen `pgdata` y el mismo healthcheck.

### env.production.example
```
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DATABASE_URL=postgresql://postgres:postgres@db:5432/app_db
BCRYPT_SALT_ROUNDS=10
POSTGRES_PASSWORD=postgres
POSTGRES_DB=app_db
```

### Apagado controlado (src/index.ts)
```ts
import app from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const server = app.listen(env.PORT, () => {
  logger.info(`API escuchando en http://localhost:${env.PORT}`);
  logger.info(`Entorno: ${env.NODE_ENV}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM recibido, cerrando servidor...');
  server.close(() => { logger.info('Servidor cerrado'); process.exit(0); });
});
// process.on('SIGINT', ...) es igual
```

### Swagger
```ts
// src/config/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env.js';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Express + PostgreSQL',
      version: '1.0.0',
      description: 'API REST con autenticación JWT, validación Zod, rate limiting y testing completo',
      contact: { name: 'API Support' },
    },
    servers: [{ url: `http://localhost:${env.PORT}`, description: 'Servidor de desarrollo' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        User: { type: 'object', properties: { /* [no se ve] */ } },
        // ... más de 100 líneas que no salen en pantalla [dudoso]
      },
    },
    tags: [
      { name: 'Auth', description: 'Endpoints de autenticación' },
      { name: 'Users', description: 'Gestión de usuarios' },
    ],
  },
  apis: ['./src/modules/*/*.routes.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
```

```ts
// src/app.ts (v1.0.0)
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { errorHandler } from './middleware/error.js';
import { generalLimiter, authLimiter } from './middleware/rateLimiter.js';
import { requestLogger } from './middleware/requestLogger.js';
import { env } from './config/env.js';
import { swaggerSpec } from './config/swagger.js';
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';

const app = express();
app.use(helmet({ contentSecurityPolicy: false })); // antes: app.use(helmet())
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(requestLogger);
if (env.NODE_ENV !== 'test') app.use(generalLimiter);

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

if (env.NODE_ENV !== 'test') {
  app.use('/api/auth', authLimiter, authRoutes);
} else {
  app.use('/api/auth', authRoutes);
}
app.use('/api/users', usersRoutes);
app.use(errorHandler);
export default app; // [dudoso: no se ve]
```

### Validación con Zod
```ts
// src/modules/auth/auth.routes.ts
import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { registerSchema, loginSchema } from '../users/users.schema.js';
import { registerCtrl, loginCtrl } from './auth.controller.js';

const router = Router();
router.post('/register', validate(registerSchema), registerCtrl); // antes: sin validate
router.post('/login', validate(loginSchema), loginCtrl);
export default router;
```
El tooltip da la firma del middleware:
```ts
validate(schema: ZodType): (req, res, next) => Response | undefined
```

```ts
// src/modules/users/users.schema.ts
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
```

### Ejemplo de freeCodeCamp (CommonJS, con swagger-autogen)
```js
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger_output.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
```

## 4. Librerías, comandos y versiones

| Qué | Detalle |
|---|---|
| Swagger, dependencias normales | `npm install swagger-ui-express swagger-jsdoc @types/swagger-ui-express` |
| Swagger, de desarrollo | `npm install -D @types/swagger-jsdoc` |
| Alternativa vista | `swagger-autogen` (freeCodeCamp) |
| Tests | Jest (con TypeScript y ES modules, `jest.config.js`) y Supertest. Scripts `npm test`, `npm run test:watch` y `npm run test:coverage`. |
| Prisma | Prisma Client **v6.19.0**: `npx prisma generate` dentro del Docker. En la terminal aparece la migración `20251120090028_add_media_table`. |
| Docker | Imágenes `node:20-alpine` y `postgres:16`, `dumb-init` instalado con `apk`, Compose `version: '3.9'`. |
| Seguridad y Express | `helmet`, `cors`, `express-rate-limit` (`generalLimiter` y `authLimiter`), Zod (los tooltips muestran tipos `$ZodTypeInternals`, que son de Zod 4), bcrypt (`BCRYPT_SALT_ROUNDS=10`) y JWT. |
| Base de datos remota | En el `.env` de desarrollo hay una `DATABASE_URL` de **Supabase** (credenciales no transcritas). |
| Herramientas | TypeScript, Prettier y nodemon (`nodemon.json`). |
| `.gitignore` | `node_modules/`, `dist/`, `.env`, `.env.test`, `.env.production`, `*.log`, `logs/`, `coverage/`, `.vscode/`, `.idea/`, `*.tsbuildinfo`, `/src/generated/prisma`. |

## 5. Lo dudoso o ilegible

**Contradicción en Helmet.** El CHANGELOG dice "Helmet con CSP deshabilitado solo para Swagger", pero el código pone `contentSecurityPolicy: false` para toda la app.

**Cosas que hoy están obsoletas:**
- `npm ci --only=production`: hoy se escribe `--omit=dev`.
- La clave `version` de Compose.
- `z.string().email()` sale tachado en el editor (en Zod 4 se usa `z.email()`).

**En los tests:**
- En la primera captura del test de la contraseña falta la línea `.patch('/api/users/me/password')`. En la segunda sí aparece, así que se ha dado por buena.
- No se ve de dónde salen `authToken` y `userId`.
- No se ve el `expect` del test sin autenticación.

**En swagger.ts:** las líneas 26 a 135 (los esquemas y los demás `components`) no salen en ninguna captura. En la v1.0.1 se añaden muchas anotaciones JSDoc en las rutas (+64 en auth y +245 en users), pero tampoco se ven.

**Lo demás:**
- La línea 17 de `app.ts` no se lee en una captura.
- El CHANGELOG habla de health checks del contenedor, pero el Dockerfile no tiene `HEALTHCHECK`: solo está el de Postgres en el compose.
- La migración `add_media_table` (20/11/2025) aparece en la terminal mientras se mira la v1.0.0. La terminal será de una versión posterior (la de media con Cloudinary).
- No se ve qué librería usa `logger` (podría ser Winston, pero no se confirma).
- El hash del commit sale una vez como `556a6e84` y el resto de las veces como `556a6f84`; será `556a6f84`.
