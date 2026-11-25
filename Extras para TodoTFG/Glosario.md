# Glosario

Las palabras que salen en las clases y en los requisitos, explicadas en una o dos líneas. Por orden alfabético dentro de cada parte.

## Android y Kotlin

- **Activity**: la "ventana" de la app que abre Android. Con Compose suele haber una sola, `MainActivity`, y dentro se cambian las pantallas con la navegación.
- **Backing property (`_x` y `x`)**: un `_estado` privado que el ViewModel puede cambiar (`MutableStateFlow`) y un `estado` público que la pantalla solo puede leer (`StateFlow`).
- **BOM de Compose**: una dependencia que fija las versiones de todas las librerías de Compose a la vez, para que sean compatibles. Por eso esas librerías van sin versión.
- **`BuildConfig`**: una clase que Gradle genera al compilar con los valores de `buildConfigField` (por ejemplo, la `BASE_URL`).
- **Callback**: una función que se pasa como parámetro (`onVolver: () -> Unit`) para que la pantalla avise de que ha pasado algo sin saber qué se hará después. Así las pantallas no conocen el `navController`.
- **`compileSdk`, `minSdk` y `targetSdk`**: con qué versión de Android se compila, la versión más antigua en la que se instala la app y para cuál está pensada.
- **Composable**: una función con `@Composable` que pinta un trozo de pantalla. Se vuelve a ejecutar cuando cambia el estado que lee.
- **Corrutina**: una tarea que puede esperar (a la red o a la base de datos) sin bloquear la pantalla. Se lanza con `viewModelScope.launch { }`.
- **DAO**: la interfaz de Room con las consultas (`@Query`, `@Insert`…). Room escribe el código que la implementa.
- **`data class`**: una clase para guardar datos. Kotlin le añade solo `equals`, `toString` y `copy()`.
- **DataSource**: la clase que habla con una sola fuente de datos (la API o Room). El repositorio usa uno o varios.
- **DataStore**: guarda preferencias pequeñas (modo oscuro, idioma, token) en un archivo del móvil. Sustituye a `SharedPreferences`.
- **DTO**: la clase que tiene la misma forma que el JSON de la API. Se pasa al modelo de la app con `toModel()`.
- **Entity**: una clase con `@Entity` que es una tabla de Room.
- **`Flow`**: un valor que va cambiando con el tiempo y avisa cada vez que cambia. Room devuelve `Flow` para que la pantalla se actualice sola.
- **Gradle**: la herramienta que descarga las librerías y compila la app. Se configura en los `build.gradle.kts` y en `libs.versions.toml`.
- **Hilt**: la librería de inyección de dependencias de Android. Crea los objetos (repositorios, Retrofit, Room…) y se los pasa a quien los pide.
- **Intent implícito**: pedirle a Android una acción (llamar, abrir un mapa, compartir) sin decir qué app la hace. El explícito dice la pantalla exacta.
- **Inyección de dependencias**: que una clase reciba lo que necesita en el constructor en vez de crearlo ella. Así se puede cambiar una pieza (por ejemplo, el repositorio en memoria por el de Room) sin tocar el resto.
- **Interceptor**: una clase de OkHttp por la que pasan todas las peticiones antes de salir. Se usa para añadir el token o para escribir las peticiones en el Logcat.
- **KSP**: el procesador que lee las anotaciones (`@Dao`, `@HiltViewModel`…) y genera código al compilar. Lo usan Room y Hilt.
- **`LaunchedEffect`**: ejecuta un bloque en un composable solo cuando cambia la clave que se le pasa, no en cada recomposición.
- **Logcat**: la ventana de Android Studio donde salen los mensajes y los errores de la app que se está ejecutando.
- **Mapper (`toModel()`, `toEntity()`)**: funciones de extensión que pasan un objeto de una capa a otra (de DTO a modelo, de modelo a entidad).
- **Material 3**: el sistema de diseño de Google. En Compose son los componentes `Button`, `Card`, `Scaffold`, `NavigationBar`…
- **`NavHost`**: el composable que enseña una pantalla u otra según la ruta actual.
- **Offline first**: la app lee siempre de la base local (Room) y la actualiza desde la API cuando puede. Sin internet, enseña lo último que guardó.
- **R8**: la herramienta que reduce y ofusca el código en las versiones release. Puede romper Gson si no se protegen los DTO.
- **Recomposición**: cuando Compose vuelve a ejecutar un composable porque ha cambiado algo que lee.
- **Repositorio**: la clase que decide de dónde salen los datos (API, Room o memoria). La pantalla y el ViewModel solo conocen su interfaz.
- **Retrofit**: la librería que convierte una interfaz de Kotlin (`@GET`, `@POST`…) en llamadas a una API.
- **Room**: la base de datos local de Android (SQLite por debajo), con clases y anotaciones en vez de SQL a mano.
- **Ruta tipada**: una ruta de navegación que es una clase (`Route.Detail(id = 3)`) en vez de un texto. Si falta un argumento, no compila.
- **`sealed class` / `sealed interface`**: un tipo con una lista cerrada de opciones (`Loading`, `Success`, `Error`). El `when` avisa si falta alguna.
- **`StateFlow`**: un `Flow` que siempre tiene un valor actual. Es lo que el ViewModel enseña a la pantalla.
- **`stateIn`**: convierte un `Flow` en un `StateFlow`, con un valor inicial y un tiempo para dejar de escuchar cuando no hay nadie mirando.
- **`suspend`**: una función que puede esperar sin bloquear. Solo se puede llamar desde una corrutina o desde otra función `suspend`.
- **ViewModel**: la clase que guarda el estado de una pantalla y sobrevive al giro del móvil.
- **`viewModelScope`**: el ámbito de corrutinas del ViewModel. Lo que se lance ahí se cancela solo cuando la pantalla se cierra del todo.

## Backend

- **API REST**: un servidor al que se le piden datos por HTTP con URLs de recursos (`/api/productos/3`) y verbos (`GET`, `POST`, `PUT`, `PATCH` y `DELETE`). Responde en JSON.
- **bcrypt**: la librería que convierte la contraseña en un *hash* que no se puede deshacer. En la base nunca se guarda la contraseña tal cual.
- **Código de estado HTTP**: el número que acompaña a cada respuesta. 2xx va bien, 4xx es culpa de quien pide y 5xx es culpa del servidor.
- **Controlador**: la capa que recibe la petición, valida los datos, llama al servicio y elige el código de la respuesta.
- **CORS**: la regla de los navegadores que impide que una web lea respuestas de otro dominio sin permiso del servidor. No afecta a Android ni a Postman.
- **Docker / Docker Compose**: ejecuta programas (Postgres, la API) en contenedores, sin instalarlos en el ordenador. Compose arranca varios a la vez con `docker-compose.yml`.
- **Drift**: cuando la base de datos ya no coincide con las migraciones, porque alguien la cambió a mano.
- **`.env` y dotenv**: el archivo con las contraseñas y la configuración (no se sube a Git), y la librería que lo lee al arrancar.
- **Endpoint**: una ruta concreta de la API con su verbo, por ejemplo `GET /api/productos`.
- **Express**: el framework de Node para hacer servidores. Se le dicen las rutas y qué función responde a cada una.
- **Helmet**: un middleware que añade cabeceras de seguridad a todas las respuestas.
- **Introspección (`prisma db pull`)**: leer una base que ya existe y generar el `schema.prisma` a partir de ella.
- **JWT**: un token firmado que el servidor da al iniciar sesión. El cliente lo manda en cada petición (`Authorization: Bearer ...`) y el servidor comprueba la firma sin guardar nada.
- **Middleware**: una función que se ejecuta antes del controlador (validar, comprobar el token, escribir en el log…) y decide si la petición sigue con `next()`.
- **Migración**: un archivo SQL con un cambio de la base de datos. Prisma las genera al cambiar el `schema.prisma` y se guardan en el repositorio, en orden.
- **ORM**: una librería que deja trabajar con la base de datos usando objetos en vez de escribir SQL. Prisma es un ORM.
- **Paginación**: devolver los datos por trozos (`skip` y `take`) en vez de todos de golpe, junto con el total.
- **Pooler**: un intermediario que reparte pocas conexiones a la base entre muchas peticiones. Supabase tiene uno.
- **Prisma**: el ORM de clase. El modelo se escribe en `schema.prisma` y genera un cliente con tipos para TypeScript.
- **Rate limiting**: limitar cuántas peticiones puede hacer alguien en un tiempo (para que no prueben miles de contraseñas). Al pasarse se responde `429`.
- **Schema**: en Prisma, el archivo con el modelo de la base. En Zod, la descripción de cómo tienen que ser los datos que llegan.
- **Seed**: un script que llena la base con datos de prueba.
- **Servicio**: la capa con la lógica de negocio y las consultas a Prisma. No sabe nada de `req` ni de `res`.
- **Swagger / OpenAPI**: una página (`/api-docs`) que documenta todos los endpoints y deja probarlos desde el navegador.
- **Transacción**: un grupo de operaciones en la base que se hacen todas o ninguna. Si una falla, se deshacen las demás.
- **Winston**: la librería de logs de la versión 0.8 del profesor. Escribe en consola y en archivos, por niveles (`info`, `warn` y `error`).
- **Zod**: la librería que valida los datos que llegan (tipos, formatos y rangos) y devuelve los errores ordenados.

## Angular

- **Componente standalone**: un componente que dice él mismo lo que usa en `imports`, sin `NgModule`. Es lo que se usa desde Angular 17.
- **Directiva**: algo que se pone en una etiqueta HTML para cambiar cómo se comporta o cómo se ve (`routerLink`, `formControlName`).
- **Formularios reactivos**: el formulario se define en el TypeScript (`FormGroup` y `FormControl`) y la plantilla solo se engancha. Es lo que valoran los requisitos.
- **Formularios template-driven**: el formulario se define en la plantilla con `ngModel`. Se vio en clase antes de los reactivos.
- **Guard**: una función que decide si se puede entrar a una ruta (por ejemplo, solo con la sesión iniciada) o salir de ella.
- **`HttpClient`**: el servicio de Angular para hacer peticiones HTTP. Devuelve `Observable`.
- **`HttpParams`**: monta la parte `?clave=valor` de una URL. Es inmutable.
- **Interceptor**: una función por la que pasan todas las peticiones de `HttpClient`. Se usa para añadir el token.
- **Lazy loading**: cargar el código de una página solo cuando se entra en ella (`loadComponent`), para que la web arranque antes.
- **`Observable`**: un valor que llegará más tarde (o varios). No hace nada hasta que alguien se suscribe con `subscribe`.
- **Pipe**: transforma un valor en la plantilla (`{{ precio | currency }}`).
- **Servicio**: una clase con `@Injectable` que guarda la lógica que no es de la vista, como las llamadas HTTP. Se pide con `inject()`.
- **Signal**: un valor que avisa a la plantilla cuando cambia. Se lee llamándolo (`total()`) y se cambia con `set()` o `update()`.
- **Tailwind CSS**: estilos con clases pequeñas en el HTML (`p-4`, `text-lg`) en vez de escribir CSS aparte.

## Otras

- **Rama y tag de Git**: una rama es una línea de trabajo que avanza; un tag es una marca fija en un commit (`v1.0.0`). El profesor tiene una versión del backend en cada tag.
- **Postman / Bruno**: programas para probar una API mandando peticiones a mano.
- **Vercel**: el servicio donde se publicó la web de clase. Compila el proyecto cada vez que se sube a la rama.
