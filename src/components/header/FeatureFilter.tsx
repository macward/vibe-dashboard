import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
      <SelectTrigger className="w-[160px]">
        <SelectValue placeholder="All features" />
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
