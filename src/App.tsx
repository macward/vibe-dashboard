import { useState, useCallback } from 'react'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { Header } from '@/components/header/Header'
import { KanbanBoard } from '@/components/board/KanbanBoard'
import { TaskDetailPanel } from '@/components/detail/TaskDetailPanel'
import { CreateTaskDialog } from '@/components/create/CreateTaskDialog'
import { useProjects } from '@/hooks/useProjects'
import { useTasks } from '@/hooks/useTasks'
import { useDarkMode } from '@/hooks/useDarkMode'
import { updateTaskStatus } from '@/api/tasks'
import type { Task, TaskStatus } from '@/api/types'

function App() {
  const { isDark, toggle: toggleTheme } = useDarkMode()
  const { projects, isLoading: projectsLoading } = useProjects()
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [featureFilter, setFeatureFilter] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [optimisticTasks, setOptimisticTasks] = useState<Task[] | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [pollingInterval, setPollingInterval] = useState(10000)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const {
    tasks: fetchedTasks,
    isLoading: tasksLoading,
    error,
    refresh,
    lastFetch,
    isPolling,
    setPollingInterval: updatePollingInterval,
  } = useTasks(selectedProject, {
    featureFilter,
    pollingInterval,
  })

  // Use optimistic tasks if available, otherwise use fetched tasks
  const tasks = optimisticTasks || fetchedTasks

  // Auto-select first project
  if (!selectedProject && projects.length > 0 && !projectsLoading) {
    setSelectedProject(projects[0].name)
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setDetailOpen(true)
  }

  const handleStatusChange = useCallback(
    async (taskFilename: string, newStatus: TaskStatus) => {
      if (!selectedProject) return

      const previousTasks = tasks
      const task = tasks.find((t) => t.filename === taskFilename)
      if (!task) return

      // Optimistic update
      const updatedTasks = tasks.map((t) =>
        t.filename === taskFilename ? { ...t, status: newStatus } : t
      )
      setOptimisticTasks(updatedTasks)
      setErrorMessage(null)

      try {
        await updateTaskStatus(selectedProject, taskFilename, newStatus)
        // Clear optimistic state, let polling take over
        setOptimisticTasks(null)
      } catch (err) {
        // Rollback
        setOptimisticTasks(previousTasks)
        setErrorMessage(
          `Failed to update task status: ${err instanceof Error ? err.message : 'Unknown error'}`
        )
        setTimeout(() => setErrorMessage(null), 5000)
      }
    },
    [selectedProject, tasks]
  )

  const handleTaskCreated = () => {
    refresh()
  }

  const handlePollingIntervalChange = (interval: number) => {
    setPollingInterval(interval)
    updatePollingInterval(interval)
  }

  // Extract unique features for filter (including all tasks, not just filtered)
  const allFeatures = [...new Set(fetchedTasks.map((t) => t.feature).filter(Boolean))] as string[]

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
        isLoading={projectsLoading}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          selectedProject={selectedProject}
          features={allFeatures}
          selectedFeature={featureFilter}
          onSelectFeature={setFeatureFilter}
          onNewTask={() => setCreateOpen(true)}
          pollingInterval={pollingInterval}
          onPollingIntervalChange={handlePollingIntervalChange}
          isPolling={isPolling}
          isLoading={tasksLoading}
          lastFetch={lastFetch}
          onRefresh={refresh}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          totalTasks={tasks.length}
        />

        <main className="flex-1 overflow-hidden flex flex-col board-bg">
          {(error || errorMessage) && (
            <div className="p-3 md:p-4 bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 text-sm animate-in slide-in-from-top duration-200">
              Error: {errorMessage || error?.message}
            </div>
          )}

          <KanbanBoard
            tasks={tasks}
            onTaskClick={handleTaskClick}
            onStatusChange={handleStatusChange}
            isLoading={tasksLoading}
          />
        </main>
      </div>

      <TaskDetailPanel
        task={selectedTask}
        project={selectedProject || ''}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <CreateTaskDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        project={selectedProject || ''}
        features={allFeatures}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  )
}

export default App
