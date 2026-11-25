# Clase del 2026-10-27 (bloque 1 de 3) · Angular

# Angular: Servicios con HttpClient (parte 1). Clase del 27/10/2026, bloque 1 de 3

Proyecto de clase: **`angular-http`** (abierto en el IDE Cursor, rama `master`). La API de prueba es **JSONPlaceholder** (`https://jsonplaceholder.typicode.com`). Se trabaja con los posts y, al final del bloque, se empieza lo mismo con los comentarios.

## 1. Qué se explicó, en orden

| Minuto | Contenido |
|---|---|
| 00:00 | Se genera el servicio con `ng g s services/posts` (crea `posts.service.ts` y `posts.service.spec.ts`). Se inyecta `HttpClient` con `inject()` en una propiedad `private readonly http`. |
| 00:38–00:53 | Propiedad `private readonly apiUrl = 'https://jsonplaceholder.typicode.com/posts'`. Primer `getPosts()` con `this.http.get<Post[]>(this.apiUrl)`. Da error porque `Post` todavía no existe. |
| 01:07–01:13 | Se mira en el navegador la respuesta JSON de `/posts` y la lista de recursos de JSONPlaceholder (`/posts` 100, `/comments` 500, `/albums`, `/photos`, `/todos`, `/users`). |
| 01:36–02:08 | Se empieza a escribir `implements CRUD<Post>`, pero la interfaz no existe. Se borra y se genera con `ng g interface interface/CRUD`. |
| 02:14–02:19 | Primera versión de la interfaz genérica `CRUD<T, S>` con `getAll(): Observable<T[]>`. |
| 02:51–04:21 | Modelo `models/post.model.ts`. Se pega como comentario un JSON de ejemplo, se escribe la interfaz `Post` (`userId`, `id`, `title`, `body`) y se borra el comentario. Tipo derivado `NewPost = Omit<Post, 'id'>`. Se prueba `id?: number` (el tooltip muestra `number \| undefined`), pero al final se deja `id: number`. |
| 04:28–06:23 | Se completa la interfaz `CRUD<T, S>`: `getAll`, `getById`, `create`, `update` y `delete`. Hay que importar `Observable` de `rxjs`. `T` es el tipo que se recibe y `S` el que se envía. |
| 06:27–07:16 | Imports en el servicio (modelos e interfaz). Error "Generic type 'CRUD<T, S>' requires 2 type arguments", que se arregla con `implements CRUD<Post, NewPost>`. El IDE genera los métodos con `throw new Error('Method not implemented.')`. |
| 07:36–08:07 | `getAll()` con `this.http.get<Post[]>(this.apiUrl)`. Primero falta el `return` y sale el error "A function whose declared type is neither 'undefined', 'void', nor 'any' must return a value". |
| 08:26–09:52 | `getById(id)`. Si se escribe `get<Post>()` sin URL, el editor elige la sobrecarga `responseType: 'arraybuffer'` y sale el error `Observable<ArrayBuffer>`. Al poner la URL coge la sobrecarga 15/15 (`responseType: 'json'`). La URL se monta con template literal `${this.apiUrl}/${id}`. Se prueba en el navegador `/posts/1/comments`. |
| 09:56–10:38 | `create(entity)` con `this.http.post<Post>(this.apiUrl, entity)`. Se repasan en el tooltip las 15 sobrecargas de `post` y sus opciones (`headers`, `context`, `observe`, `params`, `reportProgress`, `responseType`, `withCredentials`, `transferCache`). |
| 10:51–11:44 | `update(id, entity)` con `put<Post>` (otra vez se olvida el `return` al principio) y `delete(id)` con `delete<void>`. Se explica que `Post` es lo que devuelve la API y `NewPost` lo que se envía. |
| 11:49–14:21 | Repaso del servicio entero y de las opciones de `HttpClient.get`. Si se quita el genérico, `get` devuelve `Observable<Object>` y no se puede asignar a `Observable<Post[]>`. Con `get<Post>` sale "Observable<Post> is not assignable to Observable<Post[]>". Se prueba también un cast con `as` y un tipo `Observable<Post[] \| HttpErrorResponse>` (ver dudosos). Repaso de `delete<void>`. |
| 14:26–14:45 | Se genera el componente de página. `ng g pages/posts` falla ("A collection and schematic is required during execution") y se corrige con `ng g c pages/posts`, que crea `.ts`, `.html`, `.css` y `.spec.ts`. |
| 14:56–15:15 | Componente standalone `PostsComponent` con `imports: [CommonModule]`. Da error porque falta importar `CommonModule`. Se inyecta `private readonly postsService = inject(PostsService)`. |
| 17:15–19:37 | Se añade `implements OnInit` (con un error de escritura, `Oninit`). En `ngOnInit` se llama a `this.postsService.getAll().subscribe(posts => ...)`. Primero se muestra con `console.log(posts)` y después se guarda en una propiedad normal `posts: Post[] = []`. |
| 21:11–22:23 | Se cambia a signal: `private readonly posts: WritableSignal<Post[]> = signal<Post[]>([])`. Hay que importar `WritableSignal`. Dentro del `subscribe`, `this.posts.set(posts)`. |
| 22:23–23:25 | Plantilla con `@for (post of posts(); track post.id) { {{post.title}} {{post.body}} }`. Error si falta la expresión de `track`. |
| 23:28–23:32 | `npm start`, que lanza `ng serve` ("Component HMR has been enabled", Vite). |
| 23:44–24:20 | Rutas en `app.routes.ts`. `component: PostsComponent` sin importar da el error TS2304. Se deja la ruta `''` con `redirectTo: 'posts'` y `pathMatch: 'full'`, y la ruta `posts` con carga perezosa (`loadComponent` + `import()`). |
| 24:37–25:02 | Error NG1: "Property 'posts' is private and only accessible within class 'PostsComponent'". La plantilla no puede leer miembros `private`. Se cambia a **`protected readonly posts`**. Compila y en `localhost:4200/posts` salen los posts como texto. |
| 25:34–26:30 | Instalación de **Tailwind CSS 4** siguiendo la guía oficial para Angular: `npm install`, `.postcssrc.json` y `@import "tailwindcss";` en `src/styles.css`. npm avisa de 30 vulnerabilidades (`npm audit fix`). |
| 26:30–32:30 | Se pide al agente de IA de Cursor "decora de forma moderna el componente de posts". La IA genera primero CSS propio, con clases BEM, `:host`, `radial-gradient`, `clamp()` y `100dvh`. El profesor le corrige: "Ojo, que no estás usando tailwind". La IA lo rehace con clases de Tailwind y ajusta `@source` en `styles.css`. Se ven en la plantilla estados de carga, error y vacío con `@if`/`@else if`/`@else` y atributos ARIA. Resultado: una cuadrícula responsive con "100 entradas". |
| 32:30–33:03 | Se para el servidor (Ctrl+C), se vuelve a lanzar con `npm start` y se genera `ng g s services/comments`. |
| 33:20–33:52 | Se mira el JSON de `/comments` y se crea `models/comment.model.ts`: interfaz `Comment` (`postId`, `id`, `name`, `email`, `body`) y `NewComment = Omit<Comment, 'id'>`, con la misma técnica de pegar el JSON como comentario. |
| 34:04–36:11 | `CommentsService implements CRUD<Comment, NewComment>` con `inject(HttpClient)`. Se prueban varias `apiUrl` y al final queda una URL fija de JSONPlaceholder `/comments`. `getAll` está a medias y el resto de métodos siguen con el `throw`. El bloque termina aquí. |

## 2. Conceptos y patrones que se enseñaron

- **Servicio** con `@Injectable({ providedIn: 'root' })`, generado con `ng g s`. El servicio guarda toda la lógica HTTP y el componente solo lo usa.
- **`inject()`** en vez de inyectar por el constructor, tanto en servicios (`HttpClient`) como en componentes (`PostsService`). Se usan propiedades `private readonly`.
- **La URL de la API** va en una propiedad `private readonly apiUrl` del servicio.
- **Interfaz genérica `CRUD<T, S>`** como contrato que implementan todos los servicios de datos. `T` es la entidad que devuelve la API y `S` la que se envía (sin `id`). Todos los métodos devuelven `Observable`, y `delete` devuelve `Observable<void>`.
- **Modelos** en `models/`: una `interface` por entidad y un `type NewX = Omit<X, 'id'>` para crear, porque el `id` lo pone el servidor. Truco: pegar el JSON de ejemplo como comentario y escribir los campos debajo.
- **Propiedad opcional `?`**: equivale a `tipo | undefined`. Se probó y al final no se usó.
- **HttpClient tipado**: `get<T>`, `post<T>(url, body)`, `put<T>(url, body)` y `delete<void>(url)`. Sin el genérico, `get` devuelve `Observable<Object>`. Los métodos tienen **muchas sobrecargas** (15) según `responseType`, y si faltan argumentos TypeScript elige la de `arraybuffer`, lo que produce errores de tipo raros.
- **`return` obligatorio** cuando el método declara un tipo de retorno. Fue el error más repetido en clase.
- **Template literals** para las URL con id: `` `${this.apiUrl}/${id}` ``.
- **Implementar una interfaz con el IDE**: genera los métodos con `throw new Error('Method not implemented.')` y luego se van rellenando.
- **Componente standalone** (`standalone: true`, `imports: [...]`) generado con `ng g c pages/posts`. Organización en carpetas: `interface/`, `models/`, `services/`, `pages/`.
- **Ciclo de vida**: `implements OnInit` + `ngOnInit()` para cargar datos al iniciar.
- **Suscripción**: `getAll().subscribe(posts => ...)`. Primero con `console.log` para comprobar los datos y luego guardándolos.
- **Signals**: `signal<Post[]>([])`, tipo `WritableSignal<Post[]>`, `.set(valor)`, y en la plantilla se leen llamándolos como función: `posts()`.
- **Visibilidad y plantilla**: la plantilla no puede leer miembros `private` (error NG1). Lo que use la plantilla tiene que ser **`protected`** (o público).
- **Control flow**: `@for (... ; track post.id)` (el `track` es obligatorio) y `@if` / `@else if` / `@else` para los estados de carga, error, vacío y datos.
- **Router**: `Routes`, redirección con `redirectTo` + `pathMatch: 'full'`, y **lazy loading** con `loadComponent: () => import(...).then(m => m.X)`.
- **Tailwind CSS 4** en Angular: PostCSS (`.postcssrc.json`), `@import "tailwindcss"` en los estilos globales y `@source` para decirle qué carpetas escanear. Si no se ven las clases nuevas, hay que recompilar o recargar sin caché.
- **IA en el IDE** (agente de Cursor): se usa para el diseño visual, pero se revisa lo que genera (Review, Keep All, Undo All) y se le corrige cuando no sigue lo pedido (no estaba usando Tailwind).
- Accesibilidad (la generó la IA): `role="alert"`, `aria-live="polite"` y `aria-busy="true"`.

## 3. Código de ejemplo del profesor (reconstruido)

**`src/app/interface/crud.ts`**
```ts
import { Observable } from "rxjs";

export interface CRUD<T, S> {
    getAll(): Observable<T[]>;
    getById(id:number):Observable<T>;
    create(entity:S):Observable<T>;
    update(id:number, entity:S):Observable<T>;
    delete(id:number):Observable<void>;
}
```

**`src/app/models/post.model.ts`**
```ts
export interface Post {
    userId: number;
    id: number;
    title: string;
    body: string;
}

export type NewPost = Omit<Post, 'id'>;
```

**`src/app/services/posts.service.ts`**
```ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Post, NewPost } from '../models/post.model';
import { CRUD } from '../interface/crud';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostsService implements CRUD<Post, NewPost> {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://jsonplaceholder.typicode.com/posts';

  getAll(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl);
  }
  getById(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/${id}`);
  }
  create(entity: NewPost): Observable<Post> {
    return this.http.post<Post>(this.apiUrl, entity);
  }
  update(id: number, entity: NewPost): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/${id}`, entity);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

**`src/app/pages/posts/posts.component.ts`** (versión final del bloque; los imports son [dudoso] porque no se ven enteros)
```ts
import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostsService } from '../../services/posts.service';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-posts',
  imports: [CommonModule],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.css',
  standalone: true,
})
export class PostsComponent implements OnInit {

  private readonly postsService = inject(PostsService);
  protected readonly posts: WritableSignal<Post[]> = signal<Post[]>([]);

  ngOnInit(): void {
    this.postsService.getAll().subscribe((posts) => {
      this.posts.set(posts);
    });
  }
}
```

**`posts.component.html`** (versión del profesor, antes del diseño con IA)
```html
@for (post of posts(); track post.id) {
    {{post.title}}
    {{post.body}}
}
```

**`src/app/app.routes.ts`**
```ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'posts',
    pathMatch: 'full'
  },
  {
    path: 'posts',
    loadComponent: () => import('./pages/posts/posts.component').then(m => m.PostsComponent)
  }
];
```

**Plantilla generada por la IA** (fragmento: estados de pantalla)
```html
<section class="...">
  <header class="mx-auto mb-10 max-w-2xl text-center">
    ...
    @if (!loading() && !error()) {
      <p class="mt-5 text-sm font-medium text-slate-500">{{ posts().length }} entradas</p>
    }
  </header>
  @if (loading()) {
    <div class="mx-auto flex min-h-48 max-w-sm flex-col items-center ..." aria-live="polite" aria-busy="true"> ... </div>
  } @else if (error()) {
    <div role="alert"> <p>Algo ha fallado</p> <p>{{ error() }}</p> </div>
  } @else if (posts().length === 0) {
    <p>No hay posts para mostrar.</p>
  } @else {
    ... cuadrícula de tarjetas ...
  }
</section>
```

**`src/app/models/comment.model.ts`**
```ts
export interface Comment {
    postId: number;
    id: number;
    name: string;
    email: string;
    body: string;
}

export type NewComment = Omit<Comment, 'id'>;
```

**`src/app/services/comments.service.ts`** (a medias al terminar el bloque)
```ts
import { inject, Injectable } from '@angular/core';
import { CRUD } from '../interface/crud';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CommentsService implements CRUD<Comment, NewComment> {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://jsonplaceholder.typicode.com/comments'; // [dudoso] el final de la URL se corta

  getAll(): Observable<Comment[]> {
    // a medias: se llegó a escribir this.http.get<Comment[]>(this.apiUrl) sin return y luego se borró
  }
  getById(id: number): Observable<Comment> {
    throw new Error('Method not implemented.');
  }
  // create, update y delete siguen sin implementar
}
```

## 4. Librerías, dependencias, comandos y versiones

- **Angular CLI**: `ng g s services/posts`, `ng g s services/comments`, `ng g interface interface/CRUD`, `ng g c pages/posts`. `ng g pages/posts` no funciona porque falta el esquema (`c`).
- `npm start`, que ejecuta `ng serve` (proyecto `angular-http@0.0.0`). El servidor usa Vite, tiene Component HMR activado y corre en `http://localhost:4200/`.
- `@angular/core`: `Injectable`, `inject`, `Component`, `OnInit`, `signal` y `WritableSignal`.
- `@angular/common`: `CommonModule`. `@angular/common/http`: `HttpClient`, y aparece `HttpErrorResponse`. `@angular/router`: `Routes`.
- `rxjs`: `Observable`. El autocompletado sugirió `pipe` y `map`, pero no se usaron.
- TypeScript `~5.7.2` (según `package.json`, lo que cuadra con Angular 19).
- **Tailwind CSS 4** (documentación v4.3): `npm install tailwindcss @tailwindcss/postcss postcss --force`, `.postcssrc.json` con `{ "plugins": { "@tailwindcss/postcss": {} } }` y `@import "tailwindcss";` en `src/styles.css`.
- npm avisó de 30 vulnerabilidades (2 low, 12 moderate, 14 high, 2 critical) y sugirió `npm audit fix`.
- API de prueba: JSONPlaceholder (`/posts`, `/posts/1/comments` y `/comments`).
- Herramientas: IDE Cursor con su agente de IA (modos Agent, Plan, Debug y Ask) y Prettier.

## 5. Lo dudoso o ilegible

- **`getAll` con `as` y `HttpErrorResponse` (min. 13:20–13:47)**: en unas capturas sale `return this.http.get<Post[]>(this.apiUrl) as Observable<Post[]>` y después la firma `Observable<Post[] | HttpErrorResponse>`, con errores de escritura en medio ("Cannot find name 'underfine'" y "']' expected"). No queda claro qué se quería enseñar, quizá el tipo `undefined` o el tipo de error. En las capturas siguientes la versión que queda es la sencilla, `getAll(): Observable<Post[]>` con `get<Post[]>`.
- **`id?` en `Post`**: se probó como opcional y después aparece otra vez como `id: number`. Se ha tomado esta última.
- **`CommonModule` en `imports`**: da error porque no está importado en el archivo. No se ve cuándo se añade el `import`, aunque más adelante aparece una línea de import de `CommonModule`.
- **Plantilla y TS hechos por la IA**: la plantilla final usa `loading()` y `error()`, que no existen en el componente que escribió el profesor. Los añadió la IA en `posts.component.ts` (se ve `protected readonly load...` en el diff), pero ese código no se lee entero.
- **`@source` de Tailwind**: la IA lo ajustó para escanear solo `src/`. El valor exacto (`@source "../src"`?) no se lee con seguridad.
- **`apiUrl` de los comentarios**: se probó `environment.apiUrl + '/comments'` (da error porque no existe `environment` o no está importado), luego `environment.apiUrl + '/posts/1/comments'` y al final una URL fija de JSONPlaceholder cortada por el borde de la pantalla.
- **`Comment` y `NewComment` en `CommentsService`**: la captura de los imports no muestra el import del modelo, y en un momento sale "Cannot find name 'NewComment'". Probablemente se arregla en el bloque siguiente. Ojo: `Comment` también es un tipo global del DOM, así que sin el import TypeScript usaría ese.
- Hay dos sitios en los que se cae en el mismo error de olvidar el `return` (`getAll` y `update`), y el editor tapa partes de algunas líneas (el `<` de `CRUD<Post, NewPost>` y el nombre en `then(m => m.PostsCom...)`).
