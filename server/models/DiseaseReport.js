import mongoose from "mongoose";

const diseaseReportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    plantName: { type: String, default: "" },
    symptoms: { type: [String], default: [] },
    diseaseId: { type: String, default: "" },
    diseaseName: { type: String, default: "" },
    confidence: { type: Number, default: 0 },
    source: { type: String, default: "rules" },
  },
  { timestamps: true }
);

export const DiseaseReport = mongoose.model("DiseaseReport", diseaseReportSchema);
