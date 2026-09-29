import mongoose from "mongoose";

const careTaskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    clientId: { type: String, default: "" },
    title: { type: String, required: true, trim: true },
    plantName: { type: String, default: "Garden Plant" },
    plantType: { type: String, default: "General" },
    plantEmoji: { type: String, default: "🌱" },
    plantImage: { type: String, default: "" },
    description: { type: String, default: "" },
    type: { type: String, default: "water" },
    time: { type: String, default: "08:00 AM" },
    priority: { type: String, default: "Medium" },
    frequency: { type: String, default: "Daily" },
    why: { type: String, default: "" },
    how: { type: [String], default: [] },
    tools: { type: String, default: "" },
    weatherNote: { type: String, default: "" },
    completed: { type: Boolean, default: false },
    icon: { type: String, default: "💧" },
  },
  { timestamps: true }
);

export const CareTask = mongoose.model("CareTask", careTaskSchema);
