import { useDroppable } from '@dnd-kit/core'
import type { Task } from '@/api/types'
import { TaskCard } from './TaskCard'
import { TaskCardSkeleton } from './TaskCardSkeleton'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import type { ColumnConfig } from './columns'

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
    <section className="kanban-column flex flex-col h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <h2
            className={cn(
              'text-sm font-bold uppercase tracking-wider',
              color === 'slate' && 'text-slate-500 dark:text-slate-400',
              color === 'primary' && 'text-primary',
              color === 'rose' && 'text-rose-500',
              color === 'emerald' && 'text-emerald-500'
            )}
          >
            {label}
          </h2>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-bold',
              color === 'slate' && 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
              color === 'primary' && 'bg-primary/20 text-primary border border-primary/30',
              color === 'rose' && 'bg-rose-500/20 text-rose-500 border border-rose-500/30',
              color === 'emerald' && 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
            )}
          >
            {tasks.length}
          </span>
        </div>
        <button className="text-slate-400 hover:text-primary transition-colors">
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Column Content */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 overflow-y-auto space-y-3 pr-1 hide-scrollbar transition-all duration-200',
          color === 'emerald' && 'opacity-60',
          isOver && 'ring-2 ring-primary/50 rounded-xl'
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
    </section>
  )
}
