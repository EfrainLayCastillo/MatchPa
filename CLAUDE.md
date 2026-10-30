# MatchPa

Plataforma de pádel para completar partidos. Monorepo: `backend/` (AdonisJS 7), `frontend/` (Next.js) y `marketing/` (videos para Instagram con HyperFrames). Cada carpeta tiene su propio `CLAUDE.md`.

## Fuentes de verdad

- `docs/`: qué se construye. `reglas-de-negocio.md`, `modelo-de-datos.md` y `api.md` son la especificación; `README.md` es la portada con el índice.
- `context.md` (local, en `.gitignore`): por qué se decidió así. Léelo antes de proponer cambios de producto.
- Si el código necesita desviarse de la especificación, actualiza primero la doc correspondiente en `docs/` con la skill `sync-docs`; no dejes que diverjan.

## Idioma

- Inglés: código, BD, endpoints de la API, nombres de estados, commits.
- Español: UI, URLs del frontend (`/partidos`, `/perfil`), `README.md`, `docs/` y `context.md`.

## Flujo por historia

Partir el ítem del Roadmap con `/slice`. Su `slices.md` va al scratchpad de la sesión, nunca al repo: es un artefacto temporal y se descarta al aplicarlo. Luego, según el tamaño:

- **Historia chica** (un solo paquete, ~5 archivos o menos, sin reglas de negocio nuevas): implementar en la sesión principal → `/code-review` → commit. Sin `/rpi` ni agentes.
- **Historia grande** (backend y frontend, o reglas/modelo/endpoints nuevos):
  1. Planear con `/rpi`.
  2. Implementar con los agentes `backend` y/o `frontend`.
  3. Revisar con el agente `rules-reviewer` y `/code-review`.
  4. `sync-docs` y commit.

## Convenciones

- Al cerrar cada implementación, propone el mensaje de commit de lo aplicado (uno por cambio lógico, con sus archivos) sin commitear, salvo que se pida.
- Commits en inglés con Conventional Commits (`feat(matches): ...`). Las skills globales `/commit` (Jira `COL-`) y `/create-pr` (Bitbucket) no aplican: el repo está en GitHub, usa `git` y `gh`.
- Hora: timestamps en UTC; las reglas por día se evalúan en `America/Panama`.
- `backend/` y `frontend/` ya contienen un `CLAUDE.md`: al generar el proyecto con `create-adonisjs` o `create-next-app`, hazlo en una carpeta temporal y mueve el resultado, porque esos CLIs rechazan carpetas con archivos.
- Diagramas con la skill `archify`; el de arquitectura vive en `docs/arquitectura.html`.

## Ahorro de tokens

- Cambia archivos con `Edit`, solo el fragmento que cambia. Reescribir un archivo completo con `Write` solo si es nuevo.
- Después de cambiar, corre el check mínimo del paquete tocado y reporta solo el resultado: pasa o falla, y las líneas de error relevantes. No pegues la salida completa.
- En comandos con salida larga, limita la salida (`| tail -n 20`, `-q`, `--silent`).
- No vuelvas a imprimir archivos o diffs que acabas de escribir.
- No agregues comentarios que repitan el código, ni tests que no cubran una regla de `docs/reglas-de-negocio.md`.
- No corras navegador, capturas ni E2E: el usuario los ejecuta. Tampoco `next build` completo salvo para cerrar una entrega.
