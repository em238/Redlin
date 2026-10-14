"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { apiGet } from "@/lib/api";
import { SectionHeading } from "@/components/shared/section-heading";

const FALLBACK = [
  { name: "Ahmed Mansour", role: "صاحب متجر", company: "TechStore", content: "خدمة ممتازة وسريعة!", rating: 5 },
  { name: "Sara El-Sayed", role: "مديرة مبيعات", company: "Fashion Hub", content: "أفضل شركة شحن تعاملت معها.", rating: 5 },
  { name: "Mohamed Adel", role: "تاجر جملة", company: "Adel Trading", content: "شحن ثقيل واحترافية عالية.", rating: 5 },
];

export function Testimonials() {
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
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [auto, items.length, next]);

  if (items.length === 0) return null;
  const current = items[index % items.length];

  return (
    <section className="py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="آراء العملاء"
          title={<>عملاؤنا هم <span className="text-gradient-red">قوتنا</span></>}
          subtitle="أكثر من 12,000 عميل يثقون في Redline لشحناتهم يومياً"
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
                className="relative rounded-3xl border border-border/60 bg-gradient-to-br from-card to-muted/20 shadow-card p-8 sm:p-12 overflow-hidden"
              >
                {/* Big watermark quote */}
                <Quote className="absolute -top-4 -left-2 w-32 h-32 text-primary/[0.05] rotate-180" />
                {/* Horizontal layout: quote on right, author card on left */}
                <div className="relative flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
                  {/* Author side */}
                  <div className="flex sm:flex-col items-center gap-4 sm:gap-3 sm:min-w-[180px] sm:border-l-2 sm:border-primary/30 sm:pr-8 sm:order-2">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-amber-600 p-[2px] shadow-soft shrink-0">
                      <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-primary font-bold text-xl">
                        {current.name.charAt(0)}
                      </div>
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="font-bold">{current.name}</div>
                      <div className="text-sm text-muted-foreground">{current.role}{current.company ? ` · ${current.company}` : ""}</div>
                    </div>
                  </div>
                  {/* Quote side */}
                  <div className="flex-1 sm:order-1">
                    <div className="flex gap-0.5 mb-4">
                      {Array.from({ length: current.rating }).map((_, j) => (
                        <Star key={j} className="w-5 h-5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-lg sm:text-2xl leading-relaxed font-medium text-foreground/90">
                      "{current.content}"
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button onClick={prev} className="w-9 h-9 rounded-full border border-border bg-card hover:border-primary/40 hover:bg-muted flex items-center justify-center transition-colors" aria-label="السابق">
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="flex gap-1.5">
              {items.map((_, i) => (
                <button key={i} onClick={() => setIndex(i)} aria-label={`الرأي ${i + 1}`} className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-primary" : "w-1.5 bg-border hover:bg-muted-foreground"}`} />
              ))}
            </div>
            <button onClick={next} className="w-9 h-9 rounded-full border border-border bg-card hover:border-primary/40 hover:bg-muted flex items-center justify-center transition-colors" aria-label="التالي">
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
