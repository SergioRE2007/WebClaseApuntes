# Clase del 2026-10-09 · Otras (Git, gestión de proyectos, despliegue)

# Proyecto Intermodular: gestión de proyectos, objetivos SMART y desarrollo ágil con Jira (clase del 09/10/2026, Juan Antonio)

En esta clase no se programó nada. Fue teoría de gestión de proyectos con el documento de Google Docs **"Introducción a la Gestión de Proyectos"** (Classroom de *Proyecto Intermodular 26/27*, sección "Gestión de proyectos"). Antes, el profesor enseñó en directo un proyecto real que lleva en Jira y en Confluence.

## 1. Qué se explicó, en orden

| Minuto | Tema |
|---|---|
| 00:00-00:48 | Google Classroom: secciones **Gestión de proyectos** (material "Introducción a la Gestión de Proyectos") y **Lean Startup** (Exposición LeanCanvas, Manual de Lean Startup, Lean Canva). Abre el documento de teoría. |
| 03:55-04:21 | Busca "jira" en Google y entra en Jira con su cuenta de Atlassian. |
| 04:09-04:14 | **Tablero Kanban** de un proyecto real ("El Torcal ERP"): columnas, tarjetas con etiquetas (`frontend`, `backend`, `migration`, `security`, `no-regression`, `deuda-tecnica`, `cluster-global`...) y subtareas. |
| 04:21-05:20 | **Confluence**: página "Para ti", espacios favoritos, páginas de **Changelog** por mes, el espacio "ConnexIA" (página de inicio con descripción, buscador, filtro por etiquetas y árbol de contenido), una página de arquitectura en GCP con una tabla de variables (`project_id`, `region`, `environment`, `project_name`) y el espacio "Torcal Formación ERP Migration", con páginas numeradas (Use Case Catalogue, Business Rules Catalogue, Migration Strategy, Test Strategy, Executive Overview, Legacy System Map, Domain Clusters, Data Model, ADRs, Risk Register, Release Plan, Agent Operating Manual). |
| 06:07-07:39 | De vuelta en Jira: el tablero del sprint "S0 - Plataforma" (Por hacer 10, En curso 0, En revisión 8, Listo 40) y el detalle de una historia (ETE-1284) y de su subtarea (ETE-1292). Cómo está escrita una incidencia completa: Motivo, Contexto, Goal, Inventario de consumidores, Acceptance criteria (con *Scenario*), **Definition of Done** en casillas, **Objetivo SMART**, Criterios transversales (CT-1, CT-2), Entregables y Alcance. Campos de la derecha: persona asignada, etiquetas, sprint, informador, story points, horas estimadas (32). |
| 08:35-09:36 | Más vistas de Jira: **Backlog** (sprint con 62 actividades, estado, prioridad y puntos), **Resumen** (gráfico de anillo por estado: 150 actividades, Listo 80, Por hacer 46, En revisión 21, En curso 3; desglose por prioridad; tipos de trabajo: Subtask 43 %, Historia 34 %, Epic 16 %, Tarea, Error; carga del equipo, con un 70 % "Sin asignar" = 40/70; progreso de épicas) y **Cronograma** (timeline por trimestres). |
| 11:33-17:41 | Documento de teoría: introducción, "¿Por qué aprender gestión de proyectos en DAM?" y "Qué conseguiréis con este manual". |
| 19:40-21:40 | "La conexión con la realidad profesional" y las metodologías ágiles (Scrum, Kanban, tableros y backlogs). |
| 21:40-27:30 | **Objetivos SMART**: qué significa cada letra y la "Regla de oro". |
| 27:50 | "¿Cómo definir esos objetivos SMART?" (la plantilla). |
| 28:28-42:54 | **Ejemplos SMART**: autenticación, accesibilidad, persistencia y rendimiento, CI/CD, validación con usuarios y observabilidad. |
| 43:04-44:12 | Tabla **"Comparativa Vago vs. SMART"**. |
| 44:36-46:08 | **Errores comunes y cómo evitarlos** (5 errores). |
| 46:08-54:23 | **El desarrollo ágil** contado como una serie de televisión: épicas, historias de usuario, tareas y subtareas, Kanban y burndown chart. |

## 2. Conceptos que se enseñaron

### Gestión de proyectos
- Es planificar, organizar, ejecutar y controlar el desarrollo de un producto o servicio.
- La idea que más repite: un buen programador solo puede escribir código brillante, pero en el software profesional hace falta coordinarse, documentar, cumplir plazos y mantener la calidad. Un equipo bien gestionado hace soluciones completas que aguantan en el tiempo.
- Lo que promete el manual: aprender SMART, delimitar el alcance, definir entregables, usar Jira con backlog e historias de usuario (con criterios de aceptación) y unir la teoría con la práctica.

### Objetivos SMART
- **S**pecific (concreto), **M**easurable (medible), **A**chievable (alcanzable), **R**elevant (relevante) y **T**ime-bound (con plazo).
- **Regla de oro:** un objetivo tiene que poder comprobarse.
- **Plantilla para escribir uno:**
  - **Qué / Para quién** (S).
  - **Medida de éxito** (M): la métrica y su umbral.
  - **Viabilidad** (A): las tecnologías y el esfuerzo estimado en horas.
  - **Relevancia** (R): por qué importa.
  - **Plazo** (T): normalmente un sprint concreto.
  - **Entregables**: la prueba de que se ha conseguido.
  - **Riesgos y mitigación** (opcional).

### Ejemplos SMART del documento

| Objetivo | Qué/Para quién | M (medida) | A (cómo y horas) | R | T | Entregables |
|---|---|---|---|---|---|---|
| **Autenticación segura (Backend/API)** | Login con OAuth2 + JWT para Alumno y Profesor | ≥ 95 % de logins correctos con datos válidos; rechazos con mensajes coherentes; 0 endpoints críticos sin proteger | Spring Boot + Spring Security; 12-14 h | Acceso a recursos y protección de datos (RGPD/OWASP) | Antes del Sprint 2 | Endpoints `/auth/login` y `/auth/refresh`; ≥ 15 pruebas unitarias y de integración; documentación OpenAPI; ADR de la decisión de autenticación |
| **Accesibilidad en UI (Frontend)** | SPA accesible para quien usa lector de pantalla | WCAG 2.2 nivel AA, Lighthouse ≥ 90 en Accessibility y navegación completa por teclado | Angular 18 + Playwright; 10 h | Requisito institucional y mejor UX | Fin del Sprint 3 | Informe de Lighthouse, checklist WCAG, pruebas E2E de foco y teclado |
| **Persistencia y rendimiento (Datos)** | Optimizar las consultas de los listados de prácticas | p95 de respuesta ≤ 300 ms con 10k registros; índices comprobados | PostgreSQL + índices compuestos + plan de ejecución analizado; 8 h | (no se leyó entero) | Mitad del Sprint 4 [dudoso] | Script de migración, salidas de `EXPLAIN ANALYZE` y un test de rendimiento repetible |
| **CI/CD mínimo viable (DevOps)** | Pipeline automático de build, test y despliegue a staging | Pipeline en verde en < 8 min; cobertura ≥ 70 % en el core; despliegue reproducible con tag | GitHub Actions + Docker + Compose; 12 h | (no legible) | Fin del Sprint 2 | `workflow.yml`, `Dockerfile`, guía de despliegue y badges en el README |
| **Validación con usuarios (Producto/Emprendimiento)** | Validar la propuesta de valor con ≥ 5 entrevistas estructuradas | Síntesis con 3 hallazgos clave y decisiones de roadmap; task success ≥ 80 % en el prototipo | Prototipo navegable (Figma/Angular) + guion de test; 6 h | (no legible) | Dos semanas antes de la defensa intermedia | Informe de validación, grabaciones o anotaciones y backlog actualizado |
| **Observabilidad básica (Logs/Métricas/Trazas)** | (no legible) | 100 % de los endpoints con log de inicio y fin; latencia expuesta en `/metrics` y alerta si p95 > 500 ms | Micrometer + Actuator; 6 h | Imprescindible para diagnosticar y para la defensa | Fin del Sprint 3 | Panel básico en Grafana o captura de `/metrics`, y documentación de los indicadores |

Los ejemplos están pensados para Java/Spring y para una app de "prácticas" de alumnos y profesores. Hay que pasarlos a la tecnología de cada uno.

### Vago frente a SMART
Es una tabla de dos columnas: a la izquierda la frase vaga y a la derecha la versión SMART, con métrica, umbral y sprint.
- "Mejorar la seguridad" → implantar OAuth2 + JWT... (con métrica y sprint).
- "La app será rápida" → p95 medido con pruebas de carga (se nombra Gatling).
- "Hacer la interfaz accesible" → WCAG y Lighthouse con un umbral.

### Errores comunes al definir objetivos
1. **Confundir objetivo con tarea:** el objetivo es valor que se entrega, no una actividad.
2. **No medir:** sin métrica ni umbral, no se puede comprobar.
3. **Fechas elásticas:** "para más adelante" no vale; hay que poner un sprint o una fecha.
4. **Ambición desalineada:** mejor objetivos incrementales.
5. **Vaguedad técnica:** citar estándares concretos (OWASP, WCAG).

### Desarrollo ágil con Scrum y Jira, contado como una serie
- Scrum es el **mapa común** del equipo y Jira la herramienta donde se apunta.
- **Épicas = los grandes capítulos** (los arcos de una serie). Ejemplos: "Gestión de usuarios" y "Entrega de prácticas".
- **Historias de usuario = escenas vistas por el protagonista.** Formato: *Como [rol], quiero [acción], para [beneficio]*. Ejemplos: "Como alumno, quiero subir mis prácticas para que el profesor las corrija" y "Como profesor, quiero recibir notificaciones cuando un alumno entrega su trabajo". La idea: "no programamos por programar"; cada línea de código responde a una necesidad real.
- **Tareas y subtareas = el trabajo de rodaje** que hay detrás de cada escena. En Jira son las tareas y subtareas.
- **Kanban = "el río que fluye"**: un tablero por columnas con un límite de trabajo en curso (**WIP**).
- **Burndown chart = "la gráfica que cuenta la historia"**: cuánto trabajo queda en el sprint. Sirve para ver la **velocidad del equipo**.

### Lo que se vio del proyecto real en Jira y Confluence
Sirve de modelo de cómo documentar:
- **Historias bien escritas:** Motivo, Contexto, Goal, Acceptance criteria (escenarios), **Definition of Done** en casillas (por ejemplo, "typecheck / tests / boundaries en verde"), Objetivo SMART y Entregables.
- **Organización del trabajo:** etiquetas por área y prefijos en el título (`[PLATAFORMA]`, `[AUTH]`, `[GLOBAL]`).
- **Vistas de Jira:** Tablero, Backlog, Resumen (con gráficos que enlazan a búsquedas JQL) y Cronograma.
- **Confluence:** páginas de Changelog por mes, ADR (registro de decisiones de arquitectura), registro de riesgos, plan de releases y modelo de datos.

## 3. Código de ejemplo
No hubo. Solo salieron nombres sueltos dentro del texto: `/auth/login`, `/auth/refresh`, `/metrics`, `workflow.yml`, `Dockerfile`, `kube-dns-backup.yaml` y `EXPLAIN ANALYZE`.

## 4. Herramientas, tecnologías y estándares nombrados
- **Gestión:** Google Classroom, Google Docs, Jira, Confluence, Lean Canvas y Lean Startup.
- **En los ejemplos (solo de texto):**
  - Spring Boot, Spring Security, OAuth2, JWT y OpenAPI.
  - Angular 18, Playwright, Lighthouse y WCAG 2.2 AA.
  - PostgreSQL (índices compuestos, `EXPLAIN ANALYZE`).
  - GitHub Actions, Docker y Docker Compose.
  - Micrometer, Actuator y Grafana.
  - Gatling, Figma, RGPD y OWASP.
- No se instaló nada ni se ejecutó ningún comando.

## 5. Dudas y partes ilegibles
- En algunas capturas la barra de Meet tapa parte del texto: falta la R del ejemplo de Persistencia y las de CI/CD y Validación, y el "Qué/Para quién" de Observabilidad.
- **Plazo de Persistencia:** hay capturas que dicen "mitad del Sprint 4" y otras "fin del Sprint 2". Lo más probable es que el Sprint 4 sea de Persistencia y el Sprint 2 de CI/CD, porque aparecen en la misma pantalla.
- **Tabla Vago vs. SMART:** las celdas SMART de "rápida" y "accesible" no se leen enteras. Solo se ven Gatling, Lighthouse, p95 y WCAG.
- **Acceptance criteria de ETE-1284:** solo se lee el comienzo de un *Scenario*.
- **Lean Startup:** está en Classroom, pero en este vídeo no se explicó.
- **El vídeo se corta en el minuto 54:** a partir de "Tareas y subtareas" la explicación seguramente continuaba.
