# Motion: piezas del catálogo aprobadas

Instala cada pieza con `npx hyperframes add <nombre>`. Lee este archivo solo al componer. Para buscar algo que no esté aquí, usa `npx hyperframes catalog <palabra>`.

## Subtítulos

Van siempre, quemados en el video:

- Salen de la transcripción. Para generarla: `npx hyperframes init --video <toma> --language es`, o con la skill `embedded-captions`.
- Máximo 3 palabras por línea, centrados, entre 1/2 y 2/3 de la altura y dentro de la zona segura.
- Bricolage o Archivo bold, en marfil con contorno verde profundo. La palabra clave va en lima.
- Estilo por defecto: `caption-highlight`. Para frases de impacto, `caption-kinetic-slam`. Para un tono más calmado, `caption-pill-karaoke`.

## La app en pantalla

| Uso | Pieza |
|---|---|
| Grabación o captura dentro de un teléfono | `device-frame-stage`, o `vfx-iphone-device` si va en 3D |
| Toques sobre la grabación | Anillos lima desde `TOMAS[id].taps` (los escribe `scripts/grabar.mjs`), no a ojo |
| Zoom a un botón o una acción | `ui-focus-zoom`, `cursor-zoom-follow` |
| Entrar al teléfono o salir de él | `parallax-device-dive` |
| Recorrido por varias pantallas | `sticky-mock-swap`, `multi-device-splay` |
| Chat de WhatsApp (el problema) | `chat-thread`, `message-thread-reveal`, `typing-indicator` |
| Notificaciones push | `notification-cascade` |
| Puestos que se llenan, contadores | `number-pop-in`, `badge-pop`, `success-check` |

- El teléfono va grande: pantalla de 560 px de ancho, centrada, de `top: 190px` hasta encima de los subtítulos. Con 408 px no se leía la app.
- Solo se muestran textos que existen en la app. Si un momento no tiene pantalla (por ejemplo, el jugador que acepta), se cuenta con gráficos (✓, cambio de badge), no con una notificación inventada. El push real al organizador cuando aceptan dice "¡Match! · Ya estás en el partido".
- Los estados de jugador que salen como badges son los de la app: **Disponible** lima con su horario, **Buscando** marfil con borde turquesa y **En partido** gris (`docs/reglas-de-negocio.md`, "Estados del jugador").
- Nunca marcas reales de clubes o sucursales, ni en la app grabada ni en los subtítulos. El mock usa una sucursal ficticia, **Pádel del Barrio** (`branchId: 1`), y el texto dice "mi sucursal" o "tu sucursal".

## Isométrico y 3D

- Las escenas isométricas complejas (cancha, jugadores, objetos) las dibuja la skill `anatomy`, solo en modo **SVG**: sus shaders WebGL y el 3D beta no garantizan un render idéntico cuadro a cuadro. Cada parte va en un `<g id>` y se anima con GSAP en HyperFrames.

- `exploded-stack`: pantallas apiladas en isométrico que se separan. Muestra el flujo completo en un plano.
- `multi-device-splay`: varios teléfonos abiertos en abanico.
- `cuboid-carousel`, `orbit-card`: tarjetas en 3D para las funciones.
- `extruded-logo`: logo en 3D para el cierre.

Detalles que ya se corrigieron y no deben volver:

- **Pala de pádel:** cara ovalada con grosor y borde (`faceOf` en `anatomy/figures.mjs`), nunca un rectángulo.
- **Sentados en la grada:** los pies se apoyan en el escalón de abajo (`seated(..., { drop: TIERS[0] })`), no se estiran hasta el suelo.
- **Badges sobre los personajes:** en isométrico, subir un escalón también corre al jugador en diagonal. Los del escalón de atrás van intercalados entre las columnas de adelante y con el badge más alto (`LIFT`), y `npm run check` no debe reportar `content_overlap` entre badges.
- **Personas que caminan:** dos copias por personaje (`-out` fuera de la cancha, `-in` dentro) y se cambia de una a otra en la puerta, para que el orden de pintado con la malla sea correcto.

## Transiciones

| Momento | Pieza |
|---|---|
| Del problema a la solución | `whip-pan-cut`, `flash-through-white` |
| Entre pantallas de la app | `page-slide`, `directional-wipe`, `match-cut` |
| Al ritmo de la música | `beat-freeze-cut` |
| Revelado con textura urbana | `torn-paper-rip`, `hw-scribble-transition` |

## Texto y cierre

- Títulos: `kinetic-center-build`, `per-word-rise`, `kinetic-type-swap`.
- Acentos manuscritos (Yellowtail): `hw-title`, `hw-write-title`.
- Cierre: `logo-sting` o `logo-brand-close`, y después `instagram-follow`.
- El cierre es limpio: frase, logo y "Link en la bio", sin palas ni objetos cayendo. La frase puede terminar en el logo ("o arma tu" + **Match**Pa) en vez de repetir la palabra.

## Principios de movimiento

Adaptados de [hyperframes-motion-reel-skill](https://github.com/Sunwood-ai-labs/hyperframes-motion-reel-skill). Su render a 60 fps, el tempo fijo de 120 BPM y el audio sintetizado no aplican: aquí se trabaja a 30 fps, con el beat de la música y con el catálogo de sonidos.

- Nada de cadenas de `fadeIn`/`fadeOut`. Cada movimiento tiene una intención:
  - rebote al llegar: `back.out(2)`
  - anticipación: un tirón corto hacia atrás antes de `expo.out`
  - hijos que llegan un par de cuadros después del padre
  - `stagger` desde el centro o desde los bordes
- Contraste de ritmo: rápido → pausa → explosión, o apretado → suelto. No todas las escenas a la misma velocidad.
- El texto es material gráfico: pocas palabras y fuertes, títulos de 90 px o más, y escala, máscara (`clipPath`) o salida del cuadro. Si un título sale del cuadro a propósito, lleva `data-layout-bleed="true"`.
- Las transiciones entre escenas conectadas transforman un elemento en el siguiente (el pin se vuelve el botón, el número se vuelve el logo), no hacen un cruce de fundido. Esas escenas van como fases dentro de una misma composición; solo los cortes secos van como subcomposición.
- Todo determinista para que el render salga igual cuadro a cuadro: una sola timeline GSAP en pausa, sin `Math.random()` ni `Date.now()`, y con secuencias pseudoaleatorias de semilla fija.
- Revisión: un `snapshot` en el pico de cada escena, no solo al inicio.

## Reglas

- Todo isométrico u objeto dibujado (cancha, jugadores, mapa, pins, teléfono en 3D) se hace con la skill `anatomy` en SVG, y su calidad se revisa con el chequeo de esa skill antes de animarlo en HyperFrames: orden de pintado, sombreado de cuatro tonos y piezas en `<g id>`.
- Usa una o dos transiciones por pieza, siempre las mismas: cambiar en cada corte se ve barato.
- Cambia los colores de cada pieza a los del brandbook al instalarla.
- Los cortes caen en los beats: `npx hyperframes beats`.
