# Clase del 2026-11-03 (bloque 3 de 3) · Otras (Git, gestión de proyectos, despliegue)

# Clase 03-11, bloque 3: Git del repo de la API (Git Graph en Cursor)

## 1. Qué se explicó, en orden

| Minuto | Tema |
|---|---|
| 20:25-26:41 | Git Graph con los tags. Detalle del commit **v0.9.0** (`99fb2e12`, Juan A. García, 4 nov 2025). El profesor recorre los ficheros cambiados y su +/- de líneas, y usa "Copy Absolute File Path". |
| 27:08 | Menú de checkout de Cursor (ver la tabla de abajo). |
| 27:16-28:34 | Commit **v1.0.0** (`556a6f84`): diffs de `README.md` y `CHANGELOG.md` dentro del editor. |
| 31:01-37:25 y 41:07 | Vuelta a Git Graph para ir abriendo cada fichero de la v1.0.0. |
| 45:26-49:05 | Versiones posteriores a la v1.0.0 (ver la lista de la sección 2). |

En el menú de checkout (27:08) salen:

| Tipo | Qué aparece |
|---|---|
| Crear rama | "Create new branch" y "Create new branch from..." |
| Commit suelto | "Checkout detached..." |
| Ramas locales | `main` y `vercel-deployment` |
| Ramas remotas | `origin/main` y `origin/vercel-deployment` |
| Tags | `v1.1.0`, etc. |

## 2. Conceptos

**Un tag por versión y un commit por hito.** El mensaje del commit hace de changelog. Los tags se suben con `git push origin --tags`, que aparece escrito en la terminal todo el rato.

**Historial completo:**
- v0.1.0: proyecto base (npm, TypeScript, carpetas).
- v0.2.0: Express básico y `/health`.
- v0.3.0: PostgreSQL y Docker con Prisma.
- v0.4.0: Zod y CRUD de usuarios.
- v0.5.0: Auth con bcrypt y JWT.
- v0.6.0: middleware de autenticación.
- v0.7.0: actualizar el perfil y cambiar la contraseña.
- v0.8.0: rate limiting y logging.
- v0.9.0: Jest y Supertest.
- v1.0.0: producción y documentación (Docker y Swagger en `/api-docs`).

**Commits sueltos:** también hay uno `docs: README completo como manual con todas las versiones detalladas`.

**Versiones posteriores a la v1.0.0:**
- Fix: permisos de la carpeta `logs` en Docker.
- v1.0.1: documentación Swagger/OpenAPI completa (`swagger.ts` +6 -1, `auth.routes.ts` +64, `users.routes.ts` +245).
- v1.0.2: cambiar `ts-node` por `tsx` para que los ES Modules funcionen bien.
- v1.1.0: subida de media con Cloudinary.
- v1.1.1: variables de Cloudinary en `env.production.example`.
- v1.1.2: arreglar errores de TypeScript en el módulo media.
- v1.1.3 (21 nov 2025): arreglar Swagger para que salgan todos los endpoints.

**Convención de mensajes.** Desde la v1.0.1 los commits usan prefijos: `feat:`, `fix:` y `docs:`.

**README.** Funciona como manual por versiones, con un índice enlazado (v0.1.0 ... v1.0.0). Cada versión tiene su "Objetivo" y sus pasos.

**CHANGELOG.** Va por versiones, con apartados como "Añadido" y "Seguridad en producción".

**Ficheros que cambian en cada commit:**

| Versión | Ficheros |
|---|---|
| v0.9.0 | `tests/auth.test.ts`, `tests/users.test.ts`, `app.ts` (+11 -2), `jest.config.js`, `package.json`, `.gitignore`, `CHANGELOG.md` (+76), `README.md` (+619 -19) |
| v1.0.0 | `config/swagger.ts`, `auth.routes.ts` (+5 -3), `app.ts` (+7 -1), `.dockerignore`, `CHANGELOG.md` (+73), `docker-compose.prod.yml`, `Dockerfile`, `env.production.example`, `package.json` (+4), `README.md` (+524 -8) |

## 3. Comandos
- `git push origin --tags`
- Checkout de ramas, de tags y de commits sueltos (detached) desde la paleta de Cursor.

## 4. Lo dudoso
- Los mensajes de la v0.3.0, la v0.6.0 y la v0.8.0 salen cortados en Git Graph. La v0.8.0 se completa como "...y logging" porque así se lee en varias capturas.
- Los hashes de los padres solo se leen en parte.
- Las fechas de los commits son de noviembre de 2025: el repo es del curso anterior. La rama `vercel-deployment` no se llega a abrir.
