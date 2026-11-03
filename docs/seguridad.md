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
