import dbConnect from "../lib/mongodb"

async function testConnection() {
  try {
    console.log("🔄 Testing MongoDB connection...")
    await dbConnect()
    console.log("✅ MongoDB connection test successful!")

    // Wait a moment to ensure all console messages are displayed
    setTimeout(() => {
      console.log("🔄 Closing connection...")
      process.exit(0)
    }, 1000)
  } catch (error) {
    console.error("❌ MongoDB connection test failed:", error)
    process.exit(1)
  }
}

testConnection()
