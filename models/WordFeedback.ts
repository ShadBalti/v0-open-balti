import mongoose, { Schema, type Document } from "mongoose"

export interface IWordFeedback extends Document {
  wordId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  isUseful: boolean
  isTrusted: boolean
  needsReview: boolean
  comment?: string
  createdAt: Date
  updatedAt: Date
}

const WordFeedbackSchema: Schema = new Schema(
  {
    wordId: {
      type: Schema.Types.ObjectId,
      ref: "Word",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isUseful: {
      type: Boolean,
      default: false,
    },
    isTrusted: {
      type: Boolean,
      default: false,
    },
    needsReview: {
      type: Boolean,
      default: false,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

// Create a compound index to ensure a user can only provide one feedback per word
WordFeedbackSchema.index({ wordId: 1, userId: 1 }, { unique: true })

export default mongoose.models.WordFeedback || mongoose.model<IWordFeedback>("WordFeedback", WordFeedbackSchema)
