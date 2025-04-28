import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function GET(req: NextRequest) {
  try {
    console.log("🔄 API: Connecting to MongoDB for fetching users...")
    await dbConnect()
    console.log("✅ API: MongoDB connected for fetching users")

    // Get query parameters
    const searchParams = req.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "20", 10)
    const page = Number.parseInt(searchParams.get("page") || "1", 10)
    const sortBy = searchParams.get("sortBy") || "contributions"
    const search = searchParams.get("search") || ""

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build query
    const query: any = {}
    if (search) {
      query.name = { $regex: search, $options: "i" }
    }

    // Fetch users with calculated total contributions
    let users = await User.find(query)
      .select("name image role bio location website isPublic contributionStats createdAt")
      .lean()

    // Calculate total contributions for each user
    users = users.map((user) => {
      const stats = user.contributionStats || { wordsAdded: 0, wordsEdited: 0, wordsReviewed: 0 }
      return {
        ...user,
        contributionStats: {
          ...stats,
          total: (stats.wordsAdded || 0) + (stats.wordsEdited || 0) + (stats.wordsReviewed || 0),
        },
      }
    })

    // Apply sorting
    if (sortBy === "contributions") {
      users.sort((a, b) => b.contributionStats.total - a.contributionStats.total)
    } else if (sortBy === "recent") {
      users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else if (sortBy === "name") {
      users.sort((a, b) => a.name.localeCompare(b.name))
    }

    // Apply pagination
    const paginatedUsers = users.slice(skip, skip + limit)
    const totalCount = users.length

    console.log(`📋 API: Successfully fetched ${paginatedUsers.length} users`)

    return NextResponse.json({
      success: true,
      data: paginatedUsers,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("❌ API Error fetching users:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 })
  }
}
