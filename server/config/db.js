import mongoose from "mongoose";

let connectionPromise = null;

export async function ensureDatabaseConnection() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not configured. Add it to your .env file.");
  }

  if (mongoose.connection.readyState === 1) return;

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    }).finally(() => {
      connectionPromise = null;
    });
  }

  await connectionPromise;
}

export async function connectDatabase() {
  await ensureDatabaseConnection();
  console.log("MongoDB connected");
}
