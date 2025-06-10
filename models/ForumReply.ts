import mongoose, { Schema, type Document } from "mongoose"

export interface IForumReply extends Document {
  content: string
  author: mongoose.Types.ObjectId
  postId: mongoose.Types.ObjectId
  parentReply?: mongoose.Types.ObjectId
  likes: mongoose.Types.ObjectId[]
  isEdited: boolean
  editedAt?: Date
  createdAt: Date
  updatedAt: Date
  level: number
  replyPath: string
}

const ForumReplySchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "ForumPost",
      required: true,
    },
    parentReply: {
      type: Schema.Types.ObjectId,
      ref: "ForumReply",
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
    level: {
      type: Number,
      default: 0,
      max: 5, // Limit nesting to 5 levels
    },
    replyPath: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
)

ForumReplySchema.index({ postId: 1, replyPath: 1, createdAt: 1 })
ForumReplySchema.index({ author: 1 })

export default mongoose.models.ForumReply || mongoose.model<IForumReply>("ForumReply", ForumReplySchema)
