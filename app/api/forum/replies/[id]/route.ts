import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import ForumReply from "@/models/ForumReply"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    await dbConnect()

    const body = await req.json()
    const { content } = body

    if (!content?.trim()) {
      return NextResponse.json({ success: false, error: "Content is required" }, { status: 400 })
    }

    const reply = await ForumReply.findById(params.id)
    if (!reply) {
      return NextResponse.json({ success: false, error: "Reply not found" }, { status: 404 })
    }

    // Check if user is the author
    if (reply.author.toString() !== session.user.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    reply.content = content.trim()
    reply.isEdited = true
    reply.editedAt = new Date()
    await reply.save()

    return NextResponse.json({ success: true, data: reply })
  } catch (error) {
    console.error("Error updating reply:", error)
    return NextResponse.json({ success: false, error: "Failed to update reply" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    await dbConnect()

    const reply = await ForumReply.findById(params.id)
    if (!reply) {
      return NextResponse.json({ success: false, error: "Reply not found" }, { status: 404 })
    }

    // Check if user is the author or admin
    if (reply.author.toString() !== session.user.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    await ForumReply.findByIdAndDelete(params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting reply:", error)
    return NextResponse.json({ success: false, error: "Failed to delete reply" }, { status: 500 })
  }
}
