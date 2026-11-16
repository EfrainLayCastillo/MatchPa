# Seguridad y datos sensibles

- **WhatsApp cifrado:** el número se guarda con el servicio de cifrado de AdonisJS (llave `APP_KEY`). Solo acepta números: dígitos, `+`, espacios, paréntesis y guiones, entre 7 y 15 dígitos. Se normaliza antes de guardarse.
- **Uso único:** el número del organizador lo ven solo él y los jugadores de su partido (aceptados o que aceptaron su invitación), mientras el partido está `open` o `full`, para escribirle por WhatsApp. El número de un jugador no se comparte con nadie. No aparece en listas, notificaciones ni vistas públicas.
- **Sesión:** cookie `httpOnly`, `SameSite=Lax`, y `secure` en producción. CORS solo acepta el origen de `FRONTEND_URL`, con credenciales.
- **Límite de intentos:** registro y login aceptan 10 peticiones por minuto por IP; después responden 429. La IP es la del cliente: el proxy de Next (`frontend/proxy.ts`) borra los headers entrantes y manda `x-client-ip` con `x-proxy-secret`; el backend (`getIp` en `config/app.ts`) solo cree `x-client-ip` si el secreto coincide (`PROXY_SECRET`, comparación en tiempo constante) y es una IP válida. Nunca usa `X-Forwarded-For`: la URL de Render es pública.
- **Correo único:** se valida antes de insertar, y si hay una carrera la violación de la base responde 422 con el mismo mensaje, sin SQL.
- **Verificación de correo:** código de 6 dígitos guardado como HMAC-SHA256 con `APP_KEY`, comparado en tiempo constante. Vence a los 15 minutos, acepta 5 intentos (y 10 fallos por cuenta cada 24 h, que pedir otro código no reinicia) y el endpoint tiene el mismo límite por IP que el login. Los intentos se cuentan dentro de una transacción con bloqueo de fila.
- **Recuperar contraseña:** `forgot` responde 204 siempre y `reset` usa un solo mensaje de error, para no revelar qué correos están registrados. Límite por IP y 5 códigos por hora por cuenta (no por correo escrito: las variantes de Gmail con puntos o `+` llegan a la misma cuenta). La cuenta se busca por el correo normalizado y por el escrito en minúsculas, porque las cuentas de Google guardan el correo tal como lo envía Google.
- **Sesiones versionadas:** la sesión guarda `users.session_version` al iniciar y se compara en cada petición, tanto en el middleware `auth` como en `silent_auth` (rutas públicas y canales de Transmit). Cambiar la contraseña la incrementa y cierra las sesiones de otros dispositivos, aunque el driver sea `cookie`.
- **Cerrar sesión:** sube `session_version`, así que cierra la sesión en todos los dispositivos. Con el store de cookie no hay otra forma de revocar una cookie copiada antes de que venza (2 h).
- **Consentimiento:** fecha y versión de términos aceptadas en `users`; se conservan al anonimizar. Ver `reglas-de-negocio.md`.
- **Eliminar cuenta:** se borran los datos personales (derecho de supresión, Ley 81 de 2019) y se conserva una fila anónima para no romper el historial de partidos de los demás. El correo pasa a un dominio `.invalid`, que nunca recibe correo.
- **Google:** se vincula a la cuenta del mismo correo solo si ambos lados lo verificaron, la cuenta no tiene otro Google y el correo es de Gmail o de Workspace (`hd`). Para otros dominios, `email_verified` de Google solo dice que alguien lo verificó alguna vez, quizá un dueño anterior. Una cuenta sin verificar puede ser de quien registró un correo ajeno: el dueño la recupera con el reset, que verifica el correo, y luego vincula.
- **Redirección `next`:** solo rutas relativas del sitio; se rechazan `//`, `\` y caracteres de control, que el navegador convierte en otro dominio. Igual en el frontend y en el backend.
- **Web Push:** el endpoint de la suscripción solo se acepta de los servicios de push de los navegadores (FCM, Mozilla, Apple, Windows) por HTTPS, porque el servidor le hace POST. Envíos con timeout de 5 s. Al cerrar sesión, el frontend borra la suscripción del dispositivo antes del logout.
- **Solo JSON:** el bodyparser no acepta formularios ni multipart. Un formulario de otro sitio no puede iniciar sesión, registrar ni cambiar contraseña (CSRF de login), aunque Shield tenga CSRF apagado.
- **Errores:** en producción no se muestran detalles internos; en el frontend, los errores de servidor muestran un mensaje genérico. En producción, todo 5xx o error sin status responde `Algo salió mal. Intenta de nuevo.`; el detalle queda en el log. El frontend muestra ese mismo texto en cualquier 5xx.
- **Llave `APP_KEY`:** no cambiarla nunca en producción; si cambia, los WhatsApp cifrados dejan de descifrarse.
- **Headers del sitio (Next, `next.config.ts`):** `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` y `Permissions-Policy` sin cámara, micrófono ni pagos; ubicación solo para el propio sitio (`geolocation=(self)`), para "cerca de ti" en el lobby. HSTS lo pone Vercel.
- **CSP:** va en Next y no en Shield, porque el navegador la aplica a documentos HTML y la API solo responde JSON. Está en `Content-Security-Policy-Report-Only`: las violaciones salen en la consola del navegador. Lista blanca: GTM y GA4. Sin nonces porque con `cacheComponents` harían dinámicas todas las páginas, así que los scripts inline usan `'unsafe-inline'`. Cuando no haya violaciones, se cambia el header a `Content-Security-Policy`.
- **Límites por cuenta** (`start/limiter.ts`, store `database`, clave por usuario):

  | Límite | Rutas | Máximo |
  |---|---|---|
  | `publish` | `POST /matches`, `POST /matches/:code/close` | 10 por hora |
  | `social` | `POST /matches/:code/join-requests`, `POST /matches/:code/invitations` | 30 por hora |
  | `write` | `PATCH/DELETE /me`, `POST /me/terms`, `PATCH /matches/:code`, `PATCH /match-requests/:id`, `PUT/DELETE /me/availabilities/:date`, `POST/DELETE /push-subscriptions` | 120 por hora |

  Son holgados: frenan scripts y ráfagas, no el uso normal. El frontend muestra "Vas muy rápido. Espera un momento y vuelve a intentar." en cualquier 429 sin mensaje propio.
- **Dependencias:** `npm run audit` en cada paquete falla con vulnerabilidades altas de producción. `backend/package.json` fuerza `nodemailer ^10.3.1` con `overrides`, porque `@adonisjs/mail` 10.4 trae la 9.x con vulnerabilidades altas de DoS en `addressparser`; se quita el override cuando `@adonisjs/mail` actualice. Quedan moderate en herramientas de build (`minimatch`, `deepmerge`) sin parche publicado.

## Procedimiento ante una brecha

| Paso | Qué hacer |
|---|---|
| Detectar | Fuente (logs de Render, alerta de un proveedor, reporte de un usuario), hora y qué datos pudieron salir |
| Contener | Cerrar el acceso: revocar llaves del proveedor afectado (Neon, Resend, Google, VAPID), subir `session_version` de todos si hay sesiones comprometidas |
| Rotar | Secretos expuestos. `APP_KEY` solo si se filtró: antes de cambiarla, descifrar los WhatsApp con la vieja y volver a cifrarlos con la nueva |
| Evaluar | Usuarios y datos afectados (el WhatsApp va cifrado; las contraseñas, hasheadas) |
| Notificar | A la ANTAI y a los afectados dentro del plazo del Decreto Ejecutivo 285 de 2021 (confirmar el plazo con el abogado), con qué pasó, qué datos y qué hacer |
| Registrar | Fecha, alcance, causa y medidas, aunque no haya obligación de notificar |

