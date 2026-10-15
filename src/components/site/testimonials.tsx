"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { apiGet } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { SectionHeading } from "@/components/shared/section-heading";

const FALLBACK = [
  { name: "Ahmed Mansour", role: "صاحب متجر", company: "TechStore", content: "خدمة ممتازة وسريعة!", rating: 5 },
  { name: "Sara El-Sayed", role: "مديرة مبيعات", company: "Fashion Hub", content: "أفضل شركة شحن تعاملت معها.", rating: 5 },
  { name: "Mohamed Adel", role: "تاجر جملة", company: "Adel Trading", content: "شحن ثقيل واحترافية عالية.", rating: 5 },
];

const TEST_EN: Record<string, { role: string; content: string }> = {
  "Ahmed Mansour": { role: "Store Owner", content: "Excellent and fast service! Shipments reached my customers across all Egyptian governorates on time. Redline completely changed how I manage my shipments." },
  "Sara El-Sayed": { role: "Sales Manager", content: "The best shipping company I've dealt with. Competitive prices and professional service. The tracking system is excellent." },
  "Mohamed Adel": { role: "Wholesale Trader", content: "Heavy shipping and high professionalism. The team is professional and delivery is precise. I recommend Redline to everyone." },
  "Nour Hassan": { role: "Startup Founder", content: "As a small business, Redline provided me with affordable shipping solutions with high quality. Thank you for the professionalism." },
  "Khaled Ibrahim": { role: "Supply Chain Manager", content: "A strategic partnership for two years. The flexibility and speed in handling large quantities is unmatched. A reliable company by all measures." },
};

export function Testimonials() {
  const { t, isAr } = useT();
  const { data } = useQuery({
    queryKey: ["site-testimonials"],
    queryFn: () => apiGet<{ testimonials: typeof FALLBACK }>("/api/site"),
  });
  const items = data?.testimonials ?? FALLBACK;
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(true);

  const next = useCallback(() => setIndex((i) => (i + 1) % Math.max(items.length, 1)), [items.length]);
  const prev = () => setIndex((i) => (i - 1 + items.length) % Math.max(items.length, 1));

  useEffect(() => {
    if (!auto || items.length <= 1) return;
    const interval = setInterval(next, 6000);
    return () => clearInterval(interval);
  }, [auto, items.length, next]);

  if (items.length === 0) return null;
  const current = items[index % items.length];

  const roleFor = () => isAr ? current.role : (TEST_EN[current.name]?.role || current.role);
  const contentFor = () => isAr ? current.content : (TEST_EN[current.name]?.content || current.content);

  return (
    <section className="py-14 sm:py-24 lg:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t("test.eyebrow")}
          title={t("test.title")}
          subtitle={t("test.subtitle")}
        />

        <div className="max-w-4xl mx-auto" onMouseEnter={() => setAuto(false)} onMouseLeave={() => setAuto(true)}>
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id || index}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35 }}
                className="relative rounded-3xl border border-border/60 bg-card shadow-card p-6 sm:p-8 lg:p-10 overflow-hidden"
              >
                {/* 3-part layout: Content → Divider → Client Info */}
                <div className="relative flex flex-col md:flex-row md:items-center gap-6 md:gap-8">

                  {/* 1. Review Content Side (flex-1) */}
                  <div className="relative flex-1 space-y-4">
                    {/* Watermark quote — on the TEXT side only, at the start */}
                    <Quote className={`absolute -top-4 ${isAr ? "right-0" : "left-0"} w-16 h-16 sm:w-20 sm:h-20 text-primary/[0.07] pointer-events-none select-none -z-0 ${isAr ? "" : "rotate-180"}`} />

                    {/* Star rating */}
                    <div className={`flex gap-0.5 relative z-10 ${isAr ? "justify-end" : "justify-start"}`}>
                      {Array.from({ length: current.rating }).map((_, j) => (
                        <Star key={j} className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>

                    {/* Testimonial quote */}
                    <p className={`text-base sm:text-lg lg:text-xl leading-relaxed font-medium text-foreground/90 relative z-10 ${isAr ? "text-right" : "text-left"}`}>
                      "{contentFor()}"
                    </p>
                  </div>

                  {/* 2. Vertical Divider — strictly BETWEEN content and author */}
                  <div className="hidden md:block w-px self-stretch bg-gradient-to-b from-transparent via-primary/30 to-transparent shrink-0" />

                  {/* 3. Client Info Side (shrink-0, fixed width) */}
                  <div className={`flex flex-col items-center gap-3 shrink-0 min-w-[160px] ${isAr ? "text-right" : "text-left"}`}>
                    {/* Avatar */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary to-amber-600 p-[2px] shadow-soft shrink-0">
                      <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-primary font-bold text-lg sm:text-xl">
                        {current.name.charAt(0)}
                      </div>
                    </div>
                    {/* Name + role */}
                    <div className="text-center">
                      <div className="font-bold text-sm sm:text-base">{current.name}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                        {roleFor()}{current.company ? ` · ${current.company}` : ""}
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation: centered arrows + dots */}
          <div className="mt-6 flex items-center justify-center gap-4">
            {/* Previous — left arrow in LTR, right arrow in RTL */}
            <button
              onClick={prev}
              className="w-9 h-9 rounded-full border border-border bg-card hover:border-primary/40 hover:bg-muted flex items-center justify-center transition-colors"
              aria-label={isAr ? "السابق" : "Previous"}
            >
              {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Pagination dots */}
            <div className="flex gap-1.5">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={isAr ? `الرأي ${i + 1}` : `Testimonial ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-primary" : "w-1.5 bg-border hover:bg-muted-foreground"}`}
                />
              ))}
            </div>

            {/* Next — right arrow in LTR, left arrow in RTL */}
            <button
              onClick={next}
              className="w-9 h-9 rounded-full border border-border bg-card hover:border-primary/40 hover:bg-muted flex items-center justify-center transition-colors"
              aria-label={isAr ? "التالي" : "Next"}
            >
              {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
