import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Word from "@/models/Word"

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`🔄 API: Connecting to MongoDB for updating review status of word ID: ${params.id}...`)
    await dbConnect()
    console.log(`✅ API: MongoDB connected for updating review status of word ID: ${params.id}`)

    const body = await req.json()

    // Validate review status
    if (!["flagged", "reviewed", null].includes(body.reviewStatus)) {
      console.log(`⚠️ API: Invalid review status for word ID: ${params.id}`)
      return NextResponse.json(
        { success: false, error: "Invalid review status. Must be 'flagged', 'reviewed', or null" },
        { status: 400 },
      )
    }

    const word = await Word.findByIdAndUpdate(
      params.id,
      { reviewStatus: body.reviewStatus },
      { new: true, runValidators: true },
    )

    if (!word) {
      console.log(`⚠️ API: Word with ID ${params.id} not found for review status update`)
      return NextResponse.json({ success: false, error: "Word not found" }, { status: 404 })
    }

    console.log(`✅ API: Successfully updated review status for word: ${word.balti} - ${word.english}`)
    return NextResponse.json({ success: true, data: word })
  } catch (error) {
    console.error(`❌ API Error updating review status for word ID ${params.id}:`, error)
    return NextResponse.json({ success: false, error: "Failed to update review status" }, { status: 500 })
  }
}
