import mongoose, { Schema, type Document } from "mongoose"

export interface IForumPost extends Document {
  title: string
  content: string
  category: "general" | "etymology" | "culture" | "learning" | "translation" | "dialect"
  tags: string[]
  author: mongoose.Types.ObjectId
  wordReference?: mongoose.Types.ObjectId
  replies: mongoose.Types.ObjectId[]
  likes: mongoose.Types.ObjectId[]
  views: number
  isPinned: boolean
  isLocked: boolean
  lastActivity: Date
  createdAt: Date
  updatedAt: Date
}

const ForumPostSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    category: {
      type: String,
      enum: ["general", "etymology", "culture", "learning", "translation", "dialect"],
      required: true,
      default: "general",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    wordReference: {
      type: Schema.Types.ObjectId,
      ref: "Word",
    },
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: "ForumReply",
      },
    ],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

ForumPostSchema.index({ category: 1, createdAt: -1 })
ForumPostSchema.index({ author: 1 })
ForumPostSchema.index({ tags: 1 })

export default mongoose.models.ForumPost || mongoose.model<IForumPost>("ForumPost", ForumPostSchema)
