# Roadmap

## MVP

- [x] Setup: monorepo, PostgreSQL en Docker, migraciones, seed de sucursales
- [x] Auth con Google y registro, onboarding
- [x] Publicar partido y listarlo en el lobby
- [x] Pedir unirse y aprobación
- [x] Link público con vista previa en WhatsApp
- [x] Disponibilidad y pestaña de jugadores
- [x] Invitaciones
- [x] Salir, sacar, cerrar y expirar
- [x] Tiempo real con Transmit
- [x] PWA + Web Push con modal opt-in
- [x] Botón `wa.me` al organizador (solo jugadores aceptados, partido abierto o completo)
- [x] Límites: 7 partidos por día y sin solapamientos
- [x] WhatsApp cifrado y visibilidad restringida
- [x] Mis partidas con orden y filtro por sucursal

## Beta

- [x] SEO de la página principal: metadata, Open Graph, Twitter Card, canonical y JSON-LD `Organization`/`WebSite`
- [x] SEO del partido: metadata dinámica, JSON-LD `SportsEvent` y `noindex` en partidos cerrados o expirados
- [x] `sitemap.xml` y `robots.txt` (sin partidos: el `code` no debe enumerarse)
- [x] Rendimiento y accesibilidad: Core Web Vitals, imágenes optimizadas, HTML semántico
- [x] Google Analytics 4 con eventos clave (registro, publicar partido, pedir unirse, aprobación)
- [x] Google Search Console (propiedad de dominio `matchpa.app`; la de prefijo sobre `match-pa.vercel.app` queda como historial)
- [x] Dominio propio `matchpa.app`: Vercel, redirección desde `match-pa.vercel.app` y propiedad de dominio en Search Console
- [x] Registro con verificación de correo: código de 6 dígitos con expiración e intentos limitados; la cuenta no publica ni se une hasta verificar. Incluye el envío con Resend en `matchpa.app` (SPF/DKIM/DMARC)
- [x] Recuperación de contraseña por correo
- [x] Google desactivado detrás de un flag (botón oculto y rutas apagadas)
- [ ] Endurecer seguridad
  - [x] Headers de seguridad y CSP en Next (Report-Only)
  - [ ] Aplicar la CSP (`Content-Security-Policy`) tras una semana sin violaciones
  - [x] Rate limit por cuenta en endpoints de escritura
  - [x] Dependencias sin vulnerabilidades altas (`npm audit`)
- [x] Catálogo completo de sucursales de Panamá con coordenadas, y "Sugerir sucursal" (aprobación manual en el seed)
- [ ] Lanzamiento de la beta

## Beta: segunda etapa

- [ ] Reactivar Google y vincularlo a la cuenta con el mismo correo solo si ese correo está verificado

## Después

- [ ] Panel administrativo `/admin` para catálogos y datos estáticos
  - [ ] Rol `admin` de plataforma (el dueño): CRUD de sucursales, aprobar o rechazar "Sugerir sucursal" en la app y cargar eventos especiales
  - [ ] Rol de admin de sucursal: cuenta ligada a una o más sucursales asociadas; edita solo sus datos (teléfono, website, `maps_url`) y sus eventos
  - [ ] Invitación del admin de plataforma para asociar una sucursal, sin autoregistro
  - [ ] Auditoría: quién cambió qué y cuándo

- [ ] Clubs (comunidades de jugadores) en el perfil
- [ ] Chat del partido con mensajes predefinidos ("Voy en camino", "Llego 10 min tarde", "No puedo ir")
- [ ] Avisos por WhatsApp Cloud API
- [ ] Eventos especiales: página `/eventos` con los main events de cada sucursal y del año
  - [ ] Vitrina tematizada: lista y detalle `/eventos/[slug]` con portada, colores y logo propios (tema como datos, no código por evento). Los carga el admin; la inscripción, por WhatsApp a la sucursal
  - [ ] Inscripción de parejas en la app, con cupos por categoría y aprobación del admin
  - [ ] Eliminación directa: cuadro generado desde los inscritos, resultados en vivo con Transmit
  - [ ] Liguilla (fase de grupos + eliminación) con tabla de posiciones
  - [ ] Americano / Mexicano: ranking individual por puntos con rotación de compañero
- [ ] Lobby 3D con avatares estilo Mii
- [ ] Análisis de video con IA
- [ ] Más deportes: tenis, fútbol 5, básquet
