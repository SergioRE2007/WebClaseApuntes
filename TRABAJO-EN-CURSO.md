# Trabajo en curso: apuntes de 2º DAM a partir del material de clase

Rama: `wip/apuntes-curso-2dam`. **No está en producción.** La rama de producción es `claude/focused-ritchie-lt6oij`, y cada push a ella se publica solo.

Se paró el 25/11/2026 a las 20:05 para ahorrar uso. Antes de pasarla a producción hay que terminar lo pendiente y comprobar que `npm run build` pasa.

## Material de origen (en el repo, en esta rama)
- `TodoTFG-Apuntes/`: los dos resúmenes "Lo dado en clase", `Clases/`, `Requisitos/` y `Material de clase/`. Es una copia de `C:/Users/sergi/Documents/TFG/Primeros pasos/TodoTFG-Apuntes`, del PC original.
- `Extras para TodoTFG/`: su "Contexto para la web.md" tiene las reglas del material.
- Los argumentos del workflow son `corpus` = `<repo>/TodoTFG-Apuntes`, `extras` = `<repo>/Extras para TodoTFG` y `validador` = `<repo>/scripts/validar-mdx.mjs`, con rutas absolutas del PC en el que estés.
- Estas dos carpetas son material de origen, no van a la web. No las pases a la rama de producción: quítalas antes de fusionar.

## Reglas del material (resumen de "Contexto para la web.md")
- Lo que no se dio en clase va siempre marcado con `<NoDadoEnClase>`.
- Las marcas `[dudoso]` se muestran con `<Dudoso>` y no se corrigen.
- El código que no se vio no se inventa: se marca con `<NoSeVio>`.
- Las "prácticas raras" de clase van como aviso con `<Comparar>`.
- Las versiones no se cambian: Angular 19, Room 3, Retrofit 3 con Gson, Prisma 6, Zod 4 y Express 5.
- Ni nombres de profesores ni emojis.

## Reparto de asignaturas
| Asignatura | Carpeta | Bloques |
|---|---|---|
| Kotlin (PMDM + PSP) | `content/docs/2-dam/kotlin/` | `compose`, `arquitectura`, `datos`, `para-el-proyecto` |
| Acceso a Datos (Angular) | `content/docs/2-dam/acceso-a-datos/` | `angular`, `angular-avanzado` |
| Infraestructuras de Servicios y APIs (Node) | `content/docs/2-dam/apis/` | `backend`, `backend-proyecto` |
| Desarrollo de Interfaces (C#) | `content/docs/2-dam/desarrollo-de-interfaces/` | `csharp` |
| Proyecto Intermodular | `content/docs/2-dam/proyecto-intermodular/` | páginas sueltas (gestión, Git, Vercel, requisitos) |

Las demos a medida de cada bloque están en `components/temas/<bloque>/` y se importan desde el MDX.

## Estado de cada bloque
Cada bloque pasa por tres fases: redacción, revisión de fidelidad (fuentes y respuestas de los tests) y pulido (interactividad, diseño y MDX).

| Bloque | Redacción | Fidelidad | Pulido |
|---|---|---|---|
| proyecto | hecho | hecho | hecho |
| datos | hecho | hecho | hecho |
| csharp | hecho | hecho | hecho |
| compose | hecho | hecho | **pendiente** (se cortó a medias) |
| arquitectura | hecho | hecho | **pendiente** (se cortó a medias) |
| para-el-proyecto-android | hecho | hecho | **pendiente** (se cortó a medias) |
| backend-proyecto | hecho | hecho | **pendiente** (se cortó a medias) |
| angular | hecho | hecho | **pendiente** (se cortó a medias) |
| angular-avanzado | hecho | **pendiente** (se cortó a medias) | pendiente |
| backend | hecho | **pendiente** (se cortó a medias) | pendiente |

Además, todavía faltan:
- **Índices**: reescribir el `index.mdx` y el `meta.json` de cada asignatura (kotlin, acceso-a-datos, apis, desarrollo-de-interfaces, proyecto-intermodular) y de las portadas de `2-dam` y `/docs`. Ahora siguen con el temario genérico antiguo.
- **Integración**: pasar el validador, `npm run typecheck` y `npm run build`, buscar restos prohibidos (emojis, nombres de profesores…) y medir el tamaño del texto para el Tutor IA. El límite es `MAX_CARACTERES_APUNTES`, 280.000 caracteres; no se cambia sin preguntar al dueño.

Al pararse, las 116 páginas MDX pasaban el validador. El build completo **no** se ha probado con el contenido nuevo.

## Componentes nuevos (ya terminados y documentados en `guia-autor/componentes.mdx`)
`NoDadoEnClase`, `Dudoso`, `NoSeVio`, `DeClase`, `Comparar`/`Lado`, `Recorrido`/`Paso`, `Flujo`/`Mensaje`. El prompt del tutor (`lib/ai/conocimiento.ts`) ya explica estas marcas, y `lib/remark-busqueda.ts` mete su texto en el buscador.

## Cómo seguir
- Valida el MDX sin lanzar el build: `node scripts/validar-mdx.mjs content/docs`
- El script del workflow está en `scripts/workflows/apuntes-curso-2dam.js`. Lleva los prompts de cada fase. En otra sesión no se puede reanudar desde la caché, así que conviene lanzar un workflow nuevo con solo lo pendiente: fidelidad de `backend` y `angular-avanzado`, pulido de los 7 bloques que faltan, índices e integración. Sus argumentos son `corpus`, `extras` y `validador` (las rutas de arriba, y `scripts/validar-mdx.mjs`).
