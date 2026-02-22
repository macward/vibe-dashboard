import { useState, useEffect, useCallback, useRef } from 'react'
import { getTasks } from '../api/tasks'
import type { Task } from '../api/types'

const DEFAULT_POLLING_INTERVAL = Number(import.meta.env.VITE_POLLING_INTERVAL) || 10000

interface UseTasksOptions {
  featureFilter?: string | null
  pollingInterval?: number // 0 = disabled
}

interface UseTasksResult {
  tasks: Task[]
  isLoading: boolean
  error: Error | null
  refresh: () => Promise<void>
  lastFetch: Date | null
  isPolling: boolean
  setPollingInterval: (interval: number) => void
}

export function useTasks(
  project: string | null,
  options: UseTasksOptions = {}
): UseTasksResult {
  const { featureFilter, pollingInterval: initialInterval = DEFAULT_POLLING_INTERVAL } = options

  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)
  const [pollingInterval, setPollingInterval] = useState(initialInterval)

  const previousDataRef = useRef<string>('')

  const fetchTasks = useCallback(async () => {
    if (!project) return

    try {
      setIsLoading(true)
      const data = await getTasks(project)

      // Filter by feature if specified
      const filteredData = featureFilter
        ? data.filter((task) => task.feature === featureFilter)
        : data

      // Only update if data changed
      const dataString = JSON.stringify(filteredData)
      if (dataString !== previousDataRef.current) {
        previousDataRef.current = dataString
        setTasks(filteredData)
      }

      setError(null)
      setLastFetch(new Date())
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tasks'))
    } finally {
      setIsLoading(false)
    }
  }, [project, featureFilter])

  // Initial fetch
  useEffect(() => {
    if (project) {
      previousDataRef.current = ''
      fetchTasks()
    } else {
      setTasks([])
    }
  }, [project, featureFilter, fetchTasks])

  // Polling
  useEffect(() => {
    if (!project || pollingInterval === 0) return

    const interval = setInterval(fetchTasks, pollingInterval)
    return () => clearInterval(interval)
  }, [project, pollingInterval, fetchTasks])

  return {
    tasks,
    isLoading,
    error,
    refresh: fetchTasks,
    lastFetch,
    isPolling: pollingInterval > 0,
    setPollingInterval,
  }
}
