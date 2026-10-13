"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MapPin, CheckCircle2 } from "lucide-react";
import { apiGet } from "@/lib/api";

const ZONE_STYLE: Record<string, { label: string; cls: string }> = {
  A: { label: "المنطقة A", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30" },
  B: { label: "المنطقة B", cls: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30" },
  C: { label: "المنطقة C", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30" },
  D: { label: "المنطقة D", cls: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30" },
};

const FALLBACK = [
  { name: "Cairo", nameAr: "القاهره", zone: "A", basePrice: 30, etaHours: 24 },
  { name: "Giza", nameAr: "الجيزه", zone: "A", basePrice: 30, etaHours: 24 },
  { name: "Alexandria", nameAr: "الاسكندريه", zone: "A", basePrice: 40, etaHours: 36 },
  { name: "Luxor", nameAr: "الاقصر", zone: "D", basePrice: 80, etaHours: 96 },
  { name: "Aswan", nameAr: "اسوان", zone: "D", basePrice: 90, etaHours: 96 },
];

export function Coverage() {
  const { data } = useQuery({
    queryKey: ["governorates"],
    queryFn: () => apiGet<{ governorates: typeof FALLBACK }>("/api/governorates"),
  });
  const govs = data?.governorates ?? FALLBACK;

  const zones = ["A", "B", "C", "D"];

  return (
    <section id="coverage" className="py-20 sm:py-28 bg-gradient-to-b from-muted/40 to-background relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-3">
            التغطية
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            نصل إلى <span className="text-gradient-red">27 محافظة</span> في كل مصر
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            شبكة فروع ومستودعات تغطي الجمهورية بالكامل — من القاهرة الكبرى إلى أقصى الصعيد وسيناء
          </p>
        </div>

        {/* Zone legend */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {zones.map((z) => {
            const s = ZONE_STYLE[z];
            return (
              <span key={z} className={`px-3 py-1 rounded-full text-xs font-bold border ${s.cls}`}>
                {s.label}
              </span>
            );
          })}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {govs.map((g, i) => {
            const s = ZONE_STYLE[g.zone] || ZONE_STYLE.A;
            return (
              <motion.div
                key={g.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.35, delay: (i % 10) * 0.03 }}
                className="group relative rounded-xl border border-border bg-card p-3 hover:border-primary/40 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="font-bold text-sm truncate">{g.nameAr}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${s.cls}`}>{g.zone}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {Math.ceil(g.etaHours / 24)} يوم
                  </span>
                  <span className="font-semibold text-foreground/80">من {g.basePrice} ج.م</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
