import express from "express";
import { DiseaseReport } from "../models/DiseaseReport.js";
import { classifySymptoms } from "../data/diseases.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

async function callAIDiagnosis(payload) {
  const geminiKey = process.env.GEMINI_API_KEY;

  const apiKey =
    process.env.AI_API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.GARDEN_AI_API_KEY ||
    geminiKey;

  if (!apiKey) return null;

  const defaultBaseUrl = geminiKey
    ? "https://generativelanguage.googleapis.com/v1beta/openai"
    : "https://api.openai.com/v1";

  const baseUrl = (
    process.env.AI_BASE_URL ||
    process.env.OPENAI_BASE_URL ||
    defaultBaseUrl
  ).replace(/\/$/, "");

  const model =
    process.env.AI_MODEL ||
    process.env.OPENAI_MODEL ||
    (geminiKey ? "gemini-3.6-flash" : "gpt-4o-mini");
  const prompt = `Analyze these plant symptoms as a cautious gardening assistant. Plant: ${payload.plantName || "unknown"}. Symptoms: ${(payload.symptoms || []).join(", ") || "none provided; inspect the attached leaf image if available"}. Return JSON only with fields diseaseName, confidence (0-100), advice. Do not claim certainty; phrase it as an assessment.`;
  const content = [{ type: "text", text: prompt }];
  if (payload.imageDataUrl && /^data:image\/(png|jpeg|jpg|webp);base64,/i.test(payload.imageDataUrl)) {
    content.push({ type: "image_url", image_url: { url: payload.imageDataUrl } });
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are a cautious plant-health assistant. Assess symptoms and visible plant images when supplied. Do not present uncertain assessments as confirmed diagnoses." },
        { role: "user", content },
      ],
    }),
  });
  if (!response.ok) throw new Error(`AI provider returned ${response.status}`);
  const data = await response.json();
  const rawContent = data?.choices?.[0]?.message?.content;
  const text = typeof rawContent === "string" ? rawContent : "";
  if (!text) return null;
  return JSON.parse(text);
}

router.post("/analyze", requireAuth, async (req, res) => {
  try {
    const symptoms = Array.isArray(req.body?.symptoms) ? req.body.symptoms.filter(Boolean).slice(0, 12) : [];
    const plantName = String(req.body?.plantName || "").trim();
    if (!symptoms.length && !req.body?.imageProvided) {
      return res.status(400).json({ message: "Provide at least one symptom or an image." });
    }

    const local = classifySymptoms(symptoms);
    let result = null;
    let source = "rules";
    try {
      const ai = await callAIDiagnosis({
        plantName,
        symptoms,
        imageDataUrl: typeof req.body?.imageDataUrl === "string" && req.body.imageDataUrl.length <= 6000000
          ? req.body.imageDataUrl
          : "",
      });
      if (ai?.diseaseName) {
        result = {
          diseaseId: local.diseaseId,
          diseaseName: String(ai.diseaseName),
          confidence: Math.max(0, Math.min(100, Number(ai.confidence) || local.confidence)),
          advice: String(ai.advice || local.advice),
        };
        source = "ai";
      }
    } catch (error) {
      console.warn("disease AI fallback:", error.message);
    }

    if (!result && symptoms.length === 0) {
      return res.status(422).json({
        message: "Image-based analysis is not available right now. Add plant symptoms or configure the AI provider for image analysis.",
      });
    }

    result ||= local;
    const report = await DiseaseReport.create({
      user: req.user._id,
      plantName,
      symptoms,
      diseaseId: result.diseaseId,
      diseaseName: result.diseaseName,
      confidence: result.confidence,
      source,
    });

    return res.json({ result: { ...result, source, reportId: report._id.toString() } });
  } catch (error) {
    console.error("disease analyze", error);
    return res.status(500).json({ message: "Unable to analyze plant symptoms right now." });
  }
});

router.get("/history", requireAuth, async (req, res) => {
  try {
    const reports = await DiseaseReport.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20).lean();
    return res.json({ reports });
  } catch (error) {
    console.error("disease history", error);
    return res.status(500).json({ message: "Unable to load disease history." });
  }
});

export default router;
