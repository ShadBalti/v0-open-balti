import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import WordFeedback from "@/models/WordFeedback"

export async function GET() {
  try {
    await dbConnect()

    // Get counts in parallel
    const [totalUsers, feedbackData] = await Promise.all([
      User.countDocuments(),
      WordFeedback.aggregate([
        {
          $facet: {
            totalFeedback: [{ $count: "count" }],
            totalComments: [{ $match: { comment: { $exists: true, $ne: "" } } }, { $count: "count" }],
          },
        },
      ]),
    ])

    // Extract values from aggregation results
    const totalFeedback = feedbackData[0].totalFeedback[0]?.count || 0
    const totalComments = feedbackData[0].totalComments[0]?.count || 0

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalFeedback,
        totalComments,
      },
    })
  } catch (error) {
    console.error("Error fetching community stats:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch community stats" }, { status: 500 })
  }
}
