import express from "express";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

function localAnswer(message) {
  const lower = String(message || "").toLowerCase();
  if (lower.includes("water")) return "Check the top 1–2 inches of soil first. Water deeply at the soil line when the top layer is dry, and make sure your container drains freely.";
  if (lower.includes("sun") || lower.includes("light")) return "Match the plant to the available light. Fruiting vegetables usually need several hours of direct sun, while many foliage plants tolerate bright indirect light.";
  if (lower.includes("soil") || lower.includes("potting")) return "Use a light, well-draining container mix. Good drainage is just as important as nutrients for preventing stressed roots.";
  if (lower.includes("fertil")) return "Feed actively growing container plants lightly and consistently. Water the soil before applying fertilizer to reduce root stress.";
  if (lower.includes("pest") || lower.includes("aphid") || lower.includes("mite")) return "Inspect new growth and leaf undersides first. Isolate affected plants, wash pests away gently, and keep monitoring new growth.";
  if (lower.includes("yellow")) return "Yellowing can come from watering imbalance, poor drainage, nutrient issues, or insufficient light. Check the soil moisture and root-zone drainage before changing anything.";
  return `For “${message}”, start by checking soil moisture, drainage, light exposure, and recent changes in your plant's environment. I can also help you troubleshoot watering, sunlight, soil, pests, or plant symptoms.`;
}

async function callAI(message, context) {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) return null;

  const baseUrl = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.AI_MODEL || "gpt-4o-mini";

  const system = `You are Garden Guide, a helpful urban-gardening assistant. Give concise, practical advice for balcony, terrace, and indoor gardening. Never invent live weather data. User context: ${JSON.stringify(context || {})}`;
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      messages: [
        { role: "system", content: system },
        { role: "user", content: String(message || "") },
      ],
    }),
  });
  if (!response.ok) throw new Error(`AI provider returned ${response.status}`);
  const data = await response.json();
  return data?.choices?.[0]?.message?.content?.trim() || null;
}

router.post("/chat", requireAuth, async (req, res) => {
  const message = String(req.body?.message || "").trim();
  if (!message) return res.status(400).json({ message: "Enter a gardening question." });

  try {
    const answer = await callAI(message, req.body?.context || {});
    return res.json({
      answer: answer || localAnswer(message),
      source: answer ? "ai" : "local-fallback",
    });
  } catch (error) {
    console.warn("assistant AI fallback:", error.message);
    return res.json({ answer: localAnswer(message), source: "local-fallback" });
  }
});

export default router;
