---
name: sync-docs
description: Lleva una decisión de producto o técnica de MatchPa a docs/ y a context.md. Úsalo cuando la conversación cierre una decisión, cambie una regla, o el código se desvíe de la especificación.
---

# Sincronizar documentos

- `docs/` = **qué**. Público. `README.md` es la portada y su índice. Dos niveles por propósito, no por paquete:

| Carpeta | Archivos | Va aquí |
|---|---|---|
| `docs/producto/` | `reglas-de-negocio.md`, `modelo-de-datos.md`, `api.md`, `tiempo-real.md`, `seguridad.md`, `roadmap.md` | La especificación, el contrato entre backend y frontend. Lo vigila `rules-reviewer` |
| `docs/ingenieria/` | `arquitectura.html`, `frontend.md`, `analitica.md`, `desarrollo-local.md`, `despliegue.md`, `desarrollo-con-ia.md` | Cómo se construye y opera: rutas, eventos de GTM, entorno, infraestructura, flujo con IA |
| `docs/marca/` | `brandbook.md`, `capturas/` | Identidad compartida por frontend y marketing |

- `context.md` = **por qué** (decisiones, riesgos, pendientes). Local, en `.gitignore`.
- Fuera de `docs/`: lo propio de un paquete va en su `CLAUDE.md`, y el método de marketing en `marketing/`.

1. Resume la decisión en una línea y ubica, con la tabla, la carpeta y el archivo donde vive. No crees un tercer nivel ni una carpeta por paquete. Un archivo nuevo va en la carpeta cuyo propósito le corresponde, y entra al índice del `README.md`.
2. Actualiza esos archivos en todas las secciones afectadas. Una regla nueva suele tocar varios archivos de `producto/`: regla → columna en el modelo → endpoint o `action` → evento de push o Transmit. Revisa también si afecta a `ingenieria/frontend.md` (rutas) o a `ingenieria/analitica.md` (eventos).
3. Enlaces: dentro de `docs/`, relativos (`../producto/reglas-de-negocio.md#sección` entre carpetas). Fuera de `docs/`, con ruta completa desde la raíz (`docs/producto/api.md`).
4. Busca referencias viejas que la decisión invalida (`grep` del término anterior en `docs/`, `README.md`, los `CLAUDE.md` y `.claude/`) y corrígelas. Si moviste o renombraste un archivo, corrige todas sus rutas.
5. En `context.md` agrega la decisión en Producto o Técnicas con su porqué en una línea. Si cierra un pendiente, bórralo de Pendiente; si abre un riesgo, agrégalo en Riesgos.
6. Mantén el estilo: frases cortas, tablas para listas con atributos, sin repetir lo que otra sección ya dice.
7. Informa qué archivos y secciones cambiaron.
