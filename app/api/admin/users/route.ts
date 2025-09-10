import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "admin" && session.user.role !== "owner")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()

    const users = await User.find({}).select("-password").sort({ createdAt: -1 }).lean()

    return NextResponse.json({
      success: true,
      data: users,
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 })
  }
}
