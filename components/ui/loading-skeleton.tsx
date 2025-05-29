import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface LoadingSkeletonProps {
  className?: string
  count?: number
}

export function WordCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("animate-pulse", className)}>
      <CardHeader className="space-y-2">
        <div className="h-6 bg-muted rounded skeleton" />
        <div className="h-4 bg-muted rounded w-3/4 skeleton" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <div className="h-5 bg-muted rounded w-16 skeleton" />
          <div className="h-5 bg-muted rounded w-20 skeleton" />
        </div>
        <div className="h-4 bg-muted rounded w-full skeleton" />
        <div className="h-4 bg-muted rounded w-2/3 skeleton" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-8 bg-muted rounded w-24 skeleton" />
          <div className="flex gap-1">
            <div className="h-8 w-8 bg-muted rounded skeleton" />
            <div className="h-8 w-8 bg-muted rounded skeleton" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function LoadingSkeleton({ count = 6, className }: LoadingSkeletonProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <WordCardSkeleton key={i} />
      ))}
    </div>
  )
}
