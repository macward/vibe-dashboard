import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core'
import type { Task, TaskStatus } from '@/api/types'
import { KanbanColumn } from './KanbanColumn'
import { COLUMNS } from './columns'
import { TaskCard } from './TaskCard'
import { useDragAndDrop } from '@/hooks/useDragAndDrop'

interface KanbanBoardProps {
  tasks: Task[]
  onTaskClick?: (task: Task) => void
  onStatusChange: (taskFilename: string, newStatus: TaskStatus) => void
  isLoading?: boolean
}

export function KanbanBoard({
  tasks,
  onTaskClick,
  onStatusChange,
  isLoading,
}: KanbanBoardProps) {
  const {
    sensors,
    activeTask,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useDragAndDrop({ tasks, onStatusChange })

  const tasksByStatus = COLUMNS.reduce(
    (acc, col) => {
      acc[col.status] = tasks.filter((t) => t.status === col.status)
      return acc
    },
    {} as Record<TaskStatus, Task[]>
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-4 p-4 h-full overflow-x-auto hide-scrollbar">
        {COLUMNS.map((config) => (
          <KanbanColumn
            key={config.status}
            config={config}
            tasks={tasksByStatus[config.status] || []}
            onTaskClick={onTaskClick}
            activeTaskId={activeTask?.filename}
            isLoading={isLoading && tasks.length === 0}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 200, easing: 'ease-out' }}>
        {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  )
}
