import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"

export async function POST(req: Request) {
  try {
    // Connect to the database
    await dbConnect()

    // Get the MongoDB connection directly
    const mongoose = await import("mongoose")
    const db = mongoose.connection.db

    // Get email and secret key from request
    const { email, secretKey } = await req.json()

    // Validate inputs
    if (!email || !secretKey) {
      return NextResponse.json({ success: false, message: "Email and secret key are required" }, { status: 400 })
    }

    // Check if secret key matches (use a strong, unique value in production)
    // This is a simple security measure - in production, use a more secure approach
    const expectedSecretKey = process.env.OWNER_SECRET_KEY || "openbalti-owner-setup-2025"
    if (secretKey !== expectedSecretKey) {
      return NextResponse.json({ success: false, message: "Invalid secret key" }, { status: 403 })
    }

    // Update the user document directly
    const result = await db.collection("users").updateOne(
      { email: email },
      {
        $set: {
          isVerified: true,
          isFounder: true,
          role: "owner",
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: "No user found with that email" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Account updated successfully. You are now the verified owner and founder.",
      updated: result.modifiedCount > 0,
    })
  } catch (error) {
    console.error("Error setting owner account:", error)
    return NextResponse.json({ success: false, message: "Failed to update account" }, { status: 500 })
  }
}
