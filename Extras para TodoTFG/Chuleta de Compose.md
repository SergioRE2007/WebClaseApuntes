# Chuleta de Jetpack Compose

Lo más básico de Compose, sacado del curso de AristiDevs "De CERO a Experto en Desarrollo Android" (https://www.youtube.com/watch?v=i1PNVWd_dTY). La parte de Compose va de 04:05:42 a 05:59:22. La navegación con rutas tipadas está en otro vídeo: https://www.youtube.com/watch?v=1OxiEaEWEe4

- **`@Composable`**: se pone encima de una función y la convierte en un trozo de pantalla. Solo se puede llamar desde otra función `@Composable`.
- **`@Preview`**: se pone encima de una función `@Composable` sin parámetros y enseña cómo queda en Android Studio sin abrir el emulador. Conviene que toda pantalla tenga uno.
- **`Text`**: enseña un texto en pantalla. `Text(text = "Hola")`
- **`Button`**: un botón que hace algo al pulsarlo. `onClick = { ... }` es lo que hace; lo que va entre llaves al final es lo que se ve dentro (normalmente un `Text`). `Button(onClick = { }) { Text("Aceptar") }`
- **`Image`**: enseña una imagen. `painterResource(R.drawable.x)` coge la imagen de la carpeta `drawable`, y `contentDescription` la describe para la accesibilidad (`null` si es decorativa). `Image(painter = painterResource(R.drawable.logo), contentDescription = "Logo")`
- **`Column`**: pone lo que lleva dentro uno debajo de otro (en vertical). `Column { Text("A"); Text("B") }`
- **`Row`**: pone lo que lleva dentro uno al lado de otro (en horizontal). `Row { Text("A"); Text("B") }`
- **`Box`**: pone lo que lleva dentro uno encima de otro (apilado), como capas. Sirve, por ejemplo, para poner un texto sobre una imagen. `Box { Image(...); Text("Encima") }`
- **`Modifier`**: se le pasa a casi cualquier composable para cambiar su tamaño, los márgenes o el fondo, o para que se pueda pulsar. Se encadenan con puntos y **el orden importa**. `Modifier.fillMaxWidth().padding(16.dp).background(Color.White).clickable { }`
  - `fillMaxSize()` / `fillMaxWidth()`: ocupa toda la pantalla / todo el ancho.
  - `size(48.dp)`: un tamaño fijo.
  - `padding(16.dp)`: espacio alrededor.
  - `background(color)`: el color de fondo.
  - `clickable { }`: hace algo al pulsarlo.
  - Como en clase, toda pantalla debería recibir `modifier: Modifier = Modifier`, para que quien la use pueda ajustarla desde fuera.
