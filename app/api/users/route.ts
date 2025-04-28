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

    // Build query
    const query: any = { isPublic: true }

    if (search) {
      query.name = { $regex: search, $options: "i" }
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Determine sort order
    let sort: any = {}
    if (sortBy === "contributions") {
      sort = {
        "contributionStats.wordsAdded": -1,
        "contributionStats.wordsEdited": -1,
        "contributionStats.wordsReviewed": -1,
      }
    } else if (sortBy === "recent") {
      sort = { createdAt: -1 }
    } else if (sortBy === "name") {
      sort = { name: 1 }
    }

    // Fetch users with pagination
    const users = await User.find(query)
      .select("name image role bio contributionStats createdAt")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()

    // Get total count for pagination
    const totalCount = await User.countDocuments(query)

    console.log(`📋 API: Successfully fetched ${users.length} users`)

    return NextResponse.json({
      success: true,
      data: users,
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
