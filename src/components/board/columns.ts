import type { TaskStatus } from '@/api/types'

export interface ColumnConfig {
  status: TaskStatus
  label: string
  color: 'slate' | 'primary' | 'rose' | 'emerald'
  emptyMessage: string
}

export const COLUMNS: ColumnConfig[] = [
  { status: 'pending', label: 'Backlog', color: 'slate', emptyMessage: 'No pending tasks' },
  { status: 'in-progress', label: 'In Progress', color: 'primary', emptyMessage: 'No active tasks' },
  { status: 'blocked', label: 'Blocked', color: 'rose', emptyMessage: 'No blockers' },
  { status: 'done', label: 'Done', color: 'emerald', emptyMessage: 'No completed tasks' },
]
