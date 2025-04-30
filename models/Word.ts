import mongoose, { Schema, type Document } from "mongoose"

export interface IWord extends Document {
  balti: string
  english: string
  phonetic?: string
  categories?: string[]
  examples?: { balti: string; english: string }[]
  reviewStatus?: "flagged" | "reviewed" | null
  createdBy?: string
  updatedBy?: string
  createdAt: Date
  updatedAt: Date
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
    examples: {
      type: [
        {
          balti: String,
          english: String,
        },
      ],
      default: [],
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
  },
  {
    timestamps: true,
  },
)

// Check if the model is already defined to prevent overwriting during hot reloads
export default mongoose.models.Word || mongoose.model<IWord>("Word", WordSchema)
