# Frontend

Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, TanStack Query. Código en `frontend/`.

## Mobile first

La mayoría llega desde el celular. Diseño desde ~375px, escalando con `sm`/`md`/`lg` de Tailwind. Acciones principales abajo, áreas táctiles de 44px, tarjetas de una columna, formularios cortos.

## Rutas

Las URLs son visibles para el usuario, así que van en español.

| Ruta | Sesión | Descripción |
|---|---|---|
| `/` | No | Home |
| `/login` | No | Google o correo y contraseña |
| `/registro` | No | Registro básico |
| `/onboarding` | Sí | Categoría, género y teléfono. Obligatorio antes del lobby |
| `/lobby` | Sí | Selector de fecha y pestañas **Partidos** / **Jugadores**. Botón fijo "Estoy disponible" (bottom sheet) |
| `/partidos/nuevo` | Sí | Publicar partido |
| `/partidos/[code]` | Para actuar | Detalle público. El organizador gestiona solicitudes, invita, saca y cierra; el jugador puede salirse |
| `/perfil` | Sí | Editar categoría, género y WhatsApp, activar/desactivar push |
| `/mis-partidas` | Sí | Partidos que organizas o juegas, con estado y filtros por empresa y orden (por defecto, última actualización) |

Ambas pestañas del lobby se ordenan por cercanía a tu categoría. **Partidos** filtra por empresa, tipo y hora; **Jugadores** por empresa y horario, y al tocar uno aparece "Ey Pa, ¿juegas?".
