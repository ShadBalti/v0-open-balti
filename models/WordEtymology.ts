import mongoose, { Schema, type Document } from "mongoose"

export interface IWordEtymology extends Document {
  wordId: mongoose.Types.ObjectId
  origin: string
  historicalForms: Array<{
    period: string
    form: string
    meaning: string
    script?: string
  }>
  linguisticFamily: string
  relatedLanguages: Array<{
    language: string
    word: string
    meaning: string
  }>
  culturalContext: string
  firstRecorded?: string
  evolution: string
  sources: Array<{
    title: string
    author?: string
    year?: number
    type: "book" | "paper" | "oral" | "manuscript"
  }>
  createdBy: mongoose.Types.ObjectId
  verifiedBy?: mongoose.Types.ObjectId
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}

const WordEtymologySchema = new Schema(
  {
    wordId: {
      type: Schema.Types.ObjectId,
      ref: "Word",
      required: true,
      unique: true,
    },
    origin: {
      type: String,
      required: true,
      trim: true,
    },
    historicalForms: [
      {
        period: {
          type: String,
          required: true,
        },
        form: {
          type: String,
          required: true,
        },
        meaning: {
          type: String,
          required: true,
        },
        script: {
          type: String,
        },
      },
    ],
    linguisticFamily: {
      type: String,
      required: true,
      default: "Sino-Tibetan",
    },
    relatedLanguages: [
      {
        language: {
          type: String,
          required: true,
        },
        word: {
          type: String,
          required: true,
        },
        meaning: {
          type: String,
          required: true,
        },
      },
    ],
    culturalContext: {
      type: String,
      required: true,
    },
    firstRecorded: {
      type: String,
    },
    evolution: {
      type: String,
      required: true,
    },
    sources: [
      {
        title: {
          type: String,
          required: true,
        },
        author: {
          type: String,
        },
        year: {
          type: Number,
        },
        type: {
          type: String,
          enum: ["book", "paper", "oral", "manuscript"],
          required: true,
        },
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

export default mongoose.models.WordEtymology || mongoose.model<IWordEtymology>("WordEtymology", WordEtymologySchema)
