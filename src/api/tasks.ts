import { apiClient } from './client'
import type { Task, TaskDetail, TaskStatus } from './types'

interface TasksResponse {
  tasks: Task[]
}

export async function getTasks(project: string): Promise<Task[]> {
  const data = await apiClient<TasksResponse>(`/projects/${project}/tasks`)
  return data.tasks
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
