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
import { calculateReadingTime, generateExcerpt } from "@/lib/markdown-utils"

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
    series: "",
    featuredImage: "",
    coverImage: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    isMarkdown: true,
    isContribution: false,
    contributorNotes: "",
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const readingTime = calculateReadingTime(formData.content)
      const excerpt = formData.excerpt || generateExcerpt(formData.content)

      const response = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          excerpt,
          readingTime,
          tags: formData.tags.split(",").map((tag) => tag.trim()),
          seoKeywords: formData.seoKeywords.split(",").map((kw) => kw.trim()),
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
      <div className="container max-w-3xl py-12">
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
                  placeholder="Brief summary of your blog (optional - will be auto-generated if empty)"
                  value={formData.excerpt}
                  onChange={handleChange}
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Content (Markdown supported)</label>
                <Textarea
                  name="content"
                  placeholder="Write your blog content here... Supports Markdown formatting"
                  value={formData.content}
                  onChange={handleChange}
                  rows={12}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="">Select a category</option>
                    <option value="Language">Language</option>
                    <option value="Culture">Culture</option>
                    <option value="Updates">Updates</option>
                    <option value="Tutorials">Tutorials</option>
                    <option value="Learn Balti">Learn Balti</option>
                    <option value="Cultural Articles">Cultural Articles</option>
                    <option value="Community Contributions">Community Contributions</option>
                    <option value="Project Updates">Project Updates</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Series (optional)</label>
                  <Input
                    name="series"
                    placeholder="e.g., Learn Balti Weekly"
                    value={formData.series}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <Input name="tags" placeholder="tag1, tag2, tag3" value={formData.tags} onChange={handleChange} />
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
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cover Image URL</label>
                <Input
                  name="coverImage"
                  placeholder="https://example.com/cover.jpg"
                  value={formData.coverImage}
                  onChange={handleChange}
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">SEO Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">SEO Title (60 chars max)</label>
                    <Input
                      name="seoTitle"
                      placeholder="Optimized title for search engines"
                      value={formData.seoTitle}
                      onChange={handleChange}
                      maxLength={60}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">SEO Description (160 chars max)</label>
                    <Textarea
                      name="seoDescription"
                      placeholder="Optimized description for search engines"
                      value={formData.seoDescription}
                      onChange={handleChange}
                      rows={2}
                      maxLength={160}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">SEO Keywords</label>
                    <Input
                      name="seoKeywords"
                      placeholder="keyword1, keyword2, keyword3"
                      value={formData.seoKeywords}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Community Contribution</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isContribution"
                      checked={formData.isContribution}
                      onChange={handleChange}
                      className="rounded"
                    />
                    <span className="text-sm">This is a community contribution</span>
                  </label>

                  {formData.isContribution && (
                    <Textarea
                      name="contributorNotes"
                      placeholder="Add notes about your contribution..."
                      value={formData.contributorNotes}
                      onChange={handleChange}
                      rows={3}
                    />
                  )}
                </div>
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
