import { apiClient } from './client'
import type { Task, TaskDetail, TaskStatus } from './types'

export async function getTasks(project: string): Promise<Task[]> {
  return apiClient<Task[]>(`/projects/${project}/tasks`)
}

export async function getTask(project: string, filename: string): Promise<TaskDetail> {
  return apiClient<TaskDetail>(`/projects/${project}/tasks/${filename}`)
}

export async function updateTaskStatus(
  project: string,
  filename: string,
  status: TaskStatus
): Promise<TaskDetail> {
  return apiClient<TaskDetail>(`/projects/${project}/tasks/${filename}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export interface CreateTaskPayload {
  title: string
  objective: string
  steps?: string[]
  feature?: string
}

export async function createTask(
  project: string,
  payload: CreateTaskPayload
): Promise<{ status: string; task_number: number; path: string }> {
  return apiClient(`/projects/${project}/tasks`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
