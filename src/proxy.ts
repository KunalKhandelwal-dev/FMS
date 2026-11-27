import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/my-work",
  "/employees",
  "/teams",
  "/jobs",
  "/tasks",
  "/deliverables",
  "/approvals",
  "/productivity",
  "/branding-jobs",
  "/analytics",
  "/roi",
  "/settings",
];

const SESSION_COOKIE = "fms_session";

/**
 * Next.js 16 Navigation Proxy Guard
 * Acts as a coarse routing filter. Deep authorization is strictly enforced
 * in Server Actions, Route Handlers, and domain services.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;

  const isProtectedPath = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtectedPath && !sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && sessionToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public|images|icons|api/health).*)"],
};
