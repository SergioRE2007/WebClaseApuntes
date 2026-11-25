# Clase del 2026-11-18 (bloque 1 de 2) · Otras (Git, gestión de proyectos, despliegue)

# Git y la actividad "Migración ReactiveForms, Git y Vercel" (18-11, parte 2)

## 1. Qué se explicó, en orden

| Minuto | Qué se hizo |
|---|---|
| 00:00-00:20 | En el terminal de VS Code, `git branch` enseña dos ramas: `master` y `refactor/reactive-form`, que ya tenía el refactor hecho. El profe cambia a `master` con `git switch master`. |
| 00:24-01:04 | Repasa en Google Docs la guía de la actividad "Actividad Migración ReactiveForms Git Vercel":<br>- Límite de la práctica.<br>- **Paso E**: crear la Pull Request de revisión, con base `main` y compare `feature/reactive-forms`.<br>- **Paso F**: si algo falla, diagnosticar con una tabla de síntomas y "Qué revisar primero". |
| 02:54-05:14 | Crea otra rama desde `master` para repetir el refactor en directo: `git switch -c refactor/reactive-form2` ("Switched to a new branch"). |
| 26:19 | Vuelve al terminal para enseñar otra vez esa secuencia de comandos. |

## 2. Conceptos

- **Una rama por refactor:** se crea desde la rama estable con `git switch -c`, se trabaja en ella y después se abre un PR de revisión contra `main`.
- **Vercel:**
  - Cada PR genera una **URL Preview** para revisarlo antes de mergear.
  - Si el build falla, lo primero es mirar los **Build Logs** y el **Root Directory** del proyecto.
  - Si sale un 404 al recargar una ruta de la SPA, falta un **rewrite** que mande todas las rutas a `index.html` para que las resuelva el Router de Angular.

## 3. Comandos

```bash
git branch
git switch master
git switch -c refactor/reactive-form2
```

## 4. Herramientas

- Git, GitHub (Pull Requests) y Vercel (despliegue y URL Preview).

## 5. Dudoso

- La guía usa `main` y `feature/reactive-forms`, pero el proyecto del profe usa `master` y `refactor/reactive-form2`.
- No se lee el contenido completo de la tabla de diagnóstico ni la configuración exacta del rewrite (`vercel.json`).
