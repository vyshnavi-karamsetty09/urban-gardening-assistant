import mongoose from "mongoose";

const gardenPlantSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    clientId: { type: String, trim: true, default: "" },
    name: { type: String, required: true, trim: true },
    botanicalName: { type: String, trim: true, default: "" },
    type: { type: String, trim: true, default: "Herb" },
    emoji: { type: String, default: "🌿" },
    status: { type: String, default: "Healthy" },
    statusType: { type: String, default: "healthy" },
    sunlight: { type: String, default: "4–6 hrs" },
    water: { type: String, default: "Moderate" },
    watered: { type: String, default: "Not watered yet" },
    moisture: { type: Number, default: 70 },
    image: { type: String, default: "" },
    description: { type: String, default: "" },
    careTips: { type: String, default: "" },
    plantedDate: { type: String, default: "" },
    growthDays: { type: Number, default: 60 },
    growthTime: { type: String, default: "60 days" },
    harvestAdvice: { type: String, default: "Harvest when mature." },
    harvestType: { type: String, default: "continuous" },
  },
  { timestamps: true }
);

export const GardenPlant = mongoose.model("GardenPlant", gardenPlantSchema);
