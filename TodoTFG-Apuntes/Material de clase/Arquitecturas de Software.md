# **Arquitecturas de Software**

## Introducción

Las aplicaciones que usamos cada día \---desde una tienda online hasta una red social o una app móvil--- no son solo código: son el resultado de decisiones arquitectónicas que determinan cómo se estructuran, cómo crecen, cómo se comunican entre sí y cómo responden a las necesidades de los usuarios.

Este manual recorre las **arquitecturas más relevantes en el desarrollo moderno** y te acompaña de forma progresiva desde los modelos más clásicos hasta los enfoques más actuales. La meta es que entiendas **qué aporta cada arquitectura**, **cuáles son sus ventajas y desventajas**, y **qué casos de uso encajaría mejor** en cada una.

# **1\. El punto de partida: Cliente‑Servidor**

Para entender cualquier arquitectura moderna, primero hay que comprender el modelo más básico: **cliente-servidor**.  
Es el equivalente digital de pedir un café:

* Tú (cliente) haces una petición.  
* El barista (servidor) la procesa.  
* Te devuelve el café (respuesta).

Ese flujo tan simple es exactamente lo que ocurre cuando escribes una URL en el navegador.

### **¿Cómo funciona?**

1. El cliente envía una petición HTTP.  
2. El servidor ejecuta la lógica necesaria.  
3. El servidor devuelve una respuesta (HTML, JSON, archivos...).

### **Ventajas**

* Fácil de entender y desarrollar.  
* El servidor concentra el control.  
* El cliente puede ser muy ligero.

### **Inconvenientes**

* Si el servidor falla, todo se cae.  
* Escalabilidad limitada.  
* El cliente depende totalmente del servidor.

### **Casos de uso típicos**

* Webs simples.  
* APIs básicas.  
* Aplicaciones internas pequeñas.

# 

# **2\. Cuando el sistema crece: Arquitectura en N‑Capas**

A medida que una aplicación crece, mezclar toda la lógica en un único lugar se vuelve inmantenible. Por eso surge la arquitectura **multicapa**, que separa responsabilidades.

Una organización clásica puede tener:

* **Capa de presentación**: interfaz (web, móvil...)  
* **Capa de negocio**: reglas de negocio, validaciones.  
* **Capa de datos**: operaciones con base de datos.  
* **Base de datos**: almacenamiento persistente.

Cliente  
↓  
Presentación  
↓  
Lógica de Negocio  
↓  
Datos  
↓  
Base de datos

### **¿Qué aporta esta separación?**

* Orden y claridad.  
* Cada capa puede evolucionar sin tocar las demás.  
* Facilita las pruebas unitarias.  
* Fomenta la reutilización.

### **Ventajas**

* Buen nivel de mantenibilidad.  
* Independencia entre capas si está bien diseñado.  
* Soporta crecimientos razonables.

### **Inconvenientes**

* Más complejidad que cliente‑servidor.  
* A veces aparecen dependencias rígidas entre capas.  
* No es suficiente para sistemas gigantes.

# 

# **3\. Microservicios: la evolución para sistemas enormes**

Cuando una empresa opera en grande \---marketplaces, logística, banca digital, streaming--- un backend por capas puede quedarse pequeño. Aquí es donde nacen los **microservicios**.

En lugar de un único backend grande, la aplicación se divide en servicios pequeños, independientes y desplegables por separado.

### **Ejemplo conceptual**

   \[Servicio Usuarios\] → Maneja cuentas y roles  
   \[Servicio Pedidos\] → Registra compras y envíos  
   \[Servicio Notificaciones\] → Enviar emails/SMS

Cada servicio puede usar su propio lenguaje, base de datos y ritmo de desarrollo.

### **¿Por qué usar microservicios?**

* La empresa crece.  
* Hay varios equipos trabajando a la vez.  
* Se necesita alta escalabilidad.  
* El tráfico es muy desigual entre funcionalidades.

### **Ventajas**

* Escalabilidad granular.  
* Cada equipo trabaja en su propio servicio.  
* Fallos aislados: un servicio puede caer sin tumbar todo.  
* Flexibilidad tecnológica.

### **Inconvenientes**

* Muchísima complejidad en infraestructura.  
* La comunicación entre servicios es más lenta que en un monolito.  
* Requiere monitorización avanzada.  
* Depuración más difícil.

### **Tecnologías que suelen acompañarlos**

* **Docker** y **Kubernetes** para desplegar.  
* **Kafka**, **RabbitMQ**, **AWS SQS** para mensajería.  
* **API Gateway**, **Service Mesh**, **Tracing distribuido**.

### **Casos de uso reales**

* Amazon, Netflix, Uber, grandes SaaS.

# 

# **4\. Evolución del Frontend: SPA, SSR y aplicaciones isomórficas**

Mientras los backends evolucionaban, el frontend pasó por su propia revolución.

## **4.1 SPA (Single Page Application)**

Antes, cada vez que hacías clic en una web, la página se recargaba. Las SPA vinieron a cambiar eso: cargan una única página y luego actualizan solo lo necesario usando JavaScript.

Esto hace que la experiencia sea fluida, rápida y similar a una app de escritorio.

### **Ventajas**

* Interacción sin recargas.  
* Experiencia moderna.  
* Muy buen rendimiento en apps internas.

### **Inconvenientes**

* SEO difícil.  
* Carga inicial más pesada.  
* Requiere gestionar estado en frontend.

### **Tecnologías comunes**

* React  
* Angular  
* Vue  
* Svelte


## **4.2 SSR (Server‑Side Rendering)**

Para resolver los problemas de SEO y la carga inicial, aparece el **renderizado en servidor**.

Aquí el servidor genera el HTML final antes de enviarlo al navegador.

### **Ventajas**

* SEO perfecto.  
* Menor tiempo de primera carga.  
* Ideal para e-commerce y blogs.

### **Inconvenientes**

* Requiere más infraestructura.  
* Combinar SSR \+ SPA (hidratación) añade complejidad.

### **Frameworks populares**

* Next.js (React)  
* Angular Universal  
* Nuxt (Vue)  
* SvelteKit  
* Laravel Blade / ASP.NET Razor

# **5\. Desarrollo móvil: Nativo vs Híbrido**

Las aplicaciones móviles tienen sus propias reglas y compromisos.

## **5.1 Desarrollo Nativo**

Cada plataforma tiene su lenguaje oficial:

* iOS → Swift  
* Android → Kotlin

### **Ventajas**

* Máximo rendimiento.  
* Acceso total al hardware.  
* Mejor experiencia final.

### **Inconvenientes**

* Desarrollar dos apps es más caro.  
* Mantenimiento duplicado.

### **Casos ideales**

* Juegos avanzados.  
* Apps con cámara, sensores o GPS intensivo.  
* Aplicaciones críticas de alto rendimiento.

## **5.2 Desarrollo Híbrido / Multiplataforma**

Aquí se escribe una vez y se despliega en varias plataformas.

### **Tipos**

* **React Native**: JavaScript → componentes nativos.  
* **Flutter**: compila a nativo con alto rendimiento.  
* **Ionic/Capacitor**: interfaz web dentro de contenedor nativo.  
* **Kotlin Multiplatform**: comparte lógica, UIs independientes.

### **Ventajas**

* Ahorro de tiempo y costes.  
* Un solo equipo, un solo código.  
* Ideal para MVPs o apps corporativas.

### **Inconvenientes**

* No siempre igual de rápido que nativo.  
* Menos acceso directo al hardware.  
* Dependencia del framework.

# **6\. Conclusión: Un ecosistema que se complementa**

No existe una arquitectura "mejor que todas".  
Cada enfoque resuelve un tipo de problema:

* Cliente‑servidor → simplicidad.  
* N‑capas → orden y escalabilidad moderada.  
* Microservicios → crecimiento extremo y equipos distribuidos.  
* SPA → experiencias fluidas.  
* SSR → SEO y carga inicial.  
* Nativo → rendimiento máximo.  
* Híbrido → productividad y ahorro.

Elegir la arquitectura correcta es parte esencial del diseño de software profesional.  
