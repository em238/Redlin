"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, Truck, Building2, Navigation, Layers, Sparkles } from "lucide-react";
import { apiGet } from "@/lib/api";
import { SectionHeading } from "@/components/shared/section-heading";
import { EGYPT_BORDER, NILE_MAIN, NILE_DAMIETTA, NILE_ROSETTA, GOV_COORDS, project, pathFromCoords } from "@/lib/egypt-coords";

interface Gov {
  id: string; name: string; nameAr: string; zone: string;
  basePrice: number; etaHours: number; active: boolean;
}

const FALLBACK: Gov[] = [
  { id: "1", name: "Cairo", nameAr: "القاهره", zone: "A", basePrice: 30, etaHours: 24, active: true },
  { id: "2", name: "Giza", nameAr: "الجيزه", zone: "A", basePrice: 30, etaHours: 24, active: true },
  { id: "3", name: "Alexandria", nameAr: "الاسكندريه", zone: "A", basePrice: 40, etaHours: 36, active: true },
  { id: "4", name: "Aswan", nameAr: "اسوان", zone: "D", basePrice: 90, etaHours: 96, active: true },
  { id: "5", name: "Luxor", nameAr: "الاقصر", zone: "D", basePrice: 80, etaHours: 96, active: true },
];

const ZONE_STYLE: Record<string, { label: string; color: string; ring: string; bg: string }> = {
  A: { label: "القاهرة الكبرى", color: "#10b981", ring: "stroke-emerald-500", bg: "fill-emerald-500/10" },
  B: { label: "الوجه البحري", color: "#3b82f6", ring: "stroke-blue-500", bg: "fill-blue-500/10" },
  C: { label: "الصعيد", color: "#f59e0b", ring: "stroke-amber-500", bg: "fill-amber-500/10" },
  D: { label: "الحدود", color: "#f43f5e", ring: "stroke-rose-500", bg: "fill-rose-500/10" },
};

export function InteractiveMap() {
  const { data } = useQuery({
    queryKey: ["governorates"],
    queryFn: () => apiGet<{ governorates: Gov[] }>("/api/governorates"),
  });
  const govs = data?.governorates ?? FALLBACK;
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  // Build marker data: governorate + projected coordinates
  const markers = useMemo(
    () =>
      govs
        .filter((g) => GOV_COORDS[g.name])
        .map((g) => {
          const c = GOV_COORDS[g.name];
          const p = project(c.lat, c.lng);
          return { ...g, ...p };
        }),
    [govs]
  );

  const sel = markers.find((m) => m.name === selected);

  const zoneCounts = useMemo(() => {
    const c: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
    markers.forEach((m) => { if (ZONE_STYLE[m.zone]) c[m.zone]++; });
    return c;
  }, [markers]);

  return (
    <section id="map" className="py-20 sm:py-28 bg-gradient-to-b from-background via-muted/30 to-background relative overflow-hidden">
      {/* Decorative grid */}
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <SectionHeading
          eyebrow={<span className="flex items-center gap-1.5"><Layers className="w-4 h-4" /> الشبكة على الخريطة</span>}
          title={<>شبكة <span className="text-gradient-red">Redline</span> على خريطة مصر</>}
          subtitle="27 محافظة بنقاط توصيل نشطة — تصفّح الخريطة وشوف تفاصيل كل محافظة وأسعارها وأزمنة التوصيل"
        />

        <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-6">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3 relative rounded-3xl border border-border bg-gradient-to-br from-zinc-950 to-zinc-900 p-4 sm:p-6 overflow-hidden shadow-2xl"
          >
            {/* Map header */}
            <div className="flex items-center justify-between mb-2 px-2">
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Navigation className="w-4 h-4 text-primary" />
                <span className="font-semibold">خريطة التغطية</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/50">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                {markers.length} محافظة نشطة
              </div>
            </div>

            {/* SVG Map */}
            <div className="relative aspect-[5/6] w-full">
              <svg viewBox="0 0 600 720" className="w-full h-full" style={{ touchAction: "none" }}>
                <defs>
                  <radialGradient id="mapGlow" cx="50%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#dc2626" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="nileGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.4" />
                  </linearGradient>
                  <filter id="markerGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="b" />
                    <feMerge>
                      <feMergeNode in="b" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Background glow */}
                <rect width="600" height="720" fill="url(#mapGlow)" />

                {/* Egypt landmass */}
                <motion.path
                  d={pathFromCoords(EGYPT_BORDER) + " Z"}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1 }}
                  fill="#18181b"
                  stroke="#dc2626"
                  strokeWidth="1.5"
                  strokeOpacity="0.5"
                />
                {/* Inner subtle fill */}
                <path d={pathFromCoords(EGYPT_BORDER) + " Z"} fill="#27272a" fillOpacity="0.6" />

                {/* Nile river */}
                <path d={pathFromCoords(NILE_MAIN)} fill="none" stroke="url(#nileGrad)" strokeWidth="3" strokeLinecap="round" />
                <path d={pathFromCoords(NILE_DAMIETTA)} fill="none" stroke="url(#nileGrad)" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7" />
                <path d={pathFromCoords(NILE_ROSETTA)} fill="none" stroke="url(#nileGrad)" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7" />

                {/* Mediterranean + Red Sea labels */}
                <text x="300" y="28" fill="#71717a" fontSize="13" textAnchor="middle" className="font-medium">البحر المتوسط</text>
                <text x="540" y="400" fill="#71717a" fontSize="11" textAnchor="middle" transform="rotate(-90 540 400)">البحر الأحمر</text>
                <text x="200" y="690" fill="#71717a" fontSize="11" textAnchor="middle">الصحراء الغربية</text>

                {/* Markers */}
                {markers.map((m) => {
                  const z = ZONE_STYLE[m.zone] || ZONE_STYLE.A;
                  const isSel = selected === m.name;
                  const isHov = hovered === m.name;
                  const r = isSel ? 7 : isHov ? 6 : 4;
                  return (
                    <g
                      key={m.id}
                      transform={`translate(${m.x} ${m.y})`}
                      className="cursor-pointer"
                      onMouseEnter={() => setHovered(m.name)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => setSelected(m.name)}
                    >
                      {/* pulse ring for active/selected */}
                      {(isSel || isHov) && (
                        <circle r="14" fill={z.color} fillOpacity="0.15" className="animate-slow-pulse" />
                      )}
                      {/* outer glow */}
                      <circle r={r + 3} fill={z.color} fillOpacity="0.25" filter="url(#markerGlow)" />
                      {/* main dot */}
                      <circle r={r} fill={z.color} stroke="#fff" strokeWidth="1.5" />
                      {/* center dot */}
                      <circle r="1.5" fill="#fff" />
                      {/* label on hover/selected */}
                      {(isHov || isSel) && (
                        <g transform="translate(0 -14)">
                          <rect x="-30" y="-12" width="60" height="16" rx="4" fill="#0a0a0a" stroke={z.color} strokeWidth="1" />
                          <text y="0" textAnchor="middle" fill="#fff" fontSize="10" className="font-bold">{m.nameAr}</text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* connection lines from selected to others (decorative) */}
                {sel && markers.filter((m) => m.name !== sel.name).slice(0, 8).map((m, i) => (
                  <motion.line
                    key={m.id}
                    x1={sel.x} y1={sel.y} x2={m.x} y2={m.y}
                    stroke={ZONE_STYLE[m.zone]?.color || "#dc2626"}
                    strokeWidth="0.6"
                    strokeOpacity="0.25"
                    strokeDasharray="3 3"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.25 }}
                    transition={{ duration: 0.6, delay: i * 0.04 }}
                  />
                ))}
              </svg>
            </div>

            {/* Zone legend */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 pt-3 border-t border-white/10">
              {Object.entries(ZONE_STYLE).map(([k, v]) => (
                <div key={k} className="flex items-center gap-1.5 text-xs text-white/70">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: v.color }} />
                  {v.label}
                  <span className="text-white/40">({zoneCounts[k] || 0})</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Side panel */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Selected governorate card */}
            <AnimatePresence mode="wait">
              {sel ? (
                <motion.div
                  key={sel.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/5 to-red-700/5 p-6 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                  <div className="relative">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" style={{ color: ZONE_STYLE[sel.zone]?.color }} />
                          {ZONE_STYLE[sel.zone]?.label}
                        </div>
                        <h3 className="text-2xl font-black mt-1">{sel.nameAr}</h3>
                        <div className="text-xs text-muted-foreground font-mono mt-0.5" dir="ltr">{sel.name}</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ background: ZONE_STYLE[sel.zone]?.color }}>
                        {sel.zone}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-card p-3 border border-border">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                          <Truck className="w-3.5 h-3.5 text-primary" /> السعر من
                        </div>
                        <div className="text-xl font-black text-gradient-red">{sel.basePrice} <span className="text-sm">ج.م</span></div>
                      </div>
                      <div className="rounded-xl bg-card p-3 border border-border">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                          <Clock className="w-3.5 h-3.5 text-primary" /> التوصيل
                        </div>
                        <div className="text-xl font-black">{Math.ceil(sel.etaHours / 24)} <span className="text-sm">يوم</span></div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      توصيل سريع وآمن لكل محافظات {sel.nameAr}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-3xl border border-border bg-card p-8 text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Navigation className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-bold">اختر محافظة</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    اضغط على أي نقطة في الخريطة لعرض تفاصيل المحافظة
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border bg-card p-4 text-center">
                <div className="text-3xl font-black text-gradient-red">{markers.length}</div>
                <div className="text-xs text-muted-foreground mt-1">محافظة مغطاة</div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4 text-center">
                <div className="text-3xl font-black text-emerald-600">99.2%</div>
                <div className="text-xs text-muted-foreground mt-1">نسبة التسليم في الوقت</div>
              </div>
            </div>

            {/* Governorate quick list */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-primary" />
                <h4 className="font-bold text-sm">قائمة سريعة</h4>
              </div>
              <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto no-scrollbar">
                {markers.slice(0, 14).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelected(m.name)}
                    onMouseEnter={() => setHovered(m.name)}
                    onMouseLeave={() => setHovered(null)}
                    className={`flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors text-right ${
                      selected === m.name ? "bg-primary/10 text-primary" : "hover:bg-muted"
                    }`}
                  >
                    <span className="truncate">{m.nameAr}</span>
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: ZONE_STYLE[m.zone]?.color }} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
