# Roadmap

## MVP

- [x] Setup: monorepo, PostgreSQL en Docker, migraciones, seed de empresas
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
- [x] Mis partidas con orden y filtro por empresa

## Beta

- [x] SEO de la página principal: metadata, Open Graph, Twitter Card, canonical y JSON-LD `Organization`/`WebSite`
- [x] SEO del partido: metadata dinámica, JSON-LD `SportsEvent` y `noindex` en partidos cerrados o expirados
- [x] `sitemap.xml` y `robots.txt` (sin partidos: el `code` no debe enumerarse)
- [x] Rendimiento y accesibilidad: Core Web Vitals, imágenes optimizadas, HTML semántico
- [ ] Google Analytics 4 con eventos clave (registro, publicar partido, pedir unirse, aprobación)
- [ ] Google Search Console y verificación del dominio
- [ ] Ajustes de lógica y reglas de negocio (por definir)
- [ ] Lanzamiento de la beta

## Después

- [ ] Clubs (comunidades de jugadores) en el perfil
- [ ] Chat del partido con mensajes predefinidos ("Voy en camino", "Llego 10 min tarde", "No puedo ir")
- [ ] Avisos por WhatsApp Cloud API
- [ ] Torneos: eliminación directa, liguilla, Americano/Mexicano
- [ ] Lobby 3D con avatares estilo Mii
- [ ] Análisis de video con IA
- [ ] Más deportes: tenis, fútbol 5, básquet
