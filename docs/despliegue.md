# Despliegue

Plataformas en plan gratuito: frontend en Vercel, backend en Render y base de datos en Neon.

| Pieza | Plataforma | Configuración |
|---|---|---|
| Frontend (Next.js) | Vercel (Hobby) | Root directory `frontend`. Reenvía `/api` y `/__transmit` a Render con `BACKEND_URL`, así el navegador ve un solo origen y la cookie de sesión funciona sin dominio propio. El servidor de Next (metadata e imagen OG del partido) llama a `BACKEND_URL` directo, porque `/api` es relativo. |
| Backend (AdonisJS) | Render (web service, Free) | Root directory `backend`. Build: `npm ci --include=dev && node ace build`. Start: `cd build && npm ci --omit=dev && node ace migration:run --force && node bin/server.js`. |
| PostgreSQL | Neon (Free) | Conexión con SSL obligatorio en producción. Usar el endpoint directo, sin `-pooler`. |

## Variables de producción

- **Render:** `NODE_ENV=production`, `NODE_VERSION=24`, `HOST=0.0.0.0`, `PORT=10000`, `SESSION_DRIVER=cookie`, `APP_KEY`, `APP_URL` (URL de Render), `FRONTEND_URL` (URL de Vercel), `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`.
- **Vercel:** `BACKEND_URL` (URL de Render), `NEXT_PUBLIC_API_URL=/api`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_MOCK_API=false`.

## Limitaciones del plan gratuito

- El backend se duerme tras 15 minutos sin tráfico; la primera petición tarda cerca de un minuto.
- Transmit usa transporte en memoria: mientras haya una sola instancia del backend, el tiempo real funciona; con varias instancias haría falta Redis.
- Vercel Hobby es para uso no comercial.

## Seed en producción

Solo se corre `company_seeder`. `user_seeder` crea cuentas de prueba y no debe correrse ahí.
