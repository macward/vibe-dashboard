export type TaskStatus = 'pending' | 'in-progress' | 'blocked' | 'done'

export interface Task {
  filename: string
  path: string
  status: TaskStatus | null
  owner: string | null
  updated: string | null
  feature: string | null
}

export interface TaskDetail {
  filename: string
  path: string
  content: string
  metadata: Record<string, unknown>
}

export interface Project {
  name: string
  path: string
}
