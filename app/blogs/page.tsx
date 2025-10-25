import { Suspense } from "react"
import dbConnect from "@/lib/mongodb"
import { Blog } from "@/models/Blog"
import BlogsPageClient from "@/components/blogs-page-client"

async function getInitialBlogs() {
  try {
    await dbConnect()
    const blogs = await Blog.find({ published: true })
      .populate("author", "name image")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    return blogs as Blog[]
  } catch (error) {
    console.error("Error fetching initial blogs:", error)
    return []
  }
}

export default async function BlogsPage() {
  const initialBlogs = await getInitialBlogs()

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12">
        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
            <p className="mt-2 text-muted-foreground">Explore articles about Balti language, culture, and community</p>
          </div>
        </div>

        {/* Client-side search and filtering */}
        <Suspense fallback={<div className="py-12 text-center text-muted-foreground">Loading blogs...</div>}>
          <BlogsPageClient initialBlogs={initialBlogs} />
        </Suspense>
      </div>
    </div>
  )
}
