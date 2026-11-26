export const meta = {
  name: 'apuntes-2dam-pulido-restante',
  description: 'Pulido y verificación de tests de los 5 bloques que se saltaron (compose, arquitectura, para-el-proyecto, backend-proyecto, angular) y build final',
  phases: [
    { title: 'Pulido', detail: '5 bloques: interactividad, diseño y MDX' },
    { title: 'Tests', detail: 'verificador independiente de respuestas por bloque' },
    { title: 'Integración', detail: 'validador, typecheck y build' },
  ],
}

const A = args
const ESCRITURA = `
CÓMO ESCRIBIR (lee content/docs/guia-autor/componentes.mdx —catálogo de TODOS los componentes, incluidos NoDadoEnClase, Dudoso, NoSeVio, DeClase, Comparar/Lado, Recorrido/Paso, Flujo/Mensaje— y content/docs/guia-autor/plantilla.mdx):
- Cada página: frontmatter con title y description, secciones claras, código con título, y al final <Quiz> (con <Explicacion>), <Flashcards>, uno o dos <Ejercicio> con <Pista> y <Solucion>, y <MarcarCompletado />.
- Interactivo y visual donde aporte de verdad (Flujo, Recorrido, Comparar, CompletarCodigo, Terminal, Mermaid, Concepto, Tabs, Steps, Files, demos a medida), no por rellenar.
- Demos a medida: en components/temas/<bloque>/*.tsx ('use client' si tienen estado), importadas desde el MDX, NO registradas en components/mdx.tsx. Estilo: tokens de Fumadocs, bordes de 1px, sin degradados, brillos, glassmorphism, sombras de color, iconos en cajitas de color ni emojis; reutiliza components/interactive/estilos.ts. Animaciones con motion/react, con sentido y respetando useReducedMotion. Móvil sin scroll horizontal, teclado y foco visible. Nada de Math.random/Date en render. Un solo aria-live fijo por demo (no dentro de elementos que se montan/desmontan).
- El texto importante también en el MDX (el Tutor IA y el buscador leen el MDX).
- MDX: escapa {, } y < en el texto; cierra etiquetas; Mermaid en template literal.
- Iconos del frontmatter: solo nombres que existan en el objeto icons de lucide-react instalado (p. ej. TriangleAlert, Filter, Waves o KanbanSquare NO existen; usa TriangleExclamationPoint, Funnel, WavesHorizontal, SquareKanban).
- Enlaces internos absolutos y solo a páginas que existan (compruébalo).
- VALIDA: node "${A.validador}" <tu carpeta>. Para .tsx: npx tsc --noEmit.
- PROHIBIDO: npm run build, npm run dev, git commit/checkout/stash/reset/merge. Hay otros agentes editando otras carpetas: edita SOLO tus archivos. No toques components/mdx.tsx, components/interactive/*, app/*, ni index.mdx/meta.json de nivel de asignatura.
- Sin nombres de profesores ni de alumnos, sin emojis, español de España tuteando. Versiones de clase: Angular 19, Room 3 (androidx.room3), Retrofit 3 con Gson, Prisma 6, Zod 4, Express 5, Hilt 2.60.1, Navigation 2.10.2, DataStore 1.3.0, KSP 2.3.12, Kotlin 2.4.
`
const BLOQUES = [
  { key: 'compose', carpeta: 'content/docs/2-dam/kotlin/compose', titulo: 'Kotlin y Jetpack Compose',
    alcance: 'Kotlin para quien viene de Java, proyecto Android y Gradle, Jetpack Compose (composables, layouts, Modifier, estado y recomposición, Material 3, listas). Nota: la revisión de coherencia acaba de recortar la sección de localización de proyecto-y-gradle.mdx para enlazar a para-el-proyecto; no la vuelvas a ampliar.' },
  { key: 'arquitectura', carpeta: 'content/docs/2-dam/kotlin/arquitectura', titulo: 'Arquitectura Android: ViewModel, Hilt y navegación',
    alcance: 'Capas, ViewModel con StateFlow, estados de pantalla, Hilt y sus módulos, navegación con rutas tipadas, ToDoApp de clase.' },
  { key: 'para-el-proyecto-android', carpeta: 'content/docs/2-dam/kotlin/para-el-proyecto', titulo: 'Android para el proyecto (no dado en clase)',
    alcance: 'Todo "Lo que falta por dar - Android.md", requisitos de la app Android con su estado y errores típicos de Android. Casi todo va con <NoDadoEnClase>. Nota: offline-first.mdx se acaba de recortar para enlazar al código de clase de /docs/2-dam/kotlin/datos/offline-first en vez de duplicarlo; no lo vuelvas a duplicar.' },
  { key: 'backend-proyecto', carpeta: 'content/docs/2-dam/apis/backend-proyecto', titulo: 'Backend para el proyecto (no dado en clase)',
    alcance: 'Apartados 1 a 8 de "Lo que falta por dar - backend y Angular.md", requisitos e hitos de Acceso a Datos (parte de backend) y errores típicos del backend.' },
  { key: 'angular', carpeta: 'content/docs/2-dam/acceso-a-datos/angular', titulo: 'Angular: componentes, plantillas y servicios',
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
  b => agent(`Eres el REVISOR DE PULIDO del bloque "${b.titulo}" de los apuntes de 2º DAM (lee el CLAUDE.md del repo). El contenido está escrito y su fidelidad revisada; un pulido anterior se quedó a medias: revisa TODO. Tus archivos (solo puedes editar estos): ${propios(b)}.
Alcance del bloque: ${b.alcance}
${ESCRITURA}
NO cambies el contenido técnico ni quites marcas <NoDadoEnClase>, <Dudoso>, <NoSeVio>, <DeClase>. Céntrate en:
1. Experiencia de estudio: ¿se entiende a la primera? ¿orden lógico, secciones cortas, ejemplos? ¿cada página tiene Quiz, Flashcards, Ejercicio y MarcarCompletado? ¿el meta.json del bloque ordena bien las páginas y el index.mdx del bloque enlaza a todas?
2. Interactividad: al menos un elemento interactivo o visual que explique algo de verdad en cada página. Si una página es un muro de texto, añade algo que aporte. Si una demo es decorativa o confusa, mejórala o quítala. Si añades preguntas o ejercicios nuevos, comprueba que su respuesta es correcta.
3. Código de components/temas/${b.key}/: estilo de la web, móvil, teclado y foco, prefers-reduced-motion, accesibilidad (aria-live fijo, roles ARIA con el teclado que esperan), sin errores de React (keys, efectos, hidratación). npx tsc --noEmit sin errores en tus archivos.
4. node "${A.validador}" ${b.carpeta} debe pasar entero.
NO ejecutes build/dev ni git que cambie el árbol. Devuelve el informe.`,
    { label: `pulido:${b.key}`, phase: 'Pulido', schema: SCHEMA_REV }),
  (pul, b) => agent(`Eres un VERIFICADOR INDEPENDIENTE de los tests del bloque "${b.titulo}" (carpeta ${b.carpeta}). Los alumnos estudian con estas respuestas, así que una respuesta mal marcada es grave.
Para CADA página del bloque: localiza cada <Quiz>/<Pregunta> (las opciones correctas llevan la prop que indica content/docs/guia-autor/componentes.mdx), cada <Tarjeta> de Flashcards, cada <Ejercicio> con su <Solucion>, cada <CompletarCodigo>, y los pasos de <Recorrido> (que el rango de líneas coincida con lo que explica). Resuélvelo TÚ primero sin mirar qué está marcado; luego compara. Sé escéptico: opciones "incorrectas" que también son correctas, explicaciones que contradicen la respuesta, soluciones que no compilan para las versiones del curso (Angular 19, Room 3, Retrofit 3, Prisma 6, Zod 4, Express 5, Kotlin 2.4, Hilt 2.60.1, Navigation 2.10.2), soluciones que omiten partes del código de la página y dejarían de compilar si se copian (p. ej. un modelo que pierde un lado de una relación), y respuestas que contradicen lo explicado en la propia página.
Corrige solo lo que esté MAL (no reescribas por estilo) en ${b.carpeta}/. No quites marcas <NoDadoEnClase>, <Dudoso>, <NoSeVio>, <DeClase>. Valida con node "${A.validador}" ${b.carpeta}. NO ejecutes build/dev ni git que cambie el árbol.
Devuelve en correcciones cada fallo encontrado con archivo y qué se cambió.`,
    { label: `tests:${b.key}`, phase: 'Tests', schema: SCHEMA_REV }).then(tests => ({ bloque: b.key, pul, tests })),
)
const hechos = bloques.filter(Boolean)
if (hechos.length < BLOQUES.length) log(`Atención: no completaron: ${BLOQUES.filter(b => !hechos.find(h => h.bloque === b.key)).map(b => b.key).join(', ')}`)

phase('Integración')
const integracion = await agent(`Eres el INTEGRADOR final de la web de apuntes (lee CLAUDE.md). Acaban de pulirse y revisarse los tests de 5 bloques de 2º DAM. Antes de esto el build pasaba. Eres el único agente trabajando: puedes editar cualquier archivo.
Problemas que dejaron los revisores: ${JSON.stringify(hechos.map(h => ({ bloque: h.bloque, restantes: [...(h.pul?.problemasRestantes || []), ...(h.tests?.problemasRestantes || [])] })))}
1. node "${A.validador}" content/docs → arregla todo lo que falle.
2. npm run typecheck → arregla todo.
3. npm run build → arregla hasta que pase, sin avisos de "[lucide-icons-plugin] Unknown icon". (El aviso "[config] Supabase NO configurado" es normal en local.) Si hay un next start o un node vivo en algún puerto de una sesión anterior, no lo toques salvo que bloquee el build.
4. Grep rápido de restos prohibidos en content/ y components/temas/: emojis, gradient, backdrop-blur, shadow-, y "Juan Antonio" / "Nieto".
5. No hagas commit.
Devuelve el informe.`,
  {
    label: 'integrador',
    phase: 'Integración',
    schema: {
      type: 'object',
      properties: {
        resumen: { type: 'string' },
        arreglos: { type: 'array', items: { type: 'string' } },
        validadorOk: { type: 'boolean' },
        typecheckOk: { type: 'boolean' },
        buildOk: { type: 'boolean' },
        salidaErrores: { type: 'string' },
      },
      required: ['resumen', 'arreglos', 'validadorOk', 'typecheckOk', 'buildOk', 'salidaErrores'],
    },
  })

return { bloques: hechos, integracion }
