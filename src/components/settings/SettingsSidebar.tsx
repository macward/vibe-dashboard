import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const SETTINGS_SECTIONS = [
  { to: '/settings/profile', label: 'Perfil y cuenta' },
  { to: '/settings/notifications', label: 'Notificaciones' },
  { to: '/settings/security', label: 'Seguridad y acceso' },
  { to: '/settings/workspace', label: 'Workspace' },
]

export function SettingsSidebar() {
  return (
    <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
      {SETTINGS_SECTIONS.map((section) => (
        <NavLink
          key={section.to}
          to={section.to}
          className={({ isActive }) =>
            cn(
              'flex items-center w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )
          }
        >
          {section.label}
        </NavLink>
      ))}
    </nav>
  )
}
