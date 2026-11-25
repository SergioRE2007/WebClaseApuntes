# Guía rápida — Ejecutar TypeScript desde la consola

> [!INFO]
> Esta guía muestra cómo **compilar y ejecutar programas TypeScript desde la consola**, diferenciando claramente el proceso de compilación con `tsc` de la ejecución con Node.js.
>
> El enfoque está pensado para ejercicios, prácticas y pequeños proyectos de consola.

---

## Índice

- [[#1. ¿Cómo se ejecuta TypeScript?|1. ¿Cómo se ejecuta TypeScript?]]
- [[#2. Requisitos previos|2. Requisitos previos]]
- [[#3. Crear un proyecto TypeScript|3. Crear un proyecto TypeScript]]
- [[#4. Crear nuestro primer programa|4. Crear nuestro primer programa]]
- [[#5. Compilar TypeScript|5. Compilar TypeScript]]
- [[#6. Ejecutar el programa|6. Ejecutar el programa]]
- [[#7. Compilar y ejecutar|7. Compilar y ejecutar]]
- [[#8. Utilizar un `tsconfig.json`|8. Utilizar un `tsconfig.json`]]
- [[#9. Compilación automática con `watch`|9. Compilación automática con `watch`]]
- [[#10. Ejecutar directamente con `tsx`|10. Ejecutar directamente con `tsx`]]
- [[#11. Ejecutar TypeScript directamente con Node.js|11. Ejecutar TypeScript directamente con Node.js]]
- [[#12. Errores frecuentes|12. Errores frecuentes]]
- [[#13. Resumen de comandos|13. Resumen de comandos]]
- [[#14. Flujo recomendado para aprender|14. Flujo recomendado para aprender]]

---

# 1. ¿Cómo se ejecuta TypeScript?

TypeScript no debe entenderse simplemente como otro intérprete de JavaScript.

Su funcionamiento tradicional es:

```text
programa.ts
     │
     │ tsc
     ▼
programa.js
     │
     │ node
     ▼
   SALIDA
```

Por tanto, podemos distinguir dos operaciones:

```text
COMPILAR
TypeScript → JavaScript

EJECUTAR
JavaScript → Node.js
```

El compilador oficial de TypeScript se llama:

```text
tsc
```

Mientras que **Node.js** será el encargado de ejecutar el JavaScript generado.

> [!IMPORTANT]
> Una de las ideas fundamentales al aprender TypeScript es diferenciar entre **compilación** y **ejecución**.

---

# 2. Requisitos previos

Antes de comenzar debemos comprobar que **Node.js** y **npm** están instalados.

## 2.1. Comprobar Node.js

```bash
node --version
```

También podemos utilizar:

```bash
node -v
```

Por ejemplo:

```text
v22.23.3
```

---

## 2.2. Comprobar npm

```bash
npm --version
```

o:

```bash
npm -v
```

Si ambos comandos muestran una versión, podemos continuar.

---

## 2.3. Instalar TypeScript

Para proyectos resulta recomendable instalar TypeScript **dentro del propio proyecto**.

Creamos primero una carpeta:

```bash
mkdir ejemplo-typescript
cd ejemplo-typescript
```

Inicializamos un proyecto npm:

```bash
npm init -y
```

Esto crea el fichero:

```text
package.json
```

Instalamos TypeScript como dependencia de desarrollo:

```bash
npm install --save-dev typescript
```

También podemos utilizar la forma abreviada:

```bash
npm install -D typescript
```

Comprobamos la versión instalada:

```bash
npx tsc --version
```

Por ejemplo:

```text
Version 5.x.x
```

> [!TIP]
> `npx` permite ejecutar herramientas instaladas localmente dentro del proyecto sin necesidad de instalarlas de forma global.

---

# 3. Crear un proyecto TypeScript

Nuestro proyecto podría tener inicialmente esta estructura:

```text
ejemplo-typescript/
│
├── node_modules/
├── package.json
├── package-lock.json
└── programa.ts
```

Creamos el archivo:

```text
programa.ts
```

---

# 4. Crear nuestro primer programa

Contenido de `programa.ts`:

```typescript
const nombre: string = "Ana";
const edad: number = 20;

console.log(`Hola ${nombre}`);
console.log(`Tienes ${edad} años`);
```

Aquí estamos utilizando características propias de TypeScript:

```typescript
nombre: string
edad: number
```

Los tipos permiten que TypeScript compruebe posibles errores antes de ejecutar el programa.

Por ejemplo:

```typescript
let edad: number = 20;

edad = "veinte";
```

TypeScript detectará que estamos intentando asignar una cadena a una variable declarada como `number`.

---

# 5. Compilar TypeScript

Para compilar el archivo:

```bash
npx tsc programa.ts
```

El compilador genera:

```text
programa.js
```

Por tanto, tendremos:

```text
ejemplo-typescript/
│
├── programa.ts
├── programa.js
├── package.json
├── package-lock.json
└── node_modules/
```

El fichero `programa.js` contiene el código JavaScript generado por el compilador.

> [!NOTE]
> El JavaScript exacto generado dependerá de la configuración utilizada por TypeScript, especialmente del valor de `target`.

---

# 6. Ejecutar el programa

Una vez generado:

```text
programa.js
```

podemos ejecutarlo con Node.js:

```bash
node programa.js
```

Resultado:

```text
Hola Ana
Tienes 20 años
```

El ciclo completo es:

```bash
npx tsc programa.ts
node programa.js
```

---

# 7. Compilar y ejecutar

Durante los primeros ejercicios resulta recomendable realizar ambas operaciones por separado.

## Paso 1. Compilar

```bash
npx tsc programa.ts
```

## Paso 2. Ejecutar

```bash
node programa.js
```

Esto permite visualizar claramente el proceso:

```text
programa.ts
     │
     │ npx tsc programa.ts
     ▼
programa.js
     │
     │ node programa.js
     ▼
resultado
```

Ejemplo:

```typescript
const numero1: number = 10;
const numero2: number = 20;

const suma: number = numero1 + numero2;

console.log(`Resultado: ${suma}`);
```

Compilamos:

```bash
npx tsc programa.ts
```

Ejecutamos:

```bash
node programa.js
```

Resultado:

```text
Resultado: 30
```

---

# 8. Utilizar un `tsconfig.json`

Cuando tenemos varios archivos TypeScript no resulta cómodo compilarlos individualmente.

Podemos crear un fichero de configuración:

```text
tsconfig.json
```

mediante:

```bash
npx tsc --init
```

TypeScript generará automáticamente un fichero de configuración.

Para un proyecto sencillo de consola podríamos utilizar:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "strict": true,
    "rootDir": "./src",
    "outDir": "./dist"
  }
}
```

Organizamos entonces el proyecto:

```text
ejemplo-typescript/
│
├── src/
│   └── programa.ts
│
├── dist/
│
├── node_modules/
├── package.json
├── package-lock.json
└── tsconfig.json
```

Ahora basta ejecutar:

```bash
npx tsc
```

TypeScript utiliza el fichero:

```text
tsconfig.json
```

y genera:

```text
dist/programa.js
```

Ejecutamos:

```bash
node dist/programa.js
```

El flujo queda:

```text
src/programa.ts
       │
       │ npx tsc
       ▼
dist/programa.js
       │
       │ node
       ▼
     SALIDA
```

> [!IMPORTANT]
> Cuando ejecutamos simplemente `npx tsc`, TypeScript utiliza la configuración definida en `tsconfig.json`.

---

# 9. Compilación automática con `watch`

Durante el desarrollo podemos pedir a TypeScript que observe continuamente nuestros archivos.

```bash
npx tsc --watch
```

También puede utilizarse la forma abreviada:

```bash
npx tsc -w
```

La terminal permanecerá activa y TypeScript volverá a compilar cuando detecte modificaciones.

Podemos trabajar con dos terminales.

## Terminal 1

```bash
npx tsc --watch
```

## Terminal 2

```bash
node dist/programa.js
```

> [!TIP]
> El modo `watch` resulta especialmente útil cuando editamos continuamente varios archivos TypeScript.

---

# 10. Ejecutar directamente con `tsx`

Existe otra posibilidad muy cómoda para ejercicios y pequeños programas: utilizar **tsx**.

Instalamos:

```bash
npm install --save-dev tsx
```

o:

```bash
npm install -D tsx
```

Ahora podemos ejecutar directamente:

```bash
npx tsx programa.ts
```

o, si tenemos una carpeta `src`:

```bash
npx tsx src/programa.ts
```

El flujo se simplifica:

```text
programa.ts
     │
     │ npx tsx
     ▼
   SALIDA
```

Ejemplo:

```typescript
const mensaje: string = "Hola TypeScript";

console.log(mensaje);
```

Ejecutamos:

```bash
npx tsx programa.ts
```

Resultado:

```text
Hola TypeScript
```

Esta opción resulta especialmente cómoda para:

- ejercicios;
- scripts;
- ejemplos pequeños;
- pruebas rápidas;
- actividades de consola.

> [!NOTE]
> Aunque `tsx` agiliza la ejecución, al aprender TypeScript conviene comprender primero el proceso tradicional `tsc → node`.

---

# 11. Ejecutar TypeScript directamente con Node.js

Las versiones modernas de Node.js incorporan soporte para ejecutar determinados archivos TypeScript directamente.

Por ejemplo:

```bash
node programa.ts
```

Node puede eliminar determinadas anotaciones de tipo antes de ejecutar el código.

Por ejemplo:

```typescript
const edad: number = 20;
```

Sin embargo, esto **no sustituye completamente al compilador TypeScript**.

Node.js no realiza por sí mismo una comprobación de tipos equivalente a:

```bash
npx tsc
```

Además, determinadas características de TypeScript y configuraciones de `tsconfig.json` requieren un soporte más completo.

> [!WARNING]
> Que Node.js pueda ejecutar un `.ts` no significa que esté realizando la comprobación de tipos propia de TypeScript.

Para aprender el lenguaje resulta preferible mantener inicialmente separado el proceso:

```text
.ts
 │
 │ tsc
 ▼
.js
 │
 │ node
 ▼
salida
```

---

# 12. Errores frecuentes

## 12.1. `tsc` no se reconoce como comando

Si TypeScript está instalado localmente:

```bash
npm install -D typescript
```

utilizaremos:

```bash
npx tsc
```

en lugar de depender de una instalación global.

---

## 12.2. He modificado el `.ts` pero el resultado no cambia

Si ejecutamos:

```bash
node programa.js
```

debemos recordar recompilar previamente:

```bash
npx tsc programa.ts
```

El proceso es:

```text
MODIFICAR .ts
      ↓
COMPILAR
      ↓
GENERAR .js
      ↓
EJECUTAR .js
```

Otra posibilidad es mantener activa la compilación automática:

```bash
npx tsc --watch
```

---

## 12.3. Estoy ejecutando el archivo equivocado

Si tenemos:

```text
src/programa.ts
dist/programa.js
```

debemos ejecutar:

```bash
node dist/programa.js
```

y no:

```bash
node src/programa.js
```

---

## 12.4. No se genera el JavaScript

Podemos ejecutar:

```bash
npx tsc
```

para comprobar si existen errores de compilación.

También podemos consultar la configuración efectiva:

```bash
npx tsc --showConfig
```

---

## 12.5. `node programa.ts` no funciona

En versiones anteriores de Node.js puede no existir soporte directo para TypeScript.

Podemos utilizar el flujo tradicional:

```bash
npx tsc programa.ts
node programa.js
```

o ejecutar directamente con `tsx`:

```bash
npx tsx programa.ts
```

---

# 13. Resumen de comandos

| Objetivo | Comando |
|---|---|
| Comprobar Node.js | `node -v` |
| Comprobar npm | `npm -v` |
| Crear proyecto npm | `npm init -y` |
| Instalar TypeScript | `npm install -D typescript` |
| Ver versión de TypeScript | `npx tsc -v` |
| Crear `tsconfig.json` | `npx tsc --init` |
| Compilar un archivo | `npx tsc programa.ts` |
| Compilar el proyecto | `npx tsc` |
| Compilar continuamente | `npx tsc --watch` |
| Ejecutar JavaScript | `node programa.js` |
| Instalar `tsx` | `npm install -D tsx` |
| Ejecutar TypeScript con `tsx` | `npx tsx programa.ts` |
| Mostrar configuración efectiva | `npx tsc --showConfig` |

---

# 14. Flujo recomendado para aprender

Durante las primeras actividades:

```bash
npx tsc programa.ts
node programa.js
```

De esta forma queda clara la diferencia entre:

- **compilar**;
- **generar JavaScript**;
- **ejecutar JavaScript**.

Cuando trabajemos con un proyecto organizado:

```bash
npx tsc
node dist/programa.js
```

Y para pruebas rápidas:

```bash
npx tsx programa.ts
```

Podemos resumirlo así:

```text
              TYPESCRIPT
                  │
          ┌───────┴────────┐
          │                │
        tsc              tsx
          │                │
          ▼                │
     JavaScript            │
          │                │
        node               │
          │                │
          └───────┬────────┘
                  ▼
               SALIDA
```

> [!SUMMARY]
> **Flujo didáctico recomendado**
>
> ```text
> programa.ts
>      │
>      │ npx tsc
>      ▼
> programa.js
>      │
>      │ node
>      ▼
>    SALIDA
> ```
>
> Una vez comprendido este proceso, `tsx` permite simplificar la ejecución de scripts y ejercicios TypeScript desde consola.
