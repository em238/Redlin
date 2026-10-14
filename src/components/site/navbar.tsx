"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, Truck, LayoutDashboard, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { ScrollProgress } from "@/components/shared/scroll-progress";

const NAV_LINKS = [
  { href: "#home", label: "الرئيسية" },
  { href: "#services", label: "خدماتنا" },
  { href: "#how", label: "كيف نعمل" },
  { href: "#map", label: "الخريطة" },
  { href: "#videos", label: "المعرض" },
  { href: "#partners", label: "الشركاء" },
  { href: "#contact", label: "تواصل" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { view, setView, theme, toggleTheme } = useAppStore();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => setScrolled(latest > 24));

  const activeSection = useScrollSpy(NAV_LINKS.map((l) => l.href), 140);

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
          scrolled ? "bg-background/75 backdrop-blur-xl border-b border-border/60 shadow-soft" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button onClick={() => go("#home")} className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-soft group-hover:scale-105 transition-transform">
                <Truck className="w-4.5 h-4.5 text-primary-foreground" strokeWidth={2.4} />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-bold tracking-tight">
                  Red<span className="text-primary">line</span>
                </span>
                <span className="text-[10px] text-muted-foreground font-medium mt-0.5">شحن سريع وآمن</span>
              </div>
            </button>

            {/* Desktop nav — clean, minimal */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {NAV_LINKS.map((link) => {
                const isActive = activeSection === link.href;
                return (
                  <button
                    key={link.href}
                    onClick={() => go(link.href)}
                    className={`relative px-3.5 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive ? "text-primary" : "text-foreground/70 hover:text-foreground"
                    }`}
                  >
                    {link.label}
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
                onClick={toggleTheme}
                className="rounded-lg"
                aria-label="تبديل السمة"
              >
                {theme === "light" ? <Moon className="w-[18px] h-[18px]" /> : <Sun className="w-[18px] h-[18px]" />}
              </Button>
              <Button
                onClick={() => setView("dashboard")}
                size="sm"
                className="hidden sm:inline-flex bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 font-semibold"
              >
                <LayoutDashboard className="w-4 h-4" />
                لوحة التحكم
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden rounded-lg"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="القائمة"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
              className="lg:hidden overflow-hidden bg-background/95 backdrop-blur-xl border-b border-border"
            >
              <nav className="container mx-auto px-4 py-3 flex flex-col gap-0.5">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => go(link.href)}
                    className={`px-3 py-2.5 text-right text-sm font-medium rounded-lg transition-colors ${
                      activeSection === link.href ? "bg-primary/10 text-primary" : "hover:bg-muted"
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
                <Button
                  onClick={() => { setMobileOpen(false); setView("dashboard"); }}
                  className="mt-2 bg-primary text-primary-foreground gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  لوحة التحكم
                </Button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
