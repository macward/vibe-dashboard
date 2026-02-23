import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RefreshCw, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PollingControlProps {
  pollingInterval: number
  onIntervalChange: (interval: number) => void
  isPolling: boolean
  isLoading: boolean
  lastFetch: Date | null
  onRefresh: () => void
}

const INTERVALS = [
  { value: 5000, label: '5s' },
  { value: 10000, label: '10s' },
  { value: 30000, label: '30s' },
  { value: 0, label: 'Off' },
]

export function PollingControl({
  pollingInterval,
  onIntervalChange,
  isPolling,
  isLoading,
  onRefresh,
}: PollingControlProps) {
  return (
    <div className="flex items-center gap-1">
      {/* Status indicator + interval selector combined */}
      <Select
        value={String(pollingInterval)}
        onValueChange={(v) => onIntervalChange(Number(v))}
      >
        <SelectTrigger className="h-auto w-auto gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <span
              className={cn(
                'size-1.5 rounded-full',
                isPolling ? 'bg-emerald-500' : 'bg-slate-400'
              )}
            />
          )}
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {INTERVALS.map((interval) => (
            <SelectItem key={interval.value} value={String(interval.value)}>
              {interval.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Manual refresh button */}
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
      >
        <RefreshCw className={cn('h-3 w-3', isLoading && 'animate-spin')} />
      </button>
    </div>
  )
}
