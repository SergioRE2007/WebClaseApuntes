# Lo que hemos dado en clase (según las capturas)

> Resumen sacado de unas 1400 capturas de los vídeos de clase de PMDM (del 07/10 al 18/11/2026). Lo marcado [dudoso] no se pudo leer con seguridad en las capturas.

## Índice

1. [Qué se ha corregido en esta revisión](#1-qué-se-ha-corregido-en-esta-revisión)
2. [Android con Kotlin (PMDM)](#2-android-con-kotlin-pmdm)
   - 2.1 [Temario por fechas](#21-temario-por-fechas)
   - 2.2 [Conceptos agrupados por tema](#22-conceptos-agrupados-por-tema)
   - 2.3 [Patrones de código del profesor](#23-patrones-de-código-del-profesor)
   - 2.4 [Librerías y versiones](#24-librerías-y-versiones)
3. [Dudas y lagunas](#3-dudas-y-lagunas)

---

## 1. Qué se ha corregido en esta revisión

| Qué venía en los documentos | Qué se ha hecho |
|---|---|
| Un documento aparte llamado "otra" (26/10): PokeAPI, Postman, Git, Gson y Retrofit | Es la clase de Android del 26/10. Se ha fusionado con Android. |
| `@InstallIn(Singleton::class)` en `AppModule` (26/10) | Error de lectura o del momento. Lo correcto es `SingletonComponent::class`, que es lo que se ve en las clases siguientes. |
| `baseUrl("https://pokeapi.co/api/v2")` sin `/` final, con `@GET("/pokemon")` | Retrofit exige que la `baseUrl` acabe en `/`. En los patrones se escribe con `/` final y rutas sin `/` inicial (así salen las rutas el 09/11). La lectura original queda como [dudoso]. |
| Repositorio de Retrofit leído como «lysine-dev/retrofit» o «lynsine-dev/retrofit» | Error de lectura casi seguro. El oficial es `square/retrofit`. [dudoso] |
| Gson 2.15.0 (GitHub) y Gson 2.13.1 (log de compilación) | En el proyecto se usa la del log, 2.13.1. La 2.15.0 se leyó en la página de GitHub. [dudoso] |
| `stringResource("Create task")` (18/11) | No compila: `stringResource` recibe un id `R.string.x`. [dudoso] |
| `Routes("task_detail[$id]")` (18/11) | Probablemente `task_detail/$id`, como en la ToDoApp. Se deja como se leyó. [dudoso] |
| Los `[dudoso]` y los `TODO` iban como comentarios dentro del código | Se han sacado a notas debajo de cada bloque. El código va sin comentarios. |

Observaciones sobre el código:

- **3.6, `MutableStateFlow(_taskList)` + `_taskFlow.value = _taskList`:** se asigna siempre la misma lista mutable. Un `StateFlow` no emite si el valor nuevo es igual al anterior, así que `tasks` no avisaría de las tareas nuevas. Coincide con lo que se observó el 16/10 ("la lista no se actualiza"). [dudoso]
- **3.8, `observePokemon(id)`:** el repositorio llama a `_localDataSource.observePokemon(id)`, pero la interfaz `PokemonLocalDataSource` que se ve no lo declara. Tal como está, el fragmento no compila: falta código que no salió en las capturas.
- **3.8, `PokemonDetailViewModel`:** no se ve `@HiltViewModel`, pero tiene que llevarlo. El 18/11 el propio profesor enseña que sin él la app se cae.
- **3.5, rama `Initial`:** `_state` empieza en `Loading` y además hay `init { load() }`, así que la rama `Initial` del `when` nunca se ejecuta.

---

## 2. Android con Kotlin (PMDM)

Clases del 07/10/2026 al 18/11/2026.

Proyectos de clase:

| Proyecto | Paquete | Fechas |
|---|---|---|
| TipCalculator | `com.alanturing.tipcalculator.ui` | 07/10 |
| ToDoApp (rama `dev`) | `com.alanturing.todoapp` | 09/10 a 23/10 |
| PokeApp2627 | `com.alanturing.pokeapp2627` | 26/10, 09/11 y 16/11 |
| Room | `com.turingalan.room` [dudoso: también se lee `com.turinglan`] | 13/11 |
| ToDoOfflineFirst (rama `datastore`) | `com.turingalan.todoofflinefirst` [dudoso: el nombre varía entre capturas] | 18/11 |

### 2.1 Temario por fechas

#### 07/10/2026: TipCalculator, del estado local al ViewModel
- Punto de partida: el estado vive en el composable, con `rememberSaveable`, `mutableStateOf`, `mutableFloatStateOf` y `remember { TextFieldState }`.
- El estado pasa a un `ViewModel` con una `data class TipCalculatorScreenState`.
- Referencia a función `viewModel::calculateSplit` frente a la lambda `{ viewModel.calculateSplit() }`.
- Primero se mutaba un `var` del data class. Después todos los campos pasan a `val` y se usa `copy()`, con la backing property `_state` y `state`.
- `if` como expresión, que necesita `else`.
- `Switch` y `Slider` controlados por el ViewModel.
- El ViewModel se crea como valor por defecto del parámetro, todavía sin Hilt.
- Faltan las capturas de 00:00 a 15:42.

#### 09/10/2026: ToDoApp, NavHost, rutas tipadas y ViewModel con Hilt
- `sealed class Route` con `@Serializable`: `object TaskList`, `object TaskCreate` y `class TaskDetail(val id: Int)`.
- `ToDoNavHost` con `val controller = rememberNavController()`. Se explica por qué no vale `by`.
- `NavHost(navController, startDestination)` con un `composable<Route.X>` por pantalla.
- Callbacks de navegación `toCreate: () -> Unit` y `toDetail: (Int) -> Unit`. La pantalla no conoce el `navController`.
- Argumento leído con `backStackEntry.toRoute()`.
- `TaskCard` se puede pulsar con `Modifier.clickable`.
- Hilt: `ApplicationModule` con `@Binds @Singleton`, y `TaskListViewModel` con `@HiltViewModel` + `@Inject constructor`.
- Se añade `hilt-navigation-compose` y la pantalla recibe `viewModel = hiltViewModel()`.
- Se quita el `repository` de la pantalla. La lista lee de `viewModel.readAll()`.

#### 16/10/2026: "Algo de flujo, parte 1"
- Repaso de navegación, Hilt y capa de datos (`Task`, `TaskRepository`, `TaskRepositoryInMemory`).
- `MutableStateFlow` en el ViewModel y `collectAsStateWithLifecycle()` en la pantalla. Se compara con `collectAsState`.
- `TaskCreateViewModel` paso a paso, con `TextFieldState` para el formulario y `onCreate()`.
- `TaskCreateScreen` con `OutlinedTextField(state = ...)` y `Button(onClick = viewModel::onCreate)`.
- Depuración de Compose: breakpoints, variables, frames, Step Into y Recomposition State.

#### 23/10/2026: estados de pantalla sellados y corrutinas
- `TaskCreateScreenState` como `sealed interface` (Initial, Creating, Created, Error).
- `TaskListScreenState` como `sealed class` (Initial, Loading, `Success(tasks)`, `Error(message)`).
- `private val _state = MutableStateFlow<...>(...)` y `val state: StateFlow<...> get() = _state.asStateFlow()`.
- Repositorio con funciones `suspend`, `delay(5_000L)` para simular la red y `val tasks: Flow<List<Task>>`.
- `viewModelScope.launch`, `fun load()` e `init { load() }`.
- `when` exhaustivo, con `is` para las `class` y sin `is` para los `object`, y el cast `(state as X.Success).tasks`.
- La pantalla se parte en dos funciones sobrecargadas: una sin estado (`isLoading`, `tasks`) y otra con estado (`viewModel`).
- `LazyListScope`: dentro de `LazyColumn` hay que usar `item { }` para llamar a composables.
- `TODO()`.

#### 26/10/2026: PokeApp2627, capa remota con Retrofit y Hilt
- Herramientas de apoyo:
  - Repositorios de GitHub de **Gson** y **Retrofit** («A type-safe HTTP client for Android and the JVM»). Se abre `samples/ErrorHandlingAdapter.java` de Retrofit.
  - Documentación de **PokeAPI v2** (`pokeapi.co/docs/v2`): Egg Groups, Resource Lists/Pagination y el endpoint Pokemon.
  - **Postman**: `GET https://pokeapi.co/api/v2/pokemon/` responde 200 OK en 71 ms. Sirve para ver el JSON real antes de escribir las data class.
- La interfaz Retrofit `PokeApi` devuelve `Response<T>`. Se leen `isSuccessful` y `body()!!`, y se usa `@Path`.
- Los DTO van en `PokemonApiModels.kt` y se pasan al modelo con la función de extensión `toModel()`.
- `PokemonDataSource` (interfaz) y `PokemonRemoteDataSource` (implementación), con N+1 peticiones para traer la imagen de cada pokémon (el listado no la trae).
- `PokemonRepositoryImpl` recibe el DataSource por `@Inject`.
- `AppModule` con `@Binds` y `NetworkModule` con `@Provides` (crea Retrofit con Gson).
- `PokeApplication` con `@HiltAndroidApp`. Primero se le puso `@AndroidEntryPoint` por error.
- Manifest: permiso `INTERNET` y `android:name`.
- Git: repositorio creado desde Android Studio (Version Control → Create Git repository / Share on GitHub) y desde PowerShell (`git init` y primer commit). Aviso `LF will be replaced by CRLF` por `core.autocrlf`.

#### 09/11/2026: Flow en DataSource y repositorio, `stateIn` y offline-first en memoria
- Bloque 1:
  - `val pokemons: Flow<List<Pokemon>>` en el DataSource y en el repositorio, con `flow { emit(readAllPokemon()) }`.
  - El ViewModel construye su estado con `map` + `stateIn(viewModelScope, WhileSubscribed(5_000L), Loading)`, en vez de `MutableStateFlow` + `init`.
  - Por qué no `GlobalScope`.
  - Commit `feat: change ds and repo to flow emition`.
- Bloque 2:
  - Refactor > Rename: `PokemonDataSource` pasa a `PokemonRemoteDataSource`, y la implementación a `PokemonRemoteDataSourceImpl`.
  - Nuevo paquete `local`: `PokemonLocalDataSource` y `PokemonInMemoryDataSource`.
  - El repositorio recibe los dos DataSource. El local es la fuente de verdad y `refresh()` copia del remoto al local.
  - Carga inicial en `init`: `withContext` no sirve, se prueba `runBlocking`, y `CoroutineScope(Dispatchers.IO).launch` deja la pantalla en blanco.
  - `PokemonDetailViewModel` lee el id con `savedStateHandle.toRoute<Routes.Detail>()` y usa `observePokemon(id)`.
  - Coil `AsyncImage` en la fila de la lista.

#### 13/11/2026: Room 3 + KSP + Hilt, y Splash Screen
- Teoría de Room: Database, DAO y Entities.
- Gradle: catálogo `libs.versions.toml`, plugins en el build raíz con `apply false`, KSP y Hilt.
- Errores de sync y de compileSdk. Se pasa a `compileSdk release(37)`, `minSdk 35` y `targetSdk 37`.
- Room: `@Entity(tableName)`, `@PrimaryKey`, `@ColumnInfo`; `@Dao` con `@Insert` sobrecargado (`vararg` y `List`), `@Update` y `@Query`; `@Database` sobre una `abstract class` que hereda de `RoomDatabase()`.
- Hilt: `AppModule` como `class` con `@Provides`, que construye la BD con `Room.databaseBuilder` y `@ApplicationContext`, y un segundo `@Provides` para el DAO.
- Splash: `installSplashScreen()` antes de `super.onCreate()`, `MainViewModel` con `StateFlow<Boolean>`, `setKeepOnScreenCondition { !viewModel.uiState.value }` y `by viewModels()` en la Activity.
- Errores de KSP por un SQL mal escrito (`FROM :pokemon`). Al final las `@Query` se dejan comentadas.

#### 16/11/2026: PokeApp con Room (fragmento de 3 minutos)
- Database Inspector con la base `pokemon-db` y la tabla `pokemon`.
- El repositorio es offline-first sobre Room (`PokemonLocalDBDatasource`, `PokemonDao`, `PokemonEntity`).
- El `init { runBlocking { refresh() } }` aparece comentado.

#### 18/11/2026: DataStore y pantalla de ajustes (modo oscuro)
- `SettingsDataStore` con `booleanPreferencesKey`, `data.map { it[key] ?: false }` y `updateData { toMutablePreferences().also { } }`.
- Capas `SettingsDatasource` → `SettingsRepository`/`SettingsRepositoryImpl` → `SettingsViewModel`, con los `@Binds` en `AppModule`.
- Componente reutilizable `ApplicationTopBar` (`TopAppBar` con `actions` e `IconButton`) e icono `ImageVector` escrito en código.
- Grafos anidados `navigation<Routes.TaskFeature>` y `navigation<Routes.SettingsFeature>`. Se navega al grafo.
- `SettingsScreen` con un `Switch` conectado al ViewModel (`map` + `stateIn`).
- La app se cae si falta `@HiltViewModel` (`NoSuchMethodException`).
- Se enseña `Theme.kt`, pero no se ve cómo llega el `darkMode` al tema.

### 2.2 Conceptos agrupados por tema

#### Kotlin
| Concepto | Clases |
|---|---|
| `data class` con valores por defecto y `copy()` con argumentos con nombre | 07/10 |
| `val` frente a `var` (y una `val MutableList` que sí cambia por dentro) | 07/10, 09/11 |
| `if` y `when` como expresión (`if` necesita `else`) | 07/10, 09/11 |
| Backing property `private _x` y `val x get() = _x`, convención `_nombre` | 07/10, 09/10, 23/10, 09/11, 13/11 |
| Referencia a función `obj::fun` | 07/10, 16/10 |
| Tipos función `() -> Unit` y `(Int) -> Unit`, lambdas con parámetro con nombre o con `it` | 09/10, 09/11 |
| Nulables `Int?`, `?.let {}`, `!!` y elvis `?:` | 09/10, 26/10, 18/11 |
| Plantillas de texto `"Tarea $id"` | 09/10 |
| No se puede instanciar una interfaz | 09/10 |
| `TODO()` devuelve `Nothing` y lanza `NotImplementedError` | 16/10, 23/10, 26/10 |
| Una propiedad tiene que inicializarse o ser `abstract` | 16/10 |
| `sealed class` frente a `sealed interface`, y `object` frente a `class` | 23/10, 09/11 |
| Smart cast frente a cast explícito `as` | 23/10 |
| Funciones de extensión (`PokemonResult.toModel()`) | 26/10 |
| Colecciones: `mutableListOf`, `add`, `addAll`, `clear` y `for (x in lista)` | 26/10, 09/11 |
| Propiedades en interfaces (`val pokemons: Flow<...>` y `override val`) | 09/11 |
| `vararg` | 13/11 |
| `Duration`: `10.seconds` y `10_000L.milliseconds` | 13/11 |
| `.also { }` | 18/11 |

#### Compose y Material 3
- `@Composable` y `@Preview` envuelto en el tema. Parámetro `modifier: Modifier = Modifier`. (07/10 y siguientes)
- `Scaffold` con `innerPadding` y `Modifier.consumeWindowInsets(innerPadding).padding(innerPadding)`. (07/10, 09/10, 23/10)
- Estado local con `remember`, `rememberSaveable`, `mutableStateOf`, `mutableFloatStateOf` y el delegado `by`. (07/10, 09/10)
- `TextField` y `OutlinedTextField(state = TextFieldState)`, `KeyboardOptions` y `KeyboardType.Decimal`. (07/10, 16/10)
- `Row`, `Column`, `Arrangement` y `Alignment`. (07/10)
- Componentes controlados: `Switch(checked, onCheckedChange)` y `Slider`. Con `onCheckedChange = null` el `Switch` es de solo lectura. (07/10, 09/10, 18/11)
- `Button(enabled, onClick)`, `Icon(painterResource(...))` y `Text`. (07/10, 16/10)
- `LazyColumn` con `items(items, key = { it.id })` e `item { }`. (09/10, 23/10, 09/11)
- `LargeFloatingActionButton`, `FloatingActionButton` y `ExtendedFloatingActionButton`. (09/10, 16/10, 18/11)
- `Card` y `Modifier.clickable(onClick)`. (09/10, 09/11)
- `CircularProgressIndicator`. (23/10, 09/11)
- `stringResource(R.string.x, arg)`, con `values/strings.xml` y `values-es/strings.xml`. (07/10)
- Pantalla con estado y pantalla sin estado (state hoisting), como dos funciones sobrecargadas con el mismo nombre. (23/10, 09/11, 18/11)
- `TopAppBar` con los slots `actions`, `navigationIcon` y `title`, `IconButton` y `@OptIn(ExperimentalMaterial3Api::class)`. Componente reutilizable en `core/ui/CommonComponents.kt`. (18/11)
- Icono como `ImageVector.Builder` escrito en código. (18/11)
- Tema: `lightColorScheme` y `darkColorScheme`, color dinámico desde Android 12 (`Build.VERSION_CODES.S`) e `isSystemInDarkTheme()`. (18/11)
- Coil `AsyncImage`, `clip(CircleShape)` y `MaterialTheme.typography`. (09/11)
- Teoría de Material 3 Expressive: Loading indicator. (13/11)

#### Estado y ViewModel
- `ViewModel` como dueño del estado. Los eventos son funciones del ViewModel. (07/10)
- `MutableStateFlow` privado y `StateFlow` público con `asStateFlow()`. (16/10, 23/10, 13/11)
- En la pantalla, `val state by viewModel.state.collectAsStateWithLifecycle()`, que deja de recoger por debajo de `STARTED`. (16/10, 23/10, 18/11)
- Estados sellados `Initial`, `Loading`, `Success`/`Loaded` y `Error`, con `when` exhaustivo. (23/10, 09/11)
- Estado como `data class UiState` con valores por defecto. (07/10, 18/11)
- `TextFieldState` dentro del ViewModel, leído con `.text.toString()`. (16/10, 23/10)
- `Flow` → `map` → `stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000L), initialValue)`, en lugar de `MutableStateFlow` + `init`. (09/11, 18/11)
- Argumentos de navegación en el ViewModel con `savedStateHandle.toRoute<T>()`. (09/11)
- En una Activity, `val vm: X by viewModels()`. En un composable, `hiltViewModel()`. (13/11)

#### Corrutinas y Flow
- `viewModelScope.launch`, funciones `suspend` y `delay`. (23/10, 13/11, 18/11)
- Una `suspend` solo se llama desde una corrutina o desde otra `suspend`. `init` no es `suspend` y `withContext` tampoco sirve ahí. (09/11)
- `runBlocking` (bloquea el hilo, solución provisional) frente a `CoroutineScope(Dispatchers.IO).launch`. (09/11, 16/11)
- No usar `GlobalScope`, porque no está ligado a ningún ciclo de vida. (09/11)
- El constructor `flow { emit(...) }` crea un Flow frío. (09/11)
- `map` con genéricos explícitos `map<A, B>`. (09/11, 18/11)

#### Navegación (Navigation Compose)
- Rutas tipadas: `@Serializable sealed class Route` con `object` (sin datos) y `class X(val id: Int)` (con datos). Necesitan el plugin de serialización. (09/10, 16/10)
- `val controller = rememberNavController()`, con `=` y no con `by`. (09/10)
- `NavHost(navController, startDestination) { composable<Route.X> { ... } }`. (09/10)
- `controller.navigate(Route.TaskDetail(id = id))` y `popBackStack()`. (09/10, 18/11)
- `backStackEntry.toRoute()` y `savedStateHandle.toRoute<T>()`. (09/10, 09/11)
- Las pantallas reciben callbacks y el callback va bajando por los composables (`toDetail = { toDetail(it.id) }`). (09/10, 18/11)
- Se navega en vez de usar un `if` con estado local. (09/10)
- Grafos anidados: `navigation<Grafo>(startDestination = ...)`. Se navega al grafo. (18/11)

#### Hilt
- `Application` con `@HiltAndroidApp`, registrada en el manifest con `android:name`. (26/10, 13/11)
- `@AndroidEntryPoint` en la Activity. (09/10, 26/10, 13/11)
- Módulo `@Module @InstallIn(SingletonComponent::class)`:
  - con `@Binds @Singleton`, como `abstract class` (09/10) o como `interface` (26/10, 09/11, 18/11), para atar una interfaz a su implementación;
  - con `@Provides`, como `class`, para objetos que hay que construir (Retrofit el 26/10, Room el 13/11).
- `@Inject constructor(...)` con `javax.inject.Inject`. (09/10 y siguientes)
- `@HiltViewModel` necesita `@Inject constructor()` aunque no tenga parámetros. Sin la anotación, la app se cae con `NoSuchMethodException`. (13/11, 18/11)
- `@ApplicationContext context: Context`. (13/11)
- Provides encadenados: el DAO se construye a partir de la BD. (13/11)
- KSP genera el código (`kspDebugKotlin`, `hiltJavaCompileDebug`, `X_Factory.java`). (09/10, 09/11)
- Con Hilt y Navigation se usa `hiltViewModel()`, no `viewModel()`. (09/10)

#### Capa de datos y arquitectura
- Interfaz de repositorio + implementación (`TaskRepositoryInMemory`). La UI solo conoce la interfaz. (09/10, 16/10, 23/10)
- Organización por feature: `features/<x>/data/{local, model, remote, repository}`, `di` y `ui`, más `core/di`. (26/10, 09/11, 16/11, 18/11)
- Cadena de capas `PokeApi` → `RemoteDataSource` → `Repository` → `ViewModel`. (26/10)
- DTO y modelo de dominio separados, con el mapper `toModel()`. (26/10)
- Offline-first: la UI observa el `Flow` local y `refresh()` baja los datos del remoto y los guarda en local. El local fue primero en memoria y luego Room. (09/11, 16/11)

#### API REST, PokeAPI y Retrofit
- Un recurso se pide por id o por nombre: `GET /api/v2/pokemon/{id or name}/`. (26/10)
- Paginación con `limit` y `offset`. El listado devuelve `count` (total), `next`, `previous` (`null` en la primera página) y `results` (lista de `{ name, url }`). (26/10)
- El listado no trae la imagen. Está en el detalle (`sprites.front_default`). (26/10)
- Interfaz Retrofit con `@GET` y `@Path`, funciones `suspend` y `Response<T>` (`isSuccessful`, `body()` nulable). (26/10, 09/11)
- `Retrofit.Builder().baseUrl().addConverterFactory(GsonConverterFactory.create()).build().create(...)`. (26/10)
- `@SerializedName("front_default")`. (09/11)
- Permiso `INTERNET` en el manifest. (26/10)

#### Room 3
- Paquete `androidx.room3`. (13/11)
- `@Entity(tableName)`, `@PrimaryKey`, `@ColumnInfo(name)`. Un tipo nulable es una columna que admite NULL. (13/11)
- `@Dao` interfaz con `suspend`: `@Insert` (`vararg`/`List`), `@Update` y `@Query("... WHERE id = :id")`. (13/11)
- `@Database(entities, version)` sobre una `abstract class : RoomDatabase()` con `abstract fun dao()`. (13/11)
- `Room.databaseBuilder<DB>(context, name).build()`. (13/11)
- El SQL se comprueba al compilar. El nombre de la tabla no puede ser un parámetro. (13/11)
- Database Inspector (App Inspection). (16/11)

#### DataStore
- `DataStore<Preferences>`, `booleanPreferencesKey` y `data.map { it[key] ?: false }`. (18/11)
- `updateData { prefs -> prefs.toMutablePreferences().also { it[key] = v } }`: la lambda tiene que devolver las Preferences. (18/11)

#### Splash Screen
- `installSplashScreen()` antes de `super.onCreate()` y `setKeepOnScreenCondition { Boolean }`. (13/11)
- Visto solo en la documentación, no usado: `setOnExitAnimationListener` y el tema `Theme.SplashScreen`. (13/11)

#### Gradle
- Catálogo `libs.versions.toml` con `[versions]`, `[libraries]` y `[plugins]`. (13/11)
- `alias(...) apply false` en el build raíz. (13/11)
- `ksp(...)` para el compilador e `implementation(...)` para el runtime. (13/11)
- El plugin de Hilt sin la dependencia `hilt-android` hace fallar el sync. (13/11)
- `compileSdk`, `targetSdk` y `minSdk`, el error `checkDebugAarMetadata` y la sintaxis de AGP 9 `release(37) { minorApiLevel = 1 }`. (13/11)

#### IDE, depuración y Git
- Autocompletado, documentación rápida, Alt+Intro (importar), Ctrl+P (parámetros), Refactor > Rename con vista previa y New Kotlin Class/File. (todas)
- Depurador: breakpoints, Threads & Variables, Frames (también de corrutinas), Evaluate expression, Step Into, Resume y Recomposition State. (16/10, 23/10, 09/11)
- Buscar errores: leer el primer error de Build Output y comentar líneas hasta encontrarlo. (13/11)
- Logcat con el filtro `package:mine`. (18/11)
- `git init` (crea la rama `main`) y commit desde el IDE con Conventional Commits (`feat:`). (26/10, 09/11)

### 2.3 Patrones de código del profesor

El código va sin comentarios. Lo dudoso está en las notas de cada bloque.

#### P1. ViewModel con `copy()` y backing property (TipCalculator, 07/10)
```kotlin
class TipCalculatorViewModel(): ViewModel() {
    private var _state = TipCalculatorScreenState()
    val state: TipCalculatorScreenState
        get() = _state

    fun calculateSplit() { }

    fun changeTip(isEnabled: Boolean) {
        _state = _state.copy(
            tip = isEnabled,
            tipAmount = if (!isEnabled) 0.0f else _state.tipAmount
        )
    }
}

data class TipCalculatorScreenState(
    val guests: String = "0",
    val amount: String = "0.00",
    val tip: Boolean = false,
    val tipAmount: Float = 0.0F,
    val result: String = "",
    val isCaculateEnabled: Boolean = false
)
```
En la pantalla: `Switch(checked = viewModel.state.tip, onCheckedChange = viewModel::changeTip)` y `Button(enabled = viewModel.state.isCaculateEnabled, onClick = viewModel::calculateSplit)`.

Notas:
- [dudoso] `isCaculateEnabled` puede ser una errata del profesor o de la lectura (`isCalculateEnabled`).
- `_state` es una variable normal, no observable: Compose no repinta al cambiarla. El profesor deja el comentario `TODO Corregir esto para que vaya perfecto`, y la línea `var screenState by rememberSaveable { viewModel.state }` se queda con errores.
- `calculateSplit()` y el `onValueChange` del `Slider` quedan vacíos.

#### P2. Rutas y NavHost (ToDoApp, 09/10)
```kotlin
@Serializable
sealed class Route(val route: String) {
    @Serializable object TaskList : Route(route = "taskList")
    @Serializable object TaskCreate : Route(route = "taskCreate")
    @Serializable class TaskDetail(val id: Int) : Route(route = "taskDetail/$id")
}

@Composable
fun ToDoNavHost() {
    val controller = rememberNavController()
    NavHost(navController = controller, startDestination = Route.TaskList) {
        composable<Route.TaskList> {
            TaskListScreen(
                toCreate = { controller.navigate(Route.TaskCreate) },
                toDetail = { id -> controller.navigate(Route.TaskDetail(id = id)) }
            )
        }
        composable<Route.TaskCreate> { TaskCreateScreen() }
        composable<Route.TaskDetail> { backStackEntry ->
            val detail: Route.TaskDetail = backStackEntry.toRoute()
            TaskDetailScreen(id = detail.id)
        }
    }
}
```
Nota: con rutas tipadas el `route: String` no hace falta, pero el profesor lo mantiene.

#### P3. Módulo de Hilt con `@Binds` (09/10)
```kotlin
@Module
@InstallIn(SingletonComponent::class)
abstract class ApplicationModule {
    @Binds
    @Singleton
    abstract fun bindTaskRepository(repository: TaskRepositoryInMemory): TaskRepository
}
```
Desde el 26/10 el módulo es una `interface AppModule` (ver P8).

#### P4. Formulario con `TextFieldState` en el ViewModel (16/10 y 23/10)
```kotlin
@HiltViewModel
class TaskCreateViewModel @Inject constructor(
    private val _repository: TaskRepository
) : ViewModel() {
    private val _screenState = MutableStateFlow<TaskCreateScreenState>(TaskCreateScreenState.Initial)
    val screenState: StateFlow<TaskCreateScreenState>
        get() = _screenState.asStateFlow()
    val titleState = TextFieldState()
    val descriptionState = TextFieldState()

    fun onCreate() {
        _screenState.value = TaskCreateScreenState.Creating
        viewModelScope.launch {
            _repository.create(
                title = titleState.text.toString(),
                description = descriptionState.text.toString(),
                limitDate = "9999.31.12"
            )
            _screenState.value = TaskCreateScreenState.Created
        }
    }
}

sealed interface TaskCreateScreenState {
    object Initial : TaskCreateScreenState
    object Creating : TaskCreateScreenState
    object Created : TaskCreateScreenState
    object Error : TaskCreateScreenState
}

@Composable
fun TaskCreateScreen(
    modifier: Modifier = Modifier,
    viewModel: TaskCreateViewModel = hiltViewModel(),
) {
    Column {
        OutlinedTextField(state = viewModel.titleState)
        OutlinedTextField(state = viewModel.descriptionState)
        Button(onClick = viewModel::onCreate) { Text("Save") }
    }
}
```
Nota: la fecha `"9999.31.12"` es provisional. El profesor la marca con `TODO Deuda técnica`.

#### P5. Estado sellado + `load()` y pantalla con estado / sin estado (23/10)
```kotlin
@HiltViewModel
class TaskListViewModel @Inject constructor(
    private val _repository: TaskRepository
) : ViewModel() {
    private val _state = MutableStateFlow<TaskListScreenState>(TaskListScreenState.Loading)
    val state: StateFlow<TaskListScreenState>
        get() = _state.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            _state.value = TaskListScreenState.Loading
            val tasks = _repository.readAll()
            _state.value = TaskListScreenState.Success(tasks)
        }
    }
}

sealed class TaskListScreenState {
    object Initial : TaskListScreenState()
    object Loading : TaskListScreenState()
    class Success(val tasks: List<Task>) : TaskListScreenState()
    class Error(val message: String) : TaskListScreenState()
}

@Composable
fun TaskListScreen(
    modifier: Modifier = Modifier,
    toCreate: () -> Unit,
    toDetail: (Int) -> Unit,
    viewModel: TaskListViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    when (state) {
        is TaskListScreenState.Success -> {
            val tasks = (state as TaskListScreenState.Success).tasks
            TaskListScreen(modifier = modifier, toCreate = toCreate, toDetail = toDetail,
                isLoading = false, tasks = tasks)
        }
        is TaskListScreenState.Error -> TODO()
        TaskListScreenState.Loading -> TaskListScreen(modifier = modifier, toCreate = toCreate,
            toDetail = toDetail, isLoading = true)
        TaskListScreenState.Initial -> {
            viewModel.load()
            TaskListScreen(modifier = modifier, toCreate = toCreate, toDetail = toDetail,
                isLoading = true)
        }
    }
}

@Composable
fun TaskListScreen(
    modifier: Modifier = Modifier,
    toCreate: () -> Unit,
    toDetail: (Int) -> Unit,
    isLoading: Boolean = true,
    tasks: List<Task> = listOf(),
) {
    Scaffold(
        modifier = modifier.fillMaxSize(),
        floatingActionButton = {
            FloatingActionButton(onClick = toCreate) {
                Icon(painterResource(id = R.drawable.add_24px), contentDescription = "Create")
            }
        }
    ) { innerPadding ->
        val modifier = Modifier
            .consumeWindowInsets(paddingValues = innerPadding)
            .padding(paddingValues = innerPadding)
        LazyColumn(modifier = modifier) {
            item { if (isLoading) CircularProgressIndicator() }
            items(items = tasks, key = { it.id }) {
                TaskCard(
                    toDetail = { toDetail(it.id) },
                    title = it.title,
                    description = it.description,
                    isCompleted = it.isCompleted,
                )
            }
        }
    }
}

@Composable
fun TaskCard(toDetail: () -> Unit, title: String, description: String, isCompleted: Boolean) {
    Card(modifier = Modifier.clickable(enabled = true, onClick = toDetail)) {
        Column {
            Text(title)
            Text(description)
            Row {
                Text("Completada")
                Switch(checked = isCompleted, onCheckedChange = null)
            }
        }
    }
}
```
Notas:
- [dudoso] En la rama `Initial`, una captura lee `isLoading = true` y otra `false`.
- [dudoso] `add_24px` o `add_24dp`.
- [dudoso] El final de las líneas `consumeWindowInsets(...).padding(...)` sale cortado en varias capturas.
- `viewModel.load()` se llama durante la composición, sin `LaunchedEffect`. El profesor no lo comenta. Además esa rama no llega a ejecutarse (ver sección 1).
- La rama `Error` es un `TODO()`: no se ve cómo se rellena el estado de error.

#### P6. Repositorio en memoria con `suspend` (23/10)
```kotlin
interface TaskRepository {
    val tasks: Flow<List<Task>>
    suspend fun readAll(): List<Task>
    suspend fun readOne(id: Int): Task
    suspend fun create(title: String, description: String, limitDate: String): Task
    suspend fun complete(id: Int)
    suspend fun uncomplete(id: Int)
    suspend fun update(id: Int, title: String? = null, description: String? = null)
}

private const val delay = 5_000L

class TaskRepositoryInMemory @Inject constructor() : TaskRepository {
    private val _taskList = mutableListOf<Task>()
    private val _taskFlow = MutableStateFlow(_taskList)
    override val tasks: Flow<List<Task>>
        get() = _taskFlow.asStateFlow()

    override suspend fun readAll(): List<Task> {
        delay(timeMillis = delay)
        return _taskList.toList()
    }

    override suspend fun create(title: String, description: String, limitDate: String): Task {
        delay(timeMillis = delay)
        val newTask = Task(id = nextId, title = title, description = description,
            createdAt = "", limitDate = limitDate)
        if (_taskList.add(newTask)) {
            nextId++
            _taskFlow.value = _taskList
        }
        return newTask
    }
}
```
Notas:
- Es un fragmento: faltan `readOne`, `complete`, `uncomplete` y `update`.
- [dudoso] No se ve dónde se declara `nextId`.
- [dudoso] `_taskFlow.value = _taskList` asigna la misma lista (ver sección 1).
- `createdAt` y `limitDate` son `String`. El profesor deja `TODO Buscar un tipo correcto para fecha`.

#### P7. Retrofit + RemoteDataSource + `toModel()` (26/10, versión del 09/11)
```kotlin
interface PokeApi {
    @GET("pokemon")
    suspend fun readAllPokemon(): Response<PokemonListResult>
    @GET("pokemon/{name}")
    suspend fun readPokemonByName(@Path(value = "name") name: String): Response<PokemonResult>
    @GET("pokemon/{id}")
    suspend fun readPokemonById(@Path(value = "id") id: Int): Response<PokemonResult>
}

data class PokemonResult(val id: Int, val name: String, val sprites: PokemonSprites?)
data class PokemonSprites(@SerializedName("front_default") val frontDefault: String)
data class PokemonListResult(val results: List<PokemonListItemResult>)
data class PokemonListItemResult(val name: String, val url: String)

fun PokemonResult.toModel(): Pokemon = Pokemon(
    id = this.id,
    name = this.name,
    pokemonImageUrl = this.sprites?.frontDefault,
)

class PokemonRemoteDataSourceImpl @Inject constructor(
    private val _api: PokeApi
) : PokemonRemoteDataSource {
    override val pokemons: Flow<List<Pokemon>> = flow { emit(readAllPokemon()) }

    override suspend fun readAllPokemon(): List<Pokemon> {
        val response = _api.readAllPokemon()
        val pokemons = mutableListOf<Pokemon>()
        if (response.isSuccessful) {
            val body = response.body()!!
            for (item in body.results) {
                val pokemon = readPokemonByName(item.name)
                pokemons.add(pokemon!!)
            }
        }
        return pokemons
    }

    override suspend fun readPokemonByName(name: String): Pokemon? {
        val response = _api.readPokemonByName(name)
        if (response.isSuccessful) {
            return response.body()!!.toModel()
        } else {
            return null
        }
    }
}

@Module
@InstallIn(SingletonComponent::class)
class NetworkModule {
    @Provides
    @Singleton
    fun provideHttpClient(): PokeApi {
        val retrofit: Retrofit = Retrofit.Builder()
            .baseUrl("https://pokeapi.co/api/v2/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        return retrofit.create(PokeApi::class.java)
    }
}

@HiltAndroidApp
class PokeApplication() : Application()
```
Manifest: `<uses-permission android:name="android.permission.INTERNET" />` y `<application android:name=".core.PokeApplication" ...>`.

Respuesta del listado vista en Postman (`GET https://pokeapi.co/api/v2/pokemon/`):
```json
{
  "count": 1351,
  "next": "https://pokeapi.co/api/v2/pokemon/?offset=20&limit=20",
  "previous": null,
  "results": [
    { "name": "bulbasaur", "url": "https://pokeapi.co/api/v2/pokemon/1/" },
    { "name": "ivysaur",   "url": "https://pokeapi.co/api/v2/pokemon/2/" }
  ]
}
```
Notas:
- [dudoso] La `baseUrl` se leyó sin `/` final. Se ha corregido (ver sección 1).
- La versión del 26/10 tenía `@GET("/pokemon")` y `sprites` no nulable sin `@SerializedName`.
- `provideHttpClient` devuelve `PokeApi`, no un cliente HTTP: el nombre engaña.
- `readPokemonById` de la interfaz no se usa en lo que se ve.

#### P8. Repositorio offline-first y ViewModel con `stateIn` (09/11)
```kotlin
interface PokemonLocalDataSource {
    val pokemons: Flow<List<Pokemon>>
    suspend fun save(pokemons: List<Pokemon>)
}

class PokemonInMemoryDataSource @Inject constructor() : PokemonLocalDataSource {
    private val _pokemons: MutableList<Pokemon> = mutableListOf()
    override val pokemons: Flow<List<Pokemon>> = flow { emit(_pokemons) }
    override suspend fun save(pokemons: List<Pokemon>) {
        _pokemons.clear()
        _pokemons.addAll(pokemons)
    }
}

class PokemonRepositoryImpl @Inject constructor(
    private val _remoteDataSource: PokemonRemoteDataSource,
    private val _localDataSource: PokemonLocalDataSource,
) : PokemonRepository {
    override val pokemons: Flow<List<Pokemon>> = _localDataSource.pokemons
    override fun observePokemon(id: Int): Flow<Pokemon?> = _localDataSource.observePokemon(id)

    init {
        runBlocking { refresh() }
    }

    suspend fun refresh() {
        val remotePokemons = _remoteDataSource.readAllPokemon()
        _localDataSource.save(remotePokemons)
    }
}

@HiltViewModel
class PokemonListViewModel @Inject constructor(
    private val _repository: PokemonRepository
) : ViewModel() {
    val state: StateFlow<PokemonListScreenState> = _repository.pokemons
        .map<List<Pokemon>, PokemonListScreenState> { PokemonListScreenState.Loaded(pokemons = it) }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(stopTimeoutMillis = 5_000L),
            initialValue = PokemonListScreenState.Loading
        )
}

@HiltViewModel
class PokemonDetailViewModel @Inject constructor(
    private val _repository: PokemonRepository,
    savedStateHandle: SavedStateHandle,
) : ViewModel() {
    private val _route = savedStateHandle.toRoute<Routes.Detail>()
    private val _id = _route.id
    val state: StateFlow<PokemonDetailScreenState> = _repository.observePokemon(_id)
        .map { pokemon ->
            if (pokemon != null) PokemonDetailScreenState.Loaded(pokemon)
            else PokemonDetailScreenState.Initial
        }.stateIn(
            scope = viewModelScope,
            initialValue = PokemonDetailScreenState.Initial,
            started = SharingStarted.WhileSubscribed(5_000L)
        )
}

@Module
@InstallIn(SingletonComponent::class)
interface AppModule {
    @Binds @Singleton
    fun bindsPokemonRemoteDataSource(ds: PokemonRemoteDataSourceImpl): PokemonRemoteDataSource
    @Binds @Singleton
    fun bindPokemonLocalDataSource(ds: PokemonInMemoryDataSource): PokemonLocalDataSource
    @Binds @Singleton
    fun bindsPokemonRepository(r: PokemonRepositoryImpl): PokemonRepository
}
```
Notas:
- [dudoso] `observePokemon(id)` no se ve implementado ni en el LocalDataSource ni en la interfaz del repositorio.
- [dudoso] `@HiltViewModel` de `PokemonDetailViewModel` no se ve en la captura. Se ha puesto porque es obligatorio.
- El `init { runBlocking { refresh() } }` aparece comentado el 16/11 y no se ve desde dónde se llama entonces a `refresh()`.
- Con `CoroutineScope(Dispatchers.IO).launch` la pantalla salía en blanco y con `runBlocking` funcionaba. No se ve la explicación del profesor. [dudoso] Probablemente es porque `flow { emit(_pokemons) }` emite una sola vez.

#### P9. Room 3 con Hilt (proyecto Room, 13/11)
```kotlin
@Entity(tableName = "pokemon")
data class PokemonEntity(
    @PrimaryKey
    val id: Int,
    val name: String,
    val imageUrl: String?,
)

@Dao
interface PokeDao {
    @Insert
    suspend fun insert(vararg p: PokemonEntity)
    @Insert
    suspend fun insert(p: List<PokemonEntity>)
    @Update
    suspend fun update(p: PokemonEntity)
    @Query(value = "SELECT * FROM pokemon")
    suspend fun getAllPokemon(): List<PokemonEntity>
    @Query(value = "SELECT * FROM pokemon WHERE id = :id")
    suspend fun getPokemonById(id: Int): PokemonEntity
}

@Database(entities = [PokemonEntity::class], version = 1)
abstract class PokemonDatabase(): RoomDatabase() {
    abstract fun pokemonDao(): PokeDao
}

@Module
@InstallIn(SingletonComponent::class)
class AppModule {
    @Provides
    fun providesDatabase(@ApplicationContext context: Context): PokemonDatabase {
        val db = Room.databaseBuilder<PokemonDatabase>(
            context = context,
            name = "pokemon_db"
        ).build()
        return db
    }

    @Provides
    fun providesPokemonDao(db: PokemonDatabase): PokeDao {
        return db.pokemonDao()
    }
}
```
Notas:
- Las `@Query` son las de la primera parte de la clase. Al final, con el error de `FROM :pokemon`, quedaron comentadas y no se ve la versión corregida.
- Versión anterior de la entidad: `@ColumnInfo(name = "image_url") val imageUrl: String?`.
- [dudoso] `@Entity(tableName = "pokemon")` aparece en unas capturas y en otras no.
- Los `@Provides` no llevan `@Singleton`: se crearía una BD nueva en cada inyección.
- `exportSchema`: solo se vio el aviso *Schema export directory*, no cómo arreglarlo.
- [dudoso] No se sabe si el archivo `PokeDao.kt` se borró o se quedó vacío.
- El 16/11, en PokeApp2627, los nombres son otros: `PokemonDao`, `PokemonLocalDBDatasource` y base `pokemon-db` (con guion). Es otro proyecto, no una contradicción.

#### P10. Splash con ViewModel (13/11)
```kotlin
@HiltViewModel
class MainViewModel @Inject constructor(): ViewModel() {
    private val _uiState: MutableStateFlow<Boolean> = MutableStateFlow(value = false)
    val uiState: StateFlow<Boolean>
        get() = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            delay(duration = 1.seconds)
            _uiState.value = true
        }
    }
}

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    val viewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        val splashScreen = installSplashScreen()
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        splashScreen.setKeepOnScreenCondition { !viewModel.uiState.value }
        setContent {
            RoomTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    Greeting(name = "Android", modifier = Modifier.padding(innerPadding))
                }
            }
        }
    }
}

@HiltAndroidApp
class RoomApplication(): Application()
```
Nota: el tema `Theme.SplashScreen` en `themes.xml` solo se vio en la documentación.

#### P11. DataStore, ajustes y grafos anidados (ToDoOfflineFirst, 18/11)
```kotlin
class SettingsDataStore @Inject constructor(
    private val dataStore: DataStore<Preferences>
) : SettingsDatasource {
    private val uiMode = booleanPreferencesKey(name = "ui_mode")

    override val darkMode: Flow<Boolean>
        get() = dataStore.data.map { preferences -> preferences[uiMode] ?: false }

    override suspend fun setMode(mode: Boolean) {
        dataStore.updateData { preferences ->
            preferences.toMutablePreferences().also { it[uiMode] = mode }
        }
    }
}

class SettingsRepositoryImpl @Inject constructor(
    private val settingsDS: SettingsDatasource
) : SettingsRepository {
    override val settings: Flow<Boolean>
        get() = settingsDS.darkMode
    override suspend fun setMode(mode: Boolean) { settingsDS.setMode(mode) }
}

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val settingsRepository: SettingsRepository,
) : ViewModel() {
    val uiState: StateFlow<SettingsUiState> = settingsRepository.settings
        .map<Boolean, SettingsUiState> { SettingsUiState(it) }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(stopTimeoutMillis = 5_000L),
            initialValue = SettingsUiState()
        )

    fun changeMode(mode: Boolean) {
        viewModelScope.launch { settingsRepository.setMode(mode) }
    }
}

data class SettingsUiState(val darkMode: Boolean = false)

@Composable
fun SettingsScreen(
    modifier: Modifier = Modifier,
    viewModel: SettingsViewModel = hiltViewModel(),
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    Scaffold { innerPadding ->
        Row(modifier = Modifier.padding(innerPadding)) {
            Text("Dark Mode")
            Switch(checked = uiState.darkMode, onCheckedChange = { viewModel.changeMode(it) })
        }
    }
}

@Serializable
abstract class Routes(val route: String) {
    @Serializable object TaskFeature : Routes("task-feature")
    @Serializable object SettingsFeature : Routes("settings-feature")
    @Serializable object TaskList : Routes("task_list")
    @Serializable object TaskCreate : Routes("task_create")
    @Serializable class TaskDetail(val id: Int) : Routes("task_detail[$id]")
    @Serializable object Settings : Routes("settings")
}

@Composable
fun MainNavigation(modifier: Modifier = Modifier) {
    val navController = rememberNavController()
    NavHost(modifier = modifier, startDestination = Routes.TaskFeature, navController = navController) {
        navigation<Routes.TaskFeature>(startDestination = Routes.TaskList) {
            composable<Routes.TaskList> {
                TaskListScreen(
                    modifier = Modifier.fillMaxSize(),
                    toTaskCreate = { navController.navigate(Routes.TaskCreate) },
                    onSettings = { navController.navigate(Routes.SettingsFeature) }
                )
            }
            composable<Routes.TaskDetail> { TaskDetailScreen() }
            composable<Routes.TaskCreate> { TaskCreateScreen(onBack = { navController.popBackStack() }) }
        }
        navigation<Routes.SettingsFeature>(startDestination = Routes.Settings) {
            composable<Routes.Settings> { SettingsScreen() }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ApplicationTopBar(
    text: String,
    showNavigation: Boolean = false,
    onBack: () -> Unit = {},
    showSettings: Boolean = false,
    onSettings: () -> Unit = {},
) {
    TopAppBar(
        actions = {
            if (showSettings) {
                IconButton(onClick = onSettings) { Icon(imageVector = settings, contentDescription = "") }
            }
        },
        navigationIcon = {
            if (showNavigation) {
                IconButton(onClick = onBack) { Icon(imageVector = arrow_back, contentDescription = null) }
            }
        },
        title = { Text(text = text) }
    )
}
```
Notas:
- [dudoso] `"task_detail[$id]"`: probablemente `task_detail/$id`.
- [dudoso] El DataSource aparece como `SettingsDatasource` y como `SettingsDataSource`.
- No se ve el `DataStoreModule`, que es el que provee `DataStore<Preferences>`.
- No se ve cómo llega el `darkMode` guardado al tema.
- `settings` y `arrow_back` son iconos `ImageVector` escritos en código.
- Aquí `Routes` es `abstract class`, no `sealed class` como en la ToDoApp del 09/10.

#### P12. Gradle con catálogo, KSP, Hilt y Room (13/11)

`gradle/libs.versions.toml`:
```toml
[versions]
agp = "9.2.1"
kotlin = "2.2.10"
composeBom = "2026.02.01"
ksp = "2.3.12"
hilt = "2.60.1"
coreSplashscreen = "1.2.0"

[libraries]
hilt-android = { module = "com.google.dagger:hilt-android", version.ref = "hilt" }
hilt-android-compiler = { module = "com.google.dagger:hilt-android-compiler", version.ref = "hilt" }
androidx-core-splashscreen = { module = "androidx.core:core-splashscreen", version.ref = "coreSplashscreen" }

[plugins]
hilt = { id = "com.google.dagger.hilt.android", version.ref = "hilt" }
ksp = { id = "com.google.devtools.ksp", version.ref = "ksp" }
```

`build.gradle.kts` de la raíz:
```kotlin
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.ksp) apply false
    alias(libs.plugins.hilt) apply false
}
```

`app/build.gradle.kts`:
```kotlin
plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.ksp)
    alias(libs.plugins.hilt)
}
android {
    compileSdk { version = release(37) { minorApiLevel = 1 } }
    defaultConfig { minSdk = 35; targetSdk = 37 }
}
dependencies {
    implementation(libs.androidx.core.splashscreen)
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.11.0")
    implementation(libs.hilt.android)
    ksp(libs.hilt.android.compiler)
    implementation("androidx.room3:room3-runtime:3.0.3")
    ksp("androidx.room3:room3-compiler:3.0.3")
}
```
Nota: [dudoso] la versión de Kotlin se lee como 2.2.10 y también como 2.3.10.

### 2.4 Librerías y versiones

| Librería / herramienta | Artefacto | Versión vista | Clase |
|---|---|---|---|
| Navigation Compose | `androidx.navigation:navigation-compose` | 2.10.2 | 09/10 |
| Serialización | `org.jetbrains.kotlinx:kotlinx-serialization-json` + plugin | 1.11.0 | 09/10 |
| Hilt | `com.google.dagger:hilt-android` / `hilt-android-compiler` (ksp), plugin `com.google.dagger.hilt.android` | 2.60.1 | 09/10, 13/11 |
| Hilt Navigation Compose | `androidx.hilt:hilt-navigation-compose` | ilegible | 09/10 |
| Hilt ViewModel Compose | `androidx.hilt:hilt-lifecycle-viewmodel-compose` (paquete `androidx.hilt.lifecycle.viewmodel.compose`) | 1.4.0 (en la documentación) | 09/10, 18/11 |
| KSP | `com.google.devtools.ksp` | 2.3.12 | 13/11 |
| Retrofit | `com.squareup.retrofit2:retrofit` | 3.0.0 | 26/10 |
| Converter Gson | `com.squareup.retrofit2:converter-gson` | 3.0.0 | 26/10 |
| Gson | `com.google.code.gson` | 2.13.1 en el log; 2.15.0 leída en GitHub [dudoso] | 26/10 |
| Room 3 | `androidx.room3:room3-runtime` / `room3-compiler` (ksp) | 3.0.3 | 13/11 |
| SplashScreen | `androidx.core:core-splashscreen` | 1.2.0 | 13/11 |
| Lifecycle ViewModel | `androidx.lifecycle:lifecycle-viewmodel-ktx` | 2.11.0 | 13/11 |
| Lifecycle runtime | `lifecycle-runtime-ktx` | 2.11.0 (09/10, lectura parcial) / 2.10.0 (13/11) [dudoso] | 09/10, 13/11 |
| Lifecycle Compose | `lifecycle-runtime-compose` (`collectAsStateWithLifecycle`) | no se ve | 16/10 |
| Activity Compose | `androidx.activity:activity-compose` | 1.13.0 | 09/10, 13/11 |
| Activity KTX | `activity-ktx` | 1.13.0 (se añadió y luego se quitó) | 13/11 |
| Core KTX | `androidx.core:core-ktx` | 1.19.1 (09/10) / 1.19.0 (13/11) [dudoso] | 09/10, 13/11 |
| Compose BOM | `androidx.compose:compose-bom` | 2026.02.01 | 13/11 |
| DataStore Preferences | `androidx.datastore` | no se ve | 18/11 |
| Coil | `AsyncImage` | no se ve | 09/11 |
| AGP | `com.android.application` | 9.2.1 | 13/11 |
| Kotlin | plugin compose | 2.2.10 o 2.3.10 [dudoso] | 13/11 |
| Tests (plantilla) | junit / androidx.test.ext junit / espresso | 4.13.2 / 1.3.0 / 3.7.0 | 13/11 |
| SDK | compileSdk / minSdk / targetSdk | 37 (37.1) / 35 / 37 | 13/11 |
| PokeAPI | API de ejemplo | v2 | 26/10 |
| Postman | probar endpoints | no se indica | 26/10 |

Emuladores: Pixel 8a API 37.2, Pixel 7a API 37.1 y Pixel 10.

---

## 3. Dudas y lagunas

### Capturas que faltan
- **07/10:** de 00:00 a 15:42 (el vídeo se grabó mal).
- **23/10:** sin código de 24:29 a 26:26.
- **09/11:** sin código de 08:39 a 11:24 y de 21:08 a 25:41.
- **16/11:** el fragmento dura solo 3 minutos.

### Código que no se llega a ver
- `observePokemon(id)` en el LocalDataSource y en la interfaz del repositorio (09/11).
- Desde dónde se llama a `refresh()` cuando el `runBlocking` queda comentado (16/11).
- Las `@Query` corregidas después del error `FROM :pokemon` (13/11).
- El `DataStoreModule` que provee `DataStore<Preferences>` (18/11).
- Cómo llega el `darkMode` al tema (18/11).
- Dónde se declara `nextId` y el resto de funciones de `TaskRepositoryInMemory` (23/10).
- Cómo se rellena el estado `Error` de las pantallas.
- Navegar hacia atrás después de "Save" (`popBackStack` solo aparece el 18/11).
- Código de `readAllPokemon()` y `readPokemonById()` leyendo de Room: el 16/11 siguen leyendo de la API.
- La explicación del profesor de por qué `CoroutineScope(Dispatchers.IO).launch` deja la pantalla en blanco.
- Los mensajes exactos de `git status` y `git commit` del 26/10.

### Lecturas dudosas
- `isCaculateEnabled` o `isCalculateEnabled`.
- `add_24px` o `add_24dp`.
- `com.turingalan` o `com.turinglan`; el nombre del paquete `todoofflinefirst` varía.
- `SettingsDatasource` o `SettingsDataSource`.
- `"task_detail[$id]"`.
- `stringResource("Create task")`.
- `isLoading` `true` o `false` en la rama `Initial`.
- `@Entity(tableName = "pokemon")`: unas capturas sí y otras no.
- Kotlin 2.2.10 o 2.3.10; `lifecycle-runtime-ktx` 2.11.0 o 2.10.0; `core-ktx` 1.19.1 o 1.19.0.
- Gson 2.15.0 o 2.13.1.
- Repositorio de Retrofit «lysine-dev/retrofit».
- `baseUrl` con o sin `/` final el 26/10.
- `@InstallIn(Singleton::class)` con `jakarta.inject.Singleton` el 26/10.
- Versiones que no se ven: `hilt-navigation-compose`, `lifecycle-runtime-compose`, DataStore y Coil.

### Prácticas raras del código de clase (para no copiarlas sin pensar)
- Estado del ViewModel no observable en TipCalculator (07/10).
- `viewModel.load()` llamado dentro del `when` durante la composición (23/10).
- La lista seguía leyendo de `viewModel.readAll()` aunque ya se recogía `state` (16/10).
- `runBlocking` en el `init` del repositorio (09/11).
- `pokemons.add(pokemon!!)` y `body()!!`: se cae si la API falla.
- `provideHttpClient()` devuelve `PokeApi`.
- `@Provides` de Room sin `@Singleton` (13/11).
- Fechas como `String` y `"9999.31.12"` como fecha provisional.

### Lo que no ha salido en ninguna clase de Android
- Intents implícitos.
- Pruebas (`test` y `androidTest`).
- Relaciones en Room (`@Relation`, `ForeignKey`).
- OkHttp y los interceptores.
- `buildConfigField` y `BASE_URL`.
- Barra de navegación inferior y `popUpTo`.
- Localización más allá del `stringResource` del 07/10.