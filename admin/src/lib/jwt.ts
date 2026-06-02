import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-for-jwt-signing";

export interface AdminJWTPayload {
  adminId: string;
  email: string;
}

export function signAdminJWT(payload: AdminJWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyAdminJWT(token: string): AdminJWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminJWTPayload;
  } catch {
    return null;
  }
}
