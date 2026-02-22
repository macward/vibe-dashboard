import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { Task } from '@/api/types'
import { cn, formatRelativeTime, extractTaskNumber, extractTaskTitle } from '@/lib/utils'

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

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'cursor-grab active:cursor-grabbing transition-all duration-200 py-0 gap-0',
        'rounded-2xl border-l-4 shadow-sm',
        'hover:shadow-lg hover:-translate-y-0.5',
        'dark:shadow-sm dark:shadow-black/10 dark:hover:shadow-md dark:hover:shadow-black/20',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        task.status === 'pending' && 'border-l-slate-400',
        task.status === 'in-progress' && 'border-l-blue-500',
        task.status === 'blocked' && 'border-l-red-500',
        task.status === 'done' && 'border-l-green-500',
        isDragging && 'opacity-40 scale-95',
        isOverlay && 'shadow-2xl cursor-grabbing rotate-2 scale-105 ring-2 ring-primary/20'
      )}
      onClick={onClick}
      aria-label={`Task ${taskNumber}: ${taskTitle}`}
      {...listeners}
      {...attributes}
    >
      <CardHeader className="pb-1 pt-3 px-4">
        {task.feature && (
          <span className="inline-block text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-md bg-muted/80 text-muted-foreground dark:bg-muted/50 dark:text-muted-foreground/90">
            {task.feature}
          </span>
        )}
      </CardHeader>
      <CardContent className="pb-3 px-4 pt-0 space-y-2">
        <p className="text-sm font-semibold line-clamp-2 leading-snug">
          {taskTitle}
        </p>

        {task.objective && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {task.objective}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground/60">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] tracking-wide">{taskNumber}</span>
            {task.owner && (
              <span className="truncate max-w-[60px]">{task.owner}</span>
            )}
          </div>
          {task.updated && (
            <span className="flex-shrink-0">{formatRelativeTime(task.updated)}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
