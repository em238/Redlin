"use client";

import { DashboardApp } from "@/components/dashboard/dashboard-app";

/**
 * Dedicated /dashboard route.
 *
 * Previously the dashboard was a temporary in-memory view toggled inside
 * the public homepage (`/`), which meant any browser refresh reset the
 * Zustand state and bounced the user back to the public site.
 *
 * Now /dashboard is its own App Router route:
 *   - middleware.ts + layout.tsx are in place (the layout no longer
 *     redirects — see the comment in layout.tsx for why).
 *   - This client page renders <DashboardApp>, which:
 *       1. Restores theme from localStorage.
 *       2. Calls /api/auth/me to verify the session (shows a full-screen
 *          loader while checking — never falls back to the public page).
 *       3. Reads ?tab= from the URL on mount and re-opens the exact
 *          section the user was working on. Section changes sync back to
 *          the URL via history.replaceState, so a refresh preserves the
 *          active tab. Also mirrored to localStorage as a fallback for
 *          direct /dashboard visits with no ?tab=.
 */
export default function DashboardPage() {
  return <DashboardApp />;
}
