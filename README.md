# Página animada inspirada en el video

Proyecto hecho únicamente con:

- HTML
- CSS
- JavaScript
- Una imagen PNG del ramo extraída del video de referencia

## Estructura

```text
proyecto_pagina_tiktok/
├── index.html
├── README.md
├── css/
│   └── style.css
├── js/
│   └── script.js
└── assets/
    ├── images/
    │   └── ramo.png
    └── music/
        └── musica.mp3   <-- coloca aquí tu canción
```

## Música

Por las políticas de reproducción automática de los navegadores, la página espera
un clic del usuario.

Coloca tu archivo de música en:

`assets/music/musica.mp3`

La primera interacción con **"Toca para comenzar"** inicia simultáneamente:

1. La música.
2. La animación.
3. La transición de la escena amarilla.
4. La aparición del ramo.
5. Los textos finales.

Si tu archivo tiene otro nombre, modifica la etiqueta `<source>` de `index.html`.

## Ejecutar localmente

No necesita Node.js ni un framework.

Puedes abrir `index.html` directamente, aunque se recomienda utilizar
un servidor local para que el comportamiento sea idéntico al de Vercel.

Por ejemplo, con VS Code + Live Server.

## Publicar en GitHub + Vercel

1. Crea un repositorio en GitHub.
2. Sube todo el contenido de esta carpeta.
3. En Vercel selecciona el repositorio.
4. Framework Preset: `Other`.
5. Build Command: dejar vacío.
6. Output Directory: dejar vacío.
7. Deploy.

No hay rutas de servidor ni backend.

## Ajustar la sincronización

La animación está sincronizada aproximadamente con los 16.2 segundos del
video de referencia.

Los tiempos principales se encuentran en `css/style.css`:

- `line-one`: "Para ti"
- `line-two`: "con mucho"
- `love`: "AMOR"
- `yellowCurtain`: transición amarilla
- `bouquetReveal`: entrada del ramo
- `line-a`: "UN RAMO"
- `line-b`: "DE FLORES"
- `line-c`: "POR BONITA"

Si después quieres sincronizarla con una canción específica, estos tiempos
se pueden ajustar directamente en milisegundos/segundos mediante las reglas
de animación.

## Nota

El ramo utilizado como recurso visual fue aislado de un fotograma del video
proporcionado para reproducir la composición visual en una página web.


## Animación del ramo

El ramo ya no aparece como una imagen completa.

La página utiliza un `<canvas>` y una máscara animada para revelar la imagen
mediante una secuencia de pinceladas. El trazado comienza por el tallo y el
lazo, continúa por las ramas y hojas y después construye las flores pequeñas
y la flor central.

La duración del dibujo está controlada en:

`js/script.js`

Variable:

```javascript
const duration = 5800;
```

El valor está expresado en milisegundos. Puedes aumentarlo si quieres que el
ramo se dibuje todavía más lentamente.

## Corrección del ramo y responsive

El ramo se construye mediante una máscara de pintura calculada sobre la imagen PNG real. La animación dura aproximadamente 6.5 segundos y termina mostrando el 100 % del ramo. No depende de coordenadas manuales de cada flor.

El diseño del texto de la segunda escena usa posiciones independientes para `UN RAMO`, `DE FLORES` y `POR BONITA`, evitando el solapamiento en teléfonos.

El ramo y los textos utilizan `clamp()`, `vw`, `vh` y media queries para adaptarse a teléfonos pequeños, teléfonos altos, tablets y escritorio.
