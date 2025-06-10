"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { MessageSquare, Heart, Clock, Pin, Lock, Reply } from "lucide-react"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { ThreadedReplies } from "./threaded-replies"
import type { IForumPost } from "@/models/ForumPost"
import type { IForumReply } from "@/models/ForumReply"

interface ForumPostDetailProps {
  postId: string
}

export function ForumPostDetail({ postId }: ForumPostDetailProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [post, setPost] = useState<IForumPost | null>(null)
  const [replies, setReplies] = useState<IForumReply[]>([])
  const [loading, setLoading] = useState(true)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [submittingReply, setSubmittingReply] = useState(false)

  useEffect(() => {
    fetchPost()
    fetchReplies()
  }, [postId])

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/forum/posts/${postId}`)
      const result = await response.json()

      if (result.success) {
        setPost(result.data)
      }
    } catch (error) {
      console.error("Error fetching post:", error)
    }
  }

  const fetchReplies = async () => {
    try {
      const response = await fetch(`/api/forum/posts/${postId}/replies`)
      const result = await response.json()

      if (result.success) {
        setReplies(result.data)
      }
    } catch (error) {
      console.error("Error fetching replies:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async () => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to reply",
        variant: "destructive",
      })
      return
    }

    if (!replyContent.trim()) {
      toast({
        title: "Missing Content",
        description: "Please enter your reply",
        variant: "destructive",
      })
      return
    }

    setSubmittingReply(true)

    try {
      const response = await fetch(`/api/forum/posts/${postId}/replies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: replyContent,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setReplies([...replies, result.data])
        setReplyContent("")
        setShowReplyForm(false)
        toast({
          title: "Reply Posted",
          description: "Your reply has been posted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to post reply",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while posting your reply",
        variant: "destructive",
      })
    } finally {
      setSubmittingReply(false)
    }
  }

  const likePost = async () => {
    if (!session) return

    try {
      const response = await fetch(`/api/forum/posts/${postId}/like`, {
        method: "POST",
      })

      if (response.ok) {
        fetchPost() // Refresh post to update like count
      }
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  const getCategoryIcon = (category: string) => {
    // Same logic as in DiscussionForums component
    return MessageSquare
  }

  const getCategoryLabel = (category: string) => {
    const categories = {
      general: "General Discussion",
      etymology: "Etymology & History",
      culture: "Culture & Traditions",
      learning: "Language Learning",
      translation: "Translation Help",
      dialect: "Dialects & Variations",
    }
    return categories[category as keyof typeof categories] || category
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-20 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!post) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <h3 className="text-lg font-semibold mb-2">Post Not Found</h3>
          <p className="text-muted-foreground">The discussion you're looking for doesn't exist or has been removed.</p>
        </CardContent>
      </Card>
    )
  }

  const CategoryIcon = getCategoryIcon(post.category)

  return (
    <div className="space-y-6">
      {/* Post Content */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {post.isPinned && <Pin className="h-4 w-4 text-primary" />}
                  {post.isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                  <h1 className="text-2xl font-bold">{post.title}</h1>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CategoryIcon className="h-4 w-4" />
                  <span>{getCategoryLabel(post.category)}</span>
                  <span>•</span>
                  <Clock className="h-3 w-3" />
                  <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                </div>
              </div>
            </div>

            {/* Author Info */}
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={`/api/avatar/${post.author}`} />
                <AvatarFallback>
                  {typeof post.author === "object" && "name" in post.author
                    ? post.author.name?.charAt(0).toUpperCase()
                    : "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {typeof post.author === "object" && "name" in post.author ? post.author.name : "Unknown User"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {typeof post.author === "object" && "email" in post.author ? post.author.email : ""}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <Separator />

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={likePost}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-red-500 transition-colors"
                >
                  <Heart
                    className={`h-4 w-4 ${post.likes?.includes(session?.user?.id) ? "fill-red-500 text-red-500" : ""}`}
                  />
                  <span>{post.likes?.length || 0} likes</span>
                </button>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  <span>{replies.length} replies</span>
                </div>
              </div>
              {session && !post.isLocked && (
                <Button variant="outline" size="sm" onClick={() => setShowReplyForm(!showReplyForm)}>
                  <Reply className="h-4 w-4 mr-2" />
                  Reply
                </Button>
              )}
            </div>

            {/* Reply Form */}
            {showReplyForm && session && (
              <div className="space-y-3 pt-4 border-t">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write your reply..."
                  rows={4}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowReplyForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleReply} disabled={submittingReply}>
                    {submittingReply ? "Posting..." : "Post Reply"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Replies */}
      <ThreadedReplies
        postId={postId}
        replies={replies}
        onReplyAdded={(newReply) => setReplies([...replies, newReply])}
        onReplyUpdated={fetchReplies}
      />
    </div>
  )
}
