# ¿Sale una birria pa' hoy?

- **Slug:** 2026-11-05-birria-pa-hoy
- **Pilar:** Producto
- **Formato:** Demo (isométricos de `anatomy` + app real en mockup)
- **Duración:** unos 30 s
- **Objetivo:** registros
- **Voz:** tu voz clonada en HeyGen (`6d685b6554aa4ce1b8250fd467905fd8`)
- **Música:** `musica.wav`. Baja en el mapa y vuelve con todo en el "¡pum!" de la teletransportación y en el ¡Match!

Continúa a "Qué es MatchPa", con Pa y la cancha nocturna. Allá Pa pedía unirse; aquí Pa organiza: tiene cancha en WePadel y le faltan 3.

## Guion

- **Gancho (0–2 s):** "¿Sale una birria de pádel pa' hoy?"
- **Tensión:** ¿quién está disponible y dónde?
- **Giro:** 23 sucursales en el mapa → WePadel → teletransportación a la cancha → los disponibles de WePadel → "Ey Pa, ¿juegas?" → aceptan → ¡Match!
- **CTA:** "¿Te falta una pala? Encuéntrala aquí." Encima del logo, y debajo "Link en la bio" chico.

## Voz en off

| # | Intención | Texto |
|---|---|---|
| 1 | Pregunta, con ganas | "¿Sale una birria de pádel pa' hoy?" |
| 2 | Curioso | "A ver quién está disponible…" |
| 3 | Impresionado | "Veintitrés sucursales en todo Panamá." |
| 4 | Decidido, y luego el golpe | "Le doy a WePadel y… ¡pum!, ya estoy en la cancha." |
| 5 | Claro | "Estos pueden jugar hoy aquí." |
| 6 | Cómplice | "Ey Pa, ¿juegas?" |
| 7 | Celebración | "Aceptaron… ¡y hacemos Match!" |
| 8 | Cierre, con guiño | "¿Te falta una pala? Encuéntrala aquí." |

## Storyboard

| # | Tiempo | Visual | Texto en pantalla | Voz / audio | Motion |
|---|---|---|---|---|---|
| 1 | 0–2 s | Pa (personaje chibi de `figures.mjs`) de pie con la pala y el celular, sobre fondo verde profundo | ¿Sale una birria pa' hoy? | Voz 1 | Título que se arma palabra por palabra (`kinetic-center-build`); Pa con anticipación y rebote |
| 2 | 2–4 s | La pantalla del celular de Pa se vuelve un pin lima que sube y se abre | ¿Quién está disponible? | Voz 2 | Transformación celular → pin; `swoosh-soft`; la música baja |
| 3 | 4–8 s | Mapa isométrico de Panamá (`anatomy`, SVG) con 23 pines en sus coordenadas reales: racimo en la ciudad, más La Chorrera, Colón y David | 23 sucursales | Voz 3 | Los pines caen con `stagger` desde el centro y rebote; `pop` cada 2; la cámara abre de la ciudad al país |
| 4 | 8–11 s | La cámara se acerca al racimo de la ciudad; el pin de WePadel crece y se marca. Toque. Del pin baja un haz lima y la cámara "cae" por él | WePadel · Centennial | Voz 4 hasta "y…" | Acercamiento con `expo.inOut`; `click` en el toque; `riser` corto antes del golpe |
| 5 | 11–13 s | ¡Pum! Destello lima y aparece la cancha nocturna (`court.mjs`). Pa se materializa en su lado de la cancha, solo | — | "¡pum!, ya estoy en la cancha." | Transición `flash-through-white` en lima; Pa entra con escala 0 → 1 y `back.out`; `impact-bass-1` |
| 6 | 13–18 s | Teléfono en primer plano. **Grabación 1**: lobby → Jugadores → sucursal WePadel → lista de disponibles | Disponibles hoy en WePadel | Voz 5 | `device-frame-stage`; `ui-focus-zoom` al filtro y luego a la lista |
| 7 | 18–21 s | **Grabación 2**: toca a un jugador → "Ey Pa, ¿juegas?" → invitación enviada. Repite con un segundo jugador | Ey Pa, ¿juegas? | Voz 6 | `ui-focus-zoom` al botón; `click` en cada envío |
| 8 | 21–25 s | Vuelta a la cancha. Llegan notificaciones "Aceptó tu invitación" y, por cada una, un jugador se teletransporta a la cancha con el mismo haz lima. Al llegar el cuarto: ¡MATCH! | ¡Match! · Ya están los 4 | Voz 7; `notification` por aceptación; `cheer` bajo | `notification-cascade`; haz de la escena 4 repetido por jugador; `badge-pop` en "¡Match!" |
| 9 | 25–30 s | Peloteo corto y la cámara se aleja hasta ver la cancha como un objeto; los pines del mapa vuelven y forman el logo | ¿Te falta una pala? · Encuéntrala aquí (sobre el logo) · Link en la bio | Voz 8 | Alejamiento; pines → logo (`logo-sting`); `sparkle` |

Transición única de la pieza: el pin y su haz lima. Fuera de eso, cortes secos al beat.

## Grabación

- **Grabaciones de la app:** automáticas con `node scripts/grabar.mjs 2026-11-05-birria-pa-hoy`. Graban el frontend en modo mock a partir de `videos/2026-11-05-birria-pa-hoy/tomas.mjs`:
  1. `01-disponibles`: lobby → Jugadores → sucursal → "we" → WePadel → los 3 disponibles.
  2. `02-invitar`: "Ey Pa, ¿juegas?" a Sacha y a Esteban → su partido de hoy en WePadel (Cancha 2, faltan 3) → "Listo, le enviamos la invitación".
  En el video corren a 1,5×. Los anillos de toque y los clics salen de `assets/tomas.json`.
- **Isométricos (`anatomy`, solo SVG):**
  - Mapa de Panamá con 23 pines desde las lat/lng de `backend/database/seeders/branch_seeder.ts`. Royal Padel Club no tiene coordenadas: su pin va en el centro de David, marcado en el código como aproximado.
  - Cancha y Pa: se reutilizan `court.mjs` y `figures.mjs` de `2026-10-30-que-es-matchpa`.
  - Haz de teletransportación: un cilindro isométrico lima con su halo.
  - Pines: palas de pádel (`anatomy/racket.mjs`, medidas reales: 45,5 × 26 × 3,8 cm, cara perforada, corazón, grip con cinta y tapa) paradas sobre el mango, con una pelota con costura encima. Cara marfil y pelota lima; WePadel al revés, en lima. El gancho y el cierre usan las mismas palas (`assets/racket-we.svg`, `assets/racket.svg`). En la ciudad, las palas se abren en abanico con WePadel al frente.
  - Cada pieza se revisa con el chequeo de `anatomy` antes de animarla.
- **Lo que no es la app:** el mapa, los pines y la teletransportación son gráficos. El teléfono solo muestra las grabaciones reales.

## Publicación

- **Fecha:**
- **Caption:** ¿Sale una birria pa' hoy? 🎾 Elige tu sucursal, mira quién está disponible y mándale un "Ey Pa, ¿juegas?". ¿Te falta una pala? Encuéntrala en MatchPa: link en la bio.
- **Hashtags:** #padel #padelpanama #panama #matchpa #birria

## Métricas (7 días)

| Alcance | Retención 3 s | Guardados | Compartidos | Visitas al perfil |
|---|---|---|---|---|
| | | | | |
