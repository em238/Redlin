"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Boxes, ListChecks, Video, DollarSign,
  MessageSquare, Settings, LogOut, X, Globe, ChevronLeft,
  ImageIcon, Handshake, Users, ShieldCheck, PanelLeftClose, PanelLeftOpen,
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

  // Collapsed state — lazy init from localStorage
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    try { return localStorage.getItem("dashboard_sidebar_collapsed") === "true"; } catch { return false; }
  });
  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem("dashboard_sidebar_collapsed", String(next)); } catch {}
      return next;
    });
  }, []);

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
    try { await apiPost("/api/auth/logout", {}); } catch {}
    setUser(null); setAuthChecked(false); setView("public");
    toast.success(t("d.sidebar.logoutSuccess"));
  };

  const sidebarContent = (
    <div className="flex flex-col h-full w-full bg-sidebar text-sidebar-foreground p-0 m-0">
      {/* === TOP: Logo + Collapse toggle === */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <button onClick={() => setView("public")} className="flex items-center group focus:outline-none overflow-hidden">
          <Image
            src="/redline-transport-logo.png"
            alt="RedLine Transport"
            width={1200}
            height={514}
            className={`transition-all duration-300 ${collapsed ? "h-0 w-0 opacity-0" : "h-8 w-auto opacity-100"}`}
          />
        </button>
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:flex rounded-lg shrink-0 h-8 w-8"
          onClick={toggleCollapsed}
        >
          {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden rounded-lg shrink-0 h-8 w-8"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* === MIDDLE: Navigation (flex-1, scrollable) === */}
      <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-2 space-y-1">
        {NAV.map((item) => {
          const isActive = dashboardSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { setDashboardSection(item.id); setSidebarOpen(false); }}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                collapsed ? "justify-center" : "justify-start"
              } ${
                isActive
                  ? "bg-gradient-to-l from-primary to-red-700 text-white shadow-md shadow-primary/25"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" strokeWidth={1.8} />
              {!collapsed && <span className="flex-1 text-start truncate">{item.label}</span>}
              {!collapsed && isActive && <ChevronLeft className="w-4 h-4 shrink-0" />}
            </button>
          );
        })}
      </nav>

      {/* === BOTTOM: User profile + Footer actions === */}
      <div className="border-t border-slate-200 dark:border-slate-800 px-3 py-2 space-y-1 shrink-0">
        {/* User profile card */}
        {user && (
          <div
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800/50 ${collapsed ? "justify-center" : ""}`}
            title={collapsed ? `${user.name}\n${user.email}` : undefined}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-red-700 flex items-center justify-center text-white font-bold text-xs shrink-0">
              {user.name?.charAt(0).toUpperCase() || "A"}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold truncate text-start">{user.name}</div>
                <div className="text-[10px] text-muted-foreground truncate text-start">{user.email}</div>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <button
          onClick={logout}
          title={collapsed ? t("d.sidebar.logout") : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors whitespace-nowrap ${
            collapsed ? "justify-center" : "justify-start"
          }`}
        >
          <LogOut className="w-5 h-5 shrink-0" strokeWidth={1.8} />
          {!collapsed && <span className="text-start">{t("d.sidebar.logout")}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar — collapsible, flush to edge, seamless border */}
      <aside
        className={`hidden lg:flex shrink-0 h-screen sticky top-0 p-0 m-0 overflow-hidden transition-all duration-300 ease-in-out border-e border-slate-200 dark:border-slate-800 ${
          collapsed ? "w-[64px]" : "w-60"
        }`}
      >
        {sidebarContent}
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
              className="lg:hidden fixed inset-0 z-40 bg-black/50"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="lg:hidden fixed top-0 start-0 bottom-0 w-60 z-50 h-screen p-0 m-0 overflow-hidden border-e border-slate-200 dark:border-slate-800"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
