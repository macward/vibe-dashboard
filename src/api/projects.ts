import { apiClient } from './client'
import type { Project } from './types'

interface ProjectsResponse {
  projects: Project[]
  total: number
}

export async function getProjects(): Promise<Project[]> {
  const data = await apiClient<ProjectsResponse>('/projects')
  return data.projects
}
