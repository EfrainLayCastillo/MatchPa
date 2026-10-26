---
name: sync-docs
description: Lleva una decisión de producto o técnica de MatchPa al README.md y a context.md. Úsalo cuando la conversación cierre una decisión, cambie una regla, o el código se desvíe de la especificación.
---

# Sincronizar documentos

- `README.md` = **qué** (reglas, modelo, API, rutas). Público.
- `context.md` = **por qué** (decisiones, riesgos, pendientes). Local, en `.gitignore`.

1. Resume la decisión en una línea y ubica dónde vive en el README: Reglas de negocio, Modelo de datos, Rutas, API, Tiempo real, Desarrollo local o Roadmap.
2. Actualiza el README en todas las secciones afectadas. Una regla nueva suele tocar varias: regla → columna en el modelo → endpoint o `action` → evento de push.
3. Busca referencias viejas que la decisión invalida (`grep` del término anterior) y corrígelas.
4. En `context.md` agrega la decisión en Producto o Técnicas con su porqué en una línea; si cierra un pendiente, bórralo de Pendiente; si abre un riesgo, agrégalo en Riesgos.
5. Mantén el estilo: frases cortas, tablas para listas con atributos, sin repetir lo que otra sección ya dice.
6. Informa qué secciones cambiaron.
