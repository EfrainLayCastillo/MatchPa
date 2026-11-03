# Seguridad y datos sensibles

- **WhatsApp cifrado:** el número se guarda con el servicio de cifrado de AdonisJS (llave `APP_KEY`). Solo acepta números: dígitos, `+`, espacios, paréntesis y guiones, entre 7 y 15 dígitos. Se normaliza antes de guardarse.
- **Uso único:** el número sirve solo para que el organizador de un partido en el que juegas te escriba por WhatsApp. No aparece en listas, notificaciones ni vistas públicas.
- **Sesión:** cookie `httpOnly`, `SameSite=Lax`, y `secure` en producción. CORS solo acepta el origen de `FRONTEND_URL`, con credenciales.
- **Límite de intentos:** registro y login aceptan 10 peticiones por minuto por IP; después responden 429.
- **Correo único:** se valida antes de insertar, y si hay una carrera la violación de la base responde 422 con el mismo mensaje, sin SQL.
- **Verificación de correo:** código de 6 dígitos guardado como HMAC-SHA256 con `APP_KEY`, comparado en tiempo constante. Vence a los 15 minutos, acepta 5 intentos y el endpoint tiene el mismo límite por IP que el login. Los intentos se cuentan dentro de una transacción con bloqueo de fila.
- **Recuperar contraseña:** `forgot` responde 204 siempre y `reset` usa un solo mensaje de error, para no revelar qué correos están registrados. Límite por IP y 5 códigos por hora por cuenta (no por correo escrito: las variantes de Gmail con puntos o `+` llegan a la misma cuenta). La cuenta se busca por el correo normalizado y por el escrito en minúsculas, porque las cuentas de Google guardan el correo tal como lo envía Google.
- **Sesiones versionadas:** la sesión guarda `users.session_version` al iniciar y se compara en cada petición, tanto en el middleware `auth` como en `silent_auth` (rutas públicas y canales de Transmit). Cambiar la contraseña la incrementa y cierra las sesiones de otros dispositivos, aunque el driver sea `cookie`.
- **Eliminar cuenta:** se borran los datos personales (derecho de supresión, Ley 81 de 2019) y se conserva una fila anónima para no romper el historial de partidos de los demás. El correo pasa a un dominio `.invalid`, que nunca recibe correo.
- **Google:** no se vincula automáticamente a una cuenta con contraseña del mismo correo. Se podrá vincular cuando el correo de la cuenta esté verificado (segunda etapa de la beta).
- **Errores:** en producción no se muestran detalles internos; en el frontend, los errores de servidor muestran un mensaje genérico.
- **Llave `APP_KEY`:** no cambiarla nunca en producción; si cambia, los WhatsApp cifrados dejan de descifrarse.
- **Headers del sitio (Next, `next.config.ts`):** `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` y `Permissions-Policy` sin cámara, micrófono, ubicación ni pagos. HSTS lo pone Vercel.
- **CSP:** va en Next y no en Shield, porque el navegador la aplica a documentos HTML y la API solo responde JSON. Está en `Content-Security-Policy-Report-Only`: las violaciones salen en la consola del navegador. Lista blanca: GTM y GA4. Sin nonces porque con `cacheComponents` harían dinámicas todas las páginas, así que los scripts inline usan `'unsafe-inline'`. Cuando no haya violaciones, se cambia el header a `Content-Security-Policy`.
- **Límites por cuenta** (`start/limiter.ts`, store `database`, clave por usuario):

  | Límite | Rutas | Máximo |
  |---|---|---|
  | `publish` | `POST /matches`, `POST /matches/:code/close` | 10 por hora |
  | `social` | `POST /matches/:code/join-requests`, `POST /matches/:code/invitations` | 30 por hora |
  | `write` | `PATCH/DELETE /me`, `PATCH /matches/:code`, `PATCH /match-requests/:id`, `PUT/DELETE /me/availabilities/:date`, `POST/DELETE /push-subscriptions` | 120 por hora |

  Son holgados: frenan scripts y ráfagas, no el uso normal. El frontend muestra "Vas muy rápido. Espera un momento y vuelve a intentar." en cualquier 429 sin mensaje propio.
- **Dependencias:** `npm run audit` en cada paquete falla con vulnerabilidades altas de producción. `backend/package.json` fuerza `nodemailer ^10.3.1` con `overrides`, porque `@adonisjs/mail` 10.4 trae la 9.x con vulnerabilidades altas de DoS en `addressparser`; se quita el override cuando `@adonisjs/mail` actualice. Quedan moderate en herramientas de build (`minimatch`, `deepmerge`) sin parche publicado.
