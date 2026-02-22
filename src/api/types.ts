export type TaskStatus = 'pending' | 'in-progress' | 'blocked' | 'done'

export interface Task {
  filename: string
  path: string
  status: TaskStatus | null
  owner: string | null
  updated: string | null
  feature: string | null
  project_name: string
}

export interface TaskDetail extends Task {
  content: string
  metadata: Record<string, unknown>
}

export interface Project {
  name: string
  path: string
}
