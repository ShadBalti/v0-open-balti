import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`🔄 API: Connecting to MongoDB for fetching user ID: ${params.id}...`)
    await dbConnect()
    console.log(`✅ API: MongoDB connected for fetching user ID: ${params.id}`)

    const session = await getServerSession(authOptions)
    const isOwnProfile = session?.user?.id === params.id
    const isAdmin = session?.user?.role === "admin"

    // Find the user
    const user = await User.findById(params.id).select("-password")

    if (!user) {
      console.log(`⚠️ API: User with ID ${params.id} not found`)
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // If the profile is not public and the requester is not the owner or an admin
    if (!user.isPublic && !isOwnProfile && !isAdmin) {
      return NextResponse.json({ success: false, error: "This profile is private" }, { status: 403 })
    }

    // Prepare the response data
    const userData = {
      id: user._id,
      name: user.name,
      image: user.image,
      role: user.role,
      bio: user.bio,
      location: user.location,
      website: user.website,
      isPublic: user.isPublic,
      contributionStats: user.contributionStats,
      createdAt: user.createdAt,
      // Only include email if it's the user's own profile or an admin
      ...(isOwnProfile || isAdmin ? { email: user.email } : {}),
    }

    console.log(`📋 API: Successfully fetched user: ${user.name}`)
    return NextResponse.json({ success: true, data: userData })
  } catch (error) {
    console.error(`❌ API Error fetching user ID ${params.id}:`, error)
    return NextResponse.json({ success: false, error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    // Only allow users to update their own profile (or admins)
    if (session.user.id !== params.id && session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    console.log(`🔄 API: Connecting to MongoDB for updating user ID: ${params.id}...`)
    await dbConnect()
    console.log(`✅ API: MongoDB connected for updating user ID: ${params.id}`)

    const body = await req.json()

    // Validate and sanitize input
    const allowedFields = ["name", "bio", "location", "website", "isPublic"]
    const updateData: any = {}

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    })

    // Update the user
    const user = await User.findByIdAndUpdate(params.id, updateData, { new: true, runValidators: true }).select(
      "-password",
    )

    if (!user) {
      console.log(`⚠️ API: User with ID ${params.id} not found for update`)
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    console.log(`✅ API: Successfully updated user: ${user.name}`)
    return NextResponse.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        bio: user.bio,
        location: user.location,
        website: user.website,
        isPublic: user.isPublic,
      },
    })
  } catch (error) {
    console.error(`❌ API Error updating user ID ${params.id}:`, error)
    return NextResponse.json({ success: false, error: "Failed to update user" }, { status: 500 })
  }
}
