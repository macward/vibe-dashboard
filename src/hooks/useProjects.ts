import { useState, useEffect } from 'react'
import { getProjects } from '../api/projects'
import type { Project } from '../api/types'

interface UseProjectsResult {
  projects: Project[]
  isLoading: boolean
  error: Error | null
  refresh: () => Promise<void>
}

export function useProjects(): UseProjectsResult {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProjects = async () => {
    try {
      setIsLoading(true)
      const data = await getProjects()
      setProjects(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch projects'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  return { projects, isLoading, error, refresh: fetchProjects }
}
