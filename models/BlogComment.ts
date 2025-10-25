import mongoose, { Schema, type Document } from "mongoose"

export interface IBlogComment extends Document {
  blog: mongoose.Types.ObjectId
  author: mongoose.Types.ObjectId
  content: string
  likes: number
  likedBy?: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const BlogCommentSchema = new Schema(
  {
    blog: {
      type: Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Comment content is required"],
      maxlength: [1000, "Comment should not exceed 1000 characters"],
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
  },
  { timestamps: true },
)

BlogCommentSchema.index({ blog: 1, createdAt: -1 })
BlogCommentSchema.index({ author: 1 })

export default mongoose.models.BlogComment || mongoose.model<IBlogComment>("BlogComment", BlogCommentSchema)
