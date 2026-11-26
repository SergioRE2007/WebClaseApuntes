export const meta = {
  name: 'apuntes-curso-2dam-continuacion',
  description: 'Termina los apuntes de 2º DAM: fidelidad de backend y angular-avanzado, pulido de 7 bloques, verificación de tests, índices, coherencia e integración con build',
  phases: [
    { title: 'Fidelidad', detail: 'backend y angular-avanzado (se cortó a medias)' },
    { title: 'Pulido', detail: '7 bloques: interactividad, diseño y MDX' },
    { title: 'Tests', detail: 'verificador independiente de respuestas por bloque' },
    { title: 'Índices', detail: 'portadas y meta.json de cada asignatura, 2-dam y /docs' },
    { title: 'Coherencia', detail: 'solapes y contradicciones entre bloques' },
    { title: 'Integración', detail: 'validador, typecheck, build, restos prohibidos, tamaño del tutor' },
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
- Extras (NO se publican tal cual): ${A.extras}
  - "Contexto para la web.md" (REGLAS DEL MATERIAL, léelo entero antes de empezar), "Requisitos y dónde se dieron.md", "Lo que falta por dar - Android.md", "Lo que falta por dar - backend y Angular.md", "Errores típicos.md", "Glosario.md", "Chuleta de Compose.md".
`

const REGLAS = `
REGLAS DEL MATERIAL (obligatorias; vienen de "Contexto para la web.md"):
1. Separa SIEMPRE lo dado en clase de lo que no. Lo que salga de "Lo que falta por dar" (o que no sea de clase) va con <NoDadoEnClase>. Lo de clase puede llevar <DeClase fecha="dd/mm" />.
2. Las marcas [dudoso] de las fuentes NO se corrigen ni se esconden: se muestran con <Dudoso>.
3. No rellenes código que no se vio: lo de "Dudas y lagunas" / "Código que no se llega a ver" va con <NoSeVio>. Nunca presentes como "del profesor" algo que no está en las fuentes.
4. Si un archivo de Clases/ contradice al resumen general ("Lo dado en clase de …"), vale el resumen.
5. "Prácticas raras del código de clase": como aviso con <Comparar> ("Así se hizo en clase" / "Mejor así", la buena con <NoDadoEnClase> si no se dio), nunca como el patrón bueno.
6. NO cambies versiones: Angular 19, Room 3 (androidx.room3), Retrofit 3 con Gson, Prisma 6, Zod 4, Express 5, Hilt 2.60.1, Navigation 2.10.2, DataStore 1.3.0, KSP 2.3.12, Kotlin 2.4. El código debe ser correcto para esas versiones.
7. Público: alumnos de 2º DAM que ya saben Java.
8. Las guías de Angular son copia de https://github.com/hokahey007/guides-angular: no las copies; enlaza al original y explica con tus palabras.
9. Privacidad: ni nombres de profesores ni de alumnos ("el profesor", "en clase"). Sin enlaces a vídeos privados ni a Classroom.
10. Sin emojis (convierte ✅ 🟡 ❌ 🎓 en texto: "Dado", "A medias", "No dado", "Salió en clase").
11. Español de España, tuteando. CADA respuesta de test, flashcard y solución debe ser correcta.
`

const ESCRITURA = `
CÓMO ESCRIBIR (lee content/docs/guia-autor/componentes.mdx —catálogo de TODOS los componentes, incluidos los propios del material: NoDadoEnClase, Dudoso, NoSeVio, DeClase, Comparar/Lado, Recorrido/Paso, Flujo/Mensaje— y content/docs/guia-autor/plantilla.mdx):
- Cada página: frontmatter con title y description, secciones claras, código con título, y al final <Quiz> (con <Explicacion>), <Flashcards>, uno o dos <Ejercicio> con <Pista> y <Solucion>, y <MarcarCompletado />.
- Interactivo y visual donde aporte de verdad (Flujo, Recorrido, Comparar, CompletarCodigo, Terminal, Mermaid, Concepto, Tabs, Steps, Files, demos a medida), no por rellenar.
- Demos a medida: en components/temas/<bloque>/*.tsx ('use client' si tienen estado), importadas desde el MDX (import { X } from '@/components/temas/<bloque>/x';), NO registradas en components/mdx.tsx. Estilo: tokens de Fumadocs (bg-fd-card, border-fd-border, text-fd-muted-foreground, bg-fd-primary…), bordes de 1px, sin degradados, brillos, glassmorphism, sombras de color, iconos en cajitas de color ni emojis; reutiliza components/interactive/estilos.ts. Animaciones con motion/react, con sentido y respetando useReducedMotion. Móvil sin scroll horizontal, teclado y foco visible. Nada de Math.random/Date en render (hidratación).
- El texto importante debe estar también en el MDX (el Tutor IA y el buscador leen el MDX, no tus componentes).
- MDX: escapa {, } y < en el texto; cierra etiquetas; Mermaid en template literal chart={\`...\`}.
- Enlaces internos absolutos (/docs/2-dam/...) y solo a páginas que existan (compruébalo con ls).
- VALIDA: node "${A.validador}" <tu carpeta>  (desde la raíz del repo). Para .tsx: npx tsc --noEmit (ignora errores ajenos a tus archivos).
- PROHIBIDO: npm run build, npm run dev, git commit/checkout/stash/reset/merge. Hay otros agentes editando a la vez otras carpetas: edita SOLO tus archivos. No toques components/mdx.tsx, components/interactive/*, app/*, ni index.mdx/meta.json de nivel de asignatura.
`

const BLOQUES = [
  { key: 'backend', carpeta: 'content/docs/2-dam/apis/backend', titulo: 'Backend con Node, Express y Prisma', fidelidad: true,
    alcance: `Lo dado en clase de backend (§2 de "Lo dado en clase de Angular, backend y C#.md" y todas las Clases "Backend (Node)"): Node y npm, TypeScript del proyecto, Express 5, estructura src/modules/<x>/ con routes, controller, service y schema, PostgreSQL 16 con docker-compose, Supabase, Prisma 6 (schema.prisma, migraciones, drift, db pull), CRUD de users, Zod 4 y el middleware validate, errores de Prisma (P2025 → 404, P2002 → 409), select para quitar passwordHash, Postman y JSON Server (28/10), autenticación si se dio. Ojo: hay páginas como docker-swagger.mdx y logs-rate-limiting-tests.mdx: comprueba con especial cuidado si eso se dio en clase; si no, debe ir con <NoDadoEnClase> o moverse/quitarse.` },
  { key: 'angular-avanzado', carpeta: 'content/docs/2-dam/acceso-a-datos/angular-avanzado', titulo: 'Angular: signals, rutas, formularios y proyecto', fidelidad: true,
    alcance: `Angular dado del 05/11 en adelante: proj-game (28/10 a 18/11), signals (signal, computed, effect), paginación con JSON Server (12/11: _page, _limit), routing (proyecto-rutas 19/11: rutas, parámetros, guards si salen), formularios reactivos (18/11: FormGroup, FormControl, Validators), patrones reactivos y gestión de errores si salen. Fuentes: §1 de "Lo dado en clase de Angular, backend y C#.md", Clases "Angular" de 12/11, 18/11 y 19/11 (y proj-game de las anteriores), guías 6, 7, 9, 10, 11 como apoyo (enlazando al original). Y la parte de Angular de "Lo que falta por dar - backend y Angular.md" (apartados 9 a 11) con <NoDadoEnClase>, más "Errores típicos en Angular". Ojo: existen rutas.mdx y rutas-parametros-guards.mdx: que no se solapen ni se contradigan.` },
  { key: 'compose', carpeta: 'content/docs/2-dam/kotlin/compose', titulo: 'Kotlin y Jetpack Compose', fidelidad: false,
    alcance: 'Kotlin para quien viene de Java, proyecto Android y Gradle, Jetpack Compose (composables, layouts, Modifier, estado y recomposición, Material 3, listas).' },
  { key: 'arquitectura', carpeta: 'content/docs/2-dam/kotlin/arquitectura', titulo: 'Arquitectura Android: ViewModel, Hilt y navegación', fidelidad: false,
    alcance: 'Capas, ViewModel con StateFlow, estados de pantalla, Hilt y sus módulos, navegación con rutas tipadas, ToDoApp de clase.' },
  { key: 'para-el-proyecto-android', carpeta: 'content/docs/2-dam/kotlin/para-el-proyecto', titulo: 'Android para el proyecto (no dado en clase)', fidelidad: false,
    alcance: 'Todo "Lo que falta por dar - Android.md", requisitos de la app Android con su estado y errores típicos de Android. Casi todo va con <NoDadoEnClase>.' },
  { key: 'backend-proyecto', carpeta: 'content/docs/2-dam/apis/backend-proyecto', titulo: 'Backend para el proyecto (no dado en clase)', fidelidad: false,
    alcance: 'Apartados 1 a 8 de "Lo que falta por dar - backend y Angular.md", requisitos e hitos de Acceso a Datos (parte de backend) y errores típicos del backend.' },
  { key: 'angular', carpeta: 'content/docs/2-dam/acceso-a-datos/angular', titulo: 'Angular: componentes, plantillas y servicios', fidelidad: false,
    alcance: 'Angular 19 del 14/10 al 05/11: proyecto standalone y CLI, componentes, comunicación padre/hijo, control flow, data binding, Flexbox, servicios e inject(), HttpClient, pipes y directivas.' },
]

const SCHEMA_REV = {
  type: 'object',
  properties: {
    correcciones: { type: 'array', items: { type: 'string' } },
    problemasRestantes: { type: 'array', items: { type: 'string' } },
    validadorOk: { type: 'boolean' },
  },
  required: ['correcciones', 'problemasRestantes', 'validadorOk'],
}
const propios = b => `la carpeta ${b.carpeta}/ (incluidos su index.mdx y meta.json) y components/temas/${b.key}/`

const bloques = await pipeline(
  BLOQUES,
  b => b.fidelidad
    ? agent(`Eres el REVISOR DE FIDELIDAD Y CORRECCIÓN del bloque "${b.titulo}" de los apuntes de 2º DAM (lee el CLAUDE.md del repo). El bloque ya está redactado; una revisión anterior se cortó a medias, así que puede que parte ya esté corregida: revisa TODO igualmente. Tus archivos (solo puedes editar estos): ${propios(b)}.
${FUENTES}${REGLAS}
ALCANCE QUE DEBÍA CUBRIR: ${b.alcance}

Revisa con escepticismo, página por página, contra las fuentes:
1. Fidelidad: ¿lo que dice que se dio en clase está en las fuentes? ¿fechas correctas? ¿código "del profesor" inventado? ¿código que no se vio rellenado (debe ir con <NoSeVio>)? ¿se mantienen TODAS las marcas [dudoso] de los fragmentos usados (con <Dudoso>)? ¿todo lo no dado con <NoDadoEnClase>? ¿prácticas raras como aviso y no como patrón bueno?
2. Corrección técnica para las versiones de clase.
3. Tests: resuelve TÚ cada Quiz, Flashcard, Ejercicio y CompletarCodigo sin mirar la respuesta, y comprueba que la marcada es correcta y las demás incorrectas sin ambigüedad. Corrige lo que falle.
4. Cobertura: si falta algo importante del alcance, añádelo.
5. Privacidad y sin emojis.
Corrige directamente. Valida con: node "${A.validador}" ${b.carpeta}. NO ejecutes build/dev ni git que cambie el árbol. Devuelve el informe.`,
      { label: `fidelidad:${b.key}`, phase: 'Fidelidad', schema: SCHEMA_REV })
    : Promise.resolve({ sinFidelidad: true }), // ojo: si una etapa devuelve null, pipeline() descarta el bloque
  (fid, b) => agent(`Eres el REVISOR DE PULIDO del bloque "${b.titulo}" de los apuntes de 2º DAM (lee el CLAUDE.md del repo). El contenido está escrito y su fidelidad revisada. Un pulido anterior pudo quedarse a medias: revisa TODO. Tus archivos (solo puedes editar estos): ${propios(b)}.
${fid && !fid.sinFidelidad ? `Informe de fidelidad recién hecho: ${JSON.stringify(fid)}` : ''}
Alcance del bloque: ${b.alcance}
${ESCRITURA}
NO cambies el contenido técnico ni quites marcas <NoDadoEnClase>, <Dudoso>, <NoSeVio>, <DeClase>. Céntrate en:
1. Experiencia de estudio: ¿se entiende a la primera? ¿orden lógico, secciones cortas, ejemplos? ¿cada página tiene Quiz, Flashcards, Ejercicio y MarcarCompletado? ¿el meta.json del bloque ordena bien las páginas y el index.mdx del bloque enlaza a todas?
2. Interactividad: al menos un elemento interactivo o visual que explique algo de verdad en cada página. Si una página es un muro de texto, añade algo que aporte. Si una demo es decorativa o confusa, mejórala o quítala. Si añades preguntas o ejercicios nuevos, comprueba que su respuesta es correcta.
3. Código de components/temas/${b.key}/: estilo de la web, móvil, teclado y foco, prefers-reduced-motion, sin errores de React (keys, efectos, hidratación). npx tsc --noEmit sin errores en tus archivos.
4. node "${A.validador}" ${b.carpeta} debe pasar entero.
NO ejecutes build/dev ni git que cambie el árbol. Devuelve el informe.`,
    { label: `pulido:${b.key}`, phase: 'Pulido', schema: SCHEMA_REV }).then(pul => ({ fid, pul })),
  (prev, b) => agent(`Eres un VERIFICADOR INDEPENDIENTE de los tests del bloque "${b.titulo}" (carpeta ${b.carpeta}). Los alumnos estudian con estas respuestas, así que una respuesta mal marcada es grave.
Para CADA página del bloque: localiza cada <Quiz>/<Pregunta> (las opciones correctas llevan la prop que indica content/docs/guia-autor/componentes.mdx), cada <Tarjeta> de Flashcards, cada <Ejercicio> con su <Solucion> y cada <CompletarCodigo>. Resuélvelo TÚ primero sin mirar qué está marcado; luego compara. Sé escéptico: busca opciones "incorrectas" que en realidad también son correctas, explicaciones que contradicen la respuesta, soluciones que no compilan para las versiones del curso (Angular 19, Room 3, Retrofit 3, Prisma 6, Zod 4, Express 5, Kotlin 2.4, Hilt 2.60.1) y respuestas que contradicen lo explicado en la propia página.
Corrige solo lo que esté MAL (no reescribas por estilo) en ${b.carpeta}/. No quites marcas <NoDadoEnClase>, <Dudoso>, <NoSeVio>, <DeClase>. Valida con node "${A.validador}" ${b.carpeta}. NO ejecutes build/dev ni git que cambie el árbol.
Devuelve en correcciones cada fallo encontrado con archivo y qué se cambió.`,
    { label: `tests:${b.key}`, phase: 'Tests', schema: SCHEMA_REV }).then(tests => ({ bloque: b.key, carpeta: b.carpeta, ...prev, tests })),
)

const hechos = bloques.filter(Boolean)
if (hechos.length < BLOQUES.length) log(`Atención: no completaron el pipeline: ${BLOQUES.filter(b => !hechos.find(h => h.bloque === b.key)).map(b => b.key).join(', ')}`)
log(`Bloques pulidos y verificados: ${hechos.map(h => h.bloque).join(', ')}`)

phase('Índices')
const MODULOS = [
  { key: 'kotlin', ruta: 'content/docs/2-dam/kotlin', extra: 'Subcarpetas: compose, arquitectura, datos, para-el-proyecto (en ese orden). El módulo junta PMDM y PSP (Programación de Servicios y Procesos), los dos con Kotlin. El index actual lista un temario genérico: reescríbelo para reflejar lo que hay de verdad (lo dado de Android con fechas y lo de para-el-proyecto) y deja PSP y lo no dado como "Próximamente", breve y honesto.' },
  { key: 'acceso-a-datos', ruta: 'content/docs/2-dam/acceso-a-datos', extra: 'Subcarpetas: angular, angular-avanzado. El index y la description actuales hablan de Java/JDBC/JPA, pero este curso Acceso a Datos ha sido sobre todo Angular (el backend con Node va en /docs/2-dam/apis). Reescribe title/description/index para reflejarlo y ordena las subcarpetas en meta.json.' },
  { key: 'apis', ruta: 'content/docs/2-dam/apis', extra: 'Subcarpetas: backend, backend-proyecto (en ese orden). Es la asignatura Diseño e Implementación de Infraestructuras de Servicios y APIs (backend con Node, Express 5, Prisma 6, Zod 4 y PostgreSQL). Reescribe title (mantén el nombre oficial), description e index (qué se dio y con qué fechas, qué hay para el proyecto), con enlace a Angular en /docs/2-dam/acceso-a-datos como cliente de la API.' },
  { key: 'desarrollo-de-interfaces', ruta: 'content/docs/2-dam/desarrollo-de-interfaces', extra: 'Subcarpeta: csharp. Que el C# dado en clase sea lo protagonista y el resto del temario oficial quede como "Próximamente" breve.' },
  { key: 'proyecto-intermodular', ruta: 'content/docs/2-dam/proyecto-intermodular', extra: 'Páginas sueltas en la carpeta. Ordénalas en meta.json ("Requisitos y dónde se dieron" bien visible, la primera tras index) y reescribe el index como punto de partida para preparar el proyecto: enlaza a la página de requisitos y a las carpetas de "para el proyecto" de cada asignatura (/docs/2-dam/kotlin/para-el-proyecto, /docs/2-dam/apis/backend-proyecto, /docs/2-dam/acceso-a-datos/angular-avanzado).' },
  { key: 'raiz', ruta: 'content/docs/2-dam (solo su index.mdx y meta.json) y content/docs/index.mdx', extra: 'Actualiza la portada del curso 2º DAM y la portada general de /docs para que reflejen el contenido nuevo (qué hay por asignatura, por dónde empezar: Requisitos y dónde se dieron). El orden de 2-dam/meta.json: kotlin, acceso-a-datos, apis, desarrollo-de-interfaces, proyecto-intermodular salvo que haya razón clara para otro. No toques las carpetas de los módulos. Mira components/landing/* SOLO para comprobar si la portada de la web muestra bien el árbol nuevo; no edites components.' },
]
const indices = await parallel(MODULOS.map(m => () => agent(`Eres el agente de ÍNDICES del módulo "${m.key}" de la web de apuntes (lee CLAUDE.md). El contenido de 2º DAM ya está escrito y revisado. Empieza listando con ls/Glob las páginas que hay y leyendo los index.mdx de las subcarpetas para saber qué cubre cada una.
TUS ARCHIVOS: el index.mdx y el meta.json de ${m.ruta} (los de nivel de asignatura, no los de las subcarpetas de bloque). ${m.extra}
Además, revisa los enlaces de TODO el módulo: si alguna página enlaza a la carpeta de otro bloque cuando existe una página concreta mejor, o a una página que no existe, puedes cambiar ESE enlace (solo el enlace).
Reglas: sin nombres de profesores, sin emojis, sobrio y útil, sin eslóganes, español de España tuteando. Usa <Cards>/<Card> si encajan. Escapa {, } y < en el texto MDX. Valida con node "${A.validador}" ${m.ruta.split(' ')[0]}. NO ejecutes build/dev ni git que cambie el árbol. Devuelve un resumen breve de lo que has hecho.`,
  { label: `indices:${m.key}`, phase: 'Índices' })))

phase('Coherencia')
const coherencia = await agent(`Eres el REVISOR DE COHERENCIA ENTRE BLOQUES de los apuntes de 2º DAM (lee CLAUDE.md). Ya está todo escrito, pulido e indexado; ahora eres el único agente trabajando y puedes editar cualquier archivo de content/docs/2-dam/ y components/temas/.
${REGLAS}
Busca solapes y contradicciones entre bloques. Sospechosos claros:
- content/docs/2-dam/kotlin/datos/offline-first.mdx frente a content/docs/2-dam/kotlin/para-el-proyecto/offline-first.mdx (offline first NO se dio en clase según "Lo dado en clase de Android.md" — compruébalo en ${A.corpus}; si datos/offline-first presenta como dado algo que no lo fue, corrígelo, márcalo con <NoDadoEnClase> o conviértelo en una presentación breve que enlace a la de para-el-proyecto).
- kotlin/datos/datastore.mdx frente a kotlin/para-el-proyecto/datastore.mdx.
- acceso-a-datos/angular-avanzado/rutas.mdx frente a rutas-parametros-guards.mdx.
- Hay dos pila-navegacion.tsx (temas/arquitectura y temas/para-el-proyecto-android) y dos checklist-requisitos.tsx (temas/proyecto y temas/backend-proyecto): está bien que existan si cada una sirve a su página; no las fusiones salvo que sean idénticas.
- Requisitos: proyecto-intermodular/requisitos-y-donde-se-dieron.mdx frente a kotlin/para-el-proyecto/requisitos.mdx y apis/backend-proyecto/requisitos.mdx/hitos.mdx: el estado (Dado / A medias / No dado) de cada requisito debe coincidir en todas.
- Fechas de clase (<DeClase>) del mismo tema que no coincidan entre bloques; versiones distintas de la misma librería; el mismo concepto explicado de forma contradictoria.
Usa grep para buscar más. Arregla lo que encuentres con el cambio mínimo (enlazar en vez de duplicar cuando una página repite otra entera). Comprueba también que todos los enlaces internos /docs/... de content/docs/2-dam apuntan a páginas existentes. Valida con node "${A.validador}" content/docs. NO ejecutes build/dev ni git que cambie el árbol. Devuelve el informe.`,
  { label: 'coherencia', phase: 'Coherencia', schema: SCHEMA_REV })

phase('Integración')
const integracion = await agent(`Eres el INTEGRADOR final de la web de apuntes (lee CLAUDE.md y TRABAJO-EN-CURSO.md). Se ha terminado el contenido de 2º DAM (bloques, demos en components/temas/, índices y revisión de coherencia). Eres el único agente trabajando: puedes editar cualquier archivo.
Informes previos: bloques ${JSON.stringify(hechos.map(h => ({ bloque: h.bloque, restantes: [...(h.fid?.problemasRestantes || []), ...(h.pul?.problemasRestantes || []), ...(h.tests?.problemasRestantes || [])] })))}; índices ${JSON.stringify(indices)}; coherencia ${JSON.stringify(coherencia)}

1. node "${A.validador}" content/docs → arregla todo lo que falle.
2. npm run typecheck → arregla todo.
3. npm run build → arregla hasta que pase (es la primera vez que se compila con el contenido nuevo; espera errores de MDX o de imports). Revisa también avisos relevantes.
4. Restos prohibidos con grep en content/ y components/temas/: emojis (✅🟡❌🎓 y cualquier otro), degradados (gradient), sombras de color, glassmorphism (backdrop-blur), nombres de profesores (busca nombres propios de persona en las fuentes de ${A.corpus} y comprueba que no aparecen en content/), enlaces a Classroom o vídeos privados.
5. Tamaño para el Tutor IA: lib/ai/conocimiento.ts mete el texto procesado de todas las páginas hasta MAX_CARACTERES_APUNTES (280.000). Mídelo de la forma más fiel posible (lee cómo lo calcula conocimiento.ts y reprodúcelo con un script temporal en node, o usa el resultado del build) e informa: total, si se supera el límite y qué páginas quedarían fuera. NO cambies el límite ni el modelo (decisión del dueño).
6. Las carpetas TodoTFG-Apuntes/ y "Extras para TodoTFG/" son material de origen: comprueba que no rompen el build ni se cuelan en la web; no las borres.
7. No hagas commit.
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
        paginasMdx: { type: 'number' },
        tutor: { type: 'string', description: 'Tamaño del texto para el tutor frente al límite y qué queda fuera' },
        restosProhibidos: { type: 'string' },
        salidaErrores: { type: 'string' },
      },
      required: ['resumen', 'arreglos', 'validadorOk', 'typecheckOk', 'buildOk', 'paginasMdx', 'tutor', 'restosProhibidos', 'salidaErrores'],
    },
  })

return { bloques: hechos, indices, coherencia, integracion }
