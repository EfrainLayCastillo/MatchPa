# Tiempo real y notificaciones

Transmit (SSE) para eventos con la app abierta; Web Push para avisos con la app cerrada.

## Canales Transmit

| Canal | Suscriptores | Eventos |
|---|---|---|
| `lobby` | Usuarios en `/lobby` | `match.created`, `match.updated`, `availability.changed` |
| `users/:id` | El propio usuario | `request.created`, `request.updated` |
| `matches/:code` | Organizador y jugadores | `match.updated` |

## Push

| Evento | Destinatario |
|---|---|
| Nueva solicitud | Organizador |
| Nueva invitación | Invitado |
| Solicitud o invitación aceptada | La otra parte |
| Partido completo | Organizador y jugadores |
| Partido cerrado | Jugadores aceptados |
| Jugador se salió | Organizador |
| Jugador sacado | El jugador |

La notificación abre `/partidos/[code]`. Las suscripciones que responden `404`/`410` se borran.

**Modal opt-in:** aparece al publicar un partido o al pedir unirse, nunca al abrir la app. Si acepta, se pide el permiso del navegador; si no, se activa luego en `/perfil`. En iPhone (iOS 16.4+) push requiere la PWA en la pantalla de inicio, así que el modal primero explica cómo instalarla.

**WhatsApp:** en el MVP, botón `wa.me/<teléfono>` al organizador.
