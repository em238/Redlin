"use client";

import { PublicPage } from "@/components/site/public-page";

export default function Page() {
  // Theme is now owned by next-themes (ThemeProvider in
  // src/lib/providers.tsx). It defaults to "light", persists under
  // localStorage["redline_dashboard_theme"], and injects a no-flash
  // inline script before hydration — so no manual restore + apply
  // logic is needed here anymore. Refreshing the public page keeps
  // the user's saved theme (defaulting to light on first visit) with
  // zero flash.
  //
  // The admin dashboard lives at its own /dashboard route — this
  // public homepage no longer toggles between public and dashboard
  // views.
  return <PublicPage />;
}
