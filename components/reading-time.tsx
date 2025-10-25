import { Clock } from "lucide-react"

interface ReadingTimeProps {
  minutes: number
  className?: string
}

export function ReadingTime({ minutes, className = "" }: ReadingTimeProps) {
  return (
    <div className={`flex items-center gap-1 text-sm text-muted-foreground ${className}`}>
      <Clock className="h-4 w-4" />
      <span>{minutes} min read</span>
    </div>
  )
}
