"use client";

import { useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { useTheme } from "next-themes";
import { Menu, X, Moon, Sun, Globe } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { ScrollProgress } from "@/components/shared/scroll-progress";
import { useT, useI18n } from "@/lib/i18n";

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
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, isAr } = useT();
  const { locale, setLocale } = useI18n();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => setScrolled(latest > 24));
  const solid = scrolled || mobileOpen;

  const activeSection = useScrollSpy(NAV_KEYS.map((l) => l.href), 140);

  const go = (href: string) => {
  setMobileOpen(false);
  // استنى القائمة تتقفل وبعدين اسكرول
  setTimeout(() => {
    const el = document.querySelector(href);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 70; // 70 = ارتفاع الهيدر تقريبًا
    window.scrollTo({ top: href === "#home" ? 0 : top, behavior: "smooth" });
  }, 300);
};

  return (
    <>
      <ScrollProgress />
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          solid ? "bg-background border-b border-border/60 shadow-soft" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo — dual image approach: CSS `dark:hidden` / `hidden dark:block`
                ensures the white logo shows in dark mode IMMEDIATELY (before JS
                hydration) with no flash. When not scrolled (transparent navbar
                over dark hero), always show the white logo. */}
            <button
              onClick={() => go("#home")}
              className="flex items-center shrink-0 group focus:outline-none"
              aria-label="RedLine Transport"
            >
              {!solid ? (
                /* Not scrolled — always white logo (over dark hero image) */
                <Image
                  src="/redline-transport-white.png"
                  alt="RedLine Transport"
                  width={1200}
                  height={514}
                  priority
                  className="h-10 sm:h-12 w-auto max-w-none object-contain transition-transform group-hover:scale-105"
                />
              ) : (
                /* Scrolled — colored logo in light mode, white logo in dark mode */
                <>
                  <Image
                    src="/redline-transport-logo.png"
                    alt="RedLine Transport"
                    width={1200}
                    height={514}
                    priority
                    className="h-10 sm:h-12 w-auto max-w-none object-contain transition-transform group-hover:scale-105 dark:hidden"
                  />
                  <Image
                    src="/redline-transport-white.png"
                    alt="RedLine Transport"
                    width={1200}
                    height={514}
                    priority
                    className="hidden h-10 sm:h-12 w-auto max-w-none object-contain transition-transform group-hover:scale-105 dark:block"
                  />
                </>
              )}
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
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className={`rounded-lg transition-colors ${scrolled ? "text-foreground hover:bg-muted" : "text-white hover:bg-white/10"}`}
                aria-label="تبديل السمة"
              >
                {theme === "dark" ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
              </Button>
              {/* Dashboard button removed — the admin dashboard is only accessible
                  by typing the direct URL /admin. No public link to the dashboard. */}
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
              className="lg:hidden overflow-hidden bg-background border-b border-border shadow-xl"
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
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
