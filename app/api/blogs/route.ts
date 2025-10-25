import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import Blog from "@/models/Blog"
import { logActivity } from "@/lib/activity-logger"

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const search = url.searchParams.get("search") || ""
    const category = url.searchParams.get("category")
    const tag = url.searchParams.get("tag")
    const featured = url.searchParams.get("featured")
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")

    await dbConnect()

    const query: any = { published: true }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ]
    }

    if (category) {
      query.category = category
    }

    if (tag) {
      query.tags = tag
    }

    if (featured === "true") {
      query.featured = true
    }

    const skip = (page - 1) * limit
    const blogs = await Blog.find(query)
      .populate("author", "name image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Blog.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: blogs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching blogs:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch blogs" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { title, content, excerpt, tags, category, featuredImage, published } = await req.json()

    if (!title || !content) {
      return NextResponse.json({ success: false, error: "Title and content are required" }, { status: 400 })
    }

    await dbConnect()

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")

    // Check if slug already exists
    const existingBlog = await Blog.findOne({ slug })
    if (existingBlog) {
      return NextResponse.json({ success: false, error: "A blog with this title already exists" }, { status: 409 })
    }

    const newBlog = await Blog.create({
      title,
      slug,
      content,
      excerpt,
      tags,
      category,
      featuredImage,
      published: published || false,
      author: session.user.id,
    })

    await logActivity({
      userId: session.user.id,
      action: "created_blog",
      details: `Created new blog: ${title}`,
      targetId: newBlog._id,
      targetType: "blog",
    })

    return NextResponse.json({
      success: true,
      message: "Blog created successfully",
      data: newBlog,
    })
  } catch (error) {
    console.error("Error creating blog:", error)
    return NextResponse.json({ success: false, error: "Failed to create blog" }, { status: 500 })
  }
}
