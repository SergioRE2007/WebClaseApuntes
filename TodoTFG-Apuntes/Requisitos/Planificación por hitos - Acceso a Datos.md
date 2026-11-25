**PLANIFICACIÓN POR HITOS**

**PI · Acceso a Datos**

Angular · Tailwind CSS · Express · ORM · PostgreSQL

# 

# **1\. Criterios de planificación**

La planificación se organiza en hitos semanales acumulativos. Cada semana se revisará una evidencia funcional del estado del proyecto, de modo que cada nuevo hito amplíe el trabajo anterior sin fijar un dominio de negocio concreto.

* Cada hito corresponde a una semana de trabajo con una dedicación.  
* La revisión semanal comprobará el avance real mediante una evidencia ejecutable o verificable.  
* El periodo navideño no incorpora nuevos hitos obligatorios.  
* La secuencia recorre frontend, diseño visual, servicios, API, persistencia, integración y lógica de negocio.  
* Los hitos son genéricos y deberán adaptarse al modelo funcional elegido por cada equipo.

# **2\. Temporalización por hitos**

La temporalización **aprox**. prevista comprende 11 hitos de desarrollo..

| Hito | Semana | Foco | Revisión / estado esperado |
| :---: | :---: | ----- | ----- |
| H1 | 29-30 oct. | Creación y estructura inicial | Proyecto creado y versionado. Frontend Angular y backend Express separados, estructura básica de carpetas, configuración inicial y arranque correcto de ambas aplicaciones. |
| H2 | 2-6 nov. | Layout y estilos | Layout general de la aplicación. Incorporación de Tailwind CSS y definición de criterios visuales comunes: estructura, espaciado, tipografía y navegación. |
| H3 | 9-13 nov. | Componentización y navegación | Componentes principales y reutilizables definidos. Angular Router configurado y navegación funcional entre las vistas principales. |
| H4 | 16-20 nov. | Vistas, formularios e interacción | Listados, vistas de detalle y formularios principales. Comunicación entre componentes y primeras validaciones. Puede emplearse información simulada. |
| H5 | 23-27 nov. | Servicios Angular | Servicios de acceso a datos e interfaces/tipos definidos. Separación clara entre componentes y comunicación con la futura API REST. |
| H6 | 30 nov.-4 dic. | Diseño de la API REST | Recursos, rutas, parámetros, cuerpos y respuestas definidos. Backend Express organizado en rutas, controladores y servicios. Contrato frontend-backend establecido. |
| H7 | 9-11 dic. | ORM y modelo de persistencia | Modelo de datos implementado mediante Prisma o TypeORM. Relaciones, restricciones y conexión con PostgreSQL. Primeras migraciones y preparación del seed. |
| H8 | 14-18 dic. | Endpoints y acceso a datos | Endpoints principales conectados a la base de datos. CRUD y consultas mediante ORM. Seed operativo con datos suficientes para probar la aplicación. |
| — | 21 dic.-10 ene. | Periodo sin nuevos hitos | Margen previo y posterior a Navidad. No se establece avance obligatorio durante el periodo no lectivo ni en las jornadas parciales de enlace. |
| H9 | 11-15 ene. | Integración Angular \- API \- BBDD | Sustitución de datos simulados por datos reales. Servicios Angular consumiendo la API y operaciones completas atravesando todas las capas. |
| H10 | 18-22 ene. | Consultas y lógica de negocio | Búsqueda, filtrado, ordenación y paginación desde backend/ORM. Consultas relacionales y operación de negocio con transacción cuando sea necesaria. |
| H11 | 25-29 ene. | Integración y revisión final | Validaciones frontend/backend, errores HTTP, integridad, estados de carga y ausencia de resultados. Revisión de migraciones, seed, configuración y funcionamiento global. |

# **3\. Dinámica de revisión semanal**

La revisión no exige que cada bloque funcional esté cerrado al 100 %. El objetivo es comprobar que existe un incremento verificable del producto y que el equipo puede explicar el estado de desarrollo.

| Aspecto de revisión | Evidencia mínima esperada |
| ----- | ----- |
| Ejecución | El proyecto arranca y puede demostrarse el avance realizado. |
| Integración | El nuevo hito se incorpora sin romper de forma permanente lo desarrollado anteriormente. |
| Arquitectura | Se mantiene la separación entre componentes, servicios, API, lógica y persistencia. |
| Trazabilidad | El repositorio refleja el avance mediante commits y una estructura comprensible. |
| Explicación técnica | El equipo puede justificar las decisiones adoptadas y señalar las tareas pendientes. |
| Rúbrica | En determinados hitos se aplica rúbrica de revisión relacionada con los contenidos temáticos trabajados hasta ese momento. |

