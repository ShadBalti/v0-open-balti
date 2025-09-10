import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import LearningSession from "@/models/LearningSession"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    await dbConnect()

    // Calculate learning statistics
    const sessions = await LearningSession.find({ userId: session.user.id }).sort({ createdAt: -1 })

    const totalSessions = sessions.length
    const wordsLearned = new Set(sessions.flatMap((s) => s.wordsStudied)).size
    const averageScore =
      sessions.length > 0 ? Math.round(sessions.reduce((sum, s) => sum + (s.score || 0), 0) / sessions.length) : 0

    // Calculate streak (simplified - consecutive days with sessions)
    let streakDays = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < 30; i++) {
      // Check last 30 days
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - i)

      const hasSession = sessions.some((session) => {
        const sessionDate = new Date(session.createdAt)
        sessionDate.setHours(0, 0, 0, 0)
        return sessionDate.getTime() === checkDate.getTime()
      })

      if (hasSession) {
        streakDays++
      } else if (i > 0) {
        // Allow today to not have a session yet
        break
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        wordsLearned,
        streakDays,
        totalSessions,
        averageScore,
        weakWords: [], // TODO: Implement based on performance
        strongWords: [], // TODO: Implement based on performance
      },
    })
  } catch (error) {
    console.error("Error fetching learning stats:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch learning statistics" }, { status: 500 })
  }
}
