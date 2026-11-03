# API (MVP)

Base `/api`. Todo requiere sesión salvo auth, `GET /branches` y `GET /matches/:code`. Los partidos se identifican por `code`.

## Auth y perfil

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/auth/google/redirect` | Login con Google. Solo existe con `GOOGLE_AUTH_ENABLED=true` |
| `GET` | `/auth/google/callback` | Callback de Google. Solo existe con `GOOGLE_AUTH_ENABLED=true` |
| `POST` | `/auth/register` | Registro |
| `POST` | `/auth/login` | Login con correo |
| `POST` | `/auth/email/verify` | Verifica el correo con `{ code }` (6 dígitos). Requiere sesión. 422: `Código incorrecto` o `El código venció o se agotaron los intentos. Pide uno nuevo` |
| `POST` | `/auth/password/forgot` | `{ email }`. Siempre 204, exista o no la cuenta y aunque se pase el límite de 5 códigos por hora por cuenta (simplemente no envía). 429 solo por el límite por IP |
| `POST` | `/auth/password/reset` | `{ email, code, password }`. Cambia la contraseña, verifica el correo, cierra las demás sesiones e inicia sesión. Devuelve el usuario. 422 con un solo mensaje para cualquier fallo: `El código no es válido o venció. Pide uno nuevo` |
| `POST` | `/auth/email/resend` | Envía un código nuevo e invalida el anterior. 204 (también si ya está verificado, sin enviar). 429 si pidió otro hace menos de 60 s o más de 5 en una hora |
| `POST` | `/auth/logout` | Logout |
| `GET` | `/me` | Usuario actual, con `emailVerified` |
| `PATCH` | `/me` | Actualizar perfil |
| `DELETE` | `/me` | Eliminar la cuenta con `{ confirm: "ELIMINAR" }`. Anonimiza, cierra o libera sus partidos futuros y cierra la sesión. 204 |

## Jugadores y disponibilidad

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/branches` | Catálogo de sucursales |
| `GET` | `/players` | Jugadores disponibles (`date`, `branchId`, horario) |
| `GET` | `/me/availabilities` | Mis disponibilidades futuras |
| `PUT` | `/me/availabilities/:date` | Crear o actualizar (`fromTime`, `toTime`, `branchId`; horario `null` = todo el día) |
| `DELETE` | `/me/availabilities/:date` | Quitar |

## Partidos

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/matches` | Publicar (con invitados). 403 `EMAIL_NOT_VERIFIED` si el correo no está verificado |
| `GET` | `/matches` | Partidos `open` (`date`, `branchId`, `type`) |
| `GET` | `/matches/:code` | Detalle público; incluye solicitudes si eres organizador |
| `PATCH` | `/matches/:code` | Editar mientras está `open` |
| `POST` | `/matches/:code/close` | Cerrar |
| `POST` | `/matches/:code/join-requests` | Pedir unirse. 403 `EMAIL_NOT_VERIFIED` si el correo no está verificado |
| `POST` | `/matches/:code/invitations` | Invitar (`userId`) |
| `PATCH` | `/match-requests/:id` | Ejecutar `action`. 403 `EMAIL_NOT_VERIFIED` si el invitado acepta sin correo verificado |
| `GET` | `/me/matches` | Partidos que organizo o juego |
| `GET` | `/me/match-requests` | Mis solicitudes e invitaciones pendientes |

| `action` | Desde | Quién |
|---|---|---|
| `accept` / `reject` | `pending` | Organizador (`join_request`) o invitado (`invitation`) |
| `leave` | `accepted` | El jugador |
| `remove` | `accepted` | El organizador |

## Push

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/push-subscriptions` | Registrar dispositivo |
| `DELETE` | `/push-subscriptions` | Quitar dispositivo |

Errores: `422` de VineJS con `errors[]`, `403` si no tienes permiso para la acción.
