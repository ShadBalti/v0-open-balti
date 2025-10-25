import mongoose, { Schema, type Document } from "mongoose"

export interface IBlog extends Document {
  title: string
  slug: string
  content: string
  excerpt?: string
  author: mongoose.Types.ObjectId
  tags?: string[]
  category?: string
  series?: string
  featured?: boolean
  featuredImage?: string
  coverImage?: string
  views: number
  likes: number
  likedBy?: mongoose.Types.ObjectId[]
  published: boolean
  isMarkdown?: boolean
  readingTime?: number
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
  ogImage?: string
  isContribution?: boolean
  contributorNotes?: string
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
      enum: [
        "Language",
        "Culture",
        "Updates",
        "Tutorials",
        "Learn Balti",
        "Cultural Articles",
        "Community Contributions",
        "Project Updates",
      ],
    },
    series: {
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
    coverImage: {
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
    isMarkdown: {
      type: Boolean,
      default: true,
    },
    readingTime: {
      type: Number,
      default: 0,
    },
    seoTitle: {
      type: String,
      maxlength: [60, "SEO title should not exceed 60 characters"],
    },
    seoDescription: {
      type: String,
      maxlength: [160, "SEO description should not exceed 160 characters"],
    },
    seoKeywords: {
      type: [String],
      default: [],
    },
    ogImage: {
      type: String,
    },
    isContribution: {
      type: Boolean,
      default: false,
    },
    contributorNotes: {
      type: String,
    },
  },
  { timestamps: true },
)

// Create text indexes for search
BlogSchema.index({ title: "text", content: "text", tags: "text" })
BlogSchema.index({ slug: 1 })
BlogSchema.index({ author: 1 })
BlogSchema.index({ published: 1, createdAt: -1 })
BlogSchema.index({ category: 1 })
BlogSchema.index({ series: 1 })

export default mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema)
