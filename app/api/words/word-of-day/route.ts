import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Word from "@/models/Word"

export async function GET() {
  try {
    await dbConnect()

    // Get a random word from the database
    // We'll use aggregation to get a random word
    const randomWords = await Word.aggregate([{ $sample: { size: 1 } }])

    if (randomWords.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No words found",
        },
        { status: 404 },
      )
    }

    const wordOfDay = randomWords[0]

    return NextResponse.json({
      success: true,
      data: wordOfDay,
    })
  } catch (error) {
    console.error("Error fetching word of the day:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch word of the day" }, { status: 500 })
  }
}
