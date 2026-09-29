import mongoose from "mongoose";

const plantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    botanicalName: { type: String, default: "" },
    category: { type: String, default: "Herbs" },
    difficulty: { type: String, default: "Easy" },
    sunlight: { type: String, default: "4–6 hrs" },
    water: { type: String, default: "Moderate" },
    wateringNeed: { type: String, enum: ["Low", "Moderate", "High"], default: "Moderate" },
    temp: { type: String, default: "20–30°C" },
    soil: { type: String, default: "Well-draining" },
    growthTime: { type: String, default: "60 days" },
    growthDays: { type: Number, default: 60 },
    harvestAdvice: { type: String, default: "Harvest when mature." },
    harvestType: { type: String, default: "continuous" },
    description: { type: String, default: "" },
    careTips: { type: String, default: "" },
    emoji: { type: String, default: "🌱" },
    imageUrl: { type: String, default: "" },
    spaces: { type: [String], default: ["Small", "Medium"] },
    climates: { type: [String], default: ["Tropical", "Subtropical", "Temperate"] },
  },
  { timestamps: true }
);

export const Plant = mongoose.model("Plant", plantSchema);
