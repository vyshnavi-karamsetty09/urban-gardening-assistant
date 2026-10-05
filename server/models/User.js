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
    notificationPreferences: {
      morningWatering: { type: Boolean, default: true },
      weatherAlerts: { type: Boolean, default: true },
      diseaseWarnings: { type: Boolean, default: true },
      aiRecommendations: { type: Boolean, default: true },
    },
    preferences: {
      tempUnit: { type: String, default: "Celsius (°C)" },
      measurementUnit: { type: String, default: "Metric (cm / m)" },
      autoWaterLogging: { type: Boolean, default: true },
      theme: { type: String, enum: ["light", "dark"], default: "light" },
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
