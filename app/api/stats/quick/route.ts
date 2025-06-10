import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Word from "@/models/Word"
import User from "@/models/User"

export async function GET() {
  try {
    await dbConnect()

    // Get total words count
    const totalWords = await Word.countDocuments()

    // Get total contributors count
    const totalContributors = await User.countDocuments()

    // Get words added in the last week
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const recentlyAdded = await Word.countDocuments({
      createdAt: { $gte: oneWeekAgo },
    })

    // Get unique dialects count
    const dialectsResult = await Word.distinct("dialect")
    const dialects = dialectsResult.filter((dialect) => dialect && dialect.trim() !== "").length

    const stats = {
      totalWords,
      totalContributors,
      recentlyAdded,
      dialects,
    }

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error("Error fetching quick stats:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch stats" }, { status: 500 })
  }
}
