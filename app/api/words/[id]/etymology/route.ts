import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import WordEtymology from "@/models/WordEtymology"
import Word from "@/models/Word"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const etymology = await WordEtymology.findOne({ wordId: params.id })
      .populate("createdBy", "name")
      .populate("verifiedBy", "name")

    if (!etymology) {
      return NextResponse.json({ success: false, error: "Etymology not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: etymology })
  } catch (error) {
    console.error("Error fetching etymology:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch etymology" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    await dbConnect()

    // Check if word exists
    const word = await Word.findById(params.id)
    if (!word) {
      return NextResponse.json({ success: false, error: "Word not found" }, { status: 404 })
    }

    // Check if etymology already exists
    const existingEtymology = await WordEtymology.findOne({ wordId: params.id })
    if (existingEtymology) {
      return NextResponse.json({ success: false, error: "Etymology already exists for this word" }, { status: 409 })
    }

    const body = await req.json()

    const etymology = await WordEtymology.create({
      ...body,
      wordId: params.id,
      createdBy: session.user.id,
    })

    const populatedEtymology = await WordEtymology.findById(etymology._id)
      .populate("createdBy", "name")
      .populate("verifiedBy", "name")

    return NextResponse.json({ success: true, data: populatedEtymology })
  } catch (error) {
    console.error("Error creating etymology:", error)
    return NextResponse.json({ success: false, error: "Failed to create etymology" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    await dbConnect()

    const body = await req.json()

    const etymology = await WordEtymology.findOneAndUpdate(
      { wordId: params.id },
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true },
    )
      .populate("createdBy", "name")
      .populate("verifiedBy", "name")

    if (!etymology) {
      return NextResponse.json({ success: false, error: "Etymology not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: etymology })
  } catch (error) {
    console.error("Error updating etymology:", error)
    return NextResponse.json({ success: false, error: "Failed to update etymology" }, { status: 500 })
  }
}
