"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { apiGet } from "@/lib/api";
import { DashboardLogin } from "./login";
import { DashboardSidebar } from "./sidebar";
import { DashboardTopbar } from "./topbar";
import { DashboardOverview } from "./overview";
import { DashboardShipments } from "./shipments";
import { DashboardOrders } from "./orders";
import { DashboardCustomers } from "./customers";
import { DashboardVideos } from "./videos";
import { DashboardPricing } from "./pricing";
import { DashboardMessages } from "./messages";
import { DashboardSettings } from "./settings";
import { Loader2 } from "lucide-react";

export function DashboardApp() {
  const { user, authChecked, setUser, setAuthChecked, dashboardSection, theme } = useAppStore();

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
          <p className="text-sm text-muted-foreground">جاري التحقق...</p>
        </div>
      </div>
    );
  }

  if (!user) return <DashboardLogin />;

  const sections: Record<string, React.ReactNode> = {
    overview: <DashboardOverview />,
    shipments: <DashboardShipments />,
    orders: <DashboardOrders />,
    customers: <DashboardCustomers />,
    videos: <DashboardVideos />,
    pricing: <DashboardPricing />,
    messages: <DashboardMessages />,
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
