"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState, useEffect } from "react";

// The 5 curated dark theme palettes. The admin picks one from the
// Dashboard Settings; the choice is persisted in localStorage
// ("redline_dark_variant") and applied to <html> as data-dark-theme="..."
// so the CSS variable overrides in globals.css take effect instantly.
export const DARK_PALETTES = [
  {
    id: "slate",
    nameAr: "سليت مودرن",
    nameEn: "Slate Modern",
    bg: "#0f172a",
    surface: "#1e293b",
    border: "#334155",
    accent: "#dc2626",
  },
  {
    id: "pure",
    nameAr: "أسود نقي OLED",
    nameEn: "OLED Pure Black",
    bg: "#000000",
    surface: "#0d0d0d",
    border: "#222222",
    accent: "#dc2626",
  },
  {
    id: "navy",
    nameAr: "كحلي منتصف الليل",
    nameEn: "Midnight Navy",
    bg: "#070d18",
    surface: "#0f1a2e",
    border: "#1e2f4d",
    accent: "#dc2626",
  },
  {
    id: "zinc",
    nameAr: "زينك تك",
    nameEn: "Zinc Tech",
    bg: "#09090b",
    surface: "#18181b",
    border: "#27272a",
    accent: "#dc2626",
  },
  {
    id: "crimson",
    nameAr: "كريمسون ريدلاين",
    nameEn: "Redline Dark Crimson",
    bg: "#100709",
    surface: "#1c0d12",
    border: "#361620",
    accent: "#dc2626",
  },
] as const;

export const DARK_VARIANT_STORAGE_KEY = "redline_dark_variant";

/** Read the saved dark palette variant from localStorage (client-side). */
export function getDarkVariant(): string {
  if (typeof window === "undefined") return "slate";
  try {
    return localStorage.getItem(DARK_VARIANT_STORAGE_KEY) || "slate";
  } catch {
    return "slate";
  }
}

/** Apply the data-dark-theme attribute to <html> so CSS overrides take effect. */
export function applyDarkVariant(variant: string) {
  if (typeof document === "undefined") return;
  const validVariants = DARK_PALETTES.map((p) => p.id);
  const v = validVariants.includes(variant as any) ? variant : "slate";
  document.documentElement.setAttribute("data-dark-theme", v);
  try {
    localStorage.setItem(DARK_VARIANT_STORAGE_KEY, v);
  } catch {}
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  // On mount: read the saved dark variant from localStorage and apply it.
  // This runs AFTER hydration so there's no SSR mismatch. The CSS overrides
  // apply instantly via the data-dark-theme attribute on <html>.
  useEffect(() => {
    const variant = getDarkVariant();
    applyDarkVariant(variant);
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="redline_dashboard_theme"
      disableTransitionOnChange
    >
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </ThemeProvider>
  );
}
