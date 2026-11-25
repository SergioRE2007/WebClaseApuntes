# Clase del 2026-11-03 (bloque 1 de 3) · Backend (Node)

# Clase 03/11 · Prisma (bloque 1 de 3): migraciones, *drift*, introspección y logger con Winston

Se trabaja sobre la API del profesor (`node-server-26-27`, Express 5 + TypeScript + Prisma 6 + PostgreSQL en Supabase), abierta en Cursor.

## 1. Qué se explicó, en orden

| Minuto | Contenido |
|---|---|
| 00:00 – 01:25 | Repaso del proyecto. `.env` con la cadena de conexión a Supabase, que va por el *pooler* `aws-1-eu-west-1.pooler.supabase.com:5432`. La terminal muestra las 2 migraciones aplicadas (`20251104112830_init` y `20251120090028_add_media_table`) y `Generated Prisma Client (v6.19.0)`. Recorrido por las carpetas: `prisma/migrations`, `schema.prisma`, `src/config`, `src/middleware` y `src/modules`. También se abre el `migration.sql` de la migración `init`. |
| 00:29 – 02:12 | **Schema Visualizer de Supabase**: aparecen las tablas `_prisma_migrations`, `Media` y `User`, con la relación `Media.userId → User.id` (1:N). |
| 02:15 – 04:36 | **SQL Editor de Supabase**. `select * from media` y `select * from Media` dan el error `42P01 relation "media" does not exist`, porque PostgreSQL pasa a minúsculas los nombres que no van entre comillas. Con `select * from "Media"` funciona (0 filas). `select * from _prisma_migrations` devuelve 2 filas: `migration_name`, `checksum`, `finished_at` y `applied_steps_count = 1`. |
| 03:52 | El Table Editor muestra la tabla `Media` vacía. |
| 05:10 – 06:49 | **Se provoca un *drift* a propósito**: desde el panel de Supabase se renombra la tabla `Media` a `MediaElements`. `select * from "MediaElements"` funciona. Supabase avisa de que la tabla no tiene RLS activado y queda con acceso anónimo. |
| 06:56 – 07:16 | `npx prisma migrate status` dice "2 migrations found… Database schema is up to date!": este comando solo mira la tabla de migraciones y no detecta el cambio hecho a mano. |
| 07:23 – 07:48 | `npx prisma migrate dev` sí lo detecta. Enseña el resumen de diferencias (Added tables `MediaElements`, Removed tables `Media`, índices y FK) y dice *"We need to reset the public schema… All data will be lost"*. |
| 08:22 | `npx prisma migrate reset` → se responde `yes` → la BD se recrea desde las migraciones. |
| 08:41 – 10:47 | Documentación de la CLI de Prisma en prisma.io/docs/cli (ver la sección 5). |
| 10:55 – 11:37 | En `package.json`, las dependencias. Ayuda de la CLI (`init`, `generate`, `db`, `migrate`, `studio`, `validate`, `format`…). Un resumen de Google con el flujo que hay que seguir después de un `git pull`. |
| 11:51 – 12:00 | Segunda prueba: en Supabase se renombra otra vez la tabla, ahora a `MediaElement`, en singular. |
| 12:12 – 12:40 | **`npx prisma db pull`**, la introspección. El resultado es *"Introspected 2 models and wrote them into prisma/schema.prisma"* y *"Run prisma generate"*. |
| 13:00 – 14:18 | En el diff de Git de `schema.prisma` se ve qué ha cambiado al hacer *pull*: el modelo pasa a `MediaElement` y la relación de `User` a `MediaElement MediaElement[]`. Además salen los `map:` con los nombres originales de las restricciones. |
| 14:31 – 15:36 | Otro `npx prisma migrate reset` (`yes`) y el esquema vuelve a ser `Media` / `User`. |
| 16:51 – 20:49 | Paréntesis sobre **Guepard** (guepard.run) y **GFS** ("Git For database Systems"), que llevan las ramas y la vuelta atrás a las bases de datos. Solo se comentan. |
| 21:10 – 22:29 | Se duplica `.env` como **`.env_local`**, un archivo sin seguimiento de Git. En el panel *Connect to your project* de Supabase se elige **Session pooler** con tipo URI, el recomendado para redes IPv4. El diálogo *Reset database password* avisa de que la contraseña es la misma para todas las formas de conexión. |
| 22:39 – 26:34 | En Git se hace checkout del **tag `v0.8.0`**. Con Git Graph se recorre el historial de versiones de la API (lista en la sección 4) y los archivos que cambia el commit v0.8.0. |
| 27:51 – 32:22 | **v0.8.0: rate limiting y logging con Winston**. Primero el diff de `package.json`, luego el README (paso 1, instalar; paso 2, `src/utils/logger.ts`), después el archivo `logger.ts` real y, por último, `index.ts` con el cierre ordenado del servidor usando el logger. |

## 2. Conceptos y patrones

- **Las migraciones de Prisma se guardan en el repo.** Cada una es una carpeta `timestamp_nombre/migration.sql`, y la BD apunta las que tiene aplicadas en `_prisma_migrations` (con `checksum`, `started_at`, `finished_at` y `applied_steps_count`).
- **`migrate status`, `migrate dev` y `migrate reset` no hacen lo mismo:**
  - `status` solo compara las carpetas de migraciones con la tabla `_prisma_migrations`, así que no ve los cambios hechos a mano en la BD.
  - `migrate dev` compara el esquema esperado con el real, detecta el *drift* y pide un reset.
  - `migrate reset` borra la BD y vuelve a aplicar todas las migraciones. Pierde los datos y por eso pide confirmación.
- **Drift**: la BD se ha cambiado fuera de Prisma (en este caso, renombrando la tabla desde el panel de Supabase).
- **Introspección con `prisma db pull`**: aquí manda la BD y se reescribe `schema.prisma` a partir de ella. Después hay que ejecutar `prisma generate`. Cuando los nombres de la BD no coinciden con los que Prisma pondría por defecto, añade `map:` en `@id`, `@unique`, `@relation` y `@@index`.
- **`db push` y `db pull`**: `push` lleva el schema a la BD sin crear migración (para prototipos) y `pull` hace lo contrario. También hay `db seed` y `db execute`.
- **PostgreSQL y las mayúsculas**: Prisma crea tablas como `"Media"` y `"User"`, con comillas. Sin comillas, `Media` se convierte en `media` y no la encuentra. Además, `select * from user` sin comillas devuelve el usuario de la sesión (`postgres`), no la tabla.
- **Modelo de datos**: `User` 1:N `Media`, con la FK `userId` y `onDelete: Cascade`; `publicId` es `@unique` y hay índices en `userId` y `createdAt`. Los campos de `Media` (`publicId`, `secureUrl`, `format`, `resourceType`, `bytes`, `width`, `height`, `folder`) son los datos que devuelve Cloudinary.
- **Variables de entorno**: `PORT`, `NODE_ENV` y `DATABASE_URL` en `.env`. Hay una copia local, `.env_local`, que no se sube a Git. La plantilla es `.env.example` y la de producción `env.production.example`.
- **Organización por capas**: `src/config` (db, env, swagger), `src/middleware` (auth, error, rateLimiter, requestLogger, validate), `src/modules/<x>/` (controller, routes, schema, service) y `src/utils` (logger).
- **Versionado con tags de Git**: un tag por cada paso del curso, documentado en el README como si fuera un manual, más un CHANGELOG. Los commits siguen el estilo Conventional Commits (`feat:`, `fix:`, `docs:`).
- **Logging con Winston**: niveles con prioridad numérica, un color por nivel, formato con timestamp, *transports* a consola y a fichero, y un nivel distinto según `NODE_ENV`.
- **Cierre ordenado del servidor**: `process.on('SIGTERM'/'SIGINT')`, luego `server.close()` y al final `process.exit(0)`.

## 3. Código de ejemplo del profesor

**Migración `init` (`migration.sql`)**
```sql
-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
```

**Migración `add_media_table`**
```sql
CREATE TABLE "Media" (
  "id" SERIAL NOT NULL,
  "userId" INTEGER NOT NULL,
  "publicId" TEXT NOT NULL,
  "secureUrl" TEXT NOT NULL,
  "format" TEXT NOT NULL,
  "resourceType" TEXT NOT NULL,
  "bytes" INTEGER NOT NULL,
  "width" INTEGER,
  "height" INTEGER,
  "originalName" TEXT,
  "folder" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);
-- CreateIndex ... [dudoso: el resto no se ve]
```

**`schema.prisma` antes del *pull*** (reconstruido a partir del diff)
```prisma
model User {
  id           Int      @id @default(autoincrement())
  email        String   @unique
  name         String
  passwordHash String
  createdAt    DateTime @default(now())
  media        Media[]
}

model Media {
  id           Int      @id @default(autoincrement())
  userId       Int
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  publicId     String   @unique
  secureUrl    String
  format       String
  resourceType String
  bytes        Int
  width        Int?
  height       Int?
  originalName String?
  folder       String?
  createdAt    DateTime @default(now())

  @@index([userId])
  @@index([createdAt])
}
```

**El mismo modelo después de `prisma db pull`**, con la tabla renombrada en la BD:
```prisma
model User {
  ...
  MediaElement MediaElement[]
}

model MediaElement {
  id           Int      @id(map: "Media_pkey") @default(autoincrement())
  userId       Int
  publicId     String   @unique(map: "Media_publicId_key")
  ...
  createdAt    DateTime @default(now())
  User         User     @relation(fields: [userId], references: [id], onDelete: Cascade, map: "Media_us...") // [dudoso: cortado, seguramente "Media_userId_fkey"]

  @@index([createdAt], map: "Media_createdAt_idx")
  @@index([userId], map: "Media_userId_idx")
}
```

**`src/utils/logger.ts` (v0.8.0)**
```ts
import winston from 'winston';
import { env } from '../config/env.js';

const levels = { error: 0, warn: 1, info: 2, http: 3, debug: 4 };

const colors = { error: 'red', warn: 'yellow', info: 'green', http: 'magenta', debug: 'blue' };
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

**`src/index.ts` (v0.8.0): `console.log` cambiado por `logger`**
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
  server.close(() => { /* [dudoso: cortado; probablemente igual que SIGTERM] */ });
});
```
Antes de este cambio, el código era `console.log(...)` y `process.on('SIGTERM', () => server.close())`.

El commit v0.8.0 toca estos archivos: `middleware/rateLimiter.ts`, `middleware/requestLogger.ts`, `utils/logger.ts`, `middleware/error.ts` (+5 −2), `app.ts` (+6 −4), `index.ts` (+18 −3), `.gitignore` (+1), `docs/API_EXAMPLES.md`, `CHANGELOG.md` (+49) y `README.md` (+438). El código de `rateLimiter.ts` y de `requestLogger.ts` no llega a verse en este bloque.

## 4. Librerías, comandos y versiones

**Dependencias** (en `package.json`)

| Paquete | Versión |
|---|---|
| `@prisma/client` | ^6.18.0 (el cliente generado es la v6.19.0) |
| `express` | ^5.1.0 |
| `express-rate-limit` | ^8.2.1 (nueva en v0.8.0) |
| `winston` | ^3.18.3 (nueva en v0.8.0) |
| `helmet` | ^8.1.0 |
| `cors` | ^2.8.5 |
| `morgan` | ^1.10.1 |
| `jsonwebtoken` | ^9.0.2 |
| `bcrypt` | ^6.0.0 |
| `dotenv` | ^17.2.3 |
| `zod` | ^4.1.12 |
| `cloudinary` | ^2.8.0 (en la versión de `main`) |
| `@types/swagger-ui-express` | ^4.1.8 (en la versión de `main`) |

**devDependencies**: `@types/bcrypt` ^6.0.0, `@types/cors` ^2.8.19, `@types/express` ^5.0.5, `@types/jsonwebtoken` ^9.0.10, `@types/morgan` ^1.9.10, `@types/node` ^24.10.0, `nodemon` ^3.1.10 y `ts-node` ^10.9.2. En la v1.0.2, `ts-node` se cambió por `tsx`.

**Comandos usados en clase**
```bash
npx prisma migrate status
npx prisma migrate dev
npx prisma migrate reset      # pide confirmación (y/N)
npx prisma db pull            # introspección
npx prisma generate
npx prisma db push | db seed | db execute   # vistos en la ayuda
npm install express-rate-limit winston
git tag                        # en el README
```

**Flujo después de un `git pull`** (según el resumen de Google que se enseñó): `npm install`, luego `npx prisma generate` y después `npx prisma migrate deploy` en producción o `npx prisma migrate dev` en desarrollo.

**SQL en Supabase**
```sql
select * from "Media";
select * from _prisma_migrations;
```

**Historial de tags de la API**

| Tag | Contenido |
|---|---|
| v0.3.0 | PostgreSQL + Docker con Prisma |
| v0.4.0 | Zod (schemas, middleware y CRUD de usuarios) |
| v0.5.0 | Auth (registro, login, bcrypt y JWT) |
| v0.6.0 | Middleware JWT, rutas protegidas y `/me` |
| v0.7.0 | Actualizar el perfil y cambiar la contraseña |
| v0.8.0 | Rate limiting y Winston |
| v0.9.0 | Jest + Supertest |
| v1.0.0 | Producción y documentación |
| v1.0.1 | Swagger/OpenAPI completo |
| v1.0.2 | `tsx` en vez de `ts-node` (ES Modules) |
| v1.1.0 | Subida de media con Cloudinary |
| v1.1.1 | Variables de Cloudinary en `env.production.example` |
| v1.1.2 | Errores de TypeScript del módulo media |
| v1.1.3 | Swagger con todos los endpoints |

Después de los tags hay un commit "vercel deployment".

**Flujo de cambio de contraseña** (README de la v0.7.0):
1. El middleware `auth` valida el JWT.
2. El middleware `validate` valida el schema.
3. El controller saca `req.user.sub`.
4. El service comprueba la contraseña actual.
5. Se hashea la nueva con bcrypt y se guarda.

El usuario solo puede modificar su propio perfil porque el id sale del token.

**Herramientas**: Cursor, Supabase (Schema Visualizer, SQL Editor y Table Editor), Git Graph, Docker (`Dockerfile`, `docker-compose.yml`, `docker-compose.prod.yml`), Jest y nodemon.

**Documentación de la CLI que se enseñó en prisma.io** (no se usó en el proyecto):
- La página tenía el aviso "Prisma ORM 8 is here" y los ejemplos con `bunx`.
- Comandos de la plataforma: `prisma auth login`, `prisma deploy`, `prisma postgres create mydb`, `prisma postgres connection create mydb`, `prisma bucket create --name my-bucket` y `prisma bucket key create <bucket-id>`.
- Flujo nuevo de migraciones con *contract*: `prisma contract infer --db "$DATABASE_URL" --output ./prisma/contract.prisma`, `contract emit`, `db sign`, `db verify`, `migration plan --name add_users`, `migration status`, `db migrate --db "$DATABASE_URL" --advance-ref db`, `orm init --target postgres --authoring psl` y `db init`.
- La documentación avisa de que en deploy y en CI no hay que usar `--advance-ref`.

## 5. Lo dudoso o ilegible

- No se lee entera la cadena de `DATABASE_URL` (además lleva credenciales). Se sabe que usa el *pooler* de Supabase en el puerto 5432.
- **El nombre de la tabla cambia varias veces**: primero `MediaElements` (a los 05:15), después `MediaElement` (a los 11:57) y el *pull* genera el modelo `MediaElement`. En los reset intermedios vuelve a llamarse `Media`. Se ha seguido el orden de las capturas.
- Una captura (20:49) da a los `id` el tipo `text`. Todas las demás dicen `int4`/`SERIAL`, así que lo correcto es entero autoincremental.
- El `map:` de la FK sale cortado (`"Media_us…"`). En el diff del *pull* aparecen a la vez `user User @relation(...)` (la línea que se quita) y `User User @relation(...)` (la que se añade), y parece una relación duplicada. Seguramente es el diff, que enseña las dos versiones juntas.
- A los 12:12 se teclea `npx prisma update`, que no es un comando real de Prisma, y después `npx prisma db pull`. A los 14:39 se lee "migrar", que será `migrate` a medio escribir.
- El resumen de Google ponía `npx prisma db migrate deploy`. El comando correcto en Prisma 6 es `npx prisma migrate deploy`.
- Los comandos de la documentación de "Prisma ORM 8" (`contract`, `migration plan`, `db sign`…) no existen en Prisma 6.19, que es lo que usa el proyecto. Se enseñaron solo como novedad.
- En el README de la v0.8.0 se lee "Paso 2: Crear logger con Winston". No se ve si hay más pasos (por ejemplo, el de `rateLimiter.ts`) porque quedan para el siguiente bloque.
