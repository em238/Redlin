"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { ArrowLeft, Truck, ShieldCheck, Zap, MapPin, ChevronRight, ChevronLeft, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { apiGet } from "@/lib/api";

const FALLBACK_IMAGES = [
  { id: "1", url: "/images/hero-truck.png", title: "شاحنة Redline على الطريق السريع", order: 0, active: true },
  { id: "2", url: "/images/fleet.png", title: "أسطول Redline عند الفجر", order: 1, active: true },
  { id: "3", url: "/images/warehouse.png", title: "مستودعات Redline", order: 2, active: true },
];

const GOV_MARQUEE = [
  "القاهره", "الجيزه", "الاسكندريه", "المنيا", "اسيوط", "سوهاج",
  "الاقصر", "اسوان", "بورسعيد", "السويس", "طنطا", "المنصوره",
  "دمياط", "الفيوم", "الزقازيق", "الاسماعيليه", "شرم الشيخ", "الغردقه",
];

const FLOATING_STATS = [
  { icon: Zap, label: "متوسط زمن التوصيل", value: "26 ساعة", color: "from-amber-500 to-amber-700", pos: "top-[24%] right-[4%]" },
];

export function Hero() {
  const { setView } = useAppStore();
  const { data } = useQuery({
    queryKey: ["hero-images"],
    queryFn: () => apiGet<{ images: typeof FALLBACK_IMAGES }>("/api/hero-images"),
  });
  const images = data?.images ?? FALLBACK_IMAGES;

  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = images.length;

  const next = useCallback(() => setCurrent((c) => (c + 1) % Math.max(total, 1)), [total]);
  const prev = () => setCurrent((c) => (c - 1 + total) % Math.max(total, 1));

  // auto-rotate
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
      className="relative min-h-[100svh] flex items-center overflow-hidden pt-20"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background image carousel with crossfade */}
      <div className="absolute inset-0 -z-10">
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
          <div className="absolute inset-0 bg-gradient-to-l from-black/92 via-black/65 to-black/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
        </motion.div>
      </div>

      {/* Aurora glows */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-primary/30 rounded-full blur-[120px] -z-0 animate-aurora" />
      <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-amber-500/20 rounded-full blur-[100px] -z-0 animate-aurora" style={{ animationDelay: "4s" }} />

      <motion.div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative" style={{ y: yContent, opacity }}>
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            نشحن لكل محافظات مصر — 27 محافظة بنفس السرعة
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-black leading-[1.1] text-white"
          >
            شحن يصل لكل مصر
            <br />
            بسرعة <span className="text-gradient-red">Redline</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-white/80 max-w-2xl leading-relaxed"
          >
            شركة شحن احترافية تغطي جميع محافظات مصر بخدمات متنوعة — عادي، ممتاز،
            نفس اليوم، وشحن ثقيل — مع تتبع مباشر وأسعار منافسة وضمان التسليم.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Button
              size="lg"
              onClick={() => scrollTo("#contact")}
              className="bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 text-white shadow-xl shadow-primary/30 gap-2 text-base h-12 px-7 group"
            >
              <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
              اطلب شحن الآن
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollTo("#services")}
              className="bg-white/10 backdrop-blur-md border-white/25 text-white hover:bg-white/20 hover:text-white gap-2 text-base h-12 px-7"
            >
              <Truck className="w-5 h-5" />
              خدماتنا
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </motion.div>

          {/* Mini features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-10 flex flex-wrap gap-6 text-white/85"
          >
            {[
              { icon: Zap, text: "توصيل نفس اليوم في القاهرة الكبرى" },
              { icon: ShieldCheck, text: "ضمان كامل على كل شحنة" },
              { icon: MapPin, text: "27 محافظة بتغطية كاملة" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <f.icon className="w-4 h-4 text-amber-400" />
                {f.text}
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Floating stat cards (desktop only) */}
      <div className="hidden xl:block absolute inset-0 pointer-events-none">
        {FLOATING_STATS.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.15, duration: 0.6 }}
            className={`absolute ${s.pos}`}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
              className="glass rounded-2xl border border-white/15 p-4 shadow-2xl pointer-events-auto w-44"
            >
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center mb-2`}>
                <s.icon className="w-4 h-4 text-white" />
              </div>
              <div className="text-xl font-black text-white">{s.value}</div>
              <div className="text-[11px] text-white/70">{s.label}</div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Image carousel controls — at bottom center above marquee (like reference) */}
      {total > 1 && (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
          <button
            onClick={prev}
            className="w-10 h-10 rounded-full border border-white/30 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="السابق"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Slide counter + progress */}
          <div className="flex items-center gap-2.5">
            <span className="text-white font-bold text-lg tabular-nums">
              {String(idx + 1).padStart(2, "0")}
            </span>
            <span className="text-white/40">/</span>
            <span className="text-white/60 font-medium tabular-nums">
              {String(total).padStart(2, "0")}
            </span>
            {/* progress bar of current slide */}
            <div className="w-24 h-0.5 bg-white/20 rounded-full overflow-hidden ms-1">
              <motion.div
                key={idx + (paused ? "p" : "r")}
                initial={{ width: paused ? "var(--w)" : "0%" }}
                animate={{ width: paused ? "100%" : "100%" }}
                transition={{ duration: paused ? 0 : 5, ease: "linear" }}
                className="h-full bg-white rounded-full"
              />
            </div>
          </div>

          <button
            onClick={next}
            className="w-10 h-10 rounded-full border border-white/30 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="التالي"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => setPaused((p) => !p)}
            className="w-9 h-9 rounded-full border border-white/30 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white flex items-center justify-center transition-colors ms-1"
            aria-label={paused ? "تشغيل" : "إيقاف"}
          >
            {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* Dot indicators */}
      {total > 1 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 hidden sm:flex gap-1.5">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setCurrent(i)}
              aria-label={`الشريحة ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${i === idx ? "w-8 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"}`}
            />
          ))}
        </div>
      )}

      {/* Marquee */}
      <div className="absolute bottom-0 inset-x-0 border-t border-white/10 bg-black/40 backdrop-blur-md py-3 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...GOV_MARQUEE, ...GOV_MARQUEE].map((g, i) => (
            <span key={i} className="mx-6 text-sm text-white/70 font-medium flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              {g}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
