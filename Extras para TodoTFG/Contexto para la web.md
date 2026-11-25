# Contexto para quien haga la web con estos apuntes

Esto es para pasárselo a la IA (o a la persona) que convierta los apuntes en una web. Explica cosas que no se ven mirando los archivos.

## De dónde sale el material
- El código de "Lo dado en clase" y de `Clases/` está sacado de **capturas de los vídeos de clase**, no de los repositorios del profesor, que no son públicos. Solo lo son `github.com/hokahey007/guides-angular` y `github.com/hokahey007/codebase-angular`.
- Hay unas 175 marcas **`[dudoso]`**: cosas que no se leían bien en las capturas. **Que se vean en la web** (por ejemplo, con un aviso al lado) y que no se corrijan por cuenta propia.
- **No hay que rellenar el código que falta.** Cada resumen tiene una sección "Dudas y lagunas" con lo que no se llega a ver. En la web, poned que no se vio; no lo escribáis como si fuera del profesor.
- Si un archivo de `Clases/` no dice lo mismo que el resumen general ("Lo dado en clase de …"), **vale el resumen**, que es el revisado. Su sección 1 dice qué se corrigió.

## Qué es de clase y qué no
- **Separad siempre lo dado en clase de lo que no.** Lo de clase está en "Lo dado en clase de …" y en `Clases/`. Lo que no se ha dado está en los archivos "Lo que falta por dar - …", que empiezan con un aviso. Que en la web se distinga a simple vista (por ejemplo, con una etiqueta "No dado en clase").
- La sección "Prácticas raras del código de clase" son cosas que se hicieron así en directo pero que no conviene copiar. Ponedlas como aviso, no como el patrón bueno. Cómo se hacen bien está en `Lo que falta por dar - Android.md`, apartado 11.
- **No cambiéis las versiones** aunque haya otras más nuevas: Angular 19, Room 3 (`androidx.room3`), Retrofit 3 con Gson, Prisma 6, Zod 4 y Express 5. Room 3 y Room 2 no se escriben igual (`@Relation` cambia), y casi todo lo que hay en internet es de Room 2.
- El código de los archivos "Lo que falta por dar" está compilado con esas versiones. Si se cambia algo, que siga compilando.

## Para quién es
- Para alumnos de 2º de DAM que ya saben programar en Java. Explicad Kotlin, Compose, Angular, Node y Prisma, pero no la programación básica (qué es un bucle o una clase).
- Todo en español.
- Las guías de Angular son una copia de `github.com/hokahey007/guides-angular`: enlazad al original.

## Cómo está organizado
- `Lo dado en clase de Android.md` y `Lo dado en clase de Angular, backend y C#.md`: el temario por fechas, los conceptos, los patrones de código del profesor y las versiones.
- `Clases/`: el detalle de cada clase.
- `Requisitos/`: lo que piden los profesores.
- `Requisitos y dónde se dieron.md`: cada requisito, en qué clase salió y qué falta. Es buena página de inicio para la web.
- `Lo que falta por dar - Android.md` y `Lo que falta por dar - backend y Angular.md`: cómo hacer lo que piden y no se ha dado.
- `Errores típicos.md`: errores con su mensaje y su solución. Los que tienen 🎓 salieron en clase.
- `Glosario.md`: las palabras raras en una línea.
- `Material de clase/`: la ToDoApp explicada, el manual de arquitecturas y las guías de Angular.
