# SDD: Dashboard Kanban para vibeMCP

## Metadata

| Campo | Valor |
|-------|-------|
| Documento | Software Design Document |
| Feature | Dashboard Kanban |
| Versión | 1.0 |
| Fecha | 2025-02-19 |
| Status | Approved |
| Autor | Diseño colaborativo Max + Claude |
| Dependencia | API REST (ver sdd-api-rest.md) |

---

## 1. Overview

### 1.1 Problema

vibeMCP opera exclusivamente via CLI y protocolo MCP. No hay forma visual de ver el estado de un proyecto — para saber qué tasks están pendientes, en progreso, o bloqueadas, hay que ejecutar comandos. Falta una vista rápida que muestre el panorama completo de un vistazo.

### 1.2 Solución

Un dashboard web estilo kanban que consume el API REST de vibeMCP. Muestra tasks organizadas por status en columnas, permite cambiar status via drag & drop, crear tasks nuevas, y ver el detalle de cada task. Se actualiza automáticamente via polling.

### 1.3 Relación con el API REST

Este dashboard es el **primer consumidor** del API REST definido en `sdd-api-rest.md`. Solo usa endpoints REST — no toca el protocolo MCP ni el filesystem directamente.

```
Dashboard (React SPA)
    ↓ HTTP/JSON
API REST (/api/v1/*)
    ↓
vibeMCP core (indexer, SQLite, filesystem)
    ↑
MCP Protocol (/mcp/*)
    ↑
Agentes AI (Claude Code, Cursor, etc.)
```

### 1.4 Scope

**Incluido:**
- Board kanban con 4 columnas (Pending, In Progress, Blocked, Done)
- Selector de proyecto
- Filtro por feature tag
- Drag & drop para cambiar status
- Panel lateral con detalle de task
- Formulario para crear tasks
- Polling configurable para actualización automática

**Excluido:**
- Gestión de documentos (plans, sessions, references) — solo tasks
- Búsqueda full-text (se puede agregar después)
- Edición de contenido de tasks (solo cambio de status y creación)
- Autenticación con UI de login (usa token configurado)
- Notificaciones push / WebSockets

---

## 2. Decisiones de diseño

### 2.1 Tech stack

| Componente | Elección | Razón |
|-----------|----------|-------|
| Framework | React 18+ | Ecosistema maduro, mejor soporte de drag & drop |
| Build tool | Vite | Rápido, zero-config para SPAs |
| Componentes UI | shadcn/ui | Componentes pulidos, customizables, no es dependencia runtime |
| Drag & drop | @dnd-kit | La mejor lib de DnD para React, accesible, performante |
| Estilos | Tailwind CSS | Incluido con shadcn/ui |
| HTTP | fetch nativo | No justifica axios para polling simple |
| Estado | React state + context | No justifica Redux/Zustand para un solo board |

### 2.2 Hosting agnóstico

El dashboard es un build estático (`dist/` con HTML + JS + CSS). Se puede servir desde:

- **vibeMCP mismo** — montar `/dashboard` como static files en Starlette
- **Cualquier CDN/hosting** — Vercel, Netlify, Cloudflare Pages, Nginx
- **Local dev** — `npm run dev` con proxy al API

El build no asume dónde corre. La URL del API se configura via variable de entorno.

### 2.3 Autenticación simplificada

No hay UI de login. El token se configura de una de estas formas:

1. **Variable de entorno** — `VITE_API_TOKEN` en el build
2. **Prompt al cargar** — si no hay token configurado, pide ingresarlo y lo guarda en memoria (no localStorage por seguridad)
3. **Sin token** — si el API no requiere auth, el dashboard funciona sin token

### 2.4 Real-time via polling

Polling configurable al endpoint `GET /api/v1/projects/:project/tasks`:

| Intervalo | Caso de uso |
|-----------|-------------|
| 5s | Mientras un agente está ejecutando tasks activamente |
| 30s | Monitoreo pasivo |
| Manual | Botón de refresh, sin auto-polling |

Default: 10 segundos. Configurable desde la UI con un control simple.

El polling es inteligente: compara el response con el estado local y solo re-renderiza si hubo cambios (comparación por hash o timestamp de `updated`).

---

## 3. Arquitectura del frontend

### 3.1 Estructura de componentes

```
App
├── Header
│   ├── ProjectSelector        ← GET /api/v1/projects
│   ├── FeatureFilter          ← extraído de las tasks
│   ├── PollingControl         ← intervalo + pause/resume
│   └── NewTaskButton          → abre CreateTaskDialog
│
├── KanbanBoard
│   ├── KanbanColumn (Pending)
│   │   └── TaskCard[]
│   ├── KanbanColumn (In Progress)
│   │   └── TaskCard[]
│   ├── KanbanColumn (Blocked)
│   │   └── TaskCard[]
│   └── KanbanColumn (Done)
│       └── TaskCard[]
│
├── TaskDetailPanel            ← slide-in lateral
│   ├── TaskHeader (título, status badge, feature tag)
│   ├── TaskObjective
│   ├── TaskSteps (checkboxes, read-only)
│   ├── TaskAcceptanceCriteria
│   └── TaskMetadata (owner, updated, dependencies)
│
└── CreateTaskDialog           ← modal
    ├── TitleInput
    ├── ObjectiveTextarea
    ├── StepsEditor (agregar/remover pasos)
    └── FeatureSelect
```

### 3.2 Estructura de archivos

```
src/
├── main.tsx                    # Entry point
├── App.tsx                     # Root component
├── api/
│   ├── client.ts               # API client (fetch + auth + base URL)
│   ├── projects.ts             # GET /projects
│   ├── tasks.ts                # CRUD /tasks
│   └── types.ts                # TypeScript types
├── components/
│   ├── header/
│   │   ├── Header.tsx
│   │   ├── ProjectSelector.tsx
│   │   ├── FeatureFilter.tsx
│   │   └── PollingControl.tsx
│   ├── board/
│   │   ├── KanbanBoard.tsx
│   │   ├── KanbanColumn.tsx
│   │   └── TaskCard.tsx
│   ├── detail/
│   │   └── TaskDetailPanel.tsx
│   └── create/
│       └── CreateTaskDialog.tsx
├── hooks/
│   ├── useTasks.ts             # Fetch + polling + estado
│   ├── useProjects.ts          # Fetch proyectos
│   └── useDragAndDrop.ts       # Setup de @dnd-kit
├── lib/
│   └── utils.ts                # Helpers (cn, formatDate, etc.)
└── styles/
    └── globals.css             # Tailwind base
```

### 3.3 Estado

Estado simple con React hooks — no hace falta store global:

```typescript
// Estado principal en App.tsx
const [selectedProject, setSelectedProject] = useState<string | null>(null);
const [featureFilter, setFeatureFilter] = useState<string | null>(null);
const [selectedTask, setSelectedTask] = useState<string | null>(null);
const [showCreateDialog, setShowCreateDialog] = useState(false);

// useTasks hook maneja fetch + polling + cache
const { tasks, isLoading, error, refresh } = useTasks(selectedProject, {
  featureFilter,
  pollingInterval: 10000,
});
```

---

## 4. Componentes clave

### 4.1 KanbanBoard

Componente principal que recibe tasks y las distribuye en columnas.

```typescript
interface KanbanBoardProps {
  tasks: Task[];
  onStatusChange: (taskFile: string, newStatus: TaskStatus) => void;
  onTaskClick: (taskFile: string) => void;
}

const COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: "pending",     label: "Pending",     color: "slate"  },
  { status: "in-progress", label: "In Progress", color: "blue"   },
  { status: "blocked",     label: "Blocked",     color: "red"    },
  { status: "done",        label: "Done",        color: "green"  },
];
```

**Drag & drop con @dnd-kit:**

```typescript
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

// Cada columna es un droppable container
// Cada TaskCard es un draggable item
// onDragEnd → detecta nueva columna → llama onStatusChange
```

**Flujo de drag & drop:**

1. Usuario agarra una TaskCard
2. DragOverlay muestra preview de la card
3. Usuario suelta en otra columna
4. `onDragEnd` detecta el status de la columna destino
5. Optimistic update: mueve la card localmente
6. `PATCH /api/v1/projects/:project/tasks/:file` con nuevo status
7. Si falla: revert al estado anterior + toast de error

### 4.2 TaskCard

Card compacta que muestra info clave de una task.

```typescript
interface TaskCardProps {
  task: Task;
  onClick: () => void;
}
```

**Contenido de la card:**

```
┌─────────────────────────────────┐
│ 005                     [auth]  │  ← número + feature badge
│                                 │
│ Implementar auth middleware     │  ← título
│                                 │
│ ████████░░ 3/5 steps           │  ← progreso de steps
│                                 │
│ max · hace 2h                   │  ← owner + updated
└─────────────────────────────────┘
```

**Campos mostrados:**

| Campo | Fuente | Notas |
|-------|--------|-------|
| Número | Extraído del filename (005-...) | Siempre visible |
| Feature badge | `task.feature` | Solo si existe, chip coloreado |
| Título | `task.title` | Truncado a 2 líneas |
| Progreso | Parseado de `## Steps` (contar `[x]` vs `[ ]`) | Barra visual |
| Owner | `task.owner` | Solo si existe |
| Updated | `task.updated` | Formato relativo ("hace 2h") |

### 4.3 TaskDetailPanel

Panel lateral (slide-in desde la derecha) que muestra el detalle completo de una task.

```
┌──────────────────────────────────────────┐
│ ← Cerrar                                │
│                                          │
│ # Implementar auth middleware            │
│                                          │
│ [in-progress]  [auth]  owner: max        │
│                                          │
│ ─────────────────────────────────────    │
│                                          │
│ ## Objective                             │
│ Agregar middleware de validación JWT      │
│ a todos los endpoints protegidos.        │
│                                          │
│ ## Steps                                 │
│ ☑ Crear middleware de auth               │
│ ☑ Agregar a router principal             │
│ ☐ Tests unitarios                        │
│ ☐ Documentar en API reference            │
│                                          │
│ ## Acceptance Criteria                   │
│ ☐ Endpoints protegidos rechazan sin token│
│ ☐ Token válido permite acceso            │
│ ☐ Tests cubren happy path y edge cases   │
│                                          │
│ ## Notes                                 │
│ Reusar el auth provider del MCP server.  │
│                                          │
│ ─────────────────────────────────────    │
│ Actualizado: 2025-02-19                  │
│ Archivo: 005-implementar-auth.md         │
└──────────────────────────────────────────┘
```

**Datos:** Se obtiene con `GET /api/v1/projects/:project/tasks/:file` (con `Accept: application/json`). El campo `content` se parsea en el frontend para extraer secciones (Objective, Steps, Acceptance Criteria, Notes).

**Interacción:** El panel es read-only excepto por el status, que se puede cambiar con un dropdown en el header.

### 4.4 CreateTaskDialog

Modal para crear una task nueva.

```
┌──────────────────────────────────────────┐
│ Nueva Task                        [X]    │
│                                          │
│ Título *                                 │
│ ┌──────────────────────────────────────┐ │
│ │ Implementar rate limiting            │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ Objetivo *                               │
│ ┌──────────────────────────────────────┐ │
│ │ Agregar rate limiting por IP al API  │ │
│ │ REST para prevenir abuso.            │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ Feature (opcional)                       │
│ ┌─────────────────────────┐              │
│ │ auth              ▼     │              │
│ └─────────────────────────┘              │
│                                          │
│ Pasos (opcional)                         │
│ ┌──────────────────────────────────────┐ │
│ │ 1. Elegir estrategia de rate limit   │ │
│ │ 2. Implementar middleware            │ │
│ │ 3. Agregar tests                 [+] │ │
│ └──────────────────────────────────────┘ │
│                                          │
│              [Cancelar]  [Crear Task]    │
└──────────────────────────────────────────┘
```

**Submit:** `POST /api/v1/projects/:project/tasks` → refresca el board → nueva task aparece en columna Pending.

**Feature selector:** Muestra features existentes (extraídas de las tasks cargadas) + opción de escribir una nueva.

---

## 5. API endpoints consumidos

| Componente | Endpoint | Método | Frecuencia |
|-----------|----------|--------|------------|
| ProjectSelector | `/api/v1/projects` | GET | Al cargar |
| KanbanBoard | `/api/v1/projects/:project/tasks` | GET | Polling (cada Ns) |
| TaskDetailPanel | `/api/v1/projects/:project/tasks/:file` | GET | Al click |
| Drag & drop | `/api/v1/projects/:project/tasks/:file` | PATCH | Al soltar |
| CreateTaskDialog | `/api/v1/projects/:project/tasks` | POST | Al submit |

**Total: 3 endpoints distintos** del API REST.

---

## 6. API client

### 6.1 Configuración

```typescript
// api/client.ts

interface ApiConfig {
  baseUrl: string;    // default: window.location.origin
  token?: string;     // VIBE_AUTH_TOKEN
}

const config: ApiConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || window.location.origin,
  token: import.meta.env.VITE_API_TOKEN || null,
};
```

### 6.2 Fetch wrapper

```typescript
async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (config.token) {
    headers["Authorization"] = `Bearer ${config.token}`;
  }

  const response = await fetch(`${config.baseUrl}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new ApiError(response.status, error.error, error.message);
  }

  return response.json();
}
```

### 6.3 Task API functions

```typescript
// api/tasks.ts

export async function listTasks(
  project: string,
  filters?: { status?: string; feature?: string }
): Promise<TaskListResponse> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.feature) params.set("feature", filters.feature);

  const query = params.toString();
  return apiRequest(`/api/v1/projects/${project}/tasks${query ? `?${query}` : ""}`);
}

export async function getTask(
  project: string,
  file: string
): Promise<TaskDetailResponse> {
  return apiRequest(`/api/v1/projects/${project}/tasks/${file}`);
}

export async function updateTaskStatus(
  project: string,
  file: string,
  status: TaskStatus
): Promise<TaskUpdateResponse> {
  return apiRequest(`/api/v1/projects/${project}/tasks/${file}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function createTask(
  project: string,
  data: CreateTaskData
): Promise<TaskCreateResponse> {
  return apiRequest(`/api/v1/projects/${project}/tasks`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
```

---

## 7. Polling hook

```typescript
// hooks/useTasks.ts

interface UseTasksOptions {
  featureFilter?: string | null;
  pollingInterval?: number;  // ms, 0 = disabled
}

function useTasks(project: string | null, options: UseTasksOptions = {}) {
  const { featureFilter, pollingInterval = 10000 } = options;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!project) return;
    try {
      const response = await listTasks(project, {
        feature: featureFilter || undefined,
      });
      setTasks(response.tasks);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [project, featureFilter]);

  // Initial fetch
  useEffect(() => {
    setIsLoading(true);
    fetchTasks();
  }, [fetchTasks]);

  // Polling
  useEffect(() => {
    if (!pollingInterval || !project) return;
    const interval = setInterval(fetchTasks, pollingInterval);
    return () => clearInterval(interval);
  }, [fetchTasks, pollingInterval, project]);

  return { tasks, isLoading, error, refresh: fetchTasks };
}
```

---

## 8. Drag & drop

### 8.1 Setup de @dnd-kit

```typescript
// hooks/useDragAndDrop.ts

function useDragAndDrop(
  tasks: Task[],
  onStatusChange: (taskFile: string, newStatus: TaskStatus) => void
) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }, // evita clicks accidentales
    }),
    useSensor(KeyboardSensor)
  );

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find(t => t.filename === event.active.id);
    setActiveTask(task || null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskFile = active.id as string;
    const newStatus = over.id as TaskStatus;
    const task = tasks.find(t => t.filename === taskFile);

    if (task && task.status !== newStatus) {
      onStatusChange(taskFile, newStatus);
    }
  }

  return { sensors, activeTask, handleDragStart, handleDragEnd };
}
```

### 8.2 Optimistic updates

```typescript
// En App.tsx o componente padre

async function handleStatusChange(taskFile: string, newStatus: TaskStatus) {
  // 1. Optimistic: actualizar estado local inmediatamente
  setTasks(prev =>
    prev.map(t =>
      t.filename === taskFile ? { ...t, status: newStatus } : t
    )
  );

  try {
    // 2. Llamar API
    await updateTaskStatus(selectedProject!, taskFile, newStatus);
  } catch (err) {
    // 3. Revert si falla
    setTasks(prev =>
      prev.map(t =>
        t.filename === taskFile ? { ...t, status: previousStatus } : t
      )
    );
    // 4. Mostrar error
    toast.error("No se pudo actualizar el status");
  }
}
```

---

## 9. TypeScript types

```typescript
// api/types.ts

type TaskStatus = "pending" | "in-progress" | "blocked" | "done";

interface Task {
  filename: string;
  title: string;
  status: TaskStatus;
  feature: string | null;
  owner: string | null;
  updated: string;
  objective: string;
}

interface TaskDetail extends Task {
  content: string;           // markdown raw
  path: string;
  metadata: {
    type: "task";
    status: TaskStatus;
    feature: string | null;
    owner: string | null;
    updated: string;
    tags: string[];
  };
}

interface TaskListResponse {
  project: string;
  filters: Record<string, string>;
  total: number;
  tasks: Task[];
}

interface CreateTaskData {
  title: string;
  objective: string;
  steps?: string[];
  feature?: string;
}

interface Project {
  name: string;
  stats: {
    total_docs: number;
    open_tasks: number;
    pending_tasks: number;
    in_progress_tasks: number;
    done_tasks: number;
  };
}
```

---

## 10. Parsing de contenido de task

El panel de detalle necesita parsear el markdown de una task para mostrar secciones estructuradas.

```typescript
// lib/parseTask.ts

interface ParsedTask {
  title: string;
  status: TaskStatus;
  objective: string;
  steps: { text: string; done: boolean }[];
  acceptanceCriteria: { text: string; done: boolean }[];
  notes: string | null;
  context: string | null;
}

function parseTaskContent(content: string): ParsedTask {
  // Extraer secciones por headings ## 
  const sections = splitBySections(content);

  return {
    title: extractTitle(content),                      // # Task: ...
    status: extractStatus(content),                    // Status: ...
    objective: sections["Objective"] || "",
    steps: parseCheckboxes(sections["Steps"] || ""),
    acceptanceCriteria: parseCheckboxes(sections["Acceptance Criteria"] || ""),
    notes: sections["Notes"] || null,
    context: sections["Context"] || null,
  };
}

function parseCheckboxes(text: string): { text: string; done: boolean }[] {
  return text
    .split("\n")
    .filter(line => /^\d+\.\s*\[[ x]\]/.test(line.trim()) || /^-\s*\[[ x]\]/.test(line.trim()))
    .map(line => ({
      text: line.replace(/^[\d.]+\s*\[[ x]\]\s*/, "").replace(/^-\s*\[[ x]\]\s*/, ""),
      done: line.includes("[x]"),
    }));
}
```

---

## 11. UX details

### 11.1 Columnas

| Columna | Color accent | Badge | Empty state |
|---------|-------------|-------|-------------|
| Pending | slate/gray | Conteo | "No hay tasks pendientes" |
| In Progress | blue | Conteo | "Sin tasks activas" |
| Blocked | red | Conteo + icono ⚠ | "Sin blockers 🎉" |
| Done | green | Conteo | "Aún no hay tasks completadas" |

### 11.2 Task card estados

| Estado visual | Cuándo |
|--------------|--------|
| Default | Card normal en su columna |
| Dragging | Opacidad reducida en posición original, DragOverlay con sombra |
| Drop target highlight | Columna destino muestra borde coloreado |
| Loading | Shimmer placeholder mientras carga |
| Error | Toast notification, card vuelve a posición original |

### 11.3 Responsive

| Breakpoint | Layout |
|-----------|--------|
| Desktop (>1024px) | 4 columnas lado a lado |
| Tablet (768-1024px) | 4 columnas más angostas, cards compactas |
| Mobile (<768px) | Tabs horizontales para cambiar entre columnas |

### 11.4 Polling indicator

Un indicador sutil en el header que muestra:
- Dot verde pulsando: polling activo
- Dot gris: polling pausado
- Spinner: fetching ahora mismo
- Timestamp: "Actualizado hace 5s"

---

## 12. Configuración

### 12.1 Variables de entorno (build time)

```bash
# .env
VITE_API_BASE_URL=https://vibe.example.com   # URL del vibeMCP server
VITE_API_TOKEN=tu-bearer-token                 # Opcional
VITE_POLLING_INTERVAL=10000                    # ms, default 10s
```

### 12.2 Variables de entorno (runtime)

Si se sirve desde vibeMCP, la config puede inyectarse como `window.__VIBE_CONFIG__`:

```html
<script>
  window.__VIBE_CONFIG__ = {
    apiBaseUrl: "%%VIBE_API_URL%%",
    pollingInterval: %%VIBE_POLLING_INTERVAL%%,
  };
</script>
```

El server reemplaza los placeholders al servir el HTML.

---

## 13. Plan de implementación

### 13.1 Orden recomendado

| Fase | Qué | Esfuerzo | Dependencia |
|------|-----|----------|-------------|
| 1 | Setup proyecto (Vite + React + Tailwind + shadcn) | Bajo | — |
| 2 | API client + types + useTasks hook | Bajo | API REST funcionando |
| 3 | KanbanBoard + KanbanColumn + TaskCard (read-only) | Medio | Fase 2 |
| 4 | ProjectSelector + FeatureFilter + Header | Bajo | Fase 2 |
| 5 | Drag & drop con @dnd-kit + optimistic updates | Medio | Fase 3 |
| 6 | TaskDetailPanel (slide-in) | Medio | Fase 3 |
| 7 | CreateTaskDialog | Bajo | Fase 2 |
| 8 | Polling control + indicator | Bajo | Fase 2 |
| 9 | Responsive + pulido visual | Bajo | Fase 3-7 |

### 13.2 Archivos a crear

```
vibe-dashboard/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── components.json              # shadcn config
├── .env.example
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── api/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── styles/
└── README.md
```

### 13.3 Dependencias

```json
{
  "dependencies": {
    "react": "^18.3",
    "react-dom": "^18.3",
    "@dnd-kit/core": "^6.0",
    "@dnd-kit/sortable": "^8.0",
    "@dnd-kit/utilities": "^3.0",
    "class-variance-authority": "^0.7",
    "clsx": "^2.0",
    "tailwind-merge": "^2.0",
    "lucide-react": "^0.300"
  },
  "devDependencies": {
    "vite": "^5.0",
    "@vitejs/plugin-react": "^4.0",
    "typescript": "^5.3",
    "tailwindcss": "^3.4",
    "autoprefixer": "^10.0",
    "postcss": "^8.0"
  }
}
```
