import { useState } from 'react'
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import { PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { Task, TaskStatus } from '@/api/types'

interface UseDragAndDropOptions {
  tasks: Task[]
  onStatusChange: (taskFilename: string, newStatus: TaskStatus) => void
}

export function useDragAndDrop({ tasks, onStatusChange }: UseDragAndDropOptions) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor)
  )

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.filename === event.active.id)
    setActiveTask(task || null)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null)
    const { active, over } = event

    if (!over) return

    const taskFilename = active.id as string
    const newStatus = over.id as TaskStatus
    const task = tasks.find((t) => t.filename === taskFilename)

    if (task && task.status !== newStatus) {
      onStatusChange(taskFilename, newStatus)
    }
  }

  function handleDragCancel() {
    setActiveTask(null)
  }

  return {
    sensors,
    activeTask,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  }
}
