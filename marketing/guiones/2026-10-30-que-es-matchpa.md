# ¿Qué es MatchPa?

- **Slug:** 2026-10-30-que-es-matchpa
- **Pilar:** Problema → Producto (pieza de presentación, para fijar en el perfil)
- **Formato:** Animación isométrica (anatomy + HyperFrames) con voz en off
- **Duración:** unos 32 s
- **Objetivo:** visitas a matchpa.app
- **Voz:** Voicebox, perfil `Match` (app nativa en `http://127.0.0.1:17493`, Qwen3-TTS 1.7B; si no da, `VOICEBOX_MODEL=0.6B`)
- **Música:** beat urbano de jugadores de padel en una cancha de unos 100 BPM. Se apaga en la tensión y vuelve con todo en "¡Match!"
- **Protagonista:** "Pa", jugador de 4ta. Camiseta turquesa, pala lima.
- **Arco:** listo para jugar → el reloj corre y nadie responde → descubre MatchPa → encuentra un partido de su categoría → lo aceptan → ¡Match! y cancha confirmada → juegan → hecho por jugadores → matchpa.app

## Voz en off

Se genera línea por línea con Voicebox, desde `marketing/`:

```bash
VOICEBOX_URL=http://127.0.0.1:17493 node scripts/vo.mjs 2026-10-30-que-es-matchpa --solo 1
```

Cada línea queda en `assets/vo/vo-N.wav` con sus tiempos; se revisa y se pasa a la siguiente.

| #   | Tono                  | Texto                                                       |
| --- | --------------------- | ----------------------------------------------------------- |
| 1   | Cómplice              | "Pala lista, zapatos amarrados… y nadie con quien jugar."   |
| 2   | Ansioso, más rápido   | "Escribes en el grupo, miras la hora… y nada."              |
| 3   | Pausa, luego aliviado | "Hasta que descubres MatchPa."                              |
| 4   | Claro                 | "Ves los partidos de hoy en tu club, con tu categoría primero." |
| 5   | Decidido              | "Pides unirte al de las ocho…"                              |
| 6   | Celebración           | "El organizador te acepta, ¡y hacen Match!"                 |
| 7   | Energía               | "Ya están los cuatro y la cancha confirmada. ¡A jugar!"     |
| 8   | Cierre firme          | "Hecho por jugadores, pa' jugadores. Encuentra tu partido en matchpa punto app." |

## Storyboard

| #   | Tiempo  | Escena                                                                                                                                                    | Texto en pantalla                             | Motion                                                                                                    |
| --- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 1   | 0–3 s   | Cancha de pádel isométrica, de noche, con luces LED. "Pa" está sentado solo en la grada, con la pala en la mano y la pierna temblando                     | —                                             | Entrada desde arriba, zoom lento hacia la grada, luces que se encienden                                   |
| 2   | 3–7 s   | Un reloj en la pared marca 7:40 y salta a 7:52. Del celular de Pa salen globos de chat sin respuesta ("¿Alguien pa' las 8?", "¿?"); la cancha sigue vacía | "7:52 p. m."                                  | Las agujas giran rápido, los globos aparecen y se apagan en gris, la cámara tiembla un poco               |
| 3   | 7–10 s  | La pantalla del celular brilla en lima y la cámara se mete en ella. Aparece el logo **Match**Pa                                                           | "MatchPa"                                     | Zoom de cámara hacia el celular (`parallax-device-dive`), destello lima y golpe del logo                  |
| 4   | 10–14 s | Teléfono en primer plano con el **lobby real** (`lobby.png`). Las tarjetas de partidos de hoy entran ordenadas y se resalta una de 4ta a las 8:00         | "Partidos de hoy · tu categoría primero"      | Las tarjetas entran escalonadas, zoom a la tarjeta de las 8:00                                            |
| 5   | 14–17 s | Detalle del partido (`match.png`): toca **Pedir unirse**. Faltan 1 de 4                                                                                   | "Pide unirte"                                 | Toque con onda expansiva y el botón cambia a "Solicitud enviada"                                          |
| 6   | 17–20 s | Vuelta a la cancha. Tres jugadores ya calientan en la cancha. Al celular de Pa llega la notificación "¡Te aceptaron!", y aparece **¡MATCH!**              | "¡Match!"                                     | Salida del teléfono, notificación tipo liquid glass, confeti lima y turquesa                              |
| 7   | 20–25 s | Pa se levanta, entra por la puerta de vidrio y ocupa su lado. Peloteo: la pelota va y viene entre los 4                                                   | "Ya están los 4" · chip "Cancha 3"            | Camina hasta su posición, la pelota sigue un arco con estela y los jugadores mueven la pala en cada golpe |
| 8   | 25–30 s | La cámara se aleja hasta ver la cancha completa, que queda como un "objeto" sobre el fondo verde. Cierre con el logo, "Hecho por jugadores, para jugadores" y **matchpa.app** | "Encuentra tu partido en matchpa.app" | Alejamiento, logo, la URL en una pastilla lima y estrellas de 4 puntas                                    |

Los subtítulos van en toda la pieza con `caption-highlight`. En lima van: nadie, la hora, MatchPa, tu categoría, unirte, Match, cuatro, matchpa.app.

Producción: proyecto en `videos/2026-10-30-que-es-matchpa/`, voz de Voicebox en `assets/vo/` (las líneas 4, 7 y 8 cambiaron el 2026-11-16: hay que regenerarlas y reajustar los tiempos de esas escenas). Tiempos reales: espera 0–4, reloj y chat 4–8, logo 8.2–11, lobby 10.8–14.6, pedir unirse 14.6–17.3, aceptado y ¡Match! 17.3–21, peloteo 21–26 y cierre 26–31. El lobby real no tiene partido a las 8:00: se resalta el de 4ta del mié 28 · 8:30 p. m. `match.png` es la vista del organizador, así que "Pedir unirse" se muestra como toque sobre la tarjeta más la pastilla "Solicitud enviada", hasta tener una captura de la vista del jugador. La cancha y los personajes salen de `anatomy` (`anatomy/court.mjs` y `figures.mjs`).

## Encargo para anatomy (escenas 1, 2, 6, 7 y 8)

Una sola figura isométrica en **SVG** (sin WebGL ni 3D), de 1080×1920 y en tema oscuro con la paleta del brandbook. Cada parte va en un `<g id>` separado para animarla con GSAP:

- `court`: piso turquesa oscuro, líneas marfil, red y paredes de vidrio (fondo y laterales) con la puerta de acceso.
- `lights`: 4 postes con luces LED que se puedan encender.
- `clock`: reloj de pared con las agujas como grupos separados (`hand-hour`, `hand-min`).
- `bleacher`: grada de 3 escalones junto a la cancha.
- `pa`: el protagonista sentado, con `pa-leg` (pierna que tiembla), `pa-paddle` (pala lima) y `pa-phone` (celular con pantalla que se ilumina). Necesita además una pose de pie para cuando camina.
- `p1`, `p2`, `p3`: los otros tres jugadores de pie en la cancha, cada uno con la pala como grupo propio.
- `ball`: la pelota.
- Puntos de referencia: las coordenadas de pantalla de la puerta, de la posición de Pa en la cancha y de cada jugador, para calcular los recorridos.

## Reglas de producto que el video respeta

- El lobby **no filtra**: ordena los partidos poniendo primero tu categoría y después las más cercanas.
- El jugador **pide unirse** y el **organizador acepta**. Al llenarse los 4 puestos, el partido pasa a completo ("¡Match!").
- La cancha puede publicarse "por reservar"; al confirmarla, los jugadores ven "Cancha N". El video muestra el caso confirmado.
- Las pantallas de la app son capturas reales (`assets/marca/`). La cancha y los jugadores son ilustraciones.
- El dominio es `matchpa.app` (`docs/reglas-de-negocio.md`, Link para compartir).

## Publicación

- **Fecha:**
- **Caption:** ¿Listo pa' jugar y nadie responde? 🎾 MatchPa te muestra los partidos de hoy, de tu categoría, pa' que hagas Match en minutos. Link en la bio 👉 matchpa.app
- **Hashtags:** #padel #padelpanama #panama #matchpa

## Métricas (7 días)

| Alcance | Retención 3 s | Guardados | Compartidos | Visitas al perfil |
| ------- | ------------- | --------- | ----------- | ----------------- |
|         |               |           |             |                   |
