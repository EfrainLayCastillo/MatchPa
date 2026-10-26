# MatchPa 🎾

> **Match** de búsqueda para jugadores + **Pa** de Panamá y del "ey Pa" de barrio.

Plataforma social de pádel para completar partidos y encontrar jugadores. Pensada para crecer a torneos y más deportes.

🌐 **matchpa.net**

---

## El problema

Las empresas con canchas de pádel (WePadel, XForce…) tienen grupos de WhatsApp donde se repite a diario:

> "¿Quién disponible para las 6pm? Buscamos pala de 4ta categoría"
>
> "Partido mixto — Sacha, Efrain, Esteban. Buscamos una pala disponible"

La cancha ya está reservada (empresa, # de cancha, hora), el partido es de 4 y dura 1h30 o 2h, y casi siempre falta 1. El mensaje se pierde en el chat.

## La solución (MVP)

1. **Publicar partido:** el organizador carga fecha, hora, empresa, cancha, categoría, tipo y los jugadores que ya tiene. Se muestran los puestos disponibles.
2. **Compartir:** el partido genera un link público para el grupo de WhatsApp o amistades.
3. **Unirse:** un jugador pide unirse o el organizador lo invita desde el pool ("Ey Pa, ¿juegas?"). El organizador aprueba.
4. **Disponibilidad:** un jugador se postula para un día y queda visible en el pool.
5. **Cierre:** al llenarse los puestos: **¡Match!** El organizador también puede cerrarlo antes; si no, expira a la hora de la reserva.

---

## Reglas de negocio

### Partidos

- Fecha de hoy o futura.
- Máximo de jugadores: 4 por defecto, hasta 6.
- El organizador cuenta como jugador. Los que ya tiene son **invitados** (nombre, categoría, género), sin cuenta.
- **Puestos disponibles** = máximo − organizador − invitados − aceptados.
- Sin puestos → `full`. El organizador puede cerrar antes (`closed`), por ejemplo con 4 de 6.
- Solo el organizador aprueba, invita, saca jugadores, edita y cierra.
- Si un jugador sale o lo sacan, se libera el puesto; un partido `full` que no ha empezado vuelve a `open`.
- No puedes unirte a tu propio partido ni tener dos solicitudes activas en el mismo.
- Al salir de `open`, las solicitudes pendientes pasan a `cancelled`.
- Duración: 90 o 120 minutos.

| Estado | UI | Cuándo |
|---|---|---|
| `open` | Abierto | Con puestos disponibles. Aparece en el pool |
| `full` | Completo | Sin puestos |
| `closed` | Cerrado | Cerrado por el organizador |
| `expired` | Expirado | Llegó la hora sin completarse ni cerrarse. Se calcula al consultar (`status = 'open' AND starts_at <= now()`), sin cron |

### Solicitudes e invitaciones

Una sola entidad, `match_requests`, con `kind`:

| `kind` | La crea | La responde |
|---|---|---|
| `join_request` | El jugador | El organizador |
| `invitation` | El organizador | El invitado |

| Estado | Cuándo |
|---|---|
| `pending` | Esperando respuesta |
| `accepted` | Es jugador del partido |
| `rejected` | Rechazada |
| `cancelled` | El partido salió de `open` |
| `left` | El jugador se salió |
| `removed` | El organizador lo sacó |

### Link para compartir

- URL: `matchpa.net/partidos/<code>`, con `code` aleatorio de 8 caracteres (no el `id`, para evitar enumeración).
- Se muestra al publicar y en el detalle.
- Ver no requiere cuenta. Unirse sí: login → onboarding → vuelve al partido y envía la solicitud.
- Sin teléfonos en la vista pública; el botón de WhatsApp solo aparece con sesión.
- Si el partido no está `open`, muestra su estado en vez del botón de unirse.
- Botón Compartir con `navigator.share`; fallback a "Copiar link" y `wa.me/?text=`.
- Vista previa Open Graph dinámica (`generateMetadata` + `opengraph-image`): empresa, fecha, hora, categoría y puestos.

### Disponibilidad

- Una por jugador por fecha (hoy o futura), con rango de horas.
- Empresa opcional; vacía = cualquiera.
- El jugador la quita o expira al terminar el día (`date < hoy` en hora de Panamá).

### Categorías

- 1ra (más alta) a 7ma, guardadas como entero `1`–`7`.
- La elige el jugador y la actualiza en su perfil.
- No filtra, ordena: primero tu categoría, luego las más cercanas (`ORDER BY abs(category - :mine)`).

### Empresas

- Pool global; la ubicación de un partido es la empresa. Sin direcciones.
- Catálogo fijo por seed. Inicial: WePadel y XForce.

### Estados del jugador (UI)

| Estado | Regla | Estilo |
|---|---|---|
| Disponible | Tiene disponibilidad en la fecha vista | Lima |
| Buscando | Organiza un partido `open` | Blanco con borde verde azulado |
| En partido | Está en un partido `full` de hoy | Gris |

---

## Modelo de datos

Código y BD en inglés (`snake_case`); UI en español.

| Tabla | Columnas |
|---|---|
| `users` | `id`, `full_name`, `email` (único), `password` (nullable), `google_id` (nullable, único), `avatar_url`, `phone`, `category` (1–7), `gender` (`male`/`female`), timestamps |
| `companies` | `id`, `name`, `slug` (único), `phone`, `location_label`, `maps_url`, `website` |
| `availabilities` | `id`, `user_id`, `date`, `from_time`, `to_time`, `company_id` (nullable), timestamps. Único (`user_id`, `date`) |
| `matches` | `id`, `code` (único), `organizer_id`, `company_id`, `court_number`, `starts_at` (timestamptz), `duration_minutes`, `category`, `type` (`male`/`female`/`mixed`), `max_players` (4–6), `status` (`open`/`full`/`closed`), `closed_at`, timestamps |
| `match_guests` | `id`, `match_id`, `name`, `category`, `gender` |
| `match_requests` | `id`, `match_id`, `user_id`, `kind`, `status`, timestamps. Único parcial (`match_id`, `user_id`) con `status IN ('pending','accepted')` |
| `push_subscriptions` | `id`, `user_id`, `endpoint` (único), `p256dh`, `auth`, timestamps |

Timestamps en UTC. Las reglas por día se evalúan en `America/Panama` (UTC-5).

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion |
| Backend | AdonisJS 7, Lucid, VineJS, Japa |
| Auth | AdonisJS Auth (sesión con cookie) + Ally (Google) |
| Base de datos | PostgreSQL |
| Tiempo real | AdonisJS Transmit (SSE) |
| PWA | `app/manifest.ts` + service worker solo para push |
| Push | Web Push con VAPID (`web-push`) |
| 3D (fase 2) | React Three Fiber + drei |

```
matchpa/
├── frontend/
├── backend/
├── docker-compose.yml   # PostgreSQL local
└── README.md
```

### Mobile first

La mayoría llega desde el celular. Diseño desde ~375px, escalando con `sm`/`md`/`lg` de Tailwind. Acciones principales abajo, áreas táctiles de 44px, tarjetas de una columna, formularios cortos.

---

## Rutas del frontend

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
| `/perfil` | Sí | Editar perfil y push |

Ambas pestañas del lobby se ordenan por cercanía a tu categoría. **Partidos** filtra por empresa, tipo y hora; **Jugadores** por empresa y horario, y al tocar uno aparece "Ey Pa, ¿juegas?".

---

## API (MVP)

Base `/api`. Todo requiere sesión salvo auth, `GET /companies` y `GET /matches/:code`. Los partidos se identifican por `code`.

### Auth y perfil

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/auth/google/redirect` | Login con Google |
| `GET` | `/auth/google/callback` | Callback de Google |
| `POST` | `/auth/register` | Registro |
| `POST` | `/auth/login` | Login con correo |
| `POST` | `/auth/logout` | Logout |
| `GET` | `/me` | Usuario actual |
| `PATCH` | `/me` | Actualizar perfil |

### Jugadores y disponibilidad

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/companies` | Catálogo de empresas |
| `GET` | `/players` | Jugadores disponibles (`date`, `companyId`, horario) |
| `GET` | `/me/availabilities` | Mis disponibilidades futuras |
| `PUT` | `/me/availabilities/:date` | Crear o actualizar |
| `DELETE` | `/me/availabilities/:date` | Quitar |

### Partidos

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/matches` | Publicar (con invitados) |
| `GET` | `/matches` | Partidos `open` (`date`, `companyId`, `type`) |
| `GET` | `/matches/:code` | Detalle público; incluye solicitudes si eres organizador |
| `PATCH` | `/matches/:code` | Editar mientras está `open` |
| `POST` | `/matches/:code/close` | Cerrar |
| `POST` | `/matches/:code/join-requests` | Pedir unirse |
| `POST` | `/matches/:code/invitations` | Invitar (`userId`) |
| `PATCH` | `/match-requests/:id` | Ejecutar `action` |
| `GET` | `/me/matches` | Partidos que organizo o juego |
| `GET` | `/me/match-requests` | Mis solicitudes e invitaciones pendientes |

| `action` | Desde | Quién |
|---|---|---|
| `accept` / `reject` | `pending` | Organizador (`join_request`) o invitado (`invitation`) |
| `leave` | `accepted` | El jugador |
| `remove` | `accepted` | El organizador |

### Push

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/push-subscriptions` | Registrar dispositivo |
| `DELETE` | `/push-subscriptions` | Quitar dispositivo |

Errores: `422` de VineJS con `errors[]`, `403` si no tienes permiso para la acción.

---

## Tiempo real y notificaciones

### Canales Transmit

| Canal | Suscriptores | Eventos |
|---|---|---|
| `lobby` | Usuarios en `/lobby` | `match.created`, `match.updated`, `availability.changed` |
| `users/:id` | El propio usuario | `request.created`, `request.updated` |
| `matches/:code` | Organizador y jugadores | `match.updated` |

### Push

| Evento | Destinatario |
|---|---|
| Nueva solicitud | Organizador |
| Nueva invitación | Invitado |
| Solicitud o invitación aceptada | La otra parte |
| Partido completo | Organizador y jugadores |
| Partido cerrado | Jugadores aceptados |
| Jugador se salió | Organizador |
| Jugador sacado | El jugador |

La notificación abre `/partidos/[code]`. Las suscripciones que responden `404`/`410` se borran.

**Modal opt-in:** aparece al publicar un partido o al pedir unirse, nunca al abrir la app. Si acepta, se pide el permiso del navegador; si no, se activa luego en `/perfil`. En iPhone (iOS 16.4+) push requiere la PWA en la pantalla de inicio, así que el modal primero explica cómo instalarla.

**WhatsApp:** en el MVP, botón `wa.me/<teléfono>` al organizador.

---

## Desarrollo local

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

En producción frontend y API comparten sitio (`matchpa.net` / `api.matchpa.net`) para que la cookie de sesión funcione (`SameSite=Lax`), con CORS con credenciales.

### Variables de entorno

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

---

## Brandbook

Deportivo, urbano y de alto contraste: lima neón sobre verde azulado profundo, tipografía bold enorme, acentos manuscritos y fotografía B/N con grano.

| Color | Hex (aprox.) | Uso |
|---|---|---|
| Lima MatchPa | `#C8F526` | Principal, botones, fondos de impacto |
| Verde azulado | `#0B4A55` | Fondos oscuros, texto sobre lima |
| Marfil | `#F7F6F0` | Fondo claro |
| Carbón | `#1A1A1A` | Texto, fotografía B/N |

> Colores aproximados; ajustar al definir los tokens.

- **Tipografía:** títulos en grotesca bold (Bricolage Grotesque o Archivo), acentos en script (Yellowtail), texto en Inter.
- **Logo:** **Match** en bold + **Pa** en script.
- **Gráficos:** estrella de 4 puntas, globo en alambre, carita sonriente en línea, trazos de la pelota.
- **Tono:** casual y panameño: "Ey Pa, ¿juegas?", "Buscando Pa's...", "¡Match! Ya están los 4".

---

## Desarrollo con IA (Claude Code)

Diagrama interactivo de la arquitectura: [`docs/arquitectura.html`](docs/arquitectura.html), generado con [archify](https://github.com/tt-a1i/archify).

### Fuentes de verdad

| Archivo | Responde |
|---|---|
| `README.md` | Qué se construye (reglas, modelo, API) |
| `context.md` (local) | Por qué se decidió así |
| `CLAUDE.md`, `backend/CLAUDE.md`, `frontend/CLAUDE.md` | Cómo se escribe el código en cada parte |

### Estructura

```
CLAUDE.md                  # idioma, flujo de trabajo, docs que se actualizan
backend/CLAUDE.md          # convenciones AdonisJS, Lucid, VineJS, Japa
frontend/CLAUDE.md         # mobile first, brandbook, shadcn/ui
.claude/agents/            # especialistas
.claude/skills/            # flujos propios del proyecto
```

### Agentes

Pocos y por responsabilidad, con herramientas limitadas:

| Agente | Hace | Herramientas |
|---|---|---|
| `backend` | Migraciones, modelos, validators, controllers, tests Japa | Lectura, escritura, shell |
| `frontend` | Pantallas mobile first con shadcn/ui y el brandbook | Lectura, escritura, shell |
| `rules-reviewer` | Revisa el código contra las Reglas de negocio de este README | Solo lectura |

### Skills del proyecto

| Skill | Hace |
|---|---|
| `new-endpoint` | Validator + controller + ruta + test + fila en la tabla de API del README |
| `sync-docs` | Lleva una decisión nueva al README y a `context.md` |

### Skills externas

Incluidas en `.claude/skills/` (copiadas de su repo de origen):

| Skill | Para | Origen | Requiere |
|---|---|---|---|
| `shadcn` | Componentes y CLI de shadcn/ui según `components.json` | `shadcn-ui/ui` | — |
| `next-dev-loop` | Verificar cambios en el dev server de Next.js | `vercel/next.js` | `next dev` corriendo, `agent-browser` |
| `react-best-practices` | Rendimiento de React/Next.js | `vercel-labs/agent-skills` | — |
| `web-design-guidelines` | Revisión de UI y accesibilidad | `vercel-labs/agent-skills` | Internet (descarga las reglas al usarse) |
| `frontend-design` | Dirección visual de la UI | `anthropics/skills` | — |
| `webapp-testing` | Pruebas en navegador con Playwright | `anthropics/skills` | Python + Playwright |

Global (no se versiona): `archify` para diagramas, `npx skills add tt-a1i/archify -g`.

Para actualizar una skill, vuelve a copiar su carpeta desde el repo de origen. No hay skill pública de AdonisJS; las convenciones van en `backend/CLAUDE.md` y en `new-endpoint`.

### Harness

Checks deterministas en `.claude/settings.json`, que no dependen de que el modelo siga instrucciones:

| Pieza | Qué hace |
|---|---|
| `hooks/post-edit-lint.sh` | ESLint del archivo editado; los errores vuelven a Claude |
| `hooks/stop-verify.sh` | Typecheck, lint y tests del paquete con cambios; si fallan, Claude no termina |
| Permisos | Bloquea force push, `reset --hard`, `rm -rf` y leer/editar `.env` |

Ambos hooks no hacen nada hasta que `backend/` y `frontend/` tengan `package.json` y dependencias instaladas. Con el código se suman la suite de reglas de negocio, el chequeo de la tabla de API, E2E a 375px y CI en GitHub Actions.

### Flujo por historia

1. Tomar un ítem del Roadmap y partirlo con `/slice`.
2. Planear con `/rpi`.
3. Implementar con `backend` y/o `frontend`.
4. Revisar con `rules-reviewer` y `/code-review`.
5. `sync-docs` y commit.

---

## Roadmap

### MVP

- [ ] Setup: monorepo, PostgreSQL en Docker, migraciones, seed de empresas
- [ ] Auth con Google y registro, onboarding
- [ ] Publicar partido y listarlo en el lobby
- [ ] Pedir unirse y aprobación
- [ ] Link público con vista previa en WhatsApp
- [ ] Disponibilidad y pestaña de jugadores
- [ ] Invitaciones
- [ ] Salir, sacar, cerrar y expirar
- [ ] Tiempo real con Transmit
- [ ] PWA + Web Push con modal opt-in
- [ ] Botón `wa.me` al organizador

### Después

- [ ] Clubs (comunidades de jugadores) en el perfil
- [ ] Chat del partido con mensajes predefinidos ("Voy en camino", "Llego 10 min tarde", "No puedo ir")
- [ ] Avisos por WhatsApp Cloud API
- [ ] Torneos: eliminación directa, liguilla, Americano/Mexicano
- [ ] Lobby 3D con avatares estilo Mii
- [ ] Análisis de video con IA
- [ ] Más deportes: tenis, fútbol 5, básquet
