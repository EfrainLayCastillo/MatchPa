# Reglas de negocio

Especificación de qué debe cumplir el backend y el frontend. Si el código se desvía, primero se actualiza este documento.

## Cuenta

- Al registrarse con contraseña se envía al correo un código de 6 dígitos.
- El código vence a los 15 minutos y acepta 5 intentos; después hay que pedir otro. Pedir uno nuevo invalida el anterior.
- El código se guarda como hash, nunca en claro.
- Las cuentas creadas con Google nacen verificadas si Google reporta el correo como verificado.
- Entrar con Google a un correo que ya tiene cuenta (también con las variantes de Gmail con puntos o `+`) vincula Google a esa cuenta solo si su correo está verificado, la cuenta no tiene otro Google y el correo es de Gmail o de un dominio de Google Workspace (`hd`) verificado por Google. Si no, vuelve a `/login` con "Ya tienes una cuenta con ese correo. Entra con tu contraseña o recupérala."
- Reenvío: espera de 60 s entre códigos y máximo 5 por hora, por usuario.
- Mientras no esté verificado, el perfil muestra un aviso con el botón "Verificar correo", que envía un código al tocarlo.
- Publicar, pedir unirse, aceptar una invitación y sugerir una sucursal exigen correo verificado. Lobby, perfil y disponibilidad no: "Hacerlo después" deja explorar.
- Las acciones del organizador sobre sus partidos (aprobar, rechazar, sacar, editar, cerrar) e invitar no lo exigen: publicar ya lo exigió, y así los partidos de cuentas anteriores a la verificación no quedan congelados.
- El organizador no puede aprobar una solicitud de un jugador sin verificar (solicitudes creadas antes de la verificación): responde "Este jugador aún no verifica su correo".

- Recuperar contraseña: se pide con el correo y llega un código con las mismas reglas (15 min, 5 intentos). La respuesta es la misma exista o no la cuenta.
- Cambiar la contraseña con el código verifica el correo, cierra las sesiones de los demás dispositivos e inicia sesión. Sirve también para que una cuenta de Google cree contraseña.
- Los códigos de verificación y de recuperación son independientes: uno no sirve para el otro.

## Eliminar cuenta

- Desde el final del perfil, escribiendo `ELIMINAR` para confirmar. No se puede deshacer.
- Se anonimiza, no se borra la fila: nombre "Jugador eliminado", correo `deleted-<id>@matchpa.invalid`, y contraseña, Google, foto, WhatsApp, categoría, subnivel, género y verificación en `null`. Se borran su disponibilidad, suscripciones push, códigos y sugerencias de sucursal.
- Sus partidos futuros `open` o `full` se cierran y sus solicitudes pendientes se cancelan.
- Sus solicitudes pendientes en partidos de otros se cancelan, y sus puestos aceptados en partidos futuros se liberan como si saliera (el partido vuelve a `open` si corresponde).
- Los partidos pasados no cambian y lo muestran como "Jugador eliminado".
- Se cierran todas sus sesiones. El mismo correo puede volver a registrarse como cuenta nueva.
- No se puede invitar a una cuenta eliminada.
- Avisos por push: los jugadores aceptados de sus partidos cerrados reciben "Partido cancelado", y el organizador de un partido donde tenía puesto recibe "Se liberó un puesto". Las pantallas afectadas se actualizan en tiempo real.

## Partidos

- Fecha de hoy o futura.
- Máximo de jugadores: 4 por defecto, hasta 6.
- El organizador cuenta como jugador. Los que ya tiene son **invitados** (nombre, categoría, género), sin cuenta.
- **Puestos disponibles** = máximo − organizador − invitados − aceptados.
- Sin puestos → `full`. El organizador puede cerrar antes (`closed`), por ejemplo con 4 de 6.
- Solo el organizador aprueba, invita, saca jugadores, edita y cierra. No puede invitarse a sí mismo.
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

- URL: `matchpa.app/partidos/<code>`, con `code` aleatorio de 8 caracteres (no el `id`, para evitar enumeración).
- Se muestra al publicar y en el detalle.
- Ver no requiere cuenta. Unirse sí: login → onboarding → vuelve al partido y envía la solicitud.
- El WhatsApp del organizador solo lo reciben el propio organizador y los jugadores aceptados, y solo mientras el partido está `open` o `full`. Si el partido expiró o se cerró, la API no lo devuelve y el botón no aparece.
- Si el partido no está `open`, muestra su estado en vez del botón de unirse.
- Botón Compartir con `navigator.share`; fallback a "Copiar link" y `wa.me/?text=`.
- Vista previa Open Graph dinámica (`generateMetadata` + `opengraph-image`): sucursal, fecha, hora, categoría y puestos.
- SEO: JSON-LD `SportsEvent` en partidos `open` y `full`; `noindex` en `closed` y `expired`; código inexistente → 404.

## Disponibilidad

- Una por jugador por fecha (hoy o futura).
- **Horario opcional.** Sin horario = disponible todo el día; si es hoy, el resto del día. Si se indica, `Desde` y `Hasta` van juntos.
- **Sucursal obligatoria:** el jugador elige dónde puede jugar ese día. Sin sucursal no se guarda.
- Si organizas partidos abiertos ese día, la pestaña Jugadores (y Partidos) viene filtrada por sus sucursales (todas, si son varias). Con la fecha en "Todos (próximos)", Partidos no se filtra porque abarca varios días. Se puede cambiar a mano; al cambiar de fecha vuelve a la automática. Al crear un partido se avisa: "Los jugadores disponibles de ese día se mostrarán filtrados por la sucursal de este partido."
- "Invitar" en un jugador ofrece solo tus partidos abiertos de la misma fecha y sucursal que su disponibilidad. Si no hay ninguno, propone publicar uno con esa fecha, esa sucursal y la invitación precargadas.
- **Horarios cada 30 minutos** (`:00` o `:30`, la API también lo valida), mostrados en formato de 12 horas (`8:30 a. m.`). El fin del día se guarda como `24:00` y se muestra como `12:00 a. m.`.
- Hoy, `Desde` no puede ser antes de la próxima media hora (redondeada hacia arriba). Si ya no quedan medias horas hoy, no se puede guardar, con o sin horario. La API valida lo mismo.
- Un jugador comprometido ese día (organiza o tiene una solicitud aceptada en un partido abierto o completo) no aparece en la lista de disponibles de ese día.
- El jugador la quita o expira al terminar el día (`date < hoy` en hora de Panamá).

## Categorías

- 1ra (más alta) a 7ma, guardadas como entero `1`–`7`.
- La elige el jugador y la actualiza en su perfil.
- Subnivel opcional (`category_tier`) en el jugador y en el partido: `high` = "alta" ("5ta alta"), `entry` = "de entrada" ("5ta de entrada"), `null` = sin precisar.
- Nivel efectivo: `category − ⅓` si es alta, `category + ⅓` si es de entrada. 5ta alta queda más cerca de 4ta que de 5ta de entrada.
- No filtra, ordena: el lobby muestra primero lo más cercano a tu nivel efectivo (`abs(nivel − mío)`).

## Sucursales

- Pool global; la ubicación de un partido es la sucursal. Sin direcciones: la zona (`location_label`) y las coordenadas bastan.
- **Cerca de ti:** el lobby ordena por distancia en línea recta desde la ubicación del jugador, o desde la zona que elija a mano, hasta la sucursal. En un partido es su sucursal; en un jugador del pool, la de su disponibilidad. Una sucursal sin coordenadas va al final. Con la misma distancia redondeada (km) se desempata por nivel.
- La ubicación se pide al tocar "Usar mi ubicación", nunca al cargar, y no sale del navegador. Una zona es un `location_label` de sucursales con coordenadas, y su punto es el promedio de esas sucursales.
- Catálogo de todo el país por seed, con upsert por `slug`. `name` es la marca, sin la zona; la UI muestra `name · zona`. Dos sedes de una marca llevan nombres distintos (PPA Condado, PPA Marina Sur).
- Teléfono, website (o Instagram) y coordenadas son opcionales: si el club no los publica, quedan vacíos.

### Ficha en el detalle del partido

| Botón | Se muestra si | Abre |
|---|---|---|
| Cómo llegar | Hay coordenadas o `maps_url` | Google Maps con ruta a las coordenadas; si no hay, `maps_url` |
| WhatsApp | El teléfono es celular (8 dígitos que empiezan con 6) | `wa.me` |
| Llamar | Hay teléfono | `tel:` |
| Website / Instagram | Hay website | La URL |

### Sugerir sucursal

- Desde el selector de sucursal al crear un partido o marcar disponibilidad: "¿No está tu sucursal? Sugerirla", con nombre, zona y enlace de Maps opcional.
- Requiere sesión y correo verificado. Máximo 1 sugerencia `pending` por usuario; otra responde "Ya tienes una sugerencia en revisión".
- Avisa por correo al dueño (`ADMIN_EMAIL`) con el nombre y correo de quien sugiere. Sin `ADMIN_EMAIL` se guarda igual, sin correo.
- El dueño la agrega al seed a mano. Aprobar y rechazar en la app llega con el admin dashboard para empresas.

## Estados del jugador (UI)

| Estado | Regla | Estilo |
|---|---|---|
| Disponible | Tiene disponibilidad en la fecha vista | Lima |
| Buscando | Organiza un partido `open` | Blanco con borde verde azulado |
| En partido | Está en un partido `full` de hoy | Gris |
