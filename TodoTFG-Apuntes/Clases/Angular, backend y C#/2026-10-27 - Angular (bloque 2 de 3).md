# Clase del 2026-10-27 (bloque 2 de 3) · Angular

# Angular: servicio de comentarios, dashboard y navegación (bloque 2, min 36-46 de la parte 1)

Proyecto `angular-http` abierto en el editor Cursor, con la API pública JSONPlaceholder. Al principio del bloque ya existen `PostsService`, `PostsComponent`, la interfaz `CRUD` y los modelos.

## 1. Qué se explicó, en orden

| Minuto | Contenido |
|---|---|
| 36:15-36:45 | Crea `CommentsService` con `ng g s services/comments`. Implementa la interfaz genérica `CRUD<Comment, NewComment>` e inyecta `HttpClient` con `inject()`. La URL base es `https://jsonplaceholder.typicode.com/comments`. |
| 36:46-36:49 | Genera la página con `ng g c pages/comments` (salen `.ts`, `.html`, `.css` y `.spec.ts`). Inyecta el servicio en el componente con `inject(CommentsService)`. |
| 37:04-38:45 | Estado del componente con signals: `comments: WritableSignal<Comment[]> = signal<Comment[]>([])` y `loading = signal(true)`. El componente implementa `OnInit` y en `ngOnInit` hace `getAll().subscribe(...)` y guarda el resultado con `this.comments.set(...)`. Mientras escribe salen errores de tipos, que se van cuando importa `Comment` desde `../../models/comment.model`. |
| 38:52-39:21 | Le pide a la IA del editor: "Hazme el html de comments parecido al de posts". La IA escribe la plantilla, añade un signal `error` y `CommonModule`, pone `standalone: true` y avisa de que falta la ruta. Se revisan los cambios con Keep / Review / Undo. |
| 39:43-40:11 | Añade la ruta `comments` en `app.routes.ts`. Sale el error `Cannot find name 'CommentsComponent'` hasta que importa el componente. |
| 40:11-41:06 | Ejecuta `ng g c pages/dashboard`. Al `DashboardComponent` le añade `standalone: true` y `imports: [CommonModule, RouterLink, RouterLinkActive]`. |
| 41:11-42:13 | Plantilla del dashboard. Primero escribe `<a routerLink="/posts">` (atributo estático) y luego la versión con binding `[routerLink]="['/posts']"`. Por el camino comete errores de comillas y corchetes (`Parser Error: Unexpected token`) y los corrige. |
| 41:29-41:45 | Rutas: la ruta vacía redirige a `dashboard` con `pathMatch: 'full'`. Después vienen `dashboard`, `posts` y `comments`. |
| 42:38-42:53 | Da estilo a los enlaces con clases de Tailwind (`text-blue-500 cursor-pointer`), usando el autocompletado de Tailwind. |
| 43:01 | Lo prueba en `localhost:4200/dashboard`. En DevTools enseña el DOM: `<app-root ng-version="19.2.25">`, `<router-outlet>` y debajo `<app-dashboard>`. |
| 43:14-43:55 | Le pide a la IA: "formatea dashboard de forma elegante con cajitas en el centro de la pantalla...". La IA genera una `section` con Tailwind, una insignia "Angular HttpClient" y tarjetas. |
| 44:17-44:42 | En `posts.component.html` añade un enlace al Dashboard en la cabecera. Sale el error `Can't bind to 'routerLink' since it isn't a known property of 'a'`, y lo arregla añadiendo `RouterLink` a los `imports` de `PostsComponent`. |
| 45:18-45:46 | Resultado en el navegador. La página Posts tiene el enlace Dashboard, el contador "100 entradas" y una cuadrícula de tarjetas. La página "Panel" tiene dos tarjetas, Posts y Comentarios, con los enlaces "Ver posts →" y "Ver comentarios →". |

## 2. Conceptos y patrones

**Servicio HTTP**
- Se declara con `@Injectable({ providedIn: 'root' })`.
- Las dependencias se piden con `private readonly http = inject(HttpClient)`, no por el constructor.
- La URL base va en una propiedad `apiUrl`.
- Implementa una interfaz genérica `CRUD<T, N>`: `T` es el modelo completo y `N` el modelo para crear (`NewComment`).

**Componente de página**
- Es standalone y declara sus `imports` en `@Component`.
- Pide el servicio con `inject()` y guarda el estado en signals (`WritableSignal`, `signal<T>()`, `.set()`).
- Tiene tres estados: lista, `loading` y `error`.
- Carga los datos en `ngOnInit` con `subscribe`.
- Las propiedades que usa la plantilla son `protected readonly` y el servicio es `private readonly`.

**Organización de carpetas**
- `interface/`: la interfaz CRUD.
- `models/`: `comment.model.ts` y `post.model.ts`.
- `services/`.
- `pages/<nombre>/`.

**Router**
- Las rutas se definen en un array `Routes` de objetos con `path` y `component`.
- La raíz usa `redirectTo` + `pathMatch: 'full'`.
- Cada componente de la ruta hay que importarlo en `app.routes.ts`.
- Los componentes se pintan dentro de `<router-outlet>`.

**`routerLink`**
- Tiene dos formas: atributo estático (`routerLink="/posts"`) o binding con un array de segmentos (`[routerLink]="['/posts']"`).
- Un componente standalone tiene que importar `RouterLink`. Si no, sale "Can't bind to 'routerLink'".

**Estilos**
- Clases de utilidad de Tailwind directamente en la plantilla, incluidas las variantes `hover:` y `sm:`.

**IA en el editor**
- Pide plantillas "parecidas a otra" y revisa los cambios antes de aceptarlos.
- La IA también le avisa de cosas que faltan, como la ruta.

## 3. Código de ejemplo reconstruido

```ts
// services/comments.service.ts
import { inject, Injectable } from '@angular/core';
import { CRUD } from '../interface/crud';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Comment, NewComment } from '../models/comment.model';

@Injectable({ providedIn: 'root' })
export class CommentsService implements CRUD<Comment, NewComment> {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://jsonplaceholder.typicode.com/comments';
  // getAll(): Observable<Comment[]> ... [dudoso: los métodos no se ven en este bloque]
}
```

```ts
// pages/comments/comments.component.ts
import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentsService } from '../../services/comments.service';
import { Comment } from '../../models/comment.model';

@Component({
  selector: 'app-comments',
  imports: [CommonModule],
  templateUrl: './comments.component.html',
  standalone: true,
})
export class CommentsComponent implements OnInit {
  private readonly commentsService = inject(CommentsService);
  protected readonly comments: WritableSignal<Comment[]> = signal<Comment[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.commentsService.getAll().subscribe((comments) => {
      this.comments.set(comments);
      // [dudoso] loading/error los ajusta la versión generada por la IA; no se ve cómo
    });
  }
}
```

```ts
// app.routes.ts
export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'posts', component: PostsComponent },
  { path: 'comments', component: CommentsComponent },
];
```

```ts
// pages/dashboard/dashboard.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  standalone: true
})
export class DashboardComponent {}
```

```html
<!-- dashboard.component.html (versión del profesor, antes de que la IA la rehiciera) -->
<a class="text-blue-500 cursor-pointer" [routerLink]="['/posts']">Posts</a>
<a class="text-blue-500 cursor-pointer" [routerLink]="['/comments']">Comments</a>
```

```ts
// posts.component.ts: hay que importar RouterLink para poder usar el enlace al dashboard
@Component({
  selector: 'app-posts',
  imports: [CommonModule, RouterLink],
  templateUrl: './posts.component.html',
  standalone: true,
})
export class PostsComponent implements OnInit {
  private readonly postsService = inject(PostsService);
  protected readonly posts: WritableSignal<Post[]> = signal<Post[]>([]);
}
```

```html
<!-- cabecera de posts.component.html -->
<a class="text-indigo-400 hover:text-indigo-300" [routerLink]="['/dashboard']">Dashboard</a>
```

## 4. Librerías, comandos y versiones

**Comandos**
- `ng g s services/comments`
- `ng g c pages/comments`
- `ng g c pages/dashboard`
- `ng serve` (la app se ve en el puerto 4200)

**Versiones y paquetes**
- Angular 19.2.25 (sale en el atributo `ng-version`).
- `@angular/core`: `Component`, `Injectable`, `inject`, `OnInit`, `signal`, `WritableSignal`.
- `@angular/common`: `CommonModule`.
- `@angular/common/http`: `HttpClient`.
- `@angular/router`: `Routes`, `RouterLink`, `RouterLinkActive`.
- `rxjs`: `Observable`.

**Estilos y herramientas**
- Tailwind CSS: `text-blue-500`, `cursor-pointer`, `min-h-dvh`, `bg-slate-950`, `rounded-full`, `border-indigo-400/35`, `sm:`, `hover:`.
- Prettier.
- Cursor con su asistente de IA.
- Chrome DevTools.

**API**
- JSONPlaceholder (`/posts` y `/comments`).

## 5. Lo dudoso o ilegible

- No se ven los métodos de `CommentsService` (`getAll`, etc.) ni el contenido de la interfaz `CRUD`. Seguramente se escribieron antes, en el bloque 1.
- Entre los minutos 37:04 y 37:57 salen errores de tipos en la línea del signal, y la línea está cortada.
  - Lo más probable es que `Comment` se estuviera resolviendo como el tipo `Comment` del DOM del navegador hasta que se importó el modelo, pero no se ve el mensaje de error.
- En la captura del minuto 39:14 aparece `standalone: true` justo después de `styleUrl` sin coma, y más tarde la línea `styleUrl` ya no está. No está claro si la IA la quitó a propósito.
- En el dashboard se importa `RouterLinkActive`, pero en la línea del import solo se lee `RouterLink`. No se ve que llegue a usarse en la plantilla.
- La plantilla final del dashboard y la de comments las escribió la IA. Solo se ven las primeras líneas (`section`, `header`, insignia), con las clases cortadas.
- En la cabecera de posts, el enlace a `/dashboard` primero se comentó, luego se probó uno a `/comments` y al final el enlace visible es "Dashboard". No se ve la versión definitiva exacta.
- El aviso "Ojo, que no estás usando tailwind" es del chat de la IA. Después sí se ve Tailwind funcionando, porque hay un `.postcssrc.json` y un `styles.css`.
