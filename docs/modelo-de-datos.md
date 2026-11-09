# Modelo de datos

Código y BD en inglés (`snake_case`); UI en español.

| Tabla | Columnas |
|---|---|
| `users` | `id`, `full_name`, `email` (único), `password` (nullable), `google_id` (nullable, único), `avatar_url`, `whatsapp_encrypted` (texto cifrado, nullable), `category` (1–7), `category_tier` (`high`/`entry`, nullable), `gender` (`male`/`female`), `email_verified_at` (timestamptz, nullable), `session_version` (int, default 0), `deleted_at` (timestamptz, nullable: cuenta eliminada y anonimizada), timestamps |
| `email_verifications` | `id`, `user_id` (FK cascade), `purpose` (`verify_email`/`reset_password`; único con `user_id`), `code_hash` (HMAC-SHA256 con `APP_KEY`), `expires_at`, `attempts`, `created_at`. Una fila por usuario y propósito: el código nuevo reemplaza al anterior y se borra al verificar |
| `branches` | `id`, `name`, `slug` (único), `phone` (nullable), `location_label`, `maps_url`, `website` (nullable; acepta Instagram), `latitude` y `longitude` (`decimal(9,6)`, nullable), timestamps |
| `branch_suggestions` | `id`, `user_id` (FK cascade), `name`, `location_label`, `maps_url` (nullable, 500), `status` (`pending`/`approved`/`rejected`, default `pending`), timestamps. Único parcial (`user_id`) con `status = 'pending'` |
| `availabilities` | `id`, `user_id`, `date`, `from_time` y `to_time` (nullable; los dos null = todo el día, o los dos con valor; `to_time` puede ser `24:00`), `branch_id` (nullable), timestamps. Único (`user_id`, `date`) |
| `matches` | `id`, `code` (único), `organizer_id`, `branch_id`, `court_number`, `starts_at` (timestamptz), `duration_minutes`, `category`, `category_tier` (`high`/`entry`, nullable), `type` (`male`/`female`/`mixed`), `max_players` (4–6), `status` (`open`/`full`/`closed`), `closed_at`, timestamps |
| `match_guests` | `id`, `match_id`, `name`, `category`, `gender` |
| `match_requests` | `id`, `match_id`, `user_id`, `kind`, `status`, timestamps. Único parcial (`match_id`, `user_id`) con `status IN ('pending','accepted')` |
| `push_subscriptions` | `id`, `user_id`, `endpoint` (único), `p256dh`, `auth`, timestamps |

Timestamps en UTC. Las reglas por día se evalúan en `America/Panama` (UTC-5).

Estados como `string` con `CHECK` en la migración, no como enums de Postgres.
