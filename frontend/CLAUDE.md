# Frontend — Next.js (App Router)

## Mobile first

- Diseña a 375px primero; los estilos sin prefijo son mobile, `sm`/`md`/`lg` agregan.
- Acción principal abajo, al alcance del pulgar. Áreas táctiles ≥ 44px.
- Listas en tarjetas de una columna; grid solo desde `md`.

## Componentes

- shadcn/ui para todo componente base (usa la skill `shadcn`). No reimplementes Dialog, Sheet, Tabs, etc.
- Tokens del brandbook (README → Brandbook) como variables CSS en `app/globals.css`; nunca hex sueltos en componentes.
- Server Components por defecto; `"use client"` solo donde hay interacción, SSE o push.

## Datos y tiempo real

- Llamadas a `NEXT_PUBLIC_API_URL` con `credentials: 'include'` (sesión por cookie).
- SSE con `@adonisjs/transmit-client`: canales `lobby`, `users/:id`, `matches/:code`.
- Service worker solo para `push` y `notificationclick`; sin caché offline.
- El permiso de push se pide solo desde el modal opt-in (README → Modal opt-in), nunca al cargar.

## Textos

- UI y rutas en español; tono del README (Brandbook → Tono). "Ey Pa, ¿juegas?", "¡Match! Ya están los 4".
- Los estados vienen en inglés de la API; tradúcelos en un único mapa (`open` → "Abierto").

## Verificación

- `next-dev-loop` para confirmar cambios en el dev server.
- `webapp-testing` (Playwright) para flujos completos a 375px.
- `web-design-guidelines` para revisar accesibilidad antes de cerrar una pantalla.
