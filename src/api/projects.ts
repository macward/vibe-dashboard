import { apiClient } from './client'
import type { Project } from './types'

export async function getProjects(): Promise<Project[]> {
  return apiClient<Project[]>('/projects')
}
