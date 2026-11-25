# Errores típicos y cómo se arreglan

Cada error con el mensaje que sale (o lo que se ve), por qué pasa y qué hacer. Los marcados con 🎓 salieron en clase; el resto son de hacer el proyecto.

## Android

**Red y API**
- **`CLEARTEXT communication to 10.0.2.2 not permitted by network security policy`**: Android no deja usar `http`, solo `https`. Hay que permitirlo para vuestro ordenador con `network_security_config.xml` (Android, apartado 6).
- **`Failed to connect to localhost/127.0.0.1:3000`**: en el emulador, `localhost` es el propio emulador. Usad `10.0.2.2`. En un móvil de verdad, la IP del ordenador en la wifi.
- **`SecurityException: Permission denied (missing INTERNET permission?)`** 🎓: falta `<uses-permission android:name="android.permission.INTERNET" />` en el manifest.
- **`IllegalArgumentException: baseUrl must end in /`**: la `baseUrl` de Retrofit tiene que acabar en `/`, y las rutas de `@GET` no deben empezar por `/`.
- **`Expected BEGIN_OBJECT but was BEGIN_ARRAY`** (o al revés): el tipo de la función de Retrofit no coincide con el JSON. Pasa mucho con los listados paginados: la API devuelve `{ "items": [...], "total": ... }` (un objeto) y la función dice `List<ProductoDto>` (una lista).
- **Los datos llegan pero las propiedades salen `null` o `0`**: el nombre de la propiedad no es igual que en el JSON (por ejemplo, `imageUrl` y `image_url`). Se arregla con `@SerializedName("image_url")`.
- **Todo va bien en debug, pero en release los DTO llegan vacíos**: R8 renombra las propiedades al optimizar y Gson ya no las encuentra. Hay que poner `@Keep` en los DTO o reglas de ProGuard para ellos.

**Hilt**
- **`Cannot create an instance of class ...ViewModel`** con **`NoSuchMethodException`** 🎓: al ViewModel le falta `@HiltViewModel` o el `@Inject constructor`, o la pantalla lo crea con `viewModel()` en vez de con `hiltViewModel()`.
- **`Hilt Activity must be attached to an @HiltAndroidApp Application`**: falta `android:name=".MainApplication"` en el manifest, o la clase `Application` no tiene `@HiltAndroidApp`. 🎓 El 26/10 se le puso `@AndroidEntryPoint` por error: esa anotación es para la Activity.
- **`[Dagger/MissingBinding] ... cannot be provided without an @Provides-annotated method`**: Hilt no sabe crear algo que se pide. Normalmente falta el `@Binds` de una interfaz o el `@Inject constructor` de una clase.
- **`[Dagger/DuplicateBindings]`**: dos módulos dan lo mismo (por ejemplo, dos `@Provides` de `DataStore<Preferences>`). Dejad solo uno.

**Room**
- **`Room cannot verify the data integrity. Looks like you've changed schema but forgot to update the version number`**: habéis cambiado una entidad y en el móvil sigue la base vieja. Subid `version` en `@Database` y añadid una migración. En desarrollo, basta con desinstalar la app.
- **Errores de KSP con el SQL de una `@Query`** 🎓: Room comprueba las consultas al compilar. Los nombres de tablas no pueden ser parámetros: el `FROM :pokemon` de clase tenía que ser `FROM pokemon`.
- **`Cannot have empty 'parentColumns' in @Relation`**: estáis usando Room 3 con la forma de Room 2. En Room 3 es `@Relation(parentColumns = ["id"], entityColumns = ["categoriaId"])`.
- **`FOREIGN KEY constraint failed (code 787)`**: se guarda un hijo cuyo padre aún no está. Guardad antes los padres (las categorías y después los productos).
- **Al refrescar desaparecen los hijos**: `@Insert(onConflict = REPLACE)` en una tabla padre borra la fila y la vuelve a crear, y `CASCADE` se lleva los hijos por delante. Usad `@Upsert`.
- **`Schema export directory was not provided`** 🎓: es un aviso. Se quita con `exportSchema = false` en `@Database`.

**Gradle y compilación**
- **`Unresolved reference: collectAsStateWithLifecycle`**: falta la dependencia `lifecycle-runtime-compose`.
- **`Unresolved reference: Icons`** (o `Home`, `Settings`…): falta `androidx.compose.material:material-icons-core`, sin versión, porque la pone el BOM de Compose.
- **`Unresolved reference: BuildConfig`**: falta `buildConfig = true` en `buildFeatures`, o no habéis compilado después de añadir el `buildConfigField`.
- **KSP falla al sincronizar el proyecto**: usad la versión de KSP de clase (2.3.12). Las versiones antiguas, del tipo `2.0.21-1.0.28`, solo funcionan con una versión concreta de Kotlin.
- **`INSTALL_FAILED_OLDER_SDK` en vuestro móvil**: en clase se puso `minSdk 35` 🎓, que solo instala en Android 15 o más. Bajadlo (26 vale para todo lo de clase).

**Pantalla**
- **Hueco doble arriba o abajo**: hay un `Scaffold` dentro de otro y los dos dejan sitio para la barra de estado. Pasad `Modifier.consumeWindowInsets(innerPadding)` junto al `padding`, o quitad uno de los dos.
- **La pantalla carga una y otra vez** 🎓: se llama a `load()` dentro del composable, que se ejecuta en cada recomposición. Ponedlo en el `init` del ViewModel.
- **La pantalla se queda en blanco al arrancar** 🎓: carga de datos con `CoroutineScope(Dispatchers.IO).launch` en el `init` del repositorio. Usad `viewModelScope.launch` en el ViewModel.

## Backend (Node, Express y Prisma)

**Arrancar el proyecto**
- **`This is not the tsc command you are looking for`** 🎓: se instaló el paquete `tsc`, que no es TypeScript. `npm uninstall tsc` y `npm install -D typescript`.
- **`@prisma/client did not initialize yet. Please run "prisma generate"`**, o en los tests **`Must use import to load ES Module ... .prisma/client/default.js`**: después de `npm ci` o `npm install` hay que ejecutar `npx prisma generate`. También hace falta cada vez que se cambia el `schema.prisma`.
- **`does not provide an export named 'default'`** 🎓: un archivo sin guardar, o se importa por defecto (`import app from`) algo que se exporta con nombre (`export const app`).
- **`Cannot find module '.../app' imported from ...`** (`ERR_MODULE_NOT_FOUND`): con `"type": "module"`, los imports de vuestros archivos llevan `.js` al final (`'./app.js'`), aunque el archivo sea `.ts`.
- **Falla al arrancar diciendo que falta una variable**: el `env.ts` de clase se para si falta algo en el `.env` (casi siempre `JWT_SECRET` o `DATABASE_URL`). Copiad el `.env.example` a `.env` y rellenadlo.
- **`EADDRINUSE: address already in use :::3000`**: ya hay otro servidor en ese puerto (normalmente, uno que dejasteis abierto en otra terminal). Cerradlo o cambiad el puerto.

**Base de datos**
- **`P1001: Can't reach database server`**: Postgres no está arrancado (abrid Docker Desktop y `docker compose up -d`) o la `DATABASE_URL` tiene mal el puerto o la contraseña.
- **`migrate dev` dice que hay *drift* y quiere borrar la base** 🎓: alguien cambió la base a mano, fuera de las migraciones. En desarrollo, `npx prisma migrate reset`. No toquéis las tablas a mano.
- **Con Supabase, `migrate` se queda colgado o falla**: las migraciones no van bien por el pooler. Añadid `directUrl = env("DIRECT_URL")` en el `datasource` con la conexión directa (puerto 5432), y en la `DATABASE_URL` del pooler (puerto 6543) poned `?pgbouncer=true` al final.
- **El precio llega como `"59.9"` (texto)**: es normal. Prisma manda los `Decimal` como texto para no perder decimales. Convertidlo en el cliente.

**Peticiones**
- **`req.body` es `undefined`**: falta `app.use(express.json())` antes de las rutas, o en Postman el body no está en *raw → JSON*.
- **`Missing parameter name at ...`** al arrancar: en Express 5, `app.get('*', ...)` ya no vale. Se escribe `app.get('/{*splat}', ...)`.
- **Swagger sale en blanco**: Helmet manda la cabecera `upgrade-insecure-requests` y el navegador intenta cargar Swagger por `https`. 🎓 En clase se puso `helmet({ contentSecurityPolicy: false })`; mejor quitarlo solo para `/api-docs`.
- **Los tests dan `429 Too Many Requests`**: salta el límite de peticiones. 🎓 En clase se desactiva el limitador cuando `NODE_ENV=test`.

## Angular

- **`NullInjectorError: No provider for HttpClient`**: falta `provideHttpClient()` en `app.config.ts` (🎓 es una de las preguntas de la Act 8).
- **`Can't bind to 'routerLink'`, `'formControl'` o `'ngModel'` `since it isn't a known property`**: falta importar `RouterLink`, `ReactiveFormsModule` o `FormsModule` en el `imports` del componente.
- **`NG8003: No directive found with exportAs 'ngModel'`** 🎓: queda un `#x="ngModel"` después de pasar a formularios reactivos.
- **Error NG1 con una propiedad `private`** 🎓: la plantilla no puede leer propiedades `private`. Usad `protected`.
- **Sale `[Function]` o el texto de una función en la pantalla**: un `signal` se lee llamándolo, `{{ total() }}`, no `{{ total }}`.
- **Los filtros no llegan a la API**: `HttpParams` es inmutable. Hay que escribir `params = params.set(...)`; si solo se escribe `params.set(...)`, se pierde.
- **`Access to XMLHttpRequest ... has been blocked by CORS policy`** 🎓: es del backend, no de Angular. Añadid el origen de la web a la lista de CORS (backend, apartado 7).
- **La web publicada no carga datos** 🎓: sigue llamando a `localhost:3000`. En producción, la URL de la API tiene que ser la de la API desplegada.
- **`Mixed Content: ... was loaded over HTTPS, but requested an insecure resource`**: la web va por `https` (Vercel) y la API por `http`. La API también tiene que ir por `https`.
- **En Vercel, al recargar en una ruta sale 404** 🎓: falta el `rewrite` de `vercel.json` que manda todas las rutas a `index.html`.

## Git y terminal

- **`LF will be replaced by CRLF`** 🎓: es un aviso de Windows sobre los saltos de línea, no un error. Se puede ignorar.
- **`Your local changes would be overwritten by checkout`**: hay archivos cambiados que no se han guardado en un commit. Muchas veces son archivos de `.idea` que cambia Android Studio solo. Haced commit, `git stash`, o descartadlos con `git restore <archivo>` si no son vuestros.
- **No subáis la configuración local de Android Studio** (`.idea/workspace.xml`, `.idea/appInsightsSettings.xml`, `local.properties`): ponedla en el `.gitignore`.
- **`! [rejected] ... (fetch first)`** al hacer `push`: alguien subió antes que vosotros. `git pull` primero, y después `push`.
- **Habéis subido el `.env`**: añadidlo al `.gitignore` y cambiad las contraseñas y el `JWT_SECRET`. Aunque lo borréis, sigue en el historial.
- **`&&` da error en PowerShell**: en la PowerShell de Windows 10 y 11 (la 5.1) no existe `&&`. Ejecutad los comandos de uno en uno, o separados con `;`. En `cmd` sí funciona `&&`.
- **Pegar varios comandos a la vez en la terminal falla**: pegadlos de uno en uno.
