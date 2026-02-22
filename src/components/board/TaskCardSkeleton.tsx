import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function TaskCardSkeleton() {
  return (
    <Card className="animate-pulse py-0 gap-0">
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="h-4 w-8 bg-muted rounded" />
          <div className="h-4 w-12 bg-muted rounded" />
        </div>
      </CardHeader>
      <CardContent className="pb-3 px-4 pt-0">
        <div className="h-4 w-full bg-muted rounded mb-2" />
        <div className="h-4 w-3/4 bg-muted rounded mb-3" />
        <div className="flex items-center justify-between">
          <div className="h-3 w-12 bg-muted rounded" />
          <div className="h-3 w-16 bg-muted rounded" />
        </div>
      </CardContent>
    </Card>
  )
}
