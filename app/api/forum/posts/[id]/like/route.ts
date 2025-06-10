import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import ForumPost from "@/models/ForumPost"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    await dbConnect()

    const post = await ForumPost.findById(params.id)
    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 })
    }

    const userId = session.user.id
    const hasLiked = post.likes.includes(userId)

    if (hasLiked) {
      // Remove like
      post.likes = post.likes.filter((id: string) => id.toString() !== userId)
    } else {
      // Add like
      post.likes.push(userId)
    }

    await post.save()

    return NextResponse.json({
      success: true,
      data: {
        liked: !hasLiked,
        likeCount: post.likes.length,
      },
    })
  } catch (error) {
    console.error("Error toggling post like:", error)
    return NextResponse.json({ success: false, error: "Failed to toggle like" }, { status: 500 })
  }
}
