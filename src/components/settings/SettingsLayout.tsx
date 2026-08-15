import { Outlet, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { SettingsSidebar } from './SettingsSidebar'

export function SettingsLayout() {
  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <aside className="h-screen w-60 flex flex-col bg-sidebar border-r border-sidebar-border shrink-0">
        <div className="px-4 py-5 border-b border-sidebar-border">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al dashboard
          </Link>
        </div>
        <div className="px-4 py-3">
          <h2 className="text-lg font-bold text-sidebar-foreground tracking-tight">
            Settings
          </h2>
        </div>
        <SettingsSidebar />
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
