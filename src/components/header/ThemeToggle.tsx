import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'

interface ThemeToggleProps {
  isDark: boolean
  onToggle: () => void
}

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  )
}
