"use client";

import { Menu, Moon, Sun, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore, DashboardSection } from "@/lib/store";

const TITLES: Record<DashboardSection, { title: string; subtitle: string }> = {
  overview: { title: "نظرة عامة", subtitle: "ملخص أداء عمليات الشحن" },
  shipments: { title: "إدارة الشحنات", subtitle: "كل الشحنات وتتبّع حالاتها" },
  orders: { title: "الطلبات الجديدة", subtitle: "طلبات العملاء من الموقع" },
  customers: { title: "العملاء", subtitle: "قاعدة عملاء Redline" },
  videos: { title: "إدارة الفيديوهات", subtitle: "ارفع وأدر الفيديوهات المعروضة بالموقع" },
  pricing: { title: "الأسعار والتغطية", subtitle: "أسعار المحافظات وخدمات الشحن" },
  messages: { title: "الرسائل", subtitle: "رسائل التواصل من العملاء" },
  settings: { title: "الإعدادات", subtitle: "إعدادات الحساب والنظام" },
};

export function DashboardTopbar() {
  const { dashboardSection, setSidebarOpen, theme, toggleTheme } = useAppStore();
  const t = TITLES[dashboardSection];

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="h-full px-4 sm:px-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden rounded-full" onClick={() => setSidebarOpen(true)}>
          <Menu className="w-5 h-5" />
        </Button>

        <div className="min-w-0">
          <h1 className="text-lg font-black truncate">{t.title}</h1>
          <p className="text-xs text-muted-foreground truncate hidden sm:block">{t.subtitle}</p>
        </div>

        <div className="mr-auto flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="بحث..." className="h-9 w-48 pr-9 bg-muted/50 border-0" />
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
