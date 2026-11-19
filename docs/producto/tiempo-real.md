# Tiempo real y notificaciones

Transmit (SSE) para eventos con la app abierta; Web Push para avisos con la app cerrada.

## Canales Transmit

| Canal | Suscriptores | Eventos |
|---|---|---|
| `lobby` | Usuarios en `/lobby` | `match.created`, `match.updated`, `availability.changed` |
| `users/:id` | El propio usuario | `request.created`, `request.updated`, `notification.created` |
| `matches/:code` | Organizador y jugadores | `match.updated`, `match.signal` |

## Push

| Evento | Destinatario |
|---|---|
| Nueva solicitud | Organizador |
| Nueva invitación | Invitado |
| Solicitud o invitación aceptada | La otra parte |
| Partido completo (al aceptar o al editar) | Organizador: "Reserva la cancha en <sucursal>" si está por reservar, o "Ya están los N". Jugadores aceptados: "Ya están los N". Reemplaza al aviso de aceptación cuando la aceptación llena el partido |
| Cancha confirmada, cambio de cancha o cancha por reservar | Jugadores aceptados |
| Partido cerrado | Jugadores aceptados |
| Jugador se salió | Organizador |
| Jugador sacado | El jugador |
| Señal de un jugador ("Ana · Voy en camino") | Organizador |

Cada push también queda en la bandeja `/notificaciones` ([reglas](reglas-de-negocio.md#bandeja-de-notificaciones)) y emite `notification.created` en `users/:id`, que actualiza la campana del lobby.

La notificación abre `/partidos/[code]`: enfoca la pestaña si ya está ahí o navega una abierta de MatchPa. Las notificaciones del mismo partido se reemplazan entre sí, y caducan a las 6 horas si el dispositivo no las recibió.

El push sale después del evento SSE y en segundo plano: nunca demora ni hace fallar la acción que lo dispara. Las suscripciones que responden `404`/`410` se borran; los demás fallos y la falta de claves VAPID quedan en el log. Si el navegador rota la suscripción, el service worker la vuelve a registrar (`pushsubscriptionchange`), y la app la reenvía al cargar la sesión.

**Modal opt-in:** aparece al publicar un partido o al pedir unirse, nunca al abrir la app. Si acepta, se pide el permiso del navegador; si no, se activa luego en `/perfil`. En iPhone (iOS 16.4+) push requiere la PWA en la pantalla de inicio, así que el modal primero explica cómo instalarla.