import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDatabase } from "./config/db.js";
import { Plant } from "./models/Plant.js";
import { User } from "./models/User.js";
import { PLANT_SEED_DATA } from "./data/plants.js";

await connectDatabase();

for (const plant of PLANT_SEED_DATA) {
  await Plant.findOneAndUpdate({ name: plant.name }, plant, { upsert: true, new: true, setDefaultsOnInsert: true });
}

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
if (email && password) {
  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, 12);
  await User.findOneAndUpdate(
    { email: normalizedEmail },
    { $set: { firstName: "Garden", lastName: "Admin", name: "Garden Admin", role: "admin", passwordHash } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(`Admin account ready: ${normalizedEmail}`);
}

console.log(`Seeded ${PLANT_SEED_DATA.length} plants.`);
await mongoose.disconnect();
