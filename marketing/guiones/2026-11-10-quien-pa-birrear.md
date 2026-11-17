# ¿Quién pa' birrear hoy?

- **Slug:** 2026-11-10-quien-pa-birrear
- **Pilar:** Producto
- **Formato:** Demo (isométricos de `anatomy` + app real en mockup)
- **Duración:** unos 32 s
- **Objetivo:** registros
- **Voz:** Voicebox, perfil `efrain` (tu voz clonada en local)
- **Música:** `musica.wav`. Baja cuando Pa abre el celular y vuelve con todo en el ¡Match!

La grada es el pool: cada jugador sentado es una disponibilidad real, con el mismo badge que muestra la app. Se diferencia de "¿Sale una birria pa' hoy?" en que no hay mapa ni teletransportación: los invitados bajan de la grada a la cancha.

## Guion

- **Gancho (0–2 s):** "¿Quién pa' birrear hoy?" sobre una grada con gente sentada, palas en mano, y un badge lima encima de cada pala.
- **Tensión:** la grada se llena de gente que quiere jugar, pero nadie sabe con quién. MatchPa?: tienen cancha, les faltan 2.
- **Giro:** Pa abre MatchPa → Jugadores (filtrados por la sucursal de su partido) → ahí están los mismos de la grada → "Ey Pa, ¿juegas?" a dos → aceptan → bajan a la cancha uno por uno → ¡Match!
- **CTA:** "Ponte disponible o arma tu" y el logo MatchPa completa la frase. Debajo, "Link en la bio" chico.

## Voz en off

| #   | Intención                   | Texto                                                               |
| --- | --------------------------- | ------------------------------------------------------------------- |
| 1   | Pregunta al aire, con ganas | "¿Quién pa' birrear hoy?"                                           |
| 2   | Cómplice                    | "La grada llena… y nadie se habla."                                 |
| 3   | Decidido                    | "Tengo cancha, me faltan dos."                                      |
| 4   | Mostrando                   | "Abro MatchPa: los mismos de la grada, disponibles hoy en mi sucursal." |
| 5   | Cómplice                    | "Ey Pa, ¿juegas?"                                                   |
| 6   | Celebración                 | "Aceptaron… ¡y hacemos Match!"                                      |
| 7   | Cierre                      | "Ponte disponible o arma tu MatchPa. Link en la bio."       |

## Storyboard

| #   | Tiempo    | Visual                                                                                                                                                                                             | Texto en pantalla                                  | Voz / audio                                        | Motion                                                                                          |
| --- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 1   | 0–2 s     | Plano cerrado de la grada al lado de la cancha nocturna. 3 jugadores chibi sentados, cada uno con la pala parada y encima su badge "Disponible · 5–9 p. m."                                        | ¿Quién pa' birrear hoy?                            | Voz 1                                              | Título `kinetic-center-build`; los badges hacen `badge-pop` en cadena                           |
| 2   | 2–6 s     | Llegan 2 más y se sientan; sus badges aparecen. Todos miran el celular, nadie habla                                                                                                                | La grada llena…                                    | Voz 2                                              | Entran caminando con rebote; `pop` por badge; la cámara se abre un poco                         |
| 3   | 6–9 s     | Entran Pa y su pana por el costado de la cancha. Encima de la pala de Pa, el badge blanco con borde verde azulado "Buscando"                                                                       | Faltan 2                                           | Voz 3                                              | Cámara sigue a Pa; contador "2/4" junto al badge                                                |
| 4   | 9–11 s    | Pa saca el celular; la cámara entra a la pantalla                                                                                                                                                  | —                                                  | `swoosh-soft`; baja la música                      | `parallax-device-dive`                                                                          |
| 5   | 11–16 s   | **Toma `01-disponibles`**: lobby → Jugadores (filtrados por la sucursal del partido) → lista de 5 disponibles                                                                                                  | Disponibles hoy en mi sucursal                         | Voz 4                                              | `device-frame-stage`; `ui-focus-zoom` a la lista                                                |
| 6   | 16–17,5 s | Corte de vuelta a la grada: los nombres de la lista flotan sobre los 5 jugadores sentados                                                                                                          | Son ellos                                          | —                                                  | Etiquetas que salen del teléfono y vuelan a cada badge                                          |
| 7   | 17,5–21 s | **Toma `02-invitar`**: "Ey Pa, ¿juegas?" a Sacha → su partido de hoy en Pádel del Barrio → enviado. Repite con Mariana                                                                                      | Ey Pa, ¿juegas?                                    | Voz 5; `click` en cada envío                       | `ui-focus-zoom` al botón                                                                        |
| 8   | 21–26 s   | Grada. A Sacha le vibra el celular, sale "Aceptó"; su badge pasa de lima a gris "En partido", se levanta y baja a la cancha. Luego Mariana. Pa y su pana ya están en la cancha. Al cuarto: ¡MATCH! | 3/4 → 4/4 · ¡Match!                                | Voz 6; `notification` por aceptación; `cheer` bajo | `success-check`; caminata a la cancha; `number-pop-in` en el contador; `badge-pop` en "¡Match!" |
| 9   | 26–29 s   | Saque y peloteo corto. En la grada quedan 3 con su badge lima                                                                                                                                      | —                                                  | Golpe de pelota                                    | Cámara lenta al primer golpe                                                                    |
| 10  | 29–32 s   | La cámara se aleja; la cancha se vuelve un objeto y aparece el logo                                                                                                                                | Ponte disponible · o arma tu + logo MatchPa · Link en la bio | Voz 7                                              | `logo-sting`; `sparkle`                                                                         |

Los badges son los estados reales de la app (`docs/reglas-de-negocio.md`, "Estados del jugador"): **Disponible** lima, **Buscando** blanco con borde verde azulado, **En partido** gris. No se inventan otros.

## Grabación

- **Tomas de la app** (`videos/2026-11-10-quien-pa-birrear/tomas.mjs`, con `scripts/grabar.mjs`). Se parten de las de `2026-11-05-birria-pa-hoy`:
  1. `01-disponibles`: lobby → Jugadores, ya filtrados por la sucursal del partido → scroll a los 5 disponibles.
  2. `02-invitar`: "Ey Pa, ¿juegas?" a Sacha y a Mariana → su partido de hoy en Pádel del Barrio → "Listo, le enviamos la invitación".
     En el video corren a 1,5×.
- **Cambios al mock** (`frontend/lib/mock-api.ts`, commit aparte en el frontend):
  - Los 5 jugadores (ids 2–6) disponibles hoy en Pádel del Barrio (`branchId: 1`, nombre ficticio), con horarios distintos, para que la lista coincida con la grada.
  - El partido de Efrain en Pádel del Barrio con 1 invitado (el pana) y 2 puestos libres, para que diga "faltan 2".
- **Isométricos (`anatomy`):** cancha y personajes de `2026-10-30-que-es-matchpa` (`court.mjs`, `figures.mjs`). Nuevo: la grada (3 escalones al lado de la cancha) y el badge sobre la pala, con la forma y los colores del badge de la app.
- **Lo que no es la app:** la grada, los badges flotantes y las aceptaciones son gráficos. El teléfono solo muestra las tomas reales.

## Reglas de producto que el video respeta

- Pa invita a su partido abierto de hoy en su sucursal: solo se ofrecen partidos de la misma fecha y sucursal que la disponibilidad del invitado.
- Al aceptar, el jugador se suma al partido de Pa y deja de salir como disponible ese día: por eso su badge pasa a "En partido".
- Los que no fueron invitados siguen disponibles en la grada.

## Publicación

- **Fecha:**
- **Caption:** ¿Quién pa' birrear hoy? 🎾 La gente que quiere jugar ya está ahí: mira quién está disponible en tu sucursal y mándale un "Ey Pa, ¿juegas?". Link en la bio.
- **Hashtags:** #padel #padelpanama #panama #matchpa #birria

## Métricas (7 días)

| Alcance | Retención 3 s | Guardados | Compartidos | Visitas al perfil |
| ------- | ------------- | --------- | ----------- | ----------------- |
|         |               |           |             |                   |
