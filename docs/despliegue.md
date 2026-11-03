# Despliegue

Plataformas en plan gratuito: frontend en Vercel, backend en Render y base de datos en Neon. El dominio `matchpa.app` está registrado en Cloudflare, que también aloja su DNS y el reenvío de correo.

| Pieza | Plataforma | Configuración |
|---|---|---|
| Frontend (Next.js) | Vercel (Hobby) | Root directory `frontend`. Reenvía `/api` y `/__transmit` a Render con `BACKEND_URL`, así el navegador ve un solo origen (`matchpa.app`) y la cookie de sesión es de primera parte. El backend no tiene subdominio público. El servidor de Next (metadata e imagen OG del partido) llama a `BACKEND_URL` directo, porque `/api` es relativo. |
| Backend (AdonisJS) | Render (web service, Free) | Root directory `backend`. Build: `npm ci --include=dev && node ace build`. Start: `cd build && npm ci --omit=dev && node ace migration:run --force && node bin/server.js`. |
| PostgreSQL | Neon (Free) | Conexión con SSL obligatorio en producción. Usar el endpoint directo, sin `-pooler`. |

## Variables de producción

- **Render:** `NODE_ENV=production`, `NODE_VERSION=24`, `HOST=0.0.0.0`, `PORT=10000`, `SESSION_DRIVER=cookie`, `APP_KEY`, `APP_URL` (URL de Render), `FRONTEND_URL=https://matchpa.app`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT=mailto:hola@matchpa.app`. Sin las tres VAPID, Web Push se desactiva sin error. Correo: `MAIL_MAILER=resend`, `RESEND_API_KEY` (permiso de solo envío, limitada a `matchpa.app`), `MAIL_FROM=MatchPa <no-reply@matchpa.app>`.
- **Vercel:** `BACKEND_URL` (URL de Render), `NEXT_PUBLIC_API_URL=/api`, `NEXT_PUBLIC_SITE_URL=https://matchpa.app` (se incrusta al compilar: cambiarla exige redeploy), `NEXT_PUBLIC_MOCK_API=false`, `NEXT_PUBLIC_GTM_ID=GTM-KHLG4MHS` (solo Production), `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (la misma llave pública de Render).

## Dominio

- `matchpa.app` registrado en Cloudflare Registrar, con DNS en Cloudflare (nameservers `*.ns.cloudflare.com`). Los registros que apuntan a Vercel van en modo **DNS only** (nube gris): el proxy de Cloudflare encima de Vercel duplica el TLS y puede bufferear el SSE de Transmit.
- `match-pa.vercel.app` redirige con 308 a `matchpa.app` (Vercel → Domains).
- Search Console: propiedad de dominio verificada con un TXT en Cloudflare. La de prefijo de URL sobre `match-pa.vercel.app` queda solo como historial.

## Correo

- **Entrante:** Cloudflare Email Routing reenvía `hola@matchpa.app` a un Gmail personal (MX y SPF `include:_spf.mx.cloudflare.net` en la raíz). Es el `CONTACT_EMAIL` del frontend y el `VAPID_SUBJECT` del backend. Solo recibe: para responder desde `hola@` hay que usar otro servicio.
- **Saliente:** Resend con el dominio `matchpa.app`. Sus registros no chocan con Email Routing: el DKIM va en `resend._domainkey` y el MX y SPF de rebotes en `send.`, no en la raíz. Registros en Cloudflare (DNS only): los que da Resend, y `TXT _dmarc.matchpa.app` = `v=DMARC1; p=none; rua=mailto:hola@matchpa.app`. El backend usa el transporte de Resend de `@adonisjs/mail`; en local, Mailpit.
- La regla de `hola@` debe tener la acción **Send to an email** y el Gmail de destino verificado. El Catch-all viene en **Drop**: un correo que no coincide con ninguna regla rebota con "dirección no encontrada".

## Limitaciones del plan gratuito

- El backend se duerme tras 15 minutos sin tráfico; la primera petición tarda cerca de un minuto.
- Transmit usa transporte en memoria: mientras haya una sola instancia del backend, el tiempo real funciona; con varias instancias haría falta Redis.
- Vercel Hobby es para uso no comercial.

## Seed en producción

Solo se corre `branch_seeder`. `user_seeder` crea cuentas de prueba y no debe correrse ahí.
