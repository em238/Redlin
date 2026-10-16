import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "لوحة التحكم | Redline Dashboard",
  description: "Redline shipping — admin dashboard",
  robots: { index: false, follow: false },
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
  },
};

/**
 * Admin layout.
 *
 * Auth flow:
 *   - This layout deliberately does NOT redirect unauthenticated users to
 *     `/`. Instead, the client component (DashboardApp) calls /api/auth/me
 *     on mount and renders one of:
 *       1. A full-screen loader while verifying the session.
 *       2. The login screen (DashboardLogin) if no user.
 *       3. The dashboard (sidebar + topbar + active section) if user is set.
 *   - Refreshing /admin?tab=services with a valid cookie re-runs the same
 *     flow and lands the user back on the Services section — they are
 *     never bounced to the public site.
 *   - On logout, the sidebar/settings set `user=null` + `authChecked=true`
 *     which causes DashboardApp to show the login form on /admin — no
 *     redirect to `/` happens.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
