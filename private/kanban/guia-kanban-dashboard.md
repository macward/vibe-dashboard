# Guía: Dashboard Kanban para vibeMCP

## Qué es esto

Este documento explica el dashboard kanban que se agrega como UI web para vibeMCP. Es la guía conceptual — el detalle técnico de componentes, hooks, y tipos está en el SDD que acompaña a este archivo.

---

## El problema

vibeMCP es potente pero invisible. Para saber en qué estado está un proyecto, tenés que ejecutar `/status` o `list_tasks()` — no hay forma de verlo de un vistazo. Cuando un agente está ejecutando tasks, no podés ver el progreso en tiempo real. Y si querés mover una task de "pending" a "in-progress" manualmente, tenés que ejecutar un comando.

Un board kanban resuelve esto: columnas con cards que podés ver, arrastrar, y crear. Simple, familiar, directo.

---

## Qué hace

El dashboard es una SPA (single page application) que consume el API REST de vibeMCP. Muestra tasks organizadas en 4 columnas por status:

```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│   Pending   │ In Progress │   Blocked   │    Done     │
│     (3)     │     (1)     │     (1)     │     (7)     │
├─────────────┼─────────────┼─────────────┼─────────────┤
│             │             │             │             │
│ ┌─────────┐ │ ┌─────────┐ │ ┌─────────┐ │ ┌─────────┐ │
│ │ 006     │ │ │ 005     │ │ │ 004     │ │ │ 001     │ │
│ │ Rate    │ │ │ Auth    │ │ │ Deploy  │ │ │ Setup   │ │
│ │ limiting│ │ │ middle  │ │ │ staging │ │ │ project │ │
│ │ ██░░ 2/5│ │ │ ████ 3/5│ │ │ ░░░░ 0/3│ │ │ █████ ✓ │ │
│ └─────────┘ │ └─────────┘ │ └─────────┘ │ └─────────┘ │
│ ┌─────────┐ │             │             │ ┌─────────┐ │
│ │ 007     │ │             │             │ │ 002     │ │
│ │ ...     │ │             │             │ │ ...     │ │
│ └─────────┘ │             │             │ └─────────┘ │
│             │             │             │     ...     │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

**Funcionalidades:**

- **Ver** — Tasks agrupadas por status con indicador de progreso
- **Arrastrar** — Drag & drop para cambiar status (optimistic update)
- **Crear** — Formulario para crear tasks nuevas desde el browser
- **Detalle** — Panel lateral con objetivo, pasos, criterios de aceptación
- **Filtrar** — Por proyecto (selector arriba) y por feature tag
- **Auto-refresh** — Polling configurable al API REST

---

## Cómo se conecta con vibeMCP

El dashboard es un cliente más del API REST. No tiene acceso directo al filesystem ni al protocolo MCP:

```
Dashboard (React)
    ↓ fetch (JSON)
API REST (/api/v1/*)
    ↓ misma lógica
vibeMCP core
```

Esto significa que una task creada por un agente via MCP aparece en el dashboard en el siguiente ciclo de polling, y una task movida en el dashboard se refleja inmediatamente para los agentes.

Solo usa 3 endpoints:

- `GET /api/v1/projects` — cargar la lista de proyectos
- `GET /api/v1/projects/:project/tasks` — listar tasks (con polling)
- `GET /api/v1/projects/:project/tasks/:file` — detalle de una task
- `PATCH /api/v1/projects/:project/tasks/:file` — cambiar status (drag & drop)
- `POST /api/v1/projects/:project/tasks` — crear task nueva

---

## Real-time via polling

El dashboard no usa WebSockets — hace polling al API cada N segundos. El intervalo es configurable desde la UI:

- **5s** — monitoreo activo (mientras un agente trabaja)
- **10s** — default, buen balance
- **30s** — monitoreo pasivo
- **Manual** — sin auto-refresh, botón para refrescar

El polling es inteligente: si la respuesta es igual a la anterior, no re-renderiza. Un indicador en el header muestra si el polling está activo y cuándo fue el último refresh.

---

## El drag & drop

Arrastrar una task de una columna a otra cambia su status. El flujo es:

1. Agarrás la card → se levanta con sombra
2. La llevás a otra columna → la columna se resalta
3. Soltás → la card se mueve inmediatamente (optimistic update)
4. En background, `PATCH` al API con el nuevo status
5. Si falla → la card vuelve a su columna original + notificación de error

La actualización optimista hace que se sienta instantáneo. El usuario no espera al servidor para ver el cambio.

---

## Detalle de task

Click en una card abre un panel lateral (slide-in desde la derecha) con toda la información de la task:

- **Título y metadata** — número, status badge, feature tag, owner
- **Objetivo** — sección Objective de la task
- **Pasos** — checkboxes (read-only) mostrando progreso
- **Criterios de aceptación** — checkboxes (read-only)
- **Notas** — sección Notes si existe

El panel parsea el markdown de la task para mostrar cada sección de forma estructurada. No es un markdown renderer genérico — entiende el formato específico de tasks de vibeMCP.

---

## Crear tasks

El botón "Nueva Task" abre un dialog con:

- **Título** (requerido)
- **Objetivo** (requerido)
- **Feature** (opcional, muestra las existentes + campo libre)
- **Pasos** (opcional, se pueden agregar/remover dinámicamente)

Al crear, la task aparece en la columna Pending con status `pending` y número auto-asignado por el API.

---

## Tech stack

| Pieza | Elección | Por qué |
|-------|---------|---------|
| React + Vite | Framework + build | SPA rápido, sin SSR innecesario |
| shadcn/ui | Componentes | Cards, dialogs, selects, badges — todo lo que necesita el kanban |
| @dnd-kit | Drag & drop | La mejor lib de DnD para React, accesible y performante |
| Tailwind CSS | Estilos | Viene con shadcn, utility-first |

Sin estado global (no Redux/Zustand) — el estado vive en hooks de React. Sin router — es una sola página.

---

## Hosting

El dashboard compila a archivos estáticos (`dist/`). Se puede servir desde cualquier lado:

- **vibeMCP** — como static files en el mismo servidor
- **Vercel/Netlify** — deploy estático
- **Nginx/Caddy** — junto al reverse proxy
- **Local** — `npm run dev` durante desarrollo

La URL del API se configura via variable de entorno (`VITE_API_BASE_URL`). Si se sirve desde el mismo dominio que vibeMCP, no necesita configuración extra (usa `window.location.origin`).

---

## Decisiones de diseño

### ¿Por qué 4 columnas y no 3?

Blocked es un status real en vibeMCP con significado propio: la task no puede avanzar por una dependencia o impedimento. Meterlo como badge dentro de Pending esconde información importante — un board con cosas bloqueadas necesita hacer eso visible.

### ¿Por qué panel lateral y no modal para el detalle?

El panel lateral mantiene el board visible. Podés ver el detalle de una task sin perder el contexto de las demás columnas. Un modal tapa todo. Además, el patrón de panel lateral es el estándar en herramientas de project management (Linear, Jira, Notion boards).

### ¿Por qué polling y no WebSockets?

Simplicidad. El API REST ya existe, polling es agregar un `setInterval`. WebSockets requieren un protocolo adicional, manejo de reconexión, y estado de conexión. Para un dashboard personal o de equipo chico, polling cada 10s es indistinguible de real-time. Si en el futuro el latency importa, se puede agregar SSE/WebSocket sin cambiar la UI.

### ¿Por qué React y no Svelte?

Para este caso específico: @dnd-kit es la mejor lib de drag & drop disponible y es React-only. shadcn/ui está mucho más maduro en React que en Svelte. El ecosistema React tiene más opciones probadas para este tipo de UI interactiva. Svelte hubiera funcionado, pero con más fricción en los componentes clave.

### ¿Por qué no editar el contenido de tasks desde el dashboard?

YAGNI. El contenido de las tasks (pasos, objetivo, notas) lo escribe y gestiona el agente AI via MCP. El dashboard es para **visualizar y organizar**, no para reemplazar al editor. Si en el futuro se necesita edición, se agrega un markdown editor al panel lateral.

---

## Orden de implementación

1. **Setup** — Vite + React + Tailwind + shadcn/ui
2. **API client** — fetch wrapper, types, hook de polling
3. **Board read-only** — Columnas + cards sin interacción
4. **Header** — Selector de proyecto + filtro de feature
5. **Drag & drop** — @dnd-kit + optimistic updates
6. **Panel detalle** — Slide-in + parser de contenido
7. **Crear task** — Dialog + formulario
8. **Polling control** — Selector de intervalo + indicador
9. **Responsive** — Layout adaptivo para tablet/mobile
