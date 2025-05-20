import type { MetadataRoute } from "next"
import { connectToDatabase } from "@/lib/mongodb"
import Word from "@/models/Word"
import User from "@/models/User"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://openbalti.vercel.app"

  // Static routes with their update frequency and priority
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contribute`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/review`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/word-of-the-day`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/translate`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/activity`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contributors`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
  ]

  // Dynamically generate routes for all words
  let wordRoutes: MetadataRoute.Sitemap = []
  try {
    await connectToDatabase()
    const words = await Word.find({}, { _id: 1, updatedAt: 1 }).sort({ updatedAt: -1 }).lean()

    wordRoutes = words.map((word) => ({
      url: `${baseUrl}/words/${word._id.toString()}`,
      lastModified: word.updatedAt || new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.error("Error generating word routes for sitemap:", error)
  }

  // Dynamically generate routes for public user profiles
  let userRoutes: MetadataRoute.Sitemap = []
  try {
    await connectToDatabase()
    const users = await User.find({ isPublicProfile: true }, { _id: 1, updatedAt: 1 }).sort({ updatedAt: -1 }).lean()

    userRoutes = users.map((user) => ({
      url: `${baseUrl}/users/${user._id.toString()}`,
      lastModified: user.updatedAt || new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }))
  } catch (error) {
    console.error("Error generating user routes for sitemap:", error)
  }

  // Combine all routes
  return [...staticRoutes, ...wordRoutes, ...userRoutes]
}
