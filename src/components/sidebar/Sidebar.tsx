import { cn } from '@/lib/utils'
import type { Project } from '@/api/types'
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  User,
  ChevronLeft,
} from 'lucide-react'

interface SidebarProps {
  projects: Project[]
  selectedProject: string | null
  onSelectProject: (project: string) => void
  isLoading?: boolean
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export function Sidebar({
  projects,
  selectedProject,
  onSelectProject,
  isLoading,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        'h-screen flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm shrink-0">
          V
        </div>
        {!collapsed && (
          <span className="text-lg font-bold text-sidebar-foreground tracking-tight">
            Vibe
          </span>
        )}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className={cn(
              'ml-auto p-1 rounded hover:bg-sidebar-accent transition-colors',
              collapsed && 'ml-0'
            )}
          >
            <ChevronLeft
              className={cn(
                'h-4 w-4 text-sidebar-foreground/60 transition-transform',
                collapsed && 'rotate-180'
              )}
            />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {/* Overview item */}
        <div className="mb-4">
          <NavItem
            icon={<LayoutDashboard className="h-5 w-5" />}
            label="Overview"
            active={!selectedProject}
            collapsed={collapsed}
            onClick={() => {}}
          />
        </div>

        {/* Projects section */}
        {!collapsed && (
          <div className="px-2 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
              Projects
            </span>
          </div>
        )}

        <div className="space-y-1">
          {isLoading ? (
            <>
              <SkeletonItem collapsed={collapsed} />
              <SkeletonItem collapsed={collapsed} />
              <SkeletonItem collapsed={collapsed} />
            </>
          ) : (
            projects.map((project) => (
              <NavItem
                key={project.name}
                icon={<FolderKanban className="h-5 w-5" />}
                label={project.name}
                active={selectedProject === project.name}
                collapsed={collapsed}
                onClick={() => onSelectProject(project.name)}
              />
            ))
          )}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="border-t border-sidebar-border py-4 px-2 space-y-1">
        <NavItem
          icon={<Settings className="h-5 w-5" />}
          label="Settings"
          collapsed={collapsed}
        />
        <NavItem
          icon={<User className="h-5 w-5" />}
          label="Account"
          collapsed={collapsed}
        />
      </div>
    </aside>
  )
}

interface NavItemProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  collapsed?: boolean
  onClick?: () => void
}

function NavItem({ icon, label, active, collapsed, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        active
          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        collapsed && 'justify-center px-0'
      )}
      title={collapsed ? label : undefined}
    >
      {icon}
      {!collapsed && <span className="truncate">{label}</span>}
    </button>
  )
}

function SkeletonItem({ collapsed }: { collapsed?: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 animate-pulse',
        collapsed && 'justify-center px-0'
      )}
    >
      <div className="h-5 w-5 rounded bg-sidebar-accent shrink-0" />
      {!collapsed && <div className="h-4 w-24 rounded bg-sidebar-accent" />}
    </div>
  )
}
