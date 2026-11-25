# Requisitos del proyecto y dónde se dieron en clase

Por cada requisito: en qué clase salió (con la fecha, para buscarlo en `Clases/`) y qué falta para cumplirlo. Lo que falta está explicado, con código, en `Lo que falta por dar - Android.md` y en `Lo que falta por dar - backend y Angular.md`.

Leyenda: ✅ se dio entero · 🟡 se dio a medias · ❌ no se ha dado.

## App Android (PMDMO y PSPRO)

| Requisito | Estado | Dónde se dio | Qué falta |
|---|---|---|---|
| Room (entidades y relaciones) | 🟡 | 13/11: Room 3 con KSP y Hilt, `@Entity`, `@Dao`, `@Database`. 16/11: PokeApp leyendo de Room (3 minutos). | Las relaciones (`ForeignKey`, `@Relation`), las `@Query` corregidas y leer de Room con `Flow`. Ver Android, apartados 3 y 4. |
| Retrofit o Ktor contra vuestra API | 🟡 | 26/10: Retrofit 3 con Gson, `Response<T>`, DataSource y `toModel()`. 09/11: con `Flow`. | En clase solo `GET` contra PokeAPI. Faltan `POST`, `PUT` y `DELETE`, llamar a vuestra API desde el emulador y mandar el token. Ver Android, apartados 6, 7 y 8. |
| Dos CRUD en modelos relacionados | 🟡 | ToDoApp (09/10 a 23/10): crear, listar y ver detalle de tareas en memoria. | Editar y borrar, y que los dos modelos estén relacionados (en Room y en la API). |
| Navegación con Compose | ✅ | 09/10: rutas tipadas, `NavHost` y `toRoute`. 09/11: `savedStateHandle.toRoute`. 18/11: grafos anidados. | No obligatorio, pero casi todas las apps lo necesitan: barra inferior, login con `popUpTo` y volver atrás después de guardar. Ver Android, apartados 9 y 10. |
| Material 3 | ✅ | Todo el curso. 18/11: `TopAppBar`. | Nada. |
| Hilt en repositorios, ViewModels y red | ✅ | 09/10: `@Binds` y `@HiltViewModel`. 26/10: `NetworkModule` con `@Provides` y `@HiltAndroidApp`. 13/11: módulo de Room. | Poner `@Singleton` en los `@Provides` de Retrofit y Room (en clase no lo llevaban). |
| ViewModel para el estado | ✅ | 07/10, 16/10 (`StateFlow`), 23/10 (estados sellados) y 09/11 (`stateIn`). | Nada. |
| Corrutinas | ✅ | 23/10: `suspend` y `viewModelScope.launch`. 09/11: `Flow` y por qué no `GlobalScope`. | Capturar los errores de red para que la app no se caiga. Ver Android, apartado 4. |
| Localización inglés y español | ❌ | 07/10: solo se nombra `stringResource`. | Todo. Ver Android, apartado 2. |
| Intent implícito | ❌ | Nunca. | Todo. Ver Android, apartado 1. |
| DataStore para preferencias | 🟡 | 18/11: modo oscuro con `booleanPreferencesKey`. | No se ve el módulo que crea el `DataStore` ni cómo llega el modo oscuro al tema. Ver Android, apartado 5. |

## Backend y base de datos (Acceso a Datos)

Es la tabla de la sección 8 de los requisitos.

| Requisito | Estado | Dónde se dio | Qué falta |
|---|---|---|---|
| PostgreSQL | ✅ | 20/10: Postgres 16 en `docker-compose.yml`. 03/11: Supabase. | Nada. |
| Prisma o TypeORM | ✅ | 27/10: `schema.prisma` y migración `init`. 03/11: migraciones, drift y `db pull`. | Nada. |
| Varias entidades relacionadas | 🟡 | El repositorio del profesor solo tiene `User` (y `Media`, con su FK a `User`, en la v1.1). | Vuestro modelo, con varias relaciones y qué pasa al borrar (`onDelete`). Ver backend, apartado 1. |
| Relaciones 1 y N | 🟡 | Igual que la fila anterior. | Igual que la fila anterior. |
| Migraciones | ✅ | 27/10 y 03/11. | Nada. Subid la carpeta `prisma/migrations` al repositorio. |
| Seed de datos | ❌ | Nunca. | Todo. Ver backend, apartado 2. |
| Operaciones CRUD | ✅ | 27/10: módulo `users` con routes, controller, service y schema. P2025 → 404 y P2002 → 409. | Nada. |
| Consultas relacionales y por criterios | 🟡 | Solo el `select` que quita `passwordHash`. | `include`, `where` y `_count`. Ver backend, apartado 4. |
| Búsqueda y filtrado | ❌ | En el backend, nunca. En Angular (12/11) solo con JSON Server (`_page`, `_limit`). | Todo, hecho con Prisma. Ver backend, apartado 3. |
| Ordenación y paginación | ❌ | Igual que la fila anterior. | Igual que la fila anterior, y devolver el total. |
| API REST | ✅ | 20/10 a 03/11. | Nada. |
| Validación en el backend | ✅ | 27/10: Zod 4 y el middleware `validate`. | Validar también los query params del listado. Ver backend, apartado 3. |
| Gestión de errores | ✅ | 20/10: `errorHandler`. 27/10: códigos de Prisma. 03/11: Winston. | Nada. Ver backend, apartado 6, si queréis una clase de error propia. |
| Operación de negocio | ❌ | Nunca. | Todo. Ver backend, apartado 5. |
| Transacciones | ❌ | Nunca. | Todo. Ver backend, apartado 5. |
| Consumo de la API desde Angular | 🟡 | 27/10 y 28/10: servicios con `HttpClient` contra JSONPlaceholder, Fake Store y JSON Server. | Contra vuestra API: CORS (salió el error el 18/11) y el token. Ver backend, apartados 7 y 8. |
| Variables de entorno | ✅ | 20/10: `env.ts` y dotenv. | Nada. |

## Web Angular (sección 2 de los requisitos)

| Requisito | Estado | Dónde se dio | Qué falta |
|---|---|---|---|
| Navegación entre vistas (Router) | ✅ | 27/10: `loadComponent`. 19/11: `provideRouter`, rutas hijas y `routerLinkActive`. | `:id`, query params y `**` solo salen en el enunciado de la Act 12. Están en la guía `9_Routing.md`. |
| Componentes reutilizables | ✅ | 14/10: padre e hijo. 12/11: `input.required` y `output`. | Nada. |
| Listados y detalle | ✅ | `proj-fakestore` y `proj-game`. | Nada. |
| Formularios de crear y editar | ✅ | 05/11 y 12/11 (template-driven). 18/11: reactivos. | Nada. Se valoran los reactivos. |
| Borrar con confirmación | 🟡 | Solo en la guía: `confirm()` dentro de un `CanDeactivate`. | Ver backend y Angular, apartado 9. |
| Búsqueda, filtro y orden | 🟡 | 12/11: buscar por id y paginar con JSON Server. | Mandar los criterios a vuestra API. Ver backend y Angular, apartado 9. |
| Paginación | 🟡 | 12/11: `_page`, `_limit` y `observe: 'response'`. | Igual que la fila anterior. |
| Estados de carga, vacío y error | 🟡 | 27/10: las plantillas las generó la IA de Cursor. | Ver backend y Angular, apartado 9. |
| HTTP solo en servicios | ✅ | 27/10 y 28/10. | Nada. |
| Validación con mensajes | ✅ | 05/11 y 18/11. | Nada. |

## Lo que os pueden pedir en la defensa

Los requisitos dicen que "se pueden solicitar demostraciones prácticas". Lo más probable, por requisito:

- **Room:** añadir un campo a una entidad. Si no, la app se cae al abrirla porque la base guardada en el móvil ya no coincide. Hay que subir `version` en `@Database` y dar una migración; en desarrollo basta con desinstalar la app.
- **Retrofit:** añadir un endpoint nuevo a la interfaz y llamarlo desde el repositorio.
- **Hilt:** explicar quién crea cada objeto. Por ejemplo, cómo llega el DAO al repositorio sin hacer `new`.
- **ViewModel y estado:** girar el móvil y ver que no se pierde nada.
- **Corrutinas:** quitar el wifi y enseñar que la app no se cae.
- **Localización:** cambiar el idioma del emulador.
- **Intent:** pulsar el botón y que se abra la otra app.
- **DataStore:** cambiar una preferencia, cerrar la app y volver a abrirla.
- **Prisma:** añadir un campo, crear la migración y enseñar el SQL que genera.
- **Seed:** `npx prisma migrate reset` y ver que la base vuelve con datos.
- **Listado:** cambiar el filtro en Angular y enseñar la petición en la pestaña Red del navegador (los parámetros viajan en la URL).
- **Transacción:** forzar un error en mitad de la operación y comprobar que no se guardó nada.
- **Errores HTTP:** provocar un 400 (dato mal), un 404 (id que no existe) y un 409 (duplicado).
