# Organiza tu partido

- **Slug:** 2026-11-17-organiza-tu-partido
- **Pilar:** Producto (organizador)
- **Formato:** Demo (app real en mockup)
- **Duración:** 21,5 s
- **Objetivo:** registros de organizadores; se manda por WhatsApp junto al carrusel `2026-11-17-para-organizadores`
- **Voz:** sin voz en off; el texto en pantalla cuenta la historia
- **Música:** `musica.wav`

## Guion

- **Gancho (0–2 s):** "¿Organizas partidos? ¿Te falta gente?"
- **Tensión:** "En MatchPa consigues al jugador que le falta a tu equipo": tres puestos llenos y el cuarto se vuelve una estrella.
- **Giro:** publicar → compartir en el grupo → piden unirse → llega el push "Nueva solicitud" → tú aceptas.
- **CTA:** "Te conseguimos al jugador estrella que le falta a tu partido" + logo, **matchpa.app**, "Link en la bio" y el mismo footer de "Síguenos @matchpa.app".

## Storyboard

| # | Tiempo | Visual | Texto en pantalla | Audio | Motion |
|---|---|---|---|---|---|
| 1 | 0–2,4 s | Logo arriba; abajo, footer con la pastilla "Síguenos" de Instagram y `@matchpa.app` grande en lima, fuera de la pastilla. Primer cuadro ya con logo y pregunta (portada) | ¿Organizas partidos? (una línea) · ¿Te falta **gente?** | `impact-bass-1` | Palabras que suben con rebote |
| 2 | 2,4–5,7 s | 4 puestos: 3 llenos y el cuarto "?" se vuelve estrella | En MatchPa consigues · al jugador que le falta a tu **equipo** | `whoosh-short`, `pop` por puesto, `sparkle` | Puestos con `back.out`; estrella que gira al entrar |
| 3 | 5,6–10 s | **Toma `01-publicar`**: hora 6:00 p. m., cancha 3, Pádel del Barrio, Siguiente, Crear nuevo partido | ① **Publica** tu partido | `swoosh-soft`, clics | Teléfono entra desde abajo; anillos de toque |
| 4 | 10–12,2 s | **Toma `02-compartir`**: detalle del partido, toque en Compartir | ② Compártelo en el **grupo** | clic | — |
| 5 | 12,2–14,8 s | Chat del grupo en colores de la marca: el link con su vista previa y "Listo, ya pedí unirme" | …y piden **unirse** | `whoosh`, `notification` | Burbujas que crecen desde su esquina |
| 6 | 14,5–17,9 s | **Toma `03-aceptar`**: baja el push real del organizador ("Nueva solicitud · Alguien quiere unirse a tu partido", de `backend/app/services/notifications.ts`) → Aceptar → Andrés pasa a Confirmados | ③ **Tú decides** quién entra | `notification`, `chime` | Push que baja sobre la pantalla y sube a los 1,6 s |
| 7 | 17,9–21,5 s | Cierre en verde con estrellas lima | Te conseguimos al jugador **estrella** que le falta a tu partido · logo · matchpa.app · Link en la bio · Síguenos @matchpa.app | `sparkle` | Entrada escalonada; estrellas que giran |

## Grabación

- Tomas de la app (`videos/2026-11-17-organiza-tu-partido/tomas.mjs`, reloj a las 3 p. m.): `01-publicar`, `02-compartir` y `03-aceptar`. La solicitud de Andrés Vega viene de `frontend/lib/mock-api.ts`.
- Todo texto que entra parte con `opacity: 0` en el CSS (clase `in`): si solo lo oculta el `fromTo` con `immediateRender: false`, se ve un cuadro antes de entrar y parece un glitch.
- En el grabador Compartir no abre la hoja nativa (el portapapeles está bloqueado), por eso el paso al grupo se cuenta con el chat dibujado.

## Publicación

- **Fecha:**
- **Caption:** ¿Organizas partidos y siempre falta uno? 🎾 Publícalo en MatchPa, pega el link en tu grupo y tú decides quién entra. Te conseguimos al jugador estrella que le falta a tu partido ⭐ Link en la bio 👉 matchpa.app
- **Hashtags:** #padel #padelpanama #padelpty #jugadoresdepadel #matchpa

## Métricas (7 días)

| Alcance | Retención 3 s | Guardados | Compartidos | Visitas al perfil |
|---|---|---|---|---|
| | | | | |
