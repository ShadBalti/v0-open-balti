"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Plus, Heart, Eye, Clock, Pin, Lock, Search, TrendingUp, Users, BookOpen } from "lucide-react"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import type { IForumPost } from "@/models/ForumPost"
import Link from "next/link"

const categories = [
  { value: "general", label: "General Discussion", icon: MessageSquare },
  { value: "etymology", label: "Etymology & History", icon: BookOpen },
  { value: "culture", label: "Culture & Traditions", icon: Users },
  { value: "learning", label: "Language Learning", icon: TrendingUp },
  { value: "translation", label: "Translation Help", icon: MessageSquare },
  { value: "dialect", label: "Dialects & Variations", icon: MessageSquare },
]

export function DiscussionForums() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [posts, setPosts] = useState<IForumPost[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewPostDialog, setShowNewPostDialog] = useState(false)
  const [sortBy, setSortBy] = useState("recent")

  // New post form state
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "general",
    tags: [] as string[],
  })
  const [tagInput, setTagInput] = useState("")

  useEffect(() => {
    fetchPosts()
  }, [selectedCategory, sortBy])

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== "all") params.append("category", selectedCategory)
      params.append("sort", sortBy)
      if (searchQuery) params.append("search", searchQuery)

      const response = await fetch(`/api/forum/posts?${params}`)
      const result = await response.json()

      if (result.success) {
        setPosts(result.data)
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchPosts()
  }

  const addTag = () => {
    if (tagInput.trim() && !newPost.tags.includes(tagInput.trim())) {
      setNewPost({
        ...newPost,
        tags: [...newPost.tags, tagInput.trim()],
      })
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setNewPost({
      ...newPost,
      tags: newPost.tags.filter((t) => t !== tag),
    })
  }

  const handleCreatePost = async () => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a post",
        variant: "destructive",
      })
      return
    }

    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both title and content",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/forum/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPost),
      })

      const result = await response.json()

      if (result.success) {
        setPosts([result.data, ...posts])
        setNewPost({ title: "", content: "", category: "general", tags: [] })
        setShowNewPostDialog(false)
        toast({
          title: "Post Created",
          description: "Your discussion post has been created successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create post",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while creating the post",
        variant: "destructive",
      })
    }
  }

  const likePost = async (postId: string) => {
    if (!session) return

    try {
      const response = await fetch(`/api/forum/posts/${postId}/like`, {
        method: "POST",
      })

      if (response.ok) {
        fetchPosts() // Refresh posts to update like count
      }
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  const getCategoryIcon = (category: string) => {
    const cat = categories.find((c) => c.value === category)
    return cat ? cat.icon : MessageSquare
  }

  const getCategoryLabel = (category: string) => {
    const cat = categories.find((c) => c.value === category)
    return cat ? cat.label : category
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Discussion Forums</h1>
          <p className="text-muted-foreground">Connect with the Balti language community and share knowledge</p>
        </div>
        {session && (
          <Dialog open={showNewPostDialog} onOpenChange={setShowNewPostDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Discussion</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    placeholder="What would you like to discuss?"
                    maxLength={200}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={newPost.category}
                    onValueChange={(value) => setNewPost({ ...newPost, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center gap-2">
                            <category.icon className="h-4 w-4" />
                            {category.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Content</label>
                  <Textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    placeholder="Share your thoughts, questions, or insights..."
                    rows={6}
                    maxLength={10000}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Tags</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add tags..."
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" variant="outline" onClick={addTag}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newPost.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowNewPostDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePost}>Create Post</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="flex gap-2">
                <Input
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button variant="outline" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recent</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="active">Most Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-1/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Discussions Found</h3>
              <p className="text-muted-foreground mb-4">Be the first to start a discussion in this category!</p>
              {session && (
                <Button onClick={() => setShowNewPostDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Start Discussion
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => {
            const CategoryIcon = getCategoryIcon(post.category)
            return (
              <Card key={post._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`/api/avatar/${post.author}`} />
                      <AvatarFallback>
                        {typeof post.author === "object" && "name" in post.author
                          ? post.author.name?.charAt(0).toUpperCase()
                          : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {post.isPinned && <Pin className="h-4 w-4 text-primary" />}
                            {post.isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                            <Link href={`/forum/${post._id}`} className="hover:text-primary">
                              <h3 className="font-semibold text-lg cursor-pointer">{post.title}</h3>
                            </Link>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CategoryIcon className="h-4 w-4" />
                            <span>{getCategoryLabel(post.category)}</span>
                            <span>•</span>
                            <span>
                              by{" "}
                              {typeof post.author === "object" && "name" in post.author ? post.author.name : "Unknown"}
                            </span>
                            <span>•</span>
                            <Clock className="h-3 w-3" />
                            <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-muted-foreground line-clamp-2">{post.content}</p>

                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {post.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{post.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{post.replies?.length || 0}</span>
                          </div>
                          <button
                            onClick={() => likePost(post._id)}
                            className="flex items-center gap-1 hover:text-red-500 transition-colors"
                          >
                            <Heart
                              className={`h-4 w-4 ${post.likes?.includes(session?.user?.id) ? "fill-red-500 text-red-500" : ""}`}
                            />
                            <span>{post.likes?.length || 0}</span>
                          </button>
                        </div>
                        <Link href={`/forum/${post._id}`}>
                          <Button variant="outline" size="sm">
                            View Discussion
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
