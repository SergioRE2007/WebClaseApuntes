# Clase del 2026-11-18 (bloque 2 de 2) · Angular

# Angular: migración del CRUD de juegos a formularios reactivos (18-11, parte 2, 2.º bloque)

Proyecto de clase **proj-game** (Angular 19, API simulada con JSON Server en `localhost:3000`), en VS Code sobre WSL Ubuntu, rama `refactor/reactive-form2`.

## 1. Qué se explicó, en orden

| Minuto | Contenido |
|---|---|
| 27:07 – 27:51 | Demo de la app en `localhost:4200`. Listado de juegos en JSON con botón **Editar**, buscador por ID, selector de tamaño de página (5/10) y paginación «1 de 6» con Anterior/Siguiente. Debajo, el formulario (Título, Género, Plataforma, Precio, Stock, Guardar) con `Válido:` y `Modificado:`. Al poner Precio = 0 sale «Precio fuera de rango permitido [0.01-100]» y el campo se pone con borde rojo. Hay juegos creados desde Postman (ids 26, 27 y 28). |
| 27:59 – 28:38 | Repaso del código: `crud.component.html` (`[formGroup]`, `formControlName`, `@if` con los errores), `crud.component.ts` (los `FormControl` con validadores y el `FormGroup`) y `app.component.html` (`@for`, botón Editar, paginación). |
| 28:38 – 30:15 | **Modo edición.** En `ngOnChanges` se comenta la copia antigua `this.game = {...}` y se cambia por `this.formGroup.setValue(changes['editGame'].currentValue)`. Se escribe en directo: primero sale mal (`this.formGroup.value = ...`, `setValue() = ...`) y luego queda la llamada correcta. Se añade `?.` en `changes['editGame']?.currentValue`. |
| 30:26 – 31:42 | Prueba en el navegador: se pulsa Editar y el juego se carga en el formulario. Stock no se rellenaba porque al `<input>` de stock le faltaba `formControlName="stock"`. Se añade y ya funciona (Válido: true). |
| 31:53 – 33:47 | Explicación de `ngOnChanges` (con la documentación del tooltip), de `SimpleChanges` y `currentValue`, y de la relación entre el padre y el hijo: `[editGame]` como entrada y `(actualizaGames)` como salida. |
| 34:10 – 35:12 | Anuncio «ReactiveForm» en Classroom y `git push` de la rama (ver la parte «otra»). |
| 35:50 – 37:08 | Diapositiva **«Reactivos en Angular 19»**, bloques 1 a 9 (estructura, FormControl, FormGroup, plantilla, errores, FormGroupDirective, onSave en modo edición, ngOnChanges con patchValue y resumen). |
| 37:41 – 42:53 | Guía «Actividad Migración ReactiveForms Git Vercel». Se ejecutan `npm ci` y `npm run build`, se mira `package.json` (scripts) y la carpeta `dist/proj-game/browser`, y se crea `vercel.json`. |
| 43:10 – 49:43 | Commit, push y despliegue en Vercel (ver la parte «otra»). La app queda publicada en `proj-game-r6lu.vercel.app`, pero sale «1 de 0» porque no hay datos. |
| 52:07 – 53:08 | En la consola de DevTools sale un **error de CORS**: la web pública intenta llamar a `http://localhost:3000/games?_page=1&_limit=5`. |
| 53:21 / 54:18 | En la guía, Tarea 5: el método `guardar(form: FormGroupDirective)` como barrera de validación. |

## 2. Conceptos y patrones

- **Formularios reactivos.** Cada campo es un `FormControl` con `nonNullable: true` y sus `validators`, y todos se agrupan en un `FormGroup`. En la plantilla se enlazan con `[formGroup]` y `formControlName`.
- **Validadores integrados:** `Validators.required`, `minLength(3)`, `min` y `max`.
- **Estados del control y del formulario:**
  - `valid`, `invalid`, `touched`, `dirty` y `submitted`.
  - Se pintan en pantalla para depurar: `Válido: {{ gameForm.valid }}`, `Modificado: {{ gameForm.dirty }}` y el objeto con el pipe `json`.
- **Mostrar los errores:**
  - Solo después de tocar el campo o de enviar: `invalid && (touched || dirty || gameForm.submitted)`.
  - El mensaje se elige con `hasError('required')` o con `errors?.['minlength']`.
  - La condición se guarda en una variable de plantilla con `@let` y se usa también en `[class.invalid-control]` para el borde rojo.
- **`#gameForm="ngForm"` sobre el `<form>`** da acceso a la `FormGroupDirective`, que aporta `submitted` y `resetForm()`.
- **`novalidate`** en el `<form>` desactiva la validación del navegador y deja solo la de Angular.
- **Comunicación entre el padre y el hijo con signals:**
  - `editGame = input.required<Game | undefined>()` es la entrada; `actualizaGames = output<Game>()` es la salida.
  - En el padre: `<app-crud [editGame]="this.editGame" (actualizaGames)="onActualizaGames(...)">`.
- **`ngOnChanges(changes: SimpleChanges)`:**
  - Se ejecuta cuando cambia una propiedad de entrada, antes de revisar la vista y los hijos.
  - Se lee con `changes['editGame']?.currentValue`.
- **Modo edición con un indicador `edit`:**
  - Si `edit` vale `true`, se llama a `update` (PUT); si no, a `create` (POST).
  - El `id` no está en el formulario, así que se recupera de `editGame()?.id`.
  - Después de guardar se hace `resetForm()`, se pone `edit = false` y se emite `actualizaGames` para que el padre recargue la lista.
- **`patchValue` y `setValue`:**
  - La diapositiva usa `patchValue(game)`, que no exige que estén todos los campos.
  - En directo el profesor escribió `setValue`.
- **Barrera de validación** (Tarea 5): `markAllAsTouched()`, después `if (invalid) return` (así no se llama a JSON Server) y luego `getRawValue()`, que también devuelve los controles deshabilitados. La petición HTTP sigue en `GameService`, nunca en el componente.
- **Plantilla del padre:**
  - `@for (game of this.games; track game.id)`.
  - `(click)="this.editGame = game"`.
  - `<select #tamPage (change)="onChangeTamPage(tamPage.value)">`.
  - `[disabled]="this.pag === 1"`.
- **Estructura del proyecto:** `src/app/crud`, `models/game.ts` y `services/game.service.ts`.
- **Build y despliegue de una SPA:**
  - El build va a `dist/<proyecto>/browser`.
  - Hace falta un `rewrite` hacia `index.html` para que el Router funcione al recargar una ruta.
- **CORS:** una web publicada en Vercel no puede llamar al `localhost` de quien la visita (dirección *loopback*). Por eso, en la Preview, el formulario valida pero el guardado falla.

## 3. Código de ejemplo del profesor (reconstruido)

### crud.component.ts
```ts
export class CrudComponent implements OnChanges {
  title = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3)]
  });
  price = new FormControl(0, {
    nonNullable: true,
    validators: [Validators.required, Validators.min(0.01), Validators.max(100)]
  });
  stock = new FormControl('', {          // en la diapositiva: new FormControl(0, ...)
    nonNullable: true,
    validators: [Validators.required, Validators.min(0), Validators.max(999)]
  });
  // genre y platform: [dudoso] su definición no se ve

  formGroup = new FormGroup({            // en la diapositiva se llama gameFormGroup
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
      //this.game = {...changes['editGame'].currentValue};
      this.formGroup.setValue(changes['editGame'].currentValue);  // diapositiva: patchValue(game)
      this.edit = true;
    }
  }

  actualizaGames = output<Game>();

  game: Game = { title: '', genre: '', platform: '', price: 0, stock: 0 };
}
```

### onSaveGame (diapositiva, bloque 7)
```ts
onSaveGame(form: FormGroupDirective) {
  if (form.invalid) return;
  if (this.edit) {
    this.gameService.update({ id: this.editGame()?.id, ...form.value })
      .subscribe(gameUpdated => {
        form.resetForm();
        this.edit = false;
        this.actualizaGames.emit(gameUpdated);
      });
  } else {
    this.gameService.create(form.value)
      .subscribe(gameSaved => {
        form.resetForm();
        this.actualizaGames.emit(gameSaved);
      });
  }
}
```

### Barrera de validación (guía, Tarea 5)
```ts
guardar(form: FormGroupDirective): void {
  this.gameForm.markAllAsTouched();
  if (this.gameForm.invalid) {
    return; // no se contacta con JSON Server
  }
  const game = this.gameForm.getRawValue();
  // TODO: llamar a GameService con game
  // Tras confirmar el POST y actualizar el listado:
  // form.resetForm();
}
```

### crud.component.html
```html
<form [formGroup]="formGroup" #gameForm="ngForm" (ngSubmit)="onSaveGame(gameForm)" novalidate>
  <div>
    <label for="titleId">Título</label>
    <input id="titleId" type="text" formControlName="title" />
    @if (title.invalid && (title.touched || title.dirty)) {
      @if (title.hasError('required')) { <p>Título obligatorio...</p> }
      @if (title.errors?.['minlength']) { <p>Longitud minima 3...</p> }
    }
  </div>
  <div>
    <label for="stockId">Stock: </label>
    @let invalidStock = stock.invalid && (stock.touched || stock.dirty || gameForm.submitted);
    <input [class.invalid-control]="invalidStock" id="stockId" type="number" formControlName="stock">
    @if (invalidStock) {
      @if (stock.hasError('required')) { <p>Precio es obligatorio...</p> }
      @if (stock.errors?.['min'] || stock.errors?.['max']) { <p>Precio fuera de rango permitido [0-999]</p> }
    }
  </div>
  <button>Guardar</button>
  <p>Válido: {{ gameForm.valid }}</p>
  <p>Modificado: {{ gameForm.dirty }}</p>
  {{ this.game | json }}
</form>
```
En `(ngSubmit)` el argumento sale cortado en el código: la diapositiva pone unas veces `gameForm` y otras `gameForm.value` [dudoso].

### app.component.html (padre)
```html
<span>Buscar por ID: </span>
<input type="string" #buscarId />
<button (click)="onBuscarId(buscarId.value)">Buscar</button>

@for (game of this.games; track game.id) {
  {{ game | json }}
  <button type="button" (click)="this.editGame = game">Editar</button><br/>
}
<select #tamPage (change)="onChangeTamPage(tamPage.value)">
  <option value="5">5</option>
  <option value="10">10</option>
</select>
<div>{{ this.pag }} de {{ this.totalPag }}</div>
<button [disabled]="this.pag === 1" (click)="onAntPag()">Anterior</button>
<button [disabled]="this.pag === this.totalPag" (click)="onSigPag()">Siguiente</button>

<h1>CRUD</h1>
<app-crud [editGame]="this.editGame" (actualizaGames)="onActualizaGames($event)"></app-crud>
```
En el código, el argumento de `onActualizaGames(game...` sale cortado; `$event` es una suposición [dudoso]. En el padre, `editGame?: Game | undefined` es una propiedad opcional.

### vercel.json
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## 4. Librerías, comandos y versiones

- **Paquetes de Angular:**
  - `@angular/core`, `@angular/common` y `@angular/compiler` en `^19.2.0`.
  - `package-lock.json` con `lockfileVersion 3`.
- **Imports usados:**
  - De `@angular/forms`: `ReactiveFormsModule`, `FormControl`, `FormGroup`, `Validators` y `FormGroupDirective`.
  - De `@angular/core`: `input`, `output`, `OnChanges` y `SimpleChanges`.
  - En el componente raíz: `RouterOutlet`, `JsonPipe` y `CrudComponent`.
- **Scripts de `package.json`:**
  - `start: ng serve`, `build: ng build`, `watch: ng build --watch --configuration development` y `test: ng test`.
  - `api-db-json: json-server --watch db.json --port 3000`, `api-db-js: json-server --watch db.js --port 3000` y `export:json: node export-json.js`.
- **Comandos:**
  - `npm ci`: instala exactamente lo que dice el lockfile. Salen avisos `npm warn deprecated glob@10.5.0` y la sugerencia de `npm audit fix`.
  - `npm run build`: genera `dist/proj-game/browser`, con `index.html`, `main-*.js`, `polyfills-*.js`, `styles-*.css` y `3rdpartylicenses.txt`. Junto a esa carpeta, en `dist/proj-game`, queda `prerendered-routes.json`.
- **Herramientas:** Postman para probar la API, Chrome DevTools (Sources con breakpoints; Console y Network) y JSON Server.

## 5. Dudoso o ilegible

- **Mensajes copiados y pegados en el campo stock:**
  - El error de rango de stock dice «Precio fuera de rango permitido [0-999]».
  - El de obligatorio dice «Precio es obligatorio».
  - Parecen copiados del campo precio sin cambiar el texto; los rangos sí son los de stock.
- **`setValue` y `patchValue`:**
  - En directo se usó `setValue(currentValue)` y en la diapositiva `patchValue(game)`.
  - `setValue` exige exactamente los mismos campos que el formulario, y el `Game` de la API trae además `id`, así que podría dar error. Por eso es más seguro `patchValue`. En las capturas no se ve si dio error en ejecución.
- **Valor inicial de stock:** en el código es `new FormControl('', ...)` y en la diapositiva `new FormControl(0, ...)`.
- **Nombre del FormGroup:** en el código es `formGroup` y en la diapositiva `gameFormGroup`.
- **Aviso del build** en la línea `imports: [RouterOutlet, JsonPipe, CrudComponent]`: el texto no se lee. Probablemente es un import que no se usa en la plantilla, quizá `RouterOutlet`.
- **Errata en la interfaz:** la etiqueta pone «Plataformma».
- **Precio:** en una prueba aparece «1,58», con coma decimal.
- **Partes cortadas:** las condiciones de `title.invalid && (...)` y de `price.invalid` salen cortadas, y la definición de `genre` y `platform` no se ve.
- **Orden de las capturas:** la captura del minuto 42:01 aparece después de la del 42:53; parece un desorden en el nombre del archivo.
