import { ProjectSelector } from './ProjectSelector'
import { FeatureFilter } from './FeatureFilter'
import { PollingControl } from './PollingControl'
import { ThemeToggle } from './ThemeToggle'
import { Button } from '@/components/ui/button'
import type { Project } from '@/api/types'
import { Plus } from 'lucide-react'

interface HeaderProps {
  projects: Project[]
  selectedProject: string | null
  onSelectProject: (project: string) => void
  projectsLoading?: boolean
  features: string[]
  selectedFeature: string | null
  onSelectFeature: (feature: string | null) => void
  onNewTask?: () => void
  pollingInterval: number
  onPollingIntervalChange: (interval: number) => void
  isPolling: boolean
  isLoading: boolean
  lastFetch: Date | null
  onRefresh: () => void
  isDark: boolean
  onToggleTheme: () => void
}

export function Header({
  projects,
  selectedProject,
  onSelectProject,
  projectsLoading,
  features,
  selectedFeature,
  onSelectFeature,
  onNewTask,
  pollingInterval,
  onPollingIntervalChange,
  isPolling,
  isLoading,
  lastFetch,
  onRefresh,
  isDark,
  onToggleTheme,
}: HeaderProps) {
  return (
    <header className="border-b px-4 md:px-6 py-3 md:py-4 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 z-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-xl md:text-2xl font-bold">Vibe Dashboard</h1>
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <PollingControl
            pollingInterval={pollingInterval}
            onIntervalChange={onPollingIntervalChange}
            isPolling={isPolling}
            isLoading={isLoading}
            lastFetch={lastFetch}
            onRefresh={onRefresh}
          />
          <div className="hidden md:block w-px h-6 bg-border" />
          <ProjectSelector
            projects={projects}
            selectedProject={selectedProject}
            onSelectProject={onSelectProject}
            isLoading={projectsLoading}
          />
          <FeatureFilter
            features={features}
            selectedFeature={selectedFeature}
            onSelectFeature={onSelectFeature}
          />
          {onNewTask && (
            <Button onClick={onNewTask} size="sm" className="ml-auto md:ml-0">
              <Plus className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">New Task</span>
            </Button>
          )}
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
        </div>
      </div>
    </header>
  )
}
