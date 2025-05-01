import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Word from "@/models/Word"
import { subDays, format } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const daysParam = searchParams.get("days") || "7"
    const days = Math.min(Math.max(Number.parseInt(daysParam), 1), 30) // Limit between 1 and 30 days

    const words = []
    const today = new Date()

    // Generate words for each day
    for (let i = 0; i < days; i++) {
      const date = subDays(today, i)
      const dateString = format(date, "yyyy-M-d")

      // Create a simple hash of the date string to use as a seed
      let seed = 0
      for (let j = 0; j < dateString.length; j++) {
        seed = (seed << 5) - seed + dateString.charCodeAt(j)
        seed = seed & seed // Convert to 32bit integer
      }

      // Get total count of words
      const totalWords = await Word.countDocuments()

      if (totalWords === 0) {
        continue
      }

      // Use the seed to select a word index
      const wordIndex = Math.abs(seed) % totalWords

      // Skip to that index and get the word
      const wordOfTheDay = await Word.findOne().skip(wordIndex).populate("createdBy", "name image").lean()

      if (wordOfTheDay) {
        words.push({
          word: wordOfTheDay,
          date: format(date, "yyyy-MM-dd"),
        })
      }
    }

    return NextResponse.json({ words })
  } catch (error) {
    console.error("Error fetching word of the day history:", error)
    return NextResponse.json({ error: "Failed to fetch word of the day history" }, { status: 500 })
  }
}
