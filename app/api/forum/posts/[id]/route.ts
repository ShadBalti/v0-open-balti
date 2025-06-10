import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import ForumPost from "@/models/ForumPost"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const post = await ForumPost.findById(params.id).populate("author", "name email")

    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 })
    }

    // Increment view count
    await ForumPost.findByIdAndUpdate(params.id, { $inc: { views: 1 } })

    return NextResponse.json({ success: true, data: post })
  } catch (error) {
    console.error("Error fetching forum post:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch post" }, { status: 500 })
  }
}
