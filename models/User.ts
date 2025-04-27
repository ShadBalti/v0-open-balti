import mongoose, { Schema, type Document } from "mongoose"
import { hash } from "bcryptjs"

export interface IUser extends Document {
  name: string
  email: string
  password: string
  image?: string
  role: "user" | "admin" | "contributor"
  emailVerified?: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [8, "Password should be at least 8 characters long"],
    },
    image: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin", "contributor"],
      default: "user",
    },
    emailVerified: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next()
  }

  try {
    this.password = await hash(this.password, 12)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Check if the model is already defined to prevent overwriting during hot reloads
export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
