"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { ArrowLeft, Truck, ShieldCheck, Zap, MapPin, ChevronRight, ChevronLeft, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { apiGet } from "@/lib/api";

const FALLBACK_IMAGES = [
  { id: "1", url: "/images/hero-truck.png", title: "شاحنة Redline على الطريق السريع", order: 0, active: true },
  { id: "2", url: "/images/fleet.png", title: "أسطول Redline عند الفجر", order: 1, active: true },
  { id: "3", url: "/images/warehouse.png", title: "مستودعات Redline", order: 2, active: true },
];

const GOV_MARQUEE_AR = [
  "القاهره", "الجيزه", "الاسكندريه", "القليوبيه", "بورسعيد", "السويس",
  "الدقهليه", "الشرقيه", "كفر الشيخ", "الغربيه", "المنوفيه", "البحيره",
  "الاسماعيليه", "الفيوم", "بني سويف", "المنيا", "اسيوط", "سوهاج",
  "قنا", "الاقصر", "اسوان", "البحر الاحمر", "الوادي الجديد", "مطروح",
  "شمال سيناء", "جنوب سيناء", "دمياط", "طنطا", "المنصوره", "الزقازيق",
  "شرم الشيخ", "الغردقه",
];
const GOV_MARQUEE_EN = [
  "Cairo", "Giza", "Alexandria", "Qalyubia", "Port Said", "Suez",
  "Dakahlia", "Sharqia", "Kafr El Sheikh", "Gharbia", "Monufia", "Beheira",
  "Ismailia", "Faiyum", "Beni Suef", "Minya", "Asyut", "Sohag",
  "Qena", "Luxor", "Aswan", "Red Sea", "New Valley", "Matrouh",
  "North Sinai", "South Sinai", "Damietta", "Tanta", "Mansoura", "Zagazig",
  "Sharm El Sheikh", "Hurghada",
];

export function Hero() {
  const { setView } = useAppStore();
  const { t, isAr } = useT();
  const { data } = useQuery({
    queryKey: ["hero-images"],
    queryFn: () => apiGet<{ images: typeof FALLBACK_IMAGES }>("/api/hero-images"),
  });
  const images = data?.images ?? FALLBACK_IMAGES;

  const [current, setCurrent] = useState(0);
  const [manualPause, setManualPause] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);
  const paused = manualPause || hoverPaused;
  const total = images.length;

  const next = useCallback(() => setCurrent((c) => (c + 1) % Math.max(total, 1)), [total]);
  const prev = () => setCurrent((c) => (c - 1 + total) % Math.max(total, 1));

  // auto-rotate (pause on hover OR manual)
  useEffect(() => {
    if (paused || total <= 1) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [paused, total, next]);

  // safe index clamped to range
  const idx = total > 0 ? current % total : 0;

  const { scrollY } = useScroll();
  const yBg = useTransform(scrollY, [0, 600], [0, 120]);
  const yContent = useTransform(scrollY, [0, 600], [0, 60]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  const scrollTo = (id: string) => document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });

  const active = images[idx] || images[0] || FALLBACK_IMAGES[0];

  return (
    <section
      id="home"
      className="relative min-h-[100svh] flex flex-col overflow-hidden pt-20 bg-zinc-950"
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
    >
      {/* Background image carousel with crossfade */}
      <div className="absolute inset-0 z-0">
        <motion.div style={{ y: yBg }} className="absolute inset-0">
          <AnimatePresence mode="sync">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ opacity: { duration: 1.2 }, scale: { duration: 6, ease: "easeOut" } }}
              className="absolute inset-0"
            >
              <Image
                src={active.url}
                alt={active.title || "Redline"}
                fill
                priority={idx === 0}
                sizes="100vw"
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/35 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-amber-900/10 mix-blend-overlay" />
        </motion.div>
      </div>

      {/* Aurora glows */}
      <div className="absolute top-1/3 left-0 w-[28rem] h-[28rem] bg-primary/25 rounded-full blur-[140px] -z-0 animate-aurora pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-amber-500/15 rounded-full blur-[120px] -z-0 animate-aurora pointer-events-none" style={{ animationDelay: "4s" }} />

      {/* Main content — flex-1 so it takes available space, pushes controls down */}
      <motion.div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20 relative flex-1 flex flex-col justify-center z-10" style={{ y: yContent, opacity }}>
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/90 text-xs font-medium mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            {t("hero.badge")}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] text-white tracking-tight"
          >
            {t("hero.title1")}
            <br />
            {t("hero.title2")} <span className="text-gradient-red" style={{ textShadow: "0 2px 30px oklch(0.55 0.2 28 / 0.3)" }}>Redline</span>
          </motion.h1>

          {/* Decorative gradient divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-6 h-px w-32 bg-gradient-to-l from-transparent via-amber-400/60 to-transparent origin-right"
          />

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-sm sm:text-lg text-white/80 max-w-2xl leading-relaxed"
          >
            {t("hero.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            <Button
              size="lg"
              onClick={() => scrollTo("#contact")}
              className="btn-glow bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 text-primary-foreground gap-2 text-base h-12 px-6 font-semibold shadow-lg shadow-primary/30 hover:shadow-primary/40 transition-shadow w-full sm:w-auto justify-center"
            >
              <Zap className="w-4.5 h-4.5" />
              {t("hero.cta1")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollTo("#services")}
              className="bg-white/15 backdrop-blur-md border-white/30 text-white hover:bg-white/25 hover:text-white gap-2 text-base h-12 px-6 w-full sm:w-auto justify-center font-medium"
            >
              <Truck className="w-4.5 h-4.5" />
              {t("hero.cta2")}
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </motion.div>

          {/* Mini features */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap gap-x-6 text-white/70 relative z-10"
          >
            {[
              { icon: Zap, text: t("hero.feat1") },
              { icon: ShieldCheck, text: t("hero.feat2") },
              { icon: MapPin, text: t("hero.feat3") },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs sm:text-sm">
                <f.icon className="w-[18px] h-[18px] text-amber-400 shrink-0" />
                {f.text}
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom zone — controls + marquee in normal flow (not absolute) */}
      <div className="relative z-20 shrink-0">
        {/* Carousel controls — progress bar + arrows + play/pause */}
        {total > 1 && (
          <div className="relative">
            {/* Progress bar — direction-aware fill
                LTR: grows left → right (origin: left)
                RTL: grows right → left (origin: right) */}
            <div className="relative h-[3px] w-full bg-white/10 overflow-hidden">
              <motion.div
                key={idx + (paused ? "-p" : "-r")}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: paused ? 0 : 5, ease: "linear" }}
                className="absolute top-0 h-full w-full bg-gradient-to-r from-primary to-amber-400"
                style={{ transformOrigin: isAr ? "right center" : "left center" }}
              />
            </div>
            {/* Controls — kept LTR for conventional media control layout (prev on left, next on right) */}
            <div className="flex items-center justify-center text-white py-2" dir="ltr">
              <button
                onClick={prev}
                aria-label={isAr ? "السابق" : "Previous"}
                className="px-5 py-1.5 hover:text-amber-300 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <span className="w-px h-6 bg-white/20" />
              <button
                onClick={() => setManualPause((p) => !p)}
                aria-label={manualPause ? (isAr ? "تشغيل" : "Play") : (isAr ? "إيقاف" : "Pause")}
                className="px-5 py-1.5 hover:text-amber-300 transition-colors"
              >
                {manualPause ? <Play className="w-4 h-4" strokeWidth={1.5} /> : <Pause className="w-4 h-4" strokeWidth={1.5} />}
              </button>
              <span className="w-px h-6 bg-white/20" />
              <button
                onClick={next}
                aria-label={isAr ? "التالي" : "Next"}
                className="px-5 py-1.5 hover:text-amber-300 transition-colors"
              >
                <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}

        {/* Marquee — twin-track infinite scroll */}
        <div className="border-t border-white/10 bg-black/40 backdrop-blur-md py-3 overflow-hidden" dir="ltr">
          <div className="flex animate-marquee whitespace-nowrap will-change-transform">
            {(isAr ? GOV_MARQUEE_AR : GOV_MARQUEE_EN).map((g, i) => (
              <span key={`t1-${i}`} className="mx-4 text-sm text-white/80 font-medium inline-flex items-center gap-1.5 shrink-0 leading-none">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                {g}
              </span>
            ))}
            {(isAr ? GOV_MARQUEE_AR : GOV_MARQUEE_EN).map((g, i) => (
              <span key={`t2-${i}`} className="mx-4 text-sm text-white/80 font-medium inline-flex items-center gap-1.5 shrink-0 leading-none" aria-hidden="true">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
