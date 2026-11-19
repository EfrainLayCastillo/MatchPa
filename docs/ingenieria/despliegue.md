# Despliegue

Plataformas en plan gratuito: frontend en Vercel, backend en Render y base de datos en Neon. El dominio `matchpa.app` está registrado en Cloudflare, que también aloja su DNS y el reenvío de correo.

| Pieza | Plataforma | Configuración |
|---|---|---|
| Frontend (Next.js) | Vercel (Hobby) | Root directory `frontend`. Reenvía `/api` y `/__transmit` a Render con `BACKEND_URL`, así el navegador ve un solo origen (`matchpa.app`) y la cookie de sesión es de primera parte. El backend no tiene subdominio público. El servidor de Next (metadata e imagen OG del partido) llama a `BACKEND_URL` directo, porque `/api` es relativo. |
| Backend (AdonisJS) | Render (web service, Free) | Root directory `backend`. Build: `npm ci --include=dev && node ace build`. Start: `cd build && npm ci --omit=dev && node ace migration:run --force && node ace db:seed --files ./database/seeders/branch_seeder.js && node bin/server.js`. |
| PostgreSQL | Neon (Free) | Conexión con SSL obligatorio en producción. Usar el endpoint directo, sin `-pooler`. |

## Variables de producción

- **Render:** `NODE_ENV=production`, `NODE_VERSION=24`, `HOST=0.0.0.0`, `PORT=10000`, `SESSION_DRIVER=cookie`, `APP_KEY`, `APP_URL` (URL de Render), `FRONTEND_URL=https://matchpa.app`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT=mailto:hola@matchpa.app`. Sin las tres VAPID, Web Push se desactiva sin error. Google: `GOOGLE_AUTH_ENABLED=true`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL=https://matchpa.app/api/auth/google/callback` (por el proxy de Vercel, para que la cookie de `state` y la de sesión queden en `matchpa.app`). Correo: `MAIL_MAILER=resend`, `RESEND_API_KEY` (permiso de solo envío, limitada a `matchpa.app`), `MAIL_FROM=MatchPa <no-reply@matchpa.app>`, `ADMIN_EMAIL` (recibe las sugerencias de sucursal; opcional). `LOG_LEVEL=info` (obligatoria). `PROXY_SECRET`: secreto aleatorio largo, igual al de Vercel; sin él, todas las peticiones comparten el límite por IP del proxy.
- **Vercel:** `BACKEND_URL` (URL de Render), `NEXT_PUBLIC_API_URL=/api`, `NEXT_PUBLIC_SITE_URL=https://matchpa.app` (se incrusta al compilar: cambiarla exige redeploy), `NEXT_PUBLIC_MOCK_API=false`, `NEXT_PUBLIC_GTM_ID=GTM-KHLG4MHS` (solo Production), `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (la misma llave pública de Render), `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true` (Config; igual que en Render; cambiarla exige redeploy). `PROXY_SECRET` (solo servidor, sin `NEXT_PUBLIC_`; el mismo valor que en Render).

## Dominio

- `matchpa.app` registrado en Cloudflare Registrar, con DNS en Cloudflare (nameservers `*.ns.cloudflare.com`). Los registros que apuntan a Vercel van en modo **DNS only** (nube gris): el proxy de Cloudflare encima de Vercel duplica el TLS y puede bufferear el SSE de Transmit.
- `match-pa.vercel.app` redirige con 308 a `matchpa.app` (Vercel → Domains).
- Search Console: propiedad de dominio verificada con un TXT en Cloudflare. La de prefijo de URL sobre `match-pa.vercel.app` queda solo como historial.

## Correo

- **Entrante:** Cloudflare Email Routing reenvía `hola@matchpa.app` a un Gmail personal (MX y SPF `include:_spf.mx.cloudflare.net` en la raíz). Es el `CONTACT_EMAIL` del frontend y el `VAPID_SUBJECT` del backend. Solo recibe: para responder desde `hola@` hay que usar otro servicio.
- **Saliente:** Resend con el dominio `matchpa.app`. Sus registros no chocan con Email Routing: el DKIM va en `resend._domainkey` y el MX y SPF de rebotes en `send.`, no en la raíz. Registros en Cloudflare (DNS only): los que da Resend, y `TXT _dmarc.matchpa.app` = `v=DMARC1; p=none; rua=mailto:hola@matchpa.app`. El backend usa el transporte de Resend de `@adonisjs/mail`; en local, Mailpit.
- `privacidad@matchpa.app` (derechos ARCO+P, publicado en `/privacidad`) necesita su propia regla **Send to an email**; sin ella rebota por el Catch-all.
- La regla de `hola@` debe tener la acción **Send to an email** y el Gmail de destino verificado. El Catch-all viene en **Drop**: un correo que no coincide con ninguna regla rebota con "dirección no encontrada".

## Limitaciones del plan gratuito

- El backend se duerme tras 15 minutos sin tráfico; la primera petición tarda cerca de un minuto.
- Neon suspende el cómputo tras 5 minutos sin consultas y despierta en menos de un segundo. El pool usa `min: 0` para no guardar conexiones que la suspensión deja muertas.
- **Backend despierto todo el día, base de datos caliente en horas pico (hora de Panamá):** el workflow `.github/workflows/keep-awake.yml` llama `GET /api/health` cada 10 minutos, las 24 horas, para que Render no se duerma (744 h en un mes de 31 días, dentro de las 750 h gratis si es el único servicio Free del workspace). `start/db_warmer.ts` hace `select 1` cada 4 minutos solo en horas pico: de lunes a viernes de 11:00 a 13:00 y de 16:00 a 21:00, y sábado y domingo de 07:00 a 21:00. Fuera de esas horas Neon se suspende y la primera consulta lo despierta en menos de un segundo. Las horas pico viven solo en `app/services/peak_hours.ts`.
- GitHub puede atrasar los cron varios minutos y desactiva los workflows programados tras 60 días sin actividad en el repo.
- En la práctica GitHub corre el cron cada 6 a 9 horas, no cada 10 minutos. Por eso hay un ping local de respaldo: un LaunchAgent de macOS (`~/Library/LaunchAgents/app.matchpa.keep-awake.plist`) llama `GET /api/health` cada 10 minutos mientras la Mac esté encendida y despierta. Deja una línea por ping en `~/Library/Logs/matchpa-keep-awake.log`. Se apaga con `launchctl bootout gui/$(id -u)/app.matchpa.keep-awake`.
- Transmit usa transporte en memoria: mientras haya una sola instancia del backend, el tiempo real funciona; con varias instancias haría falta Redis.
- Vercel Hobby es para uso no comercial: pasar a Pro antes de cualquier función de pago, y revisar la lista de proveedores de `/privacidad` si cambia alguno.

## Seed en producción

Solo se corre `branch_seeder` (`user_seeder` declara `environment = ['development', 'test']` y nunca corre en producción), en cada deploy desde el start command. Hace upsert por `slug`, así que es idempotente y sincroniza el catálogo; no borra sucursales que se quiten del seed. `user_seeder` crea cuentas de prueba y no debe correrse ahí.
