# Reglas de negocio

Especificación de qué debe cumplir el backend y el frontend. Si el código se desvía, primero se actualiza este documento.

## Partidos

- Fecha de hoy o futura.
- Máximo de jugadores: 4 por defecto, hasta 6.
- El organizador cuenta como jugador. Los que ya tiene son **invitados** (nombre, categoría, género), sin cuenta.
- **Puestos disponibles** = máximo − organizador − invitados − aceptados.
- Sin puestos → `full`. El organizador puede cerrar antes (`closed`), por ejemplo con 4 de 6.
- Solo el organizador aprueba, invita, saca jugadores, edita y cierra.
- Si un jugador sale o lo sacan, se libera el puesto; un partido `full` que no ha empezado vuelve a `open`.
- No puedes unirte a tu propio partido ni tener dos solicitudes activas en el mismo.
- Al salir de `open`, las solicitudes pendientes pasan a `cancelled`.
- Duración: 90 o 120 minutos.
- **Sin solapamientos:** un jugador no puede tener dos partidos abiertos o completos que se crucen en horario. Cuenta tanto los que organiza como los que tiene aceptados. Aplica al pedir unirse, al recibir una invitación y al aceptar.
- **Máximo 7 por día:** un jugador no puede tener más de 7 partidos el mismo día (hora de Panamá), contando los que organiza y los que tiene aceptados.
- Un organizador con partido abierto o completo no puede sumarse a otro que se cruce en horario.
- `updatedAt` cambia cuando cambia el partido (edición, cierre, llenado o liberación de un puesto).

| Estado | UI | Cuándo |
|---|---|---|
| `open` | Abierto | Con puestos disponibles. Aparece en el pool |
| `full` | Completo | Sin puestos |
| `closed` | Cerrado | Cerrado por el organizador |
| `expired` | Expirado | Llegó la hora sin completarse ni cerrarse. Se calcula al consultar (`status = 'open' AND starts_at <= now()`), sin cron |

## Solicitudes e invitaciones

Una sola entidad, `match_requests`, con `kind`:

| `kind` | La crea | La responde |
|---|---|---|
| `join_request` | El jugador | El organizador |
| `invitation` | El organizador | El invitado |

| Estado | Cuándo |
|---|---|
| `pending` | Esperando respuesta |
| `accepted` | Es jugador del partido |
| `rejected` | Rechazada |
| `cancelled` | El partido salió de `open` |
| `left` | El jugador se salió |
| `removed` | El organizador lo sacó |

## Link para compartir

- URL: `matchpa.net/partidos/<code>`, con `code` aleatorio de 8 caracteres (no el `id`, para evitar enumeración).
- Se muestra al publicar y en el detalle.
- Ver no requiere cuenta. Unirse sí: login → onboarding → vuelve al partido y envía la solicitud.
- El WhatsApp del organizador solo lo reciben el propio organizador y los jugadores aceptados, y solo mientras el partido está `open` o `full`. Si el partido expiró o se cerró, la API no lo devuelve y el botón no aparece.
- Si el partido no está `open`, muestra su estado en vez del botón de unirse.
- Botón Compartir con `navigator.share`; fallback a "Copiar link" y `wa.me/?text=`.
- Vista previa Open Graph dinámica (`generateMetadata` + `opengraph-image`): empresa, fecha, hora, categoría y puestos.

## Disponibilidad

- Una por jugador por fecha (hoy o futura), con rango de horas.
- Empresa opcional; vacía = cualquiera.
- **Horarios cada 30 minutos**, mostrados en formato de 12 horas (`8:30 a. m.`). El fin del día se guarda como `24:00` y se muestra como `12:00 a. m.`.
- Hoy, `Desde` no puede ser antes de la próxima media hora (redondeada hacia arriba). Si ya no quedan horas hoy, no se puede guardar. La API valida lo mismo.
- Un jugador comprometido ese día (organiza o tiene una solicitud aceptada en un partido abierto o completo) no aparece en la lista de disponibles de ese día.
- El jugador la quita o expira al terminar el día (`date < hoy` en hora de Panamá).

## Categorías

- 1ra (más alta) a 7ma, guardadas como entero `1`–`7`.
- La elige el jugador y la actualiza en su perfil.
- No filtra, ordena: primero tu categoría, luego las más cercanas (`ORDER BY abs(category - :mine)`).

## Empresas

- Pool global; la ubicación de un partido es la empresa. Sin direcciones.
- Catálogo fijo por seed. Inicial: WePadel y XForce.

## Estados del jugador (UI)

| Estado | Regla | Estilo |
|---|---|---|
| Disponible | Tiene disponibilidad en la fecha vista | Lima |
| Buscando | Organiza un partido `open` | Blanco con borde verde azulado |
| En partido | Está en un partido `full` de hoy | Gris |
