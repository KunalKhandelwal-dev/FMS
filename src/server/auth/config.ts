import bcrypt from "bcryptjs";
import { env } from "@/lib/env";

export const AUTH_CONFIG = {
  cookieName: "fms_session",
  sessionMaxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
  saltRounds: 12,
  secretKey: new TextEncoder().encode(env.AUTH_SECRET),
};

export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(AUTH_CONFIG.saltRounds);
  return bcrypt.hash(plainText, salt);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

