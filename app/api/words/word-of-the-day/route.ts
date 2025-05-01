import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Word from "@/models/Word"

export async function GET() {
  try {
    await dbConnect()

    // Use the current date to generate a deterministic seed
    const today = new Date()
    const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`

    // Create a simple hash of the date string to use as a seed
    let seed = 0
    for (let i = 0; i < dateString.length; i++) {
      seed = (seed << 5) - seed + dateString.charCodeAt(i)
      seed = seed & seed // Convert to 32bit integer
    }

    // Get total count of words
    const totalWords = await Word.countDocuments()

    if (totalWords === 0) {
      return NextResponse.json({ error: "No words found" }, { status: 404 })
    }

    // Use the seed to select a word index
    const wordIndex = Math.abs(seed) % totalWords

    // Skip to that index and get the word
    const wordOfTheDay = await Word.findOne().skip(wordIndex).populate("createdBy", "name image").lean()

    if (!wordOfTheDay) {
      return NextResponse.json({ error: "Word of the day not found" }, { status: 404 })
    }

    return NextResponse.json({
      word: wordOfTheDay,
      date: today.toISOString().split("T")[0],
    })
  } catch (error) {
    console.error("Error fetching word of the day:", error)
    return NextResponse.json({ error: "Failed to fetch word of the day" }, { status: 500 })
  }
}
