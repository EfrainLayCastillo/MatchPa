# Frontend — Next.js (App Router)

## Mobile first

- Diseña a 375px primero; los estilos sin prefijo son mobile, `sm`/`md`/`lg` agregan.
- Acción principal abajo, al alcance del pulgar. Áreas táctiles ≥ 44px.
- Listas en tarjetas de una columna; grid solo desde `md`.

## Componentes

- shadcn/ui para todo componente base (usa la skill `shadcn`). No reimplementes Dialog, Sheet, Tabs, etc.
- Tokens del brandbook (`docs/brandbook.md`) como variables CSS en `app/globals.css`; nunca hex sueltos en componentes.
- Server Components por defecto; `"use client"` solo donde hay interacción, SSE o push.

## Datos y tiempo real

- Llamadas a `NEXT_PUBLIC_API_URL` con `credentials: 'include'` (sesión por cookie).
- SSE con `@adonisjs/transmit-client`: canales `lobby`, `users/:id`, `matches/:code`.
- Service worker solo para `push` y `notificationclick`; sin caché offline.
- El permiso de push se pide solo desde el modal opt-in (`docs/tiempo-real.md`, modal opt-in), nunca al cargar.

## Textos

- UI y rutas en español; tono en `docs/brandbook.md`. "Ey Pa, ¿juegas?", "¡Match! Ya están los 4".
- Los estados vienen en inglés de la API; tradúcelos en un único mapa (`open` → "Abierto").

## Verificación

- `web-design-guidelines` para revisar accesibilidad al cerrar una pantalla.
- `next-dev-loop` y `webapp-testing` existen, pero las corre el usuario para ahorrar tokens: no las ejecutes tú.
- Flujos a 375px: los prueba el usuario con Playwright; tú entregas la pantalla lista para probar.

## Ahorro de tokens

- Cambia con `Edit` por fragmentos; `Write` solo para archivos nuevos.
- Verifica solo lo tocado: `npx tsc --noEmit` y `npx eslint <archivos>`. Reporta una línea con el resultado y los errores relevantes.
- No corras navegador, capturas ni E2E: el usuario los ejecuta. No hagas `next build` salvo para cerrar una entrega.
- No imprimas componentes ni hooks que acabas de escribir.
- No agregues comentarios que repitan el código.
