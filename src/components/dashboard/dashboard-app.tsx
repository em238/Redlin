"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
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
import { DashboardSettings } from "./settings";
import { Loader2 } from "lucide-react";
import { useT } from "@/lib/i18n";

export function DashboardApp() {
  const { user, authChecked, setUser, setAuthChecked, dashboardSection, theme } = useAppStore();
  const { t } = useT();

  // restore theme from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("redline-theme") as "light" | "dark" | null;
      if (saved && saved !== theme) {
        useAppStore.getState().setTheme(saved);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // check session
  useEffect(() => {
    if (authChecked) return;
    apiGet<{ user: any }>("/api/auth/me")
      .then((r) => setUser(r.user))
      .catch(() => setUser(null))
      .finally(() => setAuthChecked(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked]);

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
    users: <DashboardUsers />,
    roles: <DashboardRoles />,
    settings: <DashboardSettings />,
  };

  return (
    <div className="min-h-screen flex bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopbar />
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={dashboardSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {sections[dashboardSection]}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
