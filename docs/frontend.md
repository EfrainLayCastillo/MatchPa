# Frontend

Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, TanStack Query. Código en `frontend/`.

## Mobile first

La mayoría llega desde el celular. Diseño desde ~375px, escalando con `sm`/`md`/`lg` de Tailwind. Acciones principales abajo, áreas táctiles de 44px, tarjetas de una columna, formularios cortos.

## Rutas

Las URLs son visibles para el usuario, así que van en español.

| Ruta | Sesión | Descripción |
|---|---|---|
| `/` | No | Home |
| `/beta` | No | Qué es la beta: el problema, por qué nació, cómo se usa y lo que viene. Enlazada desde el badge "Beta" del header |
| `/login` | No | Google o correo y contraseña |
| `/registro` | No | Registro básico |
| `/verificar` | Sí | Código de 6 dígitos para verificar el correo, con reenvío |
| `/recuperar` | No | Recuperar contraseña: correo, luego código y contraseña nueva |
| `/onboarding` | Sí | Categoría (con subnivel opcional), género y teléfono. Obligatorio antes del lobby |
| `/lobby` | Sí | Carrusel de tus próximos partidos (abiertos o completos, el más cercano primero). Selector de fecha, filtro de sucursal (preseleccionado con las de tus partidos del día) y pestañas **Partidos** / **Jugadores**. Botón fijo "Estoy disponible" (bottom sheet) |
| `/partidos/nuevo` | Sí | Publicar partido |
| `/partidos/[code]` | Para actuar | Detalle público. El organizador gestiona solicitudes, invita, saca y cierra; el jugador puede salirse |
| `/perfil` | Sí | Editar categoría y subnivel, género y WhatsApp, activar/desactivar push |
| `/mis-partidas` | Sí | Partidos que organizas o juegas, con estado y filtros por sucursal y orden (por defecto, última actualización) |

Ambas pestañas del lobby tienen "Ordenar por: Cercanía · Nivel". Cercanía usa tu ubicación o la zona que elijas y muestra "a 3 km" en cada tarjeta; Nivel ordena por cercanía a tu nivel efectivo (categoría y subnivel). Sin ubicación ni zona, una tarjeta ofrece "Usar mi ubicación" o "Elegir mi zona". La zona elegida queda en `localStorage`. **Partidos** filtra por sucursal, tipo y hora; **Jugadores** por sucursal y horario, y al tocar uno aparece "Ey Pa, ¿juegas?".
