---
name: commit-plan
description: Propone, sin commitear, un solo mensaje de commit muy corto que resume todos los cambios sin commitear de MatchPa. Úsalo cuando se acumularon varios features o el usuario pide "qué commiteo", "resume el commit" o /commit-plan.
---

# Commit resumido

Solo propone. No hace `git add` ni `git commit` salvo que el usuario lo pida después.

1. `git status --short` y `git diff --stat`. Abre un diff (`| head -n 60`) solo si el nombre del archivo no basta.
2. Deja fuera lo que no es de la sesión o es dudoso (p. ej. `marketing/` sin relación).
3. Escribe un solo commit en inglés, Conventional Commits: título ≤ 72 caracteres con el cambio principal, y un cuerpo de viñetas de pocas palabras, una por cambio lógico.

## Salida

Solo esto, sin introducción ni cierre:

```
feat(notifications): add inbox with lobby bell

- inbox API and migrations
- bell and /notificaciones page
- reusable back link
- share landscape ticket image
- docs
```
Fuera: marketing/guiones/x.md
