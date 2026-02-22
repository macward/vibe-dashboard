import { useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { getTask } from '@/api/tasks'
import type { Task, TaskDetail } from '@/api/types'
import { parseTaskContent, calculateProgress, type ParsedTask } from '@/lib/parseTask'
import { cn, extractTaskNumber, formatRelativeTime } from '@/lib/utils'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'

interface TaskDetailPanelProps {
  task: Task | null
  project: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskDetailPanel({
  task,
  project,
  open,
  onOpenChange,
}: TaskDetailPanelProps) {
  const [detail, setDetail] = useState<TaskDetail | null>(null)
  const [parsedContent, setParsedContent] = useState<ParsedTask | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!task || !open) return

    const fetchDetail = async () => {
      setIsLoading(true)
      try {
        const data = await getTask(project, task.filename)
        setDetail(data)
        setParsedContent(parseTaskContent(data.content))
      } catch (err) {
        console.error('Failed to fetch task detail:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDetail()
  }, [task, project, open])

  const taskNumber = task ? extractTaskNumber(task.filename) : ''
  const stepsProgress = parsedContent ? calculateProgress(parsedContent.steps) : null
  const criteriaProgress = parsedContent
    ? calculateProgress(parsedContent.acceptanceCriteria)
    : null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] sm:max-w-none overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-mono text-muted-foreground">
              #{taskNumber}
            </span>
            {task?.status && (
              <Badge
                variant="secondary"
                className={cn(
                  'text-xs',
                  task.status === 'pending' && 'bg-slate-200 text-slate-700',
                  task.status === 'in-progress' && 'bg-blue-200 text-blue-700',
                  task.status === 'blocked' && 'bg-red-200 text-red-700',
                  task.status === 'done' && 'bg-green-200 text-green-700'
                )}
              >
                {task.status}
              </Badge>
            )}
            {task?.feature && (
              <Badge variant="outline" className="text-xs">
                {task.feature}
              </Badge>
            )}
          </div>
          <SheetTitle className="text-xl">
            {parsedContent?.title || task?.filename}
          </SheetTitle>
          {task?.owner && (
            <SheetDescription>
              Owner: {task.owner} · Updated {formatRelativeTime(task.updated)}
            </SheetDescription>
          )}
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : parsedContent ? (
          <div className="mt-6 space-y-6">
            {/* Objective */}
            {parsedContent.objective && (
              <section>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  Objective
                </h3>
                <p className="text-sm leading-relaxed">{parsedContent.objective}</p>
              </section>
            )}

            {/* Steps */}
            {parsedContent.steps.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Steps
                  </h3>
                  {stepsProgress && (
                    <span className="text-xs text-muted-foreground">
                      {stepsProgress.done}/{stepsProgress.total}
                    </span>
                  )}
                </div>
                <ul className="space-y-2">
                  {parsedContent.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      {step.done ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      )}
                      <span className={cn(step.done && 'line-through text-muted-foreground')}>
                        {step.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Acceptance Criteria */}
            {parsedContent.acceptanceCriteria.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Acceptance Criteria
                  </h3>
                  {criteriaProgress && (
                    <span className="text-xs text-muted-foreground">
                      {criteriaProgress.done}/{criteriaProgress.total}
                    </span>
                  )}
                </div>
                <ul className="space-y-2">
                  {parsedContent.acceptanceCriteria.map((criteria, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      {criteria.done ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      )}
                      <span className={cn(criteria.done && 'line-through text-muted-foreground')}>
                        {criteria.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Notes */}
            {parsedContent.notes && (
              <section>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  Notes
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {parsedContent.notes}
                </p>
              </section>
            )}

            {/* Metadata */}
            <section className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                File: {task?.filename}
              </p>
              {typeof detail?.metadata?.updated === 'string' && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last updated: {detail.metadata.updated}
                </p>
              )}
            </section>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
