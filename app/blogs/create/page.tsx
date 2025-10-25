"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreateBlogPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    tags: "",
    category: "",
    featuredImage: "",
  })

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-muted-foreground mb-4">Please sign in to create a blog</p>
        <Link href="/auth/signin">
          <Button>Sign In</Button>
        </Link>
      </div>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(",").map((tag) => tag.trim()),
          published: false,
        }),
      })

      const data = await response.json()

      if (data.success) {
        router.push(`/blogs/${data.data._id}`)
      } else {
        alert(data.error || "Failed to create blog")
      }
    } catch (error) {
      console.error("Error creating blog:", error)
      alert("Failed to create blog")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl py-12">
        <Link href="/blogs" className="mb-8 inline-block">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blogs
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Create New Blog</CardTitle>
            <CardDescription>Share your thoughts about Balti language and culture</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <Input name="title" placeholder="Blog title" value={formData.title} onChange={handleChange} required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Excerpt</label>
                <Textarea
                  name="excerpt"
                  placeholder="Brief summary of your blog"
                  value={formData.excerpt}
                  onChange={handleChange}
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <Textarea
                  name="content"
                  placeholder="Write your blog content here..."
                  value={formData.content}
                  onChange={handleChange}
                  rows={10}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <Input
                    name="category"
                    placeholder="e.g., Culture, Language"
                    value={formData.category}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <Input name="tags" placeholder="tag1, tag2, tag3" value={formData.tags} onChange={handleChange} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Featured Image URL</label>
                <Input
                  name="featuredImage"
                  placeholder="https://example.com/image.jpg"
                  value={formData.featuredImage}
                  onChange={handleChange}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Blog"}
                </Button>
                <Link href="/blogs">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
