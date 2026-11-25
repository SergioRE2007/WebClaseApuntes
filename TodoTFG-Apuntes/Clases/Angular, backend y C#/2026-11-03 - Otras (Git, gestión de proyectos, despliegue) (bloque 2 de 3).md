# Clase del 2026-11-03 (bloque 2 de 3) · Otras (Git, gestión de proyectos, despliegue)

# Git en la clase del 03-11: historial por versiones del backend

## 1. Qué se vio
- **00:44 (primera parte) y 00:02 (segunda parte):** en el panel Git Graph de Cursor, el detalle del commit `486c9ecb`, "**v0.8.0 - Seguridad adicional: rate limiting con express-rate-limit y logging con Winston**". Archivos cambiados:
  - `docs/API_EXAMPLES.md` (+55 -6)
  - `src/middleware/error.ts` (+5 -2)
  - `src/middleware/rateLimiter.ts` y `src/middleware/requestLogger.ts` (nuevos)
  - `src/utils/logger.ts` (nuevo)
  - `src/app.ts` (+6 -4) y `src/index.ts` (+18 -3)
  - `.gitignore` (+1)
- **00:05-00:10:** el commit `99fb2e12`, "**v0.9.0 - Testing con Jest y Supertest**". El mensaje dice "Configurado Jest con TypeScript y ES modules" y "Añadidos tests de integración para Auth (8 tests)". Archivos:
  - `src/tests/auth.test.ts` y `src/tests/users.test.ts`
  - `src/app.ts` (+11 -2)
  - `jest.config.js`, `package.json` (+8 -1) y `package-lock.json`
  - `README.md` (+619 -19), `CHANGELOG.md` (+76) y `.gitignore`
- **00:06:** el historial completo de tags:
  - v0.2.0 Express básico
  - v0.3.0 PostgreSQL + Docker con Prisma
  - v0.4.0 Validación con Zod
  - v0.5.0 Módulo Auth (bcrypt, JWT)
  - v0.6.0 Middleware de autenticación
  - v0.7.0 Mejoras en Users (actualizar perfil y cambiar contraseña)
  - v0.8.0 Rate limiting y Winston
  - v0.9.0 Tests
  - v1.0.0 Producción y documentación
  - v1.0.2 Cambio de ts-node a tsx para los ES Modules
  - v1.1.0 Subida de archivos con Cloudinary
  - v1.1.1 Variables de Cloudinary en `env.production.example`
  - También hay un commit "Fix: Permisos de carpeta logs en Docker".
- **00:07:** se escribe `git push origin --tags` en la terminal.
- El selector "Checkout Branch/Tag" de la barra de estado sirve para cambiar a otra versión.

## 2. Conceptos
- Usar **tags de versión** (versionado semántico) para marcar cada hito del proyecto.
- Los tags no se suben con un `push` normal: hay que hacer `git push origin --tags`.
- Mensajes de commit descriptivos, con lista de cambios. Junto con el CHANGELOG, documentan cada versión.
- Ver el diff de un commit desde el IDE para explicar qué cambió.

## 3. Comandos
- `git push origin --tags`

## 4. Dudoso
- En una captura el mensaje de la v0.9.0 sale cortado: solo se leen las dos primeras líneas de la lista.
