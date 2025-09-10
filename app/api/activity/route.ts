import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import ActivityLog from "@/models/ActivityLog"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { logger } from "@/lib/logger"

export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    logger.info("Connecting to MongoDB for fetching activity logs", { userId: session.user.id })
    await dbConnect()
    logger.info("MongoDB connected for fetching activity logs")

    // Get query parameters
    const searchParams = req.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "50", 10)
    const page = Number.parseInt(searchParams.get("page") || "1", 10)
    const userId = searchParams.get("userId")
    const wordId = searchParams.get("wordId")
    const action = searchParams.get("action")

    // Build query
    const query: any = {}
    if (wordId) query.wordId = wordId
    if (action) query.action = action

    if (userId) {
      // If a specific userId is requested, show that user's activity
      query.user = userId
    } else {
      // If no userId specified, only show current user's activity (not global activity)
      query.user = session.user.id
    }

    if (session.user.role === "admin" && userId === "all") {
      delete query.user
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Fetch logs with pagination
    const logs = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name email")
      .lean()

    // Get total count for pagination
    const totalCount = await ActivityLog.countDocuments(query)

    logger.info("Successfully fetched activity logs", {
      count: logs.length,
      totalCount,
      page,
      userId: session.user.id,
    })

    return NextResponse.json({
      success: true,
      data: logs,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    logger.error("Failed to fetch activity logs", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json({ success: false, error: "Failed to fetch activity logs" }, { status: 500 })
  }
}
