import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Project } from '@/api/types'

interface ProjectSelectorProps {
  projects: Project[]
  selectedProject: string | null
  onSelectProject: (project: string) => void
  isLoading?: boolean
}

export function ProjectSelector({
  projects,
  selectedProject,
  onSelectProject,
  isLoading,
}: ProjectSelectorProps) {
  return (
    <Select
      value={selectedProject || undefined}
      onValueChange={onSelectProject}
      disabled={isLoading}
    >
      <SelectTrigger className="h-auto w-auto gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20 hover:bg-primary/20 transition-colors">
        <span className="size-1.5 rounded-full bg-primary" />
        <SelectValue placeholder={isLoading ? 'Loading...' : 'Select project'} />
      </SelectTrigger>
      <SelectContent>
        {projects.map((project) => (
          <SelectItem key={project.name} value={project.name}>
            {project.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
