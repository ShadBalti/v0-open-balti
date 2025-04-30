import { ThumbsUp, Shield, Flag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface FeedbackBadgesProps {
  feedbackStats?: {
    usefulCount: number
    trustedCount: number
    needsReviewCount: number
    totalFeedback: number
  }
  size?: "sm" | "md"
}

export default function FeedbackBadges({ feedbackStats, size = "md" }: FeedbackBadgesProps) {
  if (!feedbackStats || feedbackStats.totalFeedback === 0) {
    return null
  }

  const isSmall = size === "sm"
  const iconSize = isSmall ? "h-3 w-3" : "h-4 w-4"
  const textSize = isSmall ? "text-xs" : "text-sm"
  const badgeClass = isSmall ? "px-1.5 py-0" : ""

  // Calculate percentages
  const usefulPercent = Math.round((feedbackStats.usefulCount / feedbackStats.totalFeedback) * 100)
  const trustedPercent = Math.round((feedbackStats.trustedCount / feedbackStats.totalFeedback) * 100)
  const needsReviewPercent = Math.round((feedbackStats.needsReviewCount / feedbackStats.totalFeedback) * 100)

  // Only show badges that have at least one vote
  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-1">
        {feedbackStats.usefulCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className={`bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 ${badgeClass}`}
              >
                <ThumbsUp className={`${iconSize} mr-1`} />
                <span className={textSize}>{usefulPercent}%</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {feedbackStats.usefulCount} of {feedbackStats.totalFeedback} users find this word useful
              </p>
            </TooltipContent>
          </Tooltip>
        )}

        {feedbackStats.trustedCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className={`bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 ${badgeClass}`}
              >
                <Shield className={`${iconSize} mr-1`} />
                <span className={textSize}>{trustedPercent}%</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {feedbackStats.trustedCount} of {feedbackStats.totalFeedback} users trust this word
              </p>
            </TooltipContent>
          </Tooltip>
        )}

        {feedbackStats.needsReviewCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className={`bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 ${badgeClass}`}
              >
                <Flag className={`${iconSize} mr-1`} />
                <span className={textSize}>{needsReviewPercent}%</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {feedbackStats.needsReviewCount} of {feedbackStats.totalFeedback} users think this word needs review
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}
