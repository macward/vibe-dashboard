import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
        'cursor-grab active:cursor-grabbing transition-all duration-200',
        'border-l-4 hover:shadow-md hover:-translate-y-0.5',
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
      <CardHeader className="pb-2 pt-3 px-3">
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-mono text-muted-foreground">
            {taskNumber}
          </span>
          {task.feature && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0 transition-colors">
              {task.feature}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-3 px-3 pt-0">
        <p className="text-sm font-medium line-clamp-2 mb-2 leading-snug">
          {taskTitle}
        </p>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {task.owner && (
            <span className="truncate max-w-[80px]">{task.owner}</span>
          )}
          {!task.owner && <span />}
          {task.updated && (
            <span className="flex-shrink-0">{formatRelativeTime(task.updated)}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
