"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { PublicPage } from "@/components/site/public-page";
import { DashboardApp } from "@/components/dashboard/dashboard-app";

export default function Page() {
  const { view, theme, setTheme } = useAppStore();

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

  return view === "public" ? <PublicPage /> : <DashboardApp />;
}
