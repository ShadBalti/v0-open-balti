import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import Blog from "@/models/Blog"
import { Types } from "mongoose"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
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

    const userId = new Types.ObjectId(session.user.id)
    const hasLiked = blog.likedBy?.some((id) => id.toString() === userId.toString())

    if (hasLiked) {
      // Unlike
      blog.likes -= 1
      blog.likedBy = blog.likedBy?.filter((id) => id.toString() !== userId.toString())
    } else {
      // Like
      blog.likes += 1
      blog.likedBy = [...(blog.likedBy || []), userId]
    }

    await blog.save()

    return NextResponse.json({
      success: true,
      data: { likes: blog.likes, liked: !hasLiked },
    })
  } catch (error) {
    console.error("Error liking blog:", error)
    return NextResponse.json({ success: false, error: "Failed to like blog" }, { status: 500 })
  }
}
