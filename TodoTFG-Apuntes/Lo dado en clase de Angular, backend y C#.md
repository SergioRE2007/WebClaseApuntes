# Lo que hemos dado en clase: Angular, backend, C# y más

Clases del 09/10/2026 al 19/11/2026 (2º DAM). Lo que no se pudo confirmar lleva la marca **[dudoso]**.

La parte de Android con Kotlin está en `Lo dado en clase de Android.md`.

Un mismo día puede salir en varias secciones, porque en la misma sesión se tocaron varias cosas:
- **20/10, 27/10 y 03/11 (Juan Antonio):** backend con Node y, a la vez, Git (ramas, tags y Git Graph).
- **27/10 (Juan Antonio):** también hay una clase de Angular (`angular-http`). Probablemente es el bloque 1 de ese día, que falta en la parte de backend **[dudoso]**.
- **28/10:** Angular (Act 8 y Act 9) y las herramientas para probar APIs (Postman y JSON Server).
- **18/11:** Angular (formularios reactivos) y despliegue en Vercel.

## Índice

1. [Angular](#1-angular)
2. [Backend con Node (Express y Prisma)](#2-backend-con-node-express-y-prisma)
3. [C# (Desarrollo de Interfaces)](#3-c-desarrollo-de-interfaces)
4. [Gestión de proyectos, Git y despliegue](#4-gestión-de-proyectos-git-y-despliegue)
5. [Dudas y lagunas](#5-dudas-y-lagunas)

---

## 1. Angular

Clases del 14/10 al 19/11/2026. Las actividades salen en Classroom como "2627 Acceso a Datos", pero el contenido es Angular.
Proyectos de clase: `proj-lamp` (14/10), `angular-http` (27/10), `proj-fakestore` (28/10), `proj-game` (del 28/10 al 18/11) y `proyecto-rutas` (19/11).

### 1.1 Temario por fechas

**14/10: Proyecto Lámpara (Act Eval 4, "Control de una lámpara")**
- `ng g c --skip-tests components/lampara`. Estructura de un proyecto standalone: `main.ts`, `index.html` con `<app-root>` y `<base href="/">`, `app.component.*`, `app.config.ts` y `app.routes.ts`.
- Componente padre que importa al hijo en `imports` y usa su selector `<app-lampara>`.
- Scripts de `package.json`, `ng serve -o` con HMR y `ng test` (Karma).
- Aviso TS-998113: `RouterOutlet` está importado pero no se usa.
- Maquetación con Flexbox (Guía6): `:host` en columna con `height: 100vh`, `.cab` con `flex: 0 0 30%`, `app-lampara` con `flex: 1`, Flexbox anidado, y diferencia entre padding y margin.
- Encapsulación de estilos: atributos `_ngcontent` y `_nghost` en DevTools. Estilos globales frente a estilos de componente.
- Estado en el padre (`enchufado` y `estadoLampara`) y `@if / @else` para el texto y el botón. Los botones aún no llevan `(click)`.

**27/10 (Juan Antonio): servicios con HttpClient (`angular-http`, con JSONPlaceholder)**
- `ng g s services/posts` e `inject(HttpClient)`.
- Interfaz genérica `CRUD<T, S>` (`ng g interface interface/CRUD`).
- Modelos con `interface Post` y `type NewPost = Omit<Post, 'id'>`.
- `PostsService` con los cinco métodos: get, getById, post, put y delete.
- Página `ng g c pages/posts` con `ngOnInit`, `subscribe`, signal `WritableSignal<Post[]>`, `@for ... track` y `protected` (error NG1 si es `private`).
- Rutas con `redirectTo` y `loadComponent` (carga perezosa).
- Instalación de Tailwind CSS 4. La IA de Cursor hace el diseño y el profesor revisa lo que genera.
- `CommentsService`, `CommentsComponent` (signals `loading` y `error`) y `DashboardComponent` con `[routerLink]`. Error si falta importar `RouterLink`.

**28/10: servicios e inyección de dependencias (`proj-fakestore`, Act 8) y comienzo de la Act 9**
- `ng g i models/product` y `ng g s services/product`.
- `ProductService.getProducts()` devuelve un `Observable<Product[]>`.
- Inyección con `inject()` frente a inyección por constructor. Sin `private` en el constructor sale el error TS2339.
- `subscribe` en `ngOnInit`, `products?: Product[]`, `@for` con `track product.id`.
- Ampliación: `[src]` y `[alt]` para la imagen, con CSS `object-fit: contain`.
- Preguntas finales de la actividad, por ejemplo qué pasa sin `provideHttpClient()`.
- Proyecto nuevo `ng new proj-game` (CSS y sin SSR). Se instala `json-server@0.17.4` y se crea un `db.json` con 15 juegos. Rangos semver.
- Ese mismo día, en vídeo: probar la Fake Store API con Postman y montar JSON Server (ver 2.2, "Probar APIs").

**05/11: formularios template-driven (Act 10, "Gestión de videojuegos")**
- Repaso del listado paginado del padre (búsqueda por id, `#ref`, `(click)`, `(change)` y `[disabled]`).
- `ng g c crud --skip-tests`. Se arranca `json-server --watch db.json --port 3000`. Al modelo `Game` se le añade `stock` y `id?`.
- `FormsModule` en `imports`. `NgModel` no es standalone (error -992011) y una expresión vacía da el error -995002.
- `[(ngModel)]` con `name`, `#gameForm="ngForm"`, `(ngSubmit)` y `label for` + `id`.
- Validadores como atributos (`required`, `minlength`, `min` y `max`) y estados del control (`valid`, `dirty`, `touched`, `errors` y `pending`).
- Mensajes de error con `@if` anidados y `errors?.['clave']`. Los corchetes hacen falta por la index signature (ngtsc 4111).
- `select` obligatorio con una opción `value=""`.
- Class binding `[class.invalid-control]`, `@let` y las clases `ng-invalid` y `ng-dirty`.
- `[disabled]="gameForm.invalid"`, `JsonPipe` y el error "circular structure" al hacer `gameForm | json`.

**12/11: CRUD completo template-driven y lectura de la Act 11**
- `onSaveGame(form: NgForm)` con el filtro `if (form.invalid) return`. Se quita `[disabled]` del botón y se añade `novalidate`.
- `GameService` con `getGameById`, `getGamesPyPage` (`_page` / `_limit` y `observe: 'response'`), `create` y `update`.
- Comunicación padre e hijo: `editGame = input.required<Game | undefined>()`, `actualizaGames = output<Game>()`, `ngOnChanges` con `SimpleChanges` y una copia con spread.
- Alta o edición según la bandera `edit` o según `game.id`. Al final se queda la bandera. `resetForm()`.
- Pizarra en Excalidraw y breakpoints.
- Lectura de la Act 11 ("Migración ReactiveForms Git Vercel"): `FormGroup`, `FormControl`, `[formGroup]`, `formControlName` y una rama de Git.

**18/11: migración a formularios reactivos y despliegue en Vercel**
- Rama `refactor/reactive-form2`. Se cambia `FormsModule` por `ReactiveFormsModule`.
- `FormControl('', { nonNullable: true, validators: [...] })` y `FormGroup`. Se quitan `name`, `ngModel` y los atributos de validación, y se usa `formControlName`.
- La clave del `FormGroup` tiene que coincidir con `formControlName` (lo demuestra con `genre_`). Error NG8003 si queda algún `#x="ngModel"`.
- Tipado: `FormControl<any>`, `FormControl<string | null>` y `FormControl<string>` según cómo se cree.
- `hasError('required')` frente a `errors?.['required']`. `gameForm.submitted` en las condiciones.
- `#gameForm="ngForm"` pasa a ser un `FormGroupDirective`.
- Modo edición con `formGroup.setValue(...)`; la diapositiva usa `patchValue`. Faltaba el `formControlName` de stock.
- Diapositiva "Reactivos en Angular 19". Barrera de validación con `markAllAsTouched` y `getRawValue`.
- `npm ci`, `npm run build` (sale en `dist/proj-game/browser`), `vercel.json` con un rewrite y despliegue (detalle en 4.2).
- Error de CORS: la web publicada intenta llamar a `localhost:3000`.

**19/11: Angular Router (`proyecto-rutas`, Act 12)**
- `provideRouter(routes)` en `app.config.ts`. `Routes` es un `Route[]`.
- Páginas en `pages/`. El `path` va sin barra y `routerLink="/..."` con barra. Ruta vacía con `redirectTo` + `pathMatch: 'full'`.
- `<router-outlet />` y las importaciones de `RouterOutlet`, `RouterLink` y `RouterLinkActive`.
- Rutas hijas (`children`) con un segundo outlet en `AulaComponent`, enlaces relativos y absolutos, y estilos en `styles.css`.
- `routerLinkActive` y `[routerLinkActiveOptions]="{exact: true}"`. Sin corchetes da el error ngtsc 2322.
- Experimento: una ruta plana `'aula/avisos'` comparada con la misma ruta como hija.
- Solo en el enunciado y en la solución desplegada: `:id`, `[routerLink]` con array, query params, snapshot frente a observable, comodín `**` y lazy loading.
- Navegación desde código con `inject(Router)` y `router.navigate(['/inicio'])`. Vercel CLI.

### 1.2 Conceptos por tema

**Proyecto, CLI y entorno**
- Standalone sin NgModule: componentes con `imports: [...]` (14/10, 27/10, 05/11, 19/11).
- Generar con el CLI: `ng g c <ruta>` con o sin `--skip-tests`, `ng g s` y `ng g i` / `ng g interface`. `ng g pages/posts` falla porque falta el `c`.
- `ng serve -o` (HMR, Vite, puerto 4200). Scripts `start`, `build`, `watch` y `test`; `ng test` usa Karma.
- Aviso TS-998113: algo de `imports` no se usa en la plantilla (14/10, 05/11).
- Rangos semver (`^` frente a `~`) y `dependencies` frente a `devDependencies` (28/10).
- Carpetas: `interface/`, `models/`, `services/` y `pages/<x>/`, con las páginas hijas anidadas (27/10, 19/11).

**Plantillas y bindings**
- Interpolación `{{ }}` (todas).
- Control flow: `@if / @else / @else if`; `@for (...; track x.id)` con `track` obligatorio; `@let` (05/11, 12/11, 18/11).
- Property binding (`[src]`, `[alt]`, `[disabled]`), class binding `[class.x]` y eventos `(click)` y `(change)`.
- Referencias de plantilla: `#buscarId` y `#tamPage` (05/11).
- Lo que usa la plantilla no puede ser `private` (error NG1); se usa `protected`. El `this.` en la plantilla es opcional (27/10, 05/11).
- Pipe `json`: en un componente standalone hay que importar `JsonPipe` (05/11, 12/11).

**Estilos y maquetación**
- Flexbox: `flex: grow shrink basis` (`0 0 30%`, `1`, `1 1 250px`), flex anidado y alto con `vh` (14/10).
- `:host` y el selector del hijo en el CSS del padre (14/10).
- Encapsulación (`_ngcontent`, `_nghost`). Estilos globales en `styles.css` frente al CSS del componente (14/10, 05/11, 19/11).
- Tailwind CSS 4: PostCSS, `@import "tailwindcss"` y `@source`, clases utilitarias y variantes `hover:` y `sm:` (27/10).
- Errores del formulario con las clases automáticas `ng-valid`, `ng-invalid`, `ng-dirty`… (05/11).

**Servicios, DI y HTTP**
- `@Injectable({ providedIn: 'root' })`: el servicio es un singleton (27/10, 28/10).
- Inyectar: `inject()` en un campo es la forma preferida. Por constructor hace falta `private` (si no, TS2339).
- `HttpClient` tipado: `get<T>`, `post<T>`, `put<T>` y `delete<void>`. Sin el genérico devuelve `Observable<Object>`. Tiene 15 sobrecargas: si falta la URL, TypeScript elige la de `arraybuffer`.
- `provideHttpClient()` en `app.config.ts`: no se ve en pantalla, pero sale en las preguntas finales (28/10).
- URL base en una propiedad `apiUrl` del servicio. Template literals para las URL con id.
- Interfaz genérica `CRUD<T, S>`: `T` es la entidad completa y `S` la que se envía (27/10).
- Modelos: `interface` más `Omit<X,'id'>`, o un `id?` opcional.
- Paginación con JSON Server: `?_page=&_limit=` y `observe: 'response'` (12/11).
- Separar responsabilidades: el componente pinta y el servicio habla con la API.

**Ciclo de vida, RxJS y signals**
- `implements OnInit` y `ngOnInit`: ahí se cargan los datos.
- `Observable` y `subscribe`: la respuesta llega más tarde.
- Signals: `signal<T>()`, `WritableSignal`, `.set()` y lectura con `x()`. Signals `loading` y `error` para los estados de la pantalla (solo el 27/10).
- `ngOnChanges(changes: SimpleChanges)`: se lee `changes['x']?.currentValue` (12/11, 18/11).

**Comunicación entre componentes**
- Composición: selector del hijo más `imports`.
- `input.required<T>()` y `output<T>()` con `.emit()`. En el padre: `[editGame]` y `(actualizaGames)="...($event)"` (12/11, 18/11).

**Formularios template-driven (Act 10)**
- Montaje: `FormsModule`, `[(ngModel)]` con `name`, `#f="ngForm"` y `#c="ngModel"`.
- Validadores en el HTML: `required`, `minlength`, `min` y `max`.
- Estados: valid/invalid, pristine/dirty, touched/untouched, errors, pending y submitted.
- Mostrar errores: `@if (c.invalid && (c.touched || c.dirty))` y, dentro, `@if (c.errors?.['clave'])`.
- Envío: `(ngSubmit)` en lugar de `(click)`. Primero `[disabled]="gameForm.invalid"`; después se cambia por `if (form.invalid) return` y `novalidate`. `resetForm()`.
- `type="number"` con ngModel guarda un número, o `null` si se vacía.

**Formularios reactivos (Act 11)**
- Montaje: `ReactiveFormsModule`, `FormControl` con `{nonNullable, validators}`, `FormGroup`, `[formGroup]` y `formControlName`.
- `Validators`: `required`, `minLength`, `min`, `max` y `pattern`.
- Errores: `hasError()` frente a `errors?.[]`.
- Referencia del formulario: `FormGroupDirective` (`#gameForm="ngForm"` sobre `[formGroup]`).
- Rellenar: `setValue` frente a `patchValue`.
- Barrera de validación: `markAllAsTouched`, después `if (invalid) return` y luego `getRawValue`.
- No se mezclan los dos estilos (error NG8003).

**Router**
- `Routes`, `redirectTo` + `pathMatch: 'full'` y `loadComponent` (27/10, 19/11).
- `routerLink` como atributo o `[routerLink]` con array (hay que importar `RouterLink`) y `<router-outlet>`.
- `provideRouter(routes)` (19/11).
- Rutas hijas: `children`, segundo outlet, enlaces relativos y absolutos, y redirección dentro de `children`.
- Enlace activo: `routerLinkActive` y `[routerLinkActiveOptions]="{exact: true}"`.
- Solo en el enunciado y la solución desplegada: `:id`, query params, snapshot frente a observable, comodín `**` (las redirecciones van antes del comodín).
- Navegación desde código: `inject(Router).navigate([...])`.

**Depuración y herramientas**
- Chrome DevTools: Elements, Styles, modo responsive, Sources con breakpoints, Console y Network.
- Angular Language Service: tooltips y abrir `node_modules/@angular/forms/index.d.ts`.
- Cursor con su agente de IA (se revisa lo que genera), Excalidraw y Postman.

### 1.3 Patrones de código del profesor

**Padre e hijo con Flexbox (14/10)**
```ts
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LamparaComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'proj-lamp';
  enchufado = false;
  estadoLampara = false;
}
```
```html
<div class="cab">
  <div class="estado">
    @if (enchufado) { <span>Estado conexión eléctrica: ENCHUFADO</span> }
    @else { <span>Estado conexión eléctrica: DESENCHUFADO</span> }
  </div>
  <div class="boton">
    @if (enchufado) { <button>DESENCHUFAR</button> } @else { <button>ENCHUFAR</button> }
  </div>
</div>
<app-lampara></app-lampara>
```
```css
:host { display: flex; flex-direction: column; height: 100vh; }
.cab { display: flex; flex-direction: column; background-color: blue; flex: 0 0 30%; }
app-lampara { background-color: chartreuse; flex: 1; }
span { color: white; }
button { margin: 1rem; }
```
No se ve si el `flex: 0 0 30%` de `.cab` quedó activo o comentado **[dudoso]**.

**Interfaz CRUD, modelo y servicio HTTP (27/10)**
```ts
export interface CRUD<T, S> {
  getAll(): Observable<T[]>;
  getById(id: number): Observable<T>;
  create(entity: S): Observable<T>;
  update(id: number, entity: S): Observable<T>;
  delete(id: number): Observable<void>;
}

export interface Post { userId: number; id: number; title: string; body: string; }
export type NewPost = Omit<Post, 'id'>;
```
La interfaz va en `interface/crud.ts` y el modelo en `models/post.model.ts`.
```ts
@Injectable({ providedIn: 'root' })
export class PostsService implements CRUD<Post, NewPost> {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://jsonplaceholder.typicode.com/posts';

  getAll(): Observable<Post[]> { return this.http.get<Post[]>(this.apiUrl); }
  getById(id: number): Observable<Post> { return this.http.get<Post>(`${this.apiUrl}/${id}`); }
  create(entity: NewPost): Observable<Post> { return this.http.post<Post>(this.apiUrl, entity); }
  update(id: number, entity: NewPost): Observable<Post> { return this.http.put<Post>(`${this.apiUrl}/${id}`, entity); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
```

**Página con signal (27/10)**
```ts
@Component({
  selector: 'app-posts',
  imports: [CommonModule, RouterLink],
  templateUrl: './posts.component.html',
  standalone: true,
})
export class PostsComponent implements OnInit {
  private readonly postsService = inject(PostsService);
  protected readonly posts: WritableSignal<Post[]> = signal<Post[]>([]);

  ngOnInit(): void {
    this.postsService.getAll().subscribe((posts) => this.posts.set(posts));
  }
}
```
```html
@for (post of posts(); track post.id) { {{post.title}} {{post.body}} }
```
El componente de comentarios añade `protected readonly loading = signal(true)` y `error = signal<string | null>(null)`. Los generó la IA de Cursor y no se ve cómo se actualizan **[dudoso]**.

**Rutas de `angular-http` (27/10)**
```ts
export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'posts', loadComponent: () => import('./pages/posts/posts.component').then(m => m.PostsComponent) },
  { path: 'comments', component: CommentsComponent },
];
```
```html
<a class="text-blue-500 cursor-pointer" [routerLink]="['/posts']">Posts</a>
```
Primero `posts` iba con `loadComponent` y después aparece con `component` **[dudoso]**.

**Inyección: función frente a constructor (28/10)**
```ts
export class AppComponent implements OnInit {
  products?: Product[];
  //Inyección por función
  private productService = inject(ProductService);
  //Inyección por constructor, importante el scope de la propiedad en el constructor
  //constructor( private productService: ProductService ) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe(products => {
      console.log(products);
      this.products = products;
    });
  }
}
```
```html
@for( product of this.products; track product.id) {
{{ product.title}}, precio {{ product.price}}
<img [src]="product.image" [alt]="product.title">
<br/>
}
```
Corrección: la imagen tiene que ir dentro del `@for`, porque fuera `product` no existe. El cuerpo de `ProductService` (`inject(HttpClient)` y `apiUrl = 'https://fakestoreapi.com/products'`) sale del documento de la actividad, no de la pantalla **[dudoso]**.

**Formulario template-driven (05/11 y 12/11)**
```ts
@Component({ selector: 'app-crud', imports: [FormsModule, JsonPipe], templateUrl: './crud.component.html', styleUrl: './crud.component.css' })
export class CrudComponent implements OnChanges {
  private gameService = inject(GameService);
  edit = false;
  editGame = input.required<Game | undefined>();
  actualizaGames = output<Game>();
  game: Game = { title: '', genre: '', platform: '', price: 0, stock: 0 };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editGame']?.currentValue) {
      this.game = { ...changes['editGame'].currentValue };
      this.edit = true;
    }
  }

  onSaveGame(form: NgForm) {
    if (form.invalid) { return; }
    if (this.edit) {
      this.gameService.update(this.game).subscribe(gameUpdated => {
        form.resetForm();
        this.edit = false;
        this.actualizaGames.emit(gameUpdated);
      });
    } else {
      this.gameService.create(this.game).subscribe(gameSaved => {
        form.resetForm();
        this.actualizaGames.emit(gameSaved);
      });
    }
  }
}
```
```html
<form #gameForm="ngForm" (ngSubmit)="onSaveGame(gameForm)" novalidate>
  <label for="titleId">Título</label>
  <input id="titleId" type="text" name="title" [(ngModel)]="this.game.title"
         required minlength="3" #title="ngModel" />
  @if (title.invalid && (title.touched || title.dirty)) {
    @if (title.errors?.['required']) { <p>Título obligatorio...</p> }
    @if (title.errors?.['minlength']) { <p>Longitud mínima 3...</p> }
  }

  <select id="genreId" name="genre" [(ngModel)]="this.game.genre" required #genre="ngModel">
    <option value="">Selecciona un género</option>
    <option value="Platform">Platform</option>
  </select>

  <label for="stockId">Stock: </label>
  @let invalidStock = stock.invalid && (stock.touched || stock.dirty || gameForm.submitted);
  <input [class.invalid-control]="invalidStock" id="stockId" type="number" name="stock"
         [(ngModel)]="game.stock" required min="0" max="999" #stock="ngModel">
  @if (invalidStock) {
    @if (stock.errors?.['min'] || stock.errors?.['max']) { <p>... fuera de rango permitido [0-999]</p> }
  }

  <button>Guardar</button>
  <p>Válido: {{ gameForm.valid }}</p>
  <p>Modificado: {{ gameForm.dirty }}</p>
</form>
{{ this.game | json }}
```
```css
.invalid-control { border: 2px solid; }
#priceId.ng-invalid { border: 2px solid; }
```
El `select` de género lleva además las opciones Strategy, Racing, RPG, Action, Adventure, Simulation y Sports.

**GameService (12/11)**
```ts
getGameById(id: number): Observable<Game> { return this.http.get<Game>(`${this.apiUrl}/${id}`); }
getGamesPyPage(pag: number, tamPage: number) {
  return this.http.get<Game[]>(this.apiUrl + `?_page=${pag}&_limit=${tamPage}`, { observe: 'response' });
}
create(game: Game) { return this.http.post<Game>(this.apiUrl, game); }
update(game: Game) {
  if (game.id) { return this.http.put<Game>(this.apiUrl + `/${game.id}`, game); }
  throw new Error(`Game a actualizar sin id = ${game}`);
}
```
El final de la URL de `getGamesPyPage` sale cortado **[dudoso]**. El nombre `getGamesPyPage` es una errata del código de clase.

**Padre del CRUD (12/11 y 18/11)**
```html
@for (game of this.games; track game.id) {
  {{ game | json }}
  <button type="button" (click)="this.editGame = game">Editar</button><br/>
}
<select #tamPage (change)="onChangeTamPage(tamPage.value)">
  <option value="5">5</option><option value="10">10</option>
</select>
{{ this.pag }} de {{ this.totalPag }}
<button [disabled]="this.pag === 1" (click)="onAntPag()">Anterior</button>
<button [disabled]="this.pag === this.totalPag" (click)="onSigPag()">Siguiente</button>
<app-crud [editGame]="this.editGame" (actualizaGames)="onActualizaGames($event)"></app-crud>
```
El `$event` es una suposición **[dudoso]**. El `.ts` del padre (`loadGames` y el resto de métodos) no se ve.

**Formulario reactivo (18/11)**
```ts
@Component({ selector: 'app-crud', imports: [ReactiveFormsModule, JsonPipe], templateUrl: './crud.component.html', styleUrl: './crud.component.css' })
export class CrudComponent implements OnChanges {
  private gameService = inject(GameService);
  title = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] });
  genre = new FormControl('', { nonNullable: true, validators: [Validators.required] });
  platform = new FormControl('', { nonNullable: true, validators: [Validators.required] });
  price = new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0.01), Validators.max(100)] });
  stock = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.min(0), Validators.max(999)] });
  formGroup = new FormGroup({ title: this.title, genre: this.genre, platform: this.platform, price: this.price, stock: this.stock });

  edit = false;
  editGame = input.required<Game | undefined>();
  actualizaGames = output<Game>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editGame']?.currentValue) {
      this.formGroup.setValue(changes['editGame'].currentValue);
      this.edit = true;
    }
  }

  onSaveGame(form: FormGroupDirective) {
    if (form.invalid) return;
    if (this.edit) {
      this.gameService.update({ id: this.editGame()?.id, ...form.value }).subscribe(gameUpdated => {
        form.resetForm(); this.edit = false; this.actualizaGames.emit(gameUpdated);
      });
    } else {
      this.gameService.create(form.value).subscribe(gameSaved => {
        form.resetForm(); this.actualizaGames.emit(gameSaved);
      });
    }
  }
}
```
```html
<form [formGroup]="formGroup" #gameForm="ngForm" (ngSubmit)="onSaveGame(gameForm)" novalidate>
  <input id="titleId" type="text" formControlName="title" />
  @if (title.invalid && (title.touched || title.dirty)) {
    @if (title.hasError('required')) { <p>Título obligatorio...</p> }
    @if (title.errors?.['minlength']) { <p>Longitud minima 3...</p> }
  }
  <select id="genreId" formControlName="genre">...</select>
  <input id="priceId" type="number" formControlName="price" />
  @if (price.invalid && (price.touched || price.dirty || gameForm.submitted)) { ... }
  <button>Guardar</button>
</form>
```
Notas sobre este código:
- El valor inicial de `price` se lee `''` o `0` **[dudoso]**. El de `stock` es `''` en clase y `0` en la diapositiva.
- `setValue` es lo que se escribe en directo; la diapositiva y la clase del 19/11 usan `patchValue`. `setValue` exige que el objeto tenga exactamente las claves del formulario, y `Game` trae además `id`: no se ve si dio error **[dudoso]**.
- `onSaveGame` es la versión de la diapositiva.

Barrera de validación de la guía (Tarea 5):
```ts
guardar(form: FormGroupDirective): void {
  this.gameForm.markAllAsTouched();
  if (this.gameForm.invalid) { return; }
  const game = this.gameForm.getRawValue();
}
```
Después de `getRawValue` la guía deja pendiente llamar a `GameService` y hacer `form.resetForm()`. Aquí `this.gameForm` es el `FormGroup` (en el código del profesor se llama `formGroup`).

**Router (19/11)**
```ts
export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes)]
};

export const routes: Routes = [
  { path: '', redirectTo: '/inicio', pathMatch: 'full' },
  { path: 'inicio', component: InicioComponent },
  { path: 'aula', component: AulaComponent,
    children: [
      // ruta -> /aula/materiales
      { path: 'materiales', component: MaterialesComponent },
      // ruta -> /aula/avisos
      { path: 'avisos', component: AvisosComponent }
    ]
  },
  { path: 'ayuda', component: AyudaComponent }
];
```
`app.component.html`:
```html
<h1>Portal educativo</h1>
<nav>
  <a routerLink="/inicio">Inicio</a>
  <a routerLink="/aula">Aula</a>
  <a routerLink="/aula/materiales">Aula > Materiales</a>
  <a routerLink="/ayuda">Ayuda</a>
</nav>
<hr>
<router-outlet />
```
`aula.component.html` (el componente importa `RouterOutlet`, `RouterLink` y `RouterLinkActive`):
```html
<h2>Aula virtual</h2>
<nav>
  <a routerLinkActive="class-css-activo" [routerLinkActiveOptions]="{exact: true}" routerLink="materiales">Materiales</a>
  <a routerLinkActive="class-css-activo" [routerLinkActiveOptions]="{exact: true}" routerLink="avisos">Avisos</a>
</nav>
<hr>
<router-outlet />
```
`styles.css`:
```css
a { margin-left: 1rem; }
.class-css-activo { color: yellow; }
```
Del enunciado (no escrito en clase):
```ts
{ path: '', redirectTo: 'materiales', pathMatch: 'full' }
{ path: 'materiales/:id', component: DetalleMaterialComponent }
```
```html
<a [routerLink]="['/aula/materiales', 1]">Material 1</a>
```
La primera ruta va dentro de `children`. Navegación desde código (no se ve el import de `Router` **[dudoso]**):
```ts
router = inject(Router);
ngOnInit() { this.router.navigate(['/inicio']); }
```

### 1.4 Librerías, comandos y versiones

| Elemento | Detalle | Clase |
|---|---|---|
| Angular | 19.2.25 (`ng-version`); paquetes `^19.2.0` | 14/10, 27/10, 18/11 |
| `@angular/cli`, `@angular-devkit/build-angular` | `^19.2.27` (una captura muestra `~`) | 28/10 |
| TypeScript | `~5.7.2` | 27/10, 28/10 |
| rxjs / tslib / zone.js | `~7.8.0` / `^2.3.0` / `~0.15.0` | 28/10 |
| Pruebas | Karma `~6.4.0`, Jasmine `~5.6.0` y sus plugins; `ng test` en el puerto 9876 | 14/10, 28/10 |
| `@angular/core` | `Component`, `Injectable`, `inject`, `OnInit`, `OnChanges`, `SimpleChanges`, `signal`, `WritableSignal`, `input`, `output`, `ApplicationConfig`, `provideZoneChangeDetection` | todas |
| `@angular/common` | `CommonModule`, `JsonPipe` | 27/10, 05/11 |
| `@angular/common/http` | `HttpClient`, `provideHttpClient`, `HttpErrorResponse` | 27/10, 28/10 |
| `@angular/forms` | `FormsModule`, `NgForm`, `NgModel`; `ReactiveFormsModule`, `FormControl`, `FormGroup`, `FormGroupDirective`, `Validators` | 05/11, 18/11 |
| `@angular/router` | `Routes`, `Route`, `provideRouter`, `RouterOutlet`, `RouterLink`, `RouterLinkActive`, `Router`, `ActivatedRoute` | 27/10, 19/11 |
| Tailwind CSS 4 | `npm install tailwindcss @tailwindcss/postcss postcss --force`, `.postcssrc.json`, `@import "tailwindcss";` | 27/10 |
| json-server | `npm install --save-dev json-server@0.17.4` (la "versión clásica"); `npx json-server --watch db.json --port 3000` | 28/10, 05/11 |
| Scripts de la API | `api`, `api-db-json`, `api-db-js` y `export:json` (faker con `db.js` y `export-json.js`) | 05/11, 18/11 |
| CLI (generar) | `ng new <p>` (CSS, sin SSR), `ng g c [--skip-tests]`, `ng g s`, `ng g i`, `ng g interface` | 14/10–19/11 |
| CLI (servir y compilar) | `ng serve -o` (con `--host` y `--port` opcionales), `ng build`, `ng build --watch --configuration development` | 14/10–18/11 |
| npm | `npm start`, `npm run test`, `npm ci`, `npm run build`, `npm audit fix` | 14/10, 27/10, 18/11 |
| Git | `git switch master`, `git switch -c refactor/reactive-form2`, `git pull --ff-only`, `git branch --show-current` | 12/11, 18/11 |
| Vercel CLI | 66.2.0 en la terminal: `vercel login`, `vercel project ls` | 19/11 |
| APIs de prueba | JSONPlaceholder, Fake Store API, JSON Server en `localhost:3000/games` | 27/10, 28/10, 05/11 |
| Herramientas | VS Code con WSL Ubuntu, Cursor con su agente de IA, Angular Language Service, Angular DevTools, Chrome DevTools, Postman, Excalidraw, Prettier, GitLens / Git Graph | todas |

Códigos de error que salieron: TS-998113 (import sin usar), NG1 (miembro `private` usado en la plantilla), TS2339 (falta `private` en el constructor), -992011 (`NgModel` no es standalone), -995002 (expresión vacía), ngtsc 4111 (index signature), NG8003 (`#x="ngModel"` sin `FormsModule`) y ngtsc 2322 (`routerLinkActiveOptions` sin corchetes).

---

## 2. Backend con Node (Express y Prisma)

Clases del 20/10, 27/10, 28/10, 03/11 y 18/11/2026. El profesor es Juan Antonio; algunos bloques son vídeos.

Hay dos proyectos:
- **`node-server`**: el que el profesor monta en directo el 20/10.
- **`node-server-26-27`**: su repositorio de referencia, con tags de Git de v0.1.0 a v1.1.3 y una rama `vercel-deployment`. Lo recorre versión a versión con Cursor y Git Graph. Los commits son de noviembre de 2025 (el repositorio viene del curso anterior).

### 2.1 Temario por fechas

**20/10, bloque 1: montar `node-server` desde cero**
- `npm init` e instalación de express, typescript, tsx, morgan, nodemon y los `@types/*`.
- `dependencies` frente a `devDependencies` (`--save-dev`), con errores reales: un `@types/morgan` sin `-D`, nodemon en el bloque equivocado y comas finales en el JSON.
- Error típico: instalar el paquete `tsc`, que está deprecado y **no es** TypeScript. `npx tsc` falla con "This is not the tsc command you are looking for". Se arregla con `npm uninstall tsc`, borrando `node_modules` y `package-lock.json`, y con `npm install --save-dev typescript`. Después `npx tsc --init` ya funciona.
- `nodemon.json` con `npx tsx watch src/index.ts` y el script `"dev": "npx nodemon"`.
- `"type": "module"`, ajustes de `tsconfig.json` (`rootDir`, `outDir`, `types`) e imports relativos con extensión `.js`.
- `src/config/env.ts` con dotenv y `.env` (`NODE_PORT`, `NODE_ENV`).
- Separación de `app.ts` (crea y configura Express) e `index.ts` (llama a `listen`). Middlewares `express.json()` y `express.urlencoded()`, y la ruta `GET /`.

**20/10, bloque 2: servidor básico y primer vistazo a la referencia**
- Error `does not provide an export named 'default'` (había un fichero sin guardar) y quitar el `export` que sobraba en `index.ts`.
- `import "dotenv/config"` en lugar de `dotenv.config()`. Plantillas de texto con backticks.
- 404 por defecto (`Cannot GET /`), `morgan('dev')` y la ruta `/health`. Exploración de `req`.
- En la referencia: `env.ts` con `required()`, `index.ts` con cierre ordenado (SIGTERM y SIGINT), `app.ts` con helmet, cors, json, morgan, `/health` y `errorHandler`, `middleware/error.ts`, `config/db.ts` (PrismaClient), `schema.prisma` (modelo `User`) y `docker-compose.yml` con Postgres 16.
- Selector de Cursor "Select a branch or tag to checkout": ramas `main` y `vercel-deployment`, tags `v1.0.0` y `v1.1.0`.

**27/10, bloque 2: la referencia en la v0.4.0**
- `CHANGELOG.md` por versiones, tags y Git Graph. Qué añade cada versión: v0.1.0 la base, v0.2.0 env, error, app e index, v0.3.0 Prisma y Docker, v0.4.0 Zod y el módulo de usuarios.
- `package.json` (el `^`, los `@types`, los scripts `start` y `test`) y `nodemon.json` (en v1.0.2 se pasa de ts-node a tsx).
- Migración `init` (SQL generado), `schema.prisma` y `db.ts`.
- `index.ts` (borra `const app = express()` para enseñar los errores), `.env` y `env.ts`.
- `app.ts` con el router montado por prefijo (`/api/users`).
- Módulo `users`: routes, controller, service y schema.
- Middleware `validate.ts`, con los avisos de obsoleto de Zod 4.

**27/10, bloque 3: validación con Zod 4 (v0.4.0) y auth (v0.5.0)**
- `z.string().email()` pasa a `z.email()`, `flatten()` a `z.treeifyError()` y `ZodSchema` a `ZodType`. El problema de `import type` cuando `z` se usa como valor.
- Comprobar la versión instalada en `node_modules` y buscar en issues de GitHub. TuxCare (ciclo de vida de los paquetes y CVE) solo como contexto.
- `updateUserCtrl`: P2025 → 404 y P2002 → 409. Choque de tipos con `exactOptionalPropertyTypes`.
- v0.5.0: `auth.routes`, `auth.controller` (`registerCtrl` y `loginCtrl`) y `auth.service` (bcrypt y JWT).

**28/10 (vídeos): probar APIs con Postman y JSON Server**
Son las herramientas de las actividades 8 y 9 de Angular.
- Fake Store API: documentación en Redocly, `GET /products`, `/products/{id}` y `/users`, y `POST` con 201/400.
- Postman: colecciones, entornos, la variable `{{url_base}}` y las variables dinámicas. El error `ENOTFOUND` sale cuando no hay entorno activo. Insomnia como alternativa.
- `json-server@0.17.4` con `db.json` y el script `api`. Sin `npx` sale `command not found`. `GET /` devuelve 404 y `GET /games` devuelve 200.
- Colección GameService y entorno GameServiceEnv. Pestaña Preview para ver imágenes.

**03/11, bloque 1: migraciones de Prisma, drift e introspección; Winston**
- Supabase como Postgres a través del pooler. Schema Visualizer, SQL Editor y Table Editor.
- Mayúsculas en PostgreSQL: hay que escribir `"Media"` entre comillas.
- La tabla `_prisma_migrations`.
- Drift provocado a propósito: `migrate status` no lo ve, `migrate dev` lo detecta y `migrate reset` recrea la BD.
- `prisma db pull` (introspección, con `map:`). Copia `.env_local` y Session pooler.
- Se mencionan Guepard y GFS.
- Checkout de v0.8.0 y `utils/logger.ts` con Winston. `index.ts` pasa a usar el logger.

**03/11, bloque 2: v0.8.0 (rate limiting y logs) y v0.9.0 (tests)**
- `logger.ts`, `index.ts` con cierre ordenado y `process.exit(0)`, y `app.ts` sin morgan, con `requestLogger`, `generalLimiter` y `authLimiter`.
- `rateLimiter.ts`, `requestLogger.ts` y `error.ts` con el logger.
- `tsconfig` con `exclude`, scripts de test con ESM, limitadores desactivados en `NODE_ENV=test`, `git push origin --tags`, `jest.config.js` y `users.test.ts`.

**03/11, bloque 3: tests, Docker de producción y Swagger (v0.9.0 → v1.0.0 → v1.1.3)**
- `auth.test.ts` y más tests de `users`.
- README como "manual completo" y CHANGELOG.
- Dockerfile multietapa, `.dockerignore`, `docker-compose.prod.yml`, `env.production.example` y `.gitignore`.
- Swagger: `config/swagger.ts` y `/api-docs`, con `helmet({ contentSecurityPolicy: false })`.
- `validate(schema)` en las rutas de auth.
- Comparación con swagger-autogen (artículo de freeCodeCamp).

**18/11 (vídeo)**
- Solo se comprueba en el navegador que `http://localhost:3000/games` responde antes de arrancar Angular (puerto 4200). Por las clases de Angular, es el JSON Server de `proj-game`, no una API con Express. No se ve código de backend.

### 2.2 Conceptos por tema

**npm y el proyecto**
- `package.json` (`name`, `main`, `type`, `scripts`) y los rangos con `^`.
- `dependencies` y `devDependencies`: en producción van express, morgan, dotenv… En desarrollo (`-D`) van `@types/*`, typescript, tsx, ts-node, nodemon, jest… Si se olvida el flag, se arregla con `npm uninstall` y reinstalando.
- `@types/xxx`: tipos de TypeScript para librerías escritas en JS.
- `npx` y los scripts: los binarios locales no están en el PATH, así que `nodemon` y `json-server` a secas dan `command not found`.
- Reinstalar en limpio: `rm -rf node_modules package-lock.json` y `npm install`. `npm ci` instala exactamente lo del lockfile (se usa en Docker).
- `npm audit`: no se ejecuta `npm audit fix --force` a ciegas.
- El paquete `tsc` no es TypeScript: el compilador viene dentro de `typescript`.
- Versiones y seguridad: tooltip con la última versión, mirar la versión instalada en `node_modules`, ciclo de vida, CVE y EOL (TuxCare).

**TypeScript y ES Modules**
- `"type": "module"` con `module: "nodenext"` y `verbatimModuleSyntax`. Si falta, sale el error "CommonJS file under verbatimModuleSyntax".
- Los imports relativos llevan `.js` aunque el fichero sea `.ts`.
- `import type` solo importa tipos. Lo que se usa como valor (por ejemplo `z`) necesita un `import` normal.
- `tsconfig` estricto: `strict`, `noUncheckedIndexedAccess` y `exactOptionalPropertyTypes`. Este último hace que el tipo inferido por Zod no encaje con el `UserUpdateInput` de Prisma.
- Avisos de obsoleto (ts 6385 y 6387, el código sale tachado): se resuelven con la documentación, la guía de migración y los issues.
- Plantillas de texto con backticks y `${}`. Con comillas simples no se sustituye el valor.
- `process.env.X` es `string | undefined`: hace falta `||`, `??` o `Number()`.

**Desarrollo**
- nodemon + tsx: vigila `src` (ficheros `ts`) y reinicia al guardar. `rs` reinicia a mano.
- JSON estricto: sin comas finales, claves entre comillas dobles, y `Unexpected end of JSON input` si el fichero está sin guardar.
- Leer los errores: panel Problems, stack trace, quick fix y el agente de Cursor.

**Organización del servidor**
- `app.ts` e `index.ts` separados: `app.ts` configura y exporta, e `index.ts` solo hace `listen` y el cierre. Así Supertest usa la app sin levantar el servidor.
- Capas por módulo: rutas → `validate` → controlador → servicio → Prisma. Cada recurso va en `src/modules/<x>/` con `x.routes.ts`, `x.controller.ts`, `x.service.ts` y `x.schema.ts`. Además: `src/config` (env, db, swagger), `src/middleware` (auth, error, rateLimiter, requestLogger, validate), `src/utils` (logger) y `src/tests`.
- Router por prefijo: `app.use('/api/users', usersRoutes)`. Un middleware solo para una ruta: `app.use('/api/auth', authLimiter, authRoutes)`.

**Configuración y secretos**
- Un objeto `env` central en `config/env.ts`. El resto del código no usa `process.env`.
- `required()`: la app no arranca si falta una variable obligatoria (`JWT_SECRET`, `DATABASE_URL`, las de Cloudinary). Las opcionales tienen valor por defecto: `PORT` 3000, `NODE_ENV` development y `BCRYPT_SALT_ROUNDS` 10.
- `.env` y `.env.production` no se suben. Se versionan las plantillas `.env.example` y `env.production.example`. Hay una copia local `.env_local`. `JWT_SECRET` se pasa desde el entorno, no se escribe en el YAML.

**Middlewares de Express**
- El orden importa. Versión final: `helmet` → `cors` → `express.json({ limit: '10mb' })` → `requestLogger` (antes `morgan('dev')`) → `generalLimiter` → `/health` → `/api-docs` → rutas → `errorHandler`, siempre el último.
- Middleware de errores: 4 parámetros `(err, req, res, next)`, usa `err.status || 500` y responde `{ message }` (por defecto "Error interno").
- Los parámetros que no se usan llevan `_` delante (`_req`, `_next`).
- Middleware "fábrica": `validate(schema)` devuelve `(req, res, next)`.
- Middleware de log propio: apunta `Date.now()` antes de `next()` y escribe en `res.on('finish')`. Con un 5xx usa `error`, con un 4xx `warn` y con el resto `http`.
- Ruta de salud `/health`.

**Rutas, REST y códigos HTTP**
- `GET` de la lista, `GET /:id`, `POST`, `PUT`/`PATCH` y `DELETE`.
- Códigos: 200 (`res.json`), 201 (crear), 400 (validación o id que no es número), 401 (credenciales o falta de token), 404 (no existe), 409 (valor único repetido) y 500 (`catch`). El 404 por defecto de Express es `Cannot GET /`. El 404 de `favicon.ico` lo provoca el navegador.
- El id se comprueba con `Number(req.params.id)` + `isNaN`; si no vale, 400 "ID inválido".

**Validación con Zod 4**
- `z.object`, `z.string().min(n, 'mensaje')` y `.optional()` para que el PATCH sea parcial. Tipos con `z.infer<typeof schema>`.
- En Zod 4: `z.email()` (en lugar de `z.string().email()`), `z.treeifyError()` (en lugar de `.flatten()`) y `ZodType` (en lugar de `ZodSchema`). No se recomienda la subruta `zod/v3`.
- `safeParse` no lanza excepciones y `parse` sí.

**Prisma y PostgreSQL**
- `schema.prisma` tiene tres bloques: `generator`, `datasource` (postgresql, `env("DATABASE_URL")`) y los `model`. Atributos: `@id`, `@default(autoincrement())`, `@unique`, `@default(now())`, `@relation(... onDelete: Cascade)`, `@@index` y `?` para lo opcional.
- Un solo `PrismaClient`, exportado desde `config/db.ts`.
- Consultas: `findMany` con `select` y `orderBy`, `findUnique` con `where`, `create`, `update` y `delete`. `select` para no devolver nunca `passwordHash`.
- Errores de Prisma a HTTP: P2025 → 404 y P2002 → 409.
- Migraciones en el repo: una carpeta `timestamp_nombre/migration.sql` por migración, más `migration_lock.toml`. La BD apunta las aplicadas en `_prisma_migrations`.
- Comandos de migración:
  - `migrate status` solo mira la tabla de migraciones: no ve el drift.
  - `migrate dev` detecta el drift y pide un reset.
  - `migrate reset` borra la BD y la reaplica (se pierden los datos).
  - `db pull` reescribe el schema a partir de la BD (con `map:`); después hay que hacer `generate`.
  - `db push` lleva el schema a la BD sin crear migración.
- Flujo después de un `git pull`: `npm install` → `npx prisma generate` → `npx prisma migrate dev` (en producción, `migrate deploy`).
- Mayúsculas en PostgreSQL: sin comillas el nombre pasa a minúsculas, así que hay que escribir `"Media"`. `select * from user` sin comillas devuelve el usuario de la sesión.
- Relación 1:N `User` → `Media` con la FK `userId`. Los campos de `Media` son los datos que devuelve Cloudinary.
- La contraseña se guarda como `passwordHash`, nunca en claro.

**Autenticación**
- `bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS)` al registrar y `bcrypt.compare` al entrar.
- JWT: `jwt.sign({ sub: user.id, email }, env.JWT_SECRET, { expiresIn: '7d' })`.
- El mensaje es el mismo en los dos fallos ("Credenciales inválidas"), para no dar pistas.
- El servicio hace `throw new Error('...')` y el controlador traduce el mensaje a un código HTTP.
- De la v0.6.0 y la v0.7.0 solo se conoce el contenido por los tags, el README y los tests: middleware JWT, rutas protegidas, `/me`, cambiar el perfil y la contraseña. El id sale de `req.user.sub`, así que cada usuario solo modifica lo suyo.

**Seguridad**
- `helmet()` (cabeceras) y `cors()`. Con `{ contentSecurityPolicy: false }` se ve Swagger UI.
- Rate limiting: límite general de 100 peticiones cada 15 min por IP y otro de auth de 5 cada 15 min (`skipSuccessfulRequests`: solo cuentan los fallidos). Se desactiva en test.
- Tests que comprueban que no se expone `passwordHash`. La Fake Store API devuelve `password` en `/users`: ejemplo de lo que no se debe hacer.

**Logs**
- `morgan('dev')` en las primeras versiones y Winston desde la v0.8.0.
- Winston: niveles numéricos (`error` 0 … `debug` 4) con un color cada uno; formato con `combine`, `timestamp`, `colorize` y `printf`; un transport por destino (consola, `logs/error.log` solo errores y `logs/all.log`); nivel `debug` en desarrollo y `warn` en el resto; una sola instancia exportada.

**Cierre ordenado (graceful shutdown)**
- `const server = app.listen(...)` y `process.on('SIGTERM' | 'SIGINT')` → `server.close(cb)` → `process.exit(0)`. Así terminan las peticiones en curso (Ctrl+C o cuando Docker para el contenedor).

**Tests (Jest + Supertest)**
- `request(app)` sin levantar el servidor.
- `describe` anidados por endpoint, `it` en español y `async/await`.
- `beforeAll` registra un usuario con email único (`Date.now()`) y guarda `authToken` y `userId`.
- Cabecera `Authorization: Bearer ...`.
- Siempre se prueban los casos negativos: sin token, token inválido, datos inválidos e id inexistente.
- Peticiones encadenadas: después de cambiar la contraseña, se comprueba el login con la nueva.
- Jest con ESM: `NODE_OPTIONS=--experimental-vm-modules`, ts-jest en modo ESM y un `moduleNameMapper` que quita el `.js`.
- Cuenta: 8 tests en Auth y 13 en Users.

**Docker**
- Compose de desarrollo: solo Postgres 16, variables `POSTGRES_*`, puerto 5432, volumen `pgdata` y healthcheck con `pg_isready`.
- Dockerfile multietapa: la etapa `builder` hace `npm ci`, `prisma generate` y `build`; la final copia `dist`, `.prisma` y `prisma/`. `COPY package*.json` va antes de `COPY . .` para aprovechar la caché. `dumb-init` como PID 1, `USER node`, `EXPOSE 3000` y `CMD` en forma de array.
- Compose de producción: variables `${VAR:-por_defecto}`, el host de la BD es el nombre del servicio (`db:5432`), `depends_on` con `condition: service_healthy`, red `bridge` propia y `restart: unless-stopped`.
- `.dockerignore`: deja fuera `node_modules`, `dist`, los `.env`, `.git`, los `*.md`…

**Documentación de la API**
- Swagger/OpenAPI: `swagger-jsdoc` genera la especificación 3.0.0 desde comentarios JSDoc en `*.routes.ts`, y `swagger-ui-express` la sirve en `/api-docs`. `bearerAuth` para probar las rutas con JWT y `tags` para agrupar. La alternativa es swagger-autogen.
- README como manual paso a paso, CHANGELOG por versión, tags de Git por hito y prefijos `feat:`, `fix:` y `docs:` en los commits.

**Probar APIs**
- Postman: colecciones y entornos con `{{url_base}}`; variables dinámicas (`$guid`…); Preview para imágenes; renombrar peticiones; asistente de IA. Insomnia es la alternativa.
- JSON Server: cada clave de primer nivel de `db.json` pasa a ser un recurso (`/games`, `/games/:id`). `--watch`, `--port`, y `s` + Intro para guardar un snapshot.
- Leer la documentación de la API (el contrato) antes de consumirla.

### 2.3 Patrones de código del profesor

Versión más completa que se vio de cada fichero.

**`package.json`: scripts (referencia, v0.9.0)**
```json
"type": "module",
"scripts": {
  "dev": "nodemon src/index.ts",
  "build": "tsc -p .",
  "start": "node dist/index.js",
  "test": "NODE_ENV=test NODE_OPTIONS=--experimental-vm-modules jest",
  "test:watch": "NODE_ENV=test NODE_OPTIONS=--experimental-vm-modules jest --watch",
  "test:coverage": "NODE_ENV=test NODE_OPTIONS=--experimental-vm-modules jest --coverage"
}
```
En el proyecto en directo el script era `"dev": "npx nodemon"`.

**`nodemon.json`**
```json
{ "watch": ["src"], "ext": "ts", "exec": "npx tsx watch src/index.ts" }
```
Así está en el proyecto en directo. Ojo: nodemon ya vigila `src` y `tsx watch` también, así que la vigilancia está duplicada. En la referencia, desde la v1.0.2, es `"exec": "tsx src/index.ts"` (antes `ts-node src/index.ts`).

**`tsconfig.json` (referencia)**
```json
{
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "module": "nodenext",
    "target": "esnext",
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,
    "noUncheckedIndexedAccess": true,
    "strict": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "noUncheckedSideEffectImports": true,
    "moduleDetection": "force",
    "skipLibCheck": true,
    "esModuleInterop": true
  },
  "exclude": ["node_modules", "dist", "src/tests"]
}
```
Por un mensaje de error del 27/10 se sabe que también tiene `exactOptionalPropertyTypes: true`. En el proyecto en directo se veían además `types: ["node", "express"]` y `jsx: "react-jsx"` (sobra, viene de la plantilla).

**`.env` y `env.production.example`**
```
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:<contraseña>@localhost:5432/app_db"
```
```
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DATABASE_URL=postgresql://postgres:postgres@db:5432/app_db
BCRYPT_SALT_ROUNDS=10
POSTGRES_PASSWORD=postgres
POSTGRES_DB=app_db
```
El `.env` que se ve no tiene `JWT_SECRET`, y con el `env.ts` de abajo la app no arrancaría sin él: es de una versión anterior al módulo de auth o está incompleto **[dudoso]**.

**`src/config/env.ts`**
```ts
import 'dotenv/config';

const required = (v: string | undefined, k: string) => {
  if (!v) throw new Error(`Falta variable de entorno: ${k}`);
  return v;
};

export const env = {
  PORT: Number(process.env.PORT ?? 3000),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  JWT_SECRET: required(process.env.JWT_SECRET, 'JWT_SECRET'),
  DATABASE_URL: required(process.env.DATABASE_URL, 'DATABASE_URL'),
  BCRYPT_SALT_ROUNDS: Number(process.env.BCRYPT_SALT_ROUNDS ?? 10),
  CLOUDINARY_CLOUD_NAME: required(process.env.CLOUDINARY_CLOUD_NAME, 'CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: required(process.env.CLOUDINARY_API_KEY, 'CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: required(process.env.CLOUDINARY_API_SECRET, 'CLOUDINARY_API_SECRET'),
};
```
Las tres variables de Cloudinary solo aparecen en la versión que se vio el 20/10 (rama `main`). La v0.4.0 termina en `BCRYPT_SALT_ROUNDS`. La versión en directo era `{ NODE_PORT: process.env.NODE_PORT || 3000, NODE_ENV: process.env.NODE_ENV || 'development' }`.

**`src/config/db.ts`**
```ts
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
```

**`src/index.ts` (v0.8.0 en adelante)**
```ts
import app from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const server = app.listen(env.PORT, () => {
  logger.info(`API escuchando en http://localhost:${env.PORT}`);
  logger.info(`Entorno: ${env.NODE_ENV}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    logger.info('Servidor cerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT recibido, cerrando servidor...');
  server.close(() => {
    logger.info('Servidor cerrado');
    process.exit(0);
  });
});
```

**`src/app.ts` (v1.0.0)**
```ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { errorHandler } from './middleware/error.js';
import { generalLimiter, authLimiter } from './middleware/rateLimiter.js';
import { requestLogger } from './middleware/requestLogger.js';
import { env } from './config/env.js';
import { swaggerSpec } from './config/swagger.js';
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(requestLogger);

if (env.NODE_ENV !== 'test') {
  app.use(generalLimiter);
}

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

if (env.NODE_ENV !== 'test') {
  app.use('/api/auth', authLimiter, authRoutes);
} else {
  app.use('/api/auth', authRoutes);
}

app.use('/api/users', usersRoutes);

app.use(errorHandler);

export default app;
```
El `export default app` no se ve en la v1.0.0 **[dudoso]**, pero `index.ts` y los tests lo importan así. Hasta la v0.7 era `app.use(helmet())` y `app.use(morgan('dev'))`, sin limitadores ni Swagger.

**`src/middleware/error.ts` (v0.8.0)**
```ts
import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  logger.error(`${req.method} ${req.path} - ${err.message}`);
  logger.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Error interno' });
}
```
La versión anterior tenía `_req` como parámetro y usaba `console.error(err)`.

**`src/middleware/validate.ts` (versión de clase para Zod 4, 27/10)**
```ts
import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';
import { z } from 'zod';

export const validate = (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: z.treeifyError(parsed.error) });
  }
  req.body = parsed.data;
  next();
};
```
La original usaba `ZodSchema<any>` y `parsed.error.flatten()`, las dos obsoletas en Zod 4.

**`src/middleware/rateLimiter.ts`**
```ts
import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Demasiadas peticiones desde esta IP, intenta de nuevo en 15 minutos' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Demasiados intentos de autenticación, intenta de nuevo en 15 minutos' },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});
```

**`src/middleware/requestLogger.ts`**
```ts
import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.path} ${res.statusCode} ${duration}ms`;

    if (res.statusCode >= 500) {
      logger.error(message);
    } else if (res.statusCode >= 400) {
      logger.warn(message);
    } else {
      logger.http(message);
    }
  });

  next();
}
```

**`src/utils/logger.ts`**
```ts
import winston from 'winston';
import { env } from '../config/env.js';

const levels = { error: 0, warn: 1, info: 2, http: 3, debug: 4 };

const colors = { error: 'red', warn: 'yellow', info: 'green', http: 'magenta', debug: 'blue' };
winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  new winston.transports.File({ filename: 'logs/all.log' }),
];

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'development' ? 'debug' : 'warn',
  levels,
  format,
  transports,
});
```

**`src/modules/users/users.schema.ts`**
```ts
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export const loginSchema = z.object({
  email: z.email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  email: z.email('Email inválido').optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
```
Es la versión con los cambios hechos en clase el 27/10: `loginSchema` y `updateUserSchema` ya usan `z.email()`, pero `registerSchema` sigue con `z.string().email()`. No se sabe si se quedó sin cambiar o no se llegó a ver **[dudoso]**. En el repositorio (v0.5.0 y v1.0.0) los tres siguen con `z.string().email()`.

**`src/modules/users/users.service.ts`**
```ts
import { prisma } from '../../config/db.js';

export async function createUser(email: string, name: string, passwordHash: string) {
  return prisma.user.create({
    data: { email, name, passwordHash },
    select: { id: true, email: true, name: true, createdAt: true }
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function findUserById(id: number) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, createdAt: true }
  });
}

export async function listUsers() {
  return prisma.user.findMany({
    select: { id: true, email: true, name: true, createdAt: true },
    orderBy: { id: 'asc' }
  });
}

export async function updateUser(id: number, data: { name?: string; email?: string }) {
  return prisma.user.update({
    where: { id },
    data,
    select: { id: true, email: true, name: true, createdAt: true }
  });
}

export async function deleteUser(id: number) {
  return prisma.user.delete({ where: { id } });
}
```
`data` va con el tipo escrito en línea porque `UpdateUserInput` choca con `exactOptionalPropertyTypes`. El profesor repite el `select` en cada función.

**`src/modules/users/users.controller.ts`**
```ts
import type { Request, Response } from 'express';
import { listUsers, findUserById, updateUser, deleteUser } from './users.service.js';

export async function listUsersCtrl(_req: Request, res: Response) {
  try {
    const users = await listUsers();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function updateUserCtrl(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }
    const user = await updateUser(id, req.body);
    res.json(user);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'El email ya está en uso' });
    }
    res.status(500).json({ message: error.message });
  }
}
```
De `getUserCtrl` solo se ve el principio (`Number` + `isNaN` → 400 y luego `findUserById`). El final, y `deleteUserCtrl` entero, no se ven **[dudoso]**.

**`src/modules/users/users.routes.ts` (v0.4.0)**
```ts
import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { updateUserSchema } from './users.schema.js';
import { listUsersCtrl, getUserCtrl, updateUserCtrl, deleteUserCtrl } from './users.controller.js';

const router = Router();
router.get('/', listUsersCtrl);
router.get('/:id', getUserCtrl);
router.patch('/:id', validate(updateUserSchema), updateUserCtrl);
router.delete('/:id', deleteUserCtrl);
export default router;
```
Las rutas `/me` y `/me/password` y el middleware `auth` (v0.6.0 y v0.7.0) se conocen solo por los tests. Su código no se vio.

**`src/modules/auth/auth.routes.ts` (v1.0.0)**
```ts
import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { registerSchema, loginSchema } from '../users/users.schema.js';
import { registerCtrl, loginCtrl } from './auth.controller.js';

const router = Router();
router.post('/register', validate(registerSchema), registerCtrl);
router.post('/login', validate(loginSchema), loginCtrl);
export default router;
```

**`src/modules/auth/auth.controller.ts` (v0.5.0)**
```ts
import type { Request, Response } from 'express';
import { register, login } from './auth.service.js';
import { registerSchema, loginSchema } from '../users/users.schema.js';

export async function registerCtrl(req: Request, res: Response) {
  try {
    const { email, name, password } = registerSchema.parse(req.body);
    const data = await register(email, name, password);
    res.status(201).json(data);
  } catch (e: any) {
    if (e.message === 'Email ya registrado') {
      return res.status(409).json({ message: e.message });
    }
    res.status(400).json({ message: e.message });
  }
}

export async function loginCtrl(req: Request, res: Response) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const data = await login(email, password);
    res.json(data);
  } catch (e: any) {
    if (e.message === 'Credenciales inválidas') {
      return res.status(401).json({ message: e.message });
    }
    res.status(400).json({ message: e.message });
  }
}
```

**`src/modules/auth/auth.service.ts`**
```ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { createUser, findUserByEmail } from '../users/users.service.js';

export async function register(email: string, name: string, password: string) {
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new Error('Email ya registrado');
  }
  const hash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
  const user = await createUser(email, name, hash);
  const token = jwt.sign({ sub: user.id, email: user.email }, env.JWT_SECRET, { expiresIn: '7d' });
  return { user, token };
}

export async function login(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error('Credenciales inválidas');
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new Error('Credenciales inválidas');
  }
  const token = jwt.sign({ sub: user.id, email: user.email }, env.JWT_SECRET, { expiresIn: '7d' });
  return {
    user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
    token
  };
}
```

**`prisma/schema.prisma` (con Media)**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           Int      @id @default(autoincrement())
  email        String   @unique
  name         String
  passwordHash String
  createdAt    DateTime @default(now())
  media        Media[]
}

model Media {
  id           Int      @id @default(autoincrement())
  userId       Int
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  publicId     String   @unique
  secureUrl    String
  format       String
  resourceType String
  bytes        Int
  width        Int?
  height       Int?
  originalName String?
  folder       String?
  createdAt    DateTime @default(now())

  @@index([userId])
  @@index([createdAt])
}
```
El modelo `Media` está reconstruido a partir del diff que salió al hacer `db pull` **[dudoso en los detalles]**. Las migraciones son `20251104112830_init` y `20251120090028_add_media_table`.

**Migración `init` (`migration.sql`)**
```sql
-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
```

**`src/config/swagger.ts`**
```ts
import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env.js';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Express + PostgreSQL',
      version: '1.0.0',
      description: 'API REST con autenticación JWT, validación Zod, rate limiting y testing completo',
      contact: { name: 'API Support' },
    },
    servers: [{ url: `http://localhost:${env.PORT}`, description: 'Servidor de desarrollo' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        User: { type: 'object', properties: {} },
      },
    },
    tags: [
      { name: 'Auth', description: 'Endpoints de autenticación' },
      { name: 'Users', description: 'Gestión de usuarios' },
    ],
  },
  apis: ['./src/modules/*/*.routes.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
```
El contenido de `schemas` (líneas 26 a 135 del fichero) no se ve: aquí `properties` va vacío **[dudoso]**.

**`jest.config.js`**
```js
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
  },
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/tests/**', '!src/index.ts'],
  coverageDirectory: 'coverage',
  verbose: true,
};
```

**Tests (patrón)**
```ts
import request from 'supertest';
import app from '../app';

describe('Users Endpoints', () => {
  let authToken: string;
  let userId: number;

  const testUser = {
    email: `testuser${Date.now()}@example.com`,
    name: 'Test User',
    password: 'password123',
  };

  beforeAll(async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    authToken = res.body.token;
    userId = res.body.user.id;
  });

  describe('GET /api/users', () => {
    it('debe listar usuarios con autenticación', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('debe fallar sin autenticación', async () => {
      const res = await request(app).get('/api/users');
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('No autorizado');
    });

    it('debe fallar con token inválido', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer invalid_token');
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Token inválido');
    });
  });

  describe('GET /api/users/me', () => {
    it('debe obtener perfil del usuario autenticado', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.email).toBe(testUser.email);
      expect(res.body).not.toHaveProperty('passwordHash');
    });
  });

  describe('PATCH /api/users/me/password', () => {
    it('debe cambiar contraseña correctamente', async () => {
      const res = await request(app)
        .patch('/api/users/me/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ currentPassword: 'password123', newPassword: 'newpassword456' });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Contraseña actualizada correctamente');

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'newpassword456' });
      expect(loginRes.status).toBe(200);
    });
  });

  describe('GET /api/users/:id', () => {
    it('debe fallar con ID inexistente', async () => {
      const res = await request(app)
        .get('/api/users/99999')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(404);
    });
  });
});
```
El import `'../app'` va sin `.js`, al contrario que el resto del proyecto. Funciona por el `moduleNameMapper`, pero puede estar mal leído **[dudoso]**.
Más casos que salen:
- `auth.test.ts`: el registro devuelve 201 con `user` y `token`, y `res.body.user` no tiene `passwordHash`.
- `PATCH /me` con un email inválido devuelve 400.
- Con la contraseña actual incorrecta se espera 400 y "Contraseña actual incorrecta" (el cuerpo del test no se ve).

**`Dockerfile`**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache dumb-init
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma
ENV NODE_ENV=production
USER node
EXPOSE 3000
CMD ["dumb-init", "node", "dist/index.js"]
```

**`docker-compose.yml` (desarrollo)**
```yaml
version: '3.9'

services:
  postgres:
    image: postgres:16
    container_name: node-server-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

**`docker-compose.prod.yml`**
```yaml
version: '3.9'
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: ${POSTGRES_DB:-app_db}
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks: [app-network]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
  api:
    build: .
    ports: ["3000:3000"]
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD:-postgres}@db:5432/${POSTGRES_DB:-app_db}
      JWT_SECRET: ${JWT_SECRET}
      BCRYPT_SALT_ROUNDS: ${BCRYPT_SALT_ROUNDS:-10}
    depends_on:
      db:
        condition: service_healthy
    networks: [app-network]
    restart: unless-stopped
volumes:
  pgdata:
networks:
  app-network:
    driver: bridge
```

**`.gitignore` (referencia)**
```
node_modules/
dist/
.env
.env.test
.env.production
*.log
logs/
coverage/
.vscode/
.idea/
*.tsbuildinfo
/src/generated/prisma
```

**JSON Server (28/10)**
```json
"scripts": { "api": "json-server --watch db.json --port 3000" }
```

### 2.4 Librerías, comandos y versiones

**Dependencias del proyecto de referencia `node-server-26-27`**

| Paquete | Versión | Tipo | Para qué | Clase |
|---|---|---|---|---|
| express | ^5.1.0 (el tooltip dice que la última es la 5.3.0) | dep | Servidor HTTP | 20/10, 27/10 |
| cors | ^2.8.5 | dep | CORS | 20/10 |
| helmet | ^8.1.0 | dep | Cabeceras de seguridad | 20/10 |
| morgan | ^1.10.1 | dep | Log de peticiones (hasta la v0.7; sigue en el package después) | 20/10 |
| dotenv | ^17.2.3 | dep | Cargar `.env` | 20/10, 27/10 |
| zod | ^4.1.12 (instalada: 4.1.12) | dep | Validación | 27/10 |
| bcrypt | ^6.0.0 | dep | Hash de contraseñas | 27/10 |
| jsonwebtoken | ^9.0.2 | dep | JWT | 27/10 |
| @prisma/client | ^6.18.0 (el cliente generado es la v6.19.0) | dep | ORM | 20/10, 03/11 |
| express-rate-limit | ^8.2.1 | dep | Rate limiting (v0.8.0) | 03/11 |
| winston | ^3.18.3 | dep | Logger (v0.8.0) | 03/11 |
| cloudinary | ^2.8.0 | dep | Subida de media (v1.1.0, rama `main`) | 03/11 |
| swagger-ui-express, swagger-jsdoc | sin versión visible | dep | Swagger (v1.0.0) | 03/11 |
| @types/swagger-ui-express | ^4.1.8 | dep (así sale en el package) | Tipos | 03/11 |
| typescript | ^5.9.3 | dev | Compilador | 20/10, 27/10 |
| nodemon | ^3.1.10 | dev | Recarga automática | 20/10, 27/10 |
| ts-node | ^10.9.2 (sustituido por tsx en la v1.0.2) | dev | Ejecutar TS | 27/10, 03/11 |
| tsx | sin versión visible | dev | Ejecutar TS con ESM | 03/11 |
| jest | ^30.2.0 | dev | Tests | 03/11 |
| ts-jest | ^29.4.5 | dev | Jest con TS | 03/11 |
| supertest | ^7.1.4 | dev | Peticiones HTTP en los tests | 03/11 |
| @types/swagger-jsdoc | sin versión visible | dev | Tipos | 03/11 |
| @types/bcrypt ^6.0.0, @types/cors ^2.8.19, @types/express ^5.0.5, @types/jsonwebtoken ^9.0.10, @types/morgan ^1.9.10, @types/node ^24.10.0, @types/jest ^30.0.0, @types/supertest ^6.0.3 | | dev | Tipos | 27/10, 03/11 |

**Proyecto en directo `node-server` (20/10)**

| Paquete | Versión |
|---|---|
| express | ^5.3.0 |
| morgan | ^1.12.1 |
| dotenv | ^18.0.8 **[dudoso]** |
| typescript | ^7.0.2 (dev) |
| tsx | ^4.23.15 (dev) |
| ts-node | ^10.9.2 (dev) |
| nodemon | ^3.1.14 (dev) |
| @types/node | ^26.6.5 (dev) |
| @types/express | ^5.0.6 (dev) |
| @types/morgan | ^1.9.10 (dev) |
| tsc | ^2.0.4 (paquete equivocado y deprecado: hay que quitarlo) |

**Otras herramientas**

| Herramienta | Detalle | Clase |
|---|---|---|
| Node.js | v22.20.0 con nvm (portátil del profesor) | 20/10 |
| Imágenes de Docker | `postgres:16`, `node:20-alpine` y `dumb-init` instalado con `apk` | 20/10, 03/11 |
| Compose | `version: '3.9'` | 20/10, 03/11 |
| Supabase | Postgres por el Session pooler (puerto 5432) | 03/11 |
| json-server | `0.17.4` (dev); depende de `connect-pause@0.1.1`, que está obsoleto | 28/10 |
| Postman e Insomnia | Clientes para probar APIs | 28/10 |
| Fake Store API | `https://fakestoreapi.com`, documentación en `/docs` | 28/10 |
| Cursor | Editor, con la extensión Git Graph, zsh y Prettier | todas |
| Vercel | Rama `vercel-deployment` (solo se menciona) | 27/10, 03/11 |

**Comandos**

| Comando | Para qué |
|---|---|
| `npm init` | Crear `package.json` |
| `npm install <paq>` / `npm install --save-dev <paq>` (`-D`) | Instalar una dependencia normal / de desarrollo |
| `npm install`, `npm uninstall <paq>`, `npm ci`, `npm ci --only=production` | Instalar todo, quitar un paquete, instalar según el lockfile, instalar solo producción |
| `npm audit`, `npm audit fix --force`, `npm fund` | Avisos de vulnerabilidades; el `--force` no se ejecuta a ciegas |
| `rm -rf node_modules package-lock.json`, `mkdir dist` | Reinstalar en limpio y crear la carpeta de salida |
| `npx tsc`, `npx tsc --init` | Compilar y generar `tsconfig.json` |
| `npx nodemon`, `npm run dev`, `rs` | Arrancar en desarrollo y reiniciar a mano |
| `npm run build`, `npm start`, `npm test`, `npm run test:watch`, `npm run test:coverage` | Scripts de la referencia |
| `npx prisma generate` | Generar el cliente |
| `npx prisma migrate dev [--name x]`, `migrate status`, `migrate reset`, `migrate deploy` | Migraciones |
| `npx prisma db pull`, `db push`, `db seed`, `db execute` | Introspección y otros (los tres últimos solo se vieron en la ayuda) |
| `npx prisma studio` | Ver la BD |
| `docker-compose down` | Parar los contenedores |
| `npm run api` / `npx json-server --watch db.json --port 3000` | Arrancar JSON Server |
| `npm install swagger-ui-express swagger-jsdoc @types/swagger-ui-express`, `npm install -D @types/swagger-jsdoc` | Instalar Swagger |
| `npm install express-rate-limit winston` | Instalar lo de la v0.8.0 |
| `git push origin --tags`, checkout de un tag | Versionado (ver 4.2) |
| `select * from "Media";`, `select * from _prisma_migrations;` | SQL en Supabase |

**Versiones (tags) del repositorio de referencia**

| Tag | Contenido |
|---|---|
| v0.1.0 | Proyecto base (npm, TypeScript, carpetas) |
| v0.2.0 | Express básico: env, error, app, index, middlewares y `/health` |
| v0.3.0 | PostgreSQL + Docker con Prisma (schema, migraciones, cliente) |
| v0.4.0 | Validación con Zod (schemas, middleware) y CRUD de usuarios |
| v0.5.0 | Módulo Auth (registro, login, bcrypt, JWT) |
| v0.6.0 | Middleware de autenticación (JWT, rutas protegidas, `/me`) |
| v0.7.0 | Actualizar el perfil y cambiar la contraseña |
| v0.8.0 | Rate limiting (express-rate-limit) y logging (Winston) |
| v0.9.0 | Jest + Supertest (8 tests de Auth) |
| v1.0.0 | Producción (Docker) y documentación (Swagger en `/api-docs`) |
| (sin tag) | Fix: permisos de la carpeta `logs` en Docker |
| v1.0.1 | Swagger/OpenAPI completo |
| v1.0.2 | `ts-node` → `tsx` (ES Modules) |
| v1.1.0 | Subida de media con Cloudinary |
| v1.1.1 | Variables de Cloudinary en `env.production.example` |
| v1.1.2 | Errores de TypeScript del módulo media |
| v1.1.3 | Swagger muestra todos los endpoints (21/11/2025) |

Aparte hay una rama `vercel-deployment` (del 5/12/2025), que no se abrió.

Archivos que cambian en las versiones que se abrieron en Git Graph:
- **v0.5.0**: `src/modules/auth/auth.controller.ts`, `auth.routes.ts`, `auth.service.ts`, `app.ts` (+2), `CHANGELOG.md` (+42) y `docs/API_EXAMPLES.md` (+70).
- **v0.8.0** (`486c9ecb`): `rateLimiter.ts`, `requestLogger.ts` y `utils/logger.ts` (nuevos), `middleware/error.ts`, `app.ts`, `index.ts`, `.gitignore` y `docs/API_EXAMPLES.md`.
- **v0.9.0** (`99fb2e12`): `src/tests/auth.test.ts`, `src/tests/users.test.ts`, `jest.config.js`, `app.ts`, `package.json`, `package-lock.json`, `README.md` (+619), `CHANGELOG.md` (+76) y `.gitignore`.
- **v1.0.0** (`556a6f84`): `config/swagger.ts`, `auth.routes.ts`, `app.ts`, `.dockerignore`, `docker-compose.prod.yml`, `Dockerfile`, `env.production.example`, `package.json`, `CHANGELOG.md` (+73) y `README.md` (+524).
- **v1.0.1**: `swagger.ts` (+6 -1), `auth.routes.ts` (+64) y `users.routes.ts` (+245).

---

## 3. C# (Desarrollo de Interfaces)

Clases del 05/11, 09/11, 18/11 y 19/11/2026. Profesor: Francisco Nieto Zamora (la clase se da por Google Meet). Se trabaja en Visual Studio con el proyecto de consola **Clase1** (.NET 8, `Program.cs` con instrucciones de nivel superior). Los apuntes son dos PDF: la **UD2 "Introducción a C#"** (43 páginas) y **"Creación de interfaces en C#"** (`_v6`, 85 páginas).

### 3.1 Temario por fechas

**05/11: repaso de la UD2 "Introducción a C#"**
- Formato de salida en `Console.WriteLine`: especificadores numéricos, de fecha y de enumeraciones, y la forma `{índice,alineación:especificador}` (PDF págs. 19-20).
- Lectura por consola con `Console.ReadLine()` y `Convert.ToInt32`, concatenación con `+` e interpolación con `$`.
- Arrays: inicializador clásico y expresión de colección `[1, 2, 3]`, `Length`, `foreach`, `for`, `Array.Sort` y LINQ (`Max`, `Min`, `Sum`) (págs. 20-21).
- Estructuras de control: comparaciones, `if`/`else if`/`else`, ternario, `switch`, `while`, `do/while`, `break` y `continue` (págs. 22-27).
- Métodos `static void MiMetodo()` según el PDF (pág. 28), y en clase como función local.
- Constantes con `const` (págs. 11-12).
- Ejercicio 1 de "Básicos secuenciales" resuelto en directo, repaso de los enunciados de las hojas 1 y 2 y fechas de Moodle.
- Búsqueda en Google sobre cómo elegir la moneda: `ToString("C")` y `CultureInfo`.
- Errores de Visual Studio: MSB3026/3027/3021 (`.exe` bloqueado), CS8600 y ENC0118.

**09/11: delegados y delegados multicast**
- PDF "Creación de interfaces", tema 1 *Delegados*: 1.4 *Asignación de métodos a delegados* y 1.5 *Delegados Multicasting* (pág. 5).
- `delegate int Operacion(int a, int b);` y la clase `Calculadora` con `Sumar` y `Restar`.
- Asignación con `new Operacion(...)` y con la forma corta, invocación `op(4, 5)`, reasignación con `=` y multicast con `+=`.
- Recorrido con `foreach` sobre `GetInvocationList()` para obtener el resultado de cada método.
- Métodos estáticos frente a métodos de instancia en un delegado (`calc.Restar`), y campos privados con estado (`val1`, `val2`).
- Error CS8803: con instrucciones de nivel superior, el código que se ejecuta va antes que los tipos.

**18/11: validación encadenada, lambdas y delegados genéricos**
- `Validador.cs` con `delegate bool ValidarNumero(int x)` y los métodos `EsPositivo`, `EsPar`, `EsNegativo`, `MayorACero`, `EsImpar` e `ImprimeNumero`.
- `Ejecutar` mejorado: recorre `GetInvocationList()` con un acumulador `&&`. Antes daba un resultado engañoso, porque solo contaba lo que devolvía el último método.
- Método anónimo (`delegate (int n) { ... }`), lambda de bloque y lambda de expresión.
- Miembro con cuerpo de expresión: `EsImpar(int x) => !EsPar(x)`.
- `Func<>`, `Action<>` y `Predicate<>` y sus límites.
- Un campo de tipo delegado no es un tipo (CS0246). Un delegado declarado dentro de una clase se usa como `Validador.ValidarNumero`.

**19/11: eventos**
- Clase `Reloj` con el delegado `CadaSegundoHandler`, el evento `OnSegundo` y `Iniciar()` con `while (true)` y `Thread.Sleep(1000)`. El evento se lanza con `OnSegundo.Invoke()`.
- Suscripción con `+=` de tres formas (método con nombre, método anónimo y lambda) y baja con `-=` desde dentro de un manejador.
- Varios manejadores en un mismo evento, captura de variables (closure), CS8421 y CS0136.
- Teoría del PDF (págs. 12-16): patrón `object sender, EventArgs e` con `this`, flujo Main → Reloj → manejador, diagrama emisor/receptor y comienzo del ejemplo `Archivo` (`EventosyDelegados_v2`).
- Moodle: enunciados de los ejercicios 6 y 7 (eventos y delegados I y II). Entrega del Ejercicio 4 (métodos anónimos) cambiada al lunes 23/11/2026 a las 23:59.

### 3.2 Conceptos por tema

**Entrada y salida por consola**
- `Console.Write` no salta de línea (se usa para pedir datos). `Console.WriteLine` sí.
- `Console.ReadLine()` devuelve `string?` en .NET 8: por eso sale el aviso CS8600 al guardarlo en un `string`.
- `Convert.ToInt32(...)` pasa el texto a número. En la hoja 2 sale también `Convert.ToString` para los códigos ASCII.

**Cadenas y formato**
- Concatenación con `+`. Si hay que sumar dentro, la suma va entre paréntesis: `"..." + (a + b)`.
- Interpolación: `$"... {x} ..."`. La nota del Ejercicio 7 pide usar `$` en el argumento de `WriteLine`.
- Formato compuesto `{índice,alineación:especificador}`: `{0:P}`, `{0,5:C}` o `{0:F} {1:P}`.
- Especificadores numéricos: C, D, E, F, G (el que se usa si no pones nada), N, P (multiplica por 100), R y X.
- Especificadores de fecha: d, D, t, T, f, F, g, G (por defecto), M, R, s, u, U e Y.
- Especificadores de enumeraciones: G, F (flags), D y X.
- El resultado depende de la cultura del equipo: en España sale coma decimal y €, que la consola pinta como `?`. Para elegir otra moneda se usa `CultureInfo` (sacado de Google, no del PDF).

**Tipos, variables y constantes**
- Se usan `int`, `double`, `string` y `decimal` (con sufijo `m`). En la tabla del PDF aparecen también `long`, `float`, `bool` y `char`.
- `const int x = 15;`: reasignarla da error de compilación.
- `int` es un alias de `System.Int32`.

**Arrays y colecciones**
- Inicializador `{ "Ford", "Seat", "Audi" }` y expresión de colección de C# 12 `[1, 2, 3, 4, 5]`.
- Índice desde 0 y `Length` para el tamaño.
- `foreach` si solo hace falta cada elemento y `for` si hace falta el índice.
- `Array.Sort` para ordenar y, con `System.Linq`, `Max()`, `Min()` y `Sum()`.
- `System.Collections.Stack` (solo en el enunciado del ejercicio 11 de la hoja 2) y `Random` (ejercicio 8 de la hoja 2).

**Estructuras de control**
- Operadores `<`, `<=`, `>`, `>=`, `==` y `!=`.
- `if`/`else if`/`else` y el ternario `(cond) ? a : b`.
- `switch`: la expresión se evalúa una vez, cada `case` acaba en `break` y `default` es opcional.
- `while` comprueba antes de entrar y `do/while` se ejecuta al menos una vez. El 18/11 se usa un `do-while` que repite hasta que el número cumple todas las validaciones.
- `break` sale del bucle y `continue` pasa a la siguiente vuelta.

**Métodos, funciones locales e instrucciones de nivel superior**
- PDF: `static void MiMetodo()` dentro de `class Program`.
- En clase, con la plantilla sin `Main`, el método se escribe como función local `void Ejercicio1() { ... }` y se llama con `Ejercicio1();`. Si no se llama, sale el aviso CS8321.
- Orden en `Program.cs`: primero el código que se ejecuta y después los tipos (delegados y clases). Si no, CS8803.
- Una función local `static` no puede capturar variables locales: CS8421.
- No puede haber dos variables con el mismo nombre en ámbitos anidados: CS0136.
- Miembro con cuerpo de expresión: `public static bool EsImpar(int x) => !EsPar(x);`.

**Clases y objetos**
- Archivo > Nuevo > Archivo > "Clase de C#" genera `using System;` y `public class Class1` con un constructor vacío.
- Un método `static` se llama desde la clase (`Calculadora.Sumar`). Uno de instancia necesita un objeto: `Calculadora calc = new Calculadora(); calc.Restar`.
- Campos privados con estado (`private int val1 = 6;`).
- Un delegado declarado dentro de una clase se usa desde fuera como `Clase.Delegado`.

**Delegados**
- Un delegado es un tipo que representa la firma de un método. Cualquier método con esa firma se puede guardar en una variable de ese tipo. El PDF lo define como "un contrato entre el emisor y el receptor".
- Asignación: `new Operacion(Calculadora.Sumar)` o la forma corta `Operacion op = Calculadora.Sumar;`, que es la que se queda.
- Se invoca como un método (`op(4, 5)`) y se reasigna con `=`.
- Multicast: `+=` añade un método y `-=` lo quita. Al invocar se ejecutan todos en el orden en que se añadieron.
- Al invocar directamente un multicast, solo se recibe lo que devuelve el último método. Por eso el 18/11 el -6 "cumplía".
- `GetInvocationList()` devuelve la lista de métodos para recorrerla con `foreach`.
- Acumulador `resultado = resultado && paso(x)`, que empieza en `true`. Por el cortocircuito, en cuanto un paso da False ya no se llama a los siguientes.
- Un mismo delegado puede mezclar métodos estáticos y de instancia.

**Métodos anónimos y lambdas**
- Método anónimo: `delegate (int n) { ...; return r; };`, con `;` después de la llave. Sin parámetros: `delegate () { ... }`.
- Lambda de bloque: `(int n) => { ...; return r; }`. Lambda de expresión: `(int n) => n > 20`. Sin parámetros: `() => { ... }`.
- En el tooltip, Visual Studio llama "lambda expression" al método anónimo con `delegate` **[dudoso]**.
- Captura de variables: una lambda puede leer y modificar locales de nivel superior, como `segundo`.

**Delegados genéricos predefinidos**
- `Func<T1, …, TResult>`: el último tipo es el de retorno y no admite `void` (`Func<int, void>` da error).
- `Action<T1, …>`: no devuelve nada; equivale a un `delegate void`.
- `Predicate<T>`: un solo parámetro y devuelve `bool`, como `Func<T, bool>`. `Predicate<int, string>` da error.
- `Func` y `Action` admiten hasta 16 parámetros.
- Equivalencias vistas:
  - `delegate bool ValidarNumero(int x)` ≈ `Func<int, bool>` ≈ `Predicate<int>`
  - `delegate void DelegadoSinResultado(int x)` ≈ `Action<int>`
  - `delegate bool MiDelegado(int x, string str)` ≈ `Func<int, string, bool>`
- Un campo de tipo delegado (`public Predicate<int> ValidarNumero;`) no es un tipo: usarlo para tipar da CS0246.

**Eventos**
- Declaración: `public event TipoDelegado Nombre;`. En clase el evento se llama `OnSegundo`.
- Emisor y receptor: la clase que lanza el evento no sabe quién la escucha.
- Disparo: dentro de la clase emisora, con `Evento.Invoke()`. Tiene que pasar algo que lo provoque; aquí, el bucle de `Iniciar()`.
- Suscripción `+=` con un método con nombre (sin paréntesis), un método anónimo o una lambda. Baja con `-=`, incluso desde dentro de otro manejador.
- Varios manejadores se ejecutan en el orden en que se suscribieron.
- CS8618: el evento puede ser null. En clase se queda sin resolver (`?.Invoke()` o `event ...?` no se vieron en código de clase).
- Patrón del PDF: `EventHandler`, firma `(object sender, EventArgs e)`, `this` como sender y un método `OnSegundoCambiado()` que lanza `SegundoCambiado`.
- Para los ejercicios: clase propia que herede de `EventArgs` (`XEventArgs`), `EventHandler` como delegado y lanzar con `Invoke`.

**Visual Studio**
- IntelliSense, snippets (`foreach`), CodeLens ("N referencias"), resaltado de referencias y bombilla de acciones rápidas (Ctrl+. o Alt+Entrar).
- Ventana Salida, Lista de errores, Ctrl+F5 para ejecutar sin depurar, TAB para generar el manejador de un evento (`Reloj_OnSegundo`) y `//` o `/* */` para apartar código.
- Opción para cerrar la consola sola al acabar la depuración: Herramientas → Opciones → Depuración.
- GitHub Copilot e IntelliCode aparecen en la barra.

### 3.3 Patrones de código del profesor

**Lectura, formato y suma (05/11, `Program.cs` de Clase1)**
```csharp
// See https://aka.ms/new-console-template for more information
Console.WriteLine("Hello, World DAM2!");
int num1 = 10;
int num2 = 20;
int suma = num1 + num2;

double numeroPi = 3.1416;
Console.WriteLine("El numero Pi es {0:P}", numeroPi);
Console.WriteLine("La suma de " + num1 + " y " + num2 + " es: " + suma);

int num3;
int num4;
Console.Write("Introduce el primer número: ");
string num3String = Console.ReadLine();
num3 = Convert.ToInt32(num3String);
Console.Write("Introduce el segundo número:");
num4 = Convert.ToInt32(Console.ReadLine());

string resultado2 = $"Esto es un string que contiene {num3String} este texto va detrás";
Console.WriteLine("La suma de " + num3 + " y " + num4 + " es: " + (num3 + num4));
```
La línea del formato pasó por `{0:P}` (sale 314,16 %), `{0,5:C}` (sale `3,14 ?`) y `{0:F} {1:P}` con `numeroPi, num2` (sale `3,14 2.000,00 %`; el primer valor no se lee bien **[dudoso]**).

**Arrays y bucles (05/11)**
```csharp
int[] misNumeros = [1, 2, 3, 4, 5];

foreach (int numero in misNumeros)
{
    Console.WriteLine(numero);
}

for (int i = 0; i < misNumeros.Length; i++)
{
    Console.WriteLine(misNumeros[i]);
}
```

**Ejercicio 1 resuelto como función local (05/11)**
```csharp
void Ejercicio1 ()
{
    Console.Write("Introduce número 1: ");
    int num1 = Convert.ToInt32(Console.ReadLine());
    Console.Write("Introduce número 2: ");
    int num2 = Convert.ToInt32(Console.ReadLine());
    Console.WriteLine("La suma de " + num1 + " y " + num2 + " es: " + (num1 + num2));
    Console.WriteLine("La resta de " + num1 + " y " + num2 + " es: " + (num1 - num2));
    Console.WriteLine("La multiplicación es: " + (num1 * num2));
    Console.WriteLine("El módulo es: " + (num1 % num2));
}

Ejercicio1();
```
Con 2 y 4 sale 6, -2, 8 y 2. Falta la división que pide el enunciado **[dudoso]**.

**Ejemplos del PDF de la UD2 (05/11)**

Son ejemplos sueltos, no un solo programa (la variable `i` se declara en varios).
```csharp
string resultado = (hora < 12) ? "Buenos días" : "Buenas tardes";
```
```csharp
switch (dia)
{
    case 1: Console.WriteLine("Lunes"); break;
    case 4: Console.WriteLine("Jueves"); break;
}
```
```csharp
int i = 0;
while (i < 5) { Console.WriteLine(i); i++; }
```
```csharp
do { Console.WriteLine(i); i++; } while (i < 5);
```
```csharp
for (int i = 0; i < 10; i++)
{
    if (i == 4) { break; }
    Console.WriteLine(i);
}
```
```csharp
const int miNumero = 15;
```
En el `switch` del PDF van los casos de 1 a 7 (de "Lunes" a "Domingo"). `miNumero = 13;` daría error de compilación.

**Moneda según la cultura (05/11; viene de una búsqueda en Google, no del profesor ni del PDF)**
```csharp
using System.Globalization;

decimal precio = 1234.56m;
Console.WriteLine(precio.ToString("C"));
Console.WriteLine(precio.ToString("C", new CultureInfo("es-ES")));
Console.WriteLine(precio.ToString("C", new CultureInfo("en-US")));
```
En es-ES sale `1.234,56 €` y en en-US, `$1,234.56`.

**Delegado multicast con método de instancia y campos privados (09/11, versión final)**
```csharp
//Ejecución de la función principal
Operacion op = Calculadora.Sumar;
Calculadora calc = new Calculadora();
op += calc.Restar;

// Ejecucion del delegado
foreach (Operacion operacion in op.GetInvocationList())
{
    int resultado = operacion(10, 5);
    Console.WriteLine($"Resultado: {resultado}");
}

// Definiciones
// Funciones
delegate int Operacion(int a, int b);

// Clases
class Calculadora
{
    private int val1 = 6;
    private int val2 = 3;

    public static int Sumar(int a, int b)
    {
        int suma = a + b;
        Console.WriteLine($"Suma: {a} + {b} = {suma}");
        return suma;
    }

    public int Restar(int a, int b)
    {
        int resta = val1 - val2;
        Console.WriteLine($"Resta: {val1} - {val2} = {resta}");
        return resta;
    }
}
```
Salida: `Suma: 10 + 5 = 15`, `Resultado: 15`, `Resta: 6 - 3 = 3` y `Resultado: 3`. En la versión intermedia los dos métodos eran `static`, se usaba `op += Calculadora.Restar;` y la resta salía `10 - 5 = 5`. En la versión final `Restar` recibe `a` y `b` pero no los usa.

**Validador con delegado encadenado (18/11)**

`Validador.cs` (`EsNegativo` y `MayorACero` siguen el mismo patrón que `EsPositivo`):
```csharp
using System;

public class Validador
{
    public delegate bool ValidarNumero(int x);

    public static void ImprimeNumero(int x)
    {
        Console.WriteLine($"El número ingresado es: {x}");
    }

    public static bool EsPositivo(int x)
    {
        bool resultado = x > 0;
        Console.WriteLine($"El resultado de la funcion EsPositivo para {x} es: {resultado}");
        return resultado;
    }

    public static bool EsImpar(int x) => !EsPar(x);

    public static bool EsPar(int x)
    {
        bool resultado = x % 2 == 0;
        Console.WriteLine($"El resultado de la funcion EsPar para {x} es: {resultado}");
        return resultado;
    }

    public static bool Ejecutar(ValidarNumero validate, int x)
    {
        bool resultado = true;
        foreach (ValidarNumero paso in validate.GetInvocationList())
        {
            resultado = resultado && paso(x);
        }
        if (resultado)
        {
            Console.WriteLine($"El numero {x} cumple con las validaciones");
        }
        else
        {
            Console.WriteLine($"El numero {x} NO cumple con las validaciones");
        }
        return resultado;
    }
}
```
`Program.cs`:
```csharp
bool esValido = true;
do
{
    Console.Write("\nIngrese un número entero: ");
    int x = Convert.ToInt32(Console.ReadLine());

    Validador.ValidarNumero validar = Validador.EsPositivo;
    validar += Validador.EsPar;
    validar += delegate (int numero)
    {
        bool resultado = numero % 3 == 0;
        Console.WriteLine($"El resultado de la función anónima para {numero} es divisible por 3: {resultado}");
        return resultado;
    };
    validar += (int numero) =>
    {
        bool resultado = numero > 10;
        Console.WriteLine($"El resultado de la función lambda para {numero} es mayor que 10: {resultado}");
        return resultado;
    };
    validar += (int numero) => numero > 20;

    esValido = Validador.Ejecutar(validar, x);
} while (!esValido);
```
Variante con `Predicate` (compila): `Ejecutar(Predicate<int> validate, int x)` con `foreach (Predicate<int> paso in validate.GetInvocationList())`, y en `Program.cs` `Predicate<int> validar = Validador.EsPositivo;`.

Declaraciones alternativas que se probaron y acabaron comentadas en `Validador.cs`:
```csharp
Func<int, bool> ValidarNumero2;
public delegate void DelegadoSinResultado(int x);
Action<int, string, string, int> DelegadoSinResultado2;
Predicate<int> ValidarNumero3;
public delegate bool MiDelegado(int x, string str);
Func<int, string, bool> MiDelegado2;
```
Ojo: `Action<int, string, string, int>` no equivale a `DelegadoSinResultado(int x)` (el equivalente es `Action<int>`). Los cuatro tipos serían para enseñar que `Action` admite varios parámetros **[dudoso]**.

Errores enseñados a propósito:
- `Func<int, void>`: `Func` no admite `void`.
- `Predicate<int, string>`: `Predicate` solo admite un tipo.
- `public Predicate<int> ValidarNumero;` seguido de `ValidarNumero pred = ...;` da CS0246.

**Evento del reloj (19/11, versión final)**

`Reloj.cs`:
```csharp
using System;

public class Reloj
{
    public delegate void CadaSegundoHandler();
    public event CadaSegundoHandler OnSegundo;

    public void Iniciar()
    {
        while (true)
        {
            Thread.Sleep(1000);
            OnSegundo.Invoke();
        }
    }
}
```
`Program.cs`:
```csharp
int segundo = 0;
Reloj reloj = new Reloj();
reloj.OnSegundo += ImprimeHaPasadoUnSegundo;
reloj.OnSegundo += () =>
{
    segundo = segundo + 1;
    Console.WriteLine($"Han pasado {segundo} segundos");
    if (segundo == 20)
    {
        reloj.OnSegundo -= ImprimeHaPasadoUnSegundo;
    }
};

reloj.Iniciar();

void ImprimeHaPasadoUnSegundo()
{
    Console.WriteLine("Ha pasado un segundo");
}
```
Variante probada con método anónimo:
```csharp
reloj.OnSegundo += delegate ()
{
    Console.WriteLine("Ha pasado un segundo (función anónima)");
};
```
Si `ImprimeHaPasadoUnSegundo` es `static` y usa `segundo`, sale CS8421.

**Patrón estándar de eventos del PDF (19/11)**

Reconstruido **[dudoso]**: no se ven la declaración de `SegundoCambiado`, los modificadores ni el cuerpo de `OnSegundoCambiado()`, ni la línea de suscripción (está tapada).
```csharp
public event EventHandler SegundoCambiado;
protected virtual void OnSegundoCambiado()
{
    SegundoCambiado?.Invoke(this, EventArgs.Empty);
}
public void Iniciar()
{
    while (true)
    {
        Thread.Sleep(1000);
        OnSegundoCambiado();
    }
}
```
```csharp
reloj.SegundoCambiado += Reloj_SegundoCambiado;
static void Reloj_SegundoCambiado(object sender, EventArgs e)
{
    Console.WriteLine("¡Ha pasado un segundo!");
}
```

### 3.4 Librerías, herramientas y versiones

| Elemento | Detalle | Clases |
|---|---|---|
| .NET | .NET 8 (`net8.0`), runtime `Microsoft.NETCore.App 8.0.20`, salida en `bin\Debug\net8.0\Clase1.exe` | todas |
| Plantilla | Consola `aka.ms/new-console-template`, con instrucciones de nivel superior y tipos que admiten null activados | todas |
| Proyecto | `Clase1.csproj` / `Clase1.sln`. Archivos `Program.cs`, `Class1.cs` (05/11), `Validador.cs` (18/11) y `Reloj.cs` (19/11) | todas |
| C# 12 | Expresiones de colección `[1, 2, 3]` | 05/11 |
| IDE | Visual Studio Community 2022 (17.14, con aviso de versión no soportada que invita a instalar VS 2026), en español, Debug / Any CPU, IntelliSense, IntelliCode, Copilot | todas |
| `System` | `Console`, `Convert`, `Array`, `Random`, `String`, `Int32`, `Boolean`, `DateTime`, `TimeSpan`, `EventArgs`, `EventHandler`, `Func<>`, `Action<>`, `Predicate<>` y `Delegate.GetInvocationList()` | 05/11 a 19/11 |
| `System.Linq` | `Max()`, `Min()` y `Sum()` sobre arrays | 05/11 |
| `System.Globalization` | `CultureInfo` | 05/11 |
| `System.Collections` | `Stack` (enunciado del ejercicio 11 de la hoja 2) | 05/11 |
| `System.Threading` | `Thread.Sleep` (sin `using`, por los usings implícitos) | 19/11 |
| `System.Threading.Tasks` | En el ejemplo `Archivo` del PDF | 19/11 |
| Paquetes NuGet | No se instala ninguno | todas |
| Atajos | Ctrl+F5 ejecuta sin depurar; Ctrl+. o Alt+Entrar abre las correcciones; TAB genera el manejador | todas |
| Git | Repositorio `Clase1` en GitHub, rama `dev`, 4 commits por delante de `master`, con `.gitignore` y `.gitattributes` | 05/11 |
| Referencia | Microsoft Learn, "Cadenas con formato numérico estándar - .NET" | 05/11 |

Errores y avisos que salieron en clase:

| Código | Qué significa | Clase |
|---|---|---|
| CS8600 | `string?` guardado en `string` | 05/11 |
| CS1547, CS1001, CS1002 | Sintaxis a medio escribir; CS1002 es que falta un `;` | 05/11, 19/11 |
| CS8321 | Función local declarada que no se llama | 05/11 |
| CS8803 | Instrucciones de nivel superior escritas después de los tipos | 09/11 |
| CS0103 | El nombre no existe | 18/11, 19/11 |
| CS0246 | Tipo no encontrado: se usó un campo como tipo | 18/11 |
| CS8618 | Campo o evento no anulable sin inicializar | 18/11, 19/11 |
| CS0029 | No se puede convertir `void` en el delegado | 19/11 |
| CS0136 | Nombre repetido en un ámbito que lo envuelve | 19/11 |
| CS8421 | Una función local `static` no puede capturar variables | 19/11 |
| CS0219 | Variable asignada que no se usa | 19/11 |
| IDE0044 | Sugerencia de hacer el campo de solo lectura | 18/11 |
| MSB3026, MSB3027, MSB3021 | El `.exe` sigue abierto y está bloqueado | 05/11, 19/11 |
| ENC0118 | Editar y continuar: el cambio no se aplica hasta reiniciar | 05/11, 19/11 |

---

## 4. Gestión de proyectos, Git y despliegue

Esta sección junta lo que no es de una sola asignatura:
- **Gestión de proyectos** (09/10, Juan Antonio): es de *Proyecto Intermodular 26/27* (así se llama el Classroom).
- **Git, tags y Git Graph** (20/10, 27/10 y 03/11): se dio dentro de las clases de backend.
- **Despliegue en Vercel** (18/11): es la Act 11 de Angular ("Migración ReactiveForms, Git y Vercel").

### 4.1 Temario por fechas

**09/10 (Juan Antonio): gestión de proyectos, SMART y desarrollo ágil**
- No se programó. Teoría con el documento de Google Docs "Introducción a la Gestión de Proyectos" (sección "Gestión de proyectos" del Classroom). La sección "Lean Startup" está en Classroom pero no se explicó.
- Demostración de un proyecto real ("El Torcal ERP"):
  - Jira: tablero Kanban, sprint "S0 - Plataforma", historia ETE-1284 y subtarea ETE-1292, y las vistas Backlog, Resumen y Cronograma.
  - Confluence: Changelog por mes, espacio "ConnexIA", página de arquitectura GCP y espacio "Torcal Formación ERP Migration".
- Teoría: por qué gestionar proyectos en DAM, metodologías ágiles, objetivos SMART y el desarrollo ágil contado como una serie de televisión (épicas, historias, tareas, Kanban y burndown).

**20/10: ramas y tags del proyecto de referencia**
- Selector de Cursor "Select a branch or tag to checkout" en `node-server-26-27`: ramas `main` y `vercel-deployment` (locales y en `origin`) y tags `v1.0.0` y `v1.1.0`.
- Idea principal: el proyecto avanza por versiones etiquetadas.

**27/10: Git Graph y recorrido por versiones**
- "Checkout Branch/Tag..." desde la barra de estado de Cursor (la versión actual era `v0.4.0`).
- Instalación y uso de la extensión Git Graph: detalle de cada commit (hash, padres, autor, fecha y archivos con `+/-`) y diffs.
- Qué es HEAD cuando se hace checkout de un tag antiguo ("This commit is not included in HEAD").
- Historial v0.1.0 → v1.1.3 (tabla en 2.4).

**03/11: historial por versiones**
- Detalle en Git Graph de v0.8.0, v0.9.0 y v1.0.0, con los archivos que cambia cada una (lista en 2.4).
- Diffs de `README.md` y `CHANGELOG.md`.
- Menú de checkout de Cursor: crear rama, checkout detached, ramas locales y remotas, y tags.
- `git push origin --tags`.

**18/11: actividad "Migración ReactiveForms, Git y Vercel"**
- Ramas: `git branch`, `git switch master`, `git switch -c refactor/reactive-form2` y push de la rama.
- Guía de la actividad: A) comprobar antes de subir, B) conectar GitHub con Vercel, C) Preview por rama, D) qué funciona en la Preview, E) PR de revisión y F) tabla de diagnóstico.
- `vercel.json` con un rewrite para la SPA, `.gitignore`, despliegue en Vercel (`proj-game-r6lu.vercel.app`), Recent Previews y error de CORS contra `localhost:3000`.

### 4.2 Conceptos por tema

**Gestión de proyectos (09/10)**
- Gestionar un proyecto es planificar, organizar, ejecutar y controlar el desarrollo de un producto o servicio.
- Idea central: no basta con escribir buen código. Hay que coordinarse, documentar, cumplir plazos y mantener la calidad.
- Lo que promete el manual: SMART, delimitar el alcance, definir entregables y usar Jira con backlog e historias con criterios de aceptación.

**Objetivos SMART (09/10)**
- **S**pecific, **M**easurable, **A**chievable, **R**elevant y **T**ime-bound. Regla de oro: un objetivo tiene que poder comprobarse.
- Ejemplos del documento (pensados para Java/Spring; cada equipo los pasa a su tecnología):

  | Objetivo | M (medida) | A (cómo y horas) | T (plazo) |
  |---|---|---|---|
  | Autenticación | ≥ 95 % de logins correctos y 0 endpoints críticos sin proteger | Spring Security, OAuth2 + JWT; 12-14 h | Antes del Sprint 2 |
  | Accesibilidad | WCAG 2.2 AA y Lighthouse ≥ 90 | 10 h | Fin del Sprint 3 |
  | Persistencia | p95 ≤ 300 ms con 10k registros | 8 h | Sprint 4 **[dudoso]** |
  | CI/CD | Pipeline en menos de 8 min y cobertura ≥ 70 % | 12 h | Fin del Sprint 2 |
  | Validación con usuarios | ≥ 5 entrevistas y task success ≥ 80 % | 6 h | Dos semanas antes de la defensa intermedia |
  | Observabilidad | 100 % de los endpoints con log, `/metrics` y alerta si p95 > 500 ms | 6 h | Fin del Sprint 3 |

- "Vago vs. SMART": "Mejorar la seguridad" → OAuth2 + JWT con métrica y sprint. "La app será rápida" → p95 medido con Gatling. "Hacer la interfaz accesible" → WCAG y Lighthouse con umbral.
- Errores comunes: confundir el objetivo con una tarea, no medir, poner fechas elásticas, ambición desalineada (mejor objetivos incrementales) y vaguedad técnica (hay que citar OWASP o WCAG).

**Desarrollo ágil, Scrum y Jira (09/10)**
- Scrum es el mapa común del equipo y Jira la herramienta donde se apunta.
- Épicas: los grandes capítulos de la serie.
- Historias de usuario: *Como [rol], quiero [acción], para [beneficio]*. "No programamos por programar."
- Tareas y subtareas: el trabajo de rodaje que hay detrás de cada historia.
- Kanban: el "río que fluye", con un límite de trabajo en curso (WIP).
- Burndown chart: el trabajo que queda y la velocidad del equipo.
- Modelo de historia bien escrita (ETE-1284): Motivo, Contexto, Goal, Inventario de consumidores, Acceptance criteria con *Scenario*, Definition of Done en casillas, Objetivo SMART, Criterios transversales (CT-1, CT-2), Entregables y Alcance. Campos: persona asignada, etiquetas, sprint, informador, story points y horas estimadas.
- Organización: etiquetas por área (`frontend`, `backend`, `security`, `deuda-tecnica`…) y prefijos en el título (`[PLATAFORMA]`, `[AUTH]`, `[GLOBAL]`).
- Vistas de Jira: Tablero, Backlog, Resumen (gráficos que enlazan a búsquedas JQL) y Cronograma.
- Confluence: Changelog por mes, ADR, registro de riesgos, plan de releases y modelo de datos. Es el modelo para documentar.

**Git: ramas, tags y versionado (20/10, 27/10, 03/11 y 18/11)**
- Tags de versión semántica `vX.Y.Z`: un tag por hito y un commit por versión. Hacer checkout de un tag enseña el código tal como estaba.
- Ramas locales y remotas (`main`, `origin/main`) y una rama aparte para desplegar (`vercel-deployment`).
- HEAD y checkout detached: al hacer checkout de un tag antiguo, los commits posteriores no están en HEAD. El commit inicial no tiene padre (`Parents: None`).
- Los tags no se suben con un `push` normal: hace falta `git push origin --tags`. No se explicó cómo crearlos (`git tag`).
- Mensajes de commit: descriptivos con lista de cambios; prefijos `feat:`, `fix:` y `docs:`; en la guía del 18/11, también `chore:` y `refactor:`.
- CHANGELOG.md por versiones (apartados como "Añadido" y "Seguridad en producción"). README como manual por versiones con índice; cada versión tiene su "Objetivo" y sus pasos. Además, `docs/API_EXAMPLES.md`.
- Una rama por refactor o feature (18/11): se crea desde la rama estable con `git switch -c`, se sube con `git push origin <rama>` o `git push -u`, y se abre una PR de revisión contra `main`, que se deja abierta.
- Leer un commit desde el IDE: Git Graph enseña los archivos cambiados, su `+/-` y el diff.

**Despliegue de una SPA Angular en Vercel (18/11)**
- Antes de subir: `npm ci` (instala desde el lockfile), `npm run build` sin errores, y `/dist` y `/node_modules` en `.gitignore`.
- Carpeta que se publica: `dist/<proyecto>/browser` (lo que genera Angular 19 sin SSR).
- Configuración en Vercel: Root Directory (la carpeta con `package.json`), Output Directory (la carpeta con el `index.html` compilado), Framework Preset Angular y Build Command `npm run build`.
- Ramas: `main` es la Production Branch y cada push de una rama crea una Preview (o se lanza a mano en Deployments → Create Deployment). El buscador de *Import* busca repositorios, no ramas.
- Rewrite `/(.*)` → `/index.html`: evita el 404 al recargar una ruta interna. No se usa con SSR.
- Deployment Protection: es la razón de que la Preview pida iniciar sesión.
- Límite de la práctica: la app desplegada no puede llamar a `localhost:3000` (JSON Server); sale el error de CORS por el *loopback address space*. Para comprobar las validaciones, al enviar un formulario inválido no debe salir ninguna petición en Network.
- Diagnóstico (paso F):

  | Síntoma | Qué revisar |
  |---|---|
  | Build Failed | Build Logs |
  | Página 404 | Root Directory y Output Directory |
  | 404 al recargar una ruta | Falta el rewrite |
  | No hay Preview | La rama y el push |
  | La Preview pide iniciar sesión | Deployment Protection |
  | Falla el POST | CORS o la API en `localhost` |

### 4.3 Patrones del profesor (comandos y configuración)

En estas partes no se escribió código de aplicación.

**Ramas y push (18/11, demo del profesor)**
```bash
git branch
git switch master
git switch -c refactor/reactive-form2
git add -A .
git commit -m "."
git push origin refactor/reactive-form2
```

**Flujo que pide la guía (18/11)**
```bash
git branch --show-current
npm ci
npm run build

git add vercel.json
git commit -m "chore: configure SPA navigation on Vercel"
npm run build

git status
git add .
git commit -m "refactor: migrate game form to reactive forms"

git push -u origin feature/reactive-forms
```

**`vercel.json`**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**`.gitignore` de Angular (lo más importante)**
```
/dist
/tmp
/out-tsc
/bazel-out
/node_modules
npm-debug.log
yarn-error.log
```

**Subir los tags (03/11)**
```bash
git push origin --tags
```

**Mensajes de commit del profesor (27/10 y 03/11)**
- `v0.8.0 - Seguridad adicional: rate limiting con express-rate-limit y logging con Winston`
- `v0.9.0 - Testing con Jest y Supertest`, con la lista "Configurado Jest con TypeScript y ES modules" y "Añadidos tests de integración para Auth (8 tests)" (la lista sale cortada **[dudoso]**).
- `feat: Add media upload with Cloudinary integration (v1.1.0)`
- `docs: actualizar CHANGELOG con v1.1.0` (el 20/10 se lee `doc:` **[dudoso]**).
- `docs: README completo como manual con todas las versiones detalladas`

**Plantilla de objetivo SMART (09/10)**
```
Qué / Para quién (S):
Medida de éxito (M): métrica + umbral
Viabilidad (A): tecnologías + horas estimadas
Relevancia (R):
Plazo (T): sprint concreto
Entregables:
Riesgos y mitigación (opcional):
```

**Historia de usuario (09/10)**: *Como [rol], quiero [acción], para [beneficio]*. Ejemplo: "Como alumno, quiero subir mis prácticas para que el profesor las corrija".

### 4.4 Herramientas, comandos y versiones

| Elemento | Detalle / versión | Clase |
|---|---|---|
| Google Classroom / Google Docs | "Introducción a la Gestión de Proyectos" y guía de la actividad de Vercel | 09/10, 18/11 |
| Jira / Confluence | Tablero, Backlog, Resumen, Cronograma, JQL / Changelog, ADR, riesgos | 09/10 |
| Lean Canvas / Lean Startup | Material en Classroom (no explicado) | 09/10 |
| Cursor (y VS Code) | Checkout Branch/Tag desde la barra de estado | 20/10, 27/10, 03/11, 18/11 |
| Git Graph | v1.30.0, de mhutchie (unos 1,2 M de descargas) | 27/10, 03/11 |
| Alternativas a Git Graph | GitLens, Git Blame, IntelliGit, GitLG | 27/10 |
| GitHub | Pull Requests, repo `proj-game` | 18/11 |
| Vercel | CLI 65.17.0 en los logs de build, Node.js 26.x, región `iad1`, plan Hobby, máquina Basic | 18/11 |
| WSL | Ubuntu 26.04 | 18/11 |
| Angular | 19 (salida `dist/<proyecto>/browser` sin SSR) | 18/11 |
| JSON Server | `localhost:3000` (API de la práctica) | 18/11 |
| Nombrados solo en los ejemplos SMART | Spring Boot, Spring Security, OAuth2, JWT, OpenAPI, Angular 18, Playwright, Lighthouse, WCAG 2.2 AA, PostgreSQL (`EXPLAIN ANALYZE`), GitHub Actions, Docker Compose, Micrometer, Actuator, Grafana, Gatling, Figma, RGPD, OWASP | 09/10 |
| `git branch`, `git branch --show-current` | Ver las ramas y la rama actual | 18/11 |
| `git switch <rama>`, `git switch -c <rama>` | Cambiar de rama y crear una rama | 18/11 |
| `git add -A .` / `git add .`, `git commit -m` | Preparar y confirmar | 18/11 |
| `git push origin <rama>`, `git push -u origin <rama>` | Subir la rama | 18/11 |
| `git push origin --tags` | Subir los tags | 03/11 |
| `npm ci`, `npm run build` | Comprobar antes de desplegar | 18/11 |
| Avisos de npm en el build | `rimraf@3.0.2`, `inflight@1.0.6`, `glob@7.2.3`, `glob@10.5.0`, `connect-pause@0.1.1`, `tar@6.2.1`, `uuid@8.3.2` | 18/11 |

---

## 5. Dudas y lagunas

### Angular
**Versiones**
- `ng-version` y `package.json` dicen 19.2, y la diapositiva se llama "Reactivos en Angular 19". Pero el 18/11 el enlace del error NG8003 apunta a `v22.angular.dev` **[dudoso]**.
- `@angular/cli` sale con `^19.2.27` y, en otra captura, con `~`.

**Formularios**
- Guardar: el 05/11 se desactiva el botón con `[disabled]="gameForm.invalid"`. El 12/11 se quita y se filtra con `if (form.invalid) return`, que es lo que pide la Act 11.
- Alta o edición: se probó con `game.id` y con `delete this.game.id`, pero se volvió a la bandera `edit`.
- `setValue` o `patchValue`: en directo `setValue`; en la diapositiva y el 19/11, `patchValue`. No se ve si `setValue` dio error por el `id`.
- Valor inicial de `price` y `stock`: `''` en el código y `0` en la diapositiva. Hay un desajuste de tipos con `Game.price: number` que no se resuelve.
- Nombres: el `FormGroup` es `formGroup` en el código y `gameFormGroup` o `gameForm` en la diapositiva y la guía. El método es `onSaveGame` en clase y `saveGame` / `guardar` en la guía.
- Erratas del código de clase: los mensajes de Stock dicen "Precio…", la etiqueta pone "Plataformma", el método se llama `getGamesPyPage` y el buscador lleva `type="string"`, que no es un tipo válido.
- El CSS `#priceId.ng-invalid` sin `ng-dirty` marca el campo nada más cargar la página.
- Falta el `maxlength="40"` del título que pide el enunciado.
- Plataforma no se escribe en el template-driven, pero sí en el reactivo.

**Servicios**
- No se ve el cuerpo de `ProductService` ni dónde se llama a `provideHttpClient()`.
- No se ven los métodos de `CommentsService` ni el `.ts` de `AppComponent` en `proj-game` (`loadGames`, la paginación y `onActualizaGames`).
- El 27/10 hay un intento con `as` y con `Observable<Post[] | HttpErrorResponse>` que no se entiende qué quería enseñar.
- Se probó `environment.apiUrl` y dio error. No se vio `environment.ts`.
- El final de la URL de `getGamesPyPage` sale cortado.

**Router**
- `RouterLinkActive` se importa el 27/10 y no se usa.
- No se ve el código de `loadChildren` (`AULA_ROUTES`), del comodín `**`, de `ActivatedRoute` ni de los query params: solo salen en el enunciado y en la solución desplegada.
- El enunciado pone `--skip-test`; la opción real es `--skip-tests`.
- No se ve qué pinta la ruta plana `'aula/avisos'`.
- En el `app.component.ts` del 19/11 no se ve el import de `Router`.
- En `angular-http`, la ruta `posts` sale primero con `loadComponent` y después con `component`.

**Otras**
- Las plantillas finales de posts, comments y dashboard las generó la IA de Cursor (estados de carga, error y vacío, y ARIA). Solo se ven fragmentos y no se lee el valor de `@source`.
- En la lámpara, `estadoLampara` y la comunicación hijo → padre (`output()`) se quedan sin hacer.
- No ha salido en estas clases: pipes y directivas propios, RxJS con `pipe`, `computed()` y `toSignal()`, interceptores, guards y resolvers, `catchError` y el manejo global de errores, `FormBuilder`, `FormArray` y validadores propios.

### Backend
**Contradicciones entre el proyecto en directo y la referencia**
- Variable del puerto: `NODE_PORT` en directo y `PORT` en la referencia.
- Respuesta de `/health`: `{ message: 'OK' }` en directo y `{ ok: true }` en la referencia.
- Comando de desarrollo: `"dev": "npx nodemon"` con `exec: npx tsx watch src/index.ts` en directo; `"dev": "nodemon src/index.ts"` con `exec: tsx src/index.ts` en la referencia.
- Versiones: en directo, TypeScript ^7.0.2, express ^5.3.0, morgan ^1.12.1, @types/node ^26.6.5 y dotenv ^18.0.8 **[dudoso]**. En la referencia, TypeScript ^5.9.3, express ^5.1.0, morgan ^1.10.1, @types/node ^24.10.0 y dotenv ^17.2.3.
- Dónde quedó `typescript` en directo: unas veces en `dependencies` y otras en `devDependencies`. Al final queda en `devDependencies`.

**Contradicciones dentro de la referencia**
- Zod: en clase (27/10) se cambió a `z.email()`, `ZodType` y `z.treeifyError`, pero en el repositorio (v0.5.0 y v1.0.0) los schemas siguen con `z.string().email()`. Parece que se cambió de tag sin hacer commit. No se sabe si `validate.ts` quedó así en el repositorio, ni por qué `registerSchema` no se cambió.
- Helmet: el CHANGELOG dice "CSP deshabilitado solo para Swagger", pero el código lo quita en toda la app.
- Validación doble en auth: en la v1.0.0 las rutas llevan `validate(schema)` y el controlador de la v0.5.0 vuelve a hacer `registerSchema.parse`. No se ve si se quitó el `parse`.
- `jest ^30` con `ts-jest ^29`, según lo que se lee.
- La versión de zod sale como `"^4.1.12"` y como `"4.1.12"`.
- `@types/swagger-ui-express` aparece en `dependencies`, mientras `@types/swagger-jsdoc` se instala con `-D`.
- `HEALTHCHECK` del contenedor: el CHANGELOG lo menciona, pero el Dockerfile no lo tiene. Solo está el de Postgres en el compose.
- El `.env` de desarrollo que se ve no tiene `JWT_SECRET`, aunque `env.ts` lo exige.
- Prefijo de los commits: el 20/10 se lee `doc:` y el 27/10 `docs:`. El 27/10 se dice que los prefijos siguen la convención; el 03/11, que se usan "desde la v1.0.1".

**Cosas obsoletas que se ven**
- `npm ci --only=production`: hoy se escribe `--omit=dev`.
- La clave `version` de Compose.
- En Zod 4: `ZodSchema`, `.flatten()` y `z.string().email()`.
- Con Prisma 7, la extensión del editor marca `url = env("DATABASE_URL")` como no soportado y ofrece "Pin to Prisma 6". El proyecto usa Prisma 6 y no se ve cómo lo resuelve el profesor.
- Se enseñó documentación de "Prisma ORM 8" (`contract`, `migration plan`, `db sign`…) solo como novedad **[dudoso]**. Esos comandos no existen en Prisma 6.19.
- En una búsqueda de Google salía `npx prisma db migrate deploy`. El comando correcto es `npx prisma migrate deploy`.

**Código que no se vio**
- El bloque 1 del 27/10 y el bloque 2 del 18/11.
- El middleware `auth` (v0.6.0), las rutas `/me` y `/me/password` y el servicio de cambiar la contraseña: solo se conocen por los tests, el README de la v0.7.0 y los mensajes "No autorizado" y "Token inválido".
- El final de `getUserCtrl` y `deleteUserCtrl` entero.
- En `swagger.ts`, las líneas 26 a 135 (los `schemas`), y las anotaciones JSDoc de las rutas.
- El módulo `media`, Cloudinary y Multer (v1.1.x): solo el modelo Prisma y las variables de entorno.
- El resto de la migración `add_media_table` (índices y FK). El final de la FK que genera `db pull` sale cortado (`map: "Media_us…"`).
- El cuerpo de dos tests: "contraseña actual incorrecta" (se espera 400) y "sin autenticación" (se supone 401).
- `export default app` en el `app.ts` de la v1.0.0, y las versiones de `swagger-ui-express`, `swagger-jsdoc` y `tsx`.
- Ningún seed, ninguna transacción y ninguna paginación con Prisma.
- El despliegue en Vercel de la API: la rama `vercel-deployment` no se abre.
- El `db.json` de juegos y la URL del filtro por género del documento de la Act 9.

**Otras dudas**
- No se ve `npm install dotenv` en el proyecto en directo.
- El `console.log` del arranque de la referencia se lee con comillas simples, que no sustituirían el valor; lo normal es que sean backticks.
- El error `does not provide an export named 'default'` (20/10) sería por un `app.ts` sin guardar.
- El hash del commit de la v1.0.0 se lee `556a6e84` y `556a6f84`.
- El 27/10 la terminal dice `git:(v0.4.0)` y la barra de estado `v0.5.0`. Había 3 archivos sin commit (`validate.ts`, `users.controller.ts` y `users.schema.ts`) y no se ve qué se hizo con ellos.
- Los mensajes de commit de v0.3.0, v0.6.0, v0.7.0, v0.8.0, v0.9.0 y v1.0.0 salen cortados o resumidos en Git Graph.
- El repositorio se llama `node-server-26-27`, pero sus commits son de noviembre de 2025.

### C#
**05/11**
- El valor de Pi sale en unas capturas como `3.1416` y en otras con más decimales que no se leen.
- El `?` de `3,14 ?` es casi seguro el € que la consola no pinta, aunque podría ser la salida del `.exe` viejo (justo entonces salen los errores MSB3027).
- No se ve que se añadiera la división al Ejercicio 1: en algún momento ponía "cociente" con `/`, y al final quedó el módulo.
- Las fechas de Moodle de los ejercicios 1 y 2 cambian entre capturas (09/11 y 11/11). Hay que mirar las definitivas en Moodle.
- Erratas del PDF: `a> = b` y `a! = B` son `>=` y `!=`. El apartado 5 se titula "Estructuras iterativas" aunque empieza por los condicionales. En los ejemplos de arrays se mezclan los nombres `coches` y `cars`.
- Las hojas "Ejercicio 3_métodos y clases" y "Ejercicio 4/5 Refuerzo" están ocultas en Moodle.

**09/11**
- No hay capturas del 06:12 al 08:15: no se ve cómo se escribió el `foreach`.
- No se lee el texto del error de `op += Calculadora.Restar;` al quitar `static`.
- El campo `private int _resultado;` no se lee bien y después desaparece.
- En el PDF, los ejemplos 1.4 y 1.5 son programas separados con `Main` y los dos usan `op`.

**18/11**
- Faltan capturas entre los minutos 04:14 y 06:43 y entre 07:55 y 11:04.
- El error de `validar += Validador.MayorACero;` no tiene explicación, y esa línea no se quedó en el código.
- No queda claro si `Ejecutar` terminó recibiendo `ValidarNumero` o `Predicate<int>`, ni el tipo final de la variable `validar`: la última captura tiene `ValidaValidarNumero` a medio escribir.
- El primer intento de `EsImpar` se supone con `%`, porque el cursor tapa el operador.
- `Program.cs` termina con `Operacion op = Calculadora.Restar;` y `//EjecutarOperacion(op, 10, 20);`, que vienen de la clase anterior. `EjecutarOperacion` no aparece definida.
- Contradicción: el 09/11 `Restar` pasó a ser de instancia (`calc.Restar`), pero aquí se usa `Calculadora.Restar` como estático. No se sabe si se volvió a cambiar.

**19/11**
- En una captura el error sale como "CS0421". El correcto es CS8421.
- `public int Id { get; set; }` parece una sugerencia del autocompletado que no se aceptó.
- Del patrón del PDF no se ven ni la declaración de `SegundoCambiado` ni el cuerpo de `OnSegundoCambiado()`.
- De la clase `Archivo` (`EventosyDelegados_v2`) solo se ve el principio.
- El aviso CS8618 del evento se queda sin resolver.
- Contradicción de nombres: en clase el evento se llama `OnSegundo`. En el PDF, `On...` es el método protegido que lo lanza (`OnSegundoCambiado`) y el evento se llama `SegundoCambiado`.

**En general**
- No hay nada de clases anteriores al 05/11, ni de la UD1, ni de las páginas 1-10 y 29-43 del PDF de la UD2.
- No hay soluciones del profesor para los ejercicios 2 a 10 de la hoja 1 ni para la hoja 2, ni código de los ejercicios 4, 6 y 7.
- No se ha visto nada de WPF (ejercicios 8 a 14 y `Ejemplo_Zoos`).
- `EventArgs` propios, `TimeSpan` y `?.Invoke()` solo aparecen en enunciados o en el PDF.

### Gestión de proyectos, Git y Vercel
**09/10**
- La barra de Meet tapa parte del texto: faltan la R de Persistencia, de CI/CD y de Validación, y el "Qué/Para quién" de Observabilidad.
- El plazo de Persistencia aparece como "mitad del Sprint 4" y como "fin del Sprint 2". Lo más probable es Sprint 4, y que el Sprint 2 sea el de CI/CD.
- Las celdas SMART de "rápida" y "accesible" no se leen enteras.
- De los Acceptance criteria de ETE-1284 solo se lee el comienzo de un *Scenario*.
- El vídeo se corta en el minuto 54, cuando se hablaba de tareas y subtareas.

**Git (20/10, 27/10 y 03/11)**
- El 20/10 no se ve qué rama o tag elige al final.
- No se ve ningún comando de checkout: todo se hace desde la interfaz de Cursor.
- Los hashes de los padres solo se leen en parte.
- No se explica cómo crear los tags, solo cómo subirlos.

**Vercel (18/11)**
- La guía usa `main` y `feature/reactive-forms`; el profesor usó `master` y `refactor/reactive-form2`. Producción se desplegó desde `master`.
- La Preview de la rama sale en Recent Previews, pero no se ve que se abriera.
- Se crearon dos proyectos (`proj-game-r6lu` y `proj-game-jttv`) y ya había otro `proj-game`; el segundo no se ve desplegado.
- El profesor hizo el commit con el mensaje `"."`, que no sigue el formato de la guía.
- No se lee entera la tabla de diagnóstico.
- Máquina de build: 2 cores y 7 GB en los logs, y 2 vCPU y 8 GB en Deployment Settings.
- En el segundo proyecto, el Output Directory aparece como `dist`, mientras la guía habla de `dist/<proyecto>/browser`.
- Versión de Vercel CLI: 65.17.0 en los logs de build (18/11) y 66.2.0 en la terminal (19/11).
