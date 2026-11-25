# Clase del 2026-10-20 (bloque 1 de 2) · Backend (Node)

# Node.js + Express + TypeScript: montar el proyecto `node-server` desde cero (20/10, bloque 1)

El profesor (Juan Antonio, en Cursor sobre macOS) prepara la base de un servidor Express con TypeScript. Primero instala las dependencias, luego configura nodemon, `tsconfig.json`, las variables de entorno con dotenv y, al final, separa `app.ts` de `index.ts`. Por el camino comete y corrige varios errores. Esos errores son buenos para entender cómo funciona npm.

## 1. Qué se explicó, en orden

| Minuto | Qué pasa |
|---|---|
| 00:00 | `package.json` recién generado con `npm init` (`name: "server"`, `main: "index.js"`, script `test` por defecto). |
| 00:30 – 01:04 | `npm install express`, `npm install typescript`, `npm install tsx`. Escribe `npm @types/node` sin `install` y npm responde `Unknown command`. Lo corrige con `npm install @types/node`. |
| 01:11 – 01:54 | Pasa `@types/node` a mano a un bloque `devDependencies`. Deja una coma de más y el editor marca `Trailing comma`. Después instala `npm install --save-dev @types/express`. |
| 02:20 – 02:57 | Vuelve a instalar `typescript`. En unas capturas sale en `devDependencies` y en otras en `dependencies` (ver lo dudoso). |
| 03:06 – 04:00 | `npm install morgan` (logs). Instala `@types/morgan` sin `--save-dev`, así que acaba en `dependencies`. Hace `npm uninstall morgan`, reinstala y luego `npm install --save-dev @types/morgan`. |
| 04:49 | `npm install tsc`, con el aviso `npm warn deprecated tsc@2.0.4: Package no longer supported`. Ese paquete **no es** el compilador de TypeScript. Este error es el origen de los problemas de los minutos 11 a 15. |
| 04:58 – 05:45 | `nodemon` se instala en `dependencies`. Hace `npm uninstall nodemon` y lo reinstala con `npm install --save-dev nodemon`. npm avisa de `3 high severity vulnerabilities` y sugiere `npm audit fix --force`. |
| 06:16 – 06:49 | Crea `nodemon.json` (al principio con coma final): `watch`, `ext` y `exec` con `npx tsx watch src/index.ts`. |
| 06:53 – 07:00 | Crea la carpeta `src` con `index.ts` y `app.ts`, los dos vacíos. |
| 07:47 – 08:06 | Repasa `package.json`: el tooltip del editor dice que la última versión de TypeScript es la 7.0.2. Repasa también `nodemon.json`. |
| 09:06 – 10:12 | Script `"dev": "nodemon"` (otra vez falta una coma, `Expected comma`). Al ejecutar `nodemon` sale `zsh: command not found: nodemon`, así que pasa a `npx nodemon`. Falla con `[nodemon] Failed to parse config ... nodemon.json` / `SyntaxError: Unexpected end of JSON input`, seguramente porque `nodemon.json` estaba sin guardar. El script queda como `"dev": "npx nodemon"`. |
| 10:40 | Añade `"type": "module"` a `package.json` (ES Modules). |
| 11:01 – 12:49 | `npx tsc --init` falla con *"This is not the tsc command you are looking for"*. También sale `node: bad option: --init` (Node v22.20.0 con nvm) y `zsh: command not found: tsc`. Prueba `npm install ts-node`. |
| 13:09 – 13:46 | Intenta `npm uninstall typescript`, pero escribe `uninatall` y npm sugiere `uninstall`. Limpia el proyecto con `rm -rf node_modules` y `rm -rf package-lock.json`. |
| 13:56 – 14:35 | `npm install --save-dev typescript`, pero `npx tsc` sigue fallando. Ve en `package.json` y `package-lock.json` que sigue estando el paquete `tsc` y lo quita con `npm uninstall tsc`. Aún falla. |
| 15:06 – 15:34 | `npm uninstall tsx` y quita también `ts-node`. Le quedan solo `express` y `morgan` como dependencias. Hace otra limpieza (`rm -rf package-lock.json`, `rm -rf node_modules`) y `npm install --save-dev typescript`. |
| 15:44 – 15:49 | `npx tsc` ya funciona (enseña la ayuda del compilador y el enlace aka.ms/tsc). `npx tsc --init` responde `Created a new tsconfig.json`. |
| 16:00 – 16:20 | `npm install --save-dev tsx` y después `ts-node`, también en `devDependencies`. |
| 16:23 – 17:39 | Repasa y ajusta `tsconfig.json`: descomenta `rootDir`/`outDir` (se deja una comilla, `Property keys must be doublequoted`), pone `types: ["node"]` y explica las opciones estrictas y las recomendadas. |
| 17:50 – 18:08 | Vuelve a escribir el script `dev` como `npx nodemon` (con otra coma final que corrige). |
| 18:13 – 18:30 | `npm run dev`: nodemon arranca con `watching path(s): src/**/*` y `starting npx tsx watch src/index.ts`. |
| 18:34 – 19:53 | Escribe `index.ts`. `import app from './app'` da error. `import app from 'express'` da el error *"ECMAScript imports and exports cannot be written in a CommonJS file under verbatimModuleSyntax. Adjust the 'type' field"*. Hay un conflicto de nombres entre `app` importado y `const app = express()`. Cambia `types` a `["node", "express"]` y `main` a `"dist/index.js"`. |
| 20:06 – 20:21 | `app.listen(3000, ...)` + `export default app`. El editor marca *"Property 'listen' does not exist on type 'typeof e...'"*, porque `app` es el **módulo** express y no una instancia creada con `express()`. |
| 20:30 – 22:53 | Crea `src/config/env.ts`. Prueba a escribir `NODE_PORT = ` en la terminal. Escribe el objeto `env` con `process.env` y valores por defecto. Sale el error `'const' declarations must be initialized` mientras lo escribe. |
| 23:06 – 23:15 | `import { env } from './config/env'` da *"Relative import paths need explicit file extensions"*, así que lo cambia a `./config/env.js`. Pasa a `app.listen(env.NODE_PORT, ...)`. |
| 23:33 – 23:53 | Crea `.env` en la raíz con `NODE_PORT=3000` y `NODE_ENV=development`. |
| 24:01 – 24:46 | En `env.ts` añade `import dotenv from 'dotenv'` y `dotenv.config()` antes de leer `process.env`. |
| 25:34 | `mkdir dist` (la carpeta de salida del compilador). |
| 26:21 – 27:35 | Crea `src/app.ts` con `express()` y `export default app`. `index.ts` pasa a importar `./app.js` y el error de `listen` desaparece. Por último, `app.ts` recibe los middlewares `express.json()` y `express.urlencoded()` y una ruta `GET /`. |

## 2. Conceptos y patrones

- **`package.json`**: lo genera `npm init`. Tiene los campos `name`, `version`, `main`, `type` y `scripts`, y los rangos semver con `^` (acepta versiones menores y parches).
- **`dependencies` y `devDependencies`**:
  - En `dependencies` va lo que se ejecuta en producción: `express`, `morgan` y `dotenv`.
  - En `devDependencies` (se instalan con `--save-dev` o `-D`) va lo que solo hace falta para desarrollar: los tipos `@types/*`, `typescript`, `tsx`, `ts-node` y `nodemon`.
  - Si se olvida el `--save-dev`, el paquete acaba en `dependencies`. Se arregla con `npm uninstall` y reinstalando con el flag.
- **`@types/xxx`**: tipos de TypeScript para librerías escritas en JavaScript (node, express, morgan).
- **`npm install` sin argumentos** instala todo lo que pone en `package.json`. Las respuestas `up to date` y `added N packages` indican el resultado. **`npm uninstall`** quita el paquete de `node_modules` y de `package.json`.
- **`npm audit`**: avisa de vulnerabilidades. `npm audit fix --force` puede meter cambios que rompen cosas, así que no conviene ejecutarlo a ciegas.
- **Reinstalar en limpio**: `rm -rf node_modules package-lock.json` y después `npm install`.
- **`npx`**: ejecuta binarios de `node_modules/.bin` sin instalarlos de forma global. Por eso `nodemon` a secas da `command not found` y `npx nodemon` sí funciona.
- **El paquete `tsc` de npm no es TypeScript**: el compilador `tsc` viene dentro del paquete `typescript`. Tener instalado el paquete `tsc` (deprecado) hace que `npx tsc` dé el mensaje *"This is not the tsc command you are looking for"*.
- **`npx tsc --init`**: genera `tsconfig.json`, una plantilla con comentarios (JSONC).
- **nodemon + tsx**: nodemon vigila `src` y los ficheros `.ts`, y ejecuta `npx tsx watch src/index.ts` para lanzar TypeScript sin compilar a mano, con recarga automática. Se arranca con el script `npm run dev`.
- **JSON estricto**: no admite comas finales (`Trailing comma`), las propiedades van separadas por comas (`Expected comma`) y las claves van entre comillas dobles. Un fichero sin guardar o incompleto produce `Unexpected end of JSON input`.
- **ES Modules en Node con TypeScript**:
  - `"type": "module"` en `package.json`, y `module: "nodenext"` + `verbatimModuleSyntax` en `tsconfig`.
  - Los imports relativos llevan extensión **`.js`** aunque el fichero sea `.ts` (`./config/env.js`, `./app.js`).
  - Si falta `type: module`, sale el error de "CommonJS file under verbatimModuleSyntax".
- **Configuración centralizada**: `src/config/env.ts` exporta un objeto `env` que lee `process.env` con valores por defecto (`||`). `dotenv.config()` carga el fichero `.env` y tiene que ejecutarse antes de leer las variables.
- **Separar `app.ts` e `index.ts`**:
  - `app.ts` crea y configura la app (`express()`, middlewares y rutas) y la exporta.
  - `index.ts` solo la importa y llama a `listen`.
- **Error típico de tipos**: `import app from 'express'` y luego `app.listen` da error, porque `listen` no existe en el módulo. Primero hay que crear la instancia con `express()`.
- **Middlewares de Express**: `express.json()` lee cuerpos JSON y `express.urlencoded({ extended: true })` lee formularios. Las rutas se escriben como `app.get(ruta, (req, res) => res.send(...))`.

## 3. Código del profesor (reconstruido)

**`nodemon.json`**
```json
{
  "watch": ["src"],
  "ext": "ts",
  "exec": "npx tsx watch src/index.ts"
}
```

**`package.json`** (estado al final del bloque, aproximado)
```json
{
  "name": "server",
  "version": "1.0.0",
  "description": "",
  "main": "dist/index.js",
  "type": "module",
  "scripts": {
    "dev": "npx nodemon"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^5.3.0",
    "morgan": "^1.12.1"
  },
  "devDependencies": {
    "@types/express": "^5.0.6",
    "@types/morgan": "^1.9.10",
    "@types/node": "^26.6.5",
    "nodemon": "^3.1.14",
    "ts-node": "^10.9.2",
    "tsx": "^4.23.15",
    "typescript": "^7.0.2"
  }
}
```
[dudoso] `dotenv` no se ve en ninguna captura de `package.json`, aunque se importa en `env.ts`. A las 20:48 la terminal dice `added 1 package, and audited 134 packages`, que podría ser `npm install dotenv`. El script `test` desaparece en algún momento.

**`tsconfig.json`** (opciones activas que se ven)
```jsonc
{
  "compilerOptions": {
    // File Layout
    "rootDir": "./src",
    "outDir": "./dist",
    // Environment Settings
    "module": "nodenext",
    "target": "esnext",
    "types": ["node", "express"],   // primero ["node"], luego se añade "express"
    // Other Outputs
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,
    // Stricter Typechecking Options
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    // Recommended Options
    "strict": true,
    "jsx": "react-jsx",
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "noUncheckedSideEffectImports": true,
    "moduleDetection": "force",
    "skipLibCheck": true
  }
}
```

**`.env`**
```
NODE_PORT=3000
NODE_ENV=development
```

**`src/config/env.ts`**
```ts
import dotenv from 'dotenv';

dotenv.config();

export const env = {
  NODE_PORT: process.env.NODE_PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development'
}
```

**`src/app.ts`**
```ts
import express from 'express';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Hello World');
});

export default app;
```

**`src/index.ts`**
```ts
import app from './app.js';
import { env } from './config/env.js';

app.listen(env.NODE_PORT, () => {
    console.log('Server is running on port 3000');
});

export default app;
```
En la versión intermedia (20:06 – 26:52), `index.ts` empezaba con `import app from 'express'` y daba el error de `listen`.

## 4. Librerías, comandos y versiones

**Versiones**
- Dependencias: `express ^5.3.0` y `morgan ^1.12.1`.
- De desarrollo: `typescript ^7.0.2`, `tsx ^4.23.15`, `ts-node ^10.9.2`, `nodemon ^3.1.14`, `@types/node ^26.6.5`, `@types/express ^5.0.6` y `@types/morgan ^1.9.10`.
- Paquete equivocado: `tsc ^2.0.4` (deprecado, se quitó).
- Otros: `dotenv` (sin versión visible). Node v22.20.0, gestionado con nvm.

**Comandos que salen**
- `npm install <paq>`, `npm install --save-dev <paq>`, `npm install` y `npm uninstall <paq>`.
- `npm audit`, `npm audit fix --force` (solo como sugerencia de npm) y `npm fund`.
- `npx nodemon`, `npx tsc`, `npx tsc --init` y `npm run dev`.
- `rm -rf node_modules`, `rm -rf package-lock.json` y `mkdir dist`.

**Herramientas**: editor Cursor (usa sus sugerencias de autocompletado y "Quick Edit") y terminal zsh.

## 5. Lo dudoso o ilegible

- **Dónde quedó `typescript` entre los minutos 02:20 y 03:20.** Unas capturas lo enseñan en `devDependencies` y otras en `dependencies`. Al final, tras las limpiezas, queda en `devDependencies`.
- **El mensaje `node: bad option: --init` (11:36).** Sale cortado. Lo más probable es que el binario del paquete `tsc` deprecado estuviera ocupando el comando, pero es una interpretación.
- **`package.json` a las 17:50.** Aparece sin el script `dev` y con menos `devDependencies` que justo antes. Puede ser otra vista o un deshacer; luego vuelve a escribir el script `dev`.
- **El texto superpuesto en `nodemon.json` a las 06:22** (`"watch": ["server"]`). Estaba a medio editar y no quedó en el fichero.
- **El inicio del valor de `exec` (06:49) y del script `dev` (17:58)** salía tapado por el tooltip o por el cursor del editor.
- **El mensaje de `console.log`.** Al final sigue con el puerto `3000` escrito a mano. En algún momento se ve la versión `'Server is running on port ${env.NODE_PORT}'`, pero con **comillas simples**, que no interpolan la variable: harían falta comillas invertidas (`` ` ``). No queda claro que la cambiara.
- **`index.ts` acaba con `export default app;`**, que allí no hace falta. No se ve que lo quitara.
- **No se ve `npm install dotenv`** en ninguna captura (ver la nota de `package.json`).
- **Detalles de la terminal poco legibles**: el número exacto de paquetes en algunas salidas y el comando que se tecleaba a las 09:29 y a las 12:38.
