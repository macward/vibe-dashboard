import type { TaskStatus } from '@/api/types'

export interface ParsedStep {
  text: string
  done: boolean
}

export interface ParsedTask {
  title: string
  status: TaskStatus | null
  objective: string
  steps: ParsedStep[]
  acceptanceCriteria: ParsedStep[]
  notes: string | null
  context: string | null
}

export function parseTaskContent(content: string): ParsedTask {
  const sections = splitBySections(content)

  return {
    title: extractTitle(content),
    status: extractStatus(content),
    objective: sections['Objective'] || '',
    steps: parseCheckboxes(sections['Steps'] || ''),
    acceptanceCriteria: parseCheckboxes(sections['Acceptance Criteria'] || ''),
    notes: sections['Notes'] || null,
    context: sections['Context'] || null,
  }
}

function extractTitle(content: string): string {
  const match = content.match(/^#\s*Task:\s*(.+)$/m)
  return match ? match[1].trim() : ''
}

function extractStatus(content: string): TaskStatus | null {
  const match = content.match(/^Status:\s*(.+)$/m)
  if (!match) return null
  const status = match[1].trim().toLowerCase()
  if (['pending', 'in-progress', 'blocked', 'done'].includes(status)) {
    return status as TaskStatus
  }
  return null
}

function splitBySections(content: string): Record<string, string> {
  const sections: Record<string, string> = {}
  const regex = /^##\s+(.+)$/gm
  let match: RegExpExecArray | null
  const matches: { name: string; index: number }[] = []

  while ((match = regex.exec(content)) !== null) {
    matches.push({ name: match[1].trim(), index: match.index + match[0].length })
  }

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index
    const end = i + 1 < matches.length ? matches[i + 1].index - matches[i + 1].name.length - 3 : content.length
    sections[matches[i].name] = content.slice(start, end).trim()
  }

  return sections
}

function parseCheckboxes(text: string): ParsedStep[] {
  const lines = text.split('\n')
  const steps: ParsedStep[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    // Match patterns like: "1. [ ] Step" or "- [x] Step"
    const checkboxMatch = trimmed.match(/^(?:\d+\.|-)?\s*\[([ xX])\]\s*(.+)$/)
    if (checkboxMatch) {
      steps.push({
        done: checkboxMatch[1].toLowerCase() === 'x',
        text: checkboxMatch[2].trim(),
      })
    }
  }

  return steps
}

export function calculateProgress(steps: ParsedStep[]): { done: number; total: number } {
  const done = steps.filter((s) => s.done).length
  return { done, total: steps.length }
}
