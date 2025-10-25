"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Heart } from "lucide-react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { ReadingTime } from "@/components/reading-time"

interface Blog {
  _id: string
  title: string
  excerpt?: string
  content: string
  author: {
    _id: string
    name: string
    image?: string
  }
  tags?: string[]
  category?: string
  series?: string
  featured?: boolean
  featuredImage?: string
  coverImage?: string
  views: number
  likes: number
  readingTime?: number
  createdAt: string
}

export default function BlogsPage() {
  const { data: session } = useSession()
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchBlogs()
  }, [search, category, page])

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (category) params.append("category", category)
      params.append("page", page.toString())

      const response = await fetch(`/api/blogs?${params}`)
      const data = await response.json()

      if (data.success) {
        setBlogs(data.data)
      }
    } catch (error) {
      console.error("Error fetching blogs:", error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    "Language",
    "Culture",
    "Updates",
    "Tutorials",
    "Learn Balti",
    "Cultural Articles",
    "Community Contributions",
    "Project Updates",
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12">
        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
            <p className="mt-2 text-muted-foreground">Explore articles about Balti language, culture, and community</p>
          </div>
          {session && (
            <Link href="/blogs/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Write Blog
              </Button>
            </Link>
          )}
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search blogs..."
              className="pl-10"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={category === "" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setCategory("")
                setPage(1)
              }}
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={category === cat ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setCategory(cat)
                  setPage(1)
                }}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Blogs Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading blogs...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No blogs found</p>
            {session && (
              <Link href="/blogs/create">
                <Button className="mt-4">Create First Blog</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <Link key={blog._id} href={`/blogs/${blog._id}`}>
                <Card className="h-full transition-all hover:shadow-lg">
                  {(blog.coverImage || blog.featuredImage) && (
                    <div className="relative h-48 w-full overflow-hidden rounded-t-lg bg-muted">
                      <Image
                        src={blog.coverImage || blog.featuredImage || "/placeholder.svg"}
                        alt={blog.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{blog.title}</CardTitle>
                    <CardDescription>
                      By {blog.author.name} •{" "}
                      {new Date(blog.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {blog.excerpt && <p className="line-clamp-2 text-sm text-muted-foreground">{blog.excerpt}</p>}

                    <div className="flex flex-col gap-2">
                      {blog.readingTime && <ReadingTime minutes={blog.readingTime} />}
                      {blog.series && (
                        <Badge variant="outline" className="w-fit text-xs">
                          {blog.series}
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {blog.tags?.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{blog.views} views</span>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {blog.likes}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
