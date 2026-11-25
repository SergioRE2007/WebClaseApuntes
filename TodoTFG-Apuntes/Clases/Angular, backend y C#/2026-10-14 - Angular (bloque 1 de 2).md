# Clase del 2026-10-14 (bloque 1 de 2) · Angular

# Clase 14/10 · Proyecto Lámpara (bloque 1 de 2): componente padre e hijo y maquetación con Flexbox

## 1. Qué se explicó, en orden

| Minuto | Qué se hizo |
|---|---|
| 00:00 | En un proyecto Angular nuevo (`proj-lamp`, VS Code sobre WSL Ubuntu) se genera el componente hijo con `ng g c --skip-tests components/lampara`. Se ven en el autocompletado los flags `--skip-import`, `--skip-selector` y `--skip-tests`. |
| 01:13 | Repaso de la estructura del proyecto standalone: `main.ts`, `index.html`, `styles.css`, `app.component.*`, `app.config.ts`, `app.routes.ts` y la carpeta nueva `components/lampara` con sus `.ts`, `.html` y `.css`. |
| 01:24 | `src/index.html`: la etiqueta `<app-root>`, que es donde se monta la aplicación, y `<base href="/">`. |
| 01:33 | Se borra la plantilla de ejemplo de `app.component.html` (el placeholder del CLI, con un `<style>` y variables CSS en `:host`). Queda solo `Comp padre` y `<app-lampara></app-lampara>`. |
| 02:11 | `ng serve -o`. Se ve el aviso de HMR ("Component HMR has been enabled"). En el navegador, en `localhost:4200`, sale "Comp padre" y "lampara works!". |
| 02:21 | Aviso del compilador `TS-998113: RouterOutlet is not used within the template of AppComponent`, que sale porque `RouterOutlet` está en `imports` pero no se usa en la plantilla. |
| 02:26 | Los scripts de `package.json` (`ng`, `start`, `build`, `watch`, `test`), el botón "Run Script" de VS Code y `npm run test`, que lanza `ng test` (Karma, puerto 9876). |
| 03:03 | Se cambia el script `start`, primero a `ng serve -o --host 0.0.0.0 --port 4300` y al final a `ng serve -o`. |
| 03:48 | `app.component.ts`: un componente standalone que importa `LamparaComponent` en `imports` para poder usar su selector. |
| 06:12 | `app.component.css`: `:host` con `display: flex`, `flex-direction: column` y `min-height: 100vh`. |
| 07:24 | En la plantilla, "Comp padre" se mete en un `<div class="cab">`. En el CSS, `.cab` (primero escrito sin punto y corregido en el min. 08:54) lleva `background-color: blue` y `flex: 0 0 30%`. |
| 09:34 | Se le da estilo al hijo desde el CSS del padre con el selector de elemento `app-lampara`: `flex: 1` y `background-color: chartreuse`. |
| 11:02 | Se consulta la **Guía6_Flexbox** del temario: `flex-grow`, `flex-shrink`, `flex-basis`, la forma abreviada `flex` y la columna lateral fija `flex: 0 0 250px`. |
| 12:02 | Chrome DevTools: los atributos `_ngcontent-ng-c…` y `_nghost-ng-c…`, y que `.cab` se convierte en `.cab[_ngcontent-…]` (encapsulación de estilos). Se ve `ng-version="19.2.25"`. Modo responsive a 400 × 543. |
| 12:37 | Guía6: Flexbox dentro de Flexbox (árbol `app-layout` → `header` / `body` → `sidebar` / `content`), tarjetas `flex: 1 1 250px` y diseño adaptable. |
| 13:41 | Pruebas en vivo: `flex: 30%`, `flex: 0 0 250px` (vista Mobile S 320px, `div.cab` de 384 × 250) y vuelta a `flex: 0 0 30%`. |
| 15:30 | Comparación entre `min-height: 100vh` y `height: 100vh` en `:host`. Se queda `height: 100vh`. |
| 16:08 | `src/styles.css` (estilos globales): se prueba `body { min-height: 100vh }`, `height: 100vh` y `height: 100%`, con el autocompletado de `vh`, `dvh`, `lvh` y `svh`. Se ve en la terminal "Stylesheet update sent to client(s)". Al final se borra la regla y `styles.css` queda solo con el comentario. |
| 17:43–18:30 | Estado final: `app.component.css` con `:host`, `.cab` y `app-lampara`, y `styles.css` vacío. |

## 2. Conceptos y patrones

- **Angular CLI:** `ng g c <ruta>` crea un componente en su propia carpeta (`components/lampara`) y `--skip-tests` no genera el `.spec.ts`. El componente nuevo trae la plantilla por defecto `<p>lampara works!</p>`.
- **Componente standalone:** para usar un hijo, se importa en el array `imports` del `@Component` del padre y se escribe su selector como etiqueta (`<app-lampara>`).
- **Aviso TS-998113:** si importas algo en `imports` y no lo usas en la plantilla (aquí `RouterOutlet`), el compilador avisa.
- **Encapsulación de estilos:** el CSS de un componente solo afecta a ese componente. Angular lo consigue añadiendo atributos `_ngcontent-*` (a los elementos de la plantilla) y `_nghost-*` (al elemento host), que se ven en DevTools.
- **`:host`:** sirve para dar estilo al propio elemento del componente (`<app-root>`). Aquí lo convierte en un contenedor flex en columna que ocupa toda la ventana.
- **Dar estilo al hijo desde el padre:** se usa el selector de elemento `app-lampara { flex: 1 }`. Funciona porque la etiqueta `<app-lampara>` forma parte de la plantilla del padre.
- **Flexbox:**
  - `flex: grow shrink basis`.
  - `flex: 0 0 30%` o `flex: 0 0 250px` es un bloque fijo que ni crece ni se encoge.
  - `flex: 1` ocupa el espacio que sobra.
  - `flex: 1 1 250px` sirve para tarjetas adaptables.
  - Un elemento puede ser a la vez *flex item* y *flex container*.
- **`height` y `min-height` con `vh`:** para que `flex-basis` en % y `flex: 1` repartan el alto, el contenedor necesita una altura definida.
- **Estilos globales y estilos de componente:** `src/styles.css` vale para toda la app y `app.component.css` solo para el componente.
- **Servidor de desarrollo:** `ng serve -o` recarga en caliente al guardar ("Component update sent to client(s)" y "Stylesheet update sent").
- **Scripts de npm:** `npm start` equivale a `ng serve`, y `npm run test` a `ng test`.

## 3. Código del profesor (reconstruido)

**Comando**
```bash
ng g c --skip-tests components/lampara
# CREATE src/app/components/lampara/lampara.component.css (0 bytes)
# CREATE src/app/components/lampara/lampara.component.html (22 bytes)
# CREATE src/app/components/lampara/lampara.component.ts (218 bytes)
ng serve -o
```

**app.component.ts**
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
}
```

**app.component.html**
```html
<div class="cab">
  Comp padre
</div>
<app-lampara></app-lampara>
```

**app.component.css (estado final)**
```css
:host {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.cab {
  background-color: blue;
  flex: 0 0 30%;
}

app-lampara {
  background-color: chartreuse;
  flex: 1;
}
```

**package.json (scripts)**
```json
"scripts": {
  "ng": "ng",
  "start": "ng serve -o",
  "build": "ng build",
  "watch": "ng build --watch --configuration development",
  "test": "ng test"
}
```
Variante que se probó: `"start": "ng serve -o --host 0.0.0.0 --port 4300"`.

**Guía6_Flexbox (temario)**
```css
.content { flex: 1; }
.sidebar { flex: 0 0 250px; }
.card    { flex: 1 1 250px; }
```

**Lo que ve DevTools**
```html
<app-root ng-version="19.2.25" _nghost-ng-c3538846781>
  <div _ngcontent-ng-c3538846781 class="cab">Comp padre</div>
  <app-lampara _ngcontent-ng-c3538846781>…</app-lampara>
```
```css
.cab[_ngcontent-ng-c3538846781] { background-color: blue; flex: 0 0 250px; }
```

## 4. Librerías, comandos y versiones

- **Angular 19.2.25** (sale en `ng-version`). El componente usa `styleUrl` y la estructura de `app.component.*`, la propia de Angular 19.
- **Angular CLI:** `ng g c`, `ng serve -o`, `--host`, `--port`, `ng build --watch --configuration development` y `ng test`.
- **Karma** para `ng test` (puerto 9876).
- **`@angular/core`** (`Component`) y **`@angular/router`** (`RouterOutlet`).
- **Herramientas:** VS Code con WSL (Ubuntu 26.04), Prettier, Git Graph y Chrome DevTools (Elements, Styles, Computed y modo responsive).

## 5. Dudoso o ilegible

- **`display: flex` en `:host`:** en algunas capturas no aparece (en otras sí), probablemente porque la línea quedaba fuera de pantalla o se estaba editando. Lo que más se repite, y lo que queda al final, es que sí está.
- **`display: flex` en `.cab`:** se añadió hacia el min. 09:15 y se quitó en el 11:51.
- **Valores de `flex` en `.cab`:** se probaron varios a medio escribir (`flex: 0 0 3…`, `flex: 0 0 30` sin `%`, `flex: 30%`). El definitivo es `flex: 0 0 30%`.
- **`min-height` o `height` en `:host`:** se fue cambiando entre `min-height: 100vh` y `height: 100vh`. En las últimas capturas queda `height: 100vh`.
- **`styles.css`:** se probaron varias reglas `body` y al final se dejó solo con el comentario del CLI. No está claro qué quería demostrar el profesor con eso: probablemente que no hace falta tocar el `body` si `:host` ya usa `100vh`.
- **Script `start`:** la versión con `--host 0.0.0.0 --port 4300` se vio poco tiempo y luego se volvió a `ng serve -o`. No se sabe si se guardó.
- **Plantilla del hijo:** de `lampara.component.html` y `.ts` solo se ve el resultado ("lampara works!"). En este bloque no se editan.
