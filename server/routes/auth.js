import express from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { GardenPlant } from "../models/GardenPlant.js";
import { PLANT_SEED_DATA } from "../data/plants.js";
import { STARTER_TASKS } from "../data/tasks.js";
import { CareTask } from "../models/CareTask.js";
import { requireAuth } from "../middleware/auth.js";
import { signToken } from "../utils/auth.js";

const router = express.Router();


async function seedStarterGarden(userId) {
  const existing = await GardenPlant.countDocuments({ user: userId });
  if (existing > 0) return;
  const starters = PLANT_SEED_DATA.slice(0, 5).map((plant, index) => ({
    user: userId,
    clientId: `starter-${plant.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index}`,
    name: plant.name,
    botanicalName: plant.botanicalName,
    type: plant.category === "Vegetables" ? "Vegetable" : plant.category === "Flowers" ? "Flower" : plant.category === "Succulents" ? "Succulent" : "Herb",
    emoji: plant.emoji,
    status: "Healthy",
    statusType: "healthy",
    sunlight: plant.sunlight,
    water: plant.water,
    watered: "Watered Today",
    moisture: 75,
    description: plant.description,
    careTips: plant.careTips,
    plantedDate: new Date(Date.now() - (index + 1) * 7 * 86400000).toISOString().slice(0, 10),
    growthDays: plant.growthDays,
    growthTime: plant.growthTime,
    harvestAdvice: plant.harvestAdvice,
    harvestType: plant.harvestType,
  }));
  await GardenPlant.insertMany(starters);
}


async function seedStarterTasks(userId) {
  const existing = await CareTask.countDocuments({ user: userId });
  if (existing > 0) return;
  await CareTask.insertMany(STARTER_TASKS.map((task) => ({ ...task, user: userId })));
}

function serializeUser(user) {
  return {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    role: user.role || "user",
    bio: user.bio || "",
    gardenUpdates: Boolean(user.gardenUpdates),
  };
}

router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName = "", email, phone = "", password, gardenUpdates = false } = req.body || {};
    if (!firstName?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: "First name, email and password are required." });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must contain at least 6 characters." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(409).json({ message: "An account with this email already exists." });

    const passwordHash = await bcrypt.hash(String(password), 12);
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: String(lastName).trim(),
      name: `${firstName.trim()} ${String(lastName).trim()}`.trim(),
      email: normalizedEmail,
      phone: String(phone).trim(),
      passwordHash,
      gardenUpdates: Boolean(gardenUpdates),
    });

    const token = signToken(user);
    return res.status(201).json({ token, user: serializeUser(user) });
  } catch (error) {
    console.error("register", error);
    if (error?.code === 11000) return res.status(409).json({ message: "An account with this email already exists." });
    return res.status(500).json({ message: "Unable to create the account right now." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email?.trim() || !password) return res.status(400).json({ message: "Email and password are required." });

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(401).json({ message: "Incorrect email or password." });

    const valid = await bcrypt.compare(String(password), user.passwordHash);
    if (!valid) return res.status(401).json({ message: "Incorrect email or password." });

    const token = signToken(user);
    return res.json({ token, user: serializeUser(user) });
  } catch (error) {
    console.error("login", error);
    return res.status(500).json({ message: "Unable to log in right now." });
  }
});

router.post("/demo-account", async (_req, res) => {
  try {
    const email = "demo@gardenguide.local";
    let user = await User.findOne({ email });
    if (!user) {
      const passwordHash = await bcrypt.hash(`demo-${Date.now()}`, 12);
      user = await User.create({
        firstName: "Demo",
        lastName: "Gardener",
        name: "Demo Gardener",
        email,
        phone: "",
        passwordHash,
        gardenUpdates: true,
      });
    }
    await seedStarterGarden(user._id);
    await seedStarterTasks(user._id);
    const token = signToken(user);
    return res.json({ token, user: serializeUser(user), demo: true });
  } catch (error) {
    console.error("demo-account", error);
    return res.status(500).json({ message: "Demo sign-in is unavailable." });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  return res.json({ user: serializeUser(req.user) });
});

router.put("/profile", requireAuth, async (req, res) => {
  try {
    const { name, firstName, lastName, email, phone, role, bio, gardenUpdates } = req.body || {};
    if (email && email.trim().toLowerCase() !== req.user.email) {
      const taken = await User.findOne({ email: email.trim().toLowerCase(), _id: { $ne: req.user._id } });
      if (taken) return res.status(409).json({ message: "That email is already in use." });
    }

    const user = await User.findById(req.user._id);
    if (firstName !== undefined) user.firstName = String(firstName).trim();
    if (lastName !== undefined) user.lastName = String(lastName).trim();
    if (name !== undefined) user.name = String(name).trim();
    else user.name = `${user.firstName} ${user.lastName}`.trim();
    if (email !== undefined) user.email = String(email).trim().toLowerCase();
    if (phone !== undefined) user.phone = String(phone).trim();
    if (role !== undefined && req.user.role === "admin") user.role = role === "admin" ? "admin" : "user";
    if (bio !== undefined) user.bio = String(bio);
    if (gardenUpdates !== undefined) user.gardenUpdates = Boolean(gardenUpdates);
    await user.save();

    return res.json({ user: serializeUser(user), token: signToken(user) });
  } catch (error) {
    console.error("profile", error);
    if (error?.code === 11000) return res.status(409).json({ message: "That email is already in use." });
    return res.status(500).json({ message: "Unable to update profile." });
  }
});

export default router;
