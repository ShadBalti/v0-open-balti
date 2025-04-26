import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Word from "@/models/Word"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const word = await Word.findById(params.id)

    if (!word) {
      return NextResponse.json({ success: false, error: "Word not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: word })
  } catch (error) {
    console.error("Error fetching word:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch word" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const body = await req.json()

    // Validate required fields
    if (!body.balti || !body.english) {
      return NextResponse.json(
        { success: false, error: "Balti word and English translation are required" },
        { status: 400 },
      )
    }

    const word = await Word.findByIdAndUpdate(params.id, body, { new: true, runValidators: true })

    if (!word) {
      return NextResponse.json({ success: false, error: "Word not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: word })
  } catch (error) {
    console.error("Error updating word:", error)
    return NextResponse.json({ success: false, error: "Failed to update word" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const word = await Word.findByIdAndDelete(params.id)

    if (!word) {
      return NextResponse.json({ success: false, error: "Word not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: {} })
  } catch (error) {
    console.error("Error deleting word:", error)
    return NextResponse.json({ success: false, error: "Failed to delete word" }, { status: 500 })
  }
}
