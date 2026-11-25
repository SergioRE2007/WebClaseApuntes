# Clase del 2026-10-28 (bloque 1 de 2) · Angular

# Angular: servicios e inyección de dependencias (inject frente a constructor), 28/10, bloque 1

Proyecto **`proj-fakestore`**, abierto en VS Code con WSL (Ubuntu). Es la actividad **"Catálogo de productos con un Service"** (Angular Services y Fake Store API).

## 1. Qué se explicó, en orden

| Minuto | Contenido |
|---|---|
| 11:47 | Documento de la actividad. El flujo es **Componente → pide los productos → ProductService → HTTP GET → Fake Store API** (`GET https://fakestoreapi.com/products`). |
| 11:56 | Pasos 10 y 11 de la actividad: crear el método `getProducts()` en el servicio, con un hueco para rellenar el método de `HttpClient` y el tipo `<Product[]>`. La sección "¿Qué devuelve realmente el Service?" explica que no devuelve el array, sino un Observable. |
| 12:15 – 12:27 | Se genera la interfaz y el servicio con el CLI (`ng g i models/product`, `ng g s services/product`). Se ve `product.service.ts` con `@Injectable({ providedIn: 'root' })` y sus imports. Arranca `ng serve -o`, con el mensaje de HMR activado. |
| 12:35 – 13:07 | La app en `localhost:4200` y las DevTools. La ejecución se para en un breakpoint de `app.component.ts` (pestaña Sources). En la consola aparece el **array de 20 productos** que llega del servicio. |
| 13:30 – 13:53 | Repaso de `AppComponent`: `implements OnInit`, `products?: Product[]`, `ngOnInit()` con `getProducts().subscribe(...)` y el servicio inyectado con `inject(ProductService)`. |
| 14:05 – 15:57 | **Inyección por constructor.** Comenta la línea de `inject()` y escribe `constructor(productService: ProductService) {}`. El editor marca **error TS2339**: *Property 'productService' does not exist on type 'AppComponent'*. Un parámetro de constructor sin modificador no crea una propiedad de la clase, así que `this.productService` no existe. |
| 16:06 | Apuntes de teoría de la unidad **5_Servicios_Inyeccion_Dependencias** (para Angular 19): DI, inyectores, proveedores, `ng generate service`, `@Injectable`, inyección por constructor y `inject()`. |
| 16:32 – 17:45 | Lo arregla con **`constructor(private productService: ProductService) {}`**. El `private` convierte el parámetro en propiedad. Recompila con `ng serve -o` y en la consola vuelven a salir los 20 productos. |
| 18:00 – 18:39 | Deja los comentarios `//Inyección por función` y `//Inyección por constructor, importante el scope de la propiedad en el constructor`. Al final vuelve a usar `inject()` y deja el constructor comentado. |
| 18:47 – 19:17 | Explica el callback del `subscribe` (arrow function que recibe `products` y lo asigna a `this.products`). Con el tooltip, el tipo de `products?` es `Product[] \| undefined`. Repasa los imports y el `@Component` standalone. |
| 19:25 – 20:25 | **Plantilla** `app.component.html`. Borra la plantilla por defecto y escribe `@for (product of this.products; track product.id) { {{ product.title }} }`. El autocompletado del Angular Language Service sugiere `products` e `id: number`. |

## 2. Conceptos y patrones

- **Servicio**: la lógica de datos y HTTP va fuera del componente. El componente solo pide los datos al servicio.
- **`@Injectable({ providedIn: 'root' })`**: el servicio es un singleton para toda la app y no hace falta registrarlo en ningún sitio.
- **Dos formas de inyectar:**
  1. **Por función**: `private productService = inject(ProductService);` como propiedad de la clase. Es la que se queda al final.
  2. **Por constructor**: `constructor(private productService: ProductService) {}`. Hace falta poner `private` (o `public`/`protected`), que en TypeScript se llama *parameter property*. Sin él, el parámetro solo existe dentro del constructor y `this.productService` da **TS2339**. Es lo que quiere decir el comentario "importante el scope de la propiedad en el constructor".
- **`HttpClient` tipado**: `this.http.get<Product[]>(url)` devuelve un **Observable**, no los datos.
- **Ciclo de vida**: `implements OnInit` y `ngOnInit()` como sitio para cargar los datos.
- **`subscribe`**: los datos llegan de forma asíncrona en el callback y se guardan en una propiedad del componente.
- **Propiedad opcional** `products?: Product[]`, de tipo `Product[] | undefined` hasta que llega la respuesta.
- **Componente standalone**: `imports: [RouterOutlet]` dentro de `@Component`.
- **Control flow en la plantilla**: `@for (...; track product.id)`, donde `track` es obligatorio y usa un identificador único, más la interpolación `{{ }}`.
- **Depurar**: `console.log` dentro del `subscribe`, breakpoints en la pestaña Sources de DevTools, y distinguir los mensajes de extensiones del navegador (por ejemplo "Attempting handshake with backend", de `content_script_bundle.js`) de los de la app.

## 3. Código de ejemplo del profesor

`src/app/services/product.service.ts`. Se ven los imports y la cabecera; el cuerpo se reconstruye a partir del documento de la actividad:
```ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../models/product';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);                    // [dudoso] no se ve en las capturas
  private apiUrl = 'https://fakestoreapi.com/products'; // [dudoso] en el documento solo se lee "apiUrl"

  getProducts(): Observable<Product[]> {               // [dudoso] el tipo de retorno
    return this.http.get<Product[]>(this.apiUrl);       // en la actividad, "get" es el hueco que hay que rellenar
  }
}
```

`src/app/app.component.ts`, versión final (se ve bien):
```ts
import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProductService } from './services/product.service';
import { Product } from './models/product';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  products?: Product[];

  //Inyección por función
  private productService = inject(ProductService);

  //Inyección por constructor, importante el scope de la propiedad en el constructor
  //constructor( private productService: ProductService ) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe( products => {
      console.log(products);
      this.products = products;
    });
  }

  title = 'proj-fakestore';
}
```

El fallo que enseñó a propósito:
```ts
constructor( productService: ProductService ) {}   // sin private
// this.productService.getProducts() ->
// Property 'productService' does not exist on type 'AppComponent'. ts(2339)
```

`src/app/app.component.html`:
```html
@for( product of this.products; track product.id) {
{{ product.title}}
}
```

Interfaz `src/app/models/product.ts`. Solo se sabe por el autocompletado que tiene `id: number` y `title`; el resto se deduce del JSON de la API:
```ts
export interface Product {
  id: number;
  title: string;        // [dudoso] el resto de campos no se ve
  price: number;
  description: string;
  category: string;
  image: string;
}
```

## 4. Librerías, comandos y versiones

- `@angular/core` (`Component`, `Injectable`, `inject`, `OnInit`), `@angular/common/http` (`HttpClient`), `@angular/router` (`RouterOutlet`) y `rxjs` (`Observable`).
- Angular 19 según los apuntes de teoría. Coincide con los nombres de archivo `app.component.ts` y con el mensaje de HMR de componentes.
- Comandos:
  ```bash
  ng g i models/product      # crea la interfaz Product
  ng g s services/product    # crea product.service.ts y product.service.spec.ts
  ng serve -o                # servidor de desarrollo, abre el navegador (localhost:4200)
  ```
- La salida de `ng serve` muestra "Component HMR has been enabled", "Initial total 138.84 kB" y "Page reload sent to client(s)".
- Herramientas: VS Code con WSL Ubuntu, Angular Language Service para el autocompletado en las plantillas y Chrome DevTools (Console y Sources).

## 5. Lo dudoso o ilegible

- **No se ve el cuerpo de `ProductService`** (la línea 10 está vacía en las capturas). No se sabe cómo inyecta `HttpClient` ni el valor exacto de `apiUrl`. La reconstrucción sale del documento de la actividad.
- En las capturas no aparece dónde se registra `provideHttpClient()`. Como la petición funciona, tiene que estar en `app.config.ts`, pero no se ve.
- La captura del breakpoint (12:47) es casi ilegible. Solo se distingue la estructura del componente.
- El comentario del minuto 18:00 sale cortado; en el 18:07 se completa como "…importante el scope de la propiedad en el constructor".
- Se recorre `this.products` en la plantilla aunque puede ser `undefined`. Mientras escribía, el editor subrayaba la cabecera del `@for`, pero en el minuto 20:25, ya guardado, no marca ningún error. No se explicó si se puede quitar el `this.` (en las plantillas no hace falta).
- El bloque termina con la plantilla mostrando solo los títulos. Lo que viene después (maquetar la tarjeta del producto, etc.) es del bloque 2.
