"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, CheckCircle2, Filter } from "lucide-react";
import { apiGet } from "@/lib/api";
import { SectionHeading } from "@/components/shared/section-heading";

const ZONE_STYLE: Record<string, { label: string; cls: string; dot: string }> = {
  A: { label: "القاهرة الكبرى", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30", dot: "bg-emerald-500" },
  B: { label: "الوجه البحري", cls: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30", dot: "bg-blue-500" },
  C: { label: "الصعيد الأعلى", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30", dot: "bg-amber-500" },
  D: { label: "الحدود والسيناء", cls: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30", dot: "bg-rose-500" },
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
  const [zone, setZone] = useState<string>("ALL");

  const zones = useMemo(() => ["ALL", "A", "B", "C", "D"], []);
  const filtered = zone === "ALL" ? govs : govs.filter((g) => g.zone === zone);
  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: govs.length };
    govs.forEach((g) => { c[g.zone] = (c[g.zone] || 0) + 1; });
    return c;
  }, [govs]);

  return (
    <section id="coverage" className="py-20 sm:py-28 bg-gradient-to-b from-muted/40 to-background relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <SectionHeading
          eyebrow="التغطية"
          title={<>نصل إلى <span className="text-gradient-red">27 محافظة</span> في كل مصر</>}
          subtitle="شبكة فروع ومستودعات تغطي الجمهورية بالكامل — من القاهرة الكبرى إلى أقصى الصعيد وسيناء"
        />

        {/* Zone filter tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {zones.map((z) => {
            const active = zone === z;
            const label = z === "ALL" ? "الكل" : ZONE_STYLE[z]?.label || z;
            const count = counts[z] || 0;
            return (
              <button
                key={z}
                onClick={() => setZone(z)}
                className={`relative px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                  active
                    ? "bg-gradient-to-l from-primary to-red-700 text-white border-transparent shadow-md shadow-primary/25"
                    : "bg-card border-border hover:border-primary/40 hover:text-primary"
                }`}
              >
                <span className="flex items-center gap-2">
                  {z !== "ALL" && <span className={`w-2 h-2 rounded-full ${ZONE_STYLE[z].dot}`} />}
                  {label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? "bg-white/20" : "bg-muted"}`}>{count}</span>
                </span>
              </button>
            );
          })}
        </div>

        <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((g, i) => {
              const s = ZONE_STYLE[g.zone] || ZONE_STYLE.A;
              return (
                <motion.div
                  key={g.name}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.35, delay: (i % 12) * 0.025 }}
                  className="group relative rounded-xl border border-border bg-card p-3 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 transition-all"
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
                  <div className={`absolute inset-x-0 -bottom-px h-0.5 bg-gradient-to-l from-transparent via-primary to-transparent scale-x-0 group-hover:scale-x-100 transition-transform`} />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
