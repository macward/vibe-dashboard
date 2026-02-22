import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
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
  { value: 0, label: 'Manual' },
]

function formatTimeSince(date: Date | null): string {
  if (!date) return ''
  const now = new Date()
  const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diffSecs < 5) return 'just now'
  if (diffSecs < 60) return `${diffSecs}s ago`
  const diffMins = Math.floor(diffSecs / 60)
  return `${diffMins}m ago`
}

export function PollingControl({
  pollingInterval,
  onIntervalChange,
  isPolling,
  isLoading,
  lastFetch,
  onRefresh,
}: PollingControlProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Status indicator */}
      <div className="flex items-center gap-1.5">
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        ) : (
          <span
            className={cn(
              'h-2 w-2 rounded-full',
              isPolling ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            )}
          />
        )}
        <span className="text-xs text-muted-foreground">
          {lastFetch ? formatTimeSince(lastFetch) : ''}
        </span>
      </div>

      {/* Interval selector */}
      <Select
        value={String(pollingInterval)}
        onValueChange={(v) => onIntervalChange(Number(v))}
      >
        <SelectTrigger className="w-[80px] h-8 text-xs">
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
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onRefresh}
        disabled={isLoading}
      >
        <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
      </Button>
    </div>
  )
}
