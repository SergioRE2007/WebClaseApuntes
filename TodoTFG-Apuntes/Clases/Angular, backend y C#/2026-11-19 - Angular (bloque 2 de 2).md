# Clase del 2026-11-19 (bloque 2 de 2) · Angular

# Clase 19-11 · Angular Router (bloque 2 de 2)

Proyecto de clase: `proyecto-rutas` (VS Code sobre WSL Ubuntu, rama `master`). Es un "Portal educativo" con las páginas Inicio, Aula y Ayuda, y dentro de Aula las rutas hijas Materiales y Avisos. Se sigue el documento de Google Docs **Actividad_Rutas_Parametros_Redirecciones_LazyLoading**, que es la tarea "Act 12" de Classroom.

## 1. Qué se explicó, en orden

| Minuto | Qué se hizo |
|---|---|
| 24:14 – 25:33 | Plantilla de `AulaComponent` con un `<nav>` de enlaces **relativos** (`routerLink="materiales"`, `routerLink="avisos"`) y un **segundo `<router-outlet />`** para las rutas hijas. El editor marca error porque el componente no importa las directivas. Se arregla con `import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router'` y metiéndolas en `imports: [...]` del `@Component`. |
| 25:41 – 27:06 | La regla `a { margin-left: 1rem; }` sale de `app.component.css` y pasa a **`src/styles.css`**, la hoja de estilos global. Se repasa la estructura del proyecto: `pages/`, `app.routes.ts`, `app.config.ts`, `main.ts` y `styles.css`. |
| 26:05 – 26:32 | En el navegador, `/aula` y `/aula/avisos`: el texto "avisos works!" sale **dentro** de la página Aula. |
| 27:18 – 27:29 | Repaso del documento: 3.1 rutas en `app.routes.ts`, 3.2 menú con `routerLink`, 3.3 redirección desde la ruta vacía y la lista de tareas (routerLinkActive, `/` → `/inicio`, `/portal` → `/aula`, comodín `**` con `NoEncontradoComponent`, y las redirecciones antes del comodín). |
| 28:04 – 29:24 | **`routerLinkActive="class-css-activo"`** en los dos enlaces del aula y `.class-css-activo { color: yellow; }` en `styles.css`. El tooltip del IDE muestra el tipo `routerLinkActive: string \| string[]`. |
| 29:42 – 30:04 | En el navegador, el enlace de la ruta actual (Avisos o Materiales) sale en amarillo. |
| 30:41 – 31:50 | **`routerLinkActiveOptions`**. Escrito como atributo de texto da el error **ngtsc(2322)**: *Type 'string' is not assignable to type '{ exact: boolean; } \| IsActiveMatchOptions'*. Se corrige con un **property binding**: `[routerLinkActiveOptions]="{exact: true}"`. De paso, el autocompletado enseña `RouterLinkWithHref`, que no se llega a usar. |
| 32:00 – 33:06 | `app.routes.ts` completo: redirección de `''`, la ruta `aula` con `children` y un comentario con la URL final de cada hija. Se aplica `exact: true` a los dos enlaces del aula. |
| 33:46 – 34:17 | En el menú principal (`app.component.html`) se añade un enlace **absoluto** a una ruta hija: `routerLink="/aula/materiales"` con el texto "Aula > Materiales". |
| 35:57 – 36:25 | Classroom: tarea **"Act 12 - Rutas Parametros Redirecciones LazyLoading"** (tema "3. angular II", 100 puntos, sin fecha de entrega). Instrucción: *"Añade un excalidraw explicativo de configuración rutas hasta rutas children."* Adjuntos: el documento y la imagen "Resumen visual de rutas en Angular.png". |
| 36:33 – 37:09 | Repaso del documento: objetivos, árbol de rutas, URLs de ejemplo con query params y la **Fase III, parámetros de ruta** (`materiales/:id`, enlaces con `[routerLink]` en forma de array). |
| 37:14 – 42:44 | Experimento: se comenta la hija `avisos` dentro de `children` y se declara en la raíz una ruta con path compuesto, `{ path: 'aula/avisos', component: AvisosComponent }`. El autocompletado de `Route` enseña `component` y `loadComponent`. En el menú principal se añade `<a routerLink="/aula/avisos">`. Sirve para comparar una ruta hija con una ruta plana que tiene la misma URL. |
| 44:38 – 47:25 | Demo de la solución desplegada en **Vercel** (`proj-routes.vercel.app`): `vercel login` con código de dispositivo y `vercel project ls`. La solución tiene enlaces "Materiales (asc)" y "Materiales (desc)" (query params) y el detalle `/aula/materiales/:id`, que lee el id de dos formas (**snapshot** y **observable**). En 4.2 y 4.3 del documento: el segundo `router-outlet` y la redirección por defecto dentro de `children`. |
| 49:17 – 49:30 | Navegación desde código: `router = inject(Router)` y `this.router.navigate(['/inicio'])` dentro de `ngOnInit()` del `AppComponent`. |

## 2. Conceptos y patrones

- **Componentes standalone:** cada directiva del router que se usa en la plantilla (`RouterOutlet`, `RouterLink`, `RouterLinkActive`) tiene que estar en el `imports` del `@Component`. Si falta, el editor da error en la plantilla.
- **Rutas hijas (`children`):** el componente padre (`AulaComponent`) tiene su propio `<router-outlet />`. El outlet de `AppComponent` pinta Aula, y el de Aula pinta Materiales o Avisos. La URL final se forma con el path del padre más el de la hija (`/aula/materiales`).
- **`routerLink` relativo y absoluto:**
  - Relativo (`"materiales"`): cuelga de la ruta actual. Es el que se usa dentro de Aula.
  - Absoluto (`"/aula/materiales"`): empieza en la raíz. Es el que se usa en el menú principal.
- **`routerLinkActive`:** añade una clase CSS al enlace cuando su ruta está activa. Acepta `string | string[]`. La clase va en `styles.css` porque es global.
- **`routerLinkActiveOptions`:** con `{exact: true}`, el enlace solo se marca si la URL coincide entera. Es un objeto, así que hay que pasarlo con **corchetes** (property binding). Si se escribe como atributo normal, llega como texto y sale el error ngtsc 2322.
- **Estilos globales y de componente:** `src/styles.css` afecta a toda la app. `app.component.css` solo afecta a su componente.
- **Redirecciones:** `redirectTo` con `pathMatch: 'full'` en la ruta vacía. Dentro de `children` también se puede redirigir `''` a `'materiales'`. Las redirecciones van **antes** de la ruta comodín `**`.
- **Ruta con path compuesto y ruta hija:** `'aula/avisos'` declarada en la raíz responde a la misma URL que la hija, pero no está dentro de `AulaComponent`. Por lo que sale en pantalla, se pintaría en el outlet principal, sin la cabecera del aula; el resultado en el navegador no llega a verse claro.
- **Parámetros de ruta:** el segmento dinámico `:id` y los enlaces con array de segmentos, `[routerLink]="['/aula/materiales', 1]"`.
- **`snapshot` y observable:**
  - Lo que pasa en la demo: al ir de `/aula/materiales/1` a `/aula/materiales/7`, Angular reutiliza el componente. El snapshot sigue diciendo 1 y el observable dice 7.
  - Conclusión: si se puede navegar entre detalles sin salir del componente, el parámetro se lee con el observable.
- **Query params:** URLs como `/aula/materiales?orden=asc` y `?orden=desc&tipo=pdf`. La solución muestra "Material order asc" (snapshot) y "Material order observable asc".
- **Navegación desde código:** `inject(Router)` y `router.navigate([...])`.
- **Objetivos de la actividad:** `Routes`, `provideRouter`, `routerLink`, `router-outlet`, `routerLinkActive`, `children`, `ActivatedRoute`, `redirectTo`, `pathMatch`, comodín, **lazy loading con `loadComponent` y `loadChildren`**, y comprobar la carga en la pestaña **Network** de las herramientas del navegador.

## 3. Código de ejemplo del profesor (reconstruido)

**`app.routes.ts`** (32:23, versión con hijas):
```ts
import { Routes } from '@angular/router';
import { InicioComponent } from './pages/inicio/inicio.component';
import { AulaComponent } from './pages/aula/aula.component';
import { AyudaComponent } from './pages/ayuda/ayuda.component';
import { MaterialesComponent } from './pages/aula/materiales/materiales.component';
import { AvisosComponent } from './pages/aula/avisos/avisos.component';

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

Variante del experimento (38:49 – 42:05). La hija `avisos` queda comentada y se añade en la raíz:
```ts
  { path: 'inicio', component: InicioComponent },
  { path: 'aula/avisos', component: AvisosComponent },
  { path: 'aula', component: AulaComponent,
    children: [
      { path: 'materiales', component: MaterialesComponent },
      //{ path: 'avisos', component: AvisosComponent }
    ]
  },
```

**`aula.component.ts`**:
```ts
import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-aula',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './aula.component.html',
  styleUrl: './aula.component.css'
})
export class AulaComponent {}
```

**`aula.component.html`** (versión final, 33:46):
```html
<p>aula works!</p>
<h2>Aula virtual</h2>
<nav>
  <a routerLinkActive="class-css-activo" [routerLinkActiveOptions]="{exact: true}" routerLink="materiales">Materiales</a>
  <a routerLinkActive="class-css-activo" [routerLinkActiveOptions]="{exact: true}" routerLink="avisos">Avisos</a>
</nav>
<hr>
<router-outlet />
```

**`styles.css`** (global):
```css
a {
  margin-left: 1rem;
}
.class-css-activo {
  color: yellow;
}
```

**`app.component.html`** (menú principal, hacia 42:44):
```html
<h1>Portal educativo</h1>
<nav>
  <a routerLink="/inicio">Inicio</a>
  <a routerLink="/aula">Aula</a>
  <a routerLink="/aula/materiales">Aula > Materiales</a>
  <a routerLink="/aula/avisos">Aula > Materiales</a>
  <a routerLink="/ayuda">Ayuda</a>
</nav>
<hr>
<router-outlet />
```
El texto del enlace de avisos se quedó como "Aula > Materiales" en la última captura; seguramente lo cambió después [dudoso].

**`app.component.ts`** (49:17):
```ts
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterOutlet, RouterLink, RouterLinkActive /* , Router [dudoso] */ } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'proyecto-rutas';
  router = inject(Router);
  ngOnInit() {
    //Id que no exist... [comentario cortado]
    this.router.navigate(['/inicio']);
  }
}
```

**Documento de la actividad: parámetros de ruta (5.1 y 5.2)**:
```ts
{ path: 'materiales/:id', component: DetalleMaterialComponent }
```
```html
<!-- materiales.component.html -->
<h3>Materiales disponibles</h3>
<a [routerLink]="['/aula/materiales', 1]">Material 1</a>
<a [routerLink]="['/aula/materiales', 7]">Material 7</a>
```

**Documento: redirección por defecto dentro de `children` (4.3)**:
```ts
{ path: '', redirectTo: 'materiales', pathMatch: 'full' }  // 'full' [dudoso, cortado]
```

**Documento: tareas de la fase de redirecciones** (texto):
1. `routerLinkActive` en el menú.
2. Redirección `/` → `/inicio`.
3. Redirección `/portal` → `/aula`.
4. Ruta `**` que muestra `NoEncontradoComponent`.
5. Redirecciones definidas antes del comodín.

## 4. Librerías, comandos y versiones

- `@angular/core`: `Component`, `inject`.
- `@angular/router`: `Routes`, `Route` (`component`, `loadComponent`), `RouterOutlet`, `RouterLink`, `RouterLinkActive`, `IsActiveMatchOptions`, `Router`, `ActivatedRoute`. Aparecen en el autocompletado, sin usarse: `RouterLinkWithHref`, `RouterHashLocationFeature` y `ROUTER_INITIALIZER`.
- Compilador de plantillas `ngtsc`, error 2322.
- Angular CLI: `ng new proyecto-rutas`, que crea `src/app/app.routes.ts` (77 bytes) e inicializa git.
- **Vercel CLI 66.2.0**: `vercel login` (código de dispositivo y correo de verificación) y `vercel project ls` (proyectos `proj-routes` y `proj-game`, runtime Node 26.x). En la autorización aparece Node.js v24.22.1.
- Servidor de desarrollo en `localhost:4200`. Solución desplegada en `https://proj-routes.vercel.app`.
- Herramientas que se citan: Excalidraw (para el diagrama de la entrega) y la pestaña Network del navegador.

## 5. Lo dudoso o ilegible

- **Captura de 31:34:** parece que `routerLinkActiveOptions="{exact: true}"` sin corchetes ya no daba error. No es lógico, porque seguiría llegando como texto. Justo después lo escribe con `[ ]`, que es la forma correcta; esa es la versión que vale.
- **`Router` en el `app.component.ts` de 49:17:** no se ve en la línea de import (sale `ActivatedRoute` y la línea está cortada) y el editor marca 2 errores. Puede que todavía faltara importarlo.
- **Ruta plana `aula/avisos`:** en ninguna captura del navegador se ve qué pinta. Lo de que se renderiza fuera de la cabecera del aula es una deducción.
- **Componente de detalle y query params:** solo se ven en la solución desplegada ("Material id snapshot / observable", "Material order asc / observable asc"). No se ve su código, pero apunta a `ActivatedRoute.snapshot.paramMap` / `queryParamMap` y a `paramMap` / `queryParamMap` como observables.
- **Números de los enlaces del documento:** en una captura se lee `['/aula/materiales', 5]` con el texto "Material 1". Lo que se repite en las demás es 1 y 7.
- **Texto de prueba:** la línea `sdfasdfasf` de `aula.component.html` es texto de prueba y no tiene importancia.
- **Comentario del final:** `//Id que no exist...` está cortado, así que su contenido es ilegible.
- **Captura img239:** no existe; hay un salto entre 42:44 y 44:38.
