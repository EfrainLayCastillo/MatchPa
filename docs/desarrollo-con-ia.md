# Desarrollo con IA (Claude Code)

Diagrama interactivo de la arquitectura: [`arquitectura.html`](arquitectura.html), generado con [archify](https://github.com/tt-a1i/archify).

## Fuentes de verdad

| Archivo | Responde |
|---|---|
| `docs/` | Qué se construye: reglas, modelo, API, rutas, despliegue |
| `context.md` (local) | Por qué se decidió así |
| `CLAUDE.md`, `backend/CLAUDE.md`, `frontend/CLAUDE.md` | Cómo se escribe el código en cada parte |

## Estructura

```
CLAUDE.md                  # idioma, flujo de trabajo, docs que se actualizan
backend/CLAUDE.md          # convenciones AdonisJS, Lucid, VineJS, Japa
frontend/CLAUDE.md         # mobile first, brandbook, shadcn/ui
.claude/agents/            # especialistas
.claude/skills/            # flujos propios del proyecto
```

## Agentes

Pocos y por responsabilidad, con herramientas limitadas:

| Agente | Hace | Herramientas |
|---|---|---|
| `backend` | Migraciones, modelos, validators, controllers, tests Japa | Lectura, escritura, shell |
| `frontend` | Pantallas mobile first con shadcn/ui y el brandbook | Lectura, escritura, shell |
| `rules-reviewer` | Revisa el código contra las reglas de negocio de `docs/reglas-de-negocio.md` | Solo lectura |

## Skills del proyecto

| Skill | Hace |
|---|---|
| `new-endpoint` | Validator + controller + ruta + test + fila en la tabla de `docs/api.md` |
| `sync-docs` | Lleva una decisión nueva a `docs/` y a `context.md` |

## Skills externas

Incluidas en `.claude/skills/` (copiadas de su repo de origen):

| Skill | Para | Origen | Requiere |
|---|---|---|---|
| `shadcn` | Componentes y CLI de shadcn/ui según `components.json` | `shadcn-ui/ui` | — |
| `next-dev-loop` | Verificar cambios en el dev server de Next.js | `vercel/next.js` | `next dev` corriendo, `agent-browser` |
| `react-best-practices` | Rendimiento de React/Next.js | `vercel-labs/agent-skills` | — |
| `web-design-guidelines` | Revisión de UI y accesibilidad | `vercel-labs/agent-skills` | Internet (descarga las reglas al usarse) |
| `frontend-design` | Dirección visual de la UI | `anthropics/skills` | — |
| `webapp-testing` | Pruebas en navegador con Playwright | `anthropics/skills` | Python + Playwright |

Global (no se versiona): `archify` para diagramas, `npx skills add tt-a1i/archify -g`.

Para actualizar una skill, vuelve a copiar su carpeta desde el repo de origen. No hay skill pública de AdonisJS; las convenciones van en `backend/CLAUDE.md` y en `new-endpoint`.

## Harness

Checks deterministas en `.claude/settings.json`, que no dependen de que el modelo siga instrucciones:

| Pieza | Qué hace |
|---|---|
| `hooks/post-edit-lint.sh` | ESLint del archivo editado; los errores vuelven a Claude |
| `hooks/stop-verify.sh` | Typecheck, lint y tests del paquete con cambios; si fallan, Claude no termina |
| Permisos | Bloquea force push, `reset --hard`, `rm -rf` y leer/editar `.env` |

Ambos hooks no hacen nada hasta que `backend/` y `frontend/` tengan `package.json` y dependencias instaladas. Con el código se suman la suite de reglas de negocio, el chequeo de la tabla de API, E2E a 375px y CI en GitHub Actions.

## Flujo por historia

1. Tomar un ítem de [roadmap.md](roadmap.md) y partirlo con `/slice`.
2. Planear con `/rpi`.
3. Implementar con `backend` y/o `frontend`.
4. Revisar con `rules-reviewer` y `/code-review`.
5. `sync-docs` y commit.
