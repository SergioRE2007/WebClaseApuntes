# ToDoApp (Android + Kotlin + Compose + Hilt): código de clase explicado

> Fuente: `TODO Android.docx` (27 capturas de Android Studio, paquete raíz `com.alanturing.todoapp`).
> Las capturas van en el orden en que el profesor construye la app, así que algunos archivos aparecen en varias versiones (de borrador a final).

---

## 0. Cómo leer este documento

Etiquetas que uso en cada bloque de código:

| Etiqueta | Significado |
|---|---|
| **[Captura N]** | Código transcrito de esa captura (N = posición en el docx, del 1 al 27). |
| **[Fragmento]** | La captura corta el código; solo transcribo lo que se ve. |
| **[Reconstruido]** | No aparece en ninguna captura, pero hace falta para que todo encaje. Lo deduzco de cómo se usa en otras capturas. Contrástalo con tus apuntes. |

Dos cosas que conviene saber de las capturas:

- Los recuadros grises pequeños tipo `id =`, `paddingValues =`, `value =`, `start =`, `route =` son **pistas del IDE** (inlay hints). No se escriben. En mi transcripción los he quitado.
- Los textos "2 Usages", "1 Usage", "10 Usages 3 Inheritors" y los iconos de bombilla también son del IDE.

---

## 1. Qué es la app y qué arquitectura tiene

Una **lista de tareas**: ver la lista, crear una tarea nueva y editar una existente.

```
  UI (Compose)        ViewModel                  Repositorio
  TaskListScreen   -> TaskListViewModel   --+
  TaskCreateScreen -> TaskCreateViewModel --+--> TaskRepository (interfaz)
  TaskDetailScreen -> TaskDetailViewModel --+            ^
                                                         |  implementa
                                                 TaskRepositoryInMemory
                                                 (lista en memoria)

  Hilt inyecta cada pieza.
  ApplicationModule decide qué implementación se usa.
```

Tecnologías que aparecen:

- **Kotlin** como lenguaje.
- **Jetpack Compose + Material3** para la interfaz.
- **Hilt (Dagger)** para inyección de dependencias.
- **Navigation Compose** con rutas tipadas (`kotlinx.serialization`).
- **ViewModel**, **corrutinas** y **StateFlow** para el estado.

---

## 2. Índice de capturas

| # | Qué muestra | Sección |
|---|---|---|
| 1 | Estructura inicial del proyecto y `ApplicationModule` vacío | 3.1 |
| 2 | Estructura con `data/repository` (`TaskRepository`, `TaskRepositoryInMemory`, `Task`) | 3.1 |
| 3 | `ApplicationModule` con `@InstallIn` (borrador del binding) | 3.3 |
| 4 | `TaskRepositoryInMemory` (primera versión) | 3.4 |
| 5 | `MainActivity` con `@AndroidEntryPoint` e `@Inject` | 3.5 |
| 6 | `TaskListScreen`: `Scaffold` vacío | 3.6 |
| 7 | `LazyColumn` + `items` + `key` | 3.6 |
| 8 | Llamada a `TaskCard` y su definición con `Card` vacío | 3.6 |
| 9 | `TaskCard` completo (`Column`, `Text`, `Row`, `Switch`) | 3.6 |
| 10 | Botón flotante (FAB) con icono | 3.6 |
| 11 | `TaskListScreen` con FAB y `LazyColumn` | 3.6 |
| 12 | Truco temporal: `botonPulsado` y `repository.create("Dummy")` | 3.7 |
| 13 | `else { TaskCreateScreen() }` | 3.7 |
| 14 | `ApplicationModule` final con `@Binds` y `@Singleton` | 3.3 |
| 15 | `Routes.kt` (rutas de navegación) | 3.8 |
| 16 | `TaskListViewModel` | 3.9 |
| 17 | `TaskCreateScreen` (primera versión) | 3.10 |
| 18 | `TaskCreateViewModel` (primera versión) | 3.10 |
| 19 | Estructura final de paquetes (`taskcreate`, `taskdetail`, `tasklist`) | 3.11 |
| 20 | `TaskDetailScreen` | 3.12 |
| 21 | `TaskDetailViewModel` (`loadTask`, `onSave`) | 3.12 |
| 22 | `Routes.kt` otra vez, con `TaskDetail(id)` | 3.12 |
| 23 | `TaskDetailViewModel` con `SavedStateHandle` y `toRoute()` | 3.12 |
| 24 | `TaskRepositoryInMemory` con `StateFlow` y tareas Dummy | 3.13 |
| 25 | `TaskCreateViewModel` con `viewModelScope.launch` | 3.14 |
| 26 | `TaskCreateScreen` con `when (state)` aún vacío | 3.14 |
| 27 | `TaskCreateScreen` con `TaskCreateScreenState` | 3.14 |

---

## 3. Paso a paso, de cero al final

### 3.1 Estructura del proyecto y módulo de Hilt vacío (capturas 1 y 2)

Proyecto **ToDoApp**, dispositivo de pruebas Pixel 8a, paquete raíz `com.alanturing.todoapp`. Carpetas iniciales:

```
app
├─ manifests/AndroidManifest.xml
├─ kotlin+java/com.alanturing.todoapp
│  ├─ data              ← datos y repositorio
│  ├─ di                ← inyección de dependencias
│  │   ├─ ApplicationModule
│  │   └─ ToDoApplication
│  ├─ ui.theme          ← colores, tipografía, tema
│  └─ MainActivity
└─ Gradle Scripts       ← build.gradle.kts (proyecto y módulo), libs.versions.toml (catálogo de versiones)
```

Primer archivo que se toca, **[Captura 1]**:

```kotlin
package com.alanturing.todoapp.di

import dagger.Module

@Module
abstract class ApplicationModule {
}
```

- `@Module` marca la clase como un **módulo de Dagger/Hilt**: el sitio donde le explicas al framework cómo construir objetos que él no sabe crear solo (por ejemplo, una interfaz).
- Es `abstract` porque más adelante usará `@Binds`, que solo funciona sobre funciones abstractas.

En la **[Captura 2]** el árbol ya incluye la carpeta `data`:

```
data
├─ repository
│   ├─ TaskRepository            (icono de interfaz)
│   └─ TaskRepositoryInMemory    (clase)
└─ Task                          (clase)
```

La idea: `Task` es el **modelo**, `TaskRepository` el **contrato** y `TaskRepositoryInMemory` una **implementación** concreta.

---

### 3.2 El modelo `Task` y el contrato `TaskRepository` [Reconstruido]

Estos dos archivos no salen en ninguna captura, pero se deducen del uso:

- `it.id`, `it.title`, `it.description`, `it.isCompleted` aparecen en `TaskListScreen`.
- `create(title, description, limitDate)` devuelve una `Task`.
- `readAll()`, `readOne(id)`, `update(id, title, description)` y, más tarde, `tasks: Flow<List<Task>>`.

```kotlin
package com.alanturing.todoapp.data

data class Task(
    val id: Int,
    val title: String,
    val description: String,
    val limitDate: String,
    val isCompleted: Boolean = false,
)
```

```kotlin
package com.alanturing.todoapp.data.repository

import com.alanturing.todoapp.data.Task
import kotlinx.coroutines.flow.Flow

interface TaskRepository {
    val tasks: Flow<List<Task>>          // se añade en la captura 24
    fun readAll(): List<Task>
    fun readOne(id: Int): Task
    fun create(title: String, description: String, limitDate: String): Task
    fun update(id: Int, title: String, description: String)
}
```

**Por qué una interfaz y no una clase directamente:** las pantallas y los ViewModels solo conocen `TaskRepository`. Hoy los datos viven en memoria; mañana podrías cambiar a Room o a una API sin tocar la UI, solo cambiando una línea en `ApplicationModule`.

---

### 3.3 Hilt: unir la interfaz con su implementación (capturas 3 y 14)

**[Captura 3]**: borrador del módulo.

```kotlin
package com.alanturing.todoapp.di

import com.alanturing.todoapp.data.repository.TaskRepository
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

@Module
@InstallIn(SingletonComponent::class)
abstract class ApplicationModule {

    abstract fun bindTaskRepository(): TaskRepository
}
```

- `@InstallIn(SingletonComponent::class)`: instala el módulo en el componente que **vive lo mismo que la aplicación**.
- Esta versión es solo un borrador y no compila todavía: a la función le faltan la anotación `@Binds` y el parámetro con la implementación.

**[Captura 14]**: versión final del módulo.

```kotlin
package com.alanturing.todoapp.di

import com.alanturing.todoapp.data.repository.TaskRepository
import com.alanturing.todoapp.data.repository.TaskRepositoryInMemory
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class ApplicationModule {

    @Binds
    @Singleton
    abstract fun bindTaskRepository(repository: TaskRepositoryInMemory): TaskRepository
}
```

(La línea 17 sale cortada en la captura; el tipo de retorno `TaskRepository` coincide con la captura 3.)

Cómo se lee `bindTaskRepository`:

| Pieza | Significado |
|---|---|
| `@Binds` | "Cuando alguien pida un `TaskRepository`, dale lo que devuelva esta función." |
| Parámetro `TaskRepositoryInMemory` | La implementación concreta que se usará. |
| Tipo de retorno `TaskRepository` | La interfaz que se está "atando". |
| `@Singleton` | Se crea **una sola instancia** para toda la app. Es lo que hace que la lista de tareas se comparta entre pantallas. |

---

### 3.4 `TaskRepositoryInMemory`, primera versión (captura 4)

**[Captura 4] [Fragmento]**. El tooltip tapa la cabecera de la clase; la completo con la versión de la captura 24.

```kotlin
package com.alanturing.todoapp.data.repository

import com.alanturing.todoapp.data.Task
import javax.inject.Inject

class TaskRepositoryInMemory @Inject constructor() : TaskRepository {

    private val _taskList = mutableListOf<Task>()
    override fun readAll() = _taskList.toList()

    override fun readOne(id: Int): Task {
        return _taskList.first {
            it.id == id
        }
    }

    override fun create(
        title: String,
        description: String,
        limitDate: String
    ): Task {
        val newTask = Task(
            id = nextId,
            title = title,
            // ... la captura se corta aquí
```

El tooltip de Android Studio dice "TaskRepositoryInMemory() provides for bindTaskRepository". Es Hilt enseñando el enlace: el constructor marcado con `@Inject` es lo que usa `bindTaskRepository` para construir la implementación.

Conceptos de Kotlin que aparecen:

- `@Inject constructor()`: le dice a Hilt "sé construir esta clase con este constructor".
- `private val _taskList`: el guion bajo es la convención para una propiedad privada que respalda otra pública.
- `mutableListOf<Task>()`: lista modificable.
- `readAll() = _taskList.toList()`: función de **una expresión**, y `toList()` devuelve una **copia**, para que nadie de fuera modifique la lista interna.
- `readOne`: `first { it.id == id }` devuelve el primer elemento que cumple la condición, o lanza `NoSuchElementException` si no existe.
- `create(...)`: se llama con **argumentos con nombre** (`title = title`).

Resto de la clase [Reconstruido]:

```kotlin
    private var nextId = 1

    override fun create(title: String, description: String, limitDate: String): Task {
        val newTask = Task(
            id = nextId,
            title = title,
            description = description,
            limitDate = limitDate,
        )
        nextId++
        _taskList.add(newTask)
        return newTask
    }

    override fun update(id: Int, title: String, description: String) {
        val index = _taskList.indexOfFirst { it.id == id }
        _taskList[index] = _taskList[index].copy(title = title, description = description)
    }
}
```

---

### 3.5 `MainActivity` y `ToDoApplication` (captura 5)

**[Captura 5]**:

```kotlin
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    @Inject
    lateinit var repository: TaskRepository

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            ToDoAppTheme {
                TaskListScreen(
                    repository = repository
                )
            }
        }
    }
}
```

- `@AndroidEntryPoint`: permite que Hilt **inyecte dependencias en la Activity**.
- `@Inject lateinit var repository: TaskRepository`: Hilt rellena este campo antes de `onCreate`. `lateinit` significa "no lo inicializo aquí, prometo asignarlo antes de usarlo". Aquí Hilt recibe un `TaskRepositoryInMemory` gracias al `@Binds`.
- `enableEdgeToEdge()`: la app se dibuja bajo las barras del sistema.
- `setContent { ... }`: punto donde **empieza Compose**. `ToDoAppTheme` es el tema de `ui.theme` y dentro va la pantalla.
- En esta fase la Activity pasa el repositorio a mano a `TaskListScreen(repository = repository)`. Más adelante lo harán los ViewModels.

Para que `@AndroidEntryPoint` funcione hace falta una clase `Application` anotada con `@HiltAndroidApp`. Está en el paquete `di` (capturas 1, 2 y 19) pero no se ve su contenido [Reconstruido]:

```kotlin
package com.alanturing.todoapp.di

@HiltAndroidApp
class ToDoApplication : Application()
```

Y en el `AndroidManifest.xml`, dentro de `<application>`: `android:name=".di.ToDoApplication"`.

---

### 3.6 `TaskListScreen`: de `Scaffold` vacío a lista con botón flotante (capturas 6 a 11)

Esta pantalla se construye por capas. Cada captura añade una.

**Capa 1 — Scaffold vacío [Captura 6].** `Scaffold` es el esqueleto de una pantalla Material (barra superior, botón flotante, contenido...). Te da `innerPadding` para que tu contenido no quede tapado por las barras.

```kotlin
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.alanturing.todoapp.data.repository.TaskRepository

@Composable
fun TaskListScreen(
    modifier: Modifier = Modifier,
    repository: TaskRepository,
) {

    Scaffold(modifier = Modifier.fillMaxSize()) {
        innerPadding ->

    }

}
```

- `@Composable` marca una función que describe parte de la UI.
- `modifier: Modifier = Modifier`: parámetro con **valor por defecto**. Convención de Compose: toda pantalla o componente recibe un `modifier` para que quien lo llama pueda ajustarlo.
- `repository: TaskRepository` se recibe como parámetro. Es lo que se llama **elevar el estado**: la pantalla no crea sus datos, se los dan.

**Capa 2 — Lista con `LazyColumn` [Captura 7].** `LazyColumn` solo dibuja los elementos visibles (como un `RecyclerView`).

```kotlin
    Scaffold(modifier = Modifier.fillMaxSize()) {
        innerPadding ->
        val modifier = Modifier.consumeWindowInsets(innerPadding).padding( /* cortado en la captura */ )
        LazyColumn {
            items(
                items = repository.readAll(),
                key = {
                    it.id
                }
            ) {
                TaskCard(

                )
            }
        }
    }
```

- `items(items = ..., key = { it.id })`: por cada tarea se dibuja un bloque. `key` es un identificador estable para que Compose sepa qué elemento es cuál cuando la lista cambia.
- Dentro del bloque, `it` es la tarea actual (parámetro implícito de la lambda).
- `consumeWindowInsets(innerPadding).padding(innerPadding)`: aplica el relleno que da el `Scaffold`. La captura corta el final de la línea, pero es el patrón estándar de la plantilla.

**Capa 3 — `TaskCard` [Captura 8].** Se rellena la llamada y se crea el componente vacío:

```kotlin
                TaskCard(
                    title = it.title,
                    description = it.description,
                    isCompleted = it.isCompleted,
                )
            }
        }
    }
}

@Composable
fun TaskCard(title: String, description: String, isCompleted: Boolean) {

    Card {

    }
}
```

`TaskCard` recibe **datos simples** (`String`, `Boolean`), no una `Task` entera. Así es más fácil de reutilizar y de previsualizar.

**Capa 4 — Contenido de la tarjeta [Captura 9]:**

```kotlin
@Composable
fun TaskCard(title: String, description: String, isCompleted: Boolean) {

    Card {
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

- `Column` apila en vertical, `Row` coloca en horizontal.
- `Switch(checked = isCompleted, onCheckedChange = null)`: con `onCheckedChange = null` el interruptor **solo muestra** el estado y no se puede tocar. Es lo esperable en este punto, porque aún no hay lógica para cambiarlo.

**Capa 5 — Botón flotante [Capturas 10 y 11].** Se añade el parámetro `floatingActionButton` al `Scaffold`:

```kotlin
    Scaffold(
        modifier = Modifier.fillMaxSize(),
        floatingActionButton = {
            LargeFloatingActionButton(
                onClick = { },
            ) {
                Icon(
                    painterResource(R.drawable.add_24px),
                    contentDescription = "Create"
                )
            }
        }
    ) { innerPadding ->
        val modifier = Modifier.consumeWindowInsets(innerPadding)
            .padding(innerPadding)               // [Reconstruido] la captura corta esta línea
        LazyColumn(
            modifier = modifier
        ) {
            items(
                items = repository.readAll(),
                key = { it.id }
            ) {
                TaskCard(
                    title = it.title,
                    description = it.description,
                    isCompleted = it.isCompleted,
                )
            }
        }
    }
```

- `R.drawable.add_24px` es un icono vectorial del proyecto (en la captura 11 se ve la pestaña `add_24px.xml`).
- `contentDescription = "Create"` es la descripción para accesibilidad.
- El `val modifier` local **tapa** al parámetro `modifier` de la función (el IDE avisa con una advertencia). Funciona, pero sería más limpio llamarlo `contentModifier`.

---

### 3.7 Truco temporal para cambiar de pantalla (capturas 12 y 13)

Antes de usar Navigation, el profesor prueba el botón de crear con un parche rápido. **[Captura 12] [Fragmento]**:

```kotlin
fun TaskListScreen( /* ... */ ) {
    var botonPulsado by rememberSaveable { mutableIntStateOf(0) }  // valor inicial no visible

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        floatingActionButton = {
            LargeFloatingActionButton(
                onClick = {
                    botonPulsado++
                    repository.create(
                        title = "Dummy",
                        description = "Todo es mentira",
                        limitDate = "31.12.9999"
                    )
                },
                // ...
```

**[Captura 13] [Fragmento]**: el final de la función muestra un `else` que dibuja la pantalla de creación. El `if` que lo decide no se ve en ninguna captura.

```kotlin
                TaskCard(
                    title = it.title,
                    description = it.description,
                    isCompleted = it.isCompleted,
                )
            }
        }
    }

    else {
        TaskCreateScreen()
    }

}
```

Qué se aprende aquí:

- `var x by rememberSaveable { mutableIntStateOf(0) }` es **estado local** de Compose: cuando cambia, la pantalla se redibuja, y sobrevive a rotaciones.
- `botonPulsado++` cambia el estado.
- `repository.create(...)` mete una tarea de prueba (`"Dummy"`).
- Cambiar de pantalla con un `if/else` y un contador **es solo un parche**. Para eso existe **Navigation**, lo siguiente que se construye.

---

### 3.8 Navegación: las rutas (capturas 15 y 22) y el `NavHost`

**[Captura 15] / [Captura 22]**, archivo `ui/navigation/Routes.kt`:

```kotlin
package com.alanturing.todoapp.ui.navigation

import kotlinx.serialization.Serializable

@Serializable
sealed class Route(val route: String) {

    @Serializable
    object TaskList : Route("taskList")

    @Serializable
    object TaskCreate : Route("taskCreate")

    @Serializable
    class TaskDetail(val id: Int) : Route("taskDetail/$id")
}
```

- **`sealed class Route`**: clase "sellada": solo existen las subclases que están declaradas en este archivo. Es ideal para representar "destinos posibles".
- **`object TaskList` y `object TaskCreate`**: destinos sin datos, por eso son `object` (singleton).
- **`class TaskDetail(val id: Int)`**: este destino **lleva un dato** (el id de la tarea a editar), por eso es una clase normal con parámetro.
- **`@Serializable`**: es lo que permite la **navegación tipada**. Navigation convierte el objeto en la ruta y vuelve a reconstruirlo al llegar.
- Las cajitas grises `companion object { fun serializer(): KSerializer<...> }` de la captura son **código generado** por el plugin de serialización que el IDE te enseña. No se escriben.
- El `val route: String` es una cadena heredada del enfoque antiguo por texto. Con rutas tipadas ya no hace falta, pero no estorba.

**`ToDoNavHost.kt` [Reconstruido].** Aparece en el árbol y en las pestañas (capturas 15 a 22) pero nunca se abre su contenido. Es la pieza que une las rutas con las pantallas:

```kotlin
package com.alanturing.todoapp.ui.navigation

@Composable
fun ToDoNavHost(
    modifier: Modifier = Modifier,
    navController: NavHostController = rememberNavController(),
) {
    NavHost(
        navController = navController,
        startDestination = Route.TaskList,
        modifier = modifier,
    ) {
        composable<Route.TaskList> {
            TaskListScreen(
                // callbacks para ir a crear y a detalle (no visibles en las capturas)
            )
        }
        composable<Route.TaskCreate> {
            TaskCreateScreen(
                toList = { navController.popBackStack() }
            )
        }
        composable<Route.TaskDetail> {
            TaskDetailScreen(
                toList = { navController.popBackStack() }
            )
        }
    }
}
```

- Cada `composable<Ruta>` dice qué pantalla se muestra para esa ruta.
- Para ir a detalle se haría `navController.navigate(Route.TaskDetail(id))`.
- `toList: () -> Unit` en las pantallas de crear y detalle (capturas 20 y 26) es el **callback para volver a la lista**. La pantalla no sabe nada del `navController`, solo avisa "ya he terminado".

Con esto, `MainActivity` deja de pasar el repositorio y pasa a mostrar el `NavHost` [Reconstruido]:

```kotlin
setContent {
    ToDoAppTheme {
        ToDoNavHost()
    }
}
```

La `TaskListScreen` final (con navegación y `TaskCard` clicable) tampoco se muestra en las capturas. Lo que necesita cambiar respecto a la captura 11: recibir callbacks para ir a crear y a detalle, y abandonar el `repository` por parámetro a favor de su ViewModel.

---

### 3.9 `TaskListViewModel` (captura 16)

**[Captura 16]**:

```kotlin
package com.alanturing.todoapp.ui

import ...

@HiltViewModel
class TaskListViewModel @Inject constructor(
    private val _repository: TaskRepository
) : ViewModel() {

    val tasks = _repository.readAll()

    fun create() {

    }

    fun readAll(): List<Task> {
        return _repository.readAll()
    }
}
```

- **`@HiltViewModel` + `@Inject constructor(...)`**: Hilt construye el ViewModel y le da el `TaskRepository` (el mismo singleton de siempre).
- **¿Qué es un ViewModel?** Una clase que guarda el **estado de una pantalla** y sobrevive a rotaciones. La pantalla le pregunta datos y le avisa de eventos.
- Es una fase intermedia: `create()` está vacío y `tasks` guarda una **foto fija** (`readAll()` devuelve una copia de la lista). Esto se corrige en el paso 3.13 con `Flow`.
- La pantalla lo obtendría con `viewModel: TaskListViewModel = hiltViewModel()`, como ya hacen las otras.

---

### 3.10 Pantalla de crear tarea, primera versión (capturas 17 y 18)

**[Captura 18]** `TaskCreateViewModel` (ya dentro del paquete `...ui.taskcreate`; la `TaskCreateScreen` de la captura 17 todavía estaba en `...ui`, así que entre una y otra se reorganizó, ver 3.11):

```kotlin
package com.alanturing.todoapp.ui.taskcreate

import androidx.compose.foundation.text.input.TextFieldState
import androidx.lifecycle.ViewModel
import com.alanturing.todoapp.data.repository.TaskRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

@HiltViewModel
class TaskCreateViewModel @Inject constructor(
    private val _repository: TaskRepository
) : ViewModel() {

    val titleState = TextFieldState()
    val descriptionState = TextFieldState()

    fun onCreate() {
        // TODO Implementar guardado en Repository
        _repository.create(
            title = titleState.text.toString(),
            description = descriptionState.text.toString(),
            limitDate = "9999.31.12" // TODO Deuda técnica
        )
    }
}
```

**[Captura 17]** `TaskCreateScreen` (primera versión, en el paquete `...ui`):

```kotlin
@Composable
fun TaskCreateScreen(
    modifier: Modifier = Modifier,
    viewModel: TaskCreateViewModel = hiltViewModel(),
) {
    Column {
        OutlinedTextField(
            state = viewModel.titleState,
        )
        OutlinedTextField(
            state = viewModel.descriptionState
        )
        Button(
            onClick = viewModel::onCreate
        ) {
            Text("Save")
        }
    }
}
```

Piezas clave:

- **`TextFieldState`**: es la API moderna de Compose para campos de texto. El estado del texto vive en un objeto (`TextFieldState`), y `OutlinedTextField(state = ...)` lo muestra y lo edita. El ViewModel es el dueño del estado, y la pantalla solo lo pinta.
- **`titleState.text.toString()`**: `text` es un `CharSequence`; se convierte a `String` para guardarlo.
- **`hiltViewModel()`**: pide a Hilt el ViewModel asociado a esta pantalla.
- **`viewModel::onCreate`**: es una **referencia a función** (como `this::onCreate` en Java). Es lo mismo que `{ viewModel.onCreate() }`.
- **`limitDate = "9999.31.12" // TODO Deuda técnica`**: fecha puesta a mano como "ya lo arreglaremos". Fíjate en que el formato no coincide con el de la captura 12 (`"31.12.9999"`).

---

### 3.11 Reorganización por paquetes (captura 19)

**[Captura 19]**: estructura final del proyecto. La reorganización ya se intuye en la captura 18 (su árbol tiene las carpetas `taskcreate`, `taskdetail` y `tasklist`); la 19 la muestra completa, con `TaskDetailScreen` incluida.

```
com.alanturing.todoapp
├─ data
│   ├─ repository
│   │   ├─ TaskRepository
│   │   └─ TaskRepositoryInMemory
│   └─ Task
├─ di
│   ├─ ApplicationModule
│   └─ ToDoApplication
├─ ui
│   ├─ navigation
│   │   ├─ Routes.kt
│   │   └─ ToDoNavHost.kt
│   ├─ taskcreate
│   │   ├─ TaskCreateScreen.kt
│   │   └─ TaskCreateViewModel
│   ├─ taskdetail
│   │   └─ TaskDetailScreen.kt
│   ├─ tasklist
│   │   ├─ TaskListScreen.kt
│   │   └─ TaskListViewModel
│   └─ theme
│       ├─ Color.kt
│       ├─ Theme.kt
│       └─ Type.kt
└─ MainActivity
```

Se pasa de "todo en `ui`" a **un paquete por pantalla** (`taskcreate`, `taskdetail`, `tasklist`), cada uno con su Screen y su ViewModel. Es la estructura típica *feature-based* y explica por qué los archivos posteriores declaran `package ...ui.taskcreate` o `...ui.taskdetail`.

---

### 3.12 Pantalla de detalle / edición (capturas 20 a 23)

**[Captura 20]** `TaskDetailScreen`:

```kotlin
package com.alanturing.todoapp.ui.taskdetail

import ...

@Composable
fun TaskDetailScreen(
    modifier: Modifier = Modifier,
    viewModel: TaskDetailViewModel = hiltViewModel(),
    toList: () -> Unit,
) {

    Column {
        OutlinedTextField(
            state = viewModel.titleState,
        )
        OutlinedTextField(
            state = viewModel.descriptionState
        )
        Button(
            onClick = {
                viewModel.onSave()
                toList()
            }
        ) {
            Text("Update")
        }
    }
}
```

Es casi igual que la de crear. La diferencia es que el botón **guarda y vuelve** a la lista: `onSave()` y luego `toList()`.

**[Captura 23] + [Captura 21]** `TaskDetailViewModel`. La 23 muestra la cabecera y la 21 el cuerpo; los números de línea coinciden, así que es el mismo archivo.

```kotlin
package com.alanturing.todoapp.ui.taskdetail

@HiltViewModel
class TaskDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val _repository: TaskRepository
) : ViewModel() {

    private val route: Route.TaskDetail = savedStateHandle.toRoute()
    private val id: Int = route.id

    val titleState = TextFieldState()
    val descriptionState = TextFieldState()

    init {
        loadTask()
    }

    fun loadTask() {
        val currentTask = _repository.readOne(id)
        titleState.edit {
            replace(0, titleState.text.length, currentTask.title)
        }
        //titleState.setTextAndPlaceCursorAtEnd(currentTask.title)
        descriptionState.setTextAndPlaceCursorAtEnd(currentTask.description)

    }

    fun onSave() {
        _repository.update(
            id = id,
            title = titleState.text.toString(),
            description = descriptionState.text.toString()
        )

    }
}
```

Esta es la parte donde más cosas se enlazan:

1. **¿De dónde sale el `id`?** Cuando el `NavHost` navega a `Route.TaskDetail(id)`, los argumentos de la ruta se guardan en el `SavedStateHandle`. Hilt se lo inyecta al ViewModel. `savedStateHandle.toRoute()` reconstruye el objeto `Route.TaskDetail` (el tooltip de la captura 23 lo confirma) y de ahí se saca `route.id`.
2. **`init { loadTask() }`**: nada más crearse el ViewModel, busca la tarea con `readOne(id)` y **rellena los campos** de texto.
3. **Dos formas de poner texto en un `TextFieldState`**:
   - `edit { replace(0, longitud, nuevoTexto) }`: edición de bajo nivel, sustituye el rango completo.
   - `setTextAndPlaceCursorAtEnd(texto)`: reemplaza todo el texto y deja el cursor al final. Es la alternativa que se ve comentada en la línea 37 y usada para la descripción.
4. **`onSave()`**: lee lo que hay escrito en los dos campos y llama a `_repository.update(...)`.

---

### 3.13 Repositorio reactivo con `StateFlow` (captura 24)

Hasta ahora `readAll()` devuelve una foto de la lista: si luego se crea o edita una tarea, la pantalla no se entera. La solución es exponer un **flujo** que avisa de los cambios.

**[Captura 24] [Fragmento]**:

```kotlin
package com.alanturing.todoapp.data.repository

import ...

class TaskRepositoryInMemory @Inject constructor() : TaskRepository {
    private val _taskList = mutableListOf<Task>()
    private val _taskFlow = MutableStateFlow(_taskList)
    override val tasks: Flow<List<Task>>
        get() = _taskFlow.asStateFlow()
    init {
        create(
            title = "Dummy",
            description = "Sigue siendo mentira",
            limitDate = ""
        )
        create(
            title = "Dummy2",
            description = "Sigue siendo mentira 2",
            limitDate = ""
        )
    }
    override fun readAll() = _taskList.toList()

    override fun readOne(id: Int): Task {
        return _taskList.first {
            it.id == id
        }
    }
    // ... resto no visible
```

- **`MutableStateFlow`**: contenedor de un valor que **emite cada cambio** a quien lo observe. Es "privado y modificable".
- **`asStateFlow()`**: lo expone hacia fuera como **solo lectura**.
- **`override val tasks: Flow<List<Task>>`**: ahora la interfaz promete un flujo de listas. Una pantalla lo recoge y **se redibuja sola** cuando cambia (por eso en el paso 3.14 se ve `collectAsStateWithLifecycle`).
- **`init { create(...) }`**: al crearse el repositorio se añaden dos tareas de prueba (`Dummy` y `Dummy2`), para que la lista no salga vacía.

Dos cosas a vigilar (son consejos míos, no salen en las capturas):

- `MutableStateFlow(_taskList)` guarda la **misma instancia** de lista que luego se modifica. Un `StateFlow` solo emite si el valor es distinto, y la misma lista mutada se considera igual, así que no avisaría. Lo habitual es asignar una copia tras cada cambio: `_taskFlow.value = _taskList.toList()`.
- En Kotlin las propiedades y los bloques `init` se ejecutan **en el orden en que están escritos**. `nextId` debe declararse **antes** del `init`, o los `create(...)` del `init` usarían un id sin inicializar.

---

### 3.14 Crear con corrutinas y estados de pantalla (capturas 25, 26 y 27)

**Paso A — `viewModelScope.launch` [Captura 25].**

```kotlin
package com.alanturing.todoapp.ui.taskcreate

@HiltViewModel
class TaskCreateViewModel @Inject constructor(
    private val _repository: TaskRepository
) : ViewModel() {

    val titleState = TextFieldState()
    val descriptionState = TextFieldState()

    fun onCreate() {
        viewModelScope.launch {
            _repository.create(
                title = titleState.text.toString(),
                description = descriptionState.text.toString(),
                limitDate = "9999.31.12" // TODO Deuda técnica
            )
        }
    }
}
```

`viewModelScope.launch { ... }` lanza una **corrutina** ligada al ciclo de vida del ViewModel: el trabajo se cancela solo si el ViewModel desaparece. Prepara el terreno para guardar sin bloquear la interfaz (con una base de datos o una API real, `create` sería `suspend`). En las capturas no se ve cómo queda `create` en la interfaz.

**Paso B — Empieza `when (state)` [Captura 26].** La pantalla ahora recibe `toList` y observa un estado:

```kotlin
package com.alanturing.todoapp.ui.taskcreate

@Composable
fun TaskCreateScreen(
    modifier: Modifier = Modifier,
    viewModel: TaskCreateViewModel = hiltViewModel(),
    toList: () -> Unit
) {
    val state by viewModel.screenState.collectAsStateWithLifecycle()

    when (state) {

    }
    Column {
        OutlinedTextField(
            state = viewModel.titleState,
        )
        OutlinedTextField(
            state = viewModel.descriptionState
        )
        Button(
            onClick = {
                viewModel.onCreate()
                toList()
            }
        ) {
            Text(stringResource(R.string.save))
        }
    }
}
```

- `stringResource(R.string.save)` sustituye al texto fijo `"Save"`. En las pestañas se ven `values\strings.xml` y `es\strings.xml`: ya hay **textos traducidos** (inglés y español).
- `viewModel.screenState.collectAsStateWithLifecycle()` convierte un `StateFlow` en estado de Compose y deja de recoger cuando la pantalla no está visible.
- `val state by ...`: **delegación** (`by`), así `state` se usa como un valor normal.

**Paso C — Los estados [Captura 27] [Fragmento].**

```kotlin
    when (state) {
        TaskCreateScreenState.Created -> {
            toList()
        }
        TaskCreateScreenState.Creating -> {
            CircularProgressIndicator()
        }
        TaskCreateScreenState.Error -> TODO()
        TaskCreateScreenState.Initial -> {
            Column {
                OutlinedTextField(
                    state = viewModel.titleState,
                )
                OutlinedTextField(
                    state = viewModel.descriptionState
                )
                Button(
                    onClick = {
                        viewModel.onCreate()
                        // ... la captura se corta aquí
```

(El `toList()` de la rama `Created` queda tapado por el overlay de la grabación; es el único que tiene sentido ahí.)

La pantalla ya no es un formulario fijo, sino una **máquina de estados**:

| Estado | Qué muestra |
|---|---|
| `Initial` | El formulario (dos campos y el botón). |
| `Creating` | Un `CircularProgressIndicator` (rueda de carga). |
| `Created` | Llama a `toList()` y vuelve a la lista. |
| `Error` | `TODO()` (pendiente de implementar: lanza una excepción si se llega). |

Como `when` sobre una clase sellada es **exhaustivo**, el compilador obliga a cubrir todos los casos.

Los estados y el ViewModel no se ven, pero son necesarios para que compile [Reconstruido]:

```kotlin
sealed interface TaskCreateScreenState {
    data object Initial : TaskCreateScreenState
    data object Creating : TaskCreateScreenState
    data object Created : TaskCreateScreenState
    data object Error : TaskCreateScreenState
}
```

```kotlin
// dentro de TaskCreateViewModel
private val _screenState = MutableStateFlow<TaskCreateScreenState>(TaskCreateScreenState.Initial)
val screenState = _screenState.asStateFlow()

fun onCreate() {
    viewModelScope.launch {
        _screenState.value = TaskCreateScreenState.Creating
        _repository.create(
            title = titleState.text.toString(),
            description = descriptionState.text.toString(),
            limitDate = "9999.31.12" // TODO Deuda técnica
        )
        _screenState.value = TaskCreateScreenState.Created
    }
}
```

Con esto el botón **ya no necesita llamar a `toList()` él mismo**: la navegación de vuelta la dispara el estado `Created`.

---

## 4. Cómo se conecta todo: lo que pasa cuando usas la app

1. **Arranca la app.** Hilt crea `ToDoApplication` (`@HiltAndroidApp`) y prepara el grafo de dependencias.
2. **`MainActivity`** (`@AndroidEntryPoint`) llama a `setContent` y muestra `ToDoNavHost`. La ruta inicial es `Route.TaskList`.
3. **`TaskListScreen`** pide su ViewModel con `hiltViewModel()`. Hilt construye `TaskListViewModel` y, para su `TaskRepository`, mira `ApplicationModule`: "usa `TaskRepositoryInMemory`, instancia única".
4. El repositorio, al crearse, añade dos tareas Dummy (`init`). La lista las pinta como `TaskCard`.
5. **Botón flotante (+).** Navega a `Route.TaskCreate`. `TaskCreateViewModel` recibe el **mismo** repositorio singleton. Al pulsar guardar: `onCreate()` → estado `Creating` → `repository.create(...)` → estado `Created` → `toList()` y se vuelve a la lista.
6. **Tocar una tarea.** Navega a `Route.TaskDetail(id)`. El argumento viaja en el `SavedStateHandle`, `TaskDetailViewModel` lo recupera con `toRoute()`, carga la tarea con `readOne(id)` y rellena los campos. Al pulsar *Update*: `onSave()` → `repository.update(...)` → `toList()`.

Los pasos 5 y 6 se deducen del código de las capturas y del `NavHost` reconstruido.

**Por qué `@Singleton` es importante:** como todos los ViewModels reciben la misma instancia de `TaskRepositoryInMemory`, una tarea creada en una pantalla aparece en las demás. Como los datos solo viven en memoria, **se pierden al cerrar el proceso**.

---

## 5. Mapa de archivos

| Archivo | Capturas | Estado |
|---|---|---|
| `di/ApplicationModule.kt` | 1, 3, 14 | Visto (versión final en 14) |
| `di/ToDoApplication.kt` | 1, 2, 19 (solo en el árbol) | Reconstruido |
| `data/Task.kt` | 2, 19 (solo en el árbol) | Reconstruido |
| `data/repository/TaskRepository.kt` | 2, 19 (solo en el árbol) | Reconstruido |
| `data/repository/TaskRepositoryInMemory.kt` | 4, 24 | Visto en parte; `create`/`update` reconstruidos |
| `MainActivity.kt` | 5 | Visto (versión con repositorio); versión con `NavHost` reconstruida |
| `ui/tasklist/TaskListScreen.kt` | 6 a 13 | Visto; versión con navegación no visible |
| `ui/tasklist/TaskListViewModel.kt` | 16 | Visto |
| `ui/navigation/Routes.kt` | 15, 22 | Visto |
| `ui/navigation/ToDoNavHost.kt` | solo en el árbol | Reconstruido |
| `ui/taskcreate/TaskCreateViewModel.kt` | 18, 25 | Visto; `screenState` reconstruido |
| `ui/taskcreate/TaskCreateScreen.kt` | 17, 26, 27 | Visto en parte |
| `ui/taskcreate/TaskCreateScreenState` | usado en 27 | Reconstruido |
| `ui/taskdetail/TaskDetailScreen.kt` | 20 | Visto |
| `ui/taskdetail/TaskDetailViewModel.kt` | 21, 23 | Visto |
| `build.gradle.kts`, `libs.versions.toml`, `AndroidManifest.xml` | pestañas abiertas, sin contenido | Ver 6 |

---

## 6. Dependencias y configuración que hacen falta (no aparecen en las capturas)

Esto es conocimiento general, no transcripción. Las versiones son las de tu `libs.versions.toml`.

- **Plugins de Gradle:** Hilt (`com.google.dagger.hilt.android`), KSP o kapt para el compilador de Hilt, y `org.jetbrains.kotlin.plugin.serialization` (para `@Serializable`).
- **Librerías:** `hilt-android`, `hilt-android-compiler`, `androidx.hilt:hilt-navigation-compose` (para `hiltViewModel()`), `androidx.navigation:navigation-compose`, `kotlinx-serialization-json`, `androidx.lifecycle:lifecycle-runtime-compose` (para `collectAsStateWithLifecycle`).
- **Manifest:** `android:name=".di.ToDoApplication"` en `<application>`.

---

## 7. Mini glosario Kotlin (viniendo de Java)

| Kotlin | Equivalente / idea en Java |
|---|---|
| `val` / `var` | `final` / variable normal |
| `lateinit var` | Campo que se asigna más tarde (aquí lo rellena Hilt) |
| `fun f() = expr` | Método con cuerpo de una sola expresión |
| `it` | Parámetro implícito de una lambda con un solo argumento |
| `modifier: Modifier = Modifier` | Parámetro con valor por defecto (en Java habría que sobrecargar) |
| `class A @Inject constructor(...)` | Constructor principal con anotación |
| `object X` | Singleton |
| `sealed class` / `sealed interface` | Jerarquía cerrada; `when` puede ser exhaustivo |
| `data class` | Clase con `equals`, `hashCode`, `toString` y `copy` generados |
| `by` | Delegación de una propiedad |
| `::onCreate` | Referencia a método |
| `suspend` / `launch { }` | Corrutinas: trabajo asíncrono sin hilos manuales |

---

## 8. Puntos a revisar con tus apuntes o con el profesor

1. `limitDate` está puesto a mano en dos formatos distintos (`"31.12.9999"` y `"9999.31.12"`), y el comentario del propio código lo marca como deuda técnica.
2. `TaskListViewModel.create()` está vacío y `tasks` guarda una foto fija (captura 16). Más adelante hay que usar el flujo `tasks` del repositorio.
3. La advertencia del `val modifier` que tapa al parámetro `modifier` en `TaskListScreen`.
4. `TaskCreateScreenState.Error -> TODO()` lanzaría una excepción si algún día se alcanza.
5. `Route(val route: String)` es redundante con rutas tipadas.
6. El `StateFlow` que envuelve la misma lista mutable (ver 3.13).
