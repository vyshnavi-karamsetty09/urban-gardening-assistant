import express from "express";
import { GardenPlant } from "../models/GardenPlant.js";
import { requireAuth } from "../middleware/auth.js";

import mongoose from "mongoose";

const router = express.Router();
function serialize(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;
  return { ...obj, id: obj._id?.toString() };
}

function buildIdQuery(id, userId) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return { $or: [{ _id: id }, { clientId: id }], user: userId };
  }
  return { clientId: id, user: userId };
}

router.get("/", requireAuth, async (req, res) => {
  try {
    const plants = await GardenPlant.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
    return res.json({ plants: plants.map((p) => serialize(p)) });
  } catch (error) {
    console.error("garden get", error);
    return res.status(500).json({ message: "Unable to load your garden." });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const payload = { ...req.body, user: req.user._id };
    delete payload._id;
    const plant = await GardenPlant.create(payload);
    return res.status(201).json({ plant: serialize(plant) });
  } catch (error) {
    console.error("garden post", error);
    return res.status(400).json({ message: "Unable to add that plant." });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const payload = { ...req.body };
    delete payload._id;
    delete payload.user;
    const plant = await GardenPlant.findOneAndUpdate(
      buildIdQuery(req.params.id, req.user._id),
      payload,
      { new: true, runValidators: true }
    ).lean();
    if (!plant) return res.status(404).json({ message: "Plant not found in your garden." });
    return res.json({ plant: serialize(plant) });
  } catch (error) {
    console.error("garden put", error);
    return res.status(400).json({ message: "Unable to update that plant." });
  }
});

router.delete("/", requireAuth, async (req, res) => {
  try {
    const result = await GardenPlant.deleteMany({ user: req.user._id });
    return res.json({ message: "Garden cleared.", deleted: result.deletedCount });
  } catch (error) {
    console.error("garden clear", error);
    return res.status(500).json({ message: "Unable to clear your garden." });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const deleted = await GardenPlant.findOneAndDelete(buildIdQuery(req.params.id, req.user._id));
    if (!deleted) return res.status(404).json({ message: "Plant not found in your garden." });
    return res.json({ message: "Plant removed." });
  } catch (error) {
    console.error("garden delete", error);
    return res.status(400).json({ message: "Unable to remove that plant." });
  }
});

export default router;
