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
    overview: { title: t("d.topbar.overview"), subtitle: t("d.topbar.overviewSub") },
    shipments: { title: t("d.topbar.shipments"), subtitle: t("d.topbar.shipmentsSub") },
    orders: { title: t("d.topbar.orders"), subtitle: t("d.topbar.ordersSub") },
    customers: { title: t("d.topbar.customers"), subtitle: t("d.topbar.customersSub") },
    videos: { title: t("d.topbar.videos"), subtitle: t("d.topbar.videosSub") },
    "hero-images": { title: t("d.topbar.heroImages"), subtitle: t("d.topbar.heroImagesSub") },
    partners: { title: t("d.topbar.partners"), subtitle: t("d.topbar.partnersSub") },
    pricing: { title: t("d.topbar.pricing"), subtitle: t("d.topbar.pricingSub") },
    messages: { title: t("d.topbar.messages"), subtitle: t("d.topbar.messagesSub") },
    settings: { title: t("d.topbar.settings"), subtitle: t("d.topbar.settingsSub") },
  };

  const current = TITLES[dashboardSection];

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="h-full px-4 sm:px-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden rounded-full" onClick={() => setSidebarOpen(true)}>
          <Menu className="w-5 h-5" />
        </Button>

        <div className="min-w-0">
          <h1 className="text-lg font-black truncate">{current.title}</h1>
          <p className="text-xs text-muted-foreground truncate hidden sm:block">{current.subtitle}</p>
        </div>

        <div className="mr-auto flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={t("d.topbar.search")} className="h-9 w-48 pr-9 bg-muted/50 border-0" />
          </div>
          <Button variant="ghost" size="icon" className="rounded-full relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-background" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={toggleTheme}>
            {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
