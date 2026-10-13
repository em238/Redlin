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
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [auto, items.length, next]);

  if (items.length === 0) return null;

  const current = items[index % items.length];

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-background to-muted/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="آراء العملاء"
          title={<>عملاؤنا هم <span className="text-gradient-red">قوتنا</span></>}
          subtitle="أكثر من 12,000 عميل يثقون في Redline لشحناتهم يومياً"
        />

        <div className="max-w-4xl mx-auto" onMouseEnter={() => setAuto(false)} onMouseLeave={() => setAuto(true)}>
          {/* Main featured testimonial */}
          <div className="relative">
            <Quote className="absolute -top-4 right-6 w-16 h-16 text-primary/10" />
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id || index}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4 }}
                className="relative rounded-3xl border border-border bg-card p-8 sm:p-12 shadow-sm"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: current.rating }).map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-lg sm:text-2xl leading-relaxed font-medium text-foreground/90">
                  "{current.content}"
                </p>
                <div className="mt-6 flex items-center gap-4 pt-6 border-t border-border">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-red-700 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary/20">
                    {current.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-lg">{current.name}</div>
                    <div className="text-sm text-muted-foreground">{current.role}{current.company ? ` · ${current.company}` : ""}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls + dots */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-border bg-card hover:border-primary/40 hover:bg-primary/5 flex items-center justify-center transition-colors"
              aria-label="السابق"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`h-2 rounded-full transition-all ${i === index ? "w-8 bg-primary" : "w-2 bg-border hover:bg-muted-foreground"}`}
                  aria-label={`الانتقال للرأي ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-border bg-card hover:border-primary/40 hover:bg-primary/5 flex items-center justify-center transition-colors"
              aria-label="التالي"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
