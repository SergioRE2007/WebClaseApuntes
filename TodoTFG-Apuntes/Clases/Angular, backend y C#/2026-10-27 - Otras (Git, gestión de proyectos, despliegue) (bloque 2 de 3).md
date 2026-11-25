# Clase del 2026-10-27 (bloque 2 de 3) · Otras (Git, gestión de proyectos, despliegue)

# Git y Git Graph: recorrer las versiones del repo de la API (parte 2, min 0-7)

Antes de repasar el código del backend, el profesor enseña cómo moverse por el historial de su repo `node-server-26-27`.

## 1. Qué se explicó, en orden

| Minuto | Contenido |
|---|---|
| 0:11 | Desde la barra de estado de Cursor, "Checkout Branch/Tag...". La versión actual es `v0.4.0`. |
| 0:26-0:30 | Lista de tags para hacer checkout, cada uno con su mensaje. |
| 0:45-1:01 | Extensión **Git Graph**. Al pinchar un commit se ve el hash completo, el padre (*Parents*), el autor y committer, la fecha y el árbol de archivos cambiados con `+/-`. El commit inicial v0.1.0 tiene `Parents: None`. |
| 1:10-1:21 | Cómo instalar la extensión: en Extensiones buscar "git graph" y elegir **Git Graph v1.30.0 de mhutchie** (unos 1,2 M de descargas). Otras parecidas: GitLens, Git Blame, IntelliGit y GitLG. |
| 1:39-1:59 | Vista completa del grafo con las ramas `main`, `origin/HEAD` y `vercel-deployment`, y la casilla "Show Remote Branches". Un tooltip dice "This commit is not included in HEAD": como se ha hecho checkout de un tag antiguo, los commits posteriores no están en HEAD. |
| 2:06-7:26 | Al pinchar un archivo dentro de un commit se abre su diff ("Click to View Diff - Added"). Así enseña `package.json`, `nodemon.json`, `schema.prisma`, `migration.sql` y otros archivos. |

## 2. Conceptos

**Tags**
- Hay un tag por etapa del proyecto: `v0.1.0` … `v1.1.3`.
- Si haces checkout de un tag, ves el código exactamente como estaba en esa versión.

**Commits**
- Cada commit tiene su hash y apunta a su padre. El primero no tiene padre.

**HEAD**
- Indica qué estás viendo ahora mismo.
- Los commits posteriores al tag que tienes en HEAD no forman parte de HEAD.

**Ramas**
- Hay ramas locales y remotas (`origin`).
- Hay una rama aparte para desplegar (`vercel-deployment`).

**Mensajes de commit**
- Siguen la convención `feat:`, `fix:` y `docs:`.
- Junto a cada versión hay un commit `docs: actualizar CHANGELOG con vX`.

## 3. Historial de versiones del profesor (sirve de guía de lo que viene)

- v0.1.0: Proyecto base (npm, TypeScript, estructura de carpetas).
- v0.2.0: Express básico (servidor, middlewares, endpoint health).
- v0.3.0: PostgreSQL + Docker con Prisma (schema, migraciones, cliente de la BD).
- v0.4.0: Validación con Zod (schemas, middleware, CRUD de usuarios).
- v0.5.0: Módulo Auth (registro, login, bcrypt, JWT).
- v0.6.0: Middleware de autenticación (JWT, rutas protegidas, `/me`).
- v0.7.0: Mejoras en Users.
- v0.8.0: Seguridad adicional (rate limiting con express-rate-limit, logging con Winston).
- v0.9.0: Testing con Jest y Supertest.
- v1.0.0: Producción y documentación.
- v1.0.1: Documentación Swagger/OpenAPI completa.
- v1.0.2: Se sustituye ts-node por tsx para que funcionen bien los ES Modules.
- v1.1.0: Subida de archivos con Cloudinary.
- v1.1.1: `env.production.example` con las variables de Cloudinary.
- v1.1.2: Errores de TypeScript arreglados en el módulo media.
- v1.1.3: La documentación de Swagger ya muestra todos los endpoints.

Todos los commits de v0.1.0 a v0.6.0 son del 4 de noviembre de 2025, entre las 12:14 y las 12:40. Los de v1.x son de noviembre de 2025, y `vercel-deployment` es del 5 de diciembre de 2025.

## 4. Herramientas

- Git.
- Extensión Git Graph v1.30.0 (mhutchie) en Cursor/VS Code.
- Otras alternativas que se ven: GitLens, Git Blame, IntelliGit y GitLG.

## 5. Lo dudoso

- Los mensajes de v0.7.0, v0.9.0 y v1.0.0 solo se ven resumidos en una lista y pueden estar cortados.
- No se ve el comando exacto de checkout. Lo hace desde la interfaz del editor, no en la terminal.
