# Clase del 2026-10-26 · Herramientas

# Herramientas: PokeAPI, Postman y Git (en la clase de Android)

No es código del proyecto. Son las herramientas de apoyo que se usaron en la misma clase de Android (PMDM).

## 1. Qué se vio

| Minuto | Contenido |
|---|---|
| 07:09-07:46 | GitHub de **Gson** (última versión 2.15.0) y de **Retrofit** (3.0.0, «A type-safe HTTP client for Android and the JVM»). Se abre la carpeta `samples` con `ErrorHandlingAdapter.java`. |
| 13:15-14:35 | Documentación de **PokeAPI** (`pokeapi.co/docs/v2`): Egg Groups, Resource Lists/Pagination y el endpoint Pokemon. |
| 13:23-13:31 | **Postman** con `GET https://pokeapi.co/api/v2/pokemon/`: responde 200 OK en 71 ms. |
| 37:00-37:25 | **Git** desde Android Studio: el panel Version Control (Create Git repository / Share on GitHub), y en la terminal PowerShell `git init` y el primer commit. |

## 2. Conceptos

- Un recurso REST se pide **por id o por nombre**: `GET /api/v2/pokemon/{id or name}/`.
- **Paginación con `limit` y `offset`.** La respuesta del listado trae:
  - `count`;
  - `next`, la URL de la página siguiente;
  - `previous`, null en la primera página;
  - `results`, una lista de `{ name, url }`.
- El listado no trae la imagen, que está en el detalle (`sprites.front_default`). Por eso en la app se hace una petición por cada pokémon.
- Postman sirve para probar el endpoint y ver el JSON antes de escribir las data class.
- Git en Windows avisa de que `LF will be replaced by CRLF` (es por `core.autocrlf`). `git init` crea la rama `main`.

## 3. Ejemplo de respuesta (Postman)
```json
{
  "count": 1351,
  "next": "https://pokeapi.co/api/v2/pokemon/?offset=20&limit=20",
  "previous": null,
  "results": [
    { "name": "bulbasaur", "url": "https://pokeapi.co/api/v2/pokemon/1/" },
    { "name": "ivysaur",   "url": "https://pokeapi.co/api/v2/pokemon/2/" }
  ]
}
```
Comandos: `git init`, y después `git status` y `git commit` (solo se ve el principio de cada uno).

## 4. Herramientas y versiones
PokeAPI v2, Postman, Git, Gson 2.15.0 (la última en GitHub) y Retrofit 3.0.0.

## 5. Lo dudoso
- El repositorio de Retrofit aparece como «lysine-dev/retrofit» o «lynsine-dev/retrofit». Seguramente es un error de lectura: el repositorio oficial es `square/retrofit`.
- Los mensajes exactos de `git status` y `git commit` no se leen.
