import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "admin" && session.user.role !== "owner")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()

    const { role } = await req.json()
    const userId = params.id

    if (!["user", "contributor", "admin", "owner"].includes(role)) {
      return NextResponse.json({ success: false, error: "Invalid role" }, { status: 400 })
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { role }, { new: true }).select("-password")

    if (!updatedUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
    })
  } catch (error) {
    console.error("Error updating user role:", error)
    return NextResponse.json({ success: false, error: "Failed to update user role" }, { status: 500 })
  }
}
