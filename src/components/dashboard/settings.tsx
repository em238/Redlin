"use client";

import { useState } from "react";
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

export function DashboardSettings() {
  const { user, setUser, setView, setAuthChecked, theme, toggleTheme } = useAppStore();
  const [profile, setProfile] = useState({ name: user?.name || "", email: user?.email || "" });
  const [notifications, setNotifications] = useState({ email: true, push: true, orders: true, messages: false });

  const logout = async () => {
    try { await apiPost("/api/auth/logout"); } catch {}
    setUser(null);
    setAuthChecked(true);
    setView("public");
    toast.success("تم تسجيل الخروج");
  };

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Profile */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold">الملف الشخصي</h3>
            <p className="text-xs text-muted-foreground">بيانات حساب الإدارة</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm">الاسم</Label>
            <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="h-10" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">البريد الإلكتروني</Label>
            <Input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="h-10" dir="ltr" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Badge className="bg-primary/10 text-primary border-primary/30">دور: مدير عام</Badge>
          <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30">حساب نشط</Badge>
        </div>
        <div className="mt-4">
          <Button className="bg-gradient-to-r from-primary to-red-700 text-white gap-2">
            <Save className="w-4 h-4" /> حفظ التغييرات
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
            <h3 className="font-bold">المظهر</h3>
            <p className="text-xs text-muted-foreground">السمة والثيم</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40">
          <div className="flex items-center gap-3">
            {theme === "light" ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-primary" />}
            <div>
              <div className="font-semibold text-sm">السمة الحالية</div>
              <div className="text-xs text-muted-foreground">{theme === "light" ? "فاتح" : "داكن"}</div>
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
            <h3 className="font-bold">الإشعارات</h3>
            <p className="text-xs text-muted-foreground">إعدادات التنبيهات</p>
          </div>
        </div>
        <div className="space-y-3">
          {[
            { key: "email", label: "إشعارات البريد الإلكتروني", desc: "استلام تنبيهات عبر البريد" },
            { key: "push", label: "إشعارات فورية", desc: "تنبيهات في المتصفح" },
            { key: "orders", label: "تنبيهات الطلبات الجديدة", desc: "عند وصول طلب جديد" },
            { key: "messages", label: "تنبيهات الرسائل", desc: "عند وصول رسالة من عميل" },
          ].map((n) => (
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
            <h4 className="font-bold text-sm">معلومات النظام</h4>
          </div>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <div className="flex justify-between"><span>الإصدار</span><span className="font-mono text-foreground">Redline v2.4.1</span></div>
            <div className="flex justify-between"><span>قاعدة البيانات</span><span className="font-mono text-foreground">SQLite</span></div>
            <div className="flex justify-between"><span>المنطقة الزمنية</span><span className="font-mono text-foreground">Africa/Cairo</span></div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-primary" />
            <h4 className="font-bold text-sm">الأمان</h4>
          </div>
          <p className="text-xs text-muted-foreground mb-3">جلسة آمنة ومشفرة. للحماية، يُنصح بتسجيل الخروج بعد الانتهاء.</p>
          <Button variant="outline" className="w-full text-rose-600 hover:text-rose-700 gap-2" onClick={logout}>
            <LogOut className="w-4 h-4" /> تسجيل الخروج
          </Button>
        </Card>
      </div>
    </div>
  );
}
