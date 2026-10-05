import mongoose from "mongoose";

const environmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true, index: true },
    configured: { type: Boolean, default: false },
    pincode: { type: String, trim: true, default: "" },
    location: { type: String, default: "" },
    space: { type: String, default: "" },
    soil: { type: String, default: "" },
    medium: { type: String, default: "" },
    watering: { type: String, default: "" },
    sunlight: { type: String, default: "" },
    temperature: { type: String, default: "" },
    climate: { type: String, default: "" },
    humidity: { type: String, default: "" },
    soilMoisture: { type: String, default: "" },
    rainfall: { type: String, default: "" },
    experience: { type: String, default: "" },
    numericTemp: { type: String, default: "" },
    numericHumidity: { type: String, default: "" },
    locationConfidence: { type: String, default: "" },
    locationLabel: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Environment = mongoose.model("Environment", environmentSchema);
