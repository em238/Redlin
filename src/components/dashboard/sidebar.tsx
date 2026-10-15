"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Package, ShoppingCart, Users, Video, DollarSign,
  MessageSquare, Settings, LogOut, X, Globe, ChevronLeft, ImageIcon, Handshake
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAppStore, DashboardSection } from "@/lib/store";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";
import { useT } from "@/lib/i18n";

export function DashboardSidebar() {
  const { dashboardSection, setDashboardSection, sidebarOpen, setSidebarOpen, user, setUser, setView, setAuthChecked } = useAppStore();
  const { t } = useT();

  const NAV: { id: DashboardSection; label: string; icon: any }[] = [
    { id: "overview", label: t("d.nav.overview"), icon: LayoutDashboard },
    { id: "shipments", label: t("d.nav.shipments"), icon: Package },
    { id: "orders", label: t("d.nav.orders"), icon: ShoppingCart },
    { id: "customers", label: t("d.nav.customers"), icon: Users },
    { id: "videos", label: t("d.nav.videos"), icon: Video },
    { id: "hero-images", label: t("d.nav.heroImages"), icon: ImageIcon },
    { id: "partners", label: t("d.nav.partners"), icon: Handshake },
    { id: "pricing", label: t("d.nav.pricing"), icon: DollarSign },
    { id: "messages", label: t("d.nav.messages"), icon: MessageSquare },
    { id: "settings", label: t("d.nav.settings"), icon: Settings },
  ];

  const logout = async () => {
    try { await apiPost("/api/auth/logout"); } catch {}
    setUser(null);
    setAuthChecked(true);
    setView("public");
    toast.success(t("d.sidebar.logoutToast"));
  };

  const content = (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex items-center justify-between p-5 border-b border-sidebar-border">
        <button onClick={() => setView("public")} className="flex items-center group focus:outline-none">
          <Image
            src="/redline-transport-logo.png"
            alt="RedLine Transport"
            width={600}
            height={257}
            className="h-9 w-auto object-contain transition-transform group-hover:scale-105 dark:[filter:invert(1)_hue-rotate(180deg)]"
          />
        </button>
        <Button variant="ghost" size="icon" className="lg:hidden rounded-full" onClick={() => setSidebarOpen(false)}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* User */}
      <div className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-sidebar-accent">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-red-700 flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0) || "A"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-sm truncate">{user?.name}</div>
            <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {NAV.map((item) => {
          const active = dashboardSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { setDashboardSection(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-gradient-to-l from-primary to-red-700 text-white shadow-md shadow-primary/25"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1 text-right">{item.label}</span>
              {active && <ChevronLeft className="w-4 h-4" />}
            </button>
          );
        })}
      </nav>

      {/* Footer actions */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button
          onClick={() => setView("public")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent transition-colors"
        >
          <Globe className="w-5 h-5" />
          {t("d.sidebar.viewSite")}
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {t("d.sidebar.logout")}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 border-l border-sidebar-border">
        {content}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 lg:hidden"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
