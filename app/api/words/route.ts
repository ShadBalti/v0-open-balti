import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Word from "@/models/Word"

export async function GET(req: NextRequest) {
  try {
    console.log("🔄 API: Connecting to MongoDB for fetching words...")
    await dbConnect()
    console.log("✅ API: MongoDB connected for fetching words")

    // Get search query from URL if present
    const searchParams = req.nextUrl.searchParams
    const search = searchParams.get("search") || ""

    let query = {}
    if (search) {
      query = {
        $or: [{ balti: { $regex: search, $options: "i" } }, { english: { $regex: search, $options: "i" } }],
      }
    }

    const words = await Word.find(query).sort({ createdAt: -1 })
    console.log(`📋 API: Successfully fetched ${words.length} words`)

    return NextResponse.json({ success: true, data: words })
  } catch (error) {
    console.error("❌ API Error fetching words:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch words" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("🔄 API: Connecting to MongoDB for creating a word...")
    await dbConnect()
    console.log("✅ API: MongoDB connected for creating a word")

    const body = await req.json()

    // Validate required fields
    if (!body.balti || !body.english) {
      console.log("⚠️ API: Validation failed - missing required fields")
      return NextResponse.json(
        { success: false, error: "Balti word and English translation are required" },
        { status: 400 },
      )
    }

    const word = await Word.create(body)
    console.log(`✅ API: Successfully created word: ${word.balti} - ${word.english}`)

    return NextResponse.json({ success: true, data: word }, { status: 201 })
  } catch (error) {
    console.error("❌ API Error creating word:", error)
    return NextResponse.json({ success: false, error: "Failed to create word" }, { status: 500 })
  }
}
