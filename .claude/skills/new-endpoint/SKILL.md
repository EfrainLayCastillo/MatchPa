---
name: new-endpoint
description: Agrega un endpoint a la API de MatchPa (backend/ AdonisJS 7) de punta a punta — validator, policy, service, controller, ruta, tests Japa y fila en la tabla de API del README. Úsalo cuando se cree o cambie un endpoint.
---

# Nuevo endpoint

1. **Especificación.** Busca el endpoint en `README.md` → API. Si no existe, define método, ruta (inglés, bajo `/api`, partidos por `:code`), quién puede llamarlo y respuesta, y confírmalo antes de seguir.
2. **Validator** en `backend/app/validators/` con VineJS. Valida rangos del README (categoría 1–7, `max_players` 4–6, duración 90/120).
3. **Policy** en `backend/app/policies/` si el endpoint depende de quién lo llama (organizador, invitado, jugador).
4. **Service.** Lógica y transiciones de estado en `backend/app/services/`, en una transacción si cambia puestos o estados. Emite Transmit/push después del commit.
5. **Controller** delgado en `backend/app/controllers/`: validar → autorizar → service → responder.
6. **Ruta** en `backend/start/routes.ts`, con middleware de auth salvo las públicas del README.
7. **Tests** Japa functional: camino feliz, `422` y `403`. Unit del service si agrega una transición.
8. **README.** Agrega o corrige la fila en la tabla de API correspondiente. Si cambió una regla, usa `sync-docs`.
9. Corre `node ace test` y reporta el resultado.
