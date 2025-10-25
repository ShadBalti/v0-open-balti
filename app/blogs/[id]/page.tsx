"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, ArrowLeft, Edit, Trash2 } from "lucide-react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { BlogComments } from "@/components/blog-comments"

interface Blog {
  _id: string
  title: string
  content: string
  excerpt?: string
  author: {
    _id: string
    name: string
    image?: string
    bio?: string
  }
  tags?: string[]
  category?: string
  featuredImage?: string
  views: number
  likes: number
  likedBy?: string[]
  createdAt: string
  updatedAt: string
}

export default function BlogDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(0)

  useEffect(() => {
    fetchBlog()
  }, [params.id])

  const fetchBlog = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/blogs/${params.id}`)
      const data = await response.json()

      if (data.success) {
        setBlog(data.data)
        setLikes(data.data.likes)
        if (session?.user?.id && data.data.likedBy?.includes(session.user.id)) {
          setLiked(true)
        }
      }
    } catch (error) {
      console.error("Error fetching blog:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!session?.user?.id) {
      router.push("/auth/signin")
      return
    }

    try {
      const response = await fetch(`/api/blogs/${params.id}/like`, { method: "POST" })
      const data = await response.json()

      if (data.success) {
        setLiked(data.data.liked)
        setLikes(data.data.likes)
      }
    } catch (error) {
      console.error("Error liking blog:", error)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this blog?")) return

    try {
      const response = await fetch(`/api/blogs/${params.id}`, { method: "DELETE" })
      const data = await response.json()

      if (data.success) {
        router.push("/blogs")
      }
    } catch (error) {
      console.error("Error deleting blog:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading blog...</p>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-muted-foreground mb-4">Blog not found</p>
        <Link href="/blogs">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blogs
          </Button>
        </Link>
      </div>
    )
  }

  const isAuthor = session?.user?.id === blog.author._id

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl py-12">
        {/* Back Button */}
        <Link href="/blogs" className="mb-8 inline-block">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blogs
          </Button>
        </Link>

        {/* Featured Image */}
        {blog.featuredImage && (
          <div className="relative mb-8 h-96 w-full overflow-hidden rounded-lg bg-muted">
            <Image src={blog.featuredImage || "/placeholder.svg"} alt={blog.title} fill className="object-cover" />
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold tracking-tight">{blog.title}</h1>

          {/* Meta Info */}
          <div className="mb-6 flex flex-col gap-4 border-b pb-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              {blog.author.image && (
                <Image
                  src={blog.author.image || "/placeholder.svg"}
                  alt={blog.author.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              )}
              <div>
                <p className="font-semibold">{blog.author.name}</p>
                <p className="text-sm text-muted-foreground">{new Date(blog.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant={liked ? "default" : "outline"} size="sm" onClick={handleLike} className="gap-2">
                <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
                {likes}
              </Button>

              {isAuthor && (
                <>
                  <Link href={`/blogs/${blog._id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="destructive" size="sm" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {blog.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="prose prose-sm dark:prose-invert max-w-none mb-12">
          <div dangerouslySetInnerHTML={{ __html: blog.content }} />
        </div>

        {/* Stats */}
        <div className="mb-12 border-t pt-6">
          <p className="text-sm text-muted-foreground">{blog.views} views</p>
        </div>

        <div className="border-t pt-8">
          <BlogComments blogId={blog._id} />
        </div>
      </div>
    </div>
  )
}
