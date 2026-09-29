import express from "express";
import mongoose from "mongoose";
import { CareTask } from "../models/CareTask.js";
import { requireAuth } from "../middleware/auth.js";

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
    const tasks = await CareTask.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
    return res.json({ tasks: tasks.map((t) => serialize(t)) });
  } catch (error) {
    console.error("tasks get", error);
    return res.status(500).json({ message: "Unable to load care tasks." });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const payload = { ...req.body, user: req.user._id };
    delete payload._id;
    const task = await CareTask.create(payload);
    return res.status(201).json({ task: serialize(task) });
  } catch (error) {
    console.error("tasks post", error);
    return res.status(400).json({ message: "Unable to create the care task." });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const payload = { ...req.body };
    delete payload._id;
    delete payload.user;
    const task = await CareTask.findOneAndUpdate(
      buildIdQuery(req.params.id, req.user._id),
      payload,
      { new: true, runValidators: true }
    ).lean();
    if (!task) return res.status(404).json({ message: "Care task not found." });
    return res.json({ task: serialize(task) });
  } catch (error) {
    console.error("tasks put", error);
    return res.status(400).json({ message: "Unable to update the care task." });
  }
});

router.delete("/", requireAuth, async (req, res) => {
  try {
    const result = await CareTask.deleteMany({ user: req.user._id });
    return res.json({ message: "All tasks cleared.", deleted: result.deletedCount });
  } catch (error) {
    console.error("tasks clear", error);
    return res.status(500).json({ message: "Unable to clear care tasks." });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const deleted = await CareTask.findOneAndDelete(buildIdQuery(req.params.id, req.user._id));
    if (!deleted) return res.status(404).json({ message: "Care task not found." });
    return res.json({ message: "Task removed." });
  } catch (error) {
    console.error("tasks delete", error);
    return res.status(400).json({ message: "Unable to remove the care task." });
  }
});

export default router;
