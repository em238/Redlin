import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "redline_session";

/**
 * Middleware gate for /admin and /dashboard.
 *
 * Both routes render the same <DashboardApp> component. The middleware
 * stamps the request with `x-redline-authed: 1` if the session cookie is
 * present (informational only — never redirects to /).
 *
 * Auth flow:
 *   - If the session cookie exists → allow through (no redirect).
 *   - If the session cookie is absent → still allow through so the
 *     client-side auth check shows the login screen on /admin.
 *   - Never redirects to / (the public site).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/")
  ) {
    const session = request.cookies.get(SESSION_COOKIE)?.value;
    const res = NextResponse.next();
    if (session) {
      res.headers.set("x-redline-authed", "1");
    }
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/dashboard", "/dashboard/:path*"],
};
