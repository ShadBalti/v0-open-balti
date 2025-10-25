import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import Blog from "@/models/Blog"
import { logActivity } from "@/lib/activity-logger"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const blog = await Blog.findById(params.id).populate("author", "name image bio")

    if (!blog) {
      return NextResponse.json({ success: false, error: "Blog not found" }, { status: 404 })
    }

    // Increment views
    blog.views += 1
    await blog.save()

    return NextResponse.json({ success: true, data: blog })
  } catch (error) {
    console.error("Error fetching blog:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch blog" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const blog = await Blog.findById(params.id)
    if (!blog) {
      return NextResponse.json({ success: false, error: "Blog not found" }, { status: 404 })
    }

    // Check if user is author or admin
    if (blog.author.toString() !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    const { title, content, excerpt, tags, category, featuredImage, published, featured } = await req.json()

    if (title) blog.title = title
    if (content) blog.content = content
    if (excerpt) blog.excerpt = excerpt
    if (tags) blog.tags = tags
    if (category) blog.category = category
    if (featuredImage) blog.featuredImage = featuredImage
    if (typeof published === "boolean") blog.published = published
    if (typeof featured === "boolean") blog.featured = featured

    const updatedBlog = await blog.save()

    await logActivity({
      userId: session.user.id,
      action: "updated_blog",
      details: `Updated blog: ${title || blog.title}`,
      targetId: blog._id,
      targetType: "blog",
    })

    return NextResponse.json({
      success: true,
      message: "Blog updated successfully",
      data: updatedBlog,
    })
  } catch (error) {
    console.error("Error updating blog:", error)
    return NextResponse.json({ success: false, error: "Failed to update blog" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const blog = await Blog.findById(params.id)
    if (!blog) {
      return NextResponse.json({ success: false, error: "Blog not found" }, { status: 404 })
    }

    // Check if user is author or admin
    if (blog.author.toString() !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    await Blog.findByIdAndDelete(params.id)

    await logActivity({
      userId: session.user.id,
      action: "deleted_blog",
      details: `Deleted blog: ${blog.title}`,
      targetId: blog._id,
      targetType: "blog",
    })

    return NextResponse.json({ success: true, message: "Blog deleted successfully" })
  } catch (error) {
    console.error("Error deleting blog:", error)
    return NextResponse.json({ success: false, error: "Failed to delete blog" }, { status: 500 })
  }
}
