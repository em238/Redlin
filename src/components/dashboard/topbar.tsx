"use client";

import { Menu, Moon, Sun, Globe } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore, DashboardSection } from "@/lib/store";
import { useI18n, useDashboardT } from "@/lib/i18n";

export function DashboardTopbar() {
  const { dashboardSection, setSidebarOpen } = useAppStore();
  const { theme, setTheme } = useTheme();
  const { t } = useDashboardT();
  const { dashboardLocale, setDashboardLocale } = useI18n();

  const TITLES: Record<DashboardSection, { title: string; subtitle: string }> = {
    hero: { title: t("d.nav.hero"), subtitle: t("d.topbar.heroSub") },
    about: { title: t("d.nav.about"), subtitle: t("d.topbar.aboutSub") },
    subscribers: { title: t("d.nav.subscribers"), subtitle: t("d.topbar.subscribersSub") },
    services: { title: t("d.nav.services"), subtitle: t("d.topbar.servicesSub") },
    "how-it-works": { title: t("d.nav.howItWorks"), subtitle: t("d.topbar.howItWorksSub") },
    videos: { title: t("d.nav.videos"), subtitle: t("d.topbar.videosSub") },
    partners: { title: t("d.nav.partners"), subtitle: t("d.topbar.partnersSub") },
    map: { title: t("d.nav.map"), subtitle: t("d.topbar.mapSub") },
    contact: { title: t("d.nav.contact"), subtitle: t("d.topbar.contactSub") },
    messages: { title: "الرسائل", subtitle: "صندوق الرسائل الواردة" },
    reviews: { title: t("d.nav.reviews"), subtitle: t("d.topbar.reviewsSub") },
    footer: { title: t("d.nav.footer"), subtitle: t("d.topbar.footerSub") },
    users: { title: t("d.nav.users"), subtitle: t("d.topbar.usersSub") },
    roles: { title: t("d.nav.roles"), subtitle: t("d.topbar.rolesSub") },
    settings: { title: t("d.nav.settings"), subtitle: t("d.topbar.settingsSub") },
  };

  const current = TITLES[dashboardSection] || { title: "", subtitle: "" };

  return (
    <header className="sticky top-0 z-30 h-16 shrink-0 border-b border-slate-200 dark:border-slate-800 bg-background/95 w-full">
      <div className="h-full px-4 sm:px-6 flex items-center gap-4 w-full">
        <Button variant="ghost" size="icon" className="lg:hidden rounded-full" onClick={() => setSidebarOpen(true)}>
          <Menu className="w-5 h-5" />
        </Button>

        <div className="min-w-0">
          <h1 className="text-lg font-black truncate">{current.title}</h1>
          <p className="text-xs text-muted-foreground truncate hidden sm:block">{current.subtitle}</p>
        </div>

        <div className="ms-auto flex items-center gap-2">
          {/* Dashboard language switcher — independent from public site */}
          <Button
            variant="ghost"
            size="sm"
            className="rounded-lg gap-1.5 text-xs font-semibold"
            onClick={() => setDashboardLocale(dashboardLocale === "ar" ? "en" : "ar")}
          >
            <Globe className="w-4 h-4" />
            {dashboardLocale === "ar" ? "English" : "عربي"}
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
