import { create } from "zustand";

export type DashboardSection =
  | "hero"
  | "about"
  | "services"
  | "how-it-works"
  | "videos"
  | "partners"
  | "map"
  | "contact"
  | "reviews"
  | "footer"
  | "users"
  | "roles"
  | "settings";

interface AppState {
  // NOTE: `view`/`setView` were removed. The dashboard is no longer a
  // temporary in-memory view toggled inside the public homepage — it now
  // lives at its own /dashboard route. Public ↔ Dashboard navigation is
  // done via router.push("/") and router.push("/dashboard"), so the URL
  // is the single source of truth (and refresh preserves everything).
  dashboardSection: DashboardSection;
  setDashboardSection: (s: DashboardSection) => void;
  // auth
  user: { id: string; name: string; email: string; role: string } | null;
  setUser: (u: AppState["user"]) => void;
  // loading auth check
  authChecked: boolean;
  setAuthChecked: (b: boolean) => void;
  // mobile sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (b: boolean) => void;
  // NOTE: `theme`/`toggleTheme`/`setTheme` were removed. Theme is now
  // owned by next-themes (ThemeProvider in src/lib/providers.tsx). All
  // components that need to read or toggle the theme use the `useTheme()`
  // hook from next-themes. This:
  //   - Defaults to "light" (no more dark flash on refresh).
  //   - Persists under localStorage["redline_dashboard_theme"].
  //   - Injects a no-flash inline script before hydration.
}

export const useAppStore = create<AppState>((set) => ({
  dashboardSection: "hero",
  setDashboardSection: (s) => set({ dashboardSection: s }),
  user: null,
  setUser: (u) => set({ user: u }),
  authChecked: false,
  setAuthChecked: (b) => set({ authChecked: b }),
  sidebarOpen: false,
  setSidebarOpen: (b) => set({ sidebarOpen: b }),
}));

