# **Requisitos de Acceso a Datos del Proyecto Intermodular**

## **1\. Objetivo y arquitectura**

El proyecto consistirá en el desarrollo de una **aplicación web completa con persistencia de datos**, organizada mediante una arquitectura por capas.

La solución deberá integrar:

* **Angular** para la interfaz de usuario.  
* **Node.js \+ Express/Nest** para el backend.  
* **Prisma/TypeORM** como ORM.  
* **PostgreSQL** como base de datos relacional.  
* **API REST / JSON** para la comunicación entre frontend y backend.

La arquitectura deberá mantener una separación clara entre presentación, lógica de aplicación y persistencia:

* Angular   
* HTTP / JSON  
* API REST  
* Servicios / lógica de aplicación  
* ORM  
* PostgreSQL

La interfaz tendrá un **peso relevante dentro del proyecto**, pero deberá estar respaldada por una capa de acceso a datos suficientemente completa.

## **2\. Interfaz Angular**

Angular constituirá la principal vía de interacción con la aplicación.

La interfaz deberá incorporar, según las necesidades del proyecto:

* navegación entre diferentes vistas  
* componentes reutilizables  
* listados y vistas de detalle  
* formularios de creación y modificación  
* eliminación con confirmación  
* búsqueda, filtrado y ordenación  
* paginación  
* estados de carga, ausencia de datos, errores y confirmaciones

La aplicación deberá estar correctamente **componentizada**, atendiendo a criterios de responsabilidad, reutilización y mantenimiento.

La comunicación entre componentes deberá utilizar adecuadamente los mecanismos proporcionados por Angular. El acceso a la API deberá realizarse mediante **servicios Angular**, evitando incluir directamente en los componentes la lógica de comunicación HTTP.

Los formularios deberán incorporar validaciones y mensajes de error adecuados. Se valorará especialmente el uso de **formularios reactivos**.

La navegación deberá gestionarse mediante **Angular Router**.

## **3\. Modelo de datos y persistencia**

La aplicación deberá disponer de un modelo relacional suficientemente completo para demostrar el uso de un ORM y el tratamiento de información relacionada.

El modelo deberá incluir:

* varias entidades persistentes  
* claves primarias y externas  
* campos obligatorios y opcionales  
* restricciones y valores únicos cuando proceda  
* relaciones entre entidades

Deberán existir, como mínimo, relaciones **1** y **N**, y estas relaciones deberán utilizarse realmente en las funcionalidades de la aplicación.

La persistencia deberá implementarse mediante **Prisma o TypeORM**, definiendo correctamente modelos, relaciones, restricciones e integridad.

La evolución del esquema deberá gestionarse mediante **migraciones**, que deberán conservarse en el repositorio.

Además, el proyecto deberá proporcionar un mecanismo de **seed** con datos suficientes para comprobar las principales funcionalidades sin necesidad de introducir manualmente toda la información.

## **4\. API REST y organización del backend**

El backend deberá proporcionar una **API REST** que permita a Angular realizar las operaciones necesarias sobre los datos.

Cuando proceda, deberán implementarse operaciones equivalentes a:

* GET  
* GET por identificador  
* POST  
* PUT / PATCH  
* DELETE

El backend deberá presentar una organización modular, separando responsabilidades de forma equivalente a:

* Rutas  
* Controladores  
* Servicios  
* ORM  
* Base de datos

No se considerará adecuada una solución que concentre rutas, lógica de negocio y acceso a datos en un único fichero.

## **5\. Operaciones y consultas de acceso a datos**

La aplicación deberá permitir realizar operaciones de **creación, consulta, modificación y eliminación** sobre varias partes significativas del modelo.

El proyecto no podrá limitarse exclusivamente a operaciones CRUD básicas. Mediante el ORM deberán utilizarse también:

* consultas por diferentes criterios  
* información relacionada entre entidades  
* filtros  
* ordenaciones  
* selección de campos  
* búsquedas  
* paginación

Las relaciones definidas en el modelo deberán ser utilizadas por el backend y tener una repercusión real en la interfaz.

Al menos uno de los principales listados deberá permitir **búsqueda, filtrado, ordenación y paginación**.

Estos criterios deberán enviarse desde Angular al backend y convertirse en consultas realizadas mediante el ORM. Cuando el volumen de datos lo justifique, no se considerará adecuada una solución que descargue todos los registros y realice exclusivamente estas operaciones en Angular.

La API deberá proporcionar la información necesaria para gestionar correctamente la paginación desde la interfaz.

## **6\. Operaciones de negocio y transacciones**

El proyecto deberá incorporar al menos una **operación de negocio que implique varias acciones relacionadas sobre los datos** y que no pueda reducirse a una única operación CRUD.

Esta funcionalidad podrá incluir:

* comprobaciones previas  
* creación o modificación de información relacionada  
* actualización de estados  
* aplicación de reglas de negocio  
* mantenimiento de la consistencia de los datos

Cuando una operación implique varias modificaciones relacionadas y exista riesgo de dejar los datos en un estado inconsistente, deberá utilizarse una **transacción**.

La transacción deberá garantizar que todas las operaciones se realizan correctamente o que, en caso de error, ninguna modificación parcial quede aplicada.

## **7\. Validación, errores e integridad**

Los datos deberán validarse tanto en Angular como en el backend.

El servidor deberá comprobar, cuando proceda:

* campos obligatorios  
* tipos y formatos  
* rangos y valores permitidos  
* existencia de datos relacionados  
* restricciones del modelo  
* reglas de negocio

La API deberá utilizar códigos HTTP adecuados para diferenciar operaciones correctas, peticiones incorrectas, recursos inexistentes, conflictos y errores internos.

Angular deberá capturar estos errores y proporcionar información comprensible al usuario.

La aplicación deberá garantizar además la **integridad de los datos**, especialmente en relación con claves externas, restricciones de unicidad, eliminaciones relacionadas y operaciones parciales.

Las variables sensibles o dependientes del entorno, como cadenas de conexión o credenciales, deberán almacenarse mediante **variables de entorno** y no directamente en el código.

## **8\. Requisitos mínimos de Acceso a Datos**

Para considerar suficientemente desarrollada la parte correspondiente al módulo de **Acceso a Datos**, el proyecto deberá incorporar:

| Requisito |  |
| ----- | ----- |
| PostgreSQL | ✓ |
| Prisma o TypeORM | ✓ |
| Varias entidades persistentes y relacionadas | ✓ |
| Relaciones 1 y N | ✓ |
| Migraciones | ✓ |
| Seed de datos | ✓ |
| Operaciones CRUD | ✓ |
| Consultas relacionales y por criterios | ✓ |
| Búsqueda y filtrado | ✓ |
| Ordenación y paginación | ✓ |
| API REST | ✓ |
| Validación en backend | ✓ |
| Gestión de errores | ✓ |
| Operación de negocio | ✓ |
| Uso de transacciones | ✓ |
| Consumo de la API desde Angular | ✓ |

