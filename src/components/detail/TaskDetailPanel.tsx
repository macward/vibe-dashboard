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
      <SheetContent className="w-[420px] sm:w-[560px] sm:max-w-none overflow-y-auto p-0">
        <SheetHeader className="px-6 pt-6 pb-5 border-b border-border/50 space-y-3">
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
          <div className="px-6 py-6 space-y-5">
            {/* Objective */}
            {parsedContent.objective && (
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3">
                  Objective
                </h3>
                <div className="rounded-lg bg-muted/40 px-4 py-3">
                  <p className="text-sm leading-relaxed">{parsedContent.objective}</p>
                </div>
              </section>
            )}

            {/* Steps */}
            {parsedContent.steps.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                    Steps
                  </h3>
                  {stepsProgress && (
                    <span className="text-xs text-muted-foreground">
                      {stepsProgress.done}/{stepsProgress.total}
                    </span>
                  )}
                </div>
                {stepsProgress && stepsProgress.total > 0 && (
                  <div className="h-1.5 rounded-full bg-muted mb-3">
                    <div
                      className="h-1.5 rounded-full bg-green-500 transition-all duration-300"
                      role="progressbar"
                      aria-valuenow={stepsProgress.done}
                      aria-valuemin={0}
                      aria-valuemax={stepsProgress.total}
                      style={{ width: `${(stepsProgress.done / stepsProgress.total) * 100}%` }}
                    />
                  </div>
                )}
                <div className="rounded-lg bg-muted/40 px-4 py-3">
                  <ul className="space-y-2.5">
                    {parsedContent.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm py-1">
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
                </div>
              </section>
            )}

            {/* Acceptance Criteria */}
            {parsedContent.acceptanceCriteria.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                    Acceptance Criteria
                  </h3>
                  {criteriaProgress && (
                    <span className="text-xs text-muted-foreground">
                      {criteriaProgress.done}/{criteriaProgress.total}
                    </span>
                  )}
                </div>
                {criteriaProgress && criteriaProgress.total > 0 && (
                  <div className="h-1.5 rounded-full bg-muted mb-3">
                    <div
                      className="h-1.5 rounded-full bg-green-500 transition-all duration-300"
                      role="progressbar"
                      aria-valuenow={criteriaProgress.done}
                      aria-valuemin={0}
                      aria-valuemax={criteriaProgress.total}
                      style={{ width: `${(criteriaProgress.done / criteriaProgress.total) * 100}%` }}
                    />
                  </div>
                )}
                <div className="rounded-lg bg-muted/40 px-4 py-3">
                  <ul className="space-y-2.5">
                    {parsedContent.acceptanceCriteria.map((criteria, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm py-1">
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
                </div>
              </section>
            )}

            {/* Notes */}
            {parsedContent.notes && (
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3">
                  Notes
                </h3>
                <div className="rounded-lg bg-muted/40 px-4 py-3">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {parsedContent.notes}
                  </p>
                </div>
              </section>
            )}

            {/* Metadata */}
            <section className="pt-4 border-t border-border/40">
              <p className="text-[11px] text-muted-foreground">
                File: <span className="font-mono">{task?.filename}</span>
              </p>
              {typeof detail?.metadata?.updated === 'string' && (
                <p className="text-[11px] text-muted-foreground mt-1">
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
