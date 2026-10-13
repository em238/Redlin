"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, Truck, LayoutDashboard, Moon, Sun, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { ScrollProgress } from "@/components/shared/scroll-progress";

const NAV_LINKS = [
  { href: "#home", label: "الرئيسية" },
  { href: "#services", label: "خدماتنا" },
  { href: "#coverage", label: "التغطية" },
  { href: "#pricing", label: "الأسعار" },
  { href: "#track", label: "تتبع" },
  { href: "#videos", label: "المعرض" },
  { href: "#contact", label: "تواصل" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { view, setView, theme, toggleTheme } = useAppStore();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => setScrolled(latest > 30));

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
          scrolled ? "bg-background/85 backdrop-blur-xl border-b border-border/60 shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 py-3">
            {/* Logo */}
            <button onClick={() => go("#home")} className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 group-hover:rotate-3 transition-transform">
                  <Truck className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-500 ring-2 ring-background animate-slow-pulse" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-extrabold tracking-tight">
                  Red<span className="text-primary">line</span>
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">شحن سريع وآمن</span>
              </div>
            </button>

            {/* Desktop nav with active highlight */}
            <nav className="hidden lg:flex items-center gap-1 rounded-full bg-muted/50 p-1 backdrop-blur-sm border border-border/50">
              {NAV_LINKS.map((link) => {
                const isActive = activeSection === link.href;
                return (
                  <button
                    key={link.href}
                    onClick={() => go(link.href)}
                    className={`relative px-3.5 py-2 text-sm font-medium rounded-full transition-colors ${
                      isActive ? "text-primary-foreground" : "text-foreground/75 hover:text-foreground"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 rounded-full bg-gradient-to-l from-primary to-red-700 shadow-sm shadow-primary/30"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <a
                href="tel:19999"
                className="hidden md:flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/5 rounded-lg transition-colors"
              >
                <Phone className="w-4 h-4" />
                19999
              </a>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full"
                aria-label="تبديل السمة"
              >
                {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </Button>
              <Button
                onClick={() => setView("dashboard")}
                className="hidden sm:inline-flex bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 text-white shadow-md shadow-primary/20 gap-2 group"
              >
                <LayoutDashboard className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                لوحة التحكم
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden rounded-full"
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
              <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => go(link.href)}
                    className={`px-3 py-2.5 text-right text-sm font-medium rounded-lg transition-colors ${
                      activeSection === link.href ? "bg-primary/10 text-primary" : "hover:bg-accent"
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
                <Button
                  onClick={() => { setMobileOpen(false); setView("dashboard"); }}
                  className="mt-2 bg-gradient-to-r from-primary to-red-700 text-white gap-2"
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
