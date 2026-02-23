import { FeatureFilter } from './FeatureFilter'
import { PollingControl } from './PollingControl'
import { ThemeToggle } from './ThemeToggle'
import { Button } from '@/components/ui/button'
import { Plus, Search } from 'lucide-react'

interface HeaderProps {
  selectedProject: string | null
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
  totalTasks?: number
}

export function Header({
  selectedProject,
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
  totalTasks = 0,
}: HeaderProps) {
  return (
    <>
      {/* Main Header */}
      <header className="flex items-center justify-between px-4 pt-5 pb-2 bg-background border-b border-border">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight">
            {selectedProject || 'Vibe Dashboard'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted transition-colors text-primary">
            <Search className="h-5 w-5" />
          </button>
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
        </div>
      </header>

      {/* Stats / Filter Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-background border-b border-border overflow-x-auto hide-scrollbar">
        <div className="flex items-center gap-2">
          {/* Task count pill */}
          <div className="flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            {totalTasks} Tasks
          </div>

          {/* Polling indicator */}
          <PollingControl
            pollingInterval={pollingInterval}
            onIntervalChange={onPollingIntervalChange}
            isPolling={isPolling}
            isLoading={isLoading}
            lastFetch={lastFetch}
            onRefresh={onRefresh}
          />
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-4">
          <FeatureFilter
            features={features}
            selectedFeature={selectedFeature}
            onSelectFeature={onSelectFeature}
          />

          {onNewTask && (
            <Button
              onClick={onNewTask}
              size="sm"
              className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30"
            >
              <Plus className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">New</span>
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
