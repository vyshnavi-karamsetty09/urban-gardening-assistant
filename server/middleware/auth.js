import { User } from "../models/User.js";
import { ensureDatabaseConnection } from "../config/db.js";
import { verifyToken } from "../utils/auth.js";

export async function requireAuth(req, res, next) {
  try {
    await ensureDatabaseConnection();
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (!token) return res.status(401).json({ message: "Authentication required." });

    const payload = verifyToken(token);
    const user = await User.findById(payload.userId).select("-passwordHash");
    if (!user) return res.status(401).json({ message: "User account not found." });

    req.user = user;
    next();
  } catch (error) {
    if (error?.name === "MongooseServerSelectionError" || /MONGODB_URI|server selection|ECONN|SSL|Mongo/i.test(String(error?.message || ""))) {
      return res.status(503).json({ message: "Garden Guide database is temporarily unavailable. Please try again." });
    }
    return res.status(401).json({ message: "Your session is invalid or expired." });
  }
}

export async function optionalAuth(req, _res, next) {
  try {
    const header = req.headers?.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (token) {
      const payload = verifyToken(token);
      const user = await User.findById(payload.userId).select("-passwordHash");
      if (user) req.user = user;
    }
  } catch {
    // Ignore invalid tokens for optional auth
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Administrator access is required." });
  }
  next();
}

