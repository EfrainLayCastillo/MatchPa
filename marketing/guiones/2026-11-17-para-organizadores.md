# Para organizadores (carrusel)

- **Slug:** 2026-11-17-para-organizadores
- **Pilar:** Producto (organizador)
- **Formato:** Carrusel de 4 PNG en 1080×1350
- **Objetivo:** que el organizador entienda en 3 pasos cómo completar su partido. Sirve para Instagram y para mandarlo por WhatsApp junto al mensaje de invitación
- **Proyecto:** `carruseles/2026-11-17-para-organizadores/`

## Slides

| #   | Fondo  | Texto                                                                                                                                                                     | Imagen                                                             |
| --- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 1   | Verde  | Pastilla "Pa' organizadores" · "¿Te faltan **jugadores?**" · "No es pa' reservar cancha: eso sigue con tu club. MatchPa es pa' conseguir a los que faltan." · "Desliza →" | 4 puestos: 3 llenos y 1 vacío                                      |
| 2   | Marfil | Pastilla "1" · "**Publica** tu partido" · "Fecha, hora, sucursal y los puestos que te faltan."                                                                            | Captura real de "Crear nuevo partido" en un teléfono               |
| 3   | Verde  | Pastilla "2" · "Compártelo en el **grupo**" · "Un toque en Compartir y va con todos los datos."                                                                           | Detalle del partido con el botón Compartir, recortado bajo la hora |
| 4   | Marfil | Pastilla "3" · "**Tú decides** quién entra" · "Aceptas o rechazas cada solicitud." · pastilla **matchpa.app** · "Gratis"                                                  | Captura real de Solicitudes con Aceptar / Rechazar en un teléfono  |

## Reglas de producto que respeta

- Reservar la cancha queda fuera de la app; al publicar solo se marca si ya está reservada.
- Compartir usa `navigator.share` y el link lleva la vista previa con estado, fecha, hora, sucursal, categoría y puestos.
- Todo ingreso pasa por la aprobación del organizador, incluido el que llega por link.
- Pantallas grabadas en modo mock (`tomas.mjs`), con la sucursal ficticia Pádel del Barrio; el carrusel usa el último cuadro de cada toma. La solicitud de Andrés Vega en el partido de Efrain viene de `frontend/lib/mock-api.ts`.
- La hora del partido del mock depende de cuándo se graba: grabar de día para que no salga de madrugada.

## Alt text

1. Texto: "¿Te faltan jugadores? No es pa' reservar cancha, MatchPa es pa' conseguir a los que faltan". Cuatro puestos de un partido: tres llenos y uno vacío.
2. Paso 1, "Publica tu partido": teléfono con el formulario de MatchPa para crear un partido con fecha, hora, reserva de cancha y sucursal.
3. Paso 2, "Compártelo en el grupo": teléfono con el detalle de un partido, sus jugadores y el botón Compartir.
4. Paso 3, "Tú decides quién entra": teléfono con una solicitud y los botones Aceptar y Rechazar, y el texto matchpa.app gratis.

## Publicación

- **Fecha:**
- **Caption:** ¿Organizas partidos y siempre falta uno? 🎾 Publícalo en MatchPa, pega el link en tu grupo y tú decides quién entra. No reservamos canchas: te conseguimos los que faltan. Gratis 👉 matchpa.app
- **Hashtags:** #padel #padelpanama #padelpty #jugadoresdepadel #matchpa

## Métricas (7 días)

| Alcance | Guardados | Compartidos | Visitas al perfil | Slide donde más abandonan |
| ------- | --------- | ----------- | ----------------- | ------------------------- |
