import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDatabase } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import environmentRoutes from "./routes/environment.js";
import gardenRoutes from "./routes/garden.js";
import taskRoutes from "./routes/tasks.js";
import plantRoutes from "./routes/plants.js";
import recommendationRoutes from "./routes/recommendations.js";
import diseaseRoutes from "./routes/disease.js";
import assistantRoutes from "./routes/assistant.js";
import adminRoutes from "./routes/admin.js";
import communityRoutes from "./routes/community.js";

const app = express();
const PORT = Number(process.env.PORT || 5000);

const configuredOrigin = String(process.env.CLIENT_ORIGIN || "").trim();
const allowedOrigins = [configuredOrigin].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {

    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      (process.env.NODE_ENV !== "production" && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))
    ) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },

  credentials: true,
}));
app.use(express.json({ limit: "8mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "Garden Guide API" }));
app.use("/api/auth", authRoutes);
app.use("/api/environment", environmentRoutes);
app.use("/api/garden", gardenRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/plants", plantRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/disease", diseaseRoutes);
app.use("/api/assistant", assistantRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/community", communityRoutes);

app.use((err, _req, res, _next) => {
  console.error("Unhandled API error:", err);
  res.status(500).json({ message: "Unexpected server error." });
});

try {
  await connectDatabase();
} catch (error) {
  console.warn("Notice: Database connection issue encountered:", error.message);
  console.warn("The server will continue operating in resilient mode.");
}

app.listen(PORT, () => console.log(`Garden Guide API listening on port ${PORT}`));

