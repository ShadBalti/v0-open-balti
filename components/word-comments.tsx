"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, MessageSquare } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface WordCommentsProps {
  wordId: string
}

interface Comment {
  _id: string
  userId: {
    _id: string
    name: string
    image: string
  }
  comment: string
  createdAt: string
}

export default function WordComments({ wordId }: WordCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchComments()
  }, [wordId])

  const fetchComments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/words/${wordId}/comments`)
      const result = await response.json()

      if (result.success) {
        setComments(result.data)
      }
    } catch (error) {
      console.error("Error fetching comments:", error)
    } finally {
      setLoading(false)
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
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Community Comments
        </CardTitle>
        <CardDescription>
          {comments.length > 0
            ? `${comments.length} comment${comments.length === 1 ? "" : "s"} from the community`
            : "No comments yet"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment._id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.userId.image || "/placeholder.svg"} alt={comment.userId.name} />
                  <AvatarFallback>
                    {comment.userId.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{comment.userId.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <p className="text-sm mt-1">{comment.comment}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p>No comments yet. Be the first to comment on this word!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
