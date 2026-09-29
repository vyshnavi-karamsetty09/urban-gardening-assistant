import express from "express";
import { Plant } from "../models/Plant.js";
import { PLANT_SEED_DATA } from "../data/plants.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const plants = await Plant.find().sort({ category: 1, name: 1 }).lean();
    return res.json({ plants: plants.length ? plants : PLANT_SEED_DATA });
  } catch (error) {
    console.error("plants get", error);
    return res.json({ plants: PLANT_SEED_DATA, fallback: true });
  }
});

export default router;
