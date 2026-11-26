import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { AUTH_CONFIG } from "./config";
import type { SessionUser } from "@/types/auth";
import { env } from "@/lib/env";

export interface SessionPayload {
  sub: string; // User ID
  email: string;
  fullName: string;
  role: string;
  departmentId: string | null;
  status: string;
  iat?: number;
  exp?: number;
}

/**
 * Creates a signed JWT session token.
 */
export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    sub: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    departmentId: user.departmentId,
    status: user.status,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${AUTH_CONFIG.sessionMaxAgeSeconds}s`)
    .sign(AUTH_CONFIG.secretKey);
}

/**
 * Verifies a JWT session token.
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, AUTH_CONFIG.secretKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Sets session cookie in response headers.
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_CONFIG.cookieName, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_CONFIG.sessionMaxAgeSeconds,
  });
}

/**
 * Clears session cookie on logout.
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_CONFIG.cookieName, "", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Reads session payload from incoming cookie.
 */
export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

