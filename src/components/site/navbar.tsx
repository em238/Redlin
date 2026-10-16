"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, LayoutDashboard, Moon, Sun, Globe } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { ScrollProgress } from "@/components/shared/scroll-progress";
import { useT, useI18n } from "@/lib/i18n";
import { Magnetic } from "@/components/shared/custom-cursor";

const NAV_KEYS = [
  { href: "#home", key: "nav.home" },
  { href: "#services", key: "nav.services" },
  { href: "#how", key: "nav.how" },
  { href: "#map", key: "nav.map" },
  { href: "#videos", key: "nav.videos" },
  { href: "#partners", key: "nav.partners" },
  { href: "#contact", key: "nav.contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { view, setView, theme, toggleTheme } = useAppStore();
  const { t, isAr } = useT();
  const { locale, setLocale } = useI18n();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => setScrolled(latest > 24));

  const activeSection = useScrollSpy(NAV_KEYS.map((l) => l.href), 140);

  const go = (href: string) => {
    setMobileOpen(false);
    if (view !== "public") {
      setView("public");
      setTimeout(() => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" }), 120);
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <ScrollProgress />
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-background/95 border-b border-border/60 shadow-soft" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo — RedLine transport official logo (switches light/dark variant by background) */}
            <button
              onClick={() => go("#home")}
              className="flex items-center shrink-0 group focus:outline-none"
              aria-label="RedLine Transport"
            >
              <Image
                src={!scrolled || theme === "dark" ? "/redline-transport-white.png" : "/redline-transport-logo.png"}
                alt="RedLine Transport"
                width={1200}
                height={514}
                priority
                className="h-10 sm:h-12 w-auto max-w-none object-contain transition-transform group-hover:scale-105"
              />
            </button>

            {/* Desktop nav — clean, minimal */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {NAV_KEYS.map((link) => {
                const isActive = activeSection === link.href;
                return (
                  <button
                    key={link.href}
                    onClick={() => go(link.href)}
                    className={`relative px-3.5 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? (scrolled ? "text-primary" : "text-white")
                        : (scrolled ? "text-foreground/70 hover:text-foreground" : "text-white/80 hover:text-white")
                    }`}
                  >
                    {t(link.key)}
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocale(isAr ? "en" : "ar")}
                className={`rounded-lg transition-colors ${scrolled ? "text-foreground hover:bg-muted" : "text-white hover:bg-white/10"}`}
                aria-label="Language"
              >
                <Globe className="w-[18px] h-[18px]" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className={`rounded-lg transition-colors ${scrolled ? "text-foreground hover:bg-muted" : "text-white hover:bg-white/10"}`}
                aria-label="تبديل السمة"
              >
                {theme === "light" ? <Moon className="w-[18px] h-[18px]" /> : <Sun className="w-[18px] h-[18px]" />}
              </Button>
              <Magnetic strength={0.18} className="hidden sm:inline-flex">
                <Button
                  onClick={() => setView("dashboard")}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 font-semibold"
                >
                  <LayoutDashboard className="w-[18px] h-[18px]" />
                  {t("nav.dashboard")}
                </Button>
              </Magnetic>
              <Button
                variant="ghost"
                size="icon"
                className={`lg:hidden rounded-lg transition-colors ${scrolled ? "text-foreground hover:bg-muted" : "text-white hover:bg-white/10"}`}
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="القائمة"
              >
                {mobileOpen ? <X className="w-[18px] h-[18px]" /> : <Menu className="w-[18px] h-[18px]" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden bg-background/98 border-b border-border"
            >
              <nav className="container mx-auto px-4 py-3 flex flex-col gap-0.5">
              {NAV_KEYS.map((link) => {
                const isActive = activeSection === link.href;
                return (
                  <button
                    key={link.href}
                    onClick={() => go(link.href)}
                    className={`px-4 py-2.5 text-start text-sm font-medium rounded-lg transition-colors flex items-center justify-start ${
                      activeSection === link.href ? "bg-primary/10 text-primary" : "hover:bg-muted"
                    }`}
                  >
                    {t(link.key)}
                  </button>
                );
              })}
              <Button
                onClick={() => { setMobileOpen(false); setView("dashboard"); }}
                className="mt-2 bg-primary text-primary-foreground gap-2 w-full justify-center"
              >
                <LayoutDashboard className="w-[18px] h-[18px]" />
                {t("nav.dashboard")}
              </Button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
