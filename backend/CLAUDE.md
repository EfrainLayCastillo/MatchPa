# Backend — AdonisJS 7

## Estructura

- `app/models`: modelos Lucid. Estados como `string` con `CHECK` en la migración, no enums de Postgres (cambiarlos requiere migración pesada).
- `app/validators`: VineJS, un validator por acción (`createMatchValidator`).
- `app/controllers`: delgados. Validan, autorizan, llaman al servicio y responden.
- `app/services`: reglas de negocio y transiciones de estado (`MatchService`, `MatchRequestService`). Toda transición pasa por aquí, nunca se escribe `status` desde un controller.
- `app/policies`: Bouncer para "quién puede": organizador aprueba/invita/saca/cierra, invitado responde su invitación, jugador se sale.
- `start/routes.ts`: todo bajo el grupo `/api`, rutas en inglés, partidos por `:code`.

## Reglas que el código debe respetar

- Puestos disponibles = `max_players` − 1 − invitados − `accepted`. Calcúlalo en un solo lugar del servicio.
- Cambios que tocan puestos o estado (aceptar, salir, sacar, cerrar) van en una transacción con `forUpdate()` sobre el partido, para que dos aceptaciones simultáneas no sobrepasen el máximo.
- Al salir de `open`, cancela las solicitudes `pending` en la misma transacción.
- `expired` no se guarda: usa un scope de query (`status = 'open' AND starts_at > now()` para "abiertos vigentes").
- Disponibilidad vencida: `date < hoy` en `America/Panama`, calculado con Luxon, no con la fecha del servidor.
- Eventos de Transmit y Web Push se emiten **después** del commit de la transacción.
- `code` del partido: 8 caracteres aleatorios, único, generado al crear.

## Tests (Japa)

- Unit para el servicio: cada transición de estado, cálculo de puestos, reapertura al salir/sacar.
- Functional por endpoint: camino feliz, `422` de validación y `403` de permisos.
- `node ace test` debe pasar antes de dar una tarea por terminada.

## Al agregar un endpoint

Usa la skill `new-endpoint`.

## Ahorro de tokens

- Cambia con `Edit` por fragmentos; `Write` solo para archivos nuevos.
- Corre solo los tests del archivo o regla tocados (filtra por archivo al correr Japa), no toda la suite en cada cambio. La suite completa se corre al cerrar la tarea.
- Reporta el resultado en una línea (pasa o falla) y solo los errores relevantes.
- No imprimas migraciones, modelos ni validators que acabas de escribir.
- No agregues tests que no cubran una regla de negocio del README, ni comentarios que repitan el código.
