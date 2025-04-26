import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Word from "@/models/Word"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`🔄 API: Connecting to MongoDB for fetching word ID: ${params.id}...`)
    await dbConnect()
    console.log(`✅ API: MongoDB connected for fetching word ID: ${params.id}`)

    const word = await Word.findById(params.id)

    if (!word) {
      console.log(`⚠️ API: Word with ID ${params.id} not found`)
      return NextResponse.json({ success: false, error: "Word not found" }, { status: 404 })
    }

    console.log(`📋 API: Successfully fetched word: ${word.balti} - ${word.english}`)
    return NextResponse.json({ success: true, data: word })
  } catch (error) {
    console.error(`❌ API Error fetching word ID ${params.id}:`, error)
    return NextResponse.json({ success: false, error: "Failed to fetch word" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`🔄 API: Connecting to MongoDB for updating word ID: ${params.id}...`)
    await dbConnect()
    console.log(`✅ API: MongoDB connected for updating word ID: ${params.id}`)

    const body = await req.json()

    // Validate required fields
    if (!body.balti || !body.english) {
      console.log(`⚠️ API: Validation failed for updating word ID: ${params.id} - missing required fields`)
      return NextResponse.json(
        { success: false, error: "Balti word and English translation are required" },
        { status: 400 },
      )
    }

    const word = await Word.findByIdAndUpdate(params.id, body, { new: true, runValidators: true })

    if (!word) {
      console.log(`⚠️ API: Word with ID ${params.id} not found for update`)
      return NextResponse.json({ success: false, error: "Word not found" }, { status: 404 })
    }

    console.log(`✅ API: Successfully updated word: ${word.balti} - ${word.english}`)
    return NextResponse.json({ success: true, data: word })
  } catch (error) {
    console.error(`❌ API Error updating word ID ${params.id}:`, error)
    return NextResponse.json({ success: false, error: "Failed to update word" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`🔄 API: Connecting to MongoDB for deleting word ID: ${params.id}...`)
    await dbConnect()
    console.log(`✅ API: MongoDB connected for deleting word ID: ${params.id}`)

    const word = await Word.findByIdAndDelete(params.id)

    if (!word) {
      console.log(`⚠️ API: Word with ID ${params.id} not found for deletion`)
      return NextResponse.json({ success: false, error: "Word not found" }, { status: 404 })
    }

    console.log(`✅ API: Successfully deleted word: ${word.balti} - ${word.english}`)
    return NextResponse.json({ success: true, data: {} })
  } catch (error) {
    console.error(`❌ API Error deleting word ID ${params.id}:`, error)
    return NextResponse.json({ success: false, error: "Failed to delete word" }, { status: 500 })
  }
}
