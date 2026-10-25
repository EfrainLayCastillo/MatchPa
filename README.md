# MatchPa 🎾

> **Match** de búsqueda para jugadores + **Pa** de Panamá y del "ey Pa" de barrio.

Plataforma social de pádel para encontrar jugadores, completar partidos de 4 y organizar torneos. Pensada para crecer a más deportes.

🌐 **matchpa.net**

---

## ¿Qué es MatchPa?

Entras al lobby, te postulas como **disponible** y el resto de jugadores te ve en el pool. Si estás buscando partido, exploras la lista de jugadores disponibles y con un click les envías una invitación. Al completarse los 4 cupos: **¡Match!**

Más adelante: lobby 3D con avatares estilo Mii, torneos (eliminación directa, liguilla, Americano/Mexicano con rotación de parejas) y análisis de video de partidos.

---

## El problema

Los clubes que tienen las canchas de pádel organizan grupos de WhatsApp para sus jugadores. En todos se repite lo mismo:

> "¿Quién disponible para las 6pm? Buscamos pala de 4ta categoría"
>
> "Partido mixto — Sacha, Efrain, Esteban. Buscamos una pala disponible"

- Los partidos son casi siempre de **4 jugadores** (2 vs 2).
- La duración base es de **1h30 o 2h**.
- La cancha ya se reservó por WhatsApp: se sabe el **club, el # de cancha y la hora**.
- Siempre falta alguien: el mensaje se pierde entre el chat, nadie sabe quién está libre y se repite la pregunta todos los días.

## La solución (MVP)

Un **pool de jugadores** que están disponibles o buscando partido, en vez de preguntar al aire en el grupo:

1. **Jugadores disponibles:** me postulo con mi categoría, horario y club, y quedo visible en el pool.
2. **Partidos buscando pala:** el que ya tiene cancha publica el partido (hora, duración, club, # de cancha, categoría, tipo masculino/femenino/mixto) con los cupos que le faltan.
3. **Match:** el organizador invita a jugadores del pool ("Ey Pa, ¿juegas?") o un jugador pide unirse a un partido abierto y **el organizador lo aprueba**. Al llenarse los 4 cupos: **¡Match!**
4. **Cierre:** el organizador puede cerrar la búsqueda en cualquier momento (por ejemplo, si completó el equipo por fuera de la plataforma). Si nadie la cierra, se cierra sola al llegar la hora de la reserva.

---

## Estructura del repositorio

Un solo folder con frontend y backend:

```
matchpa/
├── frontend/   # Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
├── backend/    # AdonisJS 7 (API)
└── README.md
```

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion |
| 3D (fase 2) | React Three Fiber + drei |
| Backend | AdonisJS 7 (última versión), Lucid ORM |
| Base de datos | PostgreSQL |
| Tiempo real | AdonisJS Transmit (SSE) para estados e invitaciones |

---

## Rutas del frontend

| Ruta | Descripción |
|---|---|
| `/` | Home sencillo: qué es MatchPa y botón de entrar al lobby |
| `/lobby` | Pool de jugadores. Postúlate como disponible o busca jugadores y envía invitaciones |

### `/lobby`

- **Estoy disponible:** el usuario se postula (categoría, horario, club) y aparece en el pool.
- **Buscar jugadores:** lista del pool con filtros (categoría, club, horario).
- **Partidos buscando pala:** lista de partidos con cancha reservada y cupos libres. Un jugador puede pedir unirse; el organizador aprueba o rechaza la solicitud.
- **Invitar:** al hacer click en un jugador se abre su perfil con el botón **"Ey Pa, ¿juegas?"** para sumarlo a tu partido.
- **Invitaciones:** el jugador invitado acepta o rechaza.
- **Cerrar búsqueda:** el organizador cierra el partido manualmente si ya completó el equipo por fuera.

### Estados de un partido

| Estado | Cuándo |
|---|---|
| `abierto` | Publicado con cupos libres. Aparece en el pool |
| `completo` | Se llenaron los 4 cupos dentro de MatchPa |
| `cerrado` | El organizador cerró la búsqueda manualmente |
| `expirado` | Llegó la hora de la reserva sin completarse ni cerrarse |

Solo los partidos `abierto` aparecen en el pool. `expirado` no necesita un cron: se calcula al consultar (`starts_at <= now`).

Las solicitudes para unirse y las invitaciones tienen estado `pendiente`, `aceptada` o `rechazada`. Si el partido sale de `abierto`, las pendientes se cancelan.

### Modelo de un partido

| Campo | Ejemplo |
|---|---|
| Fecha y hora | Hoy, 6:00pm |
| Duración | 1h30 o 2h |
| Club y # de cancha | Club X, cancha 3 |
| Categoría | 4ta |
| Tipo | Masculino, femenino o mixto |
| Jugadores | 3 de 4 confirmados |

## API del backend (MVP)

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/lobby/availability` | Postularse como disponible |
| `DELETE` | `/api/lobby/availability` | Salir del pool |
| `GET` | `/api/lobby/players` | Listar jugadores disponibles (con filtros) |
| `POST` | `/api/matches` | Publicar un partido buscando pala |
| `GET` | `/api/matches` | Listar partidos con cupos libres (con filtros) |
| `POST` | `/api/matches/:id/join-requests` | Pedir unirse a un partido |
| `PATCH` | `/api/matches/:id/join-requests/:requestId` | Organizador aprueba o rechaza la solicitud |
| `PATCH` | `/api/matches/:id/close` | Organizador cierra la búsqueda |
| `POST` | `/api/invitations` | Invitar a un jugador del pool a tu partido |
| `PATCH` | `/api/invitations/:id` | Aceptar o rechazar una invitación |

---

## Brandbook

Estilo deportivo, urbano y de alto contraste: verde lima neón sobre verde azulado profundo, tipografía bold enorme y acentos manuscritos. Fotografía en blanco y negro con grano.

> Los colores son aproximados a partir del brandbook de referencia. Ajustar con el valor exacto al definir los tokens.

### Colores

| Nombre | Hex (aprox.) | Uso |
|---|---|---|
| Lima MatchPa | `#C8F526` | Color principal, botones, fondos de impacto |
| Verde azulado | `#0B4A55` | Fondos oscuros, texto sobre lima |
| Marfil | `#F7F6F0` | Fondo claro |
| Carbón | `#1A1A1A` | Texto y fotografía en B/N |

Estados del jugador: **disponible** (lima), **buscando** (blanco con borde verde azulado), **en partido** (gris).

### Tipografía

- **Títulos y logo:** grotesca bold de gran tamaño, en mayúsculas o mixtas (ej. Bricolage Grotesque o Archivo).
- **Acentos:** script manuscrito para etiquetas como *Pa*, *Match*, *Ey Pa* (ej. Yellowtail).
- **Texto:** sans limpia y legible (ej. Inter).

### Logo

**Match** en bold + **Pa** en script, como acento sobre el nombre.

### Elementos gráficos

- Estrella de 4 puntas en línea o rellena
- Globo en alambre (guiño a Panamá)
- Carita sonriente en línea
- Trazos curvos que simulan el recorrido de la pelota
- Fotografía en B/N con grano

### Tono de voz

Casual, cercano y panameño. Ejemplos:

- Botón de invitar: **"Ey Pa, ¿juegas?"**
- Buscando: **"Buscando Pa's..."**
- Partido completo: **"¡Match! Ya están los 4"**

---

## Desarrollo local

```bash
# Backend
cd backend
npm init adonisjs@latest .   # o instalar dependencias si ya existe
node ace serve --watch

# Frontend
cd frontend
npm install
npm run dev
```

## Roadmap

- [ ] Home y `/lobby` con pool de jugadores, partidos buscando pala e invitaciones
- [ ] Autenticación y perfiles con categoría
- [ ] Torneos: eliminación directa, liguilla, Americano/Mexicano
- [ ] Lobby 3D con avatares estilo Mii
- [ ] Subida de video y análisis con IA
- [ ] Más deportes: tenis, fútbol 5, básquet

## Estado

🚧 En desarrollo temprano.
