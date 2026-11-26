export const meta = {
  name: 'apuntes-curso-2dam',
  description: 'Convierte todo el material del curso en apuntes interactivos: componentes nuevos, 10 redactores Opus con verificación de fidelidad y pulido, índices y build',
  phases: [
    { title: 'Componentes', detail: 'componentes MDX nuevos que necesita el material (no dado, dudoso, flujos animados…)' },
    { title: 'Redacción', detail: '10 redactores, uno por bloque del temario' },
    { title: 'Fidelidad', detail: 'revisor por bloque: fiel a las fuentes y respuestas correctas' },
    { title: 'Pulido', detail: 'revisor por bloque: interactividad, animación, diseño y MDX válido' },
    { title: 'Índices', detail: 'portadas y orden de cada módulo, enlaces cruzados' },
    { title: 'Integración', detail: 'build completo y comprobaciones finales' },
  ],
}

const A = args
const FUENTES = `
FUENTES DEL MATERIAL (léelas con la herramienta Read usando rutas absolutas; son Markdown):
- Carpeta principal: ${A.corpus}
  - "Lo dado en clase de Android.md" (resumen revisado de Android: temario por fechas §2.1, conceptos §2.2, patrones de código del profesor §2.3, versiones §2.4, dudas y lagunas §3, incluida "Prácticas raras")
  - "Lo dado en clase de Angular, backend y C#.md" (§1 Angular, §2 Backend Node, §3 C#, §4 Gestión de proyectos/Git/despliegue, §5 Dudas y lagunas)
  - "Clases/Android/*.md" y "Clases/Angular, backend y C#/*.md": detalle de cada clase por fecha
  - "Requisitos/*.md": lo que piden los profesores
  - "Material de clase/ToDoApp de clase explicada.md" y "Material de clase/Guías de Angular/*.md"
- Extras (en el repo, NO se publican tal cual): ${A.extras}
  - "Contexto para la web.md" (REGLAS DEL MATERIAL, léelo entero antes de empezar), "Requisitos y dónde se dieron.md", "Lo que falta por dar - Android.md", "Lo que falta por dar - backend y Angular.md", "Errores típicos.md", "Glosario.md", "Chuleta de Compose.md".
`

const REGLAS = `
REGLAS DEL MATERIAL (obligatorias; vienen de "Contexto para la web.md"):
1. Separa SIEMPRE lo dado en clase de lo que no. Todo lo que salga de los archivos "Lo que falta por dar" (o que añadas tú y no sea de clase) va marcado con el componente <NoDadoEnClase> (ver catálogo). Lo de clase puede llevar <DeClase fecha="dd/mm" /> para decir cuándo se vio.
2. Las marcas [dudoso] de las fuentes NO se corrigen ni se esconden: se muestran con <Dudoso> (inline) alrededor del fragmento dudoso, o con una nota si afecta a un bloque de código.
3. No rellenes código que no se vio. Lo que las fuentes listan en "Dudas y lagunas" / "Código que no se llega a ver" se indica con <NoSeVio>…</NoSeVio>. Nunca presentes como "del profesor" algo que no está en las fuentes.
4. Si un archivo de Clases/ contradice al resumen general ("Lo dado en clase de …"), vale el resumen.
5. "Prácticas raras del código de clase": se muestran como aviso (componente <Comparar> con la versión de clase marcada como "Así se hizo en clase" y la buena como "Mejor así", y la buena con <NoDadoEnClase> si no se dio), nunca como el patrón bueno.
6. NO cambies versiones: Angular 19, Room 3 (androidx.room3; @Relation distinto de Room 2), Retrofit 3 con Gson, Prisma 6, Zod 4, Express 5, Hilt 2.60.1, Navigation 2.10.2, DataStore 1.3.0, KSP 2.3.12, Kotlin 2.4. El código que pongas debe ser correcto para esas versiones.
7. Público: alumnos de 2º DAM que ya saben Java. Explica Kotlin, Compose, Angular, Node, Prisma, C#… pero no la programación básica. Compara con Java cuando ayude.
8. Las guías de Angular son copia de https://github.com/hokahey007/guides-angular: no las copies; enlaza al original y resume/explica con tus palabras lo necesario.
9. Privacidad: no pongas nombres de profesores ni de alumnos (di "el profesor" o "en clase"). No enlaces a vídeos privados ni a Classroom.
10. Sin emojis: las fuentes usan ✅ 🟡 ❌ 🎓; conviértelos en texto ("Dado", "A medias", "No dado", "Salió en clase").
11. Todo en español de España, tuteando, directo. Comprueba que CADA respuesta de test, flashcard y solución es correcta: los alumnos estudian con ellas.
`

const ESCRITURA = `
CÓMO ESCRIBIR (lee primero el CLAUDE.md del repo, content/docs/guia-autor/componentes.mdx y content/docs/guia-autor/plantilla.mdx, y mira un tema ya hecho como content/docs/1-dam/programacion/poo-clases-objetos.mdx):
- Cada página: frontmatter con title y description (y opcionalmente icon de lucide), explicación clara con secciones, bloques de código con título (\`\`\`kotlin title="MainActivity.kt"), y al final un <Quiz> (5-8 preguntas variadas, con <Explicacion>), unas <Flashcards>, uno o dos <Ejercicio> con <Pista> y <Solucion>, y <MarcarCompletado />.
- Hazlo INTERACTIVO y visual, que es lo que pide el dueño ("que esté guapo, que tenga animación"): usa los componentes del catálogo (Flujo animado, Recorrido de código, Comparar, CompletarCodigo, Terminal, Mermaid, Concepto, Glosario, Tabs, Steps, Files…) donde aporten de verdad, no por rellenar.
- Además PUEDES crear demos interactivas a medida de tu tema (p. ej. un "playground" del orden de los Modifier, un simulador de recomposición, un constructor de peticiones REST, un simulador de paginación, un grafo de ramas de Git animado, un playground de Flexbox…). Reglas para esas demos:
  - Van en components/temas/<tu-grupo>/*.tsx ('use client' si tienen estado), y se importan desde el MDX: import { MiDemo } from '@/components/temas/<tu-grupo>/mi-demo'; (NO las registres en components/mdx.tsx, que es compartido).
  - Diseño de la web: minimalista tipo documentación, tokens de Fumadocs (bg-fd-card, border-fd-border, text-fd-muted-foreground, bg-fd-primary…), bordes de 1px, rounded-md/lg, sin degradados, brillos, glassmorphism, sombras de color, iconos en cajitas de color ni emojis. Reutiliza las clases compartidas de components/interactive/estilos.ts. Animaciones con "motion" (import { motion } from 'motion/react'): suaves y con sentido (que expliquen algo), respetando prefers-reduced-motion (useReducedMotion). Que funcione en móvil (sin scroll horizontal de página) y con teclado.
  - Que el texto importante también esté en el MDX (el Tutor IA y el buscador leen el texto del MDX, no el de tus componentes).
- Reglas MDX: escapa {, } y < en el texto normal; cierra todas las etiquetas; los diagramas Mermaid van en un template literal: chart={\`...\`}; los props con código largo, en template literal.
- Slugs en minúsculas, sin tildes, con guiones. Enlaces internos absolutos (/docs/2-dam/...). Solo enlaza a páginas que existan o que vayas a crear tú; para las de otros grupos, enlaza a la carpeta del grupo (su index), que siempre existirá.
- VALIDA tus MDX con:  node "${A.validador}" <tu carpeta>   (desde la raíz del repo). Para tus componentes .tsx: npx tsc --noEmit (ignora errores de archivos de otros grupos).
- PROHIBIDO: npm run build, npm run dev, git commit/checkout/stash/reset/merge. Hay otros 9 agentes escribiendo a la vez en el mismo árbol: edita SOLO tus archivos (tu carpeta de contenido y components/temas/<tu-grupo>/). No toques components/mdx.tsx, components/interactive/*, app/*, ni los index.mdx/meta.json de nivel de módulo.
`

phase('Componentes')
const componentes = await agent(`Estás preparando una web de apuntes (Next.js 16 + Fumadocs 16, ver CLAUDE.md del repo) para recibir el material completo de 2º DAM. Después de ti, 10 agentes escribirán decenas de páginas MDX usando los componentes que crees ahora, así que su API tiene que ser clara, estable y estar documentada.

${FUENTES}
Lee al menos "Contexto para la web.md" y hojea los dos resúmenes "Lo dado en clase" para entender qué necesita el material.

Lee components/interactive/* (sobre todo estilos.ts, utils.tsx, quiz.tsx, mermaid.tsx), components/mdx.tsx, app/global.css y content/docs/guia-autor/componentes.mdx para seguir EXACTAMENTE el estilo existente (minimalista tipo documentación, tokens fd-*, bordes de 1px, sin degradados ni sombras de color ni emojis ni iconos en cajitas de color).

CREA estos componentes en components/interactive/ (expórtalos en components/interactive/index.ts y regístralos en components/mdx.tsx):
1. <NoDadoEnClase>…</NoDadoEnClase>: bloque que marca contenido NO dado en clase. Etiqueta textual sobria "No dado en clase" + texto por defecto ("No se ha visto en clase: es la forma más estándar de hacer lo que piden los requisitos. Si te preguntan en la defensa, di que lo has buscado tú.") que se puede sustituir con children. Variante inline: <NoDadoEnClase inline /> (una etiqueta pequeña para poner junto a un título o en una tabla). Que se distinga a simple vista pero sin chillar.
2. <Dudoso>texto</Dudoso>: marca inline de algo que no se leía bien en las capturas: subrayado discontinuo + "[dudoso]" pequeño, con tooltip/popover accesible ("No se leía bien en las capturas de clase; puede no ser exacto"). Prop opcional nota.
3. <NoSeVio>…</NoSeVio>: bloque "Esto no se llega a ver en clase" para código o partes que faltan (children: qué falta).
4. <DeClase fecha="13/11" proyecto="ToDoApp" />: línea de metadatos discreta ("Visto en clase el 13/11 · ToDoApp"). Admite varias fechas separadas por comas.
5. <Comparar>: comparación entre la forma de clase y la buena, o entre dos alternativas. Hijos <Lado titulo="Así se hizo en clase" tipo="evitar"> y <Lado titulo="Mejor así" tipo="bien"> con bloques de código Markdown dentro (que Fumadocs resalta). En escritorio, lado a lado o con conmutador; en móvil, conmutador. Transición animada suave.
6. <Recorrido> (recorrido de código paso a paso): props lenguaje y codigo (string en template literal), hijos <Paso lineas="3-5" titulo="…">explicación</Paso>. Muestra el código resaltado (usa el resaltador de Fumadocs/shiki si es viable en cliente o servidor; consulta node_modules/fumadocs-core para ver qué hay, p. ej. fumadocs-core/highlight) y va iluminando las líneas de cada paso con una animación (resaltado que se desplaza), con botones Anterior/Siguiente, teclado (flechas) y lista de pasos clicable. Funciona en móvil.
7. <Flujo> (diagrama de secuencia animado): props nodos (array de strings, p. ej. ["Pantalla","ViewModel","Repositorio","Retrofit","API"]) e hijos <Mensaje de="Pantalla" a="ViewModel" titulo="cargar()">explicación</Mensaje>. Dibuja los nodos (en fila en escritorio, en columna en móvil) y, paso a paso (con Reproducir/Pausa, Anterior/Siguiente), anima un punto o flecha que viaja de un nodo a otro, resalta los nodos implicados y muestra la explicación del paso. Debe servir para: petición HTTP desde Compose o Angular, inyección con Hilt, Flow de Room hacia la UI, cadena de middlewares de Express, navegación…
Todos: 'use client' donde haga falta, accesibles (aria, foco visible, teclado), respetan prefers-reduced-motion (con motion/react y useReducedMotion), modo oscuro con tokens, bien en móvil, y su texto relevante debe salir también en el índice de búsqueda/tutor si es posible (revisa lib/remark-busqueda.ts para ver cómo se trata el texto de los componentes).

DOCUMENTA cada componente en content/docs/guia-autor/componentes.mdx con un ejemplo copiable (en el estilo de las secciones existentes), incluyendo cómo importar demos a medida desde components/temas/<grupo>/ en un MDX.

VALIDA: npx tsc --noEmit, node "${A.validador}" content/docs, y como eres el único agente trabajando ahora, SÍ puedes ejecutar npm run build (crea temporalmente un MDX de prueba que importe un componente desde '@/components/...' para comprobar que los imports ESM en MDX funcionan con fumadocs-mdx; bórralo después). No hagas commit.

Devuelve la referencia de la API para los redactores.`,
  {
    label: 'componentes',
    phase: 'Componentes',
    schema: {
      type: 'object',
      properties: {
        referencia: { type: 'string', description: 'Referencia de uso para redactores: cada componente con sus props y un ejemplo MDX mínimo. Incluye cómo importar demos a medida y cualquier limitación (p. ej. si los imports en MDX no funcionan, dilo claramente y qué hacer en su lugar).' },
        importsEnMdxFuncionan: { type: 'boolean' },
        buildOk: { type: 'boolean' },
        notas: { type: 'string' },
      },
      required: ['referencia', 'importsEnMdxFuncionan', 'buildOk', 'notas'],
    },
  })

if (!componentes) throw new Error('El agente de componentes no devolvió resultado')
log(`Componentes listos (build ${componentes.buildOk ? 'OK' : 'con problemas'}; imports en MDX ${componentes.importsEnMdxFuncionan ? 'sí' : 'NO'} funcionan)`)

const CATALOGO = `
CATÁLOGO DE COMPONENTES NUEVOS (creado justo antes que tú; la documentación completa está en content/docs/guia-autor/componentes.mdx):
${componentes.referencia}
${componentes.importsEnMdxFuncionan ? '' : '\nATENCIÓN: los imports de componentes en MDX NO funcionan en este proyecto. NO crees demos a medida en components/temas; usa solo los componentes registrados.'}
`

const GRUPOS = [
  {
    key: 'compose', carpeta: 'content/docs/2-dam/kotlin/compose', titulo: 'Kotlin y Jetpack Compose',
    alcance: `Kotlin para quien viene de Java tal como se usó en clase (val/var, null safety, data class, lambdas, funciones de extensión… solo lo que haga falta para seguir el curso), el proyecto Android en Android Studio y Gradle (libs.versions.toml, BOM), y Jetpack Compose: @Composable, @Preview, Text/Button/Image, Column/Row/Box, Modifier (y por qué importa el orden), estado (remember, mutableStateOf, state hoisting), recomposición, LaunchedEffect, Material 3 (Scaffold, TopAppBar, Card, NavigationBar…), listas (LazyColumn). Fuentes: "Lo dado en clase de Android.md" (busca en §2.1 las clases de UI y Compose, §2.2 y los patrones de UI de §2.3), las Clases/Android de esas fechas, "Chuleta de Compose.md", la parte de Android del Glosario y los errores de "Pantalla" y "Gradle" de "Errores típicos.md". NO cubras ViewModel/Hilt/navegación (grupo arquitectura) ni Retrofit/Room/DataStore/corrutinas (grupo datos).`,
  },
  {
    key: 'arquitectura', carpeta: 'content/docs/2-dam/kotlin/arquitectura', titulo: 'Arquitectura Android: ViewModel, Hilt y navegación',
    alcance: `Arquitectura de la app tal como se dio: capas (UI, ViewModel, repositorio, data source), ViewModel con StateFlow y backing property, estados sellados (Loading/Success/Error) y cómo los pinta la pantalla, collectAsStateWithLifecycle, inyección de dependencias con Hilt (@HiltAndroidApp, @AndroidEntryPoint, @HiltViewModel, @Inject constructor, módulos con @Binds y @Provides, @Singleton), navegación con rutas tipadas (NavHost, toRoute, savedStateHandle.toRoute, grafos anidados, callbacks en vez de pasar el navController), y la ToDoApp de clase como hilo conductor. Fuentes: "Lo dado en clase de Android.md" (§2.1 clases de 07/10, 09/10, 16/10, 23/10, 18/11 en lo que toque, §2.2, §2.3 patrones), Clases/Android de esas fechas, "Material de clase/ToDoApp de clase explicada.md", Glosario y los errores de Hilt de "Errores típicos.md". Aprovecha <Flujo> para la inyección de Hilt y el flujo de estado UI↔ViewModel. NO cubras Retrofit/Room/DataStore/corrutinas en detalle (grupo datos) ni lo no dado en clase (grupo para-el-proyecto).`,
  },
  {
    key: 'datos', carpeta: 'content/docs/2-dam/kotlin/datos', titulo: 'Datos en Android: corrutinas, Retrofit, Room y DataStore',
    alcance: `Lo que se dio de datos: corrutinas (suspend, viewModelScope.launch, por qué no GlobalScope), Flow y stateIn, Retrofit 3 con Gson contra PokeAPI (interfaz, Response<T>, DataSource, DTO y toModel(), NetworkModule), herramientas (PokeAPI, Postman, clase 26/10), permiso de INTERNET, Room 3 con KSP y Hilt (@Entity, @Dao, @Database, módulo de Room, PokeApp leyendo de Room), DataStore para el modo oscuro (booleanPreferencesKey). Fuentes: "Lo dado en clase de Android.md" (§2.1 clases 23/10, 26/10, 09/11, 13/11, 16/11, 18/11 en lo que toque; §2.2; §2.3; §2.4 versiones), Clases/Android de esas fechas, Glosario y errores de "Red y API" y "Room" de "Errores típicos.md" (los que salieron en clase). <Flujo> para la petición Pantalla→ViewModel→Repositorio→DataSource→Retrofit→API y para Room→Flow→UI. Lo que se dio a medias (relaciones de Room, POST/PUT/DELETE, token…) solo se menciona y se enlaza a /docs/2-dam/kotlin/para-el-proyecto.`,
  },
  {
    key: 'para-el-proyecto-android', carpeta: 'content/docs/2-dam/kotlin/para-el-proyecto', titulo: 'Android para el proyecto (no dado en clase)',
    alcance: `TODO "Lo que falta por dar - Android.md" (los 12 apartados: intent implícito, localización inglés/español, Room con relaciones 1 a N en Room 3, Room como fuente de verdad con Flow y refresco desde la API (offline first), DataStore con módulo + modo oscuro en el tema + token, llamar a tu API desde el emulador (10.0.2.2, network_security_config), interceptor con token, POST/PUT/DELETE con Retrofit, barra inferior y login sin volver atrás, volver atrás después de guardar, cómo hacer bien las prácticas raras de clase (con <Comparar>), dependencias de Gradle), más "Requisitos/Requisitos App Android (PMDMO y PSPRO).md" (una página de requisitos con su estado: dado / a medias / no dado y enlaces) y una página de "Errores típicos en Android" con todos los de la sección Android de "Errores típicos.md" (marcando los que salieron en clase). Todo lo que no es de clase va con <NoDadoEnClase>. Conserva el código de las fuentes (está compilado con las versiones de clase); si lo cambias, que siga siendo correcto.`,
  },
  {
    key: 'backend', carpeta: 'content/docs/2-dam/apis/backend', titulo: 'Backend con Node, Express y Prisma',
    alcance: `Lo dado en clase de backend (§2 de "Lo dado en clase de Angular, backend y C#.md" y todas las Clases "Backend (Node)"): Node y npm, TypeScript del proyecto, Express 5, estructura del repositorio del profesor (src/modules/<x>/ con routes, controller, service y schema), PostgreSQL 16 con docker-compose, Supabase, Prisma 6 (schema.prisma, migraciones, drift, db pull), CRUD del módulo users, validación con Zod 4 y el middleware validate, errores de Prisma (P2025 → 404, P2002 → 409), select para quitar passwordHash, Postman y JSON Server (clase 28/10), autenticación si se dio. <Flujo> para la cadena petición → router → middleware validate → controller → service → Prisma → Postgres. Va en la asignatura Diseño e Implementación de Infraestructuras de Servicios y APIs (carpeta apis), que es la de Node; Angular es Acceso a Datos. NO cubras Git (grupo proyecto) ni lo no dado (grupo backend-proyecto).`,
  },
  {
    key: 'backend-proyecto', carpeta: 'content/docs/2-dam/apis/backend-proyecto', titulo: 'Backend para el proyecto (no dado en clase)',
    alcance: `La parte de backend de "Lo que falta por dar - backend y Angular.md" (apartados 1 a 8: modelo con relaciones de verdad y onDelete, seed, listado con búsqueda/filtro/orden/paginación devolviendo el total, consultas con include/where/_count y select, operación de negocio con transacción, errores con su código HTTP, CORS para la web y la app, proteger rutas con el token), más "Requisitos/Requisitos de Acceso a Datos.md" y "Requisitos/Planificación por hitos - Acceso a Datos.md" (los documentos se llaman "de Acceso a Datos", pero lo que piden de backend y base de datos va aquí, en la asignatura de APIs; di de dónde sale cada requisito y enlaza la parte de Angular a /docs/2-dam/acceso-a-datos/angular-avanzado) (páginas de requisitos e hitos con estado dado/a medias/no dado y enlaces) y una página de "Errores típicos en el backend" (sección de backend de "Errores típicos.md"). Todo lo no dado con <NoDadoEnClase>. Demos útiles: simulador de paginación/filtros que construye la query y muestra la respuesta, visualizador de transacción (commit/rollback).`,
  },
  {
    key: 'angular', carpeta: 'content/docs/2-dam/acceso-a-datos/angular', titulo: 'Angular: componentes, plantillas y servicios',
    alcance: `Angular 19 dado en clase del 14/10 al 05/11 (§1 de "Lo dado en clase de Angular, backend y C#.md" y las Clases "Angular" de 14/10, 27/10, 28/10 y 05/11): estructura de un proyecto standalone (main.ts, app.config.ts, app.routes.ts…), ng generate, componentes padre/hijo, encapsulación de estilos, control flow (@if/@else, @for), data binding (interpolación, propiedades, eventos, two-way), input()/output() si se dieron, Flexbox para maquetar (proj-lamp, Guía6/Guía7), servicios con HttpClient e inject() (angular-http con JSONPlaceholder), proj-fakestore, pipes y directivas. Usa las Guías de Angular solo como apoyo y enlaza al repositorio original. Demos útiles: playground de Flexbox, simulador de data binding. Ojo: en Classroom sale como "Acceso a Datos" aunque el contenido es Angular. NO cubras proj-game, signals, routing ni formularios (grupo angular-avanzado).`,
  },
  {
    key: 'angular-avanzado', carpeta: 'content/docs/2-dam/acceso-a-datos/angular-avanzado', titulo: 'Angular: signals, rutas, formularios y proyecto',
    alcance: `Angular dado del 05/11 en adelante en lo que no cubra el grupo anterior: proj-game (28/10 a 18/11), signals (signal, computed, effect), paginación con JSON Server (12/11: _page, _limit), routing (proyecto-rutas 19/11: rutas, parámetros, guards si salen), formularios reactivos (18/11: FormGroup, FormControl, Validators, migración a ReactiveForms), patrones reactivos y gestión de errores si salen. Fuentes: §1 de "Lo dado en clase de Angular, backend y C#.md", Clases "Angular" de 12/11, 18/11 y 19/11 (y la parte de proj-game de las anteriores), guías 6_Patrones_Reactivos, 7_Signals, 9_Routing, 10_Formularios, 11_Gestion_Errores como apoyo (enlazando al original). Y la parte de Angular de "Lo que falta por dar - backend y Angular.md" (apartados 9 a 11: listado con filtros/paginación/estados/borrar con confirmación, guardar el token aunque se recargue, lo que no se dio pero está en las guías) con <NoDadoEnClase>, más una página de "Errores típicos en Angular" (sección de Angular de "Errores típicos.md").`,
  },
  {
    key: 'csharp', carpeta: 'content/docs/2-dam/desarrollo-de-interfaces/csharp', titulo: 'C# (Desarrollo de Interfaces)',
    alcance: `Todo el C# dado en clase: §3 de "Lo dado en clase de Angular, backend y C#.md" y las Clases "C#" de 05/11, 09/11, 18/11 y 19/11. Para quien sabe Java: diferencias C# vs Java, el tipo de proyecto/IDE que se usó, y los temas y proyectos de cada clase. Lo que no se vio, con <NoSeVio>; los [dudoso], con <Dudoso>. Usa <Comparar> para Java vs C# cuando ayude. Si el material de C# trae errores típicos o glosario, inclúyelos.`,
  },
  {
    key: 'proyecto', carpeta: 'content/docs/2-dam/proyecto-intermodular', titulo: 'Proyecto Intermodular: gestión, Git, despliegue y requisitos',
    alcance: `(1) Gestión de proyectos (09/10: SMART, desarrollo ágil, la demostración de un proyecto real, todo lo que traiga §4 de "Lo dado en clase de Angular, backend y C#.md" y la Clase "Otras" de 09/10). (2) Git como se dio: ramas, tags, Git Graph (clases "Otras" de 20/10, 27/10, 03/11) — buena candidata para una demo animada de ramas y tags. (3) Despliegue en Vercel (18/11, Act 11 de Angular). (4) Una página "Requisitos y dónde se dieron" a partir de "Requisitos y dónde se dieron.md": la página de inicio para preparar el proyecto, con tablas por área (estado Dado / A medias / No dado sin emojis), en qué clase salió y qué falta, enlazando a las carpetas /docs/2-dam/kotlin/para-el-proyecto, /docs/2-dam/apis/backend-proyecto, /docs/2-dam/acceso-a-datos/angular-avanzado, etc.; y lo que pueden preguntar en la defensa (con Flashcards de preparación). ESCRIBE tus páginas directamente en content/docs/2-dam/proyecto-intermodular/ con slugs propios (NO toques su index.mdx ni su meta.json: los hace otro agente después).`,
  },
]

const SCHEMA_GRUPO = {
  type: 'object',
  properties: {
    paginas: { type: 'array', items: { type: 'object', properties: { ruta: { type: 'string' }, titulo: { type: 'string' }, resumen: { type: 'string' } }, required: ['ruta', 'titulo', 'resumen'] } },
    demos: { type: 'array', items: { type: 'string' }, description: 'Componentes a medida creados (ruta + qué hacen)' },
    fuentesUsadas: { type: 'array', items: { type: 'string' } },
    pendientes: { type: 'array', items: { type: 'string' }, description: 'Lo que no te dio tiempo o necesitas de otros (enlaces a páginas de otros grupos, etc.)' },
  },
  required: ['paginas', 'demos', 'fuentesUsadas', 'pendientes'],
}
const SCHEMA_REV = {
  type: 'object',
  properties: {
    correcciones: { type: 'array', items: { type: 'string' } },
    problemasRestantes: { type: 'array', items: { type: 'string' } },
    validadorOk: { type: 'boolean' },
  },
  required: ['correcciones', 'problemasRestantes', 'validadorOk'],
}

const propios = g => g.key === 'proyecto'
  ? `tus páginas en ${g.carpeta}/ (todas menos index.mdx y meta.json) y components/temas/${g.key}/`
  : `la carpeta ${g.carpeta}/ (incluidos su index.mdx y meta.json) y components/temas/${g.key}/`

const grupos = await pipeline(
  GRUPOS,
  g => agent(`Eres uno de 10 redactores que convierten el material de clase de 2º DAM en apuntes interactivos para la web del repo (lee el CLAUDE.md).

TU BLOQUE: ${g.titulo}
TUS ARCHIVOS: ${propios(g)}
ALCANCE: ${g.alcance}
${FUENTES}${REGLAS}${ESCRITURA}${CATALOGO}
ESTRUCTURA: divide tu bloque en las páginas que tenga sentido (normalmente entre 4 y 8, cada una un tema que se pueda estudiar de una sentada). ${g.key === 'proyecto' ? '' : `Crea ${g.carpeta}/index.mdx (presentación corta del bloque con enlaces a sus páginas y qué fechas de clase cubre) y ${g.carpeta}/meta.json con "title" e "icon" (lucide) y "pages" en orden de estudio.`}
Lee a fondo las fuentes de tu alcance antes de escribir. Sé exhaustivo con lo que se dio: que un alumno que se perdió las clases pueda estudiar solo con tus páginas. Termina validando con el validador. Devuelve el informe.`,
    { label: `redactar:${g.key}`, phase: 'Redacción', schema: SCHEMA_GRUPO }),
  (inf, g) => agent(`Eres el REVISOR DE FIDELIDAD Y CORRECCIÓN del bloque "${g.titulo}" de los apuntes de 2º DAM. Un redactor acaba de escribirlo. Tus archivos (solo puedes editar estos): ${propios(g)}.
Informe del redactor: ${JSON.stringify(inf)}
${FUENTES}${REGLAS}
ALCANCE QUE DEBÍA CUBRIR: ${g.alcance}

Revisa con escepticismo, página por página, contra las fuentes:
1. Fidelidad: ¿lo que dice que se dio en clase está en las fuentes? ¿fechas correctas? ¿se ha inventado código "del profesor"? ¿se ha rellenado código que no se vio (debe ir con <NoSeVio>)? ¿se han mantenido TODAS las marcas [dudoso] de los fragmentos usados (con <Dudoso>)? ¿está todo lo no dado marcado con <NoDadoEnClase>? ¿las prácticas raras salen como aviso y no como patrón bueno?
2. Corrección técnica: ¿el código es correcto para las versiones de clase (Room 3, Retrofit 3, Angular 19, Prisma 6, Zod 4, Express 5…)? ¿las explicaciones son verdad?
3. Tests: resuelve TÚ cada pregunta de Quiz, cada Flashcard, cada Ejercicio y CompletarCodigo sin mirar la respuesta, y comprueba que la marcada como correcta lo es y que las demás son incorrectas sin ambigüedad. Corrige lo que falle.
4. Cobertura: ¿falta algo importante del alcance? Si es razonable, añádelo.
5. Privacidad (sin nombres de profesores/alumnos) y sin emojis.
Corrige directamente. Valida con: node "${A.validador}" ${g.carpeta}. NO ejecutes build/dev ni comandos git que cambien el árbol. Devuelve el informe.`,
    { label: `fidelidad:${g.key}`, phase: 'Fidelidad', schema: SCHEMA_REV }).then(rev => ({ inf, rev })),
  (prev, g) => agent(`Eres el REVISOR DE PULIDO del bloque "${g.titulo}" de los apuntes de 2º DAM. Ya se escribió y se revisó la fidelidad. Tus archivos (solo puedes editar estos): ${propios(g)}.
Informes previos: ${JSON.stringify(prev)}
${ESCRITURA}${CATALOGO}
NO cambies el contenido técnico ni quites marcas <NoDadoEnClase>, <Dudoso>, <NoSeVio>, <DeClase> (la fidelidad ya está revisada). Céntrate en:
1. Experiencia de estudio: ¿se entiende a la primera? ¿orden lógico, secciones cortas, ejemplos? ¿cada página tiene Quiz, Flashcards, Ejercicio y MarcarCompletado?
2. Interactividad y animación: ¿hay al menos un elemento interactivo o visual que explique algo de verdad en cada página (Flujo, Recorrido, Comparar, Mermaid, CompletarCodigo, Terminal, demo a medida)? Si una página es un muro de texto, añade algo que aporte. Si alguna demo es decorativa o confusa, mejórala o quítala.
3. Revisa el código de las demos de components/temas/${g.key}/: estilo de la web (tokens, 1px, sin degradados/sombras de color/emojis/cajitas de color), móvil sin scroll horizontal, teclado y foco, prefers-reduced-motion, sin errores de React (keys, efectos, hidratación: nada de Math.random/Date en render). npx tsc --noEmit sin errores en tus archivos.
4. MDX válido: node "${A.validador}" ${g.carpeta}  debe pasar entero.
NO ejecutes build/dev ni git que cambie el árbol. Devuelve el informe.`,
    { label: `pulido:${g.key}`, phase: 'Pulido', schema: SCHEMA_REV }).then(pul => ({ grupo: g.key, carpeta: g.carpeta, ...prev, pul })),
)

const hechos = grupos.filter(Boolean)
if (hechos.length < GRUPOS.length) log(`Atención: ${GRUPOS.length - hechos.length} bloque(s) no completaron el pipeline: ${GRUPOS.filter(g => !hechos.find(h => h.grupo === g.key)).map(g => g.key).join(', ')}`)

phase('Índices')
const resumenGrupos = JSON.stringify(hechos.map(h => ({ grupo: h.grupo, carpeta: h.carpeta, paginas: h.inf?.paginas, pendientes: h.inf?.pendientes })), null, 1)
const MODULOS = [
  { key: 'kotlin', ruta: 'content/docs/2-dam/kotlin', extra: 'Subcarpetas: compose, arquitectura, datos, para-el-proyecto (en ese orden). Este módulo junta PMDM y PSP (Programación de Servicios y Procesos), los dos con Kotlin. El index actual lista un temario genérico: reescríbelo para reflejar lo que de verdad hay ahora (lo dado de Android con fechas y lo de para-el-proyecto), y deja lo de PSP y lo que aún no se ha dado como "Próximamente" de forma breve y honesta.' },
  { key: 'acceso-a-datos', ruta: 'content/docs/2-dam/acceso-a-datos', extra: 'Subcarpetas: angular, angular-avanzado. El index y la description actuales hablan de Java/JDBC/JPA, pero este curso Acceso a Datos ha sido sobre todo Angular (el backend con Node va en la asignatura de APIs: /docs/2-dam/apis). Reescribe title/description/index para reflejarlo (con un enlace a la asignatura de APIs para la parte de servidor) y ordena las subcarpetas en meta.json.' },
  { key: 'apis', ruta: 'content/docs/2-dam/apis', extra: 'Subcarpetas: backend, backend-proyecto (en ese orden). Esta es la asignatura Diseño e Implementación de Infraestructuras de Servicios y APIs, que en clase ha sido el backend con Node, Express 5, Prisma 6, Zod 4 y PostgreSQL. Reescribe title (mantén el nombre oficial), description e index para reflejarlo (qué se dio y con qué fechas, qué hay para el proyecto), con enlace a Angular en /docs/2-dam/acceso-a-datos como cliente de la API.' },
  { key: 'desarrollo-de-interfaces', ruta: 'content/docs/2-dam/desarrollo-de-interfaces', extra: 'Subcarpeta: csharp. Ajusta el index para que el C# dado en clase sea lo protagonista y el resto del temario oficial quede como "Próximamente" breve.' },
  { key: 'proyecto-intermodular', ruta: 'content/docs/2-dam/proyecto-intermodular', extra: 'Aquí el redactor escribió páginas sueltas en la carpeta (no subcarpeta). Ordénalas en meta.json (con "Requisitos y dónde se dieron" bien visible, quizá la primera tras index) y reescribe el index como punto de partida para preparar el proyecto: enlaza a la página de requisitos y a las carpetas de "para el proyecto" de cada asignatura.' },
  { key: 'raiz', ruta: 'content/docs/2-dam (solo index.mdx y meta.json del curso) y content/docs/index.mdx', extra: 'Actualiza la portada del curso 2º DAM y la portada general de /docs para que reflejen el contenido nuevo (qué hay por asignatura, por dónde empezar: Requisitos y dónde se dieron). No toques las carpetas de los módulos. Comprueba también components/landing/* SOLO para ver si la portada de la web muestra bien el árbol nuevo; no edites archivos de components.' },
]
const indices = await parallel(MODULOS.map(m => () => agent(`Eres el agente de ÍNDICES del módulo "${m.key}" de la web de apuntes (lee CLAUDE.md). Diez redactores acaban de escribir el contenido nuevo de 2º DAM. Resumen de lo que hay:
${resumenGrupos}
TUS ARCHIVOS: el index.mdx y el meta.json de ${m.ruta} (y los de nivel de módulo, no los de las subcarpetas de los grupos). ${m.extra}
Además, revisa los enlaces de TODO el módulo: si alguna página enlaza a la carpeta de otro grupo cuando existe una página concreta mejor, puedes cambiar ESE enlace (solo el enlace) en las páginas de este módulo.
Estilo: sobrio, útil, sin eslóganes ni emojis, español de España tuteando. Usa <Cards>/<Card> si encajan. Valida con node "${A.validador}" ${m.ruta.split(' ')[0]}. NO ejecutes build/dev ni git que cambie el árbol. Devuelve un resumen breve de lo que has hecho.`,
  { label: `indices:${m.key}`, phase: 'Índices' })))

phase('Integración')
const integracion = await agent(`Eres el INTEGRADOR final de un trabajo grande en la web de apuntes (lee CLAUDE.md): se han creado componentes nuevos, unos 10 bloques de contenido de 2º DAM con demos a medida en components/temas/, y se han rehecho los índices. Ya ha terminado todo el mundo; puedes editar cualquier archivo.
Resumen de bloques: ${resumenGrupos}
Índices: ${JSON.stringify(indices)}

1. node "${A.validador}" content/docs  → arregla todo lo que falle.
2. npm run typecheck → arregla todo.
3. npm run build → arregla hasta que pase. Revisa también avisos relevantes del build.
4. Coherencia: busca con grep restos prohibidos en content/ y components/temas/ (emojis ✅🟡❌🎓, degradados, shadow de color, nombres de profesores como "Juan Antonio"), y que las páginas no repitan lo mismo entre bloques de forma contradictoria.
5. Tamaño para el Tutor IA: lib/ai/conocimiento.ts mete el texto procesado de todas las páginas hasta MAX_CARACTERES_APUNTES (280.000 caracteres). Mide cuánto ocupa ahora (por ejemplo con un script que lea .next o, mejor, sumando el tamaño del texto de los MDX como aproximación, o llamando al endpoint /llms-full.txt tras el build con next start si es viable) e informa: total aproximado, si se supera el límite y qué páginas quedarían fuera. NO cambies el límite ni el modelo (decisión del dueño).
6. No hagas commit.
Devuelve el informe.`,
  {
    label: 'integrador',
    phase: 'Integración',
    schema: {
      type: 'object',
      properties: {
        resumen: { type: 'string', description: 'En español' },
        arreglos: { type: 'array', items: { type: 'string' } },
        validadorOk: { type: 'boolean' },
        typecheckOk: { type: 'boolean' },
        buildOk: { type: 'boolean' },
        paginasNuevas: { type: 'number' },
        tutor: { type: 'string', description: 'Tamaño del texto para el tutor frente al límite y qué queda fuera' },
        salidaErrores: { type: 'string' },
      },
      required: ['resumen', 'arreglos', 'validadorOk', 'typecheckOk', 'buildOk', 'paginasNuevas', 'tutor', 'salidaErrores'],
    },
  })

return { componentes, grupos: hechos, indices, integracion }
