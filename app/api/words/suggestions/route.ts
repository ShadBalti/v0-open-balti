import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Word from "@/models/Word"

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const query = url.searchParams.get("q") || ""
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")

    await dbConnect()

    let suggestions = []

    if (query.trim()) {
      // Search for words that match the query
      const searchResults = await Word.find({
        $or: [{ balti: { $regex: query, $options: "i" } }, { english: { $regex: query, $options: "i" } }],
      })
        .select("balti english")
        .limit(limit)
        .lean()

      suggestions = searchResults.map((word) => ({
        id: word._id.toString(),
        text: `${word.balti} (${word.english})`,
        balti: word.balti,
        english: word.english,
        type: "suggestion",
      }))
    } else {
      // Get popular words (words with high feedback stats)
      const popularWords = await Word.find({})
        .sort({ "feedbackStats.useful": -1 })
        .select("balti english feedbackStats")
        .limit(5)
        .lean()

      const recentWords = await Word.find({}).sort({ createdAt: -1 }).select("balti english").limit(5).lean()

      suggestions = [
        ...popularWords.map((word) => ({
          id: word._id.toString(),
          text: `${word.balti} (${word.english})`,
          balti: word.balti,
          english: word.english,
          type: "popular" as const,
        })),
        ...recentWords.map((word) => ({
          id: word._id.toString(),
          text: `${word.balti} (${word.english})`,
          balti: word.balti,
          english: word.english,
          type: "recent" as const,
        })),
      ]
    }

    return NextResponse.json({
      success: true,
      data: suggestions,
    })
  } catch (error) {
    console.error("Error fetching suggestions:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch suggestions" }, { status: 500 })
  }
}
