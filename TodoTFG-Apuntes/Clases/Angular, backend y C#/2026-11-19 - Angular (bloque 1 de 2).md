# Clase del 2026-11-19 (bloque 1 de 2) · Angular

# Clase 19-11 · Angular Router (bloque 1 de 2, min 0-24)

Proyecto de trabajo: `proyecto-rutas` (Angular standalone, VS Code con WSL Ubuntu, rama `master`). Se sigue el enunciado de Google Docs **"Actividad_Rutas_Parametros_Redirecciones_LazyLoading"** (un "Portal educativo").

## 1. Qué se explicó, en orden

| Min | Tema |
|---|---|
| 00:00-00:40 | Estructura de un proyecto standalone: `app.config.ts`, `app.routes.ts`, `app.component.*`, `main.ts`, `index.html`. |
| 00:34-02:33 | `app.config.ts`: `provideRouter(routes)` dentro de `providers`. Con Excalidraw explica que `routes` se importa de `./app.routes` y que su tipo es `Routes = type Route[]`. |
| 03:00-03:30 | `app.routes.ts`: array `routes: Routes` vacío y primer objeto `{ path, component }`. |
| 03:34-04:24 | Enunciado: objetivos y árbol de rutas que hay que conseguir. Comandos `ng g c` para crear las páginas. |
| 04:24-05:03 | Se generan en la terminal los componentes de `pages/` (inicio, ayuda, no-encontrado, aula, aula/materiales, aula/detalle-material y aula/avisos). |
| 05:03-06:30 | Ruta `inicio` y ruta vacía con `redirectTo: '/inicio'` y `pathMatch: 'full'`. |
| 06:42-07:14 | Edita el enunciado: quita `--standalone --routing` de `ng new`, porque ya vienen por defecto, y añade `--skip-test`. |
| 07:20-08:22 | Fase I del enunciado: declaración de rutas (3.1), navegación desde el componente principal (3.2) y redirección desde la ruta vacía (3.3). |
| 08:59-09:52 | `app.component.html` con `<nav>`, `routerLink` y `<router-outlet />`. Completa las rutas `aula` y `ayuda`. |
| 10:23-10:34 | `ng serve` y prueba en `localhost:4200/inicio` ("inicio works!"). |
| 11:07-11:30 | `app.component.ts`: importa `RouterOutlet`, `RouterLink` y `RouterLinkActive` de `@angular/router` y los añade a `imports` del `@Component`. Mira la documentación del tipo `Route` en el autocompletado. |
| 12:07-13:23 | Los enlaces salen pegados en el navegador (`/aula`), así que añade CSS en `app.component.css` (`a { margin-left: 1rem; }`). |
| 12:53 | Enseña de pasada `crud.component.ts` de otro proyecto (`proyecto-game`, rama `refactor/reactive-form`): un formulario reactivo con `input.required`, `output` y `ngOnChanges` + `patchValue`. |
| 13:50-17:33 | Pizarra Excalidraw sobre el código: **en `app.routes.ts` el `path` va "sin barra de raíz /"**, mientras que `routerLink` lleva `/`. Une con flechas cada `routerLink` con su `path` y anota: "En este tag de router-outlet se carga el componente asociado a la ruta". |
| 18:20 | Vistazo a la Fase VI del enunciado (lazy loading con `loadChildren`, `AULA_ROUTES`). |
| 19:12-19:30 | Fase II del enunciado: rutas hijas (`children`) y un segundo `router-outlet`. |
| 20:46-22:48 | Convierte `aula` en ruta padre con `children` (`materiales` y `avisos`) y lo comenta: `// ruta -> /aula/avisos`. |
| 23:42-24:04 | Abre `aula.component.ts` y `aula.component.html` ("aula works!") para meter el menú propio del aula con su `router-outlet` (4.2). Se ve la 4.3: redirección por defecto dentro de `children`. |

## 2. Conceptos y patrones

- **`provideRouter(routes)`** en `appConfig.providers` registra el router en la app standalone (junto a `provideZoneChangeDetection({ eventCoalescing: true })`).
- **`Routes`** es `Route[]`: un array de objetos de configuración de ruta.
- **Ruta básica:** `{ path: 'inicio', component: InicioComponent }`. El componente se importa en `app.routes.ts`.
- **`path` sin barra inicial** (`'inicio'`). La barra va en `routerLink="/inicio"`, que es una URL absoluta desde la raíz.
- **Ruta vacía con redirección:** `{ path: '', redirectTo: '/inicio', pathMatch: 'full' }`. Con `pathMatch: 'full'` solo coincide si la URL entera está vacía. En el enunciado aparece `redirectTo: 'inicio'`, sin barra, y en el código del profesor `'/inicio'`: valen los dos.
- **`routerLink`** sustituye a `href` y navega sin recargar la página (SPA). Acepta `string | any[] | UrlTree | null`, según el tooltip.
- **`<router-outlet />`** es el hueco donde se pinta el componente de la ruta activa.
- **El componente raíz standalone** tiene que importar `RouterOutlet`, `RouterLink` y `RouterLinkActive` en `imports` (`RouterLinkActive` sirve para marcar el enlace activo, aunque en este bloque aún no se usa).
- **Rutas hijas con `children`:** la URL final es la del padre más la del hijo (`/aula/avisos`). El padre (`AulaComponent`) necesita su propio `<router-outlet />` y su menú con `routerLink` relativos (`"materiales"`, sin barra).
- **Redirección por defecto dentro de `children`:** `{ path: '', redirectTo: 'materiales', pathMatch: 'full' }` al principio del array (apartado 4.3, solo se ve en el enunciado).
- **Organización:** una carpeta `pages/` con una subcarpeta por página, y las páginas hijas anidadas dentro de la del padre (`pages/aula/materiales`).
- **CSS por componente:** cada componente tiene su `.css`, y lo que se escribe ahí solo afecta a ese componente.

Objetivos del enunciado completo, que seguramente salen en el bloque 2: `routerLinkActive`, enlaces relativos, `ActivatedRoute` (parámetros de ruta `:id` y query params), `redirectTo`/`pathMatch`, ruta comodín (`no-encontrado`), `loadComponent`/`loadChildren` y comprobar la carga diferida en la pestaña Network de DevTools.

## 3. Código del profesor (reconstruido)

**`app.config.ts`**
```ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes)]
};
```

**`app.routes.ts`** (estado al minuto 22:48)
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
      { path: 'materiales', component: MaterialesComponent },
      // ruta -> /aula/avisos
      { path: 'avisos', component: AvisosComponent }
    ]
  },
  { path: 'ayuda', component: AyudaComponent }
];
```

**`app.component.ts`**
```ts
import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive], // [dudoso] en la captura solo se ve RouterOutlet y el cursor dentro del array
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'proyecto-rutas';
}
```

**`app.component.html`**
```html
<h1>Portal educativo</h1>
<nav>
  <a routerLink="/inicio">Inicio</a>
  <a routerLink="/aula">Aula</a>
  <a routerLink="/ayuda">Ayuda</a>
</nav>
<hr>
<router-outlet />
```

**`app.component.css`**
```css
a {
  margin-left: 1rem;
}
```

**`aula.component.html`** (lo que pide el enunciado en el 4.2; el profesor empieza a escribirlo al final del bloque)
```html
<h2>Aula virtual</h2>
<nav>
  <a routerLink="materiales">Materiales</a>
  <a routerLink="avisos">Avisos</a>
</nav>
<hr>
<router-outlet />
```

**Redirección por defecto en `children`** (4.3 del enunciado)
```ts
{ path: '', redirectTo: 'materiales', pathMatch: 'full' }
```

**Árbol de rutas y URL que pide la actividad**
```
/
├── /inicio
├── /ayuda
└── /aula
    ├── /materiales
    │   └── /materiales/:id
    └── /avisos

/aula/materiales?orden=asc
/aula/materiales?orden=desc&tipo=pdf   [dudoso el segundo parámetro]
/aula/materiales/7
/aula/materiales/12?origen=destacados
```

**Ejemplo suelto de otro proyecto (min 12:53, `proyecto-game`)**: formulario reactivo de edición.
```ts
export class CrudComponent implements OnChanges {
  private gameService = inject(GameService);
  title = new FormControl('', { nonNullable: true, validators: [Validators.required /* ...[dudoso] */] });
  // genre, platform, price, stock con el mismo patrón
  gameFormGroup = new FormGroup({ /* ... */ platform: this.platform, price: this.price, stock: this.stock });
  edit = false;
  editGame = input.required<Game | undefined>();
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editGame']?.currentValue) {
      let game = changes['editGame']?.currentValue;
      this.gameFormGroup.patchValue(game);
      this.edit = true;
    }
  }
  actualizaGames = output<Game>();
  onSaveGame(form: FormGroupDirective) {
    if (form.invalid) { return; }
    // ... [no se ve]
  }
}
```

## 4. Librerías, comandos y versiones

- `@angular/core`: `ApplicationConfig`, `provideZoneChangeDetection`, `Component`.
- `@angular/router`: `provideRouter`, `Routes`, `Route`, `RouterOutlet`, `RouterLink`, `RouterLinkActive` (más adelante `loadChildren` y `ActivatedRoute`).
- Comandos del Angular CLI:
  ```bash
  ng new angular-routing --style=css     # el enunciado decía --standalone --routing; el profesor lo quitó
  cd angular-routing
  ng serve                               # http://localhost:4200
  ng g c pages/inicio --skip-test        # ver el apartado 5 sobre --skip-test
  ng g c pages/ayuda
  ng g c pages/no-encontrado
  ng g c pages/aula
  ng g c pages/aula/materiales
  ng g c pages/aula/detalle-material
  ng g c pages/aula/avisos
  ```
- `ng g c` crea `.ts`, `.html` (con el texto "x works!"), `.css` y `.spec.ts`. Los archivos se llaman `*.component.ts` y las clases `XComponent`, lo que apunta a Angular 19 (el de las guías), aunque no se ve la versión.
- Entorno: VS Code con WSL (Ubuntu-26.04), Excalidraw para anotar el código y Google Docs para el enunciado.

## 5. Dudoso o ilegible

- **`--skip-test`**: así aparece en el documento editado. La opción real del CLI es `--skip-tests` (en plural) y, en cualquier caso, en la terminal los componentes se generaron con `.spec.ts`.
- **`margin: 1 rem`** (con espacio) aparece en una captura intermedia. La versión final es `margin-left: 1rem`.
- El array `imports` de `AppComponent`: no se llega a ver con las tres directivas, solo con `RouterOutlet` y el cursor dentro.
- Al minuto 22:48 una captura muestra `// ruta -> /` encima de `materiales` y el import de `AyudaComponent` como `./pages/aula/ayuda/...`. Las demás capturas dicen `./pages/ayuda/ayuda.component`, así que lo segundo parece un error de lectura, y el comentario estaba a medio escribir.
- En una salida del CLI aparece `pages/aula/materiales/detalle-material`, pero el resto de capturas y el enunciado dicen `pages/aula/detalle-material`.
- La Fase VI (`loadChildren`, `AULA_ROUTES`) se vio muy pequeña: no se puede reconstruir el código.
- La anotación de la pizarra "Aquí como arrancamos ruta raíz puedo ponerla" se refiere a que en `routerLink` se puede poner la ruta absoluta con `/` porque se parte de la raíz. Es una interpretación.
- La captura del Excalidraw exportado (min 01:30) es ilegible.
