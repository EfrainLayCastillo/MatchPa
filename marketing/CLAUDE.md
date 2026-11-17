# Marketing — videos con HyperFrames para Instagram

Contenido para Instagram (Reels, Stories y carruseles) hecho con [HyperFrames](https://hyperframes.heygen.com): composiciones en HTML + GSAP que se renderizan a MP4. La metodología completa está en `metodologia.md`.

## Estructura

- `metodologia.md`: pilares de contenido, formatos y el flujo por pieza.
- `motion.md`: subtítulos y piezas del catálogo aprobadas.
- `guiones/`: un guion con storyboard por pieza (`AAAA-MM-DD-slug.md`), creado a partir de `guiones/_plantilla.md`.
- `videos/`: un proyecto HyperFrames por pieza, con el mismo slug del guion. Para crear uno, copia `videos/_plantilla-reel`.
- `assets/`: marca y música que se comparten entre piezas. Lo que usa una sola pieza va en el `assets/` de su proyecto.
- `carruseles/`: un proyecto HyperFrames por carrusel de Instagram, con el mismo slug del guion. Referencia: `carruseles/2026-11-17-nadie-responde`.
- `grabaciones/` y `renders/`: material crudo y MP4 finales. Están en `.gitignore`, igual que `videos/` y `carruseles/`.

## Reglas

- Formato por defecto: vertical 1080×1920, 30 fps. Las Stories duran 15 s o menos; los Reels, entre 15 y 45 s.
- Zona segura: no pongas texto ni CTA en los 250 px de arriba ni en los 340 px de abajo, porque ahí Instagram pone su propia interfaz.
- El gancho va en los primeros 2 s.
- Los subtítulos van siempre, quemados en el video y en español, porque la mayoría ve sin sonido. Las reglas de subtítulos, las piezas de motion y los isométricos están en `motion.md`.
- La app sale con grabación de pantalla del teléfono o con las capturas de `docs/capturas/`, metida en un mockup de teléfono. Nunca dibujes una UI inventada.
- La marca sale de `docs/brandbook.md`: colores, tipografía, logo y tono. No uses colores sueltos.
- Lo que muestra el video tiene que existir en la app (`docs/reglas-de-negocio.md`): no prometas funciones del roadmap como si ya estuvieran.
- Antes de escribir una composición, carga la skill `/hyperframes`. Antes de entregar, corre `npm run check` en el proyecto.
- Textos en español panameño casual: "Ey Pa, ¿juegas?". Código y nombres de archivo en inglés o en slug sin acentos.

## Herramientas

- La app de HyperFrames cambia sus rutas al actualizarse. `scripts/vo.mjs` y `scripts/sfx.mjs` buscan solos el runtime del CLI y el de ffmpeg. La voz de HeyGen requiere un plan de HyperFrames; por eso la voz por defecto es Voicebox.
- FFmpeg y el CLI vienen dentro de la app: `export PATH="$(ls -d "$HOME/Library/Application Support/HyperFrames/runtimes"/ffmpeg-*/ | head -1):$PATH"`. El nombre de la carpeta cambia con cada actualización de la app.
- Para transcribir, usa `npx hyperframes transcribe <video> --language=es --engine=whisper --model=small`. El CLI de la app se niega a transcribir.
- Las tomas se unen y normalizan a 1080×1920 y 30 fps con ffmpeg en `assets/tomas.mp4`. Los cortes se hacen con `data-media-start`.

## Automatización

- `sh scripts/nuevo-video.sh <slug>`: crea el proyecto desde la plantilla, con fuentes, sonidos, música y capturas ya copiados, y el guion si falta.
- `node scripts/vo.mjs <slug> [--solo 2,5]`: genera la voz en off de la tabla del guion e imprime las palabras con sus tiempos. Con `**Voz:** Voicebox, perfil `efrain`` usa Voicebox local: el servicio `voicebox` del `docker-compose.yml` de la raíz, que se levanta con `docker compose --profile marketing up -d voicebox` y queda en `http://localhost:17600` y saca los tiempos con Whisper. Con un id de HeyGen usa HeyGen, que requiere plan.
- `node scripts/sfx.mjs buscar|bajar|catalogo`: busca y descarga sonidos de la librería de HeyGen en `assets/sfx/` y actualiza `assets/sfx/CATALOGO.md`.
- `node scripts/grabar.mjs <slug> [--solo <id>] [--sync]`: graba las tomas de la app y las sincroniza con la composición (ver "Grabaciones de la app").
- `node scripts/carrusel.mjs <slug>`: saca un PNG por slide del carrusel en `renders/<slug>/slide-N.png`, listos para subir en orden, y `publicacion.md` con el caption, los hashtags (3 a 5) y el alt text de cada slide, que toma del guion (sección `## Alt text`, una línea corta por slide).
- `node scripts/logo.mjs`: genera el logo con el texto en trazos (SVG y PNG) en `assets/marca/logo/`, desde las fuentes de `assets/fonts/`.
- Mapa de Panamá con palas como pines (`map.mjs`), pala y pelota de pádel (`racket.mjs`, `racket-preview.mjs` genera `assets/racket*.svg`): `videos/2026-11-05-birria-pa-hoy/anatomy/`. `node anatomy/map.mjs` inyecta el mapa entre `<!-- map:start -->` y los puntos en `const MAP`.
- Cancha y personajes isométricos: la versión al día está en `videos/2026-11-10-quien-pa-birrear/anatomy/`: `court.mjs` (cancha con grada y jugadores sentados) y `figures.mjs` (personajes chibi, `seated` con `id` y `drop`, pala ovalada y `badgePoint`). Cópialos de ahí y no de piezas anteriores. `node anatomy/court.mjs [--wait]` inyecta el SVG y los puntos de cámara (`const ISO`) en `index.html` entre los marcadores `<!-- court:start -->`.

## Ahorro de tokens

- Lee solo el guion de la pieza en curso. `metodologia.md` solo se lee para planificar piezas nuevas.
- Para elegir sonidos lee `assets/sfx/CATALOGO.md`; no busques ni midas audio otra vez. Si falta uno, `scripts/sfx.mjs bajar` lo agrega al catálogo.
- No leas `index.html` completo: usa `npx hyperframes timeline` o `grep` sobre la función que cambias. Nunca leas el SVG inyectado de la cancha.
- No leas videos ni grabaciones completos: usa `hyperframes snapshot`, o la transcripción si existe.
- Revisa con `snapshot` en pocos segundos clave y lee el `contact-sheet`, no cada PNG.
- No renderices: al terminar, `npx hyperframes open .` deja el proyecto en la app y el usuario exporta desde ahí.

## Carruseles

- Solo imágenes: un PNG por slide, sin video ni GIF. 1080×1350 (4:5), 4 slides o menos.
- Estructura de historia: gancho (portada) → el problema que reconoce el jugador → giro → cierre corto con el logo, **matchpa.app** en pastilla lima y "Link en la bio". El cierre no lleva fondo lima ni "Guárdalo".
- Todo en un solo `index.html`: cada slide es una `<section class="clip slide">` de 1 s y el root declara `data-slides="1,1,1,1"`. Sin animaciones: `node scripts/carrusel.mjs <slug>` toma un snapshot de cada slide.
- Las ilustraciones salen de anatomy o de un cuadro de un reel (`npx hyperframes snapshot --at <s> --zoom 'x,y,w,h'`), no de fotos de stock. Referencia: `carruseles/2026-11-17-nadie-responde` (la grada sale del reel "Qué es MatchPa").
- Si sale la app, se graba en modo mock (`grabar.mjs` encuentra la pieza en `carruseles/<slug>/`). No uses las capturas de `docs/capturas/` ni de `assets/marca/`: muestran clubes reales.
- El chat del problema se dibuja con burbujas en colores de la marca, sin la interfaz ni el logo de WhatsApp.

## Grabaciones de la app

Lo que el video muestra de la app se graba solo, con Playwright, contra el frontend en modo mock. Es la excepción a la regla de la raíz "no corras navegador", y vale solo aquí.

- **Datos:** siempre modo mock (`NEXT_PUBLIC_MOCK_API=true`), nunca el backend ni datos reales. La sesión es la de Efrain y los jugadores son de `frontend/lib/mock-api.ts`. Si una toma necesita un estado que el mock no tiene (por ejemplo, un partido abierto), se agrega ahí, como dato de desarrollo, y se commitea en el frontend.
  - La sucursal de las tomas es ficticia, **Pádel del Barrio** (`branchId: 1`): ninguna marca real de club sale en un video.
  - El partido de Efrain es hoy a las 8 p. m. (`eveningOrLater`), así que la hora no depende de cuándo se grabe. Los horarios de los jugadores disponibles cubren ese partido.
  - Con un partido abierto, la pestaña Jugadores ya viene filtrada por su sucursal: no hace falta filtrar en la toma.
- **Localizadores:** usa el nombre accesible, por ejemplo `getByRole("button", { name: /Invitar a Sacha/ })`, y no la posición (`.first()`, `.nth()`), que se rompe cuando cambia el diseño.
- **Pasos extra:** `scroll` (px, suave) para bajar a una lista.
- **Tomas:** en `videos/<slug>/tomas.mjs`. Cada toma tiene:
  - `id`.
  - `video`: dónde entra en la composición. `start` es el segundo del video final; `from`–`to`, el tramo de la toma; `rate`, la velocidad.
  - `setup`: pasos antes del corte; no salen en el video.
  - `steps`: lo que se ve. Los pasos son `goto`, `tap` (con un localizador por rol o texto y un `label`), `type`, `key` y `wait`.
- **Grabar:** `node scripts/grabar.mjs <slug>`, o `--solo <id>` para una sola toma. Deja:
  - `grabaciones/<slug>/<id>.mp4` (30 fps) y su copia en `assets/rec/`.
  - `assets/tomas.json`, con la duración y cada toque: segundo, posición normalizada y `label`.
  - La composición actualizada: `const TOMAS = …;`, el bloque `<!-- tomas-video:start/end -->` (un `<video>` por toma) y `<!-- tomas-audio:start/end -->` (un clic por toque).
- **Cambiar un corte sin regrabar:** se edita `video` en `tomas.mjs` y se corre `node scripts/grabar.mjs <slug> --sync`.
- **En la composición:** los anillos de toque salen de `TOMAS[id].taps` y de `TOMAS[id].video`. Pantalla del teléfono: 390×844 escalada a 560 px de ancho (`PHONE_SCREEN`). `videos/2026-11-10-quien-pa-birrear` es la referencia.
- **Cómo corre:**
  - El grabador copia el frontend en `.cache/frontend-mock`, sin `.next` ni `.env` y con `node_modules` enlazado por hardlinks, y lo levanta en el puerto 3123. Así no choca con el `next dev` del usuario: Next no permite dos en la misma carpeta.
  - Quita el indicador de desarrollo de Next.
  - Graba con el screencast de Chrome a 2× (780×1688, PNG por cuadro) y codifica en H.264 con CRF 10. Para que los cuadros salgan a 2×, Chrome se lanza con `--force-device-scale-factor=2` y sin viewport emulado: con la emulación de Playwright salen a 1× y se ven borrosos.
  - Playwright 1.58.2 vive en `marketing/node_modules`.
