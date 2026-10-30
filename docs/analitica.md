# Analítica

GA4 cargado por Google Tag Manager (`GTM-KHLG4MHS`) con `<GoogleTagManager>` de `@next/third-parties`. Solo se carga si existe `NEXT_PUBLIC_GTM_ID`, así que local y previews no envían datos.

## Eventos

El frontend los empuja al `dataLayer` con `track()` (`frontend/lib/analytics.ts`). Esta tabla es el contrato con el contenedor de GTM: si cambia un nombre o parámetro, se cambia en los dos lados.

| Evento | Cuándo | Parámetros |
|---|---|---|
| `sign_up` | Al completar el onboarding (correo o Google) | `category` |
| `publish_match` | Tras publicar un partido | `match_type`, `category`, `max_players` |
| `join_request` | Tras pedir unirse | `source`: `lobby` o `match_page` |
| `join_approved` | Cuando el organizador acepta una solicitud | — |

Las visitas de página las registra la medición mejorada de GA4 ("Cambios de página según el historial"), incluida la navegación dentro de la app.

## Reglas

- Ningún evento lleva datos personales: ni id de usuario, nombre, correo, teléfono ni `code` del partido.
- Los bloqueadores de anuncios ocultan una parte del tráfico: GA4 sirve para proporciones del embudo; los totales salen de la BD.

## Configuración en GTM

1. Etiqueta **Google tag** con el ID `G-…` de GA4, activador *Initialization – All Pages*.
2. Activador **Evento personalizado** con nombre `sign_up|publish_match|join_request|join_approved` y la opción de expresión regular.
3. Variables de capa de datos: `category`, `match_type`, `max_players`, `source`.
4. Etiqueta **Evento de GA4** con nombre `{{Event}}`, los parámetros anteriores y el activador del paso 2.
5. En GA4, marcar `sign_up`, `publish_match` y `join_approved` como eventos clave.
