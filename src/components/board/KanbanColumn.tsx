import { useDroppable } from '@dnd-kit/core'
import type { Task, TaskStatus } from '@/api/types'
import { TaskCard } from './TaskCard'
import { TaskCardSkeleton } from './TaskCardSkeleton'
import { cn } from '@/lib/utils'

interface ColumnConfig {
  status: TaskStatus
  label: string
  color: string
  emptyMessage: string
}

export const COLUMNS: ColumnConfig[] = [
  { status: 'pending', label: 'Pending', color: 'slate', emptyMessage: 'No hay tasks pendientes' },
  { status: 'in-progress', label: 'In Progress', color: 'blue', emptyMessage: 'Sin tasks activas' },
  { status: 'blocked', label: 'Blocked', color: 'red', emptyMessage: 'Sin blockers' },
  { status: 'done', label: 'Done', color: 'green', emptyMessage: 'Sin tasks completadas' },
]

interface KanbanColumnProps {
  config: ColumnConfig
  tasks: Task[]
  onTaskClick?: (task: Task) => void
  activeTaskId?: string | null
  isLoading?: boolean
}

export function KanbanColumn({
  config,
  tasks,
  onTaskClick,
  activeTaskId,
  isLoading,
}: KanbanColumnProps) {
  const { label, color, emptyMessage, status } = config

  const { setNodeRef, isOver } = useDroppable({
    id: status,
  })

  return (
    <div className="flex flex-col flex-1 min-w-0">
      <div
        className={cn(
          'flex items-center justify-between px-3 py-2 rounded-t-lg transition-colors',
          color === 'slate' && 'bg-slate-100 dark:bg-slate-800',
          color === 'blue' && 'bg-blue-100 dark:bg-blue-900/30',
          color === 'red' && 'bg-red-100 dark:bg-red-900/30',
          color === 'green' && 'bg-green-100 dark:bg-green-900/30'
        )}
      >
        <h3
          className={cn(
            'font-semibold text-sm',
            color === 'slate' && 'text-slate-700 dark:text-slate-300',
            color === 'blue' && 'text-blue-700 dark:text-blue-300',
            color === 'red' && 'text-red-700 dark:text-red-300',
            color === 'green' && 'text-green-700 dark:text-green-300'
          )}
        >
          {label}
        </h3>
        <span
          className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full transition-all',
            color === 'slate' && 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
            color === 'blue' && 'bg-blue-200 text-blue-600 dark:bg-blue-800 dark:text-blue-300',
            color === 'red' && 'bg-red-200 text-red-600 dark:bg-red-800 dark:text-red-300',
            color === 'green' && 'bg-green-200 text-green-600 dark:bg-green-800 dark:text-green-300'
          )}
        >
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 bg-muted/30 rounded-b-lg p-2 space-y-2 min-h-[200px] transition-all duration-200',
          isOver && 'bg-muted/60 ring-2 ring-primary/50 scale-[1.01]'
        )}
      >
        {isLoading ? (
          <>
            <TaskCardSkeleton />
            <TaskCardSkeleton />
          </>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {emptyMessage}
          </p>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.filename}
              task={task}
              onClick={() => onTaskClick?.(task)}
              isDragging={activeTaskId === task.filename}
            />
          ))
        )}
      </div>
    </div>
  )
}
