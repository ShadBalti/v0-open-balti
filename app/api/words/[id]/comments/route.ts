import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import WordFeedback from "@/models/WordFeedback"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const wordId = params.id

    // Get all comments for this word
    const comments = await WordFeedback.find({
      wordId,
      comment: { $exists: true, $ne: "" },
    })
      .populate("userId", "name image")
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ success: true, data: comments })
  } catch (error) {
    console.error("Error fetching word comments:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch comments" }, { status: 500 })
  }
}
