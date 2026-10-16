"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";

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
  // ThemeProvider config:
  //   - attribute="class"      → toggles the `dark` class on <html>
  //   - defaultTheme="light"   → LIGHT is the primary/intended theme
  //   - enableSystem={false}   → never fall back to the OS's color-scheme
  //                              (which used to silently default to dark
  //                              on systems with dark mode at the OS level)
  //   - storageKey="redline_dashboard_theme"
  //                            → persisted in localStorage under this key.
  //                              On refresh, next-themes injects an inline
  //                              script BEFORE hydration that reads this
  //                              key and applies the `dark` class — so
  //                              there is NO theme flash on reload.
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
