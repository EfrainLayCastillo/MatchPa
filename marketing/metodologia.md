# Metodología de contenido

## Pilares

| Pilar | Qué cuenta | Ejemplo |
|---|---|---|
| Problema | El dolor de completar un partido | "Faltan 2 y nadie contesta el grupo" |
| Producto | Cómo resuelve MatchPa, con la app real en pantalla | Publicar un partido en 10 s |
| Comunidad | Jugadores, clubs y partidos reales | "¡Match! Ya están los 4" |
| Pádel | Tips, humor y cultura del pádel en Panamá | Tipos de jugador en la cancha |

Reparto sugerido: 40 % producto, 30 % pádel, 20 % comunidad y 10 % problema. Lo ajustamos con las métricas.

## Formatos

- **Talking head:** tú hablando a cámara, con subtítulos y motion graphics encima. Skill: `talking-head-recut`.
- **Demo de producto:** capturas de la app dentro de un mockup de teléfono, con zoom a cada acción. Skills: `motion-graphics` y `product-launch-video`.
- **Explainer sin cara:** texto cinético con gráficos de la marca. Skill: `faceless-explainer`.
- **Carrusel:** de 5 a 7 slides en 1080×1350. Skill: `slideshow`.

## Flujo por pieza

1. **Idea:** pilar, formato y objetivo (alcance, seguidores o registros).
2. **Guion y storyboard:** copia `guiones/_plantilla.md`. Escribe gancho, desarrollo y CTA, con una fila por escena.
3. **Grabación:**
   - **App:** declara las tomas en `videos/<slug>/tomas.mjs` y grábalas con `node scripts/grabar.mjs <slug>` (modo mock). Ver "Grabaciones de la app" en `CLAUDE.md`.
   - **Cámara (talking head, cancha):** vertical, 1080p o 4K, a 30 fps y con luz de frente. Guarda las tomas en `grabaciones/<slug>/`.
4. **Composición:** copia `videos/_plantilla-reel` a `videos/<slug>/` y pídele a Claude la pieza con `/hyperframes`, pasándole el guion.
5. **Revisión:** `npm run check` y snapshots de los frames clave. Ajusta el ritmo con la música (`hyperframes beats`).
6. **Exportación y publicación:** `npx hyperframes open .` deja el proyecto en la app de HyperFrames y desde ahí se exporta el MP4. No se renderiza desde la terminal. Publica y anota la fecha en el guion.
7. **Métricas a los 7 días:** alcance, retención a 3 s, guardados y visitas al perfil. Anótalas en el guion. Las piezas que funcionan se convierten en plantilla.

## Storytelling

Cada pieza sigue la estructura **gancho → tensión → giro → CTA**:

- **Gancho (0–2 s):** una frase o imagen que detenga el scroll.
- **Tensión:** el problema que reconoce el jugador.
- **Giro:** MatchPa lo resuelve, y se muestra en la app.
- **CTA:** una sola acción: "Link en la bio", "Guárdalo" o "Etiqueta a tu cuarto jugador".
