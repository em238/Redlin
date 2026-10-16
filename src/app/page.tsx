"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { PublicPage } from "@/components/site/public-page";

export default function Page() {
  const { theme, setTheme } = useAppStore();

  // restore theme from storage on first paint
  useEffect(() => {
    try {
      const saved = localStorage.getItem("redline-theme") as "light" | "dark" | null;
      if (saved && saved !== theme) setTheme(saved);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // apply theme class on changes
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // The admin dashboard now lives at its own route /dashboard — this public
  // homepage no longer toggles between public and dashboard views. Refreshing
  // /dashboard stays on /dashboard (preserving the auth session and the
  // active ?tab= query parameter), so users are never bounced back here.
  return <PublicPage />;
}
