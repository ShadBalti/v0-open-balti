import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Word from "@/models/Word"
import User from "@/models/User"

// This API route is for generating a server-side sitemap that can be used by search engines
// It's useful for very large sitemaps that might exceed the size limits of static generation

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://openbalti.vercel.app"
    await connectToDatabase()

    // Fetch all words
    const words = await Word.find({}, { _id: 1, updatedAt: 1 }).lean()

    // Fetch public user profiles
    const users = await User.find({ isPublicProfile: true }, { _id: 1, updatedAt: 1 }).lean()

    // Generate XML content
    let xml = '<?xml version="1.0" encoding="UTF-8"?>'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'

    // Add word URLs
    words.forEach((word) => {
      xml += "<url>"
      xml += `<loc>${baseUrl}/words/${word._id.toString()}</loc>`
      xml += `<lastmod>${new Date(word.updatedAt || Date.now()).toISOString()}</lastmod>`
      xml += "<changefreq>monthly</changefreq>"
      xml += "<priority>0.7</priority>"
      xml += "</url>"
    })

    // Add user profile URLs
    users.forEach((user) => {
      xml += "<url>"
      xml += `<loc>${baseUrl}/users/${user._id.toString()}</loc>`
      xml += `<lastmod>${new Date(user.updatedAt || Date.now()).toISOString()}</lastmod>`
      xml += "<changefreq>monthly</changefreq>"
      xml += "<priority>0.5</priority>"
      xml += "</url>"
    })

    xml += "</urlset>"

    // Return XML response
    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml",
      },
    })
  } catch (error) {
    console.error("Error generating server sitemap:", error)
    return new NextResponse("Error generating sitemap", { status: 500 })
  }
}
