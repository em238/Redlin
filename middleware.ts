import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "redline_session";

/**
 * Middleware gate for /dashboard.
 *
 * Purpose: ensures a logged-in admin (cookie present) can refresh any
 * /dashboard URL (e.g. /dashboard?tab=services) WITHOUT being bounced
 * back to the public site. This fixes the previous "refresh throws you
 * out" bug, which happened because the dashboard was a temporary
 * in-memory view toggled inside the public homepage.
 *
 * Auth verification flow:
 *   - If the session cookie exists → allow the request through immediately
 *     (no redirect to /). The actual session-vs-DB check still happens
 *     server-side in /api/auth/me, called from the dashboard client.
 *   - If the session cookie is absent → still allow through to /dashboard
 *     so the client-side auth check can show the login screen directly on
 *     /dashboard (better UX than bouncing to / and forcing a re-click).
 *   - For all other paths → pass through unchanged.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    const session = request.cookies.get(SESSION_COOKIE)?.value;
    // Stamp the request so the server layout can short-circuit if needed.
    const res = NextResponse.next();
    if (session) {
      res.headers.set("x-redline-authed", "1");
    }
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
