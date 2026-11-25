# DAM Apuntes

Web de apuntes interactivos para la clase de **2º DAM** (unos 20 alumnos). Los apuntes son públicos. Iniciar sesión (enlace por email + código de clase) solo hace falta para el **Tutor IA**, para **Aportar** material y para el **panel /admin** del dueño.

Producción: https://web-clase-apuntes.vercel.app

## Comandos

```bash
npm install          # el postinstall ejecuta fumadocs-mdx (genera .source/)
npm run dev          # http://localhost:3000
npm run typecheck    # tsc --noEmit
npm run build        # compila todos los MDX: úsalo para validar contenido nuevo
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
  2-dam/  1-dam/           ← pestañas de curso ("root": true en meta.json); 2º va primero
  guia-autor/              ← guía para escribir apuntes (componentes, plantilla)
components/interactive/    ← componentes MDX: Quiz, Flashcards, Ejercicio, Mermaid…
components/mdx.tsx         ← registro de componentes disponibles en cualquier .mdx
components/chat/           ← Tutor DAM (widget, panel, hook de streaming)
lib/ai/                    ← prompt del tutor (conocimiento = todos los apuntes), config, errores
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

## Diseño

Estilo de documentación limpia y minimalista: fondo blanco o casi negro, un solo color de acento, buena tipografía y bordes de 1px. **No uses** degradados, brillos, glassmorphism, sombras de color, iconos en cajitas de color, rejillas "bento", etiquetas encima de los títulos, eslóganes de marketing ni emojis. Usa los tokens de Fumadocs (`bg-fd-background`, `text-fd-muted-foreground`, `bg-fd-primary`…) para que el modo oscuro funcione solo. Todo debe verse bien en móvil.

## Convenciones

- Toda la interfaz va en español de España y tratando de tú.
- Nunca subas secretos al repo: `.env*` está en `.gitignore`. Las claves de Supabase (`SUPABASE_SERVICE_ROLE_KEY`) y de Anthropic (`ANTHROPIC_API_KEY`) solo van en Vercel o en `.env.local`.
- El cliente de Supabase con service role solo se usa en el servidor y solo cuando RLS no basta. Las server actions vuelven a comprobar la autorización por su cuenta.
- Si cambias la base de datos, actualiza `supabase/schema.sql`, que debe poder ejecutarse varias veces sin romper nada, y aplica el cambio en Supabase.

## Despliegue e infraestructura

- **Vercel**: proyecto `web-clase-apuntes`, equipo `lopuzno`. Cada push a la rama de producción se publica solo.
- **La rama de producción se publica sin revisión**: no subas trabajo que no compile (`npm run build`).
- **Supabase**: proyecto `weovecjkagadmibehvel` (eu-west-1). Los correos de login salen por SMTP de Gmail con un límite de 30 por hora.
- **Variables en Vercel**:
  - Las crea la integración con Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
  - Añadidas a mano: `ANTHROPIC_API_KEY`, `CLASE_CODIGO`, `CHAT_LIMITE_DIARIO`, `NEXT_PUBLIC_SITE_URL`.
- **Para hacer admin a alguien**, en el SQL Editor de Supabase: `update public.perfiles set rol = 'admin', clase_ok = true where email = '...';`
