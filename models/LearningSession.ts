import mongoose, { Schema, type Document } from "mongoose"

export interface ILearningSession extends Document {
  userId: mongoose.Types.ObjectId
  sessionType: "flashcards" | "quiz" | "practice"
  wordsStudied: string[]
  score?: number
  duration: number // in seconds
  correctAnswers: number
  totalQuestions: number
  createdAt: Date
}

const LearningSessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionType: {
      type: String,
      enum: ["flashcards", "quiz", "practice"],
      required: true,
    },
    wordsStudied: [
      {
        type: String,
        required: true,
      },
    ],
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    duration: {
      type: Number,
      required: true,
    },
    correctAnswers: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
)

export default mongoose.models.LearningSession ||
  mongoose.model<ILearningSession>("LearningSession", LearningSessionSchema)
