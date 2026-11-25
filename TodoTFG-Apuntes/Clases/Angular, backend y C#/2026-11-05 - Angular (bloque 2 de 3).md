# Clase del 2026-11-05 (bloque 2 de 3) · Angular

# Angular: formularios template-driven con validación (bloque 2 de 3, clase del 05/11/2026)

Proyecto de clase `proj-game` (VS Code en WSL Ubuntu, `ng serve -o`, API simulada con `db.json` en `127.0.0.1:3000/games`). En esta parte se sigue el enunciado de Google Docs **"Actividad: Gestión de videojuegos. Formularios Template-Driven, validación reactiva y JSON Server"** y se escribe el formulario en `crud/crud.component.html` y `crud.component.ts`. En la misma página ya estaban el listado de juegos, la búsqueda por ID y la paginación ("1 de 4", Anterior/Siguiente, tamaño de página 5), hechos en el bloque anterior.

## 1. Qué se explicó, en orden

**Parte 1 del vídeo**
- **~30:58** Enunciado, apartados 9 "Crear el formulario" y 10 "Campos del formulario": `<form #gameForm="ngForm" (ngSubmit)="saveGame(gameForm)">` y la tabla de campos (Título → `input text`, Género → `select`, Plataforma → `select`, Precio y Stock → `input number`). Todos los controles tienen que llevar `name` y `[(ngModel)]`.
- **~31:09–32:30** En el componente: `imports: [FormsModule]`, `inject(GameService)`, el objeto `game: Game` inicializado y el método vacío `onSaveGame()`, al que llama `(ngSubmit)`. El profesor usa `onSaveGame()` sin argumentos, no `saveGame(gameForm)` como en el enunciado.
- **~32:30–33:30** Explicación de `[(ngModel)]` (Modelo → Vista y Vista → Modelo) y se añaden `<p>Válido: {{ gameForm.valid }}</p>` y `<p>Modificado: {{ gameForm.dirty }}</p>` para ver el estado del formulario.
- **~33:30–34:10** En el navegador: al principio sale `Válido: true` y `Modificado: false`, y al escribir pasa a `Modificado: true`.
- **~34:15–36:00** Se añade `minlength="3"` al input del título. El tooltip de VS Code muestra que lo gestiona la directiva `MinLengthValidator`.
- **~36:46** Con el título vacío sigue saliendo `Válido: true`: `minlength` no se queja de un campo vacío, y por eso hace falta `required`.
- **~37:53–39:33** Apartado 11 "Validación reactiva": los estados que Angular guarda de cada control (`valid/invalid`, `pristine/dirty`, `untouched/touched`, `errors`) y la referencia `#title="ngModel"`.
- **~39:47–41:00** Se añade `required`. Ahora sale `Válido: false` y, con "as" (2 letras), `Válido: false` y `Modificado: true`.
- **~41:15–43:18** Búsqueda en Google: validación declarativa de HTML5 (`required`, `minlength/maxlength`, `min/max`, `step`, `pattern`, y los `type` email, url, number y date) y las clases CSS que pone Angular (`.ng-valid`, `.ng-invalid`, `.ng-pending`, `.ng-pristine`, `.ng-dirty`, `.ng-untouched`, `.ng-touched`). `pending` es el estado de mientras se ejecuta una validación asíncrona (por ejemplo, comprobar en el servidor si un correo ya existe).
- **~43:27–44:00** Apartado 12, tabla "Estados de un control" (la va resaltando por parejas).
- **~44:00–45:56** Apartados 13 "Validación del título" (obligatorio, de 3 a 40 caracteres) y 14 "Mensajes de validación reactivos" con `@if` anidados.
- **~46:05–49:38** Lo escribe en el código: `#title="ngModel"` y `@if (title.errors?.['required'])`. Prueba primero `title.errors.['required']`, que da error de compilación, y después `title.errors?.required`; al final se queda con `?.['required']`.

**Parte 2 del vídeo**
- **~00:05–00:44** Abre `node_modules/@angular/forms/index.d.ts` para enseñar el tipo `ValidationErrors = { [key: string]: any }`. Por eso los errores se leen con la clave entre corchetes.
- **~00:51–01:37** Mensaje `<p>Título obligatorio...</p>` dentro del `@if`. En el navegador el mensaje sale nada más abrir el formulario.
- **~01:43–03:51** Para no mostrar el error antes de tocar el campo, envuelve el bloque en `@if (title.invalid && (title.touched || title.dirty))`. Los tooltips enseñan `RequiredValidator` y `MinLengthValidator`.
- **~04:06–05:56** Segundo `@if` para `minlength` ("Longitud mínima 3...") y vuelve a mirar `ValidationErrors` en el `.d.ts`.
- **~06:26–06:42** Prueba en el navegador: con el campo vacío y ya modificado sale "Título obligatorio...".
- **~07:45–08:42** Enunciado de los apartados 15 (flujo de la validación), 16 (género), 17 (plataforma), 18 (precio) y 19 (stock).
- **~08:58–14:01** Construye el `select` de género: `label for` + `id`, `name`, `[(ngModel)]="this.game.genre"`, `required`, `#genre="ngModel"`, opción vacía "Selecciona un género" y las 8 opciones copiadas del enunciado. Debajo, `@if (genre.invalid && (genre.dirty || genre.touched))` con el mensaje "Género obligatorio". El autocompletado enseña las propiedades del control (`dirty`, `errors`, `hasError`, `getError`, `invalid`...).
- **~14:06–15:19** Prueba: al tocar el select sin elegir nada sale "Género obligatorio" y `Modificado: true`. Mete cada campo en su `<div>`.
- **~16:08–17:08** Enunciado de los apartados 18 y 19 y del 20 "Validación visual reactiva": `[class.invalid-control]` y la clase CSS.
- **~17:36–18:34** Empieza el campo Precio: `<label for="priceId">`, el input number copiado del enunciado y un `@if (price.invalid && ( ... ))` que se queda a medias al acabar el bloque.

## 2. Conceptos y patrones
- **Formularios template-driven**: `FormsModule` en los `imports` del componente standalone. `ngForm` se crea solo en cada `<form>`, y cada control con `ngModel` necesita `name`.
- **Referencia de plantilla**: `#gameForm="ngForm"` da acceso al formulario entero (`valid`, `dirty`) y `#title="ngModel"` a un control. El tooltip lo describe como *"Creates a FormControl instance from a domain model and binds it to a form control element"*.
- **`(ngSubmit)`** llama a un método del componente.
- **Validación declarativa con atributos HTML**, que Angular convierte en directivas validadoras: `required` (`RequiredValidator`), `minlength` (`MinLengthValidator`), `maxlength`, `min` y `max`.
- **Estados de un control**:

| Estado | Significado |
|---|---|
| valid / invalid | cumple todas las reglas / tiene al menos un error |
| pristine / dirty | no se ha modificado / se ha cambiado el contenido |
| untouched / touched | no ha entrado y salido del campo (blur) / sí |
| errors | objeto `ValidationErrors` con los errores activos, o `null` |
| pending | validación asíncrona en curso |

- **Clases CSS automáticas**: `ng-valid/ng-invalid/ng-pending`, `ng-pristine/ng-dirty` y `ng-untouched/ng-touched`.
- **Patrón para mostrar errores**: un `@if` exterior con `control.invalid && (control.dirty || control.touched)`, para no enseñar errores al abrir el formulario, y dentro un `@if` por cada tipo de error con `control.errors?.['clave']`.
- **Por qué se usan corchetes**: `ValidationErrors` es una *index signature*, así que el compilador de plantillas obliga a escribir `['required']` (error ngtsc 4111). La sintaxis `errors.['x']` (punto y corchete sin `?`) da error del parser.
- **`select` obligatorio**: una primera opción con `value=""` hace que `required` falle mientras no se elija nada.
- **Accesibilidad**: `label for` igual al `id` del control.
- **Validación visual (enunciado, apartado 20)**: `[class.invalid-control]="title.invalid && (title.dirty || title.touched)"` y `.invalid-control { border: 2px solid; }`. Se puede hacer también una clase `valid-control`.

## 3. Código del profesor (reconstruido)

`crud.component.ts`
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

  game: Game = { title: '', genre: '', platform: '', price: 0, stock: 0 };

  onSaveGame() {
  }
}
```

`crud.component.html` (cómo estaba al final del bloque)
```html
<form #gameForm="ngForm" (ngSubmit)="onSaveGame()">
  <div>
    <label for="titleId">Título</label>
    <input id="titleId"
           type="text"
           name="title"
           [(ngModel)]="this.game.title"
           required
           minlength="3"
           #title="ngModel" />

    @if (title.invalid && (title.touched || title.dirty)) {
      @if (title.errors?.['required']) {
        <p>Título obligatorio...</p>
      }
      @if (title.errors?.['minlength']) {
        <p>Longitud mínima 3...</p>
      }
    }
  </div>

  <div>
    <label for="genreId">Género: </label>
    <select id="genreId"
            name="genre"
            [(ngModel)]="this.game.genre"
            required
            #genre="ngModel">
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
    @if (genre.invalid && (genre.dirty || genre.touched)) {
      <p> Género obligatorio</p>
    }
  </div>

  <div>
    <label for="priceId">Precio: </label>
    <input type="number"
           name="price"
           [(ngModel)]="game.price"
           required
           min="0.01"
           max="100"
           #price="ngModel" />
    @if (price.invalid && ( ... )) {   <!-- [dudoso] a medias al acabar el bloque -->
    }
  </div>

  <p>Válido: {{ gameForm.valid }}</p>
  <p>Modificado: {{ gameForm.dirty }}</p>
</form>
```

Del enunciado, todavía sin escribir en el código:
```html
<input type="number" name="stock" [(ngModel)]="game.stock"
       required min="0" max="999" #stock="ngModel">

<!-- 17. Plataforma: obligatoria, opción vacía "Selecciona una plataforma" + PC, PlayStation, Xbox, Switch, con #platform="ngModel" -->
```
```css
.invalid-control { border: 2px solid; }
```
Tipo que se enseña en `@angular/forms/index.d.ts`:
```ts
type ValidationErrors = { [key: string]: any };
```

Flujo de la validación del enunciado (apartado 15): con el formulario recién abierto no sale ningún error; con `[ A ]` sale "El título debe tener al menos 3 caracteres"; con `[ Zelda ]` el error desaparece solo.

## 4. Librerías, comandos y versiones
- `@angular/core` (`Component`, `inject`, control flow `@if`) y `@angular/forms` (`FormsModule`, `NgForm`, `NgModel`, `RequiredValidator`, `MinLengthValidator`, `AbstractControlDirective`, `ValidationErrors`).
- `ng serve -o` (servidor de desarrollo en `localhost:4200`), y `db.json` con una API en el puerto 3000 (json-server, del bloque anterior).
- No se ven versiones. La sintaxis `@if` necesita Angular 17 o posterior.

## 5. Dudoso o ilegible
- En una captura (~39:47) el input lleva `required=""`, y en las siguientes `required` sin valor. Las dos formas valen.
- Hacia los 47:53 aparece `title.errors?.required` sin error en pantalla, pero el error ngtsc 4111 indica que el proyecto exige corchetes. La versión que se queda es `title.errors?.['required']`.
- El enunciado pide que el título tenga como máximo 40 caracteres (`maxlength="40"`), pero en el código del profesor no se ve `maxlength`.
- El orden de la condición cambia: en el código pone `title.touched || title.dirty` y en el enunciado `dirty || touched` (es lo mismo). Para el género, el enunciado dice `genre.invalid && genre.touched` y el profesor usó `genre.invalid && (genre.dirty || genre.touched)`.
- Se ve que el profesor escribe `this.game.title` y `this.game.genre`, pero en el precio copió `game.price` del enunciado, sin `this`. En plantilla funcionan las dos.
- El `@if` del precio se queda sin terminar al final del bloque, y no se llegaron a escribir ni Plataforma ni Stock.
- Las rutas de los imports `../services/game.service` y `../models/game` se leen en una sola captura; puede que no sean exactas.
