"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Package, Boxes, ListChecks, Video, DollarSign,
  MessageSquare, Settings, LogOut, X, Globe, ChevronLeft, ImageIcon, Handshake, Users, ShieldCheck
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAppStore, DashboardSection } from "@/lib/store";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";
import { useDashboardT } from "@/lib/i18n";

export function DashboardSidebar() {
  const { dashboardSection, setDashboardSection, sidebarOpen, setSidebarOpen, user, setUser, setView, setAuthChecked } = useAppStore();
  const { t } = useDashboardT();

  const NAV: { id: DashboardSection; label: string; icon: any }[] = [
    { id: "hero", label: t("d.nav.hero"), icon: ImageIcon },
    { id: "about", label: t("d.nav.about"), icon: LayoutDashboard },
    { id: "services", label: t("d.nav.services"), icon: Boxes },
    { id: "how-it-works", label: t("d.nav.howItWorks"), icon: ListChecks },
    { id: "videos", label: t("d.nav.videos"), icon: Video },
    { id: "partners", label: t("d.nav.partners"), icon: Handshake },
    { id: "map", label: t("d.nav.map"), icon: Globe },
    { id: "contact", label: t("d.nav.contact"), icon: MessageSquare },
    { id: "reviews", label: t("d.nav.reviews"), icon: DollarSign },
    { id: "users", label: t("d.nav.users"), icon: Users },
    { id: "roles", label: t("d.nav.roles"), icon: ShieldCheck },
    { id: "settings", label: t("d.nav.settings"), icon: Settings },
  ];

  const logout = async () => {
    try {
      await apiPost("/api/auth/logout", {});
    } catch {}
    setUser(null);
    setAuthChecked(false);
    setView("public");
    toast.success(t("d.sidebar.logoutSuccess"));
  };

  const content = (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex items-center justify-between p-5 border-b border-sidebar-border">
        <button onClick={() => setView("public")} className="flex items-center group focus:outline-none">
          <Image
            src="/redline-transport-logo.png"
            alt="RedLine Transport"
            width={1200}
            height={514}
            className="h-9 w-auto max-w-none object-contain transition-transform group-hover:scale-105"
          />
        </button>
        <Button variant="ghost" size="icon" className="lg:hidden rounded-full" onClick={() => setSidebarOpen(false)}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* User chip */}
      {user && (
        <div className="px-5 py-3 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-red-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {user.name?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{user.name}</div>
              <div className="text-[11px] text-muted-foreground truncate">{user.email}</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {NAV.map((item) => {
          const isActive = dashboardSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setDashboardSection(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-gradient-to-l from-primary to-red-700 text-white shadow-md shadow-primary/25"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" strokeWidth={1.8} />
              <span className="flex-1 text-start">{item.label}</span>
              {isActive && <ChevronLeft className="w-4 h-4" />}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button
          onClick={() => setView("public")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
        >
          <LayoutDashboard className="w-5 h-5 shrink-0" strokeWidth={1.8} />
          {t("d.sidebar.viewSite")}
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" strokeWidth={1.8} />
          {t("d.sidebar.logout")}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 border-r border-sidebar-border">
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
              className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="lg:hidden fixed top-0 start-0 bottom-0 w-72 z-50"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
