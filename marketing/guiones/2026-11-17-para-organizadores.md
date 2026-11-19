# Para organizadores (carrusel)

- **Slug:** 2026-11-17-para-organizadores
- **Pilar:** Producto (organizador)
- **Formato:** Carrusel de 4 PNG en 1080×1350
- **Objetivo:** que el organizador entienda en 3 pasos cómo completar su partido. Sirve para Instagram y para mandarlo por WhatsApp junto al mensaje de invitación
- **Proyecto:** `carruseles/2026-11-17-para-organizadores/`

## Slides

| #   | Fondo  | Texto                                                                                                                                                    | Imagen                                                                                                                                                                 |
| --- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Verde  | Pastilla "Pa' organizadores" · "¿Te faltan **jugadores?**" · "En MatchPa consigues al jugador que le falta a tu equipo." · "Desliza →"                   | 4 puestos: 3 llenos y 1 vacío                                                                                                                                          |
| 2   | Marfil | "1" · "**Publica** tu partido" · "Fecha, hora, sucursal y los puestos que te faltan."                                                                    | "Crear nuevo partido" completo; encima, zoom con borde lima a fecha, hora y reserva                                                                                    |
| 3   | Verde  | "2" · "**Compártelo**" · "Un toque en Compartir y estás más cerca de completar tu partido."                                                              | Detalle del partido completo; encima, zoom con borde lima a "Cómo llegar · Compartir", unido al botón por un cono de vidrio lima · footer: logo y @matchpa.app         |
| 4   | Marfil | "3" · "**Tú eliges** quién juega" · "Ves la categoría de cada uno y aceptas a los que van con tu partido." · pastilla **matchpa.app** · "Link en la bio" | Detalle del partido completo; encima, zoom con borde lima a la solicitud con Aceptar / Rechazar · footer: badge de Instagram "Síguenos pa' más contenido @matchpa.app" |

## Reglas de producto que respeta

- Compartir usa `navigator.share` y el link lleva la vista previa con estado, fecha, hora, sucursal, categoría y puestos.
- Todo ingreso pasa por la aprobación del organizador, incluido el que llega por link.
- Pantallas grabadas en modo mock (`tomas.mjs`), con la sucursal ficticia Pádel del Barrio; el carrusel usa el último cuadro de cada toma. La solicitud de Andrés Vega en el partido de Efrain viene de `frontend/lib/mock-api.ts`.
- `tomas.mjs` fija el reloj del navegador a las 3 p. m. de Panamá para que el partido del mock no salga de madrugada.

## Alt text

1. Texto: "¿Te faltan jugadores? En MatchPa consigues al jugador que le falta a tu equipo". Cuatro puestos de un partido: tres llenos y uno vacío.
2. Paso 1, "Publica tu partido": teléfono con el formulario de MatchPa para crear un partido con fecha, hora, reserva de cancha y sucursal.
3. Paso 2, "Compártelo": teléfono con el detalle de un partido, sus jugadores y el botón Compartir.
4. Paso 3, "Tú eliges quién juega": teléfono con una solicitud y los botones Aceptar y Rechazar, matchpa.app y "Síguenos pa' más contenido @matchpa.app".

## Publicación

- **Fecha:**
- **Caption:** ¿Organizas partidos y siempre falta uno? 🎾 Publícalo en MatchPa, pega el link en tu grupo y tú decides quién entra. Te conseguimos al jugador estrella que le falta a tu partido ⭐ Gratis 👉 matchpa.app
- **Hashtags:** #padel #padelpanama #padelpty #jugadoresdepadel #matchpa

## Métricas (7 días)

| Alcance | Guardados | Compartidos | Visitas al perfil | Slide donde más abandonan |
| ------- | --------- | ----------- | ----------------- | ------------------------- |
