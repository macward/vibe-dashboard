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
      <SelectTrigger className="w-[200px]">
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
