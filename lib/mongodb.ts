import mongoose from "mongoose"

// Instead of throwing an error immediately, we'll check at connection time
const MONGODB_URI = process.env.MONGODB_URI

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect() {
  // Check for MONGODB_URI at connection time, not at module initialization
  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable")
  }

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Optimize connection pool size
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      autoIndex: process.env.NODE_ENV !== "production", // Don't build indexes in production
    }

    console.log("🔄 Connecting to MongoDB...")

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("✅ MongoDB connected successfully!")
        return mongoose
      })
      .catch((error) => {
        console.error("❌ MongoDB connection error:", error)
        cached.promise = null // Reset the promise so we can retry
        throw error
      })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

// Add an event listener for connection errors
mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err)
  // Attempt to reconnect on error
  if (cached.conn && mongoose.connection.readyState === 0) {
    console.log("⚠️ Attempting to reconnect to MongoDB...")
    cached.promise = null
    cached.conn = null
  }
})

// Add an event listener for when the connection is disconnected
mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB disconnected")
  // Reset connection cache on disconnect
  if (cached.conn) {
    cached.promise = null
    cached.conn = null
  }
})

// Add an event listener for when the connection is reconnected
mongoose.connection.on("reconnected", () => {
  console.log("✅ MongoDB reconnected")
})

// Handle process termination
process.on("SIGINT", async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close()
    console.log("MongoDB connection closed due to app termination")
  }
  process.exit(0)
})

// Export both as named export and default export for backward compatibility
export const connectToDatabase = dbConnect
export default dbConnect
