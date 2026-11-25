# Guía: `@Input()` y `@Output()` mediante decoradores en Angular

## Índice

- [1. Introducción](#1-introducción)
- [2. Componente hijo](#2-componente-hijo)
- [3. Componente padre](#3-componente-padre)
- [4. Flujo de comunicación](#4-flujo-de-comunicación)
- [5. Uso de Input](#5-uso-de-input)
- [6. Uso de Output](#6-uso-de-output)
- [7. El objeto event](#7-el-objeto-event)
- [8. Resumen](#8-resumen)

---

## 1. Introducción

Angular permite comunicar componentes mediante:

- `@Input()` para enviar datos de un componente padre a un componente hijo.
- `@Output()` para enviar eventos desde un componente hijo hacia su componente padre.

---

## 2. Componente hijo

El componente hijo recibe el nombre del alumno mediante `@Input()` y emite un evento mediante `@Output()` cuando se pulsa el botón.

```typescript
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-alumno',
  standalone: true,
  template: `
    <p>Alumno: {{ nombre }}</p>

    <button (click)="seleccionar()">
      Seleccionar
    </button>
  `
})
export class AlumnoComponent {

  @Input()
  nombre = '';

  @Output()
  seleccionado = new EventEmitter<string>();

  seleccionar(): void {
    this.seleccionado.emit(this.nombre);
  }
}
```

---

## 3. Componente padre

El componente padre envía el valor de `nombreAlumno` al hijo y escucha el evento `seleccionado`.

```typescript
import { Component } from '@angular/core';
import { AlumnoComponent } from './alumno.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AlumnoComponent],
  template: `
    <h1>Listado de alumnos</h1>

    <app-alumno
      [nombre]="nombreAlumno"
      (seleccionado)="mostrarSeleccion($event)">
    </app-alumno>

    <p>Seleccionado: {{ alumnoSeleccionado }}</p>
  `
})
export class AppComponent {

  nombreAlumno = 'Ana';

  alumnoSeleccionado = '';

  mostrarSeleccion(nombre: string): void {
    this.alumnoSeleccionado = nombre;
  }
}
```

---

## 4. Flujo de comunicación

```text
PADRE
  │
  │ [nombre]="nombreAlumno"
  ▼
HIJO
@Input() nombre
  │
  │ click
  ▼
@Output() seleccionado
  │
  │ emit(nombre)
  ▼
PADRE
(seleccionado)="mostrarSeleccion($event)"
```

---

## 5. Uso de `@Input()`

```typescript
@Input()
nombre = '';
```

`@Input()` permite que el componente hijo reciba información desde su componente padre.

En la plantilla del padre:

```html
<app-alumno
  [nombre]="nombreAlumno">
</app-alumno>
```

La propiedad:

```typescript
nombreAlumno = 'Ana';
```

se asigna al `@Input()` llamado `nombre` del componente hijo.

---

## 6. Uso de `@Output()`

```typescript
@Output()
seleccionado = new EventEmitter<string>();
```

`@Output()` permite que el componente hijo emita eventos que pueden ser escuchados por el componente padre.

El evento se emite mediante:

```typescript
this.seleccionado.emit(this.nombre);
```

El padre escucha el evento:

```html
<app-alumno
  (seleccionado)="mostrarSeleccion($event)">
</app-alumno>
```

---

## 7. El objeto `$event`

`$event` contiene el valor enviado por el componente hijo.

Si el hijo ejecuta:

```typescript
this.seleccionado.emit(this.nombre);
```

el valor de `this.nombre` llegará al padre mediante:

```html
(seleccionado)="mostrarSeleccion($event)"
```

y será recibido por:

```typescript
mostrarSeleccion(nombre: string): void {
  this.alumnoSeleccionado = nombre;
}
```

---

## 8. Resumen

```text
PADRE ──────── @Input() ────────> HIJO

PADRE <─────── @Output() ─────── HIJO
```

- `@Input()` → comunicación **padre → hijo**.
- `@Output()` → comunicación **hijo → padre**.
- `EventEmitter` → permite emitir el evento.
- `$event` → contiene el valor enviado por el hijo.
