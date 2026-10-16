"use client";

import { DashboardApp } from "@/components/dashboard/dashboard-app";

/**
 * /admin route — the ONLY entry point to the dashboard.
 *
 * Visitors on the public site never see a link or button to the dashboard.
 * The admin must type the direct URL: /admin (or /dashboard which redirects
 * here via the middleware matcher).
 *
 * Auth flow:
 *   1. DashboardApp restores theme from localStorage.
 *   2. Calls /api/auth/me to verify the session (shows a full-screen loader
 *      while checking — never falls back to the public page).
 *   3. If no session → renders <DashboardLogin> on /admin (no redirect to /).
 *   4. If session valid → renders the dashboard (sidebar + topbar + sections).
 *   5. On logout → user state is cleared, authChecked stays true → login
 *      form renders immediately on /admin (no redirect to /).
 */
export default function AdminPage() {
  return <DashboardApp />;
}
