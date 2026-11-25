# Clase del 2026-11-18 (bloque 1 de 2) · Angular

# Angular: migrar el CRUD de juegos de formulario de plantilla a formulario reactivo (18-11, parte 2, minutos 0-27)

Proyecto de clase `proj-game` (VS Code en WSL Ubuntu). El componente es `CrudComponent` (`src/app/crud/crud.component.ts` y `.html`). Parte de la rama `master`, que tiene el formulario con `ngModel`, y en la rama `refactor/reactive-form2` se reescribe en directo con formularios reactivos, campo a campo.

## 1. Qué se explicó, en orden

| Minuto | Qué se hizo |
|---|---|
| 00:00-00:20 | Se comparan las dos ramas. `refactor/reactive-form` ya importa `ReactiveFormsModule, FormGroup, FormControl, FormGroupDirective, Validators`. `master` importa `FormsModule, NgForm`. |
| 00:24-01:04 | Guía de la actividad en Google Docs: PR de revisión, Vercel y diagnóstico de fallos (ver la parte "otra"). |
| 01:13-05:14 | `git switch master` y después `git switch -c refactor/reactive-form2`, para repetir el refactor desde cero. |
| 05:21-05:38 | Punto de partida: el input `title` con `[(ngModel)]="this.game.title"`, `required`, `minlength="3"` y `#title="ngModel"`, y los errores con `@if (title.invalid && (title.touched \|\| title.dirty))`. |
| 06:00-06:51 | En `crud.component.ts` se cambia `FormsModule` por `ReactiveFormsModule` en los imports del `@Component` y se borran `FormsModule` y `NgForm`. El editor se llena de errores porque la plantilla sigue usando `ngModel`. |
| 06:54-07:10 | Se quita `[(ngModel)]` y `#title="ngModel"` del input. |
| 07:24-08:01 | En la plantilla se escribe `<form [formGroup]="formGroup" ...>` y en la clase `formGroup = new FormGroup({})`, importando `FormGroup`. |
| 08:43-09:09 | `title = new FormControl()`. El tooltip muestra que sin argumentos el tipo es `FormControl<any>` y que tiene 4 sobrecargas más. |
| 09:15-09:32 | `new FormControl('', {...})`. Se repasan las sobrecargas: con un valor `''` el tipo es `FormControl<string \| null>`, y con `{ nonNullable: true }` pasa a ser `FormControl<string>`. |
| 09:42-10:13 | Se añade `validators: [Validators.required, Validators.minLength(3)]` y se borran `required` y `minlength` del HTML: la validación pasa al TypeScript. |
| 10:30-11:31 | Se quita `name="title"` del input. En la clase, `formGroup = new FormGroup({ title: this.title })`, y en el input, `formControlName="title"` (con el autocompletado de Angular Language Service). |
| 11:55-12:44 | El tooltip enseña `title: FormControl<string>`. Se lee la documentación de `nonNullable`: sin esa opción, el valor por defecto es `null` y un `reset()` sin valor deja el control en `null`. Se abre `node_modules/@angular/forms/index.d.ts` para ver `FormControlState<T> { value; disabled }`, `FormControlOptions extends AbstractControlOptions` y los constructores genéricos `new <T = any>(...)`. |
| 12:35-13:16 | Repaso de `editGame = input.required<Game \| undefined>()` y de `ngOnChanges`, que copia el juego con spread y pone `edit = true`. |
| 13:28-15:09 | `onSaveGame(form: FormGroupDirective)`: comprueba `form.invalid`, saca trazas con `console.log(this.game)` y `console.log(form.value)`, y distingue crear de editar con `this.edit`. El tooltip de `#gameForm` dice que es un `FormGroupDirective` ("Binds an existing FormGroup or FormRecord to a DOM element"). |
| 15:21-17:43 | Campo Género (`select`): `genre = new FormControl('', { nonNullable: true, validators: [Validators.required] })`, se añade al `FormGroup` y se pone `formControlName="genre"`. **Prueba:** cambia la clave a `genre_` en el TS y en el HTML para enseñar que los dos nombres tienen que coincidir, y luego la deja otra vez en `genre`. |
| 17:53-17:58 | Error **NG8003** "No directive found with exportAs 'ngModel'": aparece al dejar `#platform="ngModel"` sin `FormsModule`. |
| 18:03-19:02 | Campo Plataforma: se copia el bloque de `genre`, se crea `platform`, se añade al grupo y se pone `formControlName="platform"` en el `select`. |
| 19:05-19:39 | Se mira el input de precio original (`type="number"`, `min="0.01"`, `max="100"`, `required`, `#price="ngModel"`). |
| 19:42-20:13 | Se presenta `title.hasError('required')` como alternativa a `title.errors?.['required']`. |
| 20:26-22:18 | `price = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.min(0.01), Validators.max(100)] })`. El tooltip de `Validators.max` muestra el error que genera: `{max: {max: 15, actual: 16}}`. |
| 22:21-23:11 | En el HTML, `formControlName="price"`. Se escribe `price: this.prices` por error en el grupo (sale un error de compilación). Los mensajes se muestran con `price.hasError('required')` y con `price.errors?.['min'] \|\| price.errors?.['max']`. |
| 23:17 | La condición del precio se amplía con `gameForm.submitted`, para que los errores salgan también al pulsar Guardar. |
| 23:54-25:50 | Campo Stock, que usa `@let invalidStock = ...` y `[class.invalid-control]="invalidStock"`: `stock = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.min(0), Validators.max(999)] })`. El autocompletado de `Validators.` lista compose, email, max, maxLength, min, minLength, nullValidator, pattern, required y requiredTrue, y se ve la documentación de `pattern`. Se corrige `this.prices` por `this.price` y se añade `stock: this.stock`. |
| 25:58-26:03 | Se cambia a `stock.hasError(...)` (la captura sale a medio escribir, con las comillas mal). |
| 26:55-27:06 | Prueba: la API en `localhost:3000/games` y `ng serve -o`. La app en `localhost:4200` enseña el buscador por ID, la lista con Editar, la paginación (tamaño 5, "1 de 6", Anterior y Siguiente) y el formulario con "Válido: false" y "Modificado: false". |

## 2. Conceptos y patrones

- **Formulario de plantilla y formulario reactivo:**
  - En el de plantilla, el estado vive en la plantilla (`ngModel`, `#ref="ngModel"` y atributos HTML como `required` o `minlength`).
  - En el reactivo, el modelo del formulario se define en la clase con `FormControl` y `FormGroup`, y los validadores son funciones de `Validators`.
- **Pasos del refactor:**
  1. Cambiar `FormsModule` por `ReactiveFormsModule` en `imports`.
  2. Poner `[formGroup]` en el `<form>`.
  3. Crear un `FormControl` por campo, con sus validadores.
  4. Meter cada control en el `FormGroup`.
  5. En la plantilla, cambiar `name`, `[(ngModel)]` y `#x="ngModel"` por `formControlName="x"`.
  6. Borrar los atributos de validación del HTML.
- **El nombre de `formControlName` tiene que ser exactamente la clave del `FormGroup`**, no el nombre de la propiedad de la clase. El profe lo demostró con `genre_`.
- **Tipado de `FormControl`:**
  - `new FormControl()` es `FormControl<any>`.
  - `new FormControl('')` es `FormControl<string | null>`.
  - `new FormControl('', { nonNullable: true })` es `FormControl<string>`: al hacer `reset()` vuelve a `''` y no a `null`.
- **Segundo argumento del constructor:** puede ser un validador, un array de validadores o un objeto `FormControlOptions` (`{ nonNullable, validators, asyncValidators, updateOn }`).
- **Validadores integrados:** `Validators.required`, `minLength(n)`, `min(n)`, `max(n)` y `pattern(...)`. Los que llevan parámetro son funciones que devuelven un `ValidatorFn`.
- **Leer errores en la plantilla:**
  - Dos formas equivalentes: `control.errors?.['clave']` y `control.hasError('clave')`.
  - Estados del control: `invalid`, `touched` y `dirty`.
  - Del formulario se usa `gameForm.submitted`.
- **Control flow:** `@if` anidados para los mensajes, `@let` para guardar una condición y class binding `[class.invalid-control]`.
- **Envío:** `(ngSubmit)="onSaveGame(gameForm)"`, con `#gameForm="ngForm"` en un formulario con `[formGroup]`. La referencia queda tipada como `FormGroupDirective`. En el método se comprueba `if (form.invalid) return;` y se lee `form.value`.
- **Mezclar los dos estilos no funciona:** sin `FormsModule`, cualquier `#x="ngModel"` que quede da el error NG8003.
- **Otros repasos:** `inject(GameService)`, `input.required<Game | undefined>()`, `ngOnChanges(changes: SimpleChanges)` con `changes['editGame']?.currentValue` y la copia con `{...obj}`.
- **Truco del IDE:** con los tooltips y abriendo `index.d.ts` se ven las sobrecargas y los tipos de la librería.

## 3. Código del profesor (reconstruido)

`crud.component.ts`, como queda al final:
```ts
import { Component, inject, input, OnChanges, output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { GameService } from '../services/game.service';
import { Game } from '../models/game';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-crud',
  imports: [ ReactiveFormsModule, JsonPipe ],
  templateUrl: './crud.component.html',
  styleUrl: './crud.component.css'
})
export class CrudComponent implements OnChanges {
  private gameService = inject(GameService);

  title = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3)]
  });
  genre = new FormControl('', { nonNullable: true, validators: [Validators.required] });
  platform = new FormControl('', { nonNullable: true, validators: [Validators.required] });
  price = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.min(0.01), Validators.max(100)]
  });
  stock = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.min(0), Validators.max(999)]
  });

  formGroup = new FormGroup({
    title: this.title,
    genre: this.genre,
    platform: this.platform,
    price: this.price,
    stock: this.stock
  });

  edit = false;
  editGame = input.required<Game | undefined>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editGame']?.currentValue) {
      this.game = { ...changes['editGame'].currentValue };
      this.edit = true;
    }
  }

  game: Game = { title: '', genre: '', platform: '', price: 0, stock: 0 };

  onSaveGame(form: FormGroupDirective) {
    if (form.invalid) {
      return;
    }
    console.log(this.game);
    console.log(form.value);
    if (this.edit) {
      // ... actualizar con gameService [no se ve]
    }
    // ... crear con gameService [no se ve]
  }
}
```

`crud.component.html`, en fragmentos:
```html
<form [formGroup]="formGroup" #gameForm="ngForm" (ngSubmit)="onSaveGame(gameForm)" novalidate>
  <div>
    <label for="titleId">Título</label>
    <input id="titleId" type="text" formControlName="title" />
  </div>
  @if (title.invalid && (title.touched || title.dirty)) {
    @if (title.hasError('required')) { <p>Título obligatorio...</p> }
    @if (title.errors?.['minlength']) { <p>Longitud mínima 3...</p> }
  }

  <label for="genreId">Género: </label>
  <select id="genreId" formControlName="genre">
    <option value="">Selecciona un género</option>
    <option value="Platform">Platform</option>
    <!-- Strategy, Racing, RPG, Action, Adventure, Simulation, Sports -->
  </select>

  <label for="platformId">Plataformma: </label>
  <select id="platformId" formControlName="platform">
    <option value="">Selecciona plataforma</option>
    <option value="PC">PC</option>
    <option value="PlayStation">PlayStation</option>
    <option value="XBox">XBox</option>
  </select>
  @if (platform.invalid && (platform.dirty || platform.touched)) { <p>Plataforma obligatoria</p> }

  <label for="priceId">Precio: </label>
  <input id="priceId" type="number" formControlName="price" />
  @if (price.invalid && (price.touched || price.dirty || gameForm.submitted)) {
    @if (price.hasError('required')) { <p>Precio es obligatorio...</p> }
    @if (price.errors?.['min'] || price.errors?.['max']) { <p>Precio fuera de rango permitido [0.01-100]</p> }
  }

  <label for="stockId">Stock: </label>
  @let invalidStock = stock.invalid && (stock.touched || stock.dirty); <!-- [dudoso: el final está cortado] -->
  <input [class.invalid-control]="invalidStock" id="stockId" type="number" formControlName="stock" /> <!-- [dudoso: no se ve el formControlName escrito] -->
  @if (invalidStock) {
    @if (stock.hasError('required')) { <p>Precio es obligatorio...</p> }
    @if (stock.errors?.['min'] || stock.errors?.['max']) { <p>Precio fuera de rango permitido [0-999]</p> }
  }
</form>
```

Versión de partida en `master`, con el formulario de plantilla:
```html
<input id="titleId" type="text" name="title" [(ngModel)]="this.game.title" required minlength="3" #title="ngModel" />
```

## 4. Librerías, comandos y versiones

- **Imports:**
  - `@angular/core`: `Component`, `inject`, `input`, `output`, `OnChanges`, `SimpleChanges`.
  - `@angular/forms`: `ReactiveFormsModule`, `FormGroup`, `FormControl`, `FormGroupDirective` y `Validators`. Salen del código `FormsModule` y `NgForm`.
  - `@angular/common`: `JsonPipe`.
- **Angular v22:** el enlace del error es `v22.angular.dev/errors/NG8003`.
- **`ng serve -o`** arranca y abre el navegador. Lleva el HMR de componentes activado ("Component HMR has been enabled").
- **Direcciones:** la app en `localhost:4200` y la API en `localhost:3000/games`.
- **Git:** `git branch`, `git switch master` y `git switch -c refactor/reactive-form2`.
- **Editor:** VS Code con la extensión Angular Language Service y WSL Ubuntu 26.04.

## 5. Lo dudoso o ilegible

- **Falta la captura 029** y la 052 lleva el minuto 08:02 fuera de orden (seguramente es el 09:02).
- **`#gameForm="ngForm"`:** sigue en el `<form>` junto a `[formGroup]`. No se ve si al final se quita. El tooltip dice que es un `FormGroupDirective`.
- **Texto raro en `(ngSubmit)`:** en una captura aparece `onSaveGame(form: gameForm)`. Seguramente es la pista de parámetro del editor (*inlay hint*), no código escrito.
- **Validadores de `price`:**
  - Entre los minutos 20 y 22 se ve `nonNullable: true` con `required`, `min(0.01)` y `max(100)`.
  - En capturas posteriores se lee `validators: [Validators.required, Validators.max(100)]` sin `nonNullable`, probablemente por estar cortado o plegado.
  - Me quedo con la primera versión.
- **Errores del propio código de clase:**
  - La etiqueta pone "Plataformma".
  - El bloque de stock dice "Precio es obligatorio..." y "Precio fuera de rango", copiado del precio.
  - `price: this.prices` se corrige después.
- **Final del refactor de stock:**
  - La condición completa de `@let invalidStock` está cortada.
  - No llega a verse el `formControlName="stock"` en el input.
  - El `stock.hasError(...)` del final está a medio escribir, con las comillas mal.
- **Lo que no se ve:** el cuerpo de `onSaveGame` después de `if (this.edit)` (llamadas a `gameService`, `output`, reset) y el `output()` importado.
- **Repaso de cabeza:** `price` y `stock` son `FormControl<string>` (valor inicial `''`), aunque el input es `number` y el modelo `Game` tiene `price: number`. En clase no se ve qué hace con ese desajuste de tipos.
