# Clase del 2026-11-03 (bloque 2 de 3) · Backend (Node)

# Clase 03-11 · Prisma / Swagger (bloque 2 de 3): API Node con Winston, rate limiting y tests con Jest

El profesor no escribe el código desde cero. Recorre el repositorio de referencia `node-server-26-27` en Cursor, versión a versión, con los diffs de Git: primero la **v0.8.0** (seguridad adicional: rate limiting y logs con Winston, commit `486c9ecb`) y después la **v0.9.0** (tests con Jest y Supertest, commit `99fb2e12`).

Las capturas tienen dos tramos de minutos: de 00:32 a 00:45 y, después, otra vez desde 00:00 hasta 00:19. Seguramente son dos partes del vídeo; abajo los minutos se dan así.

## 1. Qué se explicó, en orden

**Primera parte del vídeo (v0.8.0)**
- **00:32-00:35 · `src/utils/logger.ts` con Winston.** Niveles propios (`error`, `warn`, `info`, `http`, `debug`) con un color para cada uno (`winston.addColors`). Formato con `combine` + `timestamp` + `colorize` + `printf`. Tres *transports*: consola, `logs/error.log` (solo errores) y `logs/all.log`. `createLogger` con un nivel que depende de `NODE_ENV`.
- **00:34 · `.env` / `.env_local`.** Variables `PORT=3000`, `NODE_ENV=development` y `DATABASE_URL` (Postgres en Supabase, a través del *pooler*). En la terminal sale `prisma generate` y una carpeta de migración (`20251120090028_add_media_table`).
- **00:35-00:36 · `src/index.ts`.** Los `console.log` se cambian por `logger.info`. Se añade un **cierre ordenado** (*graceful shutdown*) con `SIGTERM` y `SIGINT`: `server.close()` y luego `process.exit(0)`.
- **00:36-00:38 · `src/app.ts`.** Se quita `morgan` y se pone un `requestLogger` propio. `express.json({ limit: '10mb' })`, `generalLimiter` global y `authLimiter` solo en `/api/auth`. Se repasa el orden de los middlewares: `errorHandler` al final y `export default app`.
- **00:38-00:42 · `src/middleware/rateLimiter.ts`** con `express-rate-limit`: `windowMs`, `max`, `message`, `standardHeaders`, `legacyHeaders` y `skipSuccessfulRequests`.
- **00:43-00:45 · `src/middleware/requestLogger.ts`.** Mide la duración de cada petición con `res.on('finish')` y elige el nivel del log según el código de estado.
- **00:44 · Git Graph:** detalle del commit de la v0.8.0.

**Segunda parte del vídeo (v0.8.0 → v0.9.0)**
- **00:00-00:01 · `src/middleware/error.ts`.** `console.error` se cambia por `logger.error`, que ahora apunta el método, la ruta, el mensaje y el *stack*.
- **00:02-00:04 · `tsconfig.json`** (diff): `rootDir`, `outDir`, `module nodenext`, `strict`, `esModuleInterop` y un `exclude` con `node_modules`, `dist` y `src/tests`. También se repasa la estructura por módulos.
- **00:04-00:05 · `package.json`.** Scripts de test con ESM (`NODE_OPTIONS=--experimental-vm-modules`), dependencias y devDependencies.
- **00:05-00:10 · `app.ts` en la v0.9.0.** Los limitadores **se desactivan cuando `NODE_ENV === 'test'`**.
- **00:07 · Git:** `git push origin --tags`.
- **00:10-00:11 · `jest.config.js`** con `ts-jest` en modo ESM, `moduleNameMapper` y cobertura.
- **00:11-00:19 · `src/tests/users.test.ts`.** El `beforeAll` registra un usuario y guarda el token. Tests de `GET /api/users`, `GET /api/users/me`, `PATCH /api/users/me` y `PATCH /api/users/me/password`, con los casos buenos y los de error (401, 400).

## 2. Conceptos y patrones
- **Un logger centralizado** (una sola instancia exportada) en vez de `console.log` por todo el código.
- **Niveles con prioridad numérica:** cuanto más bajo el número, más grave. El logger saca de `level` hacia arriba: en desarrollo `debug` (sale todo), y en el resto `warn` (solo `warn` y `error`).
- **Un transport por destino.** Cada transport puede filtrar por nivel (`error.log` solo recoge errores).
- **Middleware propio de log de peticiones:** apunta el tiempo antes de `next()` y escribe el log en el evento `finish` de la respuesta. Con un 5xx usa `error`, con un 4xx `warn` y con el resto `http`. Es una *closure* sobre `start`.
- **Middleware de errores de Express:** recibe 4 parámetros (`err, req, res, next`), va al final de la cadena y devuelve 500 y "Error interno" por defecto. A los parámetros que no se usan se les pone `_` delante (`_next`, `_req`).
- **Rate limiting:** un limitador general (100 peticiones cada 15 min por IP) y otro más estricto para la autenticación (5 intentos cada 15 min, y **solo cuentan los fallidos**, gracias a `skipSuccessfulRequests`). Un middleware se puede poner solo en una ruta: `app.use('/api/auth', authLimiter, authRoutes)`.
- **Orden de los middlewares:** `helmet` → `cors` → `json` → `requestLogger` → limitador → `/health` → rutas → `errorHandler`.
- **`app.ts` separado de `index.ts`:** `app` se exporta para que Supertest lo use en los tests sin levantar el servidor. `index.ts` solo hace `listen` y el cierre ordenado.
- **Graceful shutdown:** al recibir `SIGTERM` o `SIGINT`, `server.close(cb)` deja terminar las peticiones en curso y luego `process.exit(0)`.
- **Configuración por entorno:** `env.ts` en `src/config`. En test se desactivan los limitadores para que los tests no choquen con el 429.
- **ESM con TypeScript:** los imports llevan la extensión `.js` (`'./utils/logger.js'`), con `"type": "module"` y `module: nodenext`.
- **Organización por módulos:** `modules/users/` con `users.routes.ts`, `users.controller.ts`, `users.service.ts` y `users.schema.ts` (Zod). Además `modules/auth`, `middleware/`, `config/`, `utils/` y `tests/`.
- **Tests de integración con Jest y Supertest:**
  - `describe` anidados por endpoint, `it` con la descripción en español y `async/await`.
  - `beforeAll` registra un usuario de prueba con un email único (`Date.now()`) y guarda `authToken` y `userId`.
  - Cabecera `Authorization: Bearer ${authToken}`.
  - Aserciones: `toBe`, `Array.isArray`, `not.toHaveProperty('passwordHash')`. Este último es un test de seguridad: la API no devuelve el hash.
  - Siempre se prueban también los casos negativos: sin token, token inválido y datos inválidos.
  - Después de cambiar la contraseña, se comprueba que el login funciona con la nueva.
- **Versionado con tags de Git** (v0.2.0 … v1.1.1) para avanzar el proyecto por hitos.

## 3. Código de ejemplo del profesor (reconstruido)

### `src/utils/logger.ts`
```ts
import winston from 'winston';
import { env } from '../config/env.js';

const levels = { error: 0, warn: 1, info: 2, http: 3, debug: 4 };

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  new winston.transports.File({ filename: 'logs/all.log' }),
];

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'development' ? 'debug' : 'warn',
  levels,
  format,
  transports,
});
```

### `src/index.ts`
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
  server.close(() => {
    logger.info('Servidor cerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT recibido, cerrando servidor...');
  server.close(() => {
    logger.info('Servidor cerrado');
    process.exit(0);
  });
});
```
Antes eran `process.on('SIGTERM', () => server.close())` y un `console.log`.

### `src/middleware/rateLimiter.ts`
```ts
import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Demasiadas peticiones desde esta IP, intenta de nuevo en 15 minutos' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Demasiados intentos de autenticación, intenta de nuevo en 15 minutos' },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});
```

### `src/middleware/requestLogger.ts`
```ts
import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.path} ${res.statusCode} ${duration}ms`;

    if (res.statusCode >= 500) {
      logger.error(message);
    } else if (res.statusCode >= 400) {
      logger.warn(message);
    } else {
      logger.http(message);
    }
  });

  next();
}
```

### `src/middleware/error.ts`
```ts
import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  logger.error(`${req.method} ${req.path} - ${err.message}`);
  logger.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Error interno' });
}
```
Antes, el parámetro era `_req` y se usaba `console.error(err)`.

### `src/app.ts` (v0.9.0)
```ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/error.js';
import { generalLimiter, authLimiter } from './middleware/rateLimiter.js';
import { requestLogger } from './middleware/requestLogger.js';
import { env } from './config/env.js';
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(requestLogger);

if (env.NODE_ENV !== 'test') {
  app.use(generalLimiter);
}

app.get('/health', (_req, res) => res.json({ ok: true }));

if (env.NODE_ENV !== 'test') {
  app.use('/api/auth', authLimiter, authRoutes);
} else {
  app.use('/api/auth', authRoutes);
}

app.use('/api/users', usersRoutes);

app.use(errorHandler);

export default app;
```
En la v0.8.0 todavía no estaban los `if` de test, y en la v0.7 se usaba `morgan('dev')`.

### `jest.config.js`
```js
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
  },
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/tests/**',
    '!src/index.ts',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
};
```
El `moduleNameMapper` quita el `.js` de los imports para que Jest encuentre el `.ts`.

### `src/tests/users.test.ts` (fragmentos)
```ts
import request from 'supertest';
import app from '../app';

describe('Users Endpoints', () => {
  let authToken: string;
  let userId: number;

  const testUser = {
    email: `testuser${Date.now()}@example.com`,
    name: 'Test User',
    password: 'password123',
  };

  beforeAll(async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    authToken = res.body.token;
    userId = res.body.user.id;
  });

  describe('GET /api/users', () => {
    it('debe listar usuarios con autenticación', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('debe fallar sin autenticación', async () => {
      const res = await request(app).get('/api/users');
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('No autorizado');
    });

    it('debe fallar con token inválido', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer invalid_token');
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Token inválido');
    });
  });

  describe('GET /api/users/me', () => {
    it('debe obtener perfil del usuario autenticado', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.email).toBe(testUser.email);
      expect(res.body.name).toBe(testUser.name);
      expect(res.body).not.toHaveProperty('passwordHash');
    });

    it('debe fallar sin autenticación', async () => {
      const res = await request(app).get('/api/users/me');
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/users/me', () => {
    it('debe actualizar perfil propio', async () => {
      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Name' });
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated Name');
    });

    it('debe fallar sin autenticación', async () => {
      const res = await request(app).patch('/api/users/me').send({ name: 'Updated Name' });
      expect(res.status).toBe(401);
    });

    it('debe fallar con email inválido', async () => {
      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'invalid-email' });
      expect(res.status).toBe(400);
    });
  });

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
      // [dudoso] el cuerpo y las aserciones no se ven en las capturas
    });
  });
});
```

### Scripts de `package.json`
```json
"type": "module",
"scripts": {
  "dev": "nodemon src/index.ts",
  "build": "tsc -p .",
  "start": "node dist/index.js",
  "test": "NODE_ENV=test NODE_OPTIONS=--experimental-vm-modules jest",
  "test:watch": "NODE_ENV=test NODE_OPTIONS=--experimental-vm-modules jest --watch",
  "test:coverage": "NODE_ENV=test NODE_OPTIONS=--experimental-vm-modules jest --coverage"
}
```
Antes, `"test"` era solo `"jest"`.

### `tsconfig.json` (lo esencial)
```json
{
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "module": "nodenext",
    "target": "esnext",
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,
    "noUncheckedIndexedAccess": true,
    "strict": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "noUncheckedSideEffectImports": true,
    "moduleDetection": "force",
    "skipLibCheck": true,
    "esModuleInterop": true
  },
  "exclude": ["node_modules", "dist", "src/tests"]
}
```

## 4. Librerías, dependencias, comandos y versiones
- **dependencies:**
  - `@prisma/client ^6.18.0`, aunque en la terminal se genera la v6.19.0.
  - `bcrypt ^6.0.0`, `cors ^2.8.5`, `dotenv ^17.2.3`.
  - `express ^5.1.0`, `express-rate-limit ^8.2.1`, `helmet ^8.1.0`.
  - `jsonwebtoken ^9.0.2`, `morgan ^1.10.1` (sigue en el package aunque ya no se usa en `app.ts`).
  - `winston ^3.18.3`, `zod ^4.1.12`.
- **devDependencies:**
  - Tipos: `@types/bcrypt ^6.0.0`, `@types/cors ^2.8.19`, `@types/express ^5.0.5`, `@types/jest ^30.0.0`, `@types/jsonwebtoken ^9.0.10`, `@types/morgan ^1.9.10`, `@types/node ^24.10.0`, `@types/supertest ^6.0.3`.
  - Tests: `jest ^30.2.0`, `ts-jest ^29.4.5`, `supertest ^7.1.4`.
  - Desarrollo: `nodemon ^3.1.10`, `ts-node ^10.9.2`, `typescript ^5.9.3`.
- **Comandos que aparecen:**
  - `prisma generate`. Sale "Generated Prisma Client (v6.19.0) to ./node_modules/@prisma/client".
  - `npm run dev`, `npm run build`, `npm start`, `npm test`, `npm run test:watch` y `npm run test:coverage`.
  - `git push origin --tags`.
- **Otros:**
  - PostgreSQL en Supabase (cadena de conexión por el *pooler*). Las credenciales no se transcriben.
  - `docker-compose.yml`, `nodemon.json`, `CHANGELOG.md` y `docs/API_EXAMPLES.md`.
  - Archivos de entorno: `.env`, `.env.example` y `.env_local`.
- **IDE:** Cursor en macOS, con la extensión Git Graph.

## 5. Dudoso o ilegible
- **Minutos:** las capturas van de 00:32 a 00:45 y luego vuelven a empezar en 00:00. Se ha supuesto que son dos partes seguidas del vídeo.
- **Niveles del logger:** en la primera captura `error` y `warn` no se leían bien, pero en otras se ve claro `error: 0, warn: 1`.
- **Ruta del logger:** en una captura parecía estar en `src/config`. Por los imports (`'./utils/logger.js'`, `'../utils/logger.js'`) está en **`src/utils/logger.ts`**.
- **Import de `app` en el test:** `users.test.ts` importa `'../app'` sin `.js`, al revés que el resto del proyecto. Funciona por el `moduleNameMapper` y ts-jest, pero puede que se haya leído mal.
- **Import de Supertest:** `import request from 'supertest'` solo se ve en una captura. En las demás está fuera de pantalla.
- **`"jsx": "react-jsx"` en el `tsconfig`:** es raro en un backend. Seguramente sobra de la plantilla.
- **El test "debe fallar con contraseña actual incorrecta":** no se ve qué envía ni qué código espera (probablemente 400 o 401).
- **Versiones de Jest:** `ts-jest ^29` junto a `jest ^30` es lo que se lee, aunque las mayores no coinciden.
- **Fecha de los commits:** las capturas dicen 4 Nov 2025, aunque la clase es del 03-11. Son las fechas del repositorio de referencia, no de la clase.
- **Tooltips del editor:** a veces dan `any` en `info`, `res.body` y `res.statusCode`. Es solo lo que infiere el editor, no forma parte del código.
