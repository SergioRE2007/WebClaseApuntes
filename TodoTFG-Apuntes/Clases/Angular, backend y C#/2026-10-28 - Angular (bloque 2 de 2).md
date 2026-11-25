# Clase del 2026-10-28 (bloque 2 de 2) · Angular

# Angular: servicio con HttpClient (Act 8) y arranque de la Act 9 (catálogo de videojuegos)

## 1. Qué se explicó, en orden

**Parte 2 (vídeo "28-10 SERVICIOS INJECT PARTE 2")**
- **~20:32-20:56**: el profesor enseña cómo va el proyecto `proj-fakestore` en `localhost:4200`. Los títulos de los productos de la Fake Store API salen todos seguidos en una sola línea, porque el `@for` no tiene etiquetas de maquetación. Abre las DevTools de Chrome (Sources, con el árbol `src/app`, y la extensión Angular DevTools) para ver el código que se ejecuta.
- **~21:01-21:05**: repaso del documento de la actividad *"Actividad — Catálogo de productos con un Service"*.
  - Apartado 10, crear `getProducts()` con `this.http.get<Product[]>(this.apiUrl)` (en el documento, el `get` es un hueco que hay que rellenar).
  - Apartado 11, qué devuelve de verdad el servicio: un `Observable<Product[]>` y no un array, porque la petición HTTP tarda en llegar.
- **~21:29**: `AppComponent` en VS Code.
  - Inyección del servicio con `inject()` ("inyección por función"). La inyección por constructor queda comentada como alternativa.
  - En `ngOnInit` se llama a `getProducts().subscribe(...)`, con un `console.log` y la asignación a `this.products`.
  - Se enseña el tooltip con la firma de `subscribe` (`Partial<Observer<Product[]>>` o callback, que devuelve `Subscription`).
- **~22:34-23:22**: se mejora la plantilla.
  - `@for (...; track product.id)` y un `<br/>` para que salga un producto por línea.
  - Después se añade el precio: `{{ product.title }}, precio {{ product.price }}`.
  - Mientras escribe se ven los errores del Angular Language Service (subrayado rojo y contador de errores) y el autocompletado de las propiedades del modelo (`category`, `id`, `price`, `title`).
  - En el navegador queda una línea por producto, con el formato "título, precio X €".
- **~23:33-24:50**: sigue el repaso del documento.
  - Apartado 13: `ngOnInit` con `subscribe` para guardar los productos.
  - Flujo completo: `ngOnInit()` → `productService.getProducts()` → `HttpClient` → Fake Store API → `Observable<Product[]>` → `subscribe(...)` → `this.products`.
  - Apartado 14: mostrar los productos con `<h1>`/`<h2>` y un `@for` con `<article>`.
  - Diagrama de responsabilidades: `AppComponent` → `ProductService` → API.
  - Apartado 17: preguntas finales.
- **~24:59-26:38**: apartado 18, "Ampliación sencilla".
  - Se añade `image: string` a la interfaz `Product` y se muestra con `[src]`/`[alt]`.
  - CSS para que las imágenes no salgan enormes (`object-fit: contain`).
  - Antes se comprueba en Postman que el campo `image` es una URL que devuelve una imagen (ver la parte de backend).
  - En el documento, el profesor escribe un `src=""` estático junto a `[src]`, seguramente para comparar un atributo normal con el property binding.
- **~27:32-28:33**: Google Classroom (2627 Acceso a Datos).
  - La **Act 8 — Catálogo de productos con un Service** está publicada (0 de 21 entregadas).
  - La **Act 9 — Catálogo de videojuegos con Angular Service** está en borrador, con el adjunto `Actividad_Catalogo_Videojuegos_Angular_JSONServer`.
  - Aparece el "Test Angular 19 - Componentes, comunicación y I…".

**Parte 3 (vídeo "28-10 PARTE 3")**
- **~00:13-01:06**: se crea un proyecto nuevo con `ng new proj-game`, con CSS y sin SSR/SSG. Se ven los archivos generados (`app.config.ts`, `app.routes.ts`, `app.component.ts`, standalone) y git se inicializa solo.
- **~01:25-02:00**: se abre `proj-game` en VS Code sobre WSL. Sale el aviso de Restricted Mode y hay que darle a "Trust Folder & Continue" para poder abrir la terminal.
- **~02:21-02:42**: revisión del `package.json` (dependencies y devDependencies de Angular 19.2).
- **~02:47-04:23**: preparación de JSON Server según el documento de la Act 9.
  - `npm install --save-dev json-server@0.17.4`. El documento dice expresamente que se use "la versión clásica".
  - npm avisa de un paquete obsoleto (`connect-pause`) y de 30 vulnerabilidades, con las sugerencias de `npm audit fix`.
  - En `devDependencies` aparece `"json-server": "^0.17.4"`.
  - Se crea `db.json` en la raíz del proyecto y se pega la colección `games` (15 juegos).
- A partir de ~04:27, arranque de la API falsa y pruebas con Postman (ver la parte de backend).

## 2. Conceptos y patrones
- **Separar responsabilidades**: el componente muestra la información y gestiona la interfaz, y el servicio obtiene los datos y habla con la API por HTTP.
- **Inyección de dependencias**: `inject(ProductService)` en un campo (la forma preferida) o por constructor con `private`. El profesor comenta que, en la del constructor, el modificador de visibilidad del parámetro es importante.
- **HttpClient tipado**: `get<Product[]>(url)`. Necesita `provideHttpClient()` en `app.config.ts`; una de las preguntas finales es qué pasa si se quita esa línea.
- **Observable**: es una respuesta que llega más tarde ("cuando lleguen los productos, avísame y entrégame el array"). Se consume con `subscribe` y una callback.
- **Ciclo de vida**: los datos se cargan en `ngOnInit` (con `implements OnInit`).
- **Control de flujo `@for` con `track product.id`**, e interpolación `{{ }}` de varias propiedades en la misma línea.
- **Property binding**: `[src]` y `[alt]` frente a un atributo estático `src="..."`.
- **Modelo con interfaz TypeScript**: `Product` en `../models/product`.
- **Herramientas**: el Angular Language Service, que comprueba la plantilla y autocompleta las propiedades del componente y del modelo, y la depuración con DevTools (Sources, Scope, Call Stack).
- **Rangos semver** en `package.json`: `^` frente a `~`, y la diferencia entre `dependencies` y `devDependencies`.
- **JSON Server** como backend falso para programar el cliente Angular antes de tener la API real (Act 9).

## 3. Código de ejemplo del profesor (reconstruido)

**Servicio** (`product.service.ts`; el cuerpo exacto no se ve en pantalla y sale del documento):
```ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = 'https://fakestoreapi.com/products';

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }
}
```
[dudoso] No se ve cómo se inyecta `HttpClient`: puede ser con `inject()` o por constructor. El valor de `apiUrl` está cortado; la URL `https://fakestoreapi.com/products` es una suposición.

**Componente** (`app.component.ts`, visto en VS Code):
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

  title = '...';
}
```

**Plantilla en clase** (`app.component.html`, versión final):
```html
@for( product of this.products; track product.id) {
{{ product.title}}, precio {{ product.price}}
<br/>
}
```

**Plantilla propuesta en el documento** (apartado 14, con huecos para rellenar):
```html
<h1>Fake Store</h1>
<h2>Catálogo de productos</h2>

@for (product of products; track product.id) {
  <article>
    <h3> ______ </h3>
    <p> ______ (Categoría:) </p>
    <p> ... </p>   <!-- [ilegible] -->
  </article>
}
```

**Ampliación** (apartado 18):
```ts
export interface Product {
  id: number;
  title: string;
  price: number;
  category: string;
  image: string;
}
```
```html
<img
  [src]="product.image"
  [alt]="product.title"
>
```
```css
img {
  width: 100px;
  height: 120px;
  object-fit: contain;
}
```

**Preguntas finales** (apartado 17):
- ¿Por qué se crea `ProductService` en vez de hacer la petición desde `AppComponent`?
- ¿Qué función tiene `HttpClient`?
- ¿Qué devuelve `getProducts()`?
- ¿Para qué se usa `subscribe()`?
- ¿Dónde se guardan al final los productos?
- ¿Qué pasaría si se quitara `provideHttpClient()`?

**Act 9**: `db.json` en la raíz de `proj-game` (extracto):
```json
{
  "games": [
    { "id": 1, "title": "Pixel Runner", "genre": "Platform", "platform": "PC", "price": 14.99 },
    { "id": 2, "title": "Space Colony", "genre": "Strategy", "platform": "PC", "price": 29.99 },
    { "id": 3, "title": "Neon Racer", "genre": "Racing", "platform": "PlayStation", "price": 39.99 },
    { "id": 4, "title": "Dungeon Quest", "...": "..." },
    { "id": 14, "title": "Pro Basketball", "genre": "Sports", "platform": "PlayStation", "price": 49.99 },
    { "id": 15, "title": "Robot Factory", "genre": "Simulation", "platform": "PC", "price": 21.99 }
  ]
}
```
El archivo tiene unas 110 líneas, así que serían 15 juegos. No se leen los juegos del 5 al 13.

## 4. Librerías, comandos y versiones
- `ng new proj-game`: respuestas **CSS** y **No** a SSR/SSG. Crea un proyecto standalone, sin NgModule.
- `package.json` de `proj-game`:
  - Paquetes de Angular: `@angular/platform-browser`, `platform-browser-dynamic`, `router` y `compiler-cli` en `^19.2.0`.
  - Herramientas del CLI: `@angular/cli` y `@angular-devkit/build-angular` en `^19.2.27`.
  - Otras dependencias: `rxjs ~7.8.0`, `tslib ^2.3.0`, `zone.js ~0.15.0` y `typescript ~5.7.2`.
  - Pruebas: `@types/jasmine ~5.1.0`, `jasmine-core ~5.6.0`, `karma ~6.4.0`, `karma-chrome-launcher ~3.2.0`, `karma-coverage ~2.2.0`, `karma-jasmine ~5.1.0` y `karma-jasmine-html-reporter ~2.1.0`.
- `npm install --save-dev json-server@0.17.4`: queda guardado como `^0.17.4`.
- Mensajes de npm al instalar:
  - `npm warn deprecated connect-pause@0.1.1`.
  - 30 vulnerabilidades (2 low, 12 moderate, 14 high y 2 critical).
  - Sugerencias de `npm audit fix` y `npm audit fix --force`; la segunda puede romper cosas.
- `@angular/common/http` (`HttpClient`, `provideHttpClient`) y `rxjs` (`Observable`, `Observer`, `Subscription`).
- Entorno del profesor: VS Code sobre WSL (Ubuntu), GitLens, Angular Language Service, Angular DevTools, Google Docs y Classroom.

## 5. Lo dudoso o ilegible
- El código de `product.service.ts` no llega a verse en pantalla. Lo de arriba sale del documento de la actividad.
- La firma exacta de `ngOnInit` está cortada en pantalla. Por el `implements OnInit`, sería `ngOnInit(): void`.
- En una captura, `@angular/cli` sale como `~19.2.27`, y en el resto como `^19.2.27`.
- La versión de WSL pone "Ubuntu-26.04" en todas las capturas; puede ser un error de lectura.
- En una captura, un juego sale con `"platform": "Pc"` en vez de `"PC"`. Seguramente es un error de lectura.
- Para qué servía el `src=""` estático que el profesor escribió en el documento es una interpretación: no se ve que lo explique.
