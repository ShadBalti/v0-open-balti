import { connect, mongoose } from "mongoose"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined in environment variables")
  process.exit(1)
}

async function setOwnerAccount() {
  try {
    // Connect to MongoDB
    console.log("🔄 Connecting to MongoDB...")
    await connect(MONGODB_URI)
    console.log("✅ Connected to MongoDB")

    // Get the user email from command line arguments
    const userEmail = process.argv[2]
    if (!userEmail) {
      console.error("❌ Please provide your email as an argument: npm run set-owner your@email.com")
      process.exit(1)
    }

    // Get the MongoDB connection
    const db = mongoose.connection.db

    // Update the user document
    const result = await db.collection("users").updateOne(
      { email: userEmail },
      {
        $set: {
          isVerified: true,
          isFounder: true,
          role: "owner",
        },
      },
    )

    if (result.matchedCount === 0) {
      console.error(`❌ No user found with email: ${userEmail}`)
      process.exit(1)
    }

    if (result.modifiedCount === 0) {
      console.log("ℹ️ User already has owner privileges")
    } else {
      console.log(`✅ Successfully updated user: ${userEmail}`)
      console.log("✅ User is now verified, founder, and has owner role")
    }
  } catch (error) {
    console.error("❌ Error updating user:", error)
  } finally {
    // Close the connection
    await mongoose.connection.close()
    console.log("👋 MongoDB connection closed")
    process.exit(0)
  }
}

setOwnerAccount()
