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
    return res.json({ environment: serializeEnvironment(doc, true) });
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
    };
    safe.pincode = String(safe.pincode || "").replace(/\D/g, "").slice(0, 6);
    delete safe.configured;
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
