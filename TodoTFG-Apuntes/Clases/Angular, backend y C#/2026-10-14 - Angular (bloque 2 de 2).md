# Clase del 2026-10-14 (bloque 2 de 2) · Angular

# Angular: proyecto de la lámpara (proj-lamp), parte 2 de 2. Clase del 14/10/2026

Contexto: es la actividad evaluable **"Act Eval 4 - Control de una lámpara"**, publicada en Classroom (2627 Acceso a Datos). El enunciado, que está en Google Docs, dibuja con caracteres ASCII dos componentes:

- **COMPONENTE PADRE**: "Estado de conexión: DESENCHUFADA", un botón `[ Enchufar lámpara ]` y "Último estado recibido: APAGADA".
- **COMPONENTE HIJO**: una bombilla con el texto "APAGADA".

Esto anticipa la comunicación entre padre e hijo: el padre enchufa y el hijo le devuelve su estado. En este bloque solo se monta la parte visual del padre. Todavía no hay `input()`, `output()` ni eventos.

## 1. Qué se explicó, en orden

| Minuto | Qué se hizo |
|---|---|
| 18:32 | Repaso de la estructura del proyecto `proj-lamp` en VS Code (WSL Ubuntu). El componente `lampara` ya está creado en `src/app/components/lampara/` con `.ts`, `.html` y `.css`. `styles.css` global, sin tocar. |
| 18:39 | `app.component.ts`: componente standalone que importa `LamparaComponent` en `imports`. |
| 19:05 - 20:12 | Se añaden dos propiedades de estado al componente raíz: `enchufado = false` y `estadoLampara = false`. |
| 20:15 | `app.component.html`: un `div.cab` (cabecera del padre) y, debajo, `<app-lampara>`. Se borra un texto provisional, "Comp padre". |
| 20:26 - 20:31 | Se consulta el enunciado de la actividad en Google Docs. |
| 20:56 - 21:56 | **`@if (enchufado) { ... } @else { ... }`** para mostrar "Estado conexión eléctrica: ENCHUFADO / DESENCHUFADO". El autocompletado de la extensión de Angular ofrece `else`, `else if`, `empty`... |
| 22:01 - 23:48 | La cabecera se reparte en dos `div`: uno para el texto del estado y otro para el botón. El segundo lleva otro `@if/@else` con los botones `DESENCHUFAR` y `ENCHUFAR`. |
| 23:57 | Se prueba en el navegador (`localhost:4200`). Sale DESENCHUFADO, el botón ENCHUFAR y el hijo con su plantilla por defecto, **"lampara works!"**. |
| 24:11 - 24:37 | `app.component.css`: `:host` como flex en columna a `100vh`, `.cab` en azul con `flex: 0 0 30%` y `app-lampara` en chartreuse con `flex: 1`. |
| 24:50 - 25:23 | Botón: primero `padding: 1rem` y después `margin: 1rem`. Se compara en el navegador la diferencia entre padding y margin. |
| 25:28 - 26:00 | `span { color: white; }`, para que el texto se lea sobre el fondo azul. |
| 26:57 - 27:08 | `.cab` también pasa a ser flex en columna (`display: flex; flex-direction: column`). |
| 27:20 - 28:10 | Se añaden las clases `estado` y `boton` a los dos `div`. `.estado { flex: 0 0 60% }` y `.boton { flex: 1 }`. |
| 28:21 - 28:51 | Se prueba `border: 1px` en `.boton` y se quita. |
| 28:59 - 29:48 | **DevTools de Chrome**: inspector de elementos, panel Styles, modo responsive (400 × 543) y atributos de encapsulación `_ngcontent-*` / `_nghost-*`. `ng-version="19.2.25"`. `.estado` pasa a `flex: 0 0 80%`. |
| 30:04 - 31:14 | Se **comentan** reglas con `/* */` (los `flex` de `.estado`, `.boton` y, al final, también el de `.cab`) para ver qué hace cada una en la maqueta. |
| 32:03 - 32:10 | Repaso final de la plantilla y del CSS (`app-lampara`, `span`, `button`). |

## 2. Conceptos y patrones

- **Componente standalone**: los componentes hijos se importan en el array `imports` de `@Component`. No hay `NgModule`.
- **Composición padre-hijo**: el padre usa el **selector** del hijo (`<app-lampara>`) en su plantilla. Para que funcione, `LamparaComponent` tiene que estar en `imports`.
- **Estado en la clase del componente**: propiedades con valor inicial (`enchufado = false`). TypeScript infiere el tipo `boolean`, como muestra el tooltip de VS Code (`AppComponent.enchufado: boolean`).
- **Control de flujo nuevo**: `@if (cond) { } @else { }`, con llaves y sin `*ngIf`. Se usa dos veces sobre la misma propiedad: una para el texto y otra para el botón.
- **Estilos encapsulados por componente** (`styleUrl`):
  - Un selector de etiqueta como `span` o `button` en `app.component.css` solo afecta a la plantilla de `AppComponent`.
  - Angular lo consigue añadiendo atributos `_ngcontent-xxx` y `_nghost-xxx`, que se vieron en DevTools.
- **`:host`**: le da estilo al propio elemento del componente (`app-root`). Aquí lo convierte en un contenedor flex a pantalla completa.
- **Selector del hijo en el CSS del padre**: `app-lampara { ... }` da estilo al elemento host del hijo desde fuera, con su color y el espacio que ocupa.
- **Flexbox**:
  - `display: flex` y `flex-direction: column`.
  - `flex: <grow> <shrink> <basis>`. Por ejemplo, `0 0 30%` es un tamaño fijo del 30 %, y `flex: 1` ocupa el resto del espacio.
  - Contenedores anidados: `:host` → `.cab` → `.estado` / `.boton`.
- **padding y margin**: el padding es relleno interior (agranda el botón) y el margin es separación exterior.
- **Depurar la maqueta**: comentar reglas CSS y mirar el resultado, usar el inspector de DevTools y el modo responsive.
- `ng serve` recarga sola al guardar: se cambia el CSS y se ve al momento en `localhost:4200`.

## 3. Código del profesor (reconstruido)

### `src/app/app.component.ts`
```ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LamparaComponent } from './components/lampara/lampara.component';

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

### `src/app/app.component.html`
```html
<div class="cab">
  <div class="estado">
    @if (enchufado) {
      <span>Estado conexión eléctrica: ENCHUFADO</span>
    } @else {
      <span>Estado conexión eléctrica: DESENCHUFADO</span>
    }
  </div>
  <div class="boton">
    @if (enchufado) {
      <button>DESENCHUFAR</button>
    } @else {
      <button>ENCHUFAR</button>
    }
  </div>
</div>

<app-lampara></app-lampara>
```
Los botones todavía no tienen `(click)`. Al final del bloque, `enchufado` no cambia nunca y la página siempre muestra DESENCHUFADO / ENCHUFAR.

### `src/app/app.component.css` (estado aproximado al final)
```css
:host {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.cab {
  display: flex;
  flex-direction: column;
  background-color: blue;
  /*flex: 0 0 30%;*/   /* [dudoso] en unas capturas está activo y en otras comentado */
}

.estado {
  /*flex: 0 0 80%;*/   /* antes 60 %, luego 80 %, al final comentado */
}

.boton {
  /*flex: 1*/          /* se probó border: 1px y se quitó */
}

app-lampara {
  background-color: chartreuse;
  flex: 1;
}

span {
  color: white;
}

button {
  margin: 1rem;        /* antes padding: 1rem */
}
```

### Lo que se vio en DevTools
```html
<app-root ng-version="19.2.25" _nghost-ng-c3906955074>
  <div _ngcontent-ng-c3906955074 class="cab">
    <div _ngcontent-ng-c3906955074 class="estado">...</div>
    <div _ngcontent-ng-c3906955074 class="boton">...</div>
```
```css
.estado[_ngcontent-ng-c3906955074] { flex: 0 0 80%; }  /* app.component.css:15 */
```

## 4. Librerías, comandos y versiones

- **Angular 19.2.25**, según el atributo `ng-version` del DOM.
- `@angular/core` (`Component`) y `@angular/router` (`RouterOutlet`, que se importa aunque en este bloque no se usa).
- Servidor de desarrollo `ng serve` en `http://localhost:4200`. La pestaña del navegador se llama "ProjLamp".
- Entorno:
  - VS Code conectado a **WSL Ubuntu-26.04**, con el proyecto en `~/proj-lamp`.
  - Extensión de Angular (Language Service) para autocompletar bloques y etiquetas.
  - GitLens / Git Graph: aparece "Not Committed Yet" en la rama `master`.
- Chrome DevTools: Elements, Styles y modo dispositivo (Responsive).
- No se instala ninguna librería nueva.

## 5. Dudoso o ilegible

- **`styleUrl` o `styleUrls`**: casi todas las capturas muestran `styleUrl: './app.component.css'`, que es lo de Angular 17 en adelante. En 3 capturas se lee `styleUrls` sin corchetes. Seguramente es un error de lectura; lo correcto es `styleUrl`.
- **El `flex` de `.cab`**: al principio está activo (`0 0 30%`). En las últimas capturas aparece comentado, pero en otras de los mismos minutos se lee activo. No se sabe con seguridad cómo quedó.
- **Texto pequeño en el navegador** (25:00): una lectura dice "Estado actual: DESENCHUFADO". En el código siempre pone "Estado conexión eléctrica: ...", así que se da por buena esta última.
- Una captura (27:20) muestra `class="estado""` con una comilla de más, mientras se escribía. Se corrige justo después.
- `estadoLampara` está declarada pero todavía no se usa. Por el enunciado, corresponde a "Último estado recibido", que el hijo enviará al padre más adelante, con toda probabilidad con `output()`.
- La plantilla y el CSS de `LamparaComponent` no se tocan: solo se ve "lampara works!".
- Hay capturas borrosas o tapadas: 24:06-24:07 por la compresión del vídeo y 22:59 por una ventana emergente de Lenovo Smart Key. No aportan código nuevo.
