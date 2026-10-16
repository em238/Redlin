"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore, DashboardSection } from "@/lib/store";
import { apiGet } from "@/lib/api";
import { DashboardLogin } from "./login";
import { DashboardSidebar } from "./sidebar";
import { DashboardTopbar } from "./topbar";
import { DashboardHero } from "./hero";
import { DashboardAbout } from "./about";
import { DashboardServices } from "./services";
import { DashboardHowItWorks } from "./how-it-works";
import { DashboardVideos } from "./videos";
import { DashboardPartners } from "./partners";
import { DashboardMapHubs } from "./map-hubs";
import { DashboardContactInfo } from "./contact-info";
import { DashboardReviews } from "./reviews";
import { DashboardUsers } from "./users";
import { DashboardRoles } from "./roles";
import { DashboardFooterLinks } from "./footer-links";
import { DashboardSettings } from "./settings";
import { Loader2 } from "lucide-react";
import { useT, useDashboardT, useI18n } from "@/lib/i18n";

const VALID_TABS: DashboardSection[] = [
  "hero", "about", "services", "how-it-works", "videos", "partners",
  "map", "contact", "reviews", "footer", "users", "roles", "settings",
];
const TAB_STORAGE_KEY = "redline_dashboard_active_tab";

function readUrlTab(): DashboardSection | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const t = params.get("tab") as DashboardSection | null;
  return t && VALID_TABS.includes(t) ? t : null;
}

function writeUrlTab(tab: DashboardSection) {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  if (params.get("tab") === tab) return; // no-op if already in sync
  params.set("tab", tab);
  // replaceState avoids creating a new history entry or scrolling/jumping.
  // Path uses a trailing slash to match Next.js's `trailingSlash: true`
  // config + the chat preview gateway's URL normalization — this prevents
  // an extra 308 redirect on refresh.
  window.history.replaceState({}, "", `/admin/?${params.toString()}`);
}

export function DashboardApp() {
  const { user, authChecked, setUser, setAuthChecked, dashboardSection, setDashboardSection } = useAppStore();
  const { t } = useDashboardT();
  const { dashboardLocale } = useI18n();

  // NOTE: theme restore logic was removed. next-themes (ThemeProvider in
  // src/lib/providers.tsx) now owns the theme: it defaults to "light",
  // persists under localStorage["redline_dashboard_theme"], and injects
  // a no-flash inline script before hydration. No more dark flash on
  // refresh.

  // Check session on first mount (verifies the httpOnly cookie against the DB)
  useEffect(() => {
    if (authChecked) return;
    apiGet<{ user: any }>("/api/auth/me")
      .then((r) => setUser(r.user))
      .catch(() => setUser(null))
      .finally(() => setAuthChecked(true));
  }, [authChecked, setUser, setAuthChecked]);

  // ── Tab persistence: URL ↔ store + localStorage ───────────────────────
  // Single effect that handles both directions to avoid race conditions:
  //   • Initial mount: read URL ?tab= (or localStorage fallback) → set store.
  //     We do NOT write back to the URL on this run — otherwise the stale
  //     store default ("hero") would clobber a valid ?tab=users on refresh.
  //   • Subsequent runs (user clicked a different tab in the sidebar):
  //     store → URL (replaceState, no scroll jump) + mirror to localStorage.
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      // ── Initial mount: URL/localStorage → store (one-way) ──
      didMountRef.current = true;
      let nextTab: DashboardSection | null = readUrlTab();
      if (!nextTab) {
        // Fallback to localStorage if URL has no valid ?tab=
        try {
          const saved = localStorage.getItem(TAB_STORAGE_KEY) as DashboardSection | null;
          if (saved && VALID_TABS.includes(saved)) nextTab = saved;
        } catch {}
      }
      if (nextTab && nextTab !== dashboardSection) {
        setDashboardSection(nextTab);
      } else if (nextTab) {
        // Already in sync — just make sure the URL reflects it
        writeUrlTab(nextTab);
      }
      return;
    }

    // ── After mount: store → URL + localStorage ──
    try { localStorage.setItem(TAB_STORAGE_KEY, dashboardSection); } catch {}
    writeUrlTab(dashboardSection);
  }, [dashboardSection, setDashboardSection]);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t("d.app.checking")}</p>
        </div>
      </div>
    );
  }

  if (!user) return <DashboardLogin />;

  const sections: Record<string, React.ReactNode> = {
    hero: <DashboardHero />,
    about: <DashboardAbout />,
    services: <DashboardServices />,
    "how-it-works": <DashboardHowItWorks />,
    videos: <DashboardVideos />,
    partners: <DashboardPartners />,
    map: <DashboardMapHubs />,
    contact: <DashboardContactInfo />,
    reviews: <DashboardReviews />,
    footer: <DashboardFooterLinks />,
    users: <DashboardUsers />,
    roles: <DashboardRoles />,
    settings: <DashboardSettings />,
  };

  return (
    <div
      className="flex h-screen w-full overflow-hidden bg-background"
      dir={dashboardLocale === "ar" ? "rtl" : "ltr"}
      lang={dashboardLocale}
    >
      <DashboardSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0 p-0 m-0">
        <DashboardTopbar />
        <main className="flex-1 min-w-0 overflow-y-auto p-3 bg-background">
          <AnimatePresence mode="wait">
            <motion.div
              key={dashboardSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="w-full"
            >
              {sections[dashboardSection]}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
