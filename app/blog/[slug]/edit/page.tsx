"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { calculateReadingTime, generateExcerpt } from "@/lib/markdown-utils"
import MDEditor from "@uiw/react-md-editor"
import "@uiw/react-md-editor/markdown-editor.css"
import "@uiw/react-markdown-preview/markdown.css"

interface BlogFormData {
  title: string
  excerpt: string
  content: string
  tags: string
  category: string
  series: string
  featuredImage: string
  coverImage: string
  seoTitle: string
  seoDescription: string
  seoKeywords: string
  isMarkdown: boolean
  isContribution: boolean
  contributorNotes: string
  published: boolean
}

export default function EditBlogPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<BlogFormData>({
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
    published: false,
  })
  const [blogId, setBlogId] = useState<string>("")

  useEffect(() => {
    if (!session) return
    fetchBlog()
  }, [session, params.slug])

  const fetchBlog = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/blogs/by-slug/${params.slug}`)
      const data = await response.json()

      if (data.success) {
        const blog = data.data
        setBlogId(blog._id)

        // Check if user is author
        if (session?.user?.id !== blog.author._id) {
          router.push("/blogs")
          return
        }

        setFormData({
          title: blog.title,
          excerpt: blog.excerpt || "",
          content: blog.content,
          tags: blog.tags?.join(", ") || "",
          category: blog.category || "",
          series: blog.series || "",
          featuredImage: blog.featuredImage || "",
          coverImage: blog.coverImage || "",
          seoTitle: blog.seoTitle || blog.title,
          seoDescription: blog.seoDescription || blog.excerpt || "",
          seoKeywords: blog.seoKeywords?.join(", ") || "",
          isMarkdown: blog.isMarkdown !== false,
          isContribution: blog.isContribution || false,
          contributorNotes: blog.contributorNotes || "",
          published: blog.published || false,
        })
      }
    } catch (error) {
      console.error("Error fetching blog:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleContentChange = (value?: string) => {
    setFormData((prev) => ({
      ...prev,
      content: value || "",
    }))
  }

  const handleAutoFillSEO = () => {
    setFormData((prev) => ({
      ...prev,
      seoTitle: prev.title,
      seoDescription: prev.excerpt || generateExcerpt(prev.content),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const readingTime = calculateReadingTime(formData.content)
      const excerpt = formData.excerpt || generateExcerpt(formData.content)

      const response = await fetch(`/api/blogs/${blogId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          excerpt,
          readingTime,
          tags: formData.tags.split(",").map((tag) => tag.trim()),
          seoKeywords: formData.seoKeywords.split(",").map((kw) => kw.trim()),
        }),
      })

      const data = await response.json()

      if (data.success) {
        router.push(`/blog/${params.slug}`)
      } else {
        alert(data.error || "Failed to update blog")
      }
    } catch (error) {
      console.error("Error updating blog:", error)
      alert("Failed to update blog")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading blog...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-12">
        <Link href={`/blog/${params.slug}`} className="mb-8 inline-block">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Edit Blog</CardTitle>
            <CardDescription>Update your blog post</CardDescription>
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
                <label className="block text-sm font-medium mb-2">Content (Markdown)</label>
                <div data-color-mode="light" className="rounded-md border">
                  <MDEditor
                    value={formData.content}
                    onChange={handleContentChange}
                    height={400}
                    preview="live"
                    hideToolbar={false}
                    visibleDragbar={true}
                  />
                </div>
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
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">SEO Settings</h3>
                  <Button type="button" variant="outline" size="sm" onClick={handleAutoFillSEO}>
                    Auto-fill from Title & Excerpt
                  </Button>
                </div>
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
                    <p className="text-xs text-muted-foreground mt-1">{formData.seoTitle.length}/60</p>
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
                    <p className="text-xs text-muted-foreground mt-1">{formData.seoDescription.length}/160</p>
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
                <h3 className="font-semibold mb-4">Publishing</h3>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="published"
                    checked={formData.published}
                    onChange={handleChange}
                    className="rounded"
                  />
                  <span className="text-sm">Publish this blog</span>
                </label>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Link href={`/blog/${params.slug}`}>
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
