"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Truck, Lock, Mail, ArrowRight, Loader2, ShieldCheck, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";

export function DashboardLogin() {
  const { setUser, setAuthChecked, setView } = useAppStore();
  const [email, setEmail] = useState("admin@redline.eg");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email || !password) { toast.error("أكمل البيانات"); return; }
    setLoading(true);
    try {
      const r = await apiPost<{ user: any }>("/api/auth/login", { email, password });
      setUser(r.user);
      toast.success(`مرحباً ${r.user.name}!`);
    } catch (e: any) {
      toast.error(e.message || "فشل تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left visual panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-950 overflow-hidden">
        <Image src="/images/fleet.png" alt="Redline" fill sizes="50vw" className="object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-l from-zinc-950 via-zinc-950/70 to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center shadow-lg shadow-primary/30">
              <Truck className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-2xl font-black">Red<span className="text-primary">line</span></div>
              <div className="text-[11px] text-zinc-400">لوحة تحكم الإدارة</div>
            </div>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl font-black leading-tight">
              أدر عمليات الشحن <span className="text-gradient-red">من مكان واحد</span>
            </h1>
            <p className="mt-4 text-zinc-300 leading-relaxed">
              تتبّع الشحنات، إدارة الطلبات والعملاء، رفع الفيديوهات، التحكم في الأسعار،
              ومتابعة كل مؤشرات الأداء — كل ذلك من لوحة تحكم متكاملة واحترافية.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[{ v: "850K+", l: "شحنة" }, { v: "27", l: "محافظة" }, { v: "12K+", l: "عميل" }].map((s, i) => (
                <div key={i} className="glass rounded-xl border border-white/10 p-3 text-center">
                  <div className="text-2xl font-black text-primary">{s.v}</div>
                  <div className="text-[11px] text-zinc-400">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            اتصال آمن ومشفّر — جميع البيانات محمية
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center shadow-lg shadow-primary/30">
              <Truck className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div className="text-2xl font-black">Red<span className="text-primary">line</span></div>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <LayoutDashboard className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary">لوحة التحكم</span>
          </div>
          <h2 className="text-3xl font-black">تسجيل الدخول</h2>
          <p className="mt-2 text-muted-foreground">أدخل بياناتك للوصول إلى لوحة تحكم Redline</p>

          <div className="mt-8 space-y-5">
            <div className="space-y-1.5">
              <Label className="text-sm">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 pr-10"
                  placeholder="admin@redline.eg"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && login()}
                  className="h-12 pr-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                <input type="checkbox" className="rounded accent-primary" defaultChecked />
                تذكرني
              </label>
              <button className="text-primary hover:underline">نسيت كلمة المرور؟</button>
            </div>

            <Button
              onClick={login}
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 text-white gap-2 text-base"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LayoutDashboard className="w-5 h-5" />}
              دخول لوحة التحكم
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>

            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-center">
              <p className="text-xs text-muted-foreground">
                بيانات تجريبية: <span className="font-mono font-semibold text-foreground">admin@redline.eg</span>
                {" / "}
                <span className="font-mono font-semibold text-foreground">admin123</span>
              </p>
            </div>

            <button
              onClick={() => setView("public")}
              className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              ← العودة للموقع
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
