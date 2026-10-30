# Modelo de datos

Código y BD en inglés (`snake_case`); UI en español.

| Tabla | Columnas |
|---|---|
| `users` | `id`, `full_name`, `email` (único), `password` (nullable), `google_id` (nullable, único), `avatar_url`, `whatsapp_encrypted` (texto cifrado, nullable), `category` (1–7), `gender` (`male`/`female`), timestamps |
| `branches` | `id`, `name`, `slug` (único), `phone`, `location_label`, `maps_url`, `website` |
| `availabilities` | `id`, `user_id`, `date`, `from_time`, `to_time` (puede ser `24:00`), `branch_id` (nullable), timestamps. Único (`user_id`, `date`) |
| `matches` | `id`, `code` (único), `organizer_id`, `branch_id`, `court_number`, `starts_at` (timestamptz), `duration_minutes`, `category`, `type` (`male`/`female`/`mixed`), `max_players` (4–6), `status` (`open`/`full`/`closed`), `closed_at`, timestamps |
| `match_guests` | `id`, `match_id`, `name`, `category`, `gender` |
| `match_requests` | `id`, `match_id`, `user_id`, `kind`, `status`, timestamps. Único parcial (`match_id`, `user_id`) con `status IN ('pending','accepted')` |
| `push_subscriptions` | `id`, `user_id`, `endpoint` (único), `p256dh`, `auth`, timestamps |

Timestamps en UTC. Las reglas por día se evalúan en `America/Panama` (UTC-5).

Estados como `string` con `CHECK` en la migración, no como enums de Postgres.
