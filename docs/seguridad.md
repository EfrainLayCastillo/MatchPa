# Seguridad y datos sensibles

- **WhatsApp cifrado:** el número se guarda con el servicio de cifrado de AdonisJS (llave `APP_KEY`). Solo acepta números: dígitos, `+`, espacios, paréntesis y guiones, entre 7 y 15 dígitos. Se normaliza antes de guardarse.
- **Uso único:** el número sirve solo para que el organizador de un partido en el que juegas te escriba por WhatsApp. No aparece en listas, notificaciones ni vistas públicas.
- **Sesión:** cookie `httpOnly`, `SameSite=Lax`, y `secure` en producción. CORS solo acepta el origen de `FRONTEND_URL`, con credenciales.
- **Límite de intentos:** registro y login aceptan 10 peticiones por minuto por IP; después responden 429.
- **Correo único:** se valida antes de insertar, y si hay una carrera la violación de la base responde 422 con el mismo mensaje, sin SQL.
- **Verificación de correo:** código de 6 dígitos guardado como HMAC-SHA256 con `APP_KEY`, comparado en tiempo constante. Vence a los 15 minutos, acepta 5 intentos y el endpoint tiene el mismo límite por IP que el login. Los intentos se cuentan dentro de una transacción con bloqueo de fila.
- **Google:** no se vincula automáticamente a una cuenta con contraseña del mismo correo. Se podrá vincular cuando el correo de la cuenta esté verificado (segunda etapa de la beta).
- **Errores:** en producción no se muestran detalles internos; en el frontend, los errores de servidor muestran un mensaje genérico.
- **Llave `APP_KEY`:** no cambiarla nunca en producción; si cambia, los WhatsApp cifrados dejan de descifrarse.
