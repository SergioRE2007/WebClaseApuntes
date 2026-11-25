# Backend y Angular: lo que piden y no se ha dado

> **Esto no es de clase.** Es la forma más estándar de hacer lo que piden los requisitos de Acceso a Datos y no ha salido en las clases: seed, búsqueda con paginación, transacción y conectar Angular con vuestra API. Si en la defensa os preguntan, decid que lo habéis buscado vosotros.

Se sigue la estructura del repositorio del profesor: `src/modules/<x>/` con `routes`, `controller`, `service` y `schema`, Express 5, Prisma 6 y Zod 4.

Todos los ejemplos usan la misma tienda: **categorías**, **productos** y **pedidos**. Cambiad los nombres por los de vuestro proyecto.

**Comprobado:** el TypeScript del backend compila (`tsc` en modo `strict` y con `exactOptionalPropertyTypes`, como el `tsconfig` de clase) con Prisma 6.19, Zod 4 y Express 5. El de Angular compila con Angular 19, plantillas incluidas (`ngc` con `strictTemplates`). No se ha ejecutado contra una base de datos.

## Índice
**Backend**
1. Un modelo con relaciones de verdad
2. Seed
3. Listado con búsqueda, filtro, orden y paginación
4. Consultas con datos relacionados y selección de campos
5. Operación de negocio con transacción
6. Errores con su código HTTP
7. CORS para vuestra web y la app
8. Proteger rutas con el token

**Angular**

9. Listado con filtros, paginación, estados y borrar con confirmación
10. Guardar el token aunque se recargue la página
11. Lo que no se dio en clase pero está en las guías

---

## 1. Un modelo con relaciones de verdad

El repositorio del profesor solo tiene `User`. Los requisitos piden varias entidades con claves ajenas, campos obligatorios y opcionales, únicos y relaciones 1 a N que se usen de verdad. En `prisma/schema.prisma`:
```prisma
model Categoria {
  id        Int        @id @default(autoincrement())
  nombre    String     @unique
  productos Producto[]
}

model Producto {
  id          Int           @id @default(autoincrement())
  nombre      String
  descripcion String?
  precio      Decimal       @db.Decimal(10, 2)
  stock       Int           @default(0)
  categoriaId Int
  categoria   Categoria     @relation(fields: [categoriaId], references: [id], onDelete: Restrict)
  lineas      LineaPedido[]
  createdAt   DateTime      @default(now())

  @@index([categoriaId])
}

enum EstadoPedido {
  PENDIENTE
  CONFIRMADO
  CANCELADO
}

model Pedido {
  id        Int           @id @default(autoincrement())
  estado    EstadoPedido  @default(PENDIENTE)
  lineas    LineaPedido[]
  createdAt DateTime      @default(now())
}

model LineaPedido {
  id         Int      @id @default(autoincrement())
  cantidad   Int
  pedidoId   Int
  productoId Int
  pedido     Pedido   @relation(fields: [pedidoId], references: [id], onDelete: Cascade)
  producto   Producto @relation(fields: [productoId], references: [id], onDelete: Restrict)

  @@index([pedidoId])
  @@index([productoId])
}
```

Cómo se lee, que es lo que os preguntarán:
- **1 a N:** `Categoria` tiene `productos Producto[]` (muchos) y `Producto` tiene `categoriaId` + `categoria` (uno). La columna que se guarda en la base es `categoriaId`; `categoria` y `productos` solo existen en Prisma para poder hacer `include`.
- **N a N con datos:** un pedido tiene muchos productos y un producto está en muchos pedidos. Se hace con una tabla en medio (`LineaPedido`) que además guarda la `cantidad`.
- **Obligatorio u opcional:** `String` es obligatorio y `String?` es opcional (puede ser `NULL`).
- **Único:** `@unique` en el nombre de la categoría. Si se repite, Prisma lanza el error `P2002` (que se traduce a `409`).
- **`onDelete`:** qué pasa con los hijos al borrar el padre. `Restrict` no deja borrar una categoría con productos (error `P2003`). `Cascade` borra las líneas al borrar el pedido.
- **`Decimal` para el dinero:** `Float` redondea mal (0,1 + 0,2 no da 0,3). En el JSON, Prisma manda los `Decimal` como texto: `"59.9"`.
- **`@@index`:** Postgres no crea índices en las claves ajenas por su cuenta. Sin ellos, buscar los productos de una categoría recorre la tabla entera.

Después, `npx prisma migrate dev --name tienda` crea la migración en `prisma/migrations/`. Subidla al repositorio: es uno de los requisitos.

---

## 2. Seed

**Qué es:** un script que llena la base de datos con datos de prueba, para no tener que meterlos a mano cada vez que se borra. Los requisitos lo piden expresamente.

`prisma/seed.ts`:
```ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.lineaPedido.deleteMany();
  await prisma.pedido.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.categoria.deleteMany();

  const perifericos = await prisma.categoria.create({
    data: {
      nombre: 'Periféricos',
      productos: {
        create: [
          { nombre: 'Teclado mecánico', precio: 59.9, stock: 12 },
          { nombre: 'Ratón inalámbrico', precio: 24.5, stock: 30 },
        ],
      },
    },
  });

  await prisma.categoria.create({
    data: {
      nombre: 'Monitores',
      productos: {
        create: [{ nombre: 'Monitor de 27 pulgadas', descripcion: 'IPS, 144 Hz', precio: 229, stock: 5 }],
      },
    },
  });

  const teclado = await prisma.producto.findFirstOrThrow({ where: { categoriaId: perifericos.id } });

  await prisma.pedido.create({
    data: { lineas: { create: [{ productoId: teclado.id, cantidad: 2 }] } },
  });

  console.log('Seed terminado');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

- Se borra **de hijos a padres** (líneas, pedidos, productos y categorías). Al revés, las claves ajenas no dejan.
- `productos: { create: [...] }` dentro de la categoría es una **escritura anidada**: crea la categoría y sus productos de una vez, y Prisma pone el `categoriaId` solo.
- Si tenéis usuarios, guardad la contraseña con `await bcrypt.hash('1234', 10)`, igual que en el registro. Si no, no podréis entrar con ellos.

En `package.json`:
```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

- `npx prisma db seed` lo ejecuta.
- `npx prisma migrate reset` borra la base, aplica todas las migraciones y ejecuta el seed. Es lo que conviene enseñar en la defensa.
- Prisma 6 avisa de que la clave `prisma` del `package.json` desaparecerá en Prisma 7 (allí va en `prisma.config.ts`). Con Prisma 6 funciona. También vale un script normal, `"seed": "tsx prisma/seed.ts"`, y ejecutarlo con `npm run seed`.

---

## 3. Listado con búsqueda, filtro, orden y paginación

Es el requisito que más pesa: Angular manda los criterios en la URL (`/api/productos?q=teclado&categoriaId=1&orden=precio&dir=asc&page=2&limit=10`), y **la consulta la hace Prisma**, no Angular. La respuesta trae también el total, para que Angular sepa cuántas páginas hay.

**El schema de Zod** (`productos.schema.ts`) valida y convierte los parámetros:
```ts
import { z } from 'zod';

export const listarProductosSchema = z.object({
  q: z.string().trim().optional(),
  categoriaId: z.coerce.number().int().positive().optional(),
  orden: z.enum(['nombre', 'precio', 'createdAt']).default('createdAt'),
  dir: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type ListarProductosQuery = z.infer<typeof listarProductosSchema>;
```
- Todo lo que llega en la URL es texto. `z.coerce.number()` convierte `"2"` en `2`.
- `.default(...)` pone un valor si no viene, así el servicio nunca recibe `undefined` en `page`, `limit`, `orden` ni `dir`.
- `z.enum` para el orden: si alguien manda `orden=passwordHash`, da `400`. **No se ordena por un campo que venga sin comprobar.**
- `.max(50)` para que nadie pida un millón de filas de golpe.
- `z.infer` saca el tipo de TypeScript del schema, así no se escribe dos veces.

**El servicio** (`productos.service.ts`):
```ts
import { Prisma } from '@prisma/client';
import { prisma } from '../../config/db.js';
import type { ListarProductosQuery } from './productos.schema.js';

export async function listarProductos(filtro: ListarProductosQuery) {
  const where: Prisma.ProductoWhereInput = {};
  if (filtro.q) {
    where.nombre = { contains: filtro.q, mode: 'insensitive' };
  }
  if (filtro.categoriaId) {
    where.categoriaId = filtro.categoriaId;
  }

  const orderBy: Prisma.ProductoOrderByWithRelationInput = { [filtro.orden]: filtro.dir };

  const [total, items] = await prisma.$transaction([
    prisma.producto.count({ where }),
    prisma.producto.findMany({
      where,
      orderBy,
      skip: (filtro.page - 1) * filtro.limit,
      take: filtro.limit,
      select: {
        id: true,
        nombre: true,
        precio: true,
        stock: true,
        categoria: { select: { id: true, nombre: true } },
      },
    }),
  ]);

  return {
    items,
    total,
    page: filtro.page,
    limit: filtro.limit,
    totalPages: Math.ceil(total / filtro.limit),
  };
}
```
- **Búsqueda:** `contains` con `mode: 'insensitive'` es un `ILIKE '%teclado%'` de Postgres: encuentra "Teclado mecánico" aunque se escriba en minúsculas.
- **Filtro:** `where.categoriaId`. El `where` se construye poco a poco y solo lleva los criterios que han llegado.
- **Orden:** `{ [filtro.orden]: filtro.dir }` es un objeto con la clave calculada: si `orden` vale `"precio"`, queda `{ precio: 'asc' }`.
- **Paginación:** `skip` es cuántas filas se saltan y `take` cuántas se cogen. Página 2 de 10 en 10: `skip = 10` y `take = 10`.
- **Total:** `count` con **el mismo `where`**, para contar solo lo que cumple los filtros, no todos los productos.
- `prisma.$transaction([...])` con un array ejecuta las dos consultas juntas. Así el total y la página salen de los mismos datos, aunque alguien inserte un producto en medio.
- **Selección de campos:** `select` dice qué columnas devuelve. Aquí no se mandan ni `descripcion` ni `createdAt`, y de la categoría solo `id` y `nombre`.

**El controlador** (`productos.controller.ts`):
```ts
import type { Request, Response } from 'express';
import { z } from 'zod';
import { listarProductosSchema } from './productos.schema.js';
import { listarProductos } from './productos.service.js';

export async function listarProductosCtrl(req: Request, res: Response) {
  const resultado = listarProductosSchema.safeParse(req.query);
  if (!resultado.success) {
    return res.status(400).json({ error: z.treeifyError(resultado.error) });
  }
  res.json(await listarProductos(resultado.data));
}
```
- El middleware `validate` de clase valida el `body`. Aquí se valida `req.query`, que en Express 5 no se puede sobrescribir: por eso se valida en el controlador y se pasa `resultado.data` al servicio.
- No hace falta `try/catch`: en Express 5, si una función `async` lanza un error, llega solo al `errorHandler`.

**La ruta** (`productos.routes.ts`), como las de clase:
```ts
import { Router } from 'express';
import { listarProductosCtrl } from './productos.controller.js';

const router = Router();
router.get('/', listarProductosCtrl);

export default router;
```
Y en `app.ts`: `app.use('/api/productos', productosRoutes);`

La respuesta queda así:
```json
{
  "items": [
    { "id": 1, "nombre": "Ratón inalámbrico", "precio": "24.5", "stock": 30, "categoria": { "id": 1, "nombre": "Periféricos" } }
  ],
  "total": 3,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

## 4. Consultas con datos relacionados y selección de campos

Los requisitos piden "información relacionada entre entidades" y que las relaciones "tengan una repercusión real en la interfaz". Tres consultas típicas:
```ts
export function obtenerCategoriaConProductos(id: number) {
  return prisma.categoria.findUnique({
    where: { id },
    include: { productos: { orderBy: { nombre: 'asc' } } },
  });
}

export function contarProductosPorCategoria() {
  return prisma.categoria.findMany({
    select: { id: true, nombre: true, _count: { select: { productos: true } } },
  });
}
```
- **`include`** trae la fila y además sus relacionados, enteros: la categoría con todos sus productos. Es el `JOIN` de SQL.
- **`select`** elige campos. Dentro de un `select` también se puede meter una relación (como en el apartado 3, con `categoria: { select: {...} }`). No se pueden usar `include` y `select` a la vez en el mismo nivel.
- **`_count`** cuenta los relacionados sin traerlos. Sirve para enseñar "Periféricos (2)" en un menú.
- `findUnique` devuelve `null` si no existe. En el controlador: `if (!categoria) return res.status(404).json(...)`.

---

## 5. Operación de negocio con transacción

**Qué piden:** una operación que haga varias cosas relacionadas y que, si falla una, no deje nada a medias.

**Ejemplo: confirmar un pedido.**
1. Comprueba que el pedido existe y está pendiente.
2. Resta el stock de cada producto, si hay suficiente.
3. Pasa el pedido a `CONFIRMADO`.

Si el tercer producto no tiene stock, hay que deshacer lo que se restó de los dos primeros. Eso es justo lo que hace una transacción.

```ts
import { prisma } from '../../config/db.js';
import { HttpError } from '../../utils/httpError.js';

export function confirmarPedido(pedidoId: number) {
  return prisma.$transaction(async (tx) => {
    const pedido = await tx.pedido.findUnique({
      where: { id: pedidoId },
      include: { lineas: true },
    });
    if (!pedido) {
      throw new HttpError(404, 'Pedido no encontrado');
    }
    if (pedido.estado !== 'PENDIENTE') {
      throw new HttpError(409, 'El pedido ya no está pendiente');
    }

    for (const linea of pedido.lineas) {
      const actualizado = await tx.producto.updateMany({
        where: { id: linea.productoId, stock: { gte: linea.cantidad } },
        data: { stock: { decrement: linea.cantidad } },
      });
      if (actualizado.count === 0) {
        throw new HttpError(409, `No hay stock suficiente del producto ${linea.productoId}`);
      }
    }

    return tx.pedido.update({
      where: { id: pedidoId },
      data: { estado: 'CONFIRMADO' },
    });
  });
}
```
- **`prisma.$transaction(async (tx) => { ... })`**: todo lo que se hace con `tx` va en la misma transacción. Si el bloque termina bien, se guarda todo (`COMMIT`). **Si se lanza un error en cualquier punto, se deshace todo** (`ROLLBACK`).
- Dentro hay que usar **`tx`, no `prisma`**. Lo que se haga con `prisma` va por fuera de la transacción y no se deshace.
- `updateMany` con `stock: { gte: linea.cantidad }` resta el stock **solo si llega**. Se comprueba y se resta en la misma sentencia SQL, así que si dos personas compran la última unidad a la vez, solo a una le sale bien. Si no se actualizó nada (`count === 0`), es que no había stock.
- `decrement` resta en la base (`stock = stock - 2`). No hace falta leer el stock, restarlo en JavaScript y guardarlo.
- Una transacción así tiene **5 segundos** de límite por defecto. No metáis dentro llamadas a otras APIs ni nada lento.

En el router: `router.post('/:id/confirmar', requireAuth, confirmarPedidoCtrl)`. Es una acción, no un CRUD, por eso va como `POST` a una subruta con un verbo.

**Para la defensa:** comentad la línea del `throw` del stock, poned un pedido con más cantidad de la que hay y comprobad en la base que no ha cambiado nada.

**Ideas de operaciones de negocio para otros proyectos:** aceptar una reserva (comprobar que el hueco está libre, crear la reserva y marcar el hueco como ocupado), registrar un usuario con su perfil (dos tablas a la vez), cerrar una incidencia (cambiar el estado y guardar el historial) o transferir puntos entre dos usuarios.

---

## 6. Errores con su código HTTP

Para lanzar errores con su código desde los servicios (como en el apartado 5), una clase pequeña en `src/utils/httpError.ts`:
```ts
export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
```
`public status` en el constructor crea la propiedad y la rellena a la vez, como en Kotlin con `val` en el constructor.

Y en el `errorHandler` (el de clase ya traduce P2002 y P2025; se añaden `HttpError` y P2003):
```ts
import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { HttpError } from '../utils/httpError.js';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Ya existe' });
    if (err.code === 'P2025') return res.status(404).json({ error: 'No encontrado' });
    if (err.code === 'P2003') return res.status(409).json({ error: 'Tiene datos relacionados' });
  }
  res.status(500).json({ error: 'Error interno' });
}
```

| Código | Cuándo | Ejemplo |
|---|---|---|
| `200` | Bien, y devuelve algo | `GET` y `PUT` |
| `201` | Creado | `POST` (`res.status(201).json(nuevo)`) |
| `204` | Bien, sin nada que devolver | `DELETE` (`res.status(204).end()`) |
| `400` | Datos mal | Falla Zod |
| `401` | Sin token o token malo | `requireAuth` |
| `403` | Con token, pero sin permiso | Tocar algo de otro usuario |
| `404` | No existe | `P2025` o `findUnique` devuelve `null` |
| `409` | Choca con lo que hay | `P2002` (duplicado), `P2003` (tiene hijos), sin stock |
| `500` | Fallo del servidor | Cualquier otra cosa. No se manda el detalle al cliente |

- El manejador de errores tiene que tener **los cuatro parámetros** aunque no use `next`. Express lo reconoce como manejador de errores por eso.
- Va con `app.use(errorHandler)` **al final** de `app.ts`, después de todas las rutas.

---

## 7. CORS para vuestra web y la app

El 18/11 salió el error de CORS: la web publicada llamaba a `localhost`. **Qué es CORS:** el navegador no deja que una página de un dominio (`localhost:4200`, o vuestra web en Vercel) lea respuestas de otro (`localhost:3000`) si el servidor no le da permiso con una cabecera. **Solo afecta a los navegadores**: la app Android y Postman no lo comprueban.

El `cors()` del repositorio de clase deja pasar a todo el mundo. Para decir qué webs pueden llamar a la API:
```ts
const origenesPermitidos = (process.env.CORS_ORIGINS ?? 'http://localhost:4200').split(',');

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || origenesPermitidos.includes(origin)) callback(null, true);
      else callback(new HttpError(403, 'Origen no permitido'));
    },
  }),
);
```
- En el `.env`: `CORS_ORIGINS=http://localhost:4200,https://vuestra-web.vercel.app` (sin `/` al final).
- `!origin` deja pasar las peticiones que no llevan la cabecera `Origin`: la app Android, Postman y `curl`.
- El origen es protocolo + dominio + puerto. `http://localhost:4200` y `http://127.0.0.1:4200` son distintos.

---

## 8. Proteger rutas con el token

El middleware `auth` del profesor (v0.6.0) no se llegó a ver en las capturas. Uno estándar:
```ts
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? '';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const cabecera = req.headers.authorization;
  if (!cabecera?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  try {
    const payload = jwt.verify(cabecera.slice(7), JWT_SECRET) as { userId: number };
    res.locals.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
}
```
- La cabecera llega como `Bearer eyJhbGci...`. `slice(7)` quita las 7 letras de `"Bearer "`.
- `jwt.verify` comprueba la firma y la fecha de caducidad. Si el token está mal o caducado, lanza un error.
- `{ userId: number }` tiene que coincidir con lo que metáis al firmar en el login (`jwt.sign({ userId: user.id }, ...)`).
- `res.locals` es un objeto de Express para pasar datos de un middleware al controlador. El controlador lee `res.locals.userId`. Muchos lo guardan en `req.user`, pero entonces hay que decirle a TypeScript que `Request` tiene esa propiedad.
- **Nunca os fiéis de un `userId` que venga en el `body`.** Para "mis pedidos", usad el del token: `where: { userId: res.locals.userId }`.
- `JWT_SECRET` sale de `env.ts` en el proyecto de clase, que falla al arrancar si no está. Aquí se lee de `process.env` para que el ejemplo sea corto.

---

## 9. Angular: listado con filtros, paginación, estados y borrar con confirmación

Es la otra mitad del apartado 3: Angular **solo manda los criterios** y pinta lo que devuelve la API.

**Los tipos y el servicio:**
```ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Categoria {
  id: number;
  nombre: string;
}

export interface Producto {
  id: number;
  nombre: string;
  precio: string;
  stock: number;
  categoria: Categoria;
}

export interface Pagina<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FiltroProductos {
  q?: string;
  categoriaId?: number;
  orden?: 'nombre' | 'precio' | 'createdAt';
  dir?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/productos';

  getProductos(filtro: FiltroProductos): Observable<Pagina<Producto>> {
    let params = new HttpParams();
    for (const [clave, valor] of Object.entries(filtro)) {
      if (valor !== undefined && valor !== '') {
        params = params.set(clave, valor);
      }
    }
    return this.http.get<Pagina<Producto>>(this.apiUrl, { params });
  }

  deleteProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```
- **`HttpParams`** monta la parte `?q=...&page=...` de la URL, y codifica los espacios y los acentos. Es **inmutable**: `set` no lo cambia, devuelve uno nuevo. Por eso es `params = params.set(...)`. Si se escribe solo `params.set(...)`, no se manda nada.
- Se saltan los criterios vacíos para no mandar `?q=&categoriaId=`.
- `Pagina<T>` es genérica: vale para cualquier listado paginado. Es la misma forma que devuelve el backend.
- `apiUrl` va dentro del servicio, como lo hace el profesor en clase.

**El componente:**
```ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Producto, ProductService } from '../../services/product.service';

@Component({
  selector: 'app-productos',
  imports: [ReactiveFormsModule],
  templateUrl: './productos.component.html',
})
export class ProductosComponent implements OnInit {
  private productService = inject(ProductService);

  protected buscador = new FormControl('', { nonNullable: true });
  protected orden = new FormControl<'nombre' | 'precio' | 'createdAt'>('createdAt', { nonNullable: true });

  protected productos = signal<Producto[]>([]);
  protected total = signal(0);
  protected page = signal(1);
  protected totalPages = signal(1);
  protected loading = signal(false);
  protected error = signal('');

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.loading.set(true);
    this.error.set('');
    this.productService
      .getProductos({
        q: this.buscador.value,
        orden: this.orden.value,
        dir: 'asc',
        page: this.page(),
        limit: 10,
      })
      .subscribe({
        next: (pagina) => {
          this.productos.set(pagina.items);
          this.total.set(pagina.total);
          this.totalPages.set(Math.max(1, pagina.totalPages));
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se han podido cargar los productos');
          this.loading.set(false);
        },
      });
  }

  protected buscar(): void {
    this.page.set(1);
    this.cargar();
  }

  protected irAPagina(pagina: number): void {
    this.page.set(pagina);
    this.cargar();
  }

  protected borrar(producto: Producto): void {
    if (!confirm(`¿Borrar "${producto.nombre}"?`)) return;
    this.productService.deleteProducto(producto.id).subscribe({
      next: () => this.cargar(),
      error: () => this.error.set('No se ha podido borrar'),
    });
  }
}
```

**La plantilla** (`productos.component.html`):
```html
<input [formControl]="buscador" placeholder="Buscar por nombre" (keyup.enter)="buscar()" />
<select [formControl]="orden" (change)="buscar()">
  <option value="createdAt">Más nuevos</option>
  <option value="nombre">Nombre</option>
  <option value="precio">Precio</option>
</select>
<button (click)="buscar()">Buscar</button>

@if (loading()) {
  <p>Cargando...</p>
} @else if (error()) {
  <p>{{ error() }}</p>
  <button (click)="cargar()">Reintentar</button>
} @else {
  <p>{{ total() }} productos</p>
  @for (producto of productos(); track producto.id) {
    <div>
      {{ producto.nombre }} · {{ producto.precio }} € · {{ producto.categoria.nombre }}
      <button (click)="borrar(producto)">Borrar</button>
    </div>
  } @empty {
    <p>No hay productos con esos filtros.</p>
  }
  <button [disabled]="page() === 1" (click)="irAPagina(page() - 1)">Anterior</button>
  <span>Página {{ page() }} de {{ totalPages() }}</span>
  <button [disabled]="page() >= totalPages()" (click)="irAPagina(page() + 1)">Siguiente</button>
}
```
- **Los cuatro estados que piden los requisitos:** cargando (`loading`), error (`error`, con un botón para reintentar), vacío (`@empty`) y con datos.
- **Al buscar se vuelve a la página 1.** Si no, estando en la página 3 y buscando algo con un solo resultado, saldría una página vacía.
- `[formControl]` es un control reactivo suelto, sin `FormGroup`, porque aquí no hay formulario que enviar. Necesita `ReactiveFormsModule` en `imports`.
- **Borrar con confirmación:** `confirm()` es el cuadro del navegador con Aceptar y Cancelar. Es lo que se usa en la guía de clase (10_Formularios.md, dentro de un `CanDeactivate`). Un diálogo propio no se ha dado.
- Si se quiere que busque mientras se escribe, sin pulsar el botón: `this.buscador.valueChanges.pipe(debounceTime(300), takeUntilDestroyed())` en el constructor. `debounceTime` espera a que se deje de escribir para no hacer una petición por cada letra.
- Para comprobarlo en la defensa: F12 → Red. Al cambiar el filtro se ve la petición con los parámetros en la URL, y la respuesta trae solo 10 productos.

---

## 10. Angular: guardar el token aunque se recargue la página

En la guía de clase, el token vive solo en un `signal`: al recargar la página (F5) se pierde y hay que volver a iniciar sesión. Para que no pase, se guarda también en `localStorage`, que es un almacén del navegador que no se borra al recargar:
```ts
import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly clave = 'token';
  accessToken = signal(localStorage.getItem(this.clave) ?? '');
  isLoggedIn = computed(() => this.accessToken() !== '');

  guardarToken(token: string): void {
    localStorage.setItem(this.clave, token);
    this.accessToken.set(token);
  }

  logout(): void {
    localStorage.removeItem(this.clave);
    this.accessToken.set('');
  }
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).accessToken();
  if (!token) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
```
- Al arrancar, el `signal` empieza con lo que haya en `localStorage`. Si había sesión, sigue abierta.
- El interceptor es el de la guía de clase (8_HTTP.md). Se registra en `app.config.ts` con `provideHttpClient(withInterceptors([authInterceptor]))`.
- `req.clone(...)`: las peticiones también son inmutables, como `HttpParams`. No se cambian; se copian con la cabecera nueva.
- `localStorage` lo puede leer cualquier JavaScript de la página. Para un proyecto de clase está bien; en una app real se usan cookies `httpOnly`.

---

## 11. Lo que no se dio en clase pero está en las guías

En `Material de clase/Guías de Angular/` hay bastante más de lo que salió en las clases grabadas. Antes de buscar en internet, mirad aquí:

| Qué | Guía |
|---|---|
| `HttpParams` e interceptores (`HttpInterceptorFn`) | `8_HTTP.md` |
| `:id`, `ActivatedRoute`, query params, comodín `**`, `loadChildren`, `withComponentInputBinding` | `9_Routing.md` |
| Guards (`CanActivate`, `CanDeactivate`) y resolvers (`ResolveFn`) | `9_Routing.md` |
| `FormBuilder`, `FormArray` y validadores propios (`ValidatorFn`) | `10_Formularios.md` |
| `catchError`, `handleError` y el manejador global `ErrorHandler` | `11_Gestion_Errores.md` |
| Pipes y directivas propios (`@Pipe`, `@Directive`) | `4_Pipes_Directivas.md` |
| `computed()` y `toSignal()` | `7_Signals.md` |
| RxJS: `pipe`, `map`, `filter` y `switchMap` | `6_Patrones_Reactivos.md` y `9_Routing.md` |
