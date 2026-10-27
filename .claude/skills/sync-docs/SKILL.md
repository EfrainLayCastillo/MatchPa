---
name: sync-docs
description: Lleva una decisión de producto o técnica de MatchPa a docs/ y a context.md. Úsalo cuando la conversación cierre una decisión, cambie una regla, o el código se desvíe de la especificación.
---

# Sincronizar documentos

- `docs/` = **qué** (reglas, modelo, API, rutas, despliegue). Público. `README.md` es la portada y su índice.
- `context.md` = **por qué** (decisiones, riesgos, pendientes). Local, en `.gitignore`.

1. Resume la decisión en una línea y ubica el archivo de `docs/` donde vive: `reglas-de-negocio.md`, `modelo-de-datos.md`, `api.md`, `frontend.md`, `tiempo-real.md`, `seguridad.md`, `brandbook.md`, `desarrollo-local.md`, `despliegue.md` o `roadmap.md`.
2. Actualiza esos archivos en todas las secciones afectadas; si cambia el índice o la portada, actualiza también `README.md`. Una regla nueva suele tocar varias: regla → columna en el modelo → endpoint o `action` → evento de push.
3. Busca referencias viejas que la decisión invalida (`grep` del término anterior en `docs/` y `README.md`) y corrígelas.
4. En `context.md` agrega la decisión en Producto o Técnicas con su porqué en una línea; si cierra un pendiente, bórralo de Pendiente; si abre un riesgo, agrégalo en Riesgos.
5. Mantén el estilo: frases cortas, tablas para listas con atributos, sin repetir lo que otra sección ya dice.
6. Informa qué secciones cambiaron.
