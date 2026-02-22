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
  { status: 'pending', label: 'Yet to Start', color: 'amber', emptyMessage: 'No hay tasks pendientes' },
  { status: 'in-progress', label: 'In Progress', color: 'red', emptyMessage: 'Sin tasks activas' },
  { status: 'blocked', label: 'Blocked', color: 'slate', emptyMessage: 'Sin blockers' },
  { status: 'done', label: 'Complete', color: 'green', emptyMessage: 'Sin tasks completadas' },
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
          'flex items-center gap-2 px-3 py-2.5 rounded-t-lg transition-colors',
          color === 'amber' && 'bg-amber-100/50 dark:bg-amber-900/20',
          color === 'red' && 'bg-red-100/50 dark:bg-red-900/20',
          color === 'slate' && 'bg-slate-100 dark:bg-slate-800/50',
          color === 'green' && 'bg-green-100/50 dark:bg-green-900/20'
        )}
      >
        {/* Dot indicator */}
        <span
          className={cn(
            'w-2.5 h-2.5 rounded-full flex-shrink-0',
            color === 'amber' && 'bg-amber-500',
            color === 'red' && 'bg-red-500',
            color === 'slate' && 'bg-slate-400 dark:bg-slate-500',
            color === 'green' && 'bg-green-500'
          )}
        />
        {/* Label + count */}
        <h3 className="font-medium text-sm text-foreground">
          {label}
        </h3>
        <span className="text-sm text-muted-foreground">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 bg-muted/30 rounded-b-lg p-2.5 space-y-2.5 min-h-[200px] transition-all duration-200',
          isOver && 'bg-muted/50 ring-2 ring-primary/50 scale-[1.01]'
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
