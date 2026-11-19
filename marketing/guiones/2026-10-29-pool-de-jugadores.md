# El pool de jugadores

- **Slug:** 2026-10-29-pool-de-jugadores
- **Pilar:** Problema → Producto
- **Formato:** Explainer sin cara: motion, mockups e isométrico, con voz en off
- **Duración:** unos 34 s
- **Objetivo:** registros
- **Música:** beat urbano de unos 100 BPM, bajo debajo de la voz. Golpe seco en "¡Match!"
- **Arco:** caos en el chat → el partido se pierde → aparece MatchPa → el pool → invitación → ¡Match! → CTA

## Voz en off

Graba un archivo por línea en `marketing/grabaciones/2026-10-29-pool-de-jugadores/`, con 1 s de silencio antes y después. Haz 2 intentos de cada una dentro del mismo archivo.

| Archivo | Tono | Texto |
|---|---|---|
| `vo-01.m4a` | Cómplice, como quien cuenta un chisme | "Todos los días, el mismo mensaje en el grupo…" |
| `vo-02.m4a` | Cansado, bajando | "Y entre tanto mensaje… tu partido se pierde." |
| `vo-03.m4a` | Cambio de energía, con una sonrisa | "Por eso creé MatchPa." |
| `vo-04.m4a` | Claro, explicando | "Aquí tu partido no se pierde, y encuentras gente lista pa' jugar hoy." |
| `vo-05.m4a` | Curioso, mostrando | "Entra al pool: ahí están los jugadores disponibles, esperando su invitación." |
| `vo-06.m4a` | Ágil | "Los invitas, aceptan… y se suman a tu partido." |
| `vo-07.m4a` | Grito de celebración | "¡Match! Ya están los 4." |
| `vo-08.m4a` | Cierre firme | "Publica tu partido o ponte disponible. MatchPa: link en la bio." |

## Storyboard

| # | Tiempo | Escena | Texto en pantalla | Motion |
|---|---|---|---|---|
| 1 | 0–2 s | Fondo verde profundo. Un iPhone cae girando y queda de frente | — | iPhone 3D, rebote, *ping* de notificación |
| 2 | 2–6 s | Se abre un chat genérico, "Pádel Equipo Panamá" (sin logo de WhatsApp). Llueven mensajes: "Falta 1 pala pa' 3ra, 8pm hoy. ¿Quién?", "Faltan 2 pa' mixtos, $10, bolas nuevas", "¿Alguien de 4ta?", stickers, audios, "jajaja" | Subtítulos de la voz | `message-thread-reveal`, `typing-indicator`, scroll que acelera |
| 3 | 6–9 s | Los mensajes se apilan hasta tapar los pedidos; el de "Falta 1 pala" se hunde y se desenfoca | "Tu partido se pierde" | Desenfoque y alejamiento de cámara; el contador de no leídos sube a 99+ |
| 4 | 9–11 s | Destello lima. El chat se rompe y aparece el logo **Match**Pa | "MatchPa" | `torn-paper-rip` o `flash-through-white`, `logo-sting` |
| 5 | 11–15 s | El iPhone vuelve con MatchPa abierto. Las pantallas de publicar, el detalle y el lobby se separan en isométrico | "No se pierde" / "Gente lista hoy" | `exploded-stack` con las capturas reales |
| 6 | 15–21 s | Se toca "Pool" y la cámara sale del teléfono a una **cancha de pádel isométrica**. En la grada hay jugadores sentados con el celular en la mano; otros caminan alrededor de la cancha. Cada uno lleva un chip de categoría (3ra, 4ta, 5ta) y un punto lima de "Disponible" | "El pool de jugadores" | `parallax-device-dive`, escena isométrica en CSS 3D, jugadores con pequeños bucles de movimiento |
| 7 | 21–25 s | Un cursor toca a un jugador de la grada: "Invitar". Le vibra el celular y salta la notificación "Ey Pa, ¿juegas? Martes 8:00 p. m., WePadel" | "Invítalo" | Zoom de cámara al jugador, notificación tipo liquid glass |
| 8 | 25–27 s | El jugador toca **Aceptar**, se levanta y camina a la cancha. Los puestos pasan de 3/4 a 4/4 | "Acepta" | `success-check`, `number-pop-in`, el jugador entra a la cancha |
| 9 | 27–30 s | Los 4 jugadores quedan en la cancha. Explota "¡MATCH!" | "¡Match! Ya están los 4" | Texto que golpea, confeti lima y turquesa, golpe de cámara |
| 10 | 30–34 s | Dos tarjetas: "Publica tu partido" y "Ponte disponible". Cierra con el logo y "Link en la bio" | CTA | `cuboid-carousel` o tarjetas que se voltean, `logo-brand-close` |

### Montaje final (40 s)

Voz: tu voz clonada en HeyGen (`6d685b6554aa4ce1b8250fd467905fd8`), en `assets/vo-efrain/`. `node sync-vo.mjs <carpeta>` coloca cada línea en su beat y regenera subtítulos y ducking. Emiliano sigue en `assets/vo-emiliano/`. Tu grabación original sigue en `assets/vo/`. Los tiempos reales son: chat 0–12.3, revelación 12.3–16.4, isométrico 16.4–22, pool 22–26, invitación 26–30.5, ¡Match! 30.8–33.5, CTA 33.5–37 y cierre 37–40. Todavía no tiene música.

Subtítulos de toda la pieza con `caption-highlight`, y las palabras clave en lima: partido, se pierde, MatchPa, pool, invitas, ¡Match!

## Reglas de producto que el video respeta

- La invitación es a un partido que ya existe. Al aceptarla, el jugador **se suma** a ese partido: no se crea uno nuevo.
- El pool muestra a los jugadores disponibles **ese día**, con su categoría.
- Solo el organizador invita; el invitado acepta o rechaza.
- Las pantallas de MatchPa son las capturas reales (`docs/marca/capturas/`). Los jugadores de la cancha son ilustraciones.

## Publicación

- **Fecha:**
- **Caption:** ¿Tu partido se perdió otra vez en el grupo? 🎾 En MatchPa publicas tu partido o te pones disponible, y te invitan a jugar hoy. Link en la bio.
- **Hashtags:** #padel #padelpanama #panama #matchpa

## Métricas (7 días)

| Alcance | Retención 3 s | Guardados | Compartidos | Visitas al perfil |
|---|---|---|---|---|
| | | | | |
