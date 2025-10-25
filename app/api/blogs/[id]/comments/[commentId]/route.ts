import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import BlogComment from "@/models/BlogComment"

export async function PUT(req: NextRequest, { params }: { params: { id: string; commentId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const comment = await BlogComment.findById(params.commentId)
    if (!comment) {
      return NextResponse.json({ success: false, error: "Comment not found" }, { status: 404 })
    }

    // Check if user is author or admin
    if (comment.author.toString() !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    const { content } = await req.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Comment content is required" }, { status: 400 })
    }

    comment.content = content
    const updatedComment = await comment.save()
    await updatedComment.populate("author", "name image")

    return NextResponse.json({
      success: true,
      message: "Comment updated successfully",
      data: updatedComment,
    })
  } catch (error) {
    console.error("Error updating comment:", error)
    return NextResponse.json({ success: false, error: "Failed to update comment" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string; commentId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const comment = await BlogComment.findById(params.commentId)
    if (!comment) {
      return NextResponse.json({ success: false, error: "Comment not found" }, { status: 404 })
    }

    // Check if user is author or admin
    if (comment.author.toString() !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    await BlogComment.findByIdAndDelete(params.commentId)

    return NextResponse.json({ success: true, message: "Comment deleted successfully" })
  } catch (error) {
    console.error("Error deleting comment:", error)
    return NextResponse.json({ success: false, error: "Failed to delete comment" }, { status: 500 })
  }
}
