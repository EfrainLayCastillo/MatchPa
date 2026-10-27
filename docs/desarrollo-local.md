# Desarrollo local

Requisitos: Node.js 24 LTS y Docker.

```bash
docker compose up -d

cd backend
cp .env.example .env
npm install
node ace generate:key
node ace migration:run
node ace db:seed
node ace serve --hmr

cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Tests del backend: `node ace test`. Prioridad: transiciones de estado, cálculo de puestos, reapertura, expiración y permisos por acción.

En local el frontend (`localhost:3000`) llama a la API (`localhost:3333`) directamente. Ambos son el mismo sitio para el navegador, así que la cookie de sesión funciona con `SameSite=Lax`. Usa `localhost` en los dos lados, no `127.0.0.1`. En producción el navegador solo habla con el frontend, que reenvía `/api` a Render (ver [despliegue.md](despliegue.md)).

## Datos de prueba

```bash
node ace db:seed --files database/seeders/user_seeder.ts   # Ana y Beto, contraseña secret123
node ace migration:fresh --seed                             # borra todo y vuelve a cargar (solo local)
```

Los seeders usan `updateOrCreate`, así que se pueden correr varias veces.

## Variables de entorno

| Backend (`.env`) | Ejemplo |
|---|---|
| `TZ` | `UTC` |
| `PORT` / `HOST` | `3333` / `localhost` |
| `APP_KEY` | `node ace generate:key` |
| `APP_TIMEZONE` | `America/Panama` |
| `FRONTEND_URL` | `http://localhost:3000` |
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_DATABASE` | `localhost` / `5432` / `matchpa` / `matchpa` / `matchpa` |
| `SESSION_DRIVER` | `cookie` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google Cloud |
| `GOOGLE_CALLBACK_URL` | `http://localhost:3333/api/auth/google/callback` |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | `npx web-push generate-vapid-keys` |
| `VAPID_SUBJECT` | `mailto:hola@matchpa.net` |

| Frontend (`.env.local`) | Ejemplo |
|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3333/api` |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Llave pública del backend |
