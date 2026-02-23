import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Filter } from 'lucide-react'

interface FeatureFilterProps {
  features: string[]
  selectedFeature: string | null
  onSelectFeature: (feature: string | null) => void
}

export function FeatureFilter({
  features,
  selectedFeature,
  onSelectFeature,
}: FeatureFilterProps) {
  if (features.length === 0) return null

  return (
    <Select
      value={selectedFeature || 'all'}
      onValueChange={(value) => onSelectFeature(value === 'all' ? null : value)}
    >
      <SelectTrigger className="h-auto w-auto gap-1 rounded-full bg-transparent px-3 py-1 text-xs font-semibold text-primary border-0 hover:bg-primary/10 transition-colors">
        <Filter className="h-3 w-3" />
        <SelectValue placeholder="Filters" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All features</SelectItem>
        {features.map((feature) => (
          <SelectItem key={feature} value={feature}>
            {feature}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
