"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { User, Bell, Globe, Shield, Palette, Save, Moon, Sun, LogOut, Truck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";
import { useDashboardT } from "@/lib/i18n";

export function DashboardSettings() {
  const router = useRouter();
  const { user, setUser, setAuthChecked, theme, toggleTheme } = useAppStore();
  const { t, isAr } = useDashboardT();
  const L = (ar: string, en: string) => (isAr ? ar : en);
  const [profile, setProfile] = useState({ name: user?.name || "", email: user?.email || "" });
  const [notifications, setNotifications] = useState({ email: true, push: true, orders: true, messages: false });

  const logout = async () => {
    try { await apiPost("/api/auth/logout"); } catch {}
    setUser(null);
    setAuthChecked(true);
    router.push("/");
    toast.success(t("d.settings.toastLogout"));
  };

  const notifList = [
    { key: "email", label: t("d.settings.notif.emailLabel"), desc: t("d.settings.notif.emailDesc") },
    { key: "push", label: t("d.settings.notif.pushLabel"), desc: t("d.settings.notif.pushDesc") },
    { key: "orders", label: t("d.settings.notif.ordersLabel"), desc: t("d.settings.notif.ordersDesc") },
    { key: "messages", label: t("d.settings.notif.messagesLabel"), desc: t("d.settings.notif.messagesDesc") },
  ];

  return (
    <div className="space-y-5 w-full">
      {/* Section Context Banner */}
      <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 mb-4">
        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          📍 {L("مكان الظهور: ", "Appears at: ")}{L("إعدادات الحساب والنظام", "Account & system settings")}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
          {L("داخلي", "Internal")}
        </span>
      </div>

      {/* Profile */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold">{t("d.settings.profile.title")}</h3>
            <p className="text-xs text-muted-foreground">{t("d.settings.profile.sub")}</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm">{t("d.settings.l.name")}</Label>
            <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="h-10" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">{t("d.settings.l.email")}</Label>
            <Input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="h-10" dir="ltr" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Badge className="bg-primary/10 text-primary border-primary/30">{t("d.settings.rolePrefix")} {t("d.settings.roleValue")}</Badge>
          <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30">{t("d.settings.active")}</Badge>
        </div>
        <div className="mt-4">
          <Button className="bg-gradient-to-r from-primary to-red-700 text-white gap-2">
            <Save className="w-4 h-4" /> {t("d.settings.saveChanges")}
          </Button>
        </div>
      </Card>

      {/* Appearance */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Palette className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold">{t("d.settings.appearance.title")}</h3>
            <p className="text-xs text-muted-foreground">{t("d.settings.appearance.sub")}</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40">
          <div className="flex items-center gap-3">
            {theme === "light" ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-primary" />}
            <div>
              <div className="font-semibold text-sm">{t("d.settings.currentTheme")}</div>
              <div className="text-xs text-muted-foreground">{theme === "light" ? t("d.settings.light") : t("d.settings.dark")}</div>
            </div>
          </div>
          <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold">{t("d.settings.notif.title")}</h3>
            <p className="text-xs text-muted-foreground">{t("d.settings.notif.sub")}</p>
          </div>
        </div>
        <div className="space-y-3">
          {notifList.map((n) => (
            <div key={n.key} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/40">
              <div>
                <div className="font-medium text-sm">{n.label}</div>
                <div className="text-xs text-muted-foreground">{n.desc}</div>
              </div>
              <Switch
                checked={(notifications as any)[n.key]}
                onCheckedChange={(v) => setNotifications({ ...notifications, [n.key]: v })}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* System info */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Truck className="w-4 h-4 text-primary" />
            <h4 className="font-bold text-sm">{t("d.settings.system.title")}</h4>
          </div>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <div className="flex justify-between"><span>{t("d.settings.system.version")}</span><span className="font-mono text-foreground">Redline v2.4.1</span></div>
            <div className="flex justify-between"><span>{t("d.settings.system.database")}</span><span className="font-mono text-foreground">SQLite</span></div>
            <div className="flex justify-between"><span>{t("d.settings.system.timezone")}</span><span className="font-mono text-foreground">Africa/Cairo</span></div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-primary" />
            <h4 className="font-bold text-sm">{t("d.settings.security.title")}</h4>
          </div>
          <p className="text-xs text-muted-foreground mb-3">{t("d.settings.security.desc")}</p>
          <Button variant="outline" className="w-full text-rose-600 hover:text-rose-700 gap-2" onClick={logout}>
            <LogOut className="w-4 h-4" /> {t("d.settings.security.logout")}
          </Button>
        </Card>
      </div>
    </div>
  );
}
