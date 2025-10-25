import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import BlogComment from "@/models/BlogComment"
import { Types } from "mongoose"

export async function POST(req: NextRequest, { params }: { params: { id: string; commentId: string } }) {
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

    const userId = new Types.ObjectId(session.user.id)
    const hasLiked = comment.likedBy?.some((id) => id.toString() === userId.toString())

    if (hasLiked) {
      // Unlike
      comment.likes -= 1
      comment.likedBy = comment.likedBy?.filter((id) => id.toString() !== userId.toString())
    } else {
      // Like
      comment.likes += 1
      comment.likedBy = [...(comment.likedBy || []), userId]
    }

    await comment.save()

    return NextResponse.json({
      success: true,
      data: { likes: comment.likes, liked: !hasLiked },
    })
  } catch (error) {
    console.error("Error liking comment:", error)
    return NextResponse.json({ success: false, error: "Failed to like comment" }, { status: 500 })
  }
}
