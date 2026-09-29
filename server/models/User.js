import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, trim: true, required: true },
    lastName: { type: String, trim: true, default: "" },
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true, lowercase: true, unique: true, required: true, index: true },
    phone: { type: String, trim: true, default: "" },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    bio: { type: String, trim: true, default: "" },
    gardenUpdates: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
