# API (MVP)

Base `/api`. Todo requiere sesión salvo auth, `GET /companies` y `GET /matches/:code`. Los partidos se identifican por `code`.

## Auth y perfil

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/auth/google/redirect` | Login con Google |
| `GET` | `/auth/google/callback` | Callback de Google |
| `POST` | `/auth/register` | Registro |
| `POST` | `/auth/login` | Login con correo |
| `POST` | `/auth/logout` | Logout |
| `GET` | `/me` | Usuario actual |
| `PATCH` | `/me` | Actualizar perfil |

## Jugadores y disponibilidad

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/companies` | Catálogo de empresas |
| `GET` | `/players` | Jugadores disponibles (`date`, `companyId`, horario) |
| `GET` | `/me/availabilities` | Mis disponibilidades futuras |
| `PUT` | `/me/availabilities/:date` | Crear o actualizar |
| `DELETE` | `/me/availabilities/:date` | Quitar |

## Partidos

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/matches` | Publicar (con invitados) |
| `GET` | `/matches` | Partidos `open` (`date`, `companyId`, `type`) |
| `GET` | `/matches/:code` | Detalle público; incluye solicitudes si eres organizador |
| `PATCH` | `/matches/:code` | Editar mientras está `open` |
| `POST` | `/matches/:code/close` | Cerrar |
| `POST` | `/matches/:code/join-requests` | Pedir unirse |
| `POST` | `/matches/:code/invitations` | Invitar (`userId`) |
| `PATCH` | `/match-requests/:id` | Ejecutar `action` |
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
