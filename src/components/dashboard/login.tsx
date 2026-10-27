"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Lock, Mail, ArrowLeft, ArrowRight, Loader2, ShieldCheck, LayoutDashboard, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { useDashboardT, useI18n } from "@/lib/i18n";

export function DashboardLogin() {
  const { setUser } = useAppStore();
  const { theme, setTheme } = useTheme();
  const { t, isAr } = useDashboardT();
  const { dashboardLocale, setDashboardLocale } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email || !password) { toast.error(isAr ? "أكمل البيانات" : "Please complete the form"); return; }
    setLoading(true);
    try {
      const r = await apiPost<{ user: any }>("/api/auth/login", { email, password });
      setUser(r.user);
      toast.success(isAr ? `مرحباً ${r.user.name}!` : `Welcome ${r.user.name}!`);
    } catch (e: any) {
      toast.error(e.message || (isAr ? "فشل تسجيل الدخول" : "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" dir={isAr ? "rtl" : "ltr"}>
      {/* Left visual panel (right in RTL) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-950 overflow-hidden">
        <Image src="/images/fleet.png" alt="Redline" fill sizes="50vw" className="object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-l from-zinc-950 via-zinc-950/70 to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div className="flex items-center gap-2.5">
            <Image
              src="/redline-transport-white.png"
              alt="RedLine Transport"
              width={1200}
              height={514}
              className="h-10 w-auto max-w-none object-contain"
            />
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl font-black leading-tight">
              {t("d.login.title1")} <span className="text-gradient-red">{t("d.login.title2")}</span>
            </h1>
            <p className="mt-4 text-zinc-300 leading-relaxed">{t("d.login.subtitle")}</p>
          </div>

          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            {t("d.login.secure")}
          </div>
        </div>
      </div>

      {/* Right form panel (left in RTL) */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background relative">
        {/* Language switcher — top-start corner */}
        <button
          onClick={() => setDashboardLocale(dashboardLocale === "ar" ? "en" : "ar")}
          className="absolute top-4 start-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-xs font-semibold text-muted-foreground hover:text-foreground z-10"
          aria-label="Language"
        >
          <Globe className="w-3.5 h-3.5" />
          {dashboardLocale === "ar" ? "English" : "عربي"}
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <Image
              src="/redline-transport-logo.png"
              alt="RedLine Transport"
              width={1200}
              height={514}
              className="h-10 w-auto max-w-none object-contain dark:hidden"
            />
            <Image
              src="/redline-transport-white.png"
              alt="RedLine Transport"
              width={1200}
              height={514}
              className="hidden h-10 w-auto max-w-none object-contain dark:block"
            />
          </div>

          <div className="flex items-center gap-2 mb-2">
            <LayoutDashboard className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary">{t("d.login.brand")}</span>
          </div>
          <h2 className="text-3xl font-black">{t("d.login.header")}</h2>
          <p className="mt-2 text-muted-foreground">{t("d.login.subheader")}</p>

          <div className="mt-8 space-y-5">
            <div className="space-y-1.5">
              <Label className="text-sm">{t("d.login.emailLabel")}</Label>
              <div className="relative">
                <Mail className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 ps-10"
                  placeholder="name@example.com"
                  dir="ltr"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">{t("d.login.passwordLabel")}</Label>
              <div className="relative">
                <Lock className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && login()}
                  className="h-12 ps-10"
                  placeholder="•••••••••••"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                <input type="checkbox" className="rounded accent-primary" defaultChecked />
                {t("d.login.remember")}
              </label>
            </div>

            <Button
              onClick={login}
              disabled={loading}
              className="group w-full h-12 bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 text-white gap-2 text-base"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LayoutDashboard className="w-5 h-5" />}
              {t("d.login.button")}
              {!loading && (
                isAr
                  ? <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  : <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              )}
            </Button>

            <div className="text-center mt-4">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-red-600 transition-colors duration-200 cursor-pointer"
              >
                <span>{t("d.login.back")}</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
