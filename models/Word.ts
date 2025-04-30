import mongoose, { Schema, type Document } from "mongoose"

export interface IWord extends Document {
  balti: string
  english: string
  phonetic?: string
  categories?: string[]
  dialect?: string
  usageNotes?: string
  relatedWords?: string[]
  difficultyLevel?: "beginner" | "intermediate" | "advanced"
  reviewStatus?: "flagged" | "reviewed" | null
  createdBy?: string
  updatedBy?: string
  createdAt: Date
  updatedAt: Date
  feedbackStats?: {
    usefulCount: number
    trustedCount: number
    needsReviewCount: number
    totalFeedback: number
  }
}

const WordSchema: Schema = new Schema(
  {
    balti: {
      type: String,
      required: [true, "Please provide the Balti word"],
      trim: true,
    },
    english: {
      type: String,
      required: [true, "Please provide the English translation"],
      trim: true,
    },
    phonetic: {
      type: String,
      trim: true,
    },
    categories: {
      type: [String],
      default: [],
    },
    dialect: {
      type: String,
      trim: true,
    },
    usageNotes: {
      type: String,
      trim: true,
    },
    relatedWords: {
      type: [String],
      default: [],
    },
    difficultyLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "intermediate",
    },
    reviewStatus: {
      type: String,
      enum: ["flagged", "reviewed", null],
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    feedbackStats: {
      type: {
        usefulCount: { type: Number, default: 0 },
        trustedCount: { type: Number, default: 0 },
        needsReviewCount: { type: Number, default: 0 },
        totalFeedback: { type: Number, default: 0 },
      },
      default: {
        usefulCount: 0,
        trustedCount: 0,
        needsReviewCount: 0,
        totalFeedback: 0,
      },
    },
  },
  {
    timestamps: true,
  },
)

// Check if the model is already defined to prevent overwriting during hot reloads
export default mongoose.models.Word || mongoose.model<IWord>("Word", WordSchema)
