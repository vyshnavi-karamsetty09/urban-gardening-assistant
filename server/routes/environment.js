import express from "express";
import { Environment } from "../models/Environment.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
const EMPTY_ENVIRONMENT = {
  pincode: "",
  location: "",
  space: "",
  soil: "",
  medium: "",
  watering: "",
  sunlight: "",
  temperature: "",
  climate: "",
  humidity: "",
  locationConfidence: "",
  locationLabel: "",
  soilMoisture: "",
  rainfall: "",
  experience: "",
  numericTemp: "",
  numericHumidity: "",
};

function serializeEnvironment(doc, configured) {
  const source = doc && typeof doc === "object" ? doc : {};
  return {
    ...EMPTY_ENVIRONMENT,
    ...source,
    pincode: String(source.pincode || "").replace(/\D/g, "").slice(0, 6),
    configured,
  };
}

router.get("/", requireAuth, async (req, res) => {
  try {
    const doc = await Environment.findOne({ user: req.user._id }).lean();
    if (!doc) {
      return res.json({ environment: serializeEnvironment(null, false) });
    }
    return res.json({ environment: serializeEnvironment(doc, doc.configured === true) });
  } catch (error) {
    console.error("environment get", error);
    return res.status(500).json({ message: "Unable to load environment settings." });
  }
});

router.put("/", requireAuth, async (req, res) => {
  try {
    const incoming = req.body && typeof req.body === "object" ? req.body : {};
    const safe = {
      ...EMPTY_ENVIRONMENT,
      ...incoming,
      configured: true,
    };
    safe.pincode = String(safe.pincode || "").replace(/\D/g, "").slice(0, 6);

    const required = ["pincode", "location", "space", "sunlight", "medium", "watering", "soilMoisture", "experience"];
    const missing = required.filter((field) => !String(safe[field] || "").trim());
    if (!/^\d{6}$/.test(safe.pincode) || missing.length > 0) {
      return res.status(422).json({
        message: "Complete the growing environment before saving it.",
        missingFields: missing,
      });
    }
    delete safe._id;
    delete safe.user;
    delete safe.__v;
    delete safe.createdAt;
    delete safe.updatedAt;

    const doc = await Environment.findOneAndUpdate(
      { user: req.user._id },
      { ...safe, user: req.user._id },
      { upsert: true, new: true, setDefaultsOnInsert: false }
    ).lean();
    return res.json({ environment: serializeEnvironment(doc, true) });
  } catch (error) {
    console.error("environment put", error);
    return res.status(500).json({ message: "Unable to save environment settings." });
  }
});

export default router;
