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
| `/lobby` | Sí | Tarjeta de perfil, carrusel de tus próximos partidos (abiertos o completos, el más cercano primero), selector de fecha, filtro de sucursal (preseleccionado con las de tus partidos del día), menú "Filtros" y pestañas **Partidos** / **Jugadores**. Barra fija con "Estoy disponible" (bottom sheet) y "Crear una partida" |
| `/partidos/nuevo` | Sí | Crear partido en dos pestañas: **Cuándo y dónde** y **El partido**. La segunda se habilita al completar sucursal y cancha |
| `/partidos/[code]` | Para actuar | Detalle público: banner con la foto (`?img=`), encabezado, jugadores, panel del organizador y sección Sucursal. Barra fija con "Cómo llegar" y "Compartir". El organizador edita, gestiona solicitudes, invita, saca y cierra; el jugador puede salirse |
| `/partidos/[code]/historia` | No | Imagen vertical 1080×1920 para historias y Reels. "Compartir" la envía como archivo |
| `/perfil` | Sí | Editar categoría y subnivel, género y WhatsApp, activar/desactivar push |
| `/mis-partidas` | Sí | Partidos que organizas o juegas, con estado y filtros por sucursal y orden (por defecto, última actualización) |

### Lobby

| Pieza | Qué muestra |
|---|---|
| Tarjeta de perfil | Inicial con check si el correo está verificado, nombre, género, categoría y subnivel. Arriba, tu ubicación: desplegable de zonas, "Usar mi ubicación" y un "?" que explica para qué se usa. La zona elegida queda en `localStorage` |
| Menú "Filtros" | "Ordenar por: Cercanía · Nivel" para ambas pestañas (reglas en [Categorías](reglas-de-negocio.md#categorías) y [Sucursales](reglas-de-negocio.md#sucursales)). Cercanía se desactiva sin ubicación ni zona |
| Tarjeta de partido | Toda la tarjeta abre el detalle. Estado, categoría, fecha, sucursal con distancia y etiquetas (cancha, duración, tipo, puestos). En la pestaña Partidos, "Pedir unirme". Tus próximos partidos se cancelan desde el detalle, no desde el lobby |
| Tarjeta de jugador | Inicial con check de verificado, sucursal con distancia, nombre, género, categoría, subnivel, horario y "¿Juegas?" |
