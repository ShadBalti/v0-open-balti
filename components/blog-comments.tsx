"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Trash2, Edit2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface Comment {
  _id: string
  content: string
  author: {
    _id: string
    name: string
    image?: string
  }
  likes: number
  likedBy?: string[]
  createdAt: string
}

interface BlogCommentsProps {
  blogId: string
}

export function BlogComments({ blogId }: BlogCommentsProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")

  useEffect(() => {
    fetchComments()
  }, [blogId])

  const fetchComments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/blogs/${blogId}/comments`)
      const data = await response.json()

      if (data.success) {
        setComments(data.data)
      }
    } catch (error) {
      console.error("Error fetching comments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user?.id) {
      router.push("/auth/signin")
      return
    }

    if (!newComment.trim()) return

    try {
      setSubmitting(true)
      const response = await fetch(`/api/blogs/${blogId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      })

      const data = await response.json()

      if (data.success) {
        setComments([data.data, ...comments])
        setNewComment("")
      }
    } catch (error) {
      console.error("Error submitting comment:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleLikeComment = async (commentId: string) => {
    if (!session?.user?.id) {
      router.push("/auth/signin")
      return
    }

    try {
      const response = await fetch(`/api/blogs/${blogId}/comments/${commentId}/like`, {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        setComments(
          comments.map((comment) =>
            comment._id === commentId
              ? {
                  ...comment,
                  likes: data.data.likes,
                  likedBy: data.data.liked
                    ? [...(comment.likedBy || []), session.user.id]
                    : (comment.likedBy || []).filter((id) => id !== session.user.id),
                }
              : comment,
          ),
        )
      }
    } catch (error) {
      console.error("Error liking comment:", error)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Delete this comment?")) return

    try {
      const response = await fetch(`/api/blogs/${blogId}/comments/${commentId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        setComments(comments.filter((comment) => comment._id !== commentId))
      }
    } catch (error) {
      console.error("Error deleting comment:", error)
    }
  }

  const handleUpdateComment = async (commentId: string) => {
    if (!editContent.trim()) return

    try {
      const response = await fetch(`/api/blogs/${blogId}/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      })

      const data = await response.json()

      if (data.success) {
        setComments(comments.map((comment) => (comment._id === commentId ? data.data : comment)))
        setEditingId(null)
        setEditContent("")
      }
    } catch (error) {
      console.error("Error updating comment:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Comments ({comments.length})</h3>

        {/* Comment Form */}
        {session ? (
          <form onSubmit={handleSubmitComment} className="mb-6 space-y-3">
            <Textarea
              placeholder="Share your thoughts..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <Button type="submit" disabled={submitting || !newComment.trim()}>
              {submitting ? "Posting..." : "Post Comment"}
            </Button>
          </form>
        ) : (
          <Card className="mb-6 bg-muted">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-3">Sign in to comment</p>
              <Button onClick={() => router.push("/auth/signin")} size="sm">
                Sign In
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Comments List */}
        {loading ? (
          <p className="text-muted-foreground">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <Card key={comment._id}>
                <CardContent className="pt-6">
                  {/* Comment Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {comment.author.image && (
                        <Image
                          src={comment.author.image || "/placeholder.svg"}
                          alt={comment.author.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-sm">{comment.author.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    {session?.user?.id === comment.author._id && (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingId(comment._id)
                            setEditContent(comment.content)
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteComment(comment._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Comment Content */}
                  {editingId === comment._id ? (
                    <div className="space-y-3 mb-3">
                      <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={3} />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateComment(comment._id)}
                          disabled={!editContent.trim()}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingId(null)
                            setEditContent("")
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm mb-3 whitespace-pre-wrap">{comment.content}</p>
                  )}

                  {/* Like Button */}
                  <Button variant="ghost" size="sm" onClick={() => handleLikeComment(comment._id)} className="gap-2">
                    <Heart
                      className={`h-4 w-4 ${
                        comment.likedBy?.includes(session?.user?.id || "") ? "fill-current text-red-500" : ""
                      }`}
                    />
                    {comment.likes}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
