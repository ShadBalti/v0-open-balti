import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import ForumReply from "@/models/ForumReply"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    await dbConnect()

    const reply = await ForumReply.findById(params.id)
    if (!reply) {
      return NextResponse.json({ success: false, error: "Reply not found" }, { status: 404 })
    }

    const userId = session.user.id
    const hasLiked = reply.likes.includes(userId)

    if (hasLiked) {
      reply.likes = reply.likes.filter((id: string) => id.toString() !== userId)
    } else {
      reply.likes.push(userId)
    }

    await reply.save()

    return NextResponse.json({ success: true, liked: !hasLiked, likesCount: reply.likes.length })
  } catch (error) {
    console.error("Error toggling reply like:", error)
    return NextResponse.json({ success: false, error: "Failed to toggle like" }, { status: 500 })
  }
}
