import mongoose, { Schema, type Document } from "mongoose"

export interface IBlog extends Document {
  title: string
  slug: string
  content: string
  excerpt?: string
  author: mongoose.Types.ObjectId
  tags?: string[]
  category?: string
  featured?: boolean
  featuredImage?: string
  views: number
  likes: number
  likedBy?: mongoose.Types.ObjectId[]
  published: boolean
  createdAt: Date
  updatedAt: Date
}

const BlogSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a blog title"],
      trim: true,
      maxlength: [200, "Title should not exceed 200 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Please provide blog content"],
    },
    excerpt: {
      type: String,
      maxlength: [500, "Excerpt should not exceed 500 characters"],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      trim: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    featuredImage: {
      type: String,
    },
    views: {
      type: Number,
      default: 0,
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
    published: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

// Create text indexes for search
BlogSchema.index({ title: "text", content: "text", tags: "text" })
BlogSchema.index({ slug: 1 })
BlogSchema.index({ author: 1 })
BlogSchema.index({ published: 1, createdAt: -1 })

export default mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema)
