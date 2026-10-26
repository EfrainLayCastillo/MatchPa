# MatchPa

Plataforma de pádel para completar partidos. Monorepo: `backend/` (AdonisJS 7) y `frontend/` (Next.js). Cada carpeta tiene su propio `CLAUDE.md`.

## Fuentes de verdad

- `README.md`: qué se construye. Las secciones **Reglas de negocio**, **Modelo de datos** y **API** son la especificación.
- `context.md` (local, en `.gitignore`): por qué se decidió así. Léelo antes de proponer cambios de producto.
- Si el código necesita desviarse de la especificación, actualiza primero el README con la skill `sync-docs`; no dejes que diverjan.

## Idioma

- Inglés: código, BD, endpoints de la API, nombres de estados, commits.
- Español: UI, URLs del frontend (`/partidos`, `/perfil`), README y `context.md`.

## Flujo por historia

1. Partir el ítem del Roadmap con `/slice`.
2. Planear con `/rpi`.
3. Implementar con los agentes `backend` y/o `frontend`.
4. Revisar con el agente `rules-reviewer` y `/code-review`.
5. `sync-docs` y commit.

No lances agentes para tareas pequeñas que se resuelven en la sesión principal.

## Convenciones

- Commits en inglés con Conventional Commits (`feat(matches): ...`). Las skills globales `/commit` (Jira `COL-`) y `/create-pr` (Bitbucket) no aplican: el repo está en GitHub, usa `git` y `gh`.
- Hora: timestamps en UTC; las reglas por día se evalúan en `America/Panama`.
- `backend/` y `frontend/` ya contienen un `CLAUDE.md`: al generar el proyecto con `create-adonisjs` o `create-next-app`, hazlo en una carpeta temporal y mueve el resultado, porque esos CLIs rechazan carpetas con archivos.
- Diagramas con la skill `archify`; el de arquitectura vive en `docs/arquitectura.html`.
