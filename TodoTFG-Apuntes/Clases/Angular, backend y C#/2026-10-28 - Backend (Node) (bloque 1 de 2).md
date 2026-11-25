# Clase del 2026-10-28 (bloque 1 de 2) · Backend (Node)

# Probar una API REST con Postman (Fake Store API), 28/10, bloque 1

Esta parte no lleva código de servidor. El profesor explora la API pública que luego va a consumir el servicio de Angular, y enseña a probarla con Postman. Es la preparación de la actividad "Catálogo de productos con un Service".

## 1. Qué se explicó, en orden

| Minuto | Contenido |
|---|---|
| 00:00 – 00:05 | Postman con la colección **Fakestore** y la petición `products`: `GET {{url_base}}/products` da **200 OK** (384 ms, 4.91 KB) con un array JSON de productos. En el panel derecho, la IA de Postman ("Visualize API Response") genera un dashboard con tarjetas de KPI y un gráfico por categoría. |
| 01:13 – 01:31 | Documentación oficial de la API (`fakestoreapi.com/docs`, hecha con Redocly). Las operaciones de Products son Get all, Add, Get single, Update y Delete. Se ven ejemplos con `fetch` y las respuestas 200 y 400. Después `GET /products/{id}`, con `id` como parámetro de ruta (integer, required). |
| 02:31 – 02:55 | **Entornos** de Postman: el desplegable con varios entornos (Env FakeStore, NestJS TypeORM CRUD - Productos, etc.) y la variable `{{url_base}}`, que vale `https://fakestoreapi.com`. |
| 03:02 – 03:16 | Botón Send y la respuesta 200. Cómo se organizan las colecciones en la barra lateral (Collections, Environments, Mocks, Flows…). |
| 03:26 – 03:55 | Petición nueva: el desplegable de métodos (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS). Al escribir `{{` en la URL salen las variables del entorno y las dinámicas (`$guid`, `$isoTimestamp`, `$randomAdjective`…). URL `{{url_base}}/products/2`. |
| 03:55 – 04:25 | Respuesta de `GET /products/2`. Hay un aviso de permisos al intentar renombrar la petición y otro de que Postman no tiene conexión con sus servidores. |
| 04:52 – 06:17 | **Error y cómo se arregla.** Al reabrir Postman, el entorno queda en "No Environment" y la petición falla con `getaddrinfo ENOTFOUND {{url_base}}`, porque la variable no se resuelve. La IA de Postman lo diagnostica. El profesor prueba con "Env fake", que tampoco funciona. Luego edita el entorno **Env FakeStore**, pone `url_base = https://fakestoreapi.com` (variable marcada como Secure) y la petición vuelve a dar 200. |
| 06:29 – 06:51 | `GET {{url_base}}/products/4` y `GET {{url_base}}/products/2`: un producto por id (200 OK, 128 ms). Selecciona el JSON de la respuesta, seguramente para copiarlo. |
| 08:00 – 09:08 | En la documentación: `POST /products` (esquema del cuerpo, **201 Product created successfully** y 400 Bad request), `GET /carts` y `GET /users`. Los ejemplos de petición están en JavaScript (fetch), Node.js (Axios), PHP, cURL y Python. |
| 09:22 – 10:09 | Postman: `GET {{url_base}}/users` da 200 OK (537 ms, 1.49 KB). Comenta la estructura anidada (`address > geolocation`, `name > firstname/lastname`), el campo `__v` y que la API devuelve el **password** en la respuesta. |
| 10:14 – 11:12 | Menciona **Insomnia** como alternativa a Postman: busca su web y enseña los precios (Essentials $0, Pro $12, Enterprise $45). |

## 2. Conceptos y patrones

- **Recurso REST y sus operaciones**: `GET /products` (lista), `GET /products/{id}` (uno), `POST` (crear, devuelve 201), `PUT` (actualizar) y `DELETE`. Lo mismo para `/carts` y `/users`.
- **Parámetro de ruta** (`{id}`, entero y obligatorio) frente al listado.
- **Códigos HTTP**: 200 OK, 201 Created y 400 Bad Request.
- **JSON de respuesta**: un array de objetos con objetos anidados (`rating: { rate, count }`, `address.geolocation`).
- **Entornos y variables en Postman**: la URL base va en `{{url_base}}` y cada petición solo añade la ruta. Si no hay entorno activo, la variable no se sustituye y sale `ENOTFOUND`.
- **Variables dinámicas** de Postman: `$guid`, `$isoTimestamp`, `$random…`.
- **Colecciones**: las peticiones se guardan agrupadas por API.
- Leer la **documentación de la API** (el contrato) antes de consumirla.
- Detalle de seguridad: la API de ejemplo devuelve `password` en `/users`. Es un dato sensible que no debería salir en una respuesta.

## 3. Ejemplos que se vieron

Petición en Postman con variable de entorno:
```
Entorno: Env FakeStore
  url_base = https://fakestoreapi.com

GET {{url_base}}/products
GET {{url_base}}/products/2
GET {{url_base}}/users
```

Ejemplo de la documentación (JavaScript en el navegador):
```js
fetch('https://fakestoreapi.com/products/1')
  .then(response => response.json())
  .then(data => console.log(data));
```

Respuesta de `GET /products/2`:
```json
{
  "id": 2,
  "title": "Mens Casual Premium Slim Fit T-Shirts ",
  "price": 22.3,
  "description": "Slim-fitting style, ...",
  "category": "men's clothing",
  "image": "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_t.png",
  "rating": { "rate": 4.1, "count": 259 }
}
```

Esquema de `POST /products` (respuestas 201 y 400):
```
id integer · title string · price number<float> · description string · category string · image string<uri>
```

Estructura de un usuario (`GET /users`):
```json
{
  "address": { "geolocation": { "lat": "-37.3159", "long": "81.1496" },
               "city": "kilcoole", "street": "new road", "number": 7682, "zipcode": "12926-3874" },
  "id": 1, "email": "john@gmail.com", "username": "johnd", "password": "...",
  "name": { "firstname": "john", "lastname": "doe" },
  "phone": "1-570-236-7033", "__v": 0
}
```

## 4. Herramientas y recursos

- **Postman**: colecciones, entornos, variables y la IA para visualizar o diagnosticar.
- **Insomnia**: alternativa a Postman, solo mencionada.
- **Fake Store API** (`https://fakestoreapi.com`) y su documentación en `/docs`, hecha con Redocly.
- En los ejemplos de la documentación aparecen `fetch`, Axios, cURL, PHP y Python.
- En el historial de Postman salen peticiones de otra API local del profesor: `GET http://localhost:3000/eventos`, `GET http://localhost:3000/eventos?todos=true` y `POST {{base_url}}/auth/register`. Entre sus entornos también hay uno de "NestJS TypeORM CRUD". No se explicaron en esta clase.

## 5. Lo dudoso

- El texto exacto del error cambia según la captura: en una sale `ENOTFOUND {{url_base}}` y en otra `ENOTFOUND products`. En las dos la causa es que la variable no tiene valor.
- En el minuto 06:39, la respuesta del producto 4 aparece mientras la URL ya está editada como `/products/`. Seguramente es la respuesta de la petición anterior.
- En el minuto 10:14, una captura parece de Insomnia, pero la interfaz es la misma que la de Postman (colección Fakestore, entorno Env FakeStore). Lo más probable es que siga siendo Postman y que la búsqueda de Insomnia viniera justo después.
- No se ve la línea 8 de la respuesta de `/products/2` en una de las capturas (sale cortada).
