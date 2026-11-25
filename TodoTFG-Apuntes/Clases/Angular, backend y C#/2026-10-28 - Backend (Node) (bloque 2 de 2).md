# Clase del 2026-10-28 (bloque 2 de 2) · Backend (Node)

# API REST de prueba: Fake Store, JSON Server y Postman

No es backend propio. Son las herramientas del lado servidor que se usan para la actividad de Angular: una API pública (Fake Store), una API falsa en local con JSON Server y un cliente de APIs para probarlas.

## 1. Qué se explicó, en orden

**Parte 2**
- **~25:07-25:50**: en Postman, colección `Fakestore` con la variable `{{url_base}}`.
  - `GET {{url_base}}/products` devuelve 200 y un JSON con `id`, `title`, `price`, `description`, `category`, `image` y `rating {rate, count}`.
  - Se copia la URL del campo `image` en una pestaña nueva, se envía (200) y en la pestaña **Preview** sale la imagen de la mochila Fjällräven. Así se ve que `image` es una URL que se puede poner en un `<img>`.
  - También se prueba `GET {{url_base}}/users`, que devuelve un JSON anidado (`address.geolocation`, `city`, `street`, `zipcode`, `email`, `username`...).

**Parte 3**
- **~04:27-04:50**: el documento de la Act 9 indica que se añada un script `api` a `package.json`, que se ejecute `npm run api` y que se compruebe `http://localhost:3000/games`.
- **~04:59**: el profesor escribe directamente `json-server --watch db.json --port 3000` y sale `json-server: command not found`. El paquete está instalado en el proyecto, no de forma global, así que su ejecutable no está en el PATH.
- **~05:10-05:22**: con `npx json-server --watch db.json --port 3000` sí arranca. Se ven el recurso `http://localhost:3000/games`, la página Home `http://localhost:3000`, el texto "Watching..." y el aviso de VS Code de que el puerto 3000 está disponible.
- **~05:59-06:03**: prueba en el navegador.
  - `GET /` devuelve 404, porque en la raíz no hay ningún recurso.
  - `GET /games` devuelve 200 con el array de juegos.
  - El terminal va registrando cada petición, por ejemplo `GET /games 200 4.560 ms`.
- **~06:40-07:57**: se crea en Postman la colección **GameService** y el entorno **GameServiceEnv** con la variable `url_base = http://localhost:3000`, que se deja como entorno activo.
- **~09:30-10:22**: dentro de GameService se crea la petición `GET {{url_base}}`.
  - Sin ruta devuelve 404. El asistente de IA de Postman dice que la ruta o la URL base son incorrectas.
  - Se completa la ruta: primero se escribe `/products` por error y luego `/games`, que acaba devolviendo **200** con el JSON de juegos.
- **~10:38-13:35**: se renombra la petición como `games` para tener la colección ordenada.

## 2. Conceptos y patrones
- **JSON Server**: convierte un `db.json` en una API REST. Cada clave de primer nivel (`games`) pasa a ser un recurso (`/games`, `/games/:id`).
  - `--watch` vuelve a cargar los datos cuando cambia el archivo.
  - `--port` elige el puerto.
  - Pulsando `s` + Intro se guarda una copia (*snapshot*) de la base de datos.
- **El documento propone explorar la API antes de programar Angular**:
  - Listado: `http://localhost:3000/games`.
  - Por id: `http://localhost:3000/games/3`.
  - Filtro por género: la URL sale cortada.
- **Ejecutable local frente a global**: un paquete instalado como devDependency se lanza con `npx` o con un script de npm (`npm run api`), no directamente desde la terminal.
- **Códigos HTTP**: 200 cuando hay recurso y 404 cuando la ruta no existe (por ejemplo, la raíz `/`).
- **Postman**:
  - Colecciones para agrupar las peticiones de cada API.
  - Entornos con variables (`{{url_base}}`), para no repetir la URL base y poder cambiar de servidor.
  - Pestaña Preview para ver respuestas que no son JSON, como imágenes.
  - Renombrar las peticiones para tener la colección ordenada.
- **API pública Fake Store** (`fakestoreapi.com`): `/products` y `/users`, y las imágenes en `/img/...`.

## 3. Código y configuración del profesor
```json
"scripts": {
  "api": "json-server --watch db.json --port 3000"
}
```
```bash
npm install --save-dev json-server@0.17.4
npm run api
# o directamente:
npx json-server --watch db.json --port 3000
```
Salida del servidor:
```
Resources
http://localhost:3000/games

Home
http://localhost:3000

Type s + enter at any time to create a snapshot of the database
Watching...
GET / 404 4.967 ms - 2
GET /games 200 4.560 ms - -
```
Postman:
```
Entorno GameServiceEnv:  url_base = http://localhost:3000
Colección GameService:   GET {{url_base}}/games   -> 200 [ {id, title, genre, platform, price}, ... ]
Colección Fakestore:     GET {{url_base}}/products, GET {{url_base}}/products/{id}, GET {{url_base}}/users
Imagen:                  GET https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_t.png -> 200 (Preview)
```

## 4. Librerías, comandos y versiones
- `json-server@0.17.4`, la versión "clásica" que pide el documento. Se instala como devDependency y depende de `connect-pause@0.1.1`, que está obsoleto.
- `npx`, `npm run api` y `npm audit`.
- Postman, con colecciones, entornos, Preview y asistente de IA.
- Fake Store API (`fakestoreapi.com`).
- En la lista de colecciones del profesor aparecen otras de cursos anteriores, como "NestJS TypeORM CRUD - Fabricantes/Productos" y "nest_fabricante_producto". No se trabajaron en esta clase.

## 5. Lo dudoso o ilegible
- Algunas capturas llaman a la herramienta **Insomnia** y otras **Postman**. Las funciones que se ven ("Send + Get a successful response", el chat de IA, "New Environment" con Variable/Value) son de Postman, así que todo apunta a que es siempre **Postman**.
- Varias capturas leen la URL como `{{url_base}} /games`, con un espacio. Primero sale 404 y en la captura siguiente 200. No se ve con seguridad si el profesor corrigió el espacio o si el 404 venía de otra cosa.
- El paso por `/products` en la colección GameService parece un despiste: es la ruta de Fake Store y no existe en `db.json`.
- La URL del filtro por género del documento está cortada.
- La URL de la imagen sale cortada en varias capturas. La completa (`..._AC_SL1500_t.png`) se lee en el JSON de `/products`.
