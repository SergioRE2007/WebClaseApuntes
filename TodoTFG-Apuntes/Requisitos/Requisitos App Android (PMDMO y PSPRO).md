# Requisitos App Android

# Objetivo

Desarrollarás una aplicación Android de tema libre que cumpla con ciertos requisitos técnicos, demostrando tu dominio de las tecnologías y buenas prácticas estudiadas en clase. Este proyecto se hará en coordinación con el proyecto intermodular y servirá como instrumento de evaluación de los módulos de PSPRO y PMDMO.

# Requisitos de la Aplicación

**Persistencia Local con Room**: La aplicación debe almacenar datos localmente usando Room. Diseña las entidades y relaciones necesarias para el almacenamiento persistente.  
**Uso de Internet con Retrofit o Ktor:** La aplicación debe consumir datos de una API externa diseñada en el Proyecto Intermodular. Así podrás realizar sincronización de datos o consulta de información en tiempo real.  
**CRUD Completo en Múltiples Modelos:** Implementa al menos dos CRUDs completos en modelos relacionados (por ejemplo, “Usuario” y “Publicaciones” o “Pedidos” y “Productos”) para practicar el manejo de relaciones de base de datos y en la API.  
**Navegación (Compose):** La aplicación debe tener un flujo de navegación claro usando Compose y el componente de navegación.  
**Material Design:** Aplica Material Design 3 en la interfaz para lograr una experiencia de usuario moderna y coherente. Incluye componentes de Material Design, siguiendo buenas prácticas de diseño visual.  
**Inyección de Dependencias con Hilt:** Utiliza Hilt para inyectar dependencias en repositorios, ViewModels y servicios de Retrofit o Ktor.  
**Gestión de Estados con ViewModel:** Usa ViewModel para manejar los datos de la interfaz, asegurando que estos persistan y que la estructura de tu app sea desacoplada y organizada.  
**Concurrencia con Corutinas:** Implementa corutinas para tareas asincrónicas, como llamadas de red y consultas a la base de datos. Esto asegura una interfaz fluida y reactiva.  
**Localización en Inglés y Español:** La aplicación debe estar localizada en ambos idiomas.  
**Intents Implícito:** Implementa al menos un intent implícito (por ejemplo, para compartir contenido, abrir ubicaciones en mapas o enviar correos).  
**Uso de DataStore:** Implementa DataStore para el almacenamiento de preferencias de usuario, como configuraciones de idioma, temas de la aplicación o preferencias personales. Esto permitirá evaluar tu habilidad para trabajar con preferencias de manera eficiente y moderna.

# Entregables

**Diseño Preliminar (14 octubre 2026):** Presenta un diseño preliminar de la interfaz de usuario (en Figma, a mano, o con cualquier herramienta que prefieras) y de las bases de datos local y remota. Además, incluye una descripción breve del alcance de tu proyecto  
**Entrega Parcial (TBD)**: Entrega el avance de lo desarrollado hasta el momento para revisar el progreso y recibir retroalimentación.  
**Entrega Final (TBD):** Presenta el proyecto completo con todos los requisitos cumplidos.  
**Defensa del Proyecto (TBD):** Expón y defiende tu proyecto, explicando tus decisiones de diseño y la implementación de cada requisito.

# Criterios de Evaluación

**Funcionalidad**: Que la aplicación cumpla con los requisitos de CRUD, persistencia, consumo de la API y uso de DataStore para preferencias.  
**Calidad de Código:** Que uses correctamente Hilt, ViewModel, corutinas y DataStore.  
**Diseño de Interfaz**: Aplicación adecuada de Material Design.  
**Usabilidad y Navegación:** Estructura de navegación clara y localización correcta.  
**Documentación y Defensa:** Explicación clara de tus decisiones y el uso de cada componente requerido. Se debe demostrar que se entienden los conceptos de los módulos y se pueden solicitar demostraciones prácticas de dichos conceptos.
