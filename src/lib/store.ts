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
  // theme
  theme: "light" | "dark";
  toggleTheme: () => void;
  setTheme: (t: "light" | "dark") => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  dashboardSection: "hero",
  setDashboardSection: (s) => set({ dashboardSection: s }),
  user: null,
  setUser: (u) => set({ user: u }),
  authChecked: false,
  setAuthChecked: (b) => set({ authChecked: b }),
  sidebarOpen: false,
  setSidebarOpen: (b) => set({ sidebarOpen: b }),
  theme: "light",
  toggleTheme: () => {
    const next = get().theme === "light" ? "dark" : "light";
    set({ theme: next });
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", next === "dark");
    }
    try { localStorage.setItem("redline-theme", next); } catch {}
  },
  setTheme: (t) => {
    set({ theme: t });
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", t === "dark");
    }
  },
}));
