import express from "express";
import mongoose from "mongoose";
import { User } from "../models/User.js";
import { Plant } from "../models/Plant.js";
import { DiseaseReport } from "../models/DiseaseReport.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth, requireAdmin);

router.get("/users", async (_req, res) => {
  try {
    const users = await User.find().select("firstName lastName name email role createdAt").sort({ createdAt: -1 }).lean();
    res.json({ users });
  } catch (error) {
    console.error("admin get users:", error);
    res.status(500).json({ message: "Unable to fetch users." });
  }
});

router.get("/reports", async (_req, res) => {
  try {
    const reports = await DiseaseReport.find().populate("user", "name email").sort({ createdAt: -1 }).limit(100).lean();
    res.json({ reports });
  } catch (error) {
    console.error("admin get reports:", error);
    res.status(500).json({ message: "Unable to fetch reports." });
  }
});

router.get("/plants", async (_req, res) => {
  try {
    const plants = await Plant.find().sort({ category: 1, name: 1 }).lean();
    res.json({ plants });
  } catch (error) {
    console.error("admin get plants:", error);
    res.status(500).json({ message: "Unable to fetch plants." });
  }
});

router.post("/plants", async (req, res) => {
  try {
    const payload = { ...req.body };
    delete payload._id;
    delete payload.__v;
    const plant = await Plant.create(payload);
    res.status(201).json({ plant });
  } catch (error) {
    console.error("admin add plant:", error);
    res.status(400).json({ message: "Unable to add plant." });
  }
});

router.put("/plants/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid plant ID." });
    }
    const payload = { ...req.body };
    delete payload._id;
    delete payload.__v;
    const plant = await Plant.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true }).lean();
    if (!plant) return res.status(404).json({ message: "Plant not found." });
    res.json({ plant });
  } catch (error) {
    console.error("admin update plant:", error);
    res.status(400).json({ message: "Unable to update plant." });
  }
});

router.delete("/plants/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid plant ID." });
    }
    const plant = await Plant.findByIdAndDelete(req.params.id);
    if (!plant) return res.status(404).json({ message: "Plant not found." });
    res.json({ message: "Plant deleted." });
  } catch (error) {
    console.error("admin delete plant:", error);
    res.status(500).json({ message: "Unable to delete plant." });
  }
});

export default router;
