# Analítica

GA4 cargado por Google Tag Manager (`GTM-KHLG4MHS`) con `<GoogleTagManager>` de `@next/third-parties`. Solo se carga si existe `NEXT_PUBLIC_GTM_ID`, así que local y previews no envían datos.

## Eventos

El frontend los empuja al `dataLayer` con `track()` (`frontend/lib/analytics.ts`). Esta tabla es el contrato con el contenedor de GTM: si cambia un nombre o parámetro, se cambia en los dos lados.

| Evento | Cuándo | Parámetros |
|---|---|---|
| `sign_up` | Registro con correo (tras `api.register`) o cuenta nueva de Google (`authEvent` de `GET /me`) | `method`: `email` \| `google` |
| `login` | Login con correo o con Google existente (`authEvent: google_login`) | `method` |
| `email_verified` | Tras verificar el código | `context`: `signup` \| `action` \| `profile` (de `?origen=` en `/verificar`) |
| `onboarding_complete` | Al guardar el onboarding | `category` |
| `publish_match` | Tras publicar | `match_type`, `category`, `max_players`, `branch`, `guests`, `from_invite`, `court_booked`, `lead_time`: `same_day` \| `next_day` \| `later` |
| `share` | Cuando `navigator.share` resuelve (cancelar no cuenta) o al copiar el link | `method`: `share_sheet` \| `story_image` \| `copy_link`, `content_type`: `match`, `sharer_role`, `match_status` |
| `view_match` | Una vez por apertura del detalle, con la sesión cargada | `match_status`, `viewer_role`: `organizer` \| `player` \| `visitor` \| `anonymous`, `spots_left`, `branch` |
| `join_intent` | "Inicia sesión para unirte" (sin sesión) | `branch` |
| `join_request` | Tras pedir unirse | `entry_point`: `lobby` \| `match_page`, `branch`, `level_gap`: `0` \| `1` \| `2_plus` |
| `join_approved` | Cuando el organizador acepta | `branch`, `fills_match` |
| `set_availability` | Tras marcar disponibilidad | `branch`, `has_time_window`, `day`: `today` \| `tomorrow` \| `later` |
| `confirm_booking` | El organizador confirma la cancha ("Ya reservé") | `branch`, `match_status` |
| `invite_player` | Tras invitar desde el pool o al publicar | `branch`, `entry_point`: `pool` \| `new_match` |
| `send_signal` | Al mandar una señal del partido | `kind`: `on_the_way` \| `arrived` \| `running_late`, `viewer_role`: `organizer` \| `player` |

`branch` es el `slug` de la sucursal. El contrato tipado vive en `frontend/lib/analytics.ts`.

La app empuja su propio `page_view` en la carga y en cada cambio de ruta. Todo `push` lleva `page_location` y `page_referrer` ya limpios (`cleanUrl` en `lib/analytics.ts`: el `code` pasa a `:code`, también dentro de `?next=`, y se quitan `invitar`, `nombre`, `email` e `internal`) y `traffic_type: internal` en los navegadores marcados con `?internal=1` (`?internal=0` desmarca). La medición mejorada de GA4 va apagada por completo: duplicaría las visitas sin limpiar y sus clics salientes mandarían URLs sin limpiar.

## Reglas

- Ningún evento lleva datos personales: ni id de usuario, nombre, correo ni teléfono. Los eventos propios tampoco llevan el `code` del partido.
- Ninguna URL de la app lleva datos personales: el correo de recuperación y el invitado de `/partidos/nuevo` pasan por `sessionStorage`. El `code` se limpia en GTM.
- Aviso de cookies informativo (`cookie-notice`), solo con GTM activo: GTM carga igual, sin esperar al aviso. Lo explica `/privacidad#cookies`.
- Los bloqueadores de anuncios ocultan una parte del tráfico: GA4 sirve para proporciones del embudo; los totales salen de la BD.

## Configuración en GTM

El contenedor se importa desde `ai-docs/analytics/gtm-container.json` (local) y se verifica con la checklist de la misma carpeta. Reglas:

- **Una etiqueta GA4 por evento**, con solo sus parámetros. GTM conserva las claves del `dataLayer` entre `push` y la app nunca recarga: una etiqueta genérica `{{Event}}` arrastraría parámetros de un evento a otro.
- Google tag `G-P6RE7HL8BN` con `send_page_view=false`. `GA4 - page_view` se dispara con el evento personalizado `page_view`, no en All Pages.
- Todas las etiquetas leen `page_location`, `page_referrer` y `traffic_type` del `dataLayer`. Sin variables de JavaScript ni HTML personalizado: el contenedor funciona con la CSP aplicada (sin `unsafe-eval`).
- En GA4: zona horaria `America/Panama`, retención de 14 meses, ocultar correos y los parámetros `email`, `invitar`, `nombre`, Google Signals apagado, `accounts.google.com` como referencia no deseada, dimensiones personalizadas registradas por cada parámetro de la tabla. Eventos clave: `sign_up`, `publish_match`, `join_request`, `join_approved`.
- Sin Meta Pixel ni remarketing mientras el aviso de cookies sea informativo.

## UTMs y links cortos

| Origen | Cómo llega |
|---|---|
| Link compartido por la app | `utm_source=matchpa&utm_medium=share&utm_campaign=partido&utm_content=link\|copy\|story` (`frontend/lib/share-url.ts`). El canonical no lleva query |
| Bio de Instagram | `/ig` → `utm_source=instagram&utm_medium=social&utm_campaign=bio` |
| QR en un club | `/c/<slug>` → `utm_source=<slug>&utm_medium=qr&utm_campaign=club_<slug>` |
| Mensaje en un grupo de WhatsApp de un club | `/w/<slug>` → `utm_source=whatsapp&utm_medium=social&utm_campaign=club_<slug>` |

Redirecciones 307 en `frontend/next.config.ts`; el slug solo acepta `[a-z0-9-]`. Cambiar el `utm_content` de `/ig` exige deploy.

## Métricas desde la BD

Los totales y la North Star (partidos con match por semana) salen de `node ace metrics:weekly [--weeks=8]` (`backend/commands/metrics_weekly.ts`): solo lectura, sin datos personales, semanas en `America/Panama`. "Con match" = partido jugado, `full` o `closed`, con al menos un jugador aceptado por la app. Aproximaciones: no hay `filled_at`, y las aprobaciones que luego salieron o fueron sacadas no cuentan.

## CSP

El sitio tiene una CSP (`frontend/next.config.ts`) con GTM y GA4 en lista blanca. Una etiqueta nueva en GTM que cargue scripts, imágenes o conexiones de otro dominio necesita agregar ese origen a `buildCsp()`; si no, la consola mostrará la violación (y cuando la CSP se aplique, la etiqueta no funcionará).
