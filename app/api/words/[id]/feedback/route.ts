import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Word from "@/models/Word"
import WordFeedback from "@/models/WordFeedback"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// Get feedback for a specific word
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const wordId = params.id
    const session = await getServerSession(authOptions)

    // Get aggregated feedback for the word
    const word = await Word.findById(wordId).select("feedbackStats").lean()

    if (!word) {
      return NextResponse.json({ success: false, error: "Word not found" }, { status: 404 })
    }

    // If user is logged in, also get their personal feedback
    let userFeedback = null
    if (session?.user?.id) {
      userFeedback = await WordFeedback.findOne({
        wordId,
        userId: session.user.id,
      }).lean()
    }

    return NextResponse.json({
      success: true,
      data: {
        stats: word.feedbackStats || {
          usefulCount: 0,
          trustedCount: 0,
          needsReviewCount: 0,
          totalFeedback: 0,
        },
        userFeedback,
      },
    })
  } catch (error) {
    console.error("Error fetching word feedback:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch feedback" }, { status: 500 })
  }
}

// Submit feedback for a word
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    await dbConnect()

    const wordId = params.id
    const { isUseful, isTrusted, needsReview, comment } = await req.json()

    // Check if the word exists
    const word = await Word.findById(wordId)
    if (!word) {
      return NextResponse.json({ success: false, error: "Word not found" }, { status: 404 })
    }

    // Check if user has already provided feedback for this word
    let feedback = await WordFeedback.findOne({ wordId, userId: session.user.id })

    // Initialize feedbackStats if it doesn't exist
    if (!word.feedbackStats) {
      word.feedbackStats = {
        usefulCount: 0,
        trustedCount: 0,
        needsReviewCount: 0,
        totalFeedback: 0,
      }
    }

    // If feedback exists, update the word stats by removing the old feedback
    if (feedback) {
      if (feedback.isUseful) word.feedbackStats.usefulCount = Math.max(0, word.feedbackStats.usefulCount - 1)
      if (feedback.isTrusted) word.feedbackStats.trustedCount = Math.max(0, word.feedbackStats.trustedCount - 1)
      if (feedback.needsReview)
        word.feedbackStats.needsReviewCount = Math.max(0, word.feedbackStats.needsReviewCount - 1)

      // Update the feedback
      feedback.isUseful = !!isUseful
      feedback.isTrusted = !!isTrusted
      feedback.needsReview = !!needsReview
      if (comment !== undefined) feedback.comment = comment
    } else {
      // Create new feedback
      feedback = new WordFeedback({
        wordId,
        userId: session.user.id,
        isUseful: !!isUseful,
        isTrusted: !!isTrusted,
        needsReview: !!needsReview,
        comment: comment || "",
      })

      // Increment total feedback count
      word.feedbackStats.totalFeedback += 1
    }

    // Add the new feedback to the word stats
    if (feedback.isUseful) word.feedbackStats.usefulCount += 1
    if (feedback.isTrusted) word.feedbackStats.trustedCount += 1
    if (feedback.needsReview) word.feedbackStats.needsReviewCount += 1

    // Save both documents
    await Promise.all([feedback.save(), word.save()])

    return NextResponse.json({
      success: true,
      data: {
        feedback,
        stats: word.feedbackStats,
      },
    })
  } catch (error) {
    console.error("Error submitting word feedback:", error)
    return NextResponse.json({ success: false, error: "Failed to submit feedback" }, { status: 500 })
  }
}

// Delete feedback for a word
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    await dbConnect()

    const wordId = params.id

    // Find the feedback
    const feedback = await WordFeedback.findOne({ wordId, userId: session.user.id })

    if (!feedback) {
      return NextResponse.json({ success: false, error: "Feedback not found" }, { status: 404 })
    }

    // Update the word stats
    const word = await Word.findById(wordId)

    if (word && word.feedbackStats) {
      if (feedback.isUseful) word.feedbackStats.usefulCount = Math.max(0, word.feedbackStats.usefulCount - 1)
      if (feedback.isTrusted) word.feedbackStats.trustedCount = Math.max(0, word.feedbackStats.trustedCount - 1)
      if (feedback.needsReview)
        word.feedbackStats.needsReviewCount = Math.max(0, word.feedbackStats.needsReviewCount - 1)
      word.feedbackStats.totalFeedback = Math.max(0, word.feedbackStats.totalFeedback - 1)

      await word.save()
    }

    // Delete the feedback
    await feedback.deleteOne()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting word feedback:", error)
    return NextResponse.json({ success: false, error: "Failed to delete feedback" }, { status: 500 })
  }
}
