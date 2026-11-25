# Clase del 2026-10-27 (bloque 3 de 3) · Otras (Git, gestión de proyectos, despliegue)

# Git: etiquetas por versión del proyecto (Git Graph en Cursor)

## 1. Qué se vio
- **p3 08:59 – 09:12**: con la extensión **Git Graph** se repasa el historial del repositorio del profesor. Cada fase del proyecto es un commit con una **etiqueta semántica**:
  - `v0.1.0`: proyecto base (npm init y TypeScript).
  - `v0.2.0`: Express básico (servidor, middlewares y endpoint `/health`).
  - `v0.3.0`: PostgreSQL + Docker con Prisma (schema, migraciones y cliente de la BD).
  - `v0.4.0`: validación con Zod (schemas, middleware y CRUD de usuarios).
  - `v0.5.0`: módulo Auth (registro, login, bcrypt y JWT).
  - `v0.6.0`: middleware de autenticación (JWT, rutas protegidas y endpoint `/me`).
  - Hay además un commit `docs: README completo como manual con todas las versiones detalladas` (4 nov 2025).
- Al desplegar un commit (por ejemplo `009b3464` de la v0.4.0 o `325e9297` de la v0.5.0) se ven los archivos que cambió:
  - En la v0.5.0: `src/modules/auth/auth.controller.ts`, `auth.routes.ts`, `auth.service.ts`, `app.ts` (+2), `CHANGELOG.md` (+42) y `docs/API_EXAMPLES.md` (+70).
  - Un archivo abierto desde Git Graph aparece como diff "Added in 325e9297".
- **p3 27:04**: se cambia de versión con *Checkout Branch/Tag...* desde la barra de estado de Cursor.

## 2. Conceptos
- Usar etiquetas `vX.Y.Z` como hitos o entregas de una guía que se avanza versión a versión.
- Cada versión va con su `CHANGELOG.md` y su documentación (`README`, `docs/API_EXAMPLES.md`).
- Leer un commit y su árbol de archivos para saber qué añadió cada fase.
- Saltar entre etiquetas para comparar el código de cada versión.

## 3. Herramientas
- Git y la extensión Git Graph de Cursor/VS Code.

## 4. Dudoso
- Durante un rato la terminal dice `git:(v0.4.0)` y la barra de estado dice `v0.5.0`. Probablemente se estaba cambiando de etiqueta en ese momento. Había 3 archivos modificados sin commit (`validate.ts`, `users.controller.ts` y `users.schema.ts`), y no se ve qué se hizo con ellos.
