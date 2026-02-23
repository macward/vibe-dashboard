import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '@/api/types'
import { cn, extractTaskNumber, extractTaskTitle } from '@/lib/utils'
import { AlertTriangle, CheckCircle } from 'lucide-react'

interface TaskCardProps {
  task: Task
  onClick?: () => void
  isDragging?: boolean
  isOverlay?: boolean
}

export function TaskCard({ task, onClick, isDragging, isOverlay }: TaskCardProps) {
  const taskNumber = extractTaskNumber(task.filename)
  const taskTitle = extractTaskTitle(task.filename)

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.filename,
    disabled: isOverlay,
  })

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined

  const isInProgress = task.status === 'in-progress'
  const isBlocked = task.status === 'blocked'
  const isDone = task.status === 'done'

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-xl bg-card p-4 cursor-grab active:cursor-grabbing transition-all duration-200',
        'border border-border shadow-sm',
        'hover:shadow-md',
        // In Progress: left border accent + stronger shadow
        isInProgress && 'border-l-4 border-l-primary shadow-md',
        // Blocked: border accent
        isBlocked && 'border-rose-500/50',
        // Done: completed styling
        isDone && '',
        // Dragging states
        isDragging && 'opacity-40 scale-95',
        isOverlay && 'shadow-2xl cursor-grabbing rotate-2 scale-105 ring-2 ring-primary/20'
      )}
      onClick={onClick}
      aria-label={`Task ${taskNumber}: ${taskTitle}`}
      {...listeners}
      {...attributes}
    >
      {/* Status indicator for blocked/done */}
      {isBlocked && (
        <div className="mb-2 flex items-center gap-1.5 text-rose-500">
          <AlertTriangle className="h-3 w-3" />
          <span className="text-[10px] font-bold uppercase tracking-wide">Blocked</span>
        </div>
      )}
      {isDone && (
        <div className="mb-2 flex items-center gap-1.5 text-emerald-500">
          <CheckCircle className="h-3 w-3" />
          <span className="text-[10px] font-bold uppercase tracking-wide">Completed</span>
        </div>
      )}

      {/* Category tag */}
      {task.feature && !isBlocked && !isDone && (
        <div className="mb-2">
          <span
            className={cn(
              'inline-block rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide border',
              isInProgress
                ? 'bg-primary/10 text-primary border-primary/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            )}
          >
            {task.feature}
          </span>
        </div>
      )}

      {/* Title */}
      <h3
        className={cn(
          'mb-1 text-sm font-bold text-foreground',
          isDone && 'line-through'
        )}
      >
        {taskTitle}
      </h3>

      {/* Objective/Description */}
      {task.objective && (
        <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {task.objective}
        </p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          {taskNumber}
        </span>
        {task.owner && (
          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary border border-primary/20">
            {task.owner}
          </span>
        )}
      </div>
    </div>
  )
}
