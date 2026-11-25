# Clase del 2026-11-05 (bloque 1 de 3) · Angular

# Clase 05/11/2026 · Videojuegos (bloque 1 de 3) · Angular

Proyecto **`proj-game`** (Angular en WSL Ubuntu, VS Code). La clase parte del listado paginado de juegos que ya estaba hecho y empieza la **actividad "Gestión de videojuegos: formularios Template-Driven, validación reactiva y JSON Server"** (guía en Google Docs). En este bloque se crea el componente `crud` y se empieza su formulario.

> Aquí va también lo de **json-server**. No es backend de clase: es la API falsa que usa la actividad de Angular.

---

## 1. Qué se explicó, en orden

| Minuto | Contenido |
|---|---|
| 00:00–02:40 | Preparación: se apagan las máquinas virtuales (VirtualBox/VMware), se abre WSL con `wsl ~` y se abre `proj-game` en VS Code (`code .`). |
| 02:49–03:00 | Repaso de `app.component.html` de la clase anterior: buscador por id, `@for` con pipe `json`, selector de tamaño de página y botones Anterior/Siguiente. |
| 03:19–03:38 | Se genera el componente con `ng g c crud --skip-tests`. |
| 04:06–04:49 | En la plantilla raíz se añaden `<h1>CRUD</h1>` y `<app-crud></app-crud>`, y `CrudComponent` entra en `imports` de `AppComponent`. |
| 04:57–05:20 | `ng serve -o` (HMR activado). La app sale en `localhost:4200` con "crud works!". Aviso TS-998113: `RouterOutlet` no se usa. |
| 05:38–06:21 | Se arranca la API falsa con `npx json-server --watch db.json --port 3000` y se comprueba `GET /games` en el navegador (responde 304). |
| 07:15–09:20 | Lectura de la guía: introducción, objetivos y aviso de que **no se usa ReactiveFormsModule**. |
| 09:26–09:44 | Arquitectura: Template → AppComponent → GameService → JSON Server → db.json. |
| 09:44–10:30 | Preparar json-server: instalar la 0.17.4, crear `db.json` y el script `api`. |
| 10:05–10:16 | Modelo `Game` (`models/game.ts`): el del proyecto no tenía `stock` y el de la guía sí. |
| 10:49–13:00 | Se copian 4 juegos de la guía al final de `db.json`, con ids nuevos (16–19) y títulos "... 2", para tener más páginas. |
| 13:10–13:41 | En el navegador: "1 de 4" con 5 por página y "2 de 2" con 10. Los juegos nuevos traen `stock` y los viejos no. |
| 14:14–16:50 | Se añade `stock: number` a la interfaz y `id` pasa a opcional (`id?: number`). El tooltip lo muestra como `number \| undefined`. |
| 16:58–18:00 | Guía, apartado 6: importar `FormsModule` en el componente standalone. Se hace en `crud.component.ts`. |
| 18:10–19:07 | Se inyecta el servicio con `inject()`: `private gameService = inject(GameService);`. |
| 19:21–21:50 | Guía, apartado 7 (modelo del formulario). Se crea `game: Game = {...}` con valores iniciales vacíos. |
| 21:57–24:05 | Guía, apartados 8 (two-way binding con `[(ngModel)]`), 9 (`#gameForm="ngForm"`, `(ngSubmit)`, `valid`, `dirty`) y 10 (tabla de campos). |
| 24:22–25:15 | Se escribe el formulario: `<form>`, `<label>` y `<input type="text" name="title">`. |
| 25:15–26:50 | Se mete `NgModel` en `imports` y da el **error -992011** (no es standalone). Se deja solo `FormsModule`. |
| 26:24–28:00 | Con `[(ngModel)]` vacío sale el **error -995002** "Empty expressions are not allowed". Se enlaza a `this.game.title`. |
| 26:53–27:15 | `id="titleId"` en el input y `for="titleId"` en el label. |
| 28:35–30:54 | Se formatea el input. Se añade `#gameForm="ngForm"` y `(ngSubmit)="onSubmit()"`, que todavía da error porque el método no existe. La guía lo llama `saveGame(gameForm)`. |

---

## 2. Conceptos y patrones

- **Angular CLI**:
  - `ng g c <nombre> --skip-tests` crea el `.ts`, el `.html` y el `.css`, sin `.spec`.
  - `ng serve -o` arranca el servidor y abre el navegador. Lleva HMR y modo watch (recarga sola al guardar).
- **Componente hijo en el padre**: se pone su selector (`<app-crud>`) en la plantilla y se añade la clase al `imports` del `@Component` padre.
- **Avisos del compilador**: TS-998113 avisa de que algo de `imports` (aquí `RouterOutlet`) no se usa en la plantilla. Es un aviso, no un error.
- **json-server como API REST simulada**:
  - Cada colección de `db.json` se convierte en un recurso (`/games`).
  - `--watch` recarga al cambiar el JSON.
  - Con `s` + Enter guarda una copia (snapshot) de la base de datos.
  - La app va en el puerto 4200 y la API en el 3000.
- **Arquitectura de capas de la actividad**:
  - Template: `ngModel`, validación y mensajes.
  - AppComponent: estado de la interfaz.
  - GameService: GET, POST y PUT.
  - JSON Server: `localhost:3000`, que lee `db.json`.
- **Interfaz como modelo** (`export interface Game`). Si una propiedad lleva `?` es opcional, y su tipo es `number | undefined`. El `id` es opcional porque al crear un juego todavía no lo tienes.
- **Inyección de dependencias**, de dos formas:
  - Por constructor en `AppComponent` (`constructor(private gameService: GameService){}`), que viene de la clase anterior.
  - Con la función **`inject()`** en `CrudComponent` (`private gameService = inject(GameService);`), que es la forma moderna.
- **Formularios Template-Driven**:
  - Se importa `FormsModule` en el componente standalone.
  - **No** se usan `ReactiveFormsModule`, `FormControl`, `FormGroup`, `FormBuilder` ni `Validators`; se verán después, con Reactive Forms.
  - "Validación reactiva" aquí solo significa que la interfaz responde sola al estado del formulario.
  - El modelo del formulario es un objeto del componente (`game`) con valores iniciales (`''` y `0`).
  - **`[(ngModel)]`** ("banana in a box") es el binding en las dos direcciones, Vista ↔ Modelo.
  - Un input con `ngModel` dentro de un `<form>` necesita el atributo **`name`**.
  - **`NgModel` no es standalone**: no se puede poner suelto en `imports`, tiene que llegar a través de `FormsModule` (error -992011).
  - Un binding no puede tener la expresión vacía (`[(ngModel)]=""` da el error -995002 de ngtsc).
  - **`#gameForm="ngForm"`** es una referencia de plantilla al `NgForm` y permite consultar el estado de todo el formulario.
  - **`(ngSubmit)`** se lanza al enviar el formulario.
  - Estados de los controles: `valid`/`invalid`, `dirty`/`pristine`, `touched`/`untouched` y `errors`.
- **Accesibilidad**: el `for` del label tiene que coincidir con el `id` del input.
- **Plantilla de paginación (repaso)**:
  - `@for (...; track game.id)`.
  - Referencias `#buscarId` y `#tamPage`.
  - Eventos `(click)` y `(change)`.
  - `[disabled]="this.pag === 1"`.
  - Interpolación `{{ this.pag }} de {{ this.totalPag }}`.

---

## 3. Código de ejemplo del profesor

### `ng g c`
```bash
ng g c crud --skip-tests
# CREATE src/app/crud/crud.component.css (0 bytes)
# CREATE src/app/crud/crud.component.html (19 bytes)
# CREATE src/app/crud/crud.component.ts (206 bytes)
```

### `app.component.html` (listado paginado, de la clase anterior, más el CRUD)
```html
<input type="string" #buscarId />
<button (click)="onBuscarId(buscarId.value)">Buscar</button>
<br/>
@for( game of this.games; track game.id ) {
  {{game | json}}
  <br/>
}
<div>
  <select #tamPage (change)="onChangeTamPage(tamPage.value)">
    <option value="5">5</option>
    <option value="10">10</option>
  </select>
</div>
<div>{{ this.pag }} de {{ this.totalPag }}</div>
<div><button [disabled]="this.pag === 1" (click)="onAntPag()">Anterior</button></div>
<div><button [disabled]="this.pag === this.totalPag" (click)="onSigPag()">Siguiente</button></div>

<h1>CRUD</h1>
<app-crud></app-crud>
```

### `app.component.ts` (cabecera)
```ts
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameService } from './services/game.service';
import { Game } from './models/game';
import { JsonPipe } from '@angular/common';
import { CrudComponent } from './crud/crud.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, JsonPipe, CrudComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'proj-game';
  pag = 1;
  tamanoPagina = 5;
  totalCount = 0;
  totalPag = 0;
  games: Game[] = [];

  constructor(private gameService: GameService){}

  //HOOK - OnInit para hidratación del template ya cargado en esqueleto html
  ngOnInit(): void {
    this.loadGames();
  }
  // loadGames(), onBuscarId(), onChangeTamPage(), onAntPag(), onSigPag(): [no se ven en este bloque]
}
```

### `models/game.ts` (al final del bloque)
```ts
export interface Game {
  id?: number;
  title: string;
  genre: string;
  platform: string;
  price: number;
  stock: number;
}
```

### `crud/crud.component.ts`
```ts
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GameService } from '../services/game.service';
import { Game } from '../models/game';

@Component({
  selector: 'app-crud',
  imports: [ FormsModule ],
  templateUrl: './crud.component.html',
  styleUrl: './crud.component.css'
})
export class CrudComponent {
  private gameService = inject(GameService);

  game: Game = {
    title: '',
    genre: '',
    platform: '',
    price: 0,
    stock: 0
  };
}
```
Error que se enseñó: con `imports: [FormsModule, NgModel]` sale *"The directive 'NgModel' appears in 'imports', but is not standalone and cannot be imported directly. It must be imported via an NgModule."*

### `crud/crud.component.html` (donde se queda al minuto 30:47)
```html
<form #gameForm="ngForm" (ngSubmit)="onSubmit()">
  <label for="titleId">Título</label>
  <input id="titleId"
         type="text"
         name="title"
         [(ngModel)]="this.game.title"/>
</form>
```

### Lo que pone la guía (apartados 8 a 10)
```html
<input type="text" name="title" [(ngModel)]="game.title">

<form #gameForm="ngForm" (ngSubmit)="saveGame(gameForm)">
  ...
</form>
<p>Válido: {{ gameForm.valid }}</p>
<p>Modificado: {{ gameForm.dirty }}</p>
```
Tabla de campos (apartado 10):

| Campo | Control HTML |
|---|---|
| Título | `input type="text"` |
| Género | `select` |
| Plataforma | `select` |
| Precio | `input type="number"` |
| Stock | `input type="number"` |

### json-server
```bash
npm install --save-dev json-server@0.17.4
npx json-server --watch db.json --port 3000   # o bien: npm run api
```
```json
"scripts": {
  "api": "json-server --watch db.json --port 3000"
}
```
```json
{
  "games": [
    { "id": 1, "title": "Pixel Runner", "genre": "Platform", "platform": "PC", "price": 14.99, "stock": 12 },
    { "id": 2, "title": "Space Colony", "genre": "Strategy", "platform": "PC", "price": 29.99, "stock": 8 },
    { "id": 3, "title": "Neon Racer", "genre": "Racing", "platform": "PlayStation", "price": 39.99, "stock": 5 },
    { "id": 4, "title": "Dungeon Quest", "genre": "RPG", "platform": "PC", "price": 24.99, "stock": 15 }
  ]
}
```
En el proyecto, `db.json` ya tenía 15 juegos sin `stock` (del 1 "Pixel Runner" al 15 "Robot Factory"; también salen 13 "Shadow Castle" y 14 "Pro Basketball"). Se le añadieron los 4 de la guía como ids 16–19, con títulos "Pixel Runner 2", "Space Colony 2", "Neon Racer 2" y "Dungeon Quest 2".

---

## 4. Librerías, comandos y versiones

- **Angular** (standalone, control flow `@for`, HMR, Vite como servidor de desarrollo). La versión exacta no se ve; el proyecto usa los nombres clásicos `app.component.ts` y `templateUrl`/`styleUrl`.
- `@angular/core`: `Component`, `OnInit`, `inject`.
- `@angular/common`: `JsonPipe`.
- `@angular/router`: `RouterOutlet`.
- `@angular/forms`: `FormsModule` (con `NgModel` y `NgForm` dentro).
- **json-server 0.17.4** (`--save-dev`), con el script `npm run api`.
- Comandos: `wsl ~`, `code .`, `ng g c crud --skip-tests`, `ng serve -o`, `npx json-server --watch db.json --port 3000`.
- URLs: app en `http://localhost:4200/` y API en `http://localhost:3000/games`.

---

## 5. Lo dudoso o ilegible

- El comando de 02:38 solo se ve terminado en `e .`. Lo más probable es `code .`.
- El texto completo del aviso de 05:18 no se lee. Por las capturas de después, es el TS-998113 de `RouterOutlet` sin usar.
- No se ven los cuerpos de `loadGames()`, `onBuscarId()`, `onChangeTamPage()`, `onAntPag()` y `onSigPag()`, ni el contenido de `game.service.ts`.
- El input del buscador lleva `type="string"`, que no es un tipo válido de HTML (el navegador lo trata como `text`). Está tal cual en el código.
- En 26:08, `NgModel` aparece importado dos veces en la línea 2. Fue un paso intermedio: al final queda `FormsModule` en `imports`, y `NgModel` sigue en el `import` de TypeScript sin usar (en gris) en algunas capturas.
- Al acabar el bloque, `onSubmit()` todavía no existe en el `.ts` y sale en rojo. La guía usa `saveGame(gameForm)`. Habrá que ver en el bloque 2 qué nombre se queda.
- El `db.json` del proyecto mezcla juegos con `stock` (16–19) y sin `stock` (1–15). No se ve que se corrija en este bloque.
