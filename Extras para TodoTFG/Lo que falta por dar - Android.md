# Android: lo que piden y no se ha dado (o se dio a medias)

> **Esto no es de clase.** Es la forma más estándar de hacer lo que piden los requisitos y no ha salido en las clases, o lo que se quedó sin ver en las capturas. Si en la defensa os preguntan, decid que lo habéis buscado vosotros.

Todos los ejemplos usan la misma app de ejemplo: una tienda con **categorías** y **productos** (una categoría tiene muchos productos). Cambiad los nombres por los de vuestro proyecto.

**Comprobado:** todo el código de este archivo compila (`assembleDebug`) con las versiones de clase: Kotlin 2.4, Compose, Hilt 2.60.1, Navigation 2.10.2, Room 3.0.3, Retrofit 3.0.0 y DataStore 1.3.0. No se ha probado en el emulador. Las pantallas que salen en los apartados 9 y 10 (`LoginScreen`, `ProductosScreen`, `CrearProductoContent`…) son las vuestras: al compilar se cambiaron por pantallas provisionales con un `Text` y un `Button`.

## Índice
1. Intent implícito
2. Localización en inglés y español
3. Room con relaciones (1 a N)
4. Room como fuente de verdad: leer con `Flow` y refrescar desde la API
5. DataStore: el módulo, el modo oscuro en el tema y el token
6. Llamar a vuestra API desde el emulador
7. Mandar el token en cada petición (interceptor)
8. `POST`, `PUT` y `DELETE` con Retrofit
9. Barra inferior y login que no vuelve atrás
10. Volver atrás después de guardar
11. Cómo hacer bien las "prácticas raras" de clase
12. Dependencias de Gradle

---

## 1. Intent implícito

**Qué es:** pedirle a Android "abre esto con la app que sepa hacerlo", sin decir cuál. El sistema busca una app que acepte esa acción: el marcador para un teléfono, Maps para una dirección, Gmail para un correo. Un intent **explícito** dice la clase exacta que se abre; uno **implícito** solo dice la acción y los datos.

Las cuatro acciones típicas:

| Acción | Para qué | Datos |
|---|---|---|
| `Intent.ACTION_DIAL` | Abrir el marcador con el número puesto (no llama solo, así que no necesita permiso) | `tel:954000000` |
| `Intent.ACTION_VIEW` | Abrir un mapa | `geo:0,0?q=Calle Mayor 1, Sevilla` |
| `Intent.ACTION_SENDTO` | Escribir un correo | `mailto:alguien@ejemplo.com` |
| `Intent.ACTION_SEND` | Compartir texto con cualquier app | `type = "text/plain"` y `EXTRA_TEXT` |

```kotlin
fun abrirIntent(context: Context, intent: Intent) {
    try {
        context.startActivity(intent)
    } catch (e: ActivityNotFoundException) {
        Toast.makeText(context, "No hay ninguna app para abrir esto", Toast.LENGTH_SHORT).show()
    }
}

@Composable
fun BotonesContacto(
    telefono: String,
    direccion: String,
    correo: String,
    textoCompartir: String,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    Column(modifier = modifier) {
        Button(onClick = {
            abrirIntent(context, Intent(Intent.ACTION_DIAL, Uri.parse("tel:$telefono")))
        }) { Text("Llamar") }

        Button(onClick = {
            val uri = Uri.parse("geo:0,0?q=" + Uri.encode(direccion))
            abrirIntent(context, Intent(Intent.ACTION_VIEW, uri))
        }) { Text("Cómo llegar") }

        Button(onClick = {
            abrirIntent(context, Intent(Intent.ACTION_SENDTO, Uri.parse("mailto:$correo")))
        }) { Text("Enviar correo") }

        Button(onClick = {
            val enviar = Intent(Intent.ACTION_SEND).apply {
                type = "text/plain"
                putExtra(Intent.EXTRA_TEXT, textoCompartir)
            }
            abrirIntent(context, Intent.createChooser(enviar, "Compartir con"))
        }) { Text("Compartir") }
    }
}
```

- `LocalContext.current` da el `Context` dentro de un composable. Hace falta para `startActivity`.
- `Uri.encode(direccion)` cambia los espacios y las comas para que la dirección vaya bien en la URI.
- `Intent.createChooser` saca el menú de "Compartir con…" aunque haya una app marcada por defecto.
- El `try/catch` es para cuando no hay ninguna app que lo abra (pasa en emuladores sin Maps o sin correo). Sin él, la app se cierra con `ActivityNotFoundException`.
- Android Studio puede proponer `"tel:$telefono".toUri()` en vez de `Uri.parse(...)`. Es lo mismo, pero más corto (viene de `core-ktx`).

---

## 2. Localización en inglés y español

**Cómo funciona:** cada texto de la app va en un archivo de recursos con un nombre (`R.string.productos`). Android elige la carpeta según el idioma del móvil: `values-es` si está en español, y `values` (la carpeta por defecto) en cualquier otro idioma.

`app/src/main/res/values/strings.xml` (inglés, el de por defecto):
```xml
<resources>
    <string name="app_name">Shop</string>
    <string name="productos">Products</string>
    <string name="pedidos">Orders</string>
    <string name="ajustes">Settings</string>
    <string name="saludo">Hi, %1$s</string>
</resources>
```

`app/src/main/res/values-es/strings.xml` (español):
```xml
<resources>
    <string name="app_name">Tienda</string>
    <string name="productos">Productos</string>
    <string name="pedidos">Pedidos</string>
    <string name="ajustes">Ajustes</string>
    <string name="saludo">Hola, %1$s</string>
</resources>
```

En la pantalla:
```kotlin
Text(stringResource(R.string.productos))
Text(stringResource(R.string.saludo, nombreUsuario))
```

- `%1$s` es un hueco para un texto: el `1` es el primer argumento y la `s` dice que es un String. Para números, `%1$d`.
- La carpeta `values-es` se crea con clic derecho en `res` → New → Android Resource File, eligiendo "Locale" y "es". Así sale el archivo ya en su sitio.
- **Translations Editor** (clic derecho en `strings.xml` → Open Translations Editor) enseña en rojo los textos que faltan por traducir.
- **No escribáis textos a mano en los composables** (`Text("Productos")`). Es lo primero que se ve si os piden cambiar el idioma en la defensa.
- Para probarlo: en el emulador, Ajustes → Sistema → Idiomas, y poned inglés el primero.
- **Cambiar el idioma desde dentro de la app** no lo piden y es más lío (`AppCompatDelegate.setApplicationLocales`, que pide `AppCompatActivity`). Para el requisito de DataStore basta con el modo oscuro, como en clase.

---

## 3. Room con relaciones (1 a N)

En clase solo hubo una tabla (`pokemon`). Con dos tablas relacionadas hacen falta tres cosas:

1. **La clave ajena (`ForeignKey`)** en la tabla hija, para que la base no deje guardar un producto con una categoría que no existe.
2. **Un índice** en la columna de la clave ajena. Si no, Room avisa en la compilación.
3. **Una clase con `@Embedded` y `@Relation`**, para leer de una vez una categoría junto con sus productos.

```kotlin
import androidx.room3.Dao
import androidx.room3.Database
import androidx.room3.Delete
import androidx.room3.Embedded
import androidx.room3.Entity
import androidx.room3.ForeignKey
import androidx.room3.Index
import androidx.room3.PrimaryKey
import androidx.room3.Query
import androidx.room3.Relation
import androidx.room3.Room
import androidx.room3.RoomDatabase
import androidx.room3.Transaction
import androidx.room3.Upsert

@Entity(tableName = "categoria")
data class CategoriaEntity(
    @PrimaryKey val id: Int,
    val nombre: String
)

@Entity(
    tableName = "producto",
    foreignKeys = [
        ForeignKey(
            entity = CategoriaEntity::class,
            parentColumns = ["id"],
            childColumns = ["categoriaId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index("categoriaId")]
)
data class ProductoEntity(
    @PrimaryKey val id: Int,
    val nombre: String,
    val precio: Double,
    val categoriaId: Int
)

data class CategoriaConProductos(
    @Embedded val categoria: CategoriaEntity,
    @Relation(parentColumns = ["id"], entityColumns = ["categoriaId"])
    val productos: List<ProductoEntity>
)

@Dao
interface TiendaDao {
    @Query("SELECT * FROM producto ORDER BY nombre")
    fun observeProductos(): Flow<List<ProductoEntity>>

    @Query("SELECT * FROM producto WHERE id = :id")
    fun observeProducto(id: Int): Flow<ProductoEntity?>

    @Transaction
    @Query("SELECT * FROM categoria ORDER BY nombre")
    fun observeCategoriasConProductos(): Flow<List<CategoriaConProductos>>

    @Upsert
    suspend fun upsertCategorias(categorias: List<CategoriaEntity>)

    @Upsert
    suspend fun upsertProductos(productos: List<ProductoEntity>)

    @Delete
    suspend fun deleteProducto(producto: ProductoEntity)
}

@Database(
    entities = [CategoriaEntity::class, ProductoEntity::class],
    version = 1,
    exportSchema = false
)
abstract class TiendaDatabase : RoomDatabase() {
    abstract fun tiendaDao(): TiendaDao
}
```

- **⚠️ Room 3 no se escribe igual que Room 2.** En Room 3, `@Relation` lleva `parentColumns = ["id"]` y `entityColumns = ["categoriaId"]` (en plural y entre corchetes). En Room 2, y en casi todos los tutoriales de internet, se escribe `parentColumn = "id"` y `entityColumn = "categoriaId"`. Con Room 3 eso da el error `Cannot have empty 'parentColumns' in @Relation`. Los imports también cambian: `androidx.room3.*` en vez de `androidx.room.*`.
- `onDelete = ForeignKey.CASCADE`: si se borra una categoría, se borran sus productos. Con `ForeignKey.RESTRICT` no dejaría borrar una categoría que tenga productos.
- `@Transaction` en la consulta con `@Relation`: Room hace dos consultas (las categorías y luego sus productos) y así las hace a la vez, sin que nada cambie en medio.
- **`@Upsert`** inserta si no existe y actualiza si ya existe. No uséis `@Insert(onConflict = OnConflictStrategy.REPLACE)` en una tabla padre: `REPLACE` borra la fila y la vuelve a crear, y con `CASCADE` eso **borra también todos sus hijos**.
- Las consultas que devuelven `Flow` **no** llevan `suspend`: el `Flow` ya avisa solo cada vez que cambia la tabla. Las que escriben (`@Upsert`, `@Delete`) sí llevan `suspend`.
- `exportSchema = false` quita el aviso *Schema export directory* que salió en clase el 13/11.

El módulo de Hilt es el de clase con dos cambios: `object` en vez de `class` (no hace falta crear instancias) y **`@Singleton`** en la base de datos:
```kotlin
@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {
    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): TiendaDatabase =
        Room.databaseBuilder<TiendaDatabase>(context = context, name = "tienda_db").build()

    @Provides
    fun provideTiendaDao(db: TiendaDatabase): TiendaDao = db.tiendaDao()
}
```
Sin `@Singleton`, Hilt crea una base de datos nueva cada vez que alguien pide el DAO.

---

## 4. Room como fuente de verdad: leer con `Flow` y refrescar desde la API

Es lo que se empezó el 09/11 y el 16/11 y no se llegó a ver entero: el repositorio lee **siempre de Room**, y `refresh()` trae los datos de la API y los guarda en Room. Como la pantalla escucha a Room, se actualiza sola en cuanto llegan los datos. Si no hay internet, la app enseña lo último que guardó.

```kotlin
data class Producto(
    val id: Int,
    val nombre: String,
    val precio: Double,
    val categoriaId: Int
)

fun ProductoEntity.toModel() = Producto(id, nombre, precio, categoriaId)

fun ProductoDto.toEntity() = ProductoEntity(
    id = id,
    nombre = nombre,
    precio = precio.toDouble(),
    categoriaId = categoria.id
)

fun CategoriaDto.toEntity() = CategoriaEntity(id = id, nombre = nombre)

interface ProductoRepository {
    val productos: Flow<List<Producto>>
    suspend fun refresh()
}

class ProductoRepositoryImpl @Inject constructor(
    private val dao: TiendaDao,
    private val api: TiendaApi
) : ProductoRepository {

    override val productos: Flow<List<Producto>> =
        dao.observeProductos().map { lista -> lista.map { it.toModel() } }

    override suspend fun refresh() {
        val respuesta = api.getProductos()
        val pagina = respuesta.body()
        if (!respuesta.isSuccessful || pagina == null) {
            throw IOException("La API respondió ${respuesta.code()}")
        }
        dao.upsertCategorias(pagina.items.map { it.categoria.toEntity() }.distinctBy { it.id })
        dao.upsertProductos(pagina.items.map { it.toEntity() })
    }
}
```

- Se guardan **primero las categorías y después los productos**. Al revés, la clave ajena no deja guardar productos de categorías que todavía no existen.
- `precio.toDouble()`: Prisma manda los `Decimal` como texto en el JSON (`"59.9"`), por eso el DTO lo tiene como `String`.
- En vez de `body()!!` (como en clase), se comprueba si la respuesta fue bien y, si no, se lanza una excepción que el ViewModel recoge.

El ViewModel lanza `refresh()` en el `init`, **dentro de `viewModelScope.launch`** (en clase se probó `runBlocking` en el repositorio, que bloquea la app mientras carga):
```kotlin
sealed interface ProductosUiState {
    data object Loading : ProductosUiState
    data class Success(val productos: List<Producto>) : ProductosUiState
    data class Error(val mensaje: String) : ProductosUiState
}

@HiltViewModel
class ProductosViewModel @Inject constructor(
    private val repository: ProductoRepository
) : ViewModel() {

    private val _error = MutableStateFlow<String?>(null)

    val uiState: StateFlow<ProductosUiState> =
        combine(repository.productos, _error) { productos, error ->
            if (productos.isEmpty() && error != null) {
                ProductosUiState.Error(error)
            } else {
                ProductosUiState.Success(productos)
            }
        }.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000L),
            initialValue = ProductosUiState.Loading
        )

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            try {
                _error.value = null
                repository.refresh()
            } catch (e: IOException) {
                _error.value = e.message ?: "No hay conexión"
            }
        }
    }
}
```

- `combine` junta dos `Flow` (lo que hay en Room y el error) en un solo estado. Se recalcula cada vez que cambia cualquiera de los dos.
- Solo se enseña `Error` si **no hay nada guardado**. Si hay datos viejos en Room, se enseñan aunque falle la red: eso es "offline first".
- Se captura `IOException`, que es lo que lanza Retrofit cuando no hay red. Con `catch (e: Exception)` se capturarían también cosas que no se deben tapar, como la cancelación de la corrutina.
- Así se rellena el estado `Error`, que en clase no se llegó a ver.

---

## 5. DataStore: el módulo, el modo oscuro en el tema y el token

El 18/11 no se vio de dónde sale el `DataStore<Preferences>` que recibe `SettingsDataStore`, ni cómo llega el modo oscuro al tema. Se hace así.

**El módulo.** Se crea una sola vez, con una propiedad de extensión de `Context`, y Hilt la reparte:
```kotlin
private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "ajustes")

@Module
@InstallIn(SingletonComponent::class)
object DataStoreModule {
    @Provides
    @Singleton
    fun provideDataStore(@ApplicationContext context: Context): DataStore<Preferences> =
        context.dataStore
}
```
- `by preferencesDataStore(name = "ajustes")` crea el archivo `ajustes.preferences_pb` la primera vez que se usa.
- La línea `private val Context.dataStore` va **fuera de cualquier clase**, arriba del archivo. Si se crean dos DataStore con el mismo nombre, la app se cae.

**El ViewModel.** Aquí se lee el DataStore directamente para que el ejemplo sea corto; en clase iba con DataSource y repositorio, y es mejor seguir así.
```kotlin
@HiltViewModel
class AjustesViewModel @Inject constructor(
    private val dataStore: DataStore<Preferences>
) : ViewModel() {

    private val modoOscuroKey = booleanPreferencesKey("modo_oscuro")

    val modoOscuro: StateFlow<Boolean> = dataStore.data
        .map { preferences -> preferences[modoOscuroKey] ?: false }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000L), false)

    fun cambiarModoOscuro(activado: Boolean) {
        viewModelScope.launch {
            dataStore.edit { preferences -> preferences[modoOscuroKey] = activado }
        }
    }
}
```
`dataStore.edit { }` hace lo mismo que el `updateData { it.toMutablePreferences().also { … } }` de clase, pero es más corto.

**Cómo llega al tema.** En `MainActivity`, por encima de todo:
```kotlin
@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    private val ajustesViewModel: AjustesViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val modoOscuro by ajustesViewModel.modoOscuro.collectAsStateWithLifecycle()
            MiAppTheme(darkTheme = modoOscuro) {
                AppNavHost()
            }
        }
    }
}
```
- `MiAppTheme` es la función de `Theme.kt` que crea Android Studio (se llama como vuestro proyecto). Ya trae el parámetro `darkTheme`.
- `by viewModels()` es la forma de pedir un `@HiltViewModel` desde una Activity (en un composable se usa `hiltViewModel()`). Se usó igual el 13/11 para el splash.
- La pantalla de ajustes puede pedir su propio `hiltViewModel<AjustesViewModel>()`: los dos leen el mismo DataStore, así que el tema cambia nada más tocar el `Switch`.

**Guardar el token del login** es igual, pero con `stringPreferencesKey`:
```kotlin
@Singleton
class SesionDataStore @Inject constructor(
    private val dataStore: DataStore<Preferences>
) {
    private val tokenKey = stringPreferencesKey("token")

    val token: Flow<String?> = dataStore.data.map { preferences -> preferences[tokenKey] }

    suspend fun guardarToken(token: String) {
        dataStore.edit { preferences -> preferences[tokenKey] = token }
    }

    suspend fun borrarToken() {
        dataStore.edit { preferences -> preferences.remove(tokenKey) }
    }
}
```
Después del login: `sesion.guardarToken(respuesta.token)`. Al cerrar sesión: `sesion.borrarToken()`.

---

## 6. Llamar a vuestra API desde el emulador

En clase se llamó a PokeAPI, que está en internet y va por `https`. Vuestra API corre en vuestro ordenador y va por `http`. Hacen falta cuatro cosas.

**1. La dirección: `10.0.2.2`, no `localhost`.** Dentro del emulador, `localhost` es el propio emulador. `10.0.2.2` es el `localhost` de vuestro ordenador. En un móvil de verdad, poned la IP del ordenador en la wifi (`ipconfig` en Windows) y tened los dos en la misma red.

**2. La URL en `build.gradle.kts` (de `app`)**, para no escribirla en el código y poder cambiarla según la versión:
```kotlin
android {
    defaultConfig {
        buildConfigField("String", "BASE_URL", "\"http://10.0.2.2:3000/\"")
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
}
```
Después de sincronizar Gradle y compilar, se usa como `BuildConfig.BASE_URL`. Las comillas escapadas (`\"…\"`) son porque el valor se copia tal cual en una clase Java: tiene que llevar sus propias comillas.

**3. Permitir `http`.** Desde Android 9, las apps solo pueden usar `https`. Para desarrollo, se permite `http` solo para el ordenador. Archivo nuevo `app/src/main/res/xml/network_security_config.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="false">10.0.2.2</domain>
        <domain includeSubdomains="false">localhost</domain>
    </domain-config>
</network-security-config>
```

**4. El manifest**, con el permiso de internet (salió el 26/10) y el archivo anterior:
```xml
<uses-permission android:name="android.permission.INTERNET" />

<application
    android:networkSecurityConfig="@xml/network_security_config"
    ...>
```

La `baseUrl` **acaba en `/`** y las rutas de `@GET` **no empiezan por `/`** (`@GET("api/productos")`). Si no, Retrofit lanza `baseUrl must end in /` o se come parte de la ruta.

---

## 7. Mandar el token en cada petición (interceptor)

**Qué es un interceptor:** una clase por la que pasa cada petición antes de salir. Aquí se usa para añadir la cabecera `Authorization: Bearer <token>` a todas, en vez de ponerla a mano en cada función de la API. Es de OkHttp, la librería que usa Retrofit por debajo para hacer las peticiones.

```kotlin
class AuthInterceptor @Inject constructor(
    private val sesion: SesionDataStore
) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): okhttp3.Response {
        val token = runBlocking { sesion.token.first() }
        val peticion = chain.request().newBuilder()
        if (!token.isNullOrEmpty()) {
            peticion.header("Authorization", "Bearer $token")
        }
        return chain.proceed(peticion.build())
    }
}
```
- `sesion.token.first()` lee el valor actual del `Flow` y deja de escuchar.
- Aquí **sí** vale `runBlocking`: OkHttp ejecuta el interceptor en su propio hilo, no en el de la pantalla, así que no congela nada.
- Se escribe `okhttp3.Response` entero porque Retrofit también tiene una clase `Response` y se confundirían.

El `NetworkModule` de clase, con OkHttp en medio:
```kotlin
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides
    @Singleton
    fun provideOkHttpClient(authInterceptor: AuthInterceptor): OkHttpClient {
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
        return OkHttpClient.Builder()
            .addInterceptor(authInterceptor)
            .addInterceptor(logging)
            .build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(client: OkHttpClient): Retrofit =
        Retrofit.Builder()
            .baseUrl(BuildConfig.BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()

    @Provides
    @Singleton
    fun provideTiendaApi(retrofit: Retrofit): TiendaApi = retrofit.create(TiendaApi::class.java)
}
```
- `HttpLoggingInterceptor` escribe en el **Logcat** cada petición y cada respuesta, con el JSON. Es lo más útil para saber por qué falla una llamada (filtrad por `okhttp`).
- En clase, `provideHttpClient()` devolvía directamente la API. Aquí cada `@Provides` crea una sola cosa y se llama como lo que devuelve.

---

## 8. `POST`, `PUT` y `DELETE` con Retrofit

En clase solo hubo `@GET`. El resto es igual, con `@Body` para mandar un objeto como JSON:
```kotlin
data class PaginaDto<T>(
    val items: List<T>,
    val total: Int,
    val page: Int,
    val limit: Int,
    val totalPages: Int
)

data class CategoriaDto(val id: Int, val nombre: String)

data class ProductoDto(
    val id: Int,
    val nombre: String,
    val precio: String,
    val stock: Int,
    val categoria: CategoriaDto
)

data class NuevoProductoDto(
    val nombre: String,
    val precio: Double,
    val stock: Int,
    val categoriaId: Int
)

interface TiendaApi {
    @GET("api/productos")
    suspend fun getProductos(
        @Query("q") q: String? = null,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 50
    ): Response<PaginaDto<ProductoDto>>

    @GET("api/productos/{id}")
    suspend fun getProducto(@Path("id") id: Int): Response<ProductoDto>

    @POST("api/productos")
    suspend fun crearProducto(@Body producto: NuevoProductoDto): Response<ProductoDto>

    @PUT("api/productos/{id}")
    suspend fun actualizarProducto(
        @Path("id") id: Int,
        @Body producto: NuevoProductoDto
    ): Response<ProductoDto>

    @DELETE("api/productos/{id}")
    suspend fun borrarProducto(@Path("id") id: Int): Response<Unit>
}
```
- `@Query("q")` añade `?q=...` a la URL. Si el valor es `null`, Retrofit no lo pone.
- `@Body` convierte el objeto en JSON con Gson. Los nombres de las propiedades tienen que ser **iguales** que los del JSON de la API. Si no, `@SerializedName("nombre_en_json")` encima de la propiedad.
- `Response<Unit>` para cuando la API no devuelve nada (un `204` al borrar).
- Hay un DTO para lo que se recibe (`ProductoDto`, con `id`) y otro para lo que se manda (`NuevoProductoDto`, sin `id`, porque lo pone la base). Es como `Omit<Post, 'id'>` en Angular.
- `PaginaDto<ProductoDto>` es el formato del listado paginado del backend (ver el otro archivo, apartado 3).

En el repositorio, después de crear, editar o borrar en la API, se hace lo mismo en Room (o se llama a `refresh()`), y la pantalla se actualiza sola.

---

## 9. Barra inferior y login que no vuelve atrás

Dos cosas que casi todas las apps necesitan y que no salieron en clase.

**Las rutas** son las de clase (`@Serializable`):
```kotlin
@Serializable
sealed class Ruta {
    @Serializable
    object Login : Ruta()

    @Serializable
    object Productos : Ruta()

    @Serializable
    object Pedidos : Ruta()

    @Serializable
    object Ajustes : Ruta()

    @Serializable
    object CrearProducto : Ruta()
}
```

**La barra.** Una lista con las pestañas y un `NavigationBar` de Material 3:
```kotlin
data class ItemBarra(
    val ruta: Ruta,
    @StringRes val texto: Int,
    val icono: ImageVector
)

val itemsBarra = listOf(
    ItemBarra(Ruta.Productos, R.string.productos, Icons.Default.Home),
    ItemBarra(Ruta.Pedidos, R.string.pedidos, Icons.Default.ShoppingCart),
    ItemBarra(Ruta.Ajustes, R.string.ajustes, Icons.Default.Settings),
)

@Composable
fun BarraInferior(navController: NavHostController, destino: NavDestination?) {
    NavigationBar {
        itemsBarra.forEach { item ->
            NavigationBarItem(
                selected = destino?.hierarchy?.any { it.hasRoute(item.ruta::class) } == true,
                onClick = {
                    navController.navigate(item.ruta) {
                        popUpTo<Ruta.Productos> { saveState = true }
                        launchSingleTop = true
                        restoreState = true
                    }
                },
                icon = { Icon(item.icono, contentDescription = null) },
                label = { Text(stringResource(item.texto)) }
            )
        }
    }
}
```
- `hasRoute(item.ruta::class)` comprueba si la pantalla actual es la de esa pestaña. `hierarchy` sirve para que siga marcada si estáis dentro de un grafo anidado de esa pestaña.
- **`popUpTo<Ruta.Productos>`**: antes de ir a la pestaña, quita de la pila todo lo que haya encima de la primera pestaña. Sin esto, cada toque apila una pantalla más y el botón atrás recorre todo el historial.
- `saveState` y `restoreState`: si estabais en el detalle de un producto y cambiáis de pestaña, al volver seguís en el detalle.
- `launchSingleTop`: tocar dos veces la misma pestaña no la abre dos veces.
- Muchos ejemplos de internet ponen `popUpTo(navController.graph.findStartDestination().id)`. **Si vuestra primera pantalla es el login, eso no funciona**: el login ya no está en la pila después de entrar, y entonces no se quita nada.

**El `NavHost` con la barra**, que solo sale en las pantallas de las pestañas:
```kotlin
@Composable
fun AppNavHost(modifier: Modifier = Modifier) {
    val navController = rememberNavController()
    val entrada by navController.currentBackStackEntryAsState()
    val destino = entrada?.destination
    val mostrarBarra = itemsBarra.any { item -> destino?.hasRoute(item.ruta::class) == true }

    Scaffold(
        modifier = modifier,
        bottomBar = {
            if (mostrarBarra) BarraInferior(navController, destino)
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Ruta.Login,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable<Ruta.Login> {
                LoginScreen(onEntrar = {
                    navController.navigate(Ruta.Productos) {
                        popUpTo<Ruta.Login> { inclusive = true }
                    }
                })
            }
            composable<Ruta.Productos> {
                ProductosScreen(onAnadir = { navController.navigate(Ruta.CrearProducto) })
            }
            composable<Ruta.CrearProducto> {
                CrearProductoScreen(onCreado = { navController.popBackStack() })
            }
            composable<Ruta.Pedidos> { PedidosScreen() }
            composable<Ruta.Ajustes> { AjustesScreen() }
        }
    }
}
```
- `currentBackStackEntryAsState()` es la pantalla que se ve ahora, como estado: cuando se navega, se recompone y la barra aparece o desaparece.
- **`popUpTo<Ruta.Login> { inclusive = true }`**: al entrar, quita el login de la pila (con `inclusive` se quita también él). Así, el botón atrás desde Productos cierra la app en vez de volver al login.
- `Icons.Default.*` está en `material-icons-core`. Si Android Studio no encuentra `Icons`, mirad el apartado 12.
- Si las pantallas de dentro tienen su propio `Scaffold`, puede salir un hueco doble arriba o abajo. Se arregla pasando `Modifier.consumeWindowInsets(innerPadding)` junto al `padding`.

---

## 10. Volver atrás después de guardar

En clase, `popBackStack()` solo salió el 18/11 y no se vio cómo volver después de crear una tarea. El problema es que guardar tarda (es una corrutina) y hay que volver **cuando termine**, no al pulsar el botón. Se hace mirando el estado:
```kotlin
sealed interface CrearProductoState {
    data object Initial : CrearProductoState
    data object Creating : CrearProductoState
    data object Created : CrearProductoState
    data class Error(val mensaje: String) : CrearProductoState
}

@Composable
fun CrearProductoScreen(
    onCreado: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: CrearProductoViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    LaunchedEffect(state) {
        if (state is CrearProductoState.Created) {
            onCreado()
        }
    }

    CrearProductoContent(state = state, onGuardar = viewModel::onGuardar, modifier = modifier)
}
```
- **`LaunchedEffect(state)`** ejecuta el bloque una vez cada vez que cambia `state`, y no en cada recomposición. Si se llamara a `onCreado()` directamente dentro del composable, se ejecutaría varias veces.
- En el `NavHost`: `CrearProductoScreen(onCreado = { navController.popBackStack() })`. La pantalla sigue sin conocer el `navController`, como en clase.
- Lo mismo sirve para el login: cuando el estado pasa a `Success`, se llama a `onEntrar()`.

---

## 11. Cómo hacer bien las "prácticas raras" de clase

En los resúmenes de clase hay una lista de cosas que se hicieron así en directo pero que no conviene copiar. Así se hacen bien:

| En clase | Mejor así | Por qué |
|---|---|---|
| `runBlocking { refresh() }` en el `init` del repositorio | `viewModelScope.launch { repository.refresh() }` en el `init` del ViewModel (apartado 4) | `runBlocking` congela la app hasta que responde la red. |
| `pokemons.add(pokemon!!)` y `body()!!` | Comprobar `isSuccessful` y que `body()` no sea `null`, y si no, lanzar una excepción (apartado 4) | Con `!!`, si la API falla, la app se cierra. |
| `@Provides` de Room sin `@Singleton` | Con `@Singleton` (apartado 3) | Si no, se crea una base de datos nueva en cada inyección. |
| `viewModel.load()` dentro del `when` de la pantalla | En el `init` del ViewModel | El composable se ejecuta muchas veces y cargaría una y otra vez. |
| `provideHttpClient()` devuelve la API | Un `@Provides` para el cliente, otro para Retrofit y otro para la API (apartado 7) | Cada función crea una cosa y se llama como lo que crea. |
| Fechas como `String` (`"9999.31.12"`) | `LocalDate` en el modelo, y texto ISO (`"2026-12-31"`) solo en el DTO y en Room | Con texto no se puede ordenar ni comparar bien. |

---

## 12. Dependencias de Gradle

Lo que hay que añadir a `app/build.gradle.kts` para todo lo de este archivo, además de lo de clase. Es mejor pasarlo a `libs.versions.toml`, como en clase el 13/11.
```kotlin
implementation("com.squareup.retrofit2:retrofit:3.0.0")
implementation("com.squareup.retrofit2:converter-gson:3.0.0")
implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
implementation("androidx.room3:room3-runtime:3.0.3")
ksp("androidx.room3:room3-compiler:3.0.3")
implementation("androidx.datastore:datastore-preferences:1.3.0")
implementation("androidx.compose.material:material-icons-core")
```
- `logging-interceptor` va en la versión **4.12.0** porque es la de OkHttp que trae Retrofit 3.0.0. Si se mezclan versiones de OkHttp, puede fallar al arrancar.
- `material-icons-core` no lleva versión porque la pone el BOM de Compose. Trae los iconos básicos (`Home`, `Settings`, `ShoppingCart`, `Add`…). Para todos los iconos, `material-icons-extended`, que pesa bastante más.
- `ksp(...)` en vez de `implementation(...)` para los compiladores (Room y Hilt): generan código al compilar y no van dentro de la app.
