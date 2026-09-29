import jwt from "jsonwebtoken";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured.");
  return secret;
};

export function signToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role || "user" },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}
