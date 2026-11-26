# DAM Apuntes

Web de apuntes interactivos para la clase de **2º DAM** (unos 20 alumnos). Los apuntes son públicos. Iniciar sesión (enlace por email + código de clase) solo hace falta para el **Tutor IA**, para **Aportar** material y para el **panel /admin** del dueño.

Producción: https://web-clase-apuntes.vercel.app

## Estado (26/11/2026)

- **Rama de producción: `claude/focused-ritchie-lt6oij`.** Trabaja en ella o en una rama nueva que salga de ella. `wip/apuntes-curso-2dam` ya está fusionada entera y no tiene nada pendiente.
- **Publicado:**
  - Los apuntes de 2º DAM: 105 páginas en 5 asignaturas, con demos en `components/temas/<bloque>/`. 1º DAM se quitó porque ya no sirve.
  - La portada con los módulos en tarjetas.
  - El Tutor IA con herramientas (ver más abajo).
  - El login arreglado (ver "Login por correo" más abajo). Los compañeros ya están entrando.
- **Pendiente o por revisar:**
  - El enlace nuevo del correo (`/auth/confirm`) aún no se ha visto funcionar con un alumno real: compruébalo en los logs de Supabase.
  - El tutor nuevo aún no se ha probado con una conversación real. Si falla, mira los logs de Vercel de `/api/chat`.
  - SGE e IPE II salen en el menú sin apuntes.

## Material de origen de los apuntes

- Los apuntes de 2º DAM salen del material de clase del dueño: `TodoTFG-Apuntes/` (resúmenes "Lo dado en clase", `Clases/`, `Requisitos/`) y `Extras para TodoTFG/`, cuyo "Contexto para la web.md" tiene las reglas.
- **No está en git** (va en `.gitignore`). Está en el historial (commit `343b6c0`, incluido en la rama de producción). Para recuperarlo en otro PC, sin que vuelva a git:
  ```bash
  git restore --source=343b6c0 --worktree -- TodoTFG-Apuntes "Extras para TodoTFG"
  ```
  La copia original está en el PC del dueño, en `C:/Users/sergi/Documents/TFG/Primeros pasos/TodoTFG-Apuntes`.
- **Reglas del material:**
  - Lo no dado en clase va con `<NoDadoEnClase>`, lo dudoso con `<Dudoso>` y lo que no se vio con `<NoSeVio>`.
  - Las prácticas raras de clase van como aviso con `<Comparar>`.
  - Ni nombres de profesores ni emojis.
  - Las versiones de clase no se cambian: Angular 19, Room 3, Retrofit 3 con Gson, Prisma 6, Zod 4 y Express 5.
- Los scripts de los workflows que generaron y revisaron los apuntes están en `scripts/workflows/`.

## Asignaturas de 2º DAM (así las ha confirmado el dueño)

- **Kotlin** (`2-dam/kotlin`): PMDM y PSP juntas, con Android, Compose, Hilt, Retrofit y Room.
- **Acceso a Datos** (`2-dam/acceso-a-datos`): sobre todo Angular 19.
- **Infraestructuras de Servicios y APIs** (`2-dam/apis`): el backend con Node, Express 5, Prisma 6, Zod 4 y PostgreSQL.
- **Desarrollo de Interfaces** (`2-dam/desarrollo-de-interfaces`): C#.
- **Proyecto Intermodular**: gestión de proyectos, Git, despliegue en Vercel y requisitos.

## Comandos

```bash
npm install          # el postinstall ejecuta fumadocs-mdx (genera .source/)
npm run dev          # http://localhost:3000
npm run typecheck    # tsc --noEmit
npm run build        # compila todos los MDX: úsalo para validar contenido nuevo
node scripts/validar-mdx.mjs content/docs   # valida los MDX en segundos, sin build
```

- **En local sin `.env.local`** la web arranca en *modo demo*: todos sois admin y no hay Supabase. Para probar con datos reales, copia `.env.example` a `.env.local` y rellénalo.
- **En producción, si faltan las variables de Supabase, la web se bloquea** (devuelve 503). `DAM_DEMO=1` fuerza el modo demo, pero **nunca** debe ir en Vercel.

## Stack

- Next.js 16 (App Router). El middleware se llama `proxy.ts`. Usa las APIs async: `params`, `searchParams`, `cookies()`.
- React 19, TypeScript 7 (strict), Tailwind CSS v4 (configuración en `app/global.css`).
- Fumadocs 16 (`fumadocs-ui`, `fumadocs-core`) y `fumadocs-mdx` con la API **macro** (`defineDocs` de `fumadocs-mdx/macro` en `lib/source.ts`; no hay `source.config.ts`). Su API cambia mucho: consulta los tipos en `node_modules` o https://fumadocs.dev/llms.txt antes de usar algo.
- Supabase (`@supabase/ssr`, `@supabase/supabase-js`) para auth, base de datos y almacenamiento.
- Claude con el SDK oficial `@anthropic-ai/sdk`. Modelo **`claude-haiku-5-5`**, elegido por el dueño: no lo cambies sin preguntar.
- Otros: lucide-react, motion, sonner, react-markdown, mermaid, zod v4.

## Estructura

```
content/docs/              ← TODO el contenido (MDX + meta.json)
  2-dam/                   ← pestaña del curso ("root": true en meta.json); 1º DAM se quitó
  guia-autor/              ← guía para escribir apuntes (componentes, plantilla)
components/interactive/    ← componentes MDX: Quiz, Flashcards, Ejercicio, Mermaid…
components/mdx.tsx         ← registro de componentes disponibles en cualquier .mdx
components/chat/           ← Tutor DAM (widget, panel, hook de streaming)
lib/ai/                    ← prompt e índice del tutor, herramientas para leer páginas, config, errores
app/api/chat/route.ts      ← endpoint del chat (auth, límite diario, streaming NDJSON)
app/aportar, app/admin     ← aportaciones de alumnos y panel del dueño
lib/auth.ts                ← getPerfil / requireAlumno / requireAdmin
lib/supabase/              ← clientes (server con RLS, service role solo en servidor)
supabase/schema.sql        ← esquema completo e idempotente (tablas, RLS, storage, RPCs)
proxy.ts                   ← refresca la sesión, protege rutas y redirige al dominio canónico
```

## Añadir o convertir apuntes (la tarea más habitual)

- Un tema es un archivo `content/docs/<curso>/<modulo>/<slug>.mdx`. El slug va en minúsculas, sin tildes y con guiones. La URL sale de la ruta.
- Frontmatter: `title` y `description` son obligatorios. El orden de los temas lo marca `meta.json` (`"pages": ["index", "tema-1", "..."]`).
- Antes de escribir, lee `content/docs/guia-autor/componentes.mdx`. Es el catálogo con un ejemplo copiable de cada componente: `Quiz`/`Pregunta`/`Opcion`/`Explicacion`, `Flashcards`/`Tarjeta`, `Ejercicio`/`Pista`/`Solucion`, `CompletarCodigo`, `Terminal`, `Mermaid`, `Concepto`, `Glosario`/`Termino`, `MarcarCompletado`, y los de Fumadocs (`Callout`, `Tabs`, `Steps`, `Cards`, `Files`, `Accordions`).
- Parte de `content/docs/guia-autor/plantilla.mdx`. Un tema bueno lleva explicación, ejemplos de código con título, y al final un `Quiz`, unas `Flashcards`, uno o dos `Ejercicio` y `<MarcarCompletado />`.
- Las imágenes van en `public/apuntes/<modulo>/` y se enlazan como `/apuntes/<modulo>/archivo.png`.
- Reglas de MDX: escapa `{`, `}` y `<` en el texto normal; cierra todas las etiquetas; los diagramas Mermaid van en un template literal: ``chart={`...`}``.
- Comprueba que las respuestas de los tests y las soluciones son **correctas**, porque los alumnos estudian con ellas.
- Valida siempre con `npm run build`: un MDX roto rompe el despliegue.
- El Tutor IA lee automáticamente todo `content/docs`, así que no hay que tocar nada más.
- El tutor no recibe todos los apuntes, porque ocupan unos 1,9 millones de caracteres: tiene el índice (títulos y apartados) y la página actual, y lee otras con las herramientas `leer_pagina` y `buscar_en_apuntes` (`lib/ai/conocimiento.ts`, bucle en `app/api/chat/route.ts`, topes en `LIMITES_TURNO`).

## Diseño

Estilo de documentación limpia y minimalista: fondo blanco o casi negro, un solo color de acento, buena tipografía y bordes de 1px. **No uses** degradados, brillos, glassmorphism, sombras de color, iconos en cajitas de color, rejillas "bento", etiquetas encima de los títulos, eslóganes de marketing ni emojis. Usa los tokens de Fumadocs (`bg-fd-background`, `text-fd-muted-foreground`, `bg-fd-primary`…) para que el modo oscuro funcione solo. Todo debe verse bien en móvil.

## Convenciones

- Toda la interfaz va en español de España y tratando de tú.
- Nunca subas secretos al repo: `.env*` está en `.gitignore`. Las claves de Supabase (`SUPABASE_SERVICE_ROLE_KEY`) y de Anthropic (`ANTHROPIC_API_KEY`) solo van en Vercel o en `.env.local`.
- El cliente de Supabase con service role solo se usa en el servidor y solo cuando RLS no basta. Las server actions vuelven a comprobar la autorización por su cuenta.
- Si cambias la base de datos, actualiza `supabase/schema.sql`, que debe poder ejecutarse varias veces sin romper nada, y aplica el cambio en Supabase.

## Login por correo

- **Flujo:** `/login` envía el enlace (`signInWithOtp`) → el correo lleva a `/auth/confirm?token_hash=…&type=email` → `verifyOtp` crea la sesión → `/unirse` pide nombre y código de clase si aún no lo tiene → vuelve a la página de origen (cookie `dam_login_next`, solo si es el mismo navegador).
- `/auth/confirm` no depende de cookies: funciona aunque el correo se abra en otro navegador o dispositivo. `/auth/callback` (PKCE, `?code=`) se mantiene solo por compatibilidad: falla con `pkce_code_verifier_not_found` en otro navegador y con `bad_code_verifier` si el alumno pidió dos enlaces.
- **Configuración en el panel de Supabase (no está en el repo; si se pierde, el login se rompe):**
  - Authentication → URL Configuration: **Site URL** `https://web-clase-apuntes.vercel.app` y en **Redirect URLs** `https://web-clase-apuntes.vercel.app/**` (y `http://localhost:3000/**` para local).
  - Authentication → Emails → Templates, **Confirm signup** y **Magic Link** con este cuerpo:
    ```html
    <h2>Entra en DAM Apuntes</h2>
    <p>Pulsa el enlace para entrar:</p>
    <p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Entrar en DAM Apuntes</a></p>
    <p>Si no lo has pedido tú, ignora este correo.</p>
    ```
- Las server actions que cambian la sesión o `clase_ok` (`unirseClase`, `salir`) llaman a `revalidatePath('/', 'layout')` antes del `redirect`. Sin eso, Next reutiliza el layout raíz ya pintado y el tutor sigue pidiendo el código hasta recargar.
- Para depurar: logs de Supabase (`auth_logs` y `edge_logs`, mira el `redirect_to` de `/auth/v1/verify`) y logs de Vercel (`[auth/confirm]`, `[auth/callback]`; el plan Hobby solo guarda 1 hora).

## Trampas conocidas

- **Los alias `*-lopuzno.vercel.app` están protegidos por Vercel** (Deployment Protection): piden iniciar sesión en Vercel. Solo `web-clase-apuntes.vercel.app` es público. Si la Site URL de Supabase apunta a un alias, los alumnos ven "regístrate en Vercel" al abrir el enlace, y al dueño le funciona porque tiene sesión en Vercel. Pasó el 26/11/2026.

- **En Vercel no hay archivos `.mdx` en tiempo de ejecución.** Usa solo `page.data.getText('processed')`, que se genera al compilar. `getText('raw')` lee el disco y rompe la página con un `ENOENT`: pasó con todas las páginas de tema.
- **El proyecto de Supabase no trae los permisos por defecto en `public`.** Cada tabla o función nueva necesita sus `grant` (mira el bloque "Permisos de tabla" de `schema.sql`). Sin ellos falla con `permission denied` aunque RLS esté bien: pasó con el código de clase y con guardar el perfil.
- Los iconos del frontmatter tienen que existir en el objeto `icons` de `lucide-react`. Por ejemplo, `TriangleAlert` no existe: es `TriangleExclamationPoint`.

## Despliegue e infraestructura

- **Vercel**: proyecto `web-clase-apuntes`, equipo `lopuzno`. Cada push a la rama de producción se publica solo.
- **La rama de producción se publica sin revisión**: no subas trabajo que no compile (`npm run build`).
- **Supabase**: proyecto `weovecjkagadmibehvel` (eu-west-1). Los correos de login salen por SMTP de Gmail con un límite de 30 por hora.
- **Variables en Vercel**:
  - Las crea la integración con Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
  - Añadidas a mano: `ANTHROPIC_API_KEY`, `CLASE_CODIGO`, `CHAT_LIMITE_DIARIO`, `NEXT_PUBLIC_SITE_URL`.
- **Para hacer admin a alguien**, en el SQL Editor de Supabase: `update public.perfiles set rol = 'admin', clase_ok = true where email = '...';`
