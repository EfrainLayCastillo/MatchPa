# Voy en camino

- **Slug:** 2026-11-19-voy-en-camino
- **Pilar:** Producto (jugador y organizador)
- **Formato:** Demo (app real en mockup) + carrusel de 4 PNG en 1080×1350 con el mismo slug
- **Duración:** 17,6 s
- **Objetivo:** que se entiendan las señales del partido, que reemplazan al WhatsApp del organizador
- **Voz:** sin voz en off; el texto en pantalla cuenta la historia
- **Música:** `musica.wav`

## Guion

- **Gancho (0–2 s):** "Faltan 5 min pa'l partido · ¿Dónde **están?**"
- **Tensión:** el grupo con "¿Ya vienen?" y "Ey, ¿dónde están?" sin respuesta.
- **Giro:** en el partido, un toque en "Ya llegué" → aparece en Actividad para todos → le llega el push al organizador.
- **CTA:** "Menos ¿dónde están? y más pádel" + logo y el CTA unificado (matchpa.app en la web y en Instagram).

## Storyboard

| # | Tiempo | Visual | Texto en pantalla | Audio | Motion |
|---|---|---|---|---|---|
| 1 | 0–2,4 s | Logo arriba; footer "Síguenos" y `@matchpa.app` | Faltan 5 min pa'l partido · ¿Dónde **están?** | `impact-bass-1` | Palabras que suben con rebote |
| 2 | 2,4–5,6 s | Chat del grupo en colores de la marca, dos mensajes propios sin respuesta | Ya no tienes que **preguntar** | `whoosh-short`, `pop` por burbuja, `clock-tick` | Burbujas que crecen desde su esquina |
| 3 | 5,4–11,4 s | **Toma `01-avisar`**: `/partidos/llego30m`, baja a Actividad y toca "Ya llegué"; la burbuja lima entra a la derecha | ① Avisa con **un toque** · ② Todos lo ven **en vivo** | `swoosh-soft`, clic, `chime` al enviar | Teléfono desde abajo, zoom 1,22 sobre Actividad (7,9–10,2 s), anillo de toque |
| 4 | 11,3–13,6 s | "El teléfono de Sacha, el organizador" y el push real de `notifySignal`: "Carlos Batista · Ya llegué · Pádel del Barrio" | ③ Le llega al **organizador** | `whoosh`, `notification` | Push que baja con rebote |
| 5 | 13,6–17,6 s | Cierre en verde | Menos **¿dónde están?** y más pádel · logo · CTA unificado: "Búscanos como" **matchpa.app** · "Úsala en la web" · "Síguenos en IG" | `whoosh`, `sparkle` | Entrada escalonada |

## Grabación

- Toma `01-avisar` (`videos/2026-11-19-voy-en-camino/tomas.mjs`, reloj a las 7:30 p. m.): el partido `llego30m` de `frontend/lib/mock-api.ts` empieza a las 8 p. m., dentro de la ventana de señales, con Sacha, Esteban, Mariana y Carlos y sus señales ya cargadas.
- El paso `scrollTo` del grabador centra el grupo de botones "Avisar al grupo".
- El push va fuera del teléfono de Carlos: lo recibe el organizador (Sacha), nunca quien manda la señal.
- Carrusel en `carruseles/2026-11-19-voy-en-camino/`: la pantalla `assets/actividad.png` es el último cuadro de la toma `01-avisar`.

## Carrusel

| # | Fondo | Texto | Imagen |
|---|---|---|---|
| 1 | Verde | Pastilla "Faltan 5 min" · "¿Dónde **están?**" · "La cancha está lista y no sabes quién viene en camino." · "Desliza →" | Tres puntos lima de espera |
| 2 | Marfil | "Y el grupo, **en visto**" · "Preguntas, esperas y nadie contesta." | Chat del grupo con tres mensajes sin respuesta |
| 3 | Verde | "Avisa con **un toque**" · "Voy en camino, Ya llegué o Llego tarde. Todos los del partido lo ven al momento." | Detalle del partido completo; encima, zoom con borde lima a Actividad |
| 4 | Marfil | "Y el **organizador** se entera" · "Le llega la notificación al momento." · CTA unificado: "Búscanos como" **matchpa.app** · "Úsala en la web" · "Síguenos en IG" | Push "Carlos Batista · Ya llegué" · footer con logo y "Link en la bio" |

## Alt text

1. Texto: "Faltan 5 min. ¿Dónde están? La cancha está lista y no sabes quién viene en camino".
2. Chat de un grupo de pádel con tres mensajes sin respuesta: "¿Ya vienen?", "Ey, ¿dónde están?" y "¿Hola?".
3. "Avisa con un toque": teléfono con el detalle de un partido en MatchPa y la sección Actividad, con los avisos Voy en camino, Ya llegué y Llego tarde de cada jugador.
4. "Y el organizador se entera": notificación de MatchPa "Carlos Batista · Ya llegué, Pádel del Barrio" y "Búscanos como matchpa.app" en la web y en Instagram.

## Publicación

- **Fecha:**
- **Caption:** ¿Faltan 5 min y no sabes quién viene? 🎾 En MatchPa cada jugador avisa con un toque: Voy en camino, Ya llegué o Llego tarde. Todos lo ven y al organizador le llega al toque. Sin chats ni números 👉 matchpa.app
- **Hashtags:** #padel #padelpanama #padelpty #jugadoresdepadel #matchpa

## Métricas (7 días)

| Alcance | Retención 3 s | Guardados | Compartidos | Visitas al perfil |
|---|---|---|---|---|
| | | | | |
