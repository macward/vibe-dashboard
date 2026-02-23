export function TaskCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl bg-card p-4 border border-border shadow-sm">
      {/* Category tag skeleton */}
      <div className="mb-2">
        <div className="h-5 w-16 bg-muted rounded-lg" />
      </div>

      {/* Title skeleton */}
      <div className="h-4 w-full bg-muted rounded mb-1" />
      <div className="h-4 w-3/4 bg-muted rounded mb-3" />

      {/* Description skeleton */}
      <div className="h-3 w-full bg-muted rounded mb-1" />
      <div className="h-3 w-2/3 bg-muted rounded mb-3" />

      {/* Tags skeleton */}
      <div className="flex gap-1.5">
        <div className="h-5 w-12 bg-muted rounded-md" />
        <div className="h-5 w-16 bg-muted rounded-md" />
      </div>
    </div>
  )
}
