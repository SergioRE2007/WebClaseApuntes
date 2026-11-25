# Clase del 2026-11-18 (bloque 2 de 2) · Otras (Git, gestión de proyectos, despliegue)

# Git y despliegue en Vercel de la SPA Angular (18-11, parte 2, 2.º bloque)

Forma parte de la práctica «Actividad Migración ReactiveForms Git Vercel» (documento de Google Docs): migrar el formulario de juegos a formularios reactivos en una rama, abrir una Pull Request de revisión y desplegar una Preview en Vercel.

## 1. Qué se explicó, en orden

| Minuto | Contenido |
|---|---|
| 27:51 | Guía, paso E: crear la Pull Request con base `main` y compare `feature/reactive-forms`, con el título «Refactorizar: formularios reactivos». En *Files changed* se comparan `GameService` y la interfaz `Game`, y la PR se deja **abierta**. Paso F: tabla de diagnóstico de fallos. |
| 34:25 – 35:12 | En la terminal de WSL: `git branch` muestra `master`, `refactor/reactive-form` y `* refactor/reactive-form2`. Después, `git push origin refactor/reactive-form2`; GitHub contesta con `[new branch]` y el enlace para crear la Pull Request. |
| 35:29 – 35:37 | Classroom: actividades de Angular (Act 7 a 12) y el enunciado de la migración, con el diagrama de ramas: `main` (Production) ← `refactor/reactive-forms` (Preview). |
| 37:41 – 42:36 | Tarea 7 de la guía, despliegue guiado en Vercel:<br>- Paso A: `git branch --show-current`, `npm ci` y `npm run build`. Hay que comprobar que la carpeta que se publica es `dist/<proyecto>/browser`, que es lo que genera Angular 19 cuando no hay SSR.<br>- Después se crea `vercel.json` con el `rewrite` hacia `/index.html`. |
| 43:10 – 43:23 | `git add -A .` y `git commit -m "."`, que da `[refactor/reactive-form2 52bc022]`, «3 files changed, 63 insertions(+), 36 deletions(-)» y «create mode 100644 vercel.json». |
| 44:28 – 45:29 | Push de la rama. Un segundo `commit` dice «nothing to commit, working tree clean» y otro `push` dice «Everything up-to-date». |
| 44:50 – 45:42 | Paso B, conectar GitHub con Vercel:<br>- Se entra en *Add New* → *Project* → *Import*.<br>- En *Configure Project* se revisan Root Directory (la carpeta con `package.json`), Framework Preset Angular, Build Command `npm run build` y Output Directory (la carpeta que contiene `index.html`). Luego se pulsa *Deploy*.<br>- `main` es la *Production Branch*. |
| 46:03 | Se revisa el `.gitignore`: no se suben `/dist` ni `/node_modules`. |
| 47:03 – 49:43 | En vercel.com se pide activar 2FA. Se importa el repo `proj-game` con el preset Angular, y se pide un código de seguridad por correo para crear el despliegue. En los Build Logs se ve el clonado de la rama `master`, `vercel build` y los avisos de npm. Sale «Deployed to Production in 30 seconds», en `proj-game-r6lu.vercel.app`. |
| 49:52 – 51:53 | En el panel de Vercel, *Recent Previews* muestra la rama `refactor/reactive-form2`. Se busca en Google «vercel deploy branch from github»: cada `git push origin <rama>` crea una Preview, y también se puede desplegar a mano desde *Deployments → Create Deployment*. Al buscar «refactor» en *Import* sale «No Results Found», porque ahí se buscan repositorios, no ramas. |
| 52:07 – 53:08 | La app desplegada da un **error de CORS** al llamar a `http://localhost:3000`. |
| 54:30 – 54:36 | Paso C: `git push -u origin feature/reactive-forms`, ver la URL de la Preview y la *Deployment Protection*. Paso D: tabla de qué debe funcionar en la Preview y qué no. |
| 53:51 – 56:32 | Se crea un segundo proyecto, `proj-game-jttv`, y se mira la configuración: en *Build and Output Settings* (Build Command, Output Directory `dist` e Install Command) y en *Deployment Settings* (Node.js 26.x, región `iad1`, Deployment Protection Standard). |

## 2. Conceptos y patrones

- **Flujo de ramas:**
  - Una rama de trabajo (`feature/reactive-forms` en la guía, `refactor/reactive-form2` en la demo) que se sube con `git push origin <rama>` o `git push -u`.
  - Se abre una PR a `main` y se deja abierta para revisarla.
  - `main` es producción y cada rama tiene su propia Preview.
- **Comprobar antes de subir:**
  - `npm ci` instala desde el lockfile.
  - `npm run build` no debe dar errores.
  - `node_modules` y `dist` no se suben (`.gitignore`).
- **SPA en Vercel:**
  - El `rewrite` `/(.*)` → `/index.html` hace que, al recargar una ruta interna, se sirva `index.html` y el Angular Router se encargue de ella.
  - Esto no se aplica a un proyecto con SSR.
- **Root Directory y Output Directory:** el primero es la carpeta con `package.json`; el segundo, la carpeta con el `index.html` compilado.
- **Mensajes de commit convencionales** en la guía: `chore: configure SPA navigation on Vercel` y `refactor: migrate game form to reactive forms`. En la demo, el profesor usó `"."`.
- **Tabla de diagnóstico (paso F):**
  - *Build Failed*: mirar los Build Logs.
  - Página 404: revisar Root Directory y Output Directory.
  - 404 al recargar una ruta: falta el `rewrite`.
  - No hay Preview: revisar la rama y el push.
  - La Preview pide iniciar sesión: es la *Deployment Protection*.
  - POST fallido: es CORS o la API en `localhost`.
- **Límite de la práctica:** la Preview carga el frontend y ejecuta las validaciones, pero no puede hablar con JSON Server en `localhost:3000`, porque el navegador bloquea el acceso a la dirección *loopback* desde un origen público. Para comprobarlo, en Network no debe salir ninguna petición al enviar un formulario inválido.

## 3. Comandos y configuración (tal cual)

```bash
git branch
git push origin refactor/reactive-form2

git branch --show-current
npm ci
npm run build

git add vercel.json
git commit -m "chore: configure SPA navigation on Vercel"
npm run build

git status
git add .
git commit -m "refactor: migrate game form to reactive forms"

git push -u origin feature/reactive-forms
```

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

`.gitignore` (lo más importante): `/dist`, `/tmp`, `/out-tsc`, `/bazel-out`, `/node_modules`, `npm-debug.log` y `yarn-error.log`.

Error de consola en la app desplegada:
```
Access to XMLHttpRequest at 'http://localhost:3000/games?_page=1&_limit=5'
from origin 'https://proj-game-r6lu.vercel.app' has been blocked by CORS policy:
Permission was denied for this request to access the `loopback` address space.
```

## 4. Herramientas y versiones

- Git y GitHub (repo `proj-game`), WSL con Ubuntu 26.04 y la terminal de VS Code.
- **Vercel:**
  - Vercel CLI 65.17.0 en el build.
  - Máquina de build de 2 cores y 7 GB según los logs; en *Deployment Settings* pone Basic, con 2 vCPU y 8 GB.
  - Runtime Node.js 26.x y región `iad1`.
  - Plan Hobby.
- **Avisos de npm** (deprecated) en el build: `rimraf@3.0.2`, `inflight@1.0.6`, `glob@7.2.3`, `glob@10.5.0`, `connect-pause@0.1.1`, `tar@6.2.1` y `uuid@8.3.2`.

## 5. Dudoso

- **Nombres de ramas:** la guía usa `feature/reactive-forms` y `main`; el profesor trabajó en `refactor/reactive-form2` y su rama principal es `master`.
- **Rama de producción:** el proyecto de Vercel desplegó `master` en producción. La Preview de `refactor/reactive-form2` aparece en *Recent Previews*, pero no se ve que se abriera.
- **Proyectos en Vercel:** se crearon dos, `proj-game-r6lu` y `proj-game-jttv`; el segundo no se llega a ver desplegado. Además ya había un proyecto `proj-game` anterior.
- **Mensaje del commit:** el profesor hizo el commit con el mensaje `"."`. No es el formato que pide la guía.
