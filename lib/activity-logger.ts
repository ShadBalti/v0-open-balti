import dbConnect from "@/lib/mongodb"
import ActivityLog from "@/models/ActivityLog"
import type { Session } from "next-auth"
import { incrementUserStat } from "@/lib/update-user-stats"

type ActivityAction = "create" | "update" | "delete" | "review"

interface LogActivityParams {
  session: Session
  action: ActivityAction
  wordId?: string
  wordBalti?: string
  wordEnglish?: string
  details?: string
}

export async function logActivity({
  session,
  action,
  wordId,
  wordBalti,
  wordEnglish,
  details,
}: LogActivityParams): Promise<void> {
  if (!session?.user?.id) {
    console.warn("Attempted to log activity without a valid user session")
    return
  }

  try {
    await dbConnect()

    await ActivityLog.create({
      user: session.user.id,
      action,
      wordId,
      wordBalti,
      wordEnglish,
      details,
    })

    console.log(`✅ Activity logged: ${action} by user ${session.user.id}`)

    // Update user statistics based on the action
    if (action === "create") {
      await incrementUserStat(session.user.id, "wordsAdded")
    } else if (action === "update") {
      await incrementUserStat(session.user.id, "wordsEdited")
    } else if (action === "review") {
      await incrementUserStat(session.user.id, "wordsReviewed")
    }
  } catch (error) {
    console.error("❌ Error logging activity:", error)
  }
}
