"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Heart, Reply, MoreVertical, Edit, Trash, Clock } from "lucide-react"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import type { IForumReply } from "@/models/ForumReply"

interface ThreadedRepliesProps {
  postId: string
  replies: IForumReply[]
  onReplyAdded: (reply: IForumReply) => void
  onReplyUpdated: () => void
}

interface ReplyItemProps {
  reply: IForumReply
  postId: string
  level: number
  onReplyAdded: (reply: IForumReply) => void
  onReplyUpdated: () => void
}

function ReplyItem({ reply, postId, level, onReplyAdded, onReplyUpdated }: ReplyItemProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [submittingReply, setSubmittingReply] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(reply.content)

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
          parentReplyId: reply._id,
        }),
      })

      const result = await response.json()

      if (result.success) {
        onReplyAdded(result.data)
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

  const likeReply = async () => {
    if (!session) return

    try {
      const response = await fetch(`/api/forum/replies/${reply._id}/like`, {
        method: "POST",
      })

      if (response.ok) {
        onReplyUpdated()
      }
    } catch (error) {
      console.error("Error liking reply:", error)
    }
  }

  const handleEdit = async () => {
    if (!editContent.trim()) {
      toast({
        title: "Missing Content",
        description: "Reply content cannot be empty",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/forum/replies/${reply._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: editContent,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setIsEditing(false)
        onReplyUpdated()
        toast({
          title: "Reply Updated",
          description: "Your reply has been updated successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update reply",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while updating your reply",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this reply?")) return

    try {
      const response = await fetch(`/api/forum/replies/${reply._id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        onReplyUpdated()
        toast({
          title: "Reply Deleted",
          description: "Your reply has been deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete reply",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting your reply",
        variant: "destructive",
      })
    }
  }

  const isAuthor = session?.user?.id === reply.author._id
  const canReply = session && level < 5 // Max 5 levels deep

  return (
    <div className={`${level > 0 ? "ml-8 border-l-2 border-muted pl-4" : ""}`}>
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Author and timestamp */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`/api/avatar/${reply.author._id}`} />
                  <AvatarFallback>{reply.author.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{reply.author.name}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatDistanceToNow(new Date(reply.createdAt))} ago</span>
                    {reply.isEdited && <span>• edited</span>}
                  </div>
                </div>
              </div>
              {isAuthor && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Content */}
            {isEditing ? (
              <div className="space-y-3">
                <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={3} />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleEdit}>
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={likeReply}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors"
              >
                <Heart
                  className={`h-3 w-3 ${reply.likes?.includes(session?.user?.id) ? "fill-red-500 text-red-500" : ""}`}
                />
                <span>{reply.likes?.length || 0}</span>
              </button>
              {canReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="text-xs h-6 px-2"
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              )}
            </div>

            {/* Reply Form */}
            {showReplyForm && session && (
              <div className="space-y-3 pt-3 border-t">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write your reply..."
                  rows={3}
                  className="text-sm"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowReplyForm(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleReply} disabled={submittingReply}>
                    {submittingReply ? "Posting..." : "Reply"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function ThreadedReplies({ postId, replies, onReplyAdded, onReplyUpdated }: ThreadedRepliesProps) {
  // Build a tree structure from flat replies array
  const buildReplyTree = (replies: IForumReply[]) => {
    const replyMap = new Map<string, IForumReply & { children: IForumReply[] }>()
    const rootReplies: (IForumReply & { children: IForumReply[] })[] = []

    // Initialize all replies with children array
    replies.forEach((reply) => {
      replyMap.set(reply._id, { ...reply, children: [] })
    })

    // Build the tree
    replies.forEach((reply) => {
      const replyWithChildren = replyMap.get(reply._id)!

      if (reply.parentReply) {
        const parent = replyMap.get(reply.parentReply.toString())
        if (parent) {
          parent.children.push(replyWithChildren)
        } else {
          // Parent not found, treat as root
          rootReplies.push(replyWithChildren)
        }
      } else {
        rootReplies.push(replyWithChildren)
      }
    })

    return rootReplies
  }

  const renderReplyTree = (replies: (IForumReply & { children: IForumReply[] })[], level = 0) => {
    return replies.map((reply) => (
      <div key={reply._id}>
        <ReplyItem
          reply={reply}
          postId={postId}
          level={level}
          onReplyAdded={onReplyAdded}
          onReplyUpdated={onReplyUpdated}
        />
        {reply.children.length > 0 && <div className="ml-4">{renderReplyTree(reply.children, level + 1)}</div>}
      </div>
    ))
  }

  const replyTree = buildReplyTree(replies)

  if (replies.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No replies yet. Be the first to join the discussion!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Replies ({replies.length})</h3>
      <div className="space-y-4">{renderReplyTree(replyTree)}</div>
    </div>
  )
}
