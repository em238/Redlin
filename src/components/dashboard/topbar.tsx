"use client";

import { Menu, Moon, Sun, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore, DashboardSection } from "@/lib/store";
import { useT } from "@/lib/i18n";

export function DashboardTopbar() {
  const { dashboardSection, setSidebarOpen, theme, toggleTheme } = useAppStore();
  const { t } = useT();

  const TITLES: Record<DashboardSection, { title: string; subtitle: string }> = {
    hero: { title: t("d.nav.hero"), subtitle: t("d.topbar.heroSub") },
    about: { title: t("d.nav.about"), subtitle: t("d.topbar.aboutSub") },
    services: { title: t("d.nav.services"), subtitle: t("d.topbar.servicesSub") },
    "how-it-works": { title: t("d.nav.howItWorks"), subtitle: t("d.topbar.howItWorksSub") },
    videos: { title: t("d.nav.videos"), subtitle: t("d.topbar.videosSub") },
    partners: { title: t("d.nav.partners"), subtitle: t("d.topbar.partnersSub") },
    map: { title: t("d.nav.map"), subtitle: t("d.topbar.mapSub") },
    contact: { title: t("d.nav.contact"), subtitle: t("d.topbar.contactSub") },
    reviews: { title: t("d.nav.reviews"), subtitle: t("d.topbar.reviewsSub") },
    users: { title: t("d.nav.users"), subtitle: t("d.topbar.usersSub") },
    roles: { title: t("d.nav.roles"), subtitle: t("d.topbar.rolesSub") },
    settings: { title: t("d.nav.settings"), subtitle: t("d.topbar.settingsSub") },
  };

  const current = TITLES[dashboardSection] || { title: "", subtitle: "" };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/95">
      <div className="h-full px-4 sm:px-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden rounded-full" onClick={() => setSidebarOpen(true)}>
          <Menu className="w-5 h-5" />
        </Button>

        <div className="min-w-0">
          <h1 className="text-lg font-black truncate">{current.title}</h1>
          <p className="text-xs text-muted-foreground truncate hidden sm:block">{current.subtitle}</p>
        </div>

        <div className="ms-auto flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={t("d.topbar.search")} className="h-9 w-48 pe-9 bg-muted/50 border-0" />
          </div>
          <Button variant="ghost" size="icon" className="rounded-full relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 end-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-background" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={toggleTheme}>
            {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
