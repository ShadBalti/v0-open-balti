import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import BlogComment from "@/models/BlogComment"
import Blog from "@/models/Blog"
import { logActivity } from "@/lib/activity-logger"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const url = new URL(req.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")

    await dbConnect()

    const skip = (page - 1) * limit
    const comments = await BlogComment.find({ blog: params.id })
      .populate("author", "name image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await BlogComment.countDocuments({ blog: params.id })

    return NextResponse.json({
      success: true,
      data: comments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch comments" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { content } = await req.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Comment content is required" }, { status: 400 })
    }

    await dbConnect()

    // Verify blog exists
    const blog = await Blog.findById(params.id)
    if (!blog) {
      return NextResponse.json({ success: false, error: "Blog not found" }, { status: 404 })
    }

    const newComment = await BlogComment.create({
      blog: params.id,
      author: session.user.id,
      content,
    })

    await newComment.populate("author", "name image")

    await logActivity({
      userId: session.user.id,
      action: "commented_blog",
      details: `Commented on blog: ${blog.title}`,
      targetId: params.id,
      targetType: "blog",
    })

    return NextResponse.json({
      success: true,
      message: "Comment added successfully",
      data: newComment,
    })
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ success: false, error: "Failed to create comment" }, { status: 500 })
  }
}
