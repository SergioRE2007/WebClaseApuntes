# Clase del 2026-11-18 (bloque 1 de 2) · Backend (Node)

# Backend: la API de juegos que usa el CRUD (18-11, parte 2, minuto 26:55)

## 1. Qué se vio

En el minuto 26:55, antes de arrancar Angular, el profe abre en el navegador `http://localhost:3000/games` para comprobar que la API responde. No se enseña código del backend.

## 2. Conceptos

- **`GET` de una colección:** devuelve un array JSON de juegos.
- **Comprobar desde el navegador:** se ve la respuesta con la vista Pretty-print.
- **Un puerto para cada lado:** el backend usa el **3000** y el frontend Angular el **4200**.

## 3. Respuesta que se ve

```json
[
  { "id": 1, "title": "otrosefasd", "genre": "Platform", "platform": "PlayStation", "price": 1, "stock": 2 },
  { "id": 2, "title": "Space Colony", "genre": "Strategy", "platform": "PC", "price": 29.99 }
]
```

En la app de Angular también aparecen "Neon Racer" (Racing, PlayStation, 39.99), "Dungeon Quest" (RPG, PC, 24.99) y "Street Football" (Sports, Xbox, 34.99). El paginador marca "1 de 6" con 5 juegos por página, así que hay entre 26 y 30 juegos.

## 4. Librerías y comandos

- No se ven. Por el puerto 3000 y la ruta `/games` podría ser `json-server` o una API Express propia [dudoso].

## 5. Dudoso

- El campo `genre` del primer juego queda tapado en la captura del navegador. `Platform` sale de la lista de la app.
- No se ve cómo se arranca la API.
