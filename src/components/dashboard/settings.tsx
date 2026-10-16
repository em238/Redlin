"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useAppStore } from "@/lib/store";
import { User, Bell, Globe, Shield, Palette, Save, Moon, Sun, LogOut, Truck, Check, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";
import { useDashboardT } from "@/lib/i18n";
import { DARK_PALETTES, getDarkVariant, applyDarkVariant } from "@/lib/providers";

export function DashboardSettings() {
  const { user, setUser, setAuthChecked } = useAppStore();
  const { theme, setTheme } = useTheme();
  const { t, isAr } = useDashboardT();
  const L = (ar: string, en: string) => (isAr ? ar : en);
  const [profile, setProfile] = useState({ name: user?.name || "", email: user?.email || "" });
  const [notifications, setNotifications] = useState({ email: true, push: true, orders: true, messages: false });

  // Dark theme palette variant state
  const [darkVariant, setDarkVariant] = useState("slate");
  const [savingVariant, setSavingVariant] = useState(false);

  // Load the saved variant on mount
  useEffect(() => {
    setDarkVariant(getDarkVariant());
  }, []);

  // Apply a variant instantly (live preview) — also saves to localStorage
  const selectVariant = (id: string) => {
    setDarkVariant(id);
    applyDarkVariant(id);
  };

  // Save the variant to the DB so other devices/sessions get it too
  const saveVariant = async () => {
    setSavingVariant(true);
    try {
      await apiPost("/api/footer-content", { darkThemeVariant: darkVariant });
      toast.success(L("تم حفظ سمة الوضع الليلي", "Dark theme palette saved"));
    } catch (e: any) {
      toast.error(e.message || L("خطأ", "Error"));
    } finally {
      setSavingVariant(false);
    }
  };

  const logout = async () => {
    try { await apiPost("/api/auth/logout"); } catch {}
    setUser(null);
    setAuthChecked(true);
    // Stay on /admin — DashboardApp will show the login form because user=null.
    // Do NOT redirect to / (public site).
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
            {theme === "dark" ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-amber-500" />}
            <div>
              <div className="font-semibold text-sm">{t("d.settings.currentTheme")}</div>
              <div className="text-xs text-muted-foreground">{theme === "dark" ? t("d.settings.dark") : t("d.settings.light")}</div>
            </div>
          </div>
          <Switch checked={theme === "dark"} onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")} />
        </div>
      </Card>

      {/* Dark Theme Palette Picker */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Palette className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold">{L("سمة الوضع الليلي", "Dark Theme Palette")}</h3>
            <p className="text-xs text-muted-foreground">{L("اختر باليت الألوان للوضع الليلي — يطبق فورا على الموقع واللوحة", "Choose the dark mode color palette — applies instantly to site & dashboard")}</p>
          </div>
          <Button onClick={saveVariant} disabled={savingVariant} size="sm" className="bg-gradient-to-r from-primary to-red-700 text-white gap-2">
            {savingVariant ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {L("حفظ", "Save")}
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {DARK_PALETTES.map((p) => {
            const isActive = darkVariant === p.id;
            return (
              <button
                key={p.id}
                onClick={() => selectVariant(p.id)}
                className={`relative rounded-2xl border-2 overflow-hidden transition-all text-start ${isActive ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/40"}`}
              >
                {/* Mini preview: 3-layer swatch */}
                <div className="flex h-20" style={{ background: p.bg }}>
                  <div className="flex-1 flex items-center justify-center" style={{ background: p.surface }}>
                    <div className="w-8 h-8 rounded-lg" style={{ background: p.accent }} />
                  </div>
                  <div className="w-1/3" style={{ background: p.bg, borderInlineStart: `1px solid ${p.border}` }} />
                </div>
                {/* Label */}
                <div className="p-3 bg-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm">{isAr ? p.nameAr : p.nameEn}</div>
                      <div className="text-[10px] text-muted-foreground font-mono" dir="ltr">{p.id}</div>
                    </div>
                    {isActive && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        {/* Color detail chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {(() => {
            const p = DARK_PALETTES.find((x) => x.id === darkVariant) || DARK_PALETTES[0];
            return [
              { label: L("الخلفية", "Background"), color: p.bg },
              { label: L("السطح", "Surface"), color: p.surface },
              { label: L("الحدود", "Border"), color: p.border },
              { label: L("اللون الأساسي", "Accent"), color: p.accent },
            ].map((c) => (
              <div key={c.label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/40">
                <span className="w-3 h-3 rounded-full" style={{ background: c.color }} />
                <span className="text-[11px] text-muted-foreground">{c.label}</span>
                <span className="text-[10px] font-mono text-muted-foreground/70" dir="ltr">{c.color}</span>
              </div>
            ));
          })()}
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
