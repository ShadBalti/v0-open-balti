"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { useSession } from "next-auth/react"
import { toast } from "react-toastify"
import { ThumbsUp, Shield, Flag, MessageSquare, Loader2 } from "lucide-react"
import Link from "next/link"

interface WordFeedbackProps {
  wordId: string
}

interface FeedbackStats {
  usefulCount: number
  trustedCount: number
  needsReviewCount: number
  totalFeedback: number
}

interface UserFeedback {
  _id: string
  isUseful: boolean
  isTrusted: boolean
  needsReview: boolean
  comment?: string
}

export default function WordFeedback({ wordId }: WordFeedbackProps) {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<FeedbackStats>({
    usefulCount: 0,
    trustedCount: 0,
    needsReviewCount: 0,
    totalFeedback: 0,
  })
  const [userFeedback, setUserFeedback] = useState<UserFeedback | null>(null)
  const [comment, setComment] = useState("")
  const [showCommentBox, setShowCommentBox] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchFeedback()
  }, [wordId])

  const fetchFeedback = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/words/${wordId}/feedback`)
      const result = await response.json()

      if (result.success) {
        setStats(result.data.stats)
        setUserFeedback(result.data.userFeedback)
        if (result.data.userFeedback?.comment) {
          setComment(result.data.userFeedback.comment)
        }
      }
    } catch (error) {
      console.error("Error fetching feedback:", error)
    } finally {
      setLoading(false)
    }
  }

  const submitFeedback = async (type: "isUseful" | "isTrusted" | "needsReview", value: boolean) => {
    if (status !== "authenticated") {
      toast.error("Please sign in to provide feedback")
      return
    }

    try {
      setSubmitting(true)

      // Prepare the feedback data
      const feedbackData: Record<string, boolean | string | undefined> = {
        [type]: value,
      }

      // Include comment if it exists
      if (comment.trim()) {
        feedbackData.comment = comment
      }

      const response = await fetch(`/api/words/${wordId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(feedbackData),
      })

      const result = await response.json()

      if (result.success) {
        setStats(result.data.stats)
        setUserFeedback(result.data.feedback)
        toast.success("Feedback submitted successfully")
      } else {
        toast.error(result.error || "Failed to submit feedback")
      }
    } catch (error) {
      console.error("Error submitting feedback:", error)
      toast.error("An error occurred while submitting feedback")
    } finally {
      setSubmitting(false)
    }
  }

  const submitComment = async () => {
    if (!userFeedback) {
      toast.error("Please provide feedback before adding a comment")
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch(`/api/words/${wordId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isUseful: userFeedback.isUseful,
          isTrusted: userFeedback.isTrusted,
          needsReview: userFeedback.needsReview,
          comment,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setUserFeedback(result.data.feedback)
        toast.success("Comment submitted successfully")
        setShowCommentBox(false)
      } else {
        toast.error(result.error || "Failed to submit comment")
      }
    } catch (error) {
      console.error("Error submitting comment:", error)
      toast.error("An error occurred while submitting comment")
    } finally {
      setSubmitting(false)
    }
  }

  const toggleFeedback = (type: "isUseful" | "isTrusted" | "needsReview") => {
    if (!userFeedback) {
      submitFeedback(type, true)
    } else {
      submitFeedback(type, !userFeedback[type])
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Community Feedback</CardTitle>
        <CardDescription>Help improve the dictionary by providing feedback on this word</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.totalFeedback > 0 ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ThumbsUp className="h-4 w-4 text-green-500" />
                <span>Useful</span>
              </div>
              <span className="text-sm font-medium">
                {stats.usefulCount} / {stats.totalFeedback}
              </span>
            </div>
            <Progress value={(stats.usefulCount / stats.totalFeedback) * 100} className="h-2" />

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <span>Trusted</span>
              </div>
              <span className="text-sm font-medium">
                {stats.trustedCount} / {stats.totalFeedback}
              </span>
            </div>
            <Progress value={(stats.trustedCount / stats.totalFeedback) * 100} className="h-2" />

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-amber-500" />
                <span>Needs Review</span>
              </div>
              <span className="text-sm font-medium">
                {stats.needsReviewCount} / {stats.totalFeedback}
              </span>
            </div>
            <Progress value={(stats.needsReviewCount / stats.totalFeedback) * 100} className="h-2" />

            <div className="text-sm text-muted-foreground text-center mt-2">
              Based on feedback from {stats.totalFeedback} {stats.totalFeedback === 1 ? "user" : "users"}
            </div>
          </div>
        ) : (
          <div className="text-center py-2 text-muted-foreground">
            No feedback yet. Be the first to provide feedback!
          </div>
        )}

        {status === "authenticated" ? (
          <div className="pt-4 border-t">
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant={userFeedback?.isUseful ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFeedback("isUseful")}
                disabled={submitting}
                className={userFeedback?.isUseful ? "bg-green-600 hover:bg-green-700" : ""}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                Useful
              </Button>
              <Button
                variant={userFeedback?.isTrusted ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFeedback("isTrusted")}
                disabled={submitting}
                className={userFeedback?.isTrusted ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                <Shield className="h-4 w-4 mr-1" />
                Trusted
              </Button>
              <Button
                variant={userFeedback?.needsReview ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFeedback("needsReview")}
                disabled={submitting}
                className={userFeedback?.needsReview ? "bg-amber-600 hover:bg-amber-700" : ""}
              >
                <Flag className="h-4 w-4 mr-1" />
                Needs Review
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCommentBox(!showCommentBox)}
                disabled={submitting || !userFeedback}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                {userFeedback?.comment ? "Edit Comment" : "Add Comment"}
              </Button>
            </div>

            {showCommentBox && (
              <div className="mt-4 space-y-2">
                <Textarea
                  placeholder="Add your comment about this word..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  disabled={submitting}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowCommentBox(false)} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={submitComment} disabled={submitting || !comment.trim()}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Comment"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">Sign in to provide feedback</p>
            <Button asChild size="sm">
              <Link href="/auth/signin?callbackUrl=/words">Sign In</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
