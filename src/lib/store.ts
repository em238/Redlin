import { create } from "zustand";

export type View = "public" | "dashboard";
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
  view: View;
  setView: (v: View) => void;
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
  view: "public",
  setView: (v) => set({ view: v }),
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
