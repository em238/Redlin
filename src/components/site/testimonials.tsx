"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { apiGet } from "@/lib/api";

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

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-background to-muted/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-3">
            آراء العملاء
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            عملاؤنا هم <span className="text-gradient-red">قوتنا</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            أكثر من 12,000 عميل يثقون في Redline لشحناتهم يومياً
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              className="relative rounded-2xl border border-border bg-card p-6 hover:shadow-xl hover:border-primary/30 transition-all"
            >
              <Quote className="absolute top-5 left-5 w-10 h-10 text-primary/15" />
              <div className="relative">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-foreground/85 leading-relaxed text-sm">"{t.content}"</p>
                <div className="mt-5 flex items-center gap-3 pt-4 border-t border-border">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-red-700 flex items-center justify-center text-white font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}{t.company ? ` · ${t.company}` : ""}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
