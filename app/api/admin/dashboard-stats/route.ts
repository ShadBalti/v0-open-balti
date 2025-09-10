import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Word from "@/models/Word"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "admin" && session.user.role !== "owner")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [totalUsers, totalWords, pendingReviews, flaggedContent, newUsersToday, wordsAddedToday] = await Promise.all([
      User.countDocuments(),
      Word.countDocuments(),
      Word.countDocuments({ "feedbackStats.needsReview": { $gt: 0 } }),
      Word.countDocuments({ reviewStatus: "flagged" }),
      User.countDocuments({ createdAt: { $gte: today } }),
      Word.countDocuments({ createdAt: { $gte: today } }),
    ])

    // Simple system health check
    let systemHealth: "good" | "warning" | "critical" = "good"
    if (pendingReviews > 50) systemHealth = "warning"
    if (pendingReviews > 100 || flaggedContent > 20) systemHealth = "critical"

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalWords,
        pendingReviews,
        flaggedContent,
        newUsersToday,
        wordsAddedToday,
        systemHealth,
      },
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch dashboard statistics" }, { status: 500 })
  }
}
