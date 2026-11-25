# Clase del 2026-11-05 (bloque 3 de 3) · Angular

# Angular: formularios template-driven, validación visual y estado del formulario (05/11/2026, bloque 3 de 3)

Proyecto de clase **proj-game** (CRUD de videojuegos, VS Code sobre WSL Ubuntu). Usa `json-server` con `db.json` en `127.0.0.1:3000/games` y `ng serve -o` en `localhost:4200`. Este bloque sigue con el componente `CrudComponent` (`src/app/crud/`) y su formulario **template-driven** (`ngForm` + `ngModel`).

## 1. Qué se explicó, en orden

| Minuto aprox. | Contenido |
|---|---|
| p2 18:44 – 20:43 | Mensajes de error del campo **Precio**. Hay un `@if` exterior con `price.invalid && (price.touched \|\| price.dirty)` y dentro dos `@if` anidados: `price.errors?.['required']` → "Precio es obligatorio..." y `price.errors?.['min'] \|\| price.errors?.['max']` → "Precio fuera de rango permitido [0.01-100]". Al principio la condición era solo `dirty`; luego se añadió `touched`. |
| 21:04 – 22:05 | Prueba en el navegador: con el precio vacío sale "obligatorio" y con 1000 sale "fuera de rango". Debajo se ven "Válido: false/true" y "Modificado: true/false". |
| 22:12 – 22:37 | Se enlaza `<label for="priceId">` con `id="priceId"` en el input (accesibilidad). |
| 23:10 – 25:07 | Se copia el bloque para el campo **Stock** (`min="0"`, `max="999"`, `#stock="ngModel"`) y se cambian las referencias `price` por `stock` una a una. Mientras quedan mezcladas, el panel *Problems* marca errores. El texto del rango pasa de [0.01-100] a [0-100] y después a [0-999]. |
| 25:15 – 25:18 | Enunciado (Google Docs), apartado **20 "Validación visual reactiva"**: `[class.invalid-control]="title.invalid && (title.dirty \|\| title.touched)"` y la clase CSS `.invalid-control { border: 2px solid; }`. Esquema del enunciado: estado de Angular → property/class binding → DOM. También propone una clase `valid-control`. |
| 25:28 – 25:46 | Repaso del campo **Título** (`required`, `minlength="3"`, errores `required` y `minlength`), de `crud.component.ts` y de `crud.component.css`. |
| 26:03 – 27:15 | Se escribe el *class binding* en el input de stock. El autocompletado ofrece `[class]`, `[classList]`, `[className]` y `[ngClass]`, y se elige `[class.invalid-control]`. |
| 28:40 – 30:43 | **`@let`**: se guarda la condición en `@let invalidStock = stock.invalid && (stock.touched \|\| stock.dirty);` y se reutiliza en `[class.invalid-control]="invalidStock"` y en `@if (invalidStock)`. El tooltip del editor muestra el tipo `boolean \| null`. |
| 30:59 – 31:44 | Búsqueda en Google de "ng-invalid ng-dirty". La respuesta de la IA da un CSS `input.ng-invalid.ng-dirty` y un ejemplo con formularios reactivos (`formControlName`, `miFormulario.get('username')?.invalid`), que no es lo que se usa en la actividad. |
| 31:57 – 33:59 | Estilos con las **clases que Angular añade solo** a los controles. Primero `#priceId.ng-dirty, #priceId.ng-invalid { border: 2px solid; }` y al final solo `#priceId.ng-invalid`. El editor muestra la especificidad del selector: (1, 1, 0). |
| 33:03 | Vistazo a `app.component.html`: buscador por ID, `@for` con `track` y paginación (ver código abajo). |
| 34:48 – 35:58 | **DevTools → Elements**: el input tiene `class="ng-dirty ng-touched ng-valid"` y atributos `ng-reflect-*` (modo desarrollo). El `<form novalidate>` también tiene las clases de estado. Se ven `_ngcontent-ng-c…` (encapsulación de estilos), `app-root` > `app-crud` y los scripts `polyfills.js` y `main.js`. También el *box model*. |
| 36:43 | Enunciado, apartados **21 (indicador global del formulario)** y **22 (botón reactivo)**. |
| 38:53 – 39:24 | Se muestran `{{ gameForm.valid }}` y `{{ gameForm.dirty }}` y se añade `<button>Guardar</button>` dentro del form (dentro de un form, un botón es de tipo submit por defecto). |
| 39:42 – 40:38 | `onSaveGame()` hace `console.log(this.game)`. Se añade `{{ this.game \| json }}` y se importa `JsonPipe` desde `@angular/common`. |
| 42:06 – 42:59 | Se prueba `{{ gameForm \| json }}` y da el error **"TypeError: Converting circular structure to JSON"** (`crud.component.html:116`). Se borra esa línea y se deja solo `this.game \| json`. |
| 43:28 – 43:52 | Prueba: al escribir "10.50" el modelo guarda `price: 10.5` (número). En la consola sale el objeto desde `crud.component.ts:27`, y un array de 5 juegos desde `app.component.ts:41`. |
| 46:25 – 47:36 | Tooltips del Language Service. **NgForm** "crea un FormGroup de nivel superior y lo enlaza al form… se activa en todos los `<form>` al importar FormsModule", y también se menciona `NgModelGroup`. **NgModel.name** es la clave con la que el form padre guarda el valor del control, así que `name` es obligatorio. |
| 47:52 | `select` de género con `[(ngModel)]`, `required`, `#genre="ngModel"`, una opción vacía "Selecciona un género" y el mensaje "Género obligatorio". |
| 48:12 – p3 00:33 | `<button [disabled]="gameForm.invalid">Guardar</button>`. Prueba: con el título vacío sale "Título obligatorio..." y el botón aparece en gris. |
| p3 01:18 – 01:46 | Enunciado, apartados siguientes (la tarea que queda): 26 `createGame` con HttpClient (POST), 27 flujo de guardado, 34 botón Crear/Actualizar, 35 botón Cancelar, 36 maqueta con errores y 37 "Inspeccionar la validación". |
| p3 02:00 – 05:01 | Vuelta a `app.component.html` (paginación) y fin de la clase. |

## 2. Conceptos y patrones

- **Formulario template-driven**: `#gameForm="ngForm"`, `(ngSubmit)="onSaveGame()"`, `[(ngModel)]` y `name` en cada control. Hace falta `FormsModule` en los `imports` del componente standalone.
- **Referencia al control**: `#price="ngModel"`. Da acceso a `invalid`, `valid`, `touched`, `dirty` y `errors`.
- **Validadores como atributos HTML**: `required`, `min`, `max` y `minlength`. Angular los reconoce y crea las claves de error `required`, `min`, `max` y `minlength`.
- **Mostrar el error solo cuando el usuario ya ha interactuado**: `control.invalid && (control.touched || control.dirty)`.
- **Un mensaje por tipo de error** con `@if` anidados y `errors?.['clave']` (encadenamiento opcional, porque `errors` es `null` si el control es válido).
- **`@let`** declara una variable en la plantilla para no repetir una condición. Hay que acabarla con `;`.
- **Class binding** `[class.nombre]="condición"`.
- **Dos formas de pintar el error en CSS**:
  - una clase propia (`.invalid-control`) puesta con class binding;
  - las clases automáticas de Angular: `ng-valid`/`ng-invalid`, `ng-dirty`/`ng-pristine` y `ng-touched`/`ng-untouched`.
- **Estado global del formulario**: `gameForm.valid`, `gameForm.invalid` y `gameForm.dirty`. Con ellos se pinta el estado en la página y se desactiva el botón con `[disabled]="gameForm.invalid"`.
- **Depurar con el pipe `json`**: en un componente standalone hay que importar `JsonPipe`. Con el modelo (`this.game`) funciona, pero con `gameForm` falla porque `NgForm` tiene referencias circulares.
- **`<input type="number">` + ngModel** guarda un número (10.50 → 10.5). Si el campo se vacía, guarda `null`.
- **DevTools**: sirve para ver las clases de estado y los atributos `ng-reflect-*`. El `<form>` recibe `novalidate` automáticamente, porque Angular sustituye a la validación nativa del navegador.

## 3. Código del profesor (reconstruido)

### crud.component.ts
```ts
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { GameService } from '../services/game.service';
import { Game } from '../models/game';

@Component({
  selector: 'app-crud',
  imports: [ FormsModule, JsonPipe ],
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

  onSaveGame() {
    console.log(this.game);
  }
}
```

### crud.component.html (partes principales)
```html
<form #gameForm="ngForm" (ngSubmit)="onSaveGame()">
  <div>
    <label for="titleId">Título</label>
    <input id="titleId" type="text" name="title"
           [(ngModel)]="this.game.title"
           required minlength="3" #title="ngModel" />
    @if ( title.invalid && ( title.touched || title.dirty ) ) {
      @if ( title.errors?.['required'] ) { <p>Título obligatorio...</p> }
      @if ( title.errors?.['minlength'] ) { <p>Longitud mínima 3...</p> }
    }
  </div>

  <div>
    <label for="genreId">Género: </label>
    <select id="genreId" name="genre" [(ngModel)]="this.game.genre" required #genre="ngModel">
      <option value="">Selecciona un género</option>
      <option value="Platform">Platform</option>
      <option value="Strategy">Strategy</option>
      <option value="Racing">Racing</option>
      <option value="RPG">RPG</option>
      <option value="Action">Action</option>
      <option value="Adventure">Adventure</option>
      <option value="Simulation">Simulation</option>
      <option value="Sports">Sports</option>
    </select>
    @if ( genre.invalid && ( genre.dirty || genre.touched ) ) {
      <p>Género obligatorio</p>
    }
  </div>

  <div>
    <label for="priceId">Precio: </label>
    <input id="priceId" type="number" name="price"
           [(ngModel)]="game.price"
           required min="0.01" max="100" #price="ngModel" />
    @if ( price.invalid && ( price.touched || price.dirty ) ) {
      @if ( price.errors?.['required'] ) { <p>Precio es obligatorio...</p> }
      @if ( price.errors?.['min'] || price.errors?.['max'] ) {
        <p>Precio fuera de rango permitido [0.01-100]</p>
      }
    }
  </div>

  <div>
    <label for="stockId">Stock: </label>
    @let invalidStock = stock.invalid && ( stock.touched || stock.dirty );
    <input [class.invalid-control]="invalidStock"
           id="stockId" type="number" name="stock"
           [(ngModel)]="game.stock"
           required min="0" max="999" #stock="ngModel">
    @if ( invalidStock ) {
      @if ( stock.errors?.['required'] ) { <p>Precio es obligatorio...</p> }
      @if ( stock.errors?.['min'] || stock.errors?.['max'] ) {
        <p>Precio fuera de rango permitido [0-999]</p>
      }
    }
  </div>

  <button [disabled]="gameForm.invalid">Guardar</button>

  <p>Válido: {{ gameForm.valid }}</p>
  <p>Modificado: {{ gameForm.dirty }}</p>
</form>

{{ this.game | json }}
```

### crud.component.css
```css
.invalid-control {
  border: 2px solid;
}

#priceId.ng-invalid {
  border: 2px solid;
}
```

### app.component.html (listado del bloque anterior, visto de nuevo)
```html
<span>Buscar por ID: </span>
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
```

### Enunciado de la actividad ("Gestión de videojuegos: formularios template-driven, validación reactiva y JSON…")
```html
<!-- 21. Indicador global del formulario -->
@if (gameForm.invalid && gameForm.dirty) { <p>Existen campos pendientes de corregir.</p> }
@if (gameForm.valid && gameForm.dirty)   { <p>Formulario preparado para guardar.</p> }

<!-- 22. Botón reactivo -->
<button type="submit" [disabled]="gameForm.invalid">Guardar</button>

<!-- 34. Botón que cambia de texto -->
<button type="submit" [disabled]="gameForm.invalid">
  @if (game.id) { Actualizar } @else { Crear }
</button>

<!-- 35. Botón Cancelar: abandona la edición, limpia el modelo, reinicia el formulario y lo deja en pristine -->
<button type="button" (click)="cancelEdit(gameForm)">Cancelar</button>
```
```ts
// 26. En GameService: el hueco lo rellena el alumno (por el apartado 27, sería post)
createGame(game: Game) {
  return this.http.________<Game>(this.apiUrl, game);
}
// 27. Flujo: ngSubmit → saveGame() → GameService → POST /games
```

## 4. Librerías, comandos y herramientas

- `@angular/core` (`Component`, `inject`), `@angular/forms` (`FormsModule`, `NgForm`, `NgModel`, `NgModelGroup`) y `@angular/common` (`JsonPipe`).
- Sintaxis de plantilla moderna: `@if` / `@else`, `@for … track` y `@let`. `@let` existe desde Angular 18.1; no se ve qué versión usa el proyecto.
- `ng serve -o`: al guardar, la terminal muestra "Changes detected. Rebuilding..." y "Component update sent to client(s)." (recarga en caliente).
- Mock de la API: `db.json` servido en `127.0.0.1:3000/games` (por la pestaña y el puerto, parece `json-server`).
- VS Code con WSL (Ubuntu-26.04), rama `master`, Angular Language Service (tooltips y tipos) y Chrome DevTools.

## 5. Dudoso o ilegible

- **Textos copiados sin cambiar**: el bloque de Stock sigue diciendo "Precio es obligatorio..." y "Precio fuera de rango…", porque se copió del de Precio y solo se cambiaron las referencias. El rango del texto acaba en [0-999], que sí coincide con `max="999"`. Al probar, con Stock vacío sale "Precio es obligatorio...".
- **`this.game.title` contra `game.price`**: en Título y Género se escribe con `this.`, y en Precio y Stock sin él. Las dos formas funcionan en la plantilla.
- **`JsonPipe`**: en una captura de 40:38 el import ya está, pero el `@Component` solo tiene `[FormsModule]`. En 44:28 ya sale `[FormsModule, JsonPipe]`.
- **El campo `platform`** no aparece en ninguna parte del formulario que se ve, así que el modelo siempre lleva `platform: ''`.
- **Las líneas 57-58 del input de precio** (antes de `name`) salen cortadas en varias capturas. El `id="priceId"` se ve escrito a las 22:16.
- **El CSS final** solo marca `#priceId.ng-invalid`, sin `ng-dirty`, así que el borde sale nada más cargar la página aunque el usuario no haya tocado el campo. No se ve que se comentara.
- **"Modificado: false" con valores escritos**: aparece en algunas demos (22:23, p3 00:29). Probablemente fue después de recargar o reiniciar el formulario; no está claro.
- **`<input type="string">`** en el buscador no es un tipo HTML válido (el navegador lo trata como `text`).
- **Los valores numéricos del box model** en DevTools (35:58) no se leen.
- **Hueco de `createGame`**: el método HTTP está en blanco a propósito en el enunciado; que sea `post` se deduce del apartado 27 (`POST /games`).
- **Apartados 36 y 37**: lo que hay debajo de la maqueta del enunciado (incluido el 37, "Inspeccionar la validación") sale cortado.
