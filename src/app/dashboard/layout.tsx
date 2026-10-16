import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "لوحة التحكم | Redline Dashboard",
  description: "Redline shipping — admin dashboard",
  robots: { index: false, follow: false },
  icons: {
    icon: "/icon.png?v=3",
    shortcut: "/favicon.ico?v=3",
  },
};

/**
 * Dashboard layout.
 *
 * Auth flow:
 *   - middleware.ts stamps the request with `x-redline-authed: 1` if the
 *     session cookie is present (informational only — no redirect).
 *   - This layout deliberately does NOT redirect unauthenticated users to
 *     `/`, because that would make the login screen on /dashboard
 *     unreachable. Instead, the client component (DashboardApp) calls
 *     /api/auth/me on mount and renders one of:
 *       1. A full-screen loader while verifying the session.
 *       2. The login screen (DashboardLogin) if no user.
 *       3. The dashboard (sidebar + topbar + active section) if user is set.
 *   - Refreshing /dashboard?tab=services with a valid cookie re-runs the
 *     same flow and lands the user back on the Services section — they are
 *     never bounced to the public site.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
