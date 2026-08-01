import { cookies } from "next/headers";
import { verifyAdminJWT, type AdminJWTPayload } from "./jwt";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAllowedAdmin(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export async function getAdminSession(): Promise<AdminJWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;

  const payload = verifyAdminJWT(token);
  if (!payload) return null;

  // Double-check email is still in allowlist
  if (!isAllowedAdmin(payload.email)) return null;

  return payload;
}
