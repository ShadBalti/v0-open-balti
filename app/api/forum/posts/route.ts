import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import ForumPost from "@/models/ForumPost"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const url = new URL(req.url)
    const category = url.searchParams.get("category")
    const search = url.searchParams.get("search")
    const sort = url.searchParams.get("sort") || "recent"

    const query: any = {}

    if (category && category !== "all") {
      query.category = category
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ]
    }

    let sortQuery: any = {}
    switch (sort) {
      case "popular":
        sortQuery = { likes: -1, views: -1 }
        break
      case "active":
        sortQuery = { lastActivity: -1 }
        break
      default:
        sortQuery = { isPinned: -1, createdAt: -1 }
    }

    const posts = await ForumPost.find(query).populate("author", "name email").sort(sortQuery).limit(50)

    return NextResponse.json({ success: true, data: posts })
  } catch (error) {
    console.error("Error fetching forum posts:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch posts" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    await dbConnect()

    const body = await req.json()
    const { title, content, category, tags, wordReference } = body

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ success: false, error: "Title and content are required" }, { status: 400 })
    }

    const post = await ForumPost.create({
      title: title.trim(),
      content: content.trim(),
      category: category || "general",
      tags: tags || [],
      author: session.user.id,
      wordReference: wordReference || undefined,
      lastActivity: new Date(),
    })

    const populatedPost = await ForumPost.findById(post._id).populate("author", "name email")

    return NextResponse.json({ success: true, data: populatedPost })
  } catch (error) {
    console.error("Error creating forum post:", error)
    return NextResponse.json({ success: false, error: "Failed to create post" }, { status: 500 })
  }
}
