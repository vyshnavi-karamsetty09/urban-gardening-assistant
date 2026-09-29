import mongoose from "mongoose";

const environmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true, index: true },
    pincode: { type: String, trim: true, default: "" },
    location: { type: String, default: "Balcony" },
    space: { type: String, default: "Medium" },
    soil: { type: String, default: "Potting Mix" },
    medium: { type: String, default: "Potting Mix" },
    watering: { type: String, default: "Moderate" },
    sunlight: { type: String, default: "Medium Light" },
    temperature: { type: String, default: "20°C - 30°C" },
    climate: { type: String, default: "Tropical" },
    humidity: { type: String, default: "Medium" },
    locationConfidence: { type: String, default: "estimated" },
    locationLabel: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Environment = mongoose.model("Environment", environmentSchema);
