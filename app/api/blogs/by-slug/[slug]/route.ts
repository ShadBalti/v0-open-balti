import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Blog from "@/models/Blog"

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await dbConnect()

    const blog = await Blog.findOne({ slug: params.slug }).populate("author", "name image bio")

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
