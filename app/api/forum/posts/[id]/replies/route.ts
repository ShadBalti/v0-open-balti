import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import ForumReply from "@/models/ForumReply"
import ForumPost from "@/models/ForumPost"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const replies = await ForumReply.find({ postId: params.id })
      .populate("author", "name email")
      .sort({ replyPath: 1, createdAt: 1 })

    return NextResponse.json({ success: true, data: replies })
  } catch (error) {
    console.error("Error fetching replies:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch replies" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    await dbConnect()

    const body = await req.json()
    const { content, parentReplyId } = body

    if (!content?.trim()) {
      return NextResponse.json({ success: false, error: "Content is required" }, { status: 400 })
    }

    // Check if post exists
    const post = await ForumPost.findById(params.id)
    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 })
    }

    let level = 0
    let replyPath = ""

    if (parentReplyId) {
      const parentReply = await ForumReply.findById(parentReplyId)
      if (!parentReply) {
        return NextResponse.json({ success: false, error: "Parent reply not found" }, { status: 404 })
      }

      level = Math.min(parentReply.level + 1, 5) // Max 5 levels deep
      replyPath = parentReply.replyPath ? `${parentReply.replyPath}.${parentReplyId}` : parentReplyId
    }

    const reply = await ForumReply.create({
      content: content.trim(),
      author: session.user.id,
      postId: params.id,
      parentReply: parentReplyId || undefined,
      level,
      replyPath,
    })

    // Update post's replies array and last activity
    await ForumPost.findByIdAndUpdate(params.id, {
      $push: { replies: reply._id },
      lastActivity: new Date(),
    })

    const populatedReply = await ForumReply.findById(reply._id).populate("author", "name email")

    return NextResponse.json({ success: true, data: populatedReply })
  } catch (error) {
    console.error("Error creating reply:", error)
    return NextResponse.json({ success: false, error: "Failed to create reply" }, { status: 500 })
  }
}
