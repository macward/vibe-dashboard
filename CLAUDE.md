# vibe-dashboard

Dashboard kanban web que consume el API REST de vibeMCP. Muestra tasks organizadas por status, permite drag & drop para cambiar status, y crear tasks nuevas.

branch: main
vibe: vibe-dashboard

## Stack

- React 18 + TypeScript
- Vite (build tool)
- shadcn/ui (componentes)
- @dnd-kit (drag & drop)
- Tailwind CSS (estilos)

## Estructura del proyecto

```
src/
├── main.tsx                    # Entry point
├── App.tsx                     # Root: estado global, DndContext, layout
├── api/
│   ├── client.ts               # Fetch wrapper con auth y base URL
│   ├── projects.ts             # GET /projects
│   ├── tasks.ts                # CRUD /tasks
│   └── types.ts                # Tipos compartidos (Task, Project, TaskStatus)
├── components/
│   ├── header/
│   │   ├── Header.tsx          # Barra superior
│   │   ├── ProjectSelector.tsx # Dropdown de proyectos
│   │   ├── FeatureFilter.tsx   # Filtro por feature tag
│   │   └── PollingControl.tsx  # Intervalo + indicador
│   ├── board/
│   │   ├── KanbanBoard.tsx     # Contenedor de columnas + DndContext
│   │   ├── KanbanColumn.tsx    # Columna droppable (status)
│   │   └── TaskCard.tsx        # Card draggable (task individual)
│   ├── detail/
│   │   └── TaskDetailPanel.tsx # Panel lateral slide-in
│   └── create/
│       └── CreateTaskDialog.tsx # Modal de creación
├── hooks/
│   ├── useTasks.ts             # Fetch + polling + cache
│   ├── useProjects.ts          # Fetch lista de proyectos
│   └── useDragAndDrop.ts       # Setup @dnd-kit
├── lib/
│   ├── utils.ts                # cn(), formatDate(), etc.
│   └── parseTask.ts            # Parser de markdown → secciones
└── styles/
    └── globals.css             # Tailwind base
```

## API que consume

El dashboard habla con vibeMCP via REST (`/api/v1/`). Solo usa estos endpoints:

| Método | Endpoint | Uso |
|--------|----------|-----|
| GET | `/api/v1/projects` | Cargar selector de proyectos |
| GET | `/api/v1/projects/:project/tasks` | Listar tasks (polling) |
| GET | `/api/v1/projects/:project/tasks/:file` | Detalle de task |
| PATCH | `/api/v1/projects/:project/tasks/:file` | Cambiar status (drag & drop) |
| POST | `/api/v1/projects/:project/tasks` | Crear task nueva |

Auth: `Authorization: Bearer <VIBE_AUTH_TOKEN>`

## Configuración

Variables de entorno (en `.env`):

```bash
VITE_API_BASE_URL=http://localhost:8288   # URL del vibeMCP server
VITE_API_TOKEN=                            # Bearer token (opcional si API sin auth)
VITE_POLLING_INTERVAL=10000                # Polling en ms (default: 10s)
```

## Columnas del kanban

4 columnas fijas mapeadas a los status de vibeMCP:

| Columna | Status | Color accent |
|---------|--------|-------------|
| Pending | `pending` | slate/gray |
| In Progress | `in-progress` | blue |
| Blocked | `blocked` | red |
| Done | `done` | green |

## Patrones clave

### Optimistic updates (drag & drop)

Al soltar una card en otra columna:
1. Actualizar estado local inmediatamente
2. PATCH al API en background
3. Si falla → revert + toast de error

### Polling inteligente

El hook `useTasks` hace fetch periódico. Solo re-renderiza si el response cambió respecto al anterior. El intervalo es configurable desde la UI (5s, 10s, 30s, manual).

### Parsing de tasks

`parseTask.ts` extrae secciones del markdown de una task (Objective, Steps, Acceptance Criteria, Notes) para mostrar en el panel de detalle. No es un markdown renderer genérico — entiende el formato específico de tasks de vibeMCP.

### Content negotiation

El API client siempre pide JSON (`Accept: application/json`). El dashboard no usa la respuesta markdown.

## Convenciones de código

- Componentes: PascalCase, un archivo por componente
- Hooks: camelCase con prefijo `use`
- Types: en `api/types.ts`, no duplicar definiciones
- Estilos: Tailwind utilities, no CSS custom salvo globals
- Estado: React hooks + context, no store externo
- Imports de shadcn: `@/components/ui/...`

## Comandos

```bash
npm run dev          # Dev server con HMR
npm run build        # Build producción → dist/
npm run preview      # Preview del build
npm run lint         # ESLint
npm run type-check   # TypeScript sin emit
```

## Decisiones técnicas

- **Sin router** — es una sola página, no necesita react-router
- **Sin store global** — estado en hooks, no Redux/Zustand
- **Sin SSR** — SPA puro, Vite sin Next.js
- **@dnd-kit sobre react-beautiful-dnd** — mejor mantenido, más flexible, accesible
- **Fetch nativo sobre axios** — no justifica dependencia extra para requests simples
- **shadcn/ui copiado, no importado** — los componentes viven en `src/components/ui/`, se customiza directo
