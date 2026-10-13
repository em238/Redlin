"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, Building2, Navigation, Layers, Sparkles } from "lucide-react";
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

const ZONE_STYLE: Record<string, { label: string; color: string }> = {
  A: { label: "القاهرة الكبرى", color: "#34d399" },
  B: { label: "الوجه البحري", color: "#60a5fa" },
  C: { label: "الصعيد", color: "#fbbf24" },
  D: { label: "الحدود", color: "#fb7185" },
};

const HUB = "Cairo";

export function InteractiveMap() {
  const { data } = useQuery({
    queryKey: ["governorates"],
    queryFn: () => apiGet<{ governorates: Gov[] }>("/api/governorates"),
  });
  const govs = data?.governorates ?? FALLBACK;
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

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

  const hub = markers.find((m) => m.name === HUB) || markers[0];
  const sel = markers.find((m) => m.name === selected);

  const zoneCounts = useMemo(() => {
    const c: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
    markers.forEach((m) => { if (ZONE_STYLE[m.zone]) c[m.zone]++; });
    return c;
  }, [markers]);

  return (
    <section id="map" className="py-20 sm:py-28 bg-zinc-950 relative overflow-hidden">
      {/* Atmospheric background */}
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[140px] animate-aurora" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[120px] animate-aurora" style={{ animationDelay: "5s" }} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-bold mb-4 border border-primary/30"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-slow-pulse" />
            <Layers className="w-4 h-4" /> الشبكة على الخريطة
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-white"
          >
            شبكة <span className="text-gradient-red">Redline</span> على خريطة مصر
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-zinc-400 text-lg"
          >
            27 محافظة بنقاط توصيل نشطة — جرّب الضغط على أي محافظة وشوف تفاصيلها
          </motion.p>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-6">
          {/* Map card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3 relative rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-4 sm:p-6 overflow-hidden shadow-2xl shadow-primary/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2 px-2">
              <div className="flex items-center gap-2 text-white/90 text-sm">
                <Navigation className="w-4 h-4 text-primary" />
                <span className="font-bold">خريطة التغطية الحية</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
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
                  {/* Egypt clip for texture fill */}
                  <clipPath id="egypt-clip">
                    <path d={pathFromCoords(EGYPT_BORDER) + " Z"} />
                  </clipPath>

                  {/* radial glow for markers */}
                  <radialGradient id="markerGlowA" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#34d399" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="markerGlowB" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="markerGlowC" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="markerGlowD" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fb7185" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#fb7185" stopOpacity="0" />
                  </radialGradient>

                  {/* Nile gradient */}
                  <linearGradient id="nileGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" />
                    <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#0369a1" stopOpacity="0.5" />
                  </linearGradient>

                  {/* Egypt land gradient overlay */}
                  <linearGradient id="landGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0a0a0a" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#000" stopOpacity="0.7" />
                  </linearGradient>

                  {/* glow filter */}
                  <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="b" />
                    <feMerge>
                      <feMergeNode in="b" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="bigGlow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="8" />
                  </filter>
                </defs>

                {/* Egypt landmass: outer glow halo */}
                <path d={pathFromCoords(EGYPT_BORDER) + " Z"} fill="none" stroke="#dc2626" strokeWidth="6" strokeOpacity="0.15" filter="url(#bigGlow)" />

                {/* Egypt with topographic texture fill (clipped) */}
                <g clipPath="url(#egypt-clip)">
                  {/* image texture */}
                  <image href="/images/topo-texture.png" x="0" y="0" width="600" height="720" preserveAspectRatio="xMidYMid slice" opacity="0.5" />
                  {/* mood gradient overlay */}
                  <rect width="600" height="720" fill="url(#landGrad)" />
                  {/* subtle inner glow from top */}
                  <ellipse cx="330" cy="150" rx="220" ry="120" fill="#dc2626" fillOpacity="0.08" />
                </g>

                {/* Egypt glowing animated border */}
                <path
                  d={pathFromCoords(EGYPT_BORDER) + " Z"}
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="1.5"
                  strokeOpacity="0.6"
                  strokeDasharray="6 4"
                  className="border-shimmer"
                />
                <path d={pathFromCoords(EGYPT_BORDER) + " Z"} fill="none" stroke="#dc2626" strokeWidth="0.8" strokeOpacity="0.3" filter="url(#softGlow)" />

                {/* Network flow lines from Cairo hub to all governorates */}
                {hub && markers.filter((m) => m.name !== hub.name).map((m, i) => {
                  const zc = ZONE_STYLE[m.zone]?.color || "#dc2626";
                  const isActive = selected === m.name || hovered === m.name;
                  return (
                    <line
                      key={m.id}
                      x1={hub.x} y1={hub.y} x2={m.x} y2={m.y}
                      stroke={zc}
                      strokeWidth={isActive ? 1.4 : 0.6}
                      strokeOpacity={isActive ? 0.6 : 0.18}
                      strokeDasharray="4 4"
                      className="flow-line"
                      style={{ animationDelay: `${(i % 6) * 0.2}s` }}
                    />
                  );
                })}

                {/* Nile river — thick glowing base + flowing shimmer */}
                <path d={pathFromCoords(NILE_MAIN)} fill="none" stroke="url(#nileGrad)" strokeWidth="4" strokeLinecap="round" filter="url(#softGlow)" />
                <path d={pathFromCoords(NILE_DAMIETTA)} fill="none" stroke="url(#nileGrad)" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.7" />
                <path d={pathFromCoords(NILE_ROSETTA)} fill="none" stroke="url(#nileGrad)" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.7" />
                {/* Nile flowing shimmer on top */}
                <path d={pathFromCoords(NILE_MAIN)} fill="none" stroke="#7dd3fc" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8" strokeDasharray="2 8" className="nile-flow" />

                {/* Sea labels */}
                <text x="300" y="26" fill="#52525b" fontSize="12" textAnchor="middle" className="font-medium">البحر المتوسط</text>
                <text x="545" y="380" fill="#52525b" fontSize="10" textAnchor="middle" transform="rotate(-90 545 380)">البحر الأحمر</text>

                {/* Cairo hub marker (special, larger) */}
                {hub && (
                  <g transform={`translate(${hub.x} ${hub.y})`} className="cursor-pointer" onMouseEnter={() => setHovered(hub.name)} onMouseLeave={() => setHovered(null)} onClick={() => setSelected(hub.name)}>
                    {/* soft breathing glow (city light) */}
                    <circle r="28" fill="url(#markerGlowA)" className="city-light" />
                    <circle r="20" fill="#dc2626" fillOpacity="0.25" className="city-light-2" filter="url(#softGlow)" />
                    {/* medium ring */}
                    <circle r="11" fill="#dc2626" fillOpacity="0.5" filter="url(#softGlow)" />
                    {/* main dot */}
                    <circle r="8" fill="#dc2626" stroke="#fff" strokeWidth="2.2" filter="url(#softGlow)" />
                    {/* bright core */}
                    <circle r="3" fill="#fff" />
                    {(hovered === hub.name || selected === hub.name) && (
                      <g transform="translate(0 -24)">
                        <path d="M -3 8 L 3 8 L 0 13 Z" fill="#0a0a0a" stroke="#dc2626" strokeWidth="1.5" />
                        <rect x="-42" y="-16" width="84" height="24" rx="7" fill="#0a0a0a" stroke="#dc2626" strokeWidth="1.5" filter="url(#softGlow)" />
                        <text y="-1" textAnchor="middle" fill="#fff" fontSize="12" className="font-bold">{hub.nameAr}</text>
                      </g>
                    )}
                  </g>
                )}

                {/* All governorate markers — city-light style */}
                {markers.filter((m) => m.name !== HUB).map((m) => {
                  const z = ZONE_STYLE[m.zone] || ZONE_STYLE.A;
                  const glowId = `markerGlow${m.zone}`;
                  const isSel = selected === m.name;
                  const isHov = hovered === m.name;
                  const active = isSel || isHov;
                  return (
                    <g
                      key={m.id}
                      transform={`translate(${m.x} ${m.y})`}
                      className="cursor-pointer"
                      onMouseEnter={() => setHovered(m.name)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => setSelected(m.name)}
                    >
                      {/* soft city-light glow (breathing) */}
                      <circle r={active ? 24 : 20} fill={`url(#${glowId})`} className="city-light" opacity={active ? 0.85 : 0.55} />
                      {/* colored halo */}
                      <circle r="10" fill={z.color} fillOpacity={active ? 0.45 : 0.28} filter="url(#softGlow)" className="city-light-2" />
                      {/* main solid dot */}
                      <circle r={active ? 7 : 5} fill={z.color} stroke="#fff" strokeWidth="1.8" filter="url(#softGlow)" />
                      {/* bright white core */}
                      <circle r="2" fill="#fff" />
                      {/* floating premium card on hover/selected */}
                      {active && (
                        <g transform="translate(0 -22)">
                          {/* pointer triangle */}
                          <path d="M -3 7 L 3 7 L 0 12 Z" fill="#0a0a0a" stroke={z.color} strokeWidth="1.4" />
                          {/* card */}
                          <rect x="-38" y="-15" width="76" height="22" rx="7" fill="#0a0a0a" stroke={z.color} strokeWidth="1.4" filter="url(#softGlow)" />
                          <text y="-1" textAnchor="middle" fill="#fff" fontSize="11" className="font-bold">{m.nameAr}</text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Connection lines from selected to nearby (premium highlight) */}
                {sel && markers.filter((m) => m.name !== sel.name).slice(0, 6).map((m, i) => (
                  <motion.line
                    key={"sel-" + m.id}
                    x1={sel.x} y1={sel.y} x2={m.x} y2={m.y}
                    stroke={ZONE_STYLE[m.zone]?.color || "#dc2626"}
                    strokeWidth="1.2"
                    strokeOpacity="0.5"
                    strokeDasharray="3 3"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.5 }}
                    transition={{ duration: 0.5, delay: i * 0.06 }}
                    className="flow-line"
                  />
                ))}
              </svg>
            </div>

            {/* Zone legend */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-white/10">
              {Object.entries(ZONE_STYLE).map(([k, v]) => (
                <div key={k} className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: v.color, boxShadow: "0 0 8px " + v.color }} />
                  {v.label}
                  <span className="text-zinc-600">({zoneCounts[k] || 0})</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Side panel */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <AnimatePresence mode="wait">
              {sel ? (
                <motion.div
                  key={sel.id}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="rounded-3xl border border-primary/40 bg-gradient-to-br from-primary/15 via-zinc-900 to-black p-6 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
                  <div className="relative">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          <MapPin className="w-4 h-4" style={{ color: ZONE_STYLE[sel.zone]?.color }} />
                          {ZONE_STYLE[sel.zone]?.label}
                        </div>
                        <h3 className="text-2xl font-black mt-1 text-white">{sel.nameAr}</h3>
                        <div className="text-xs text-zinc-500 font-mono mt-0.5" dir="ltr">{sel.name}</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ background: ZONE_STYLE[sel.zone]?.color, boxShadow: "0 0 12px " + ZONE_STYLE[sel.zone]?.color }}>
                        {sel.zone}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1">
                          <Clock className="w-3.5 h-3.5 text-primary" /> زمن التوصيل
                        </div>
                        <div className="text-xl font-black text-white">{Math.ceil(sel.etaHours / 24)} <span className="text-sm">يوم</span></div>
                      </div>
                      <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1">
                          <MapPin className="w-3.5 h-3.5 text-primary" /> المنطقة
                        </div>
                        <div className="text-xl font-black text-white">{ZONE_STYLE[sel.zone]?.label}</div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-amber-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      نقطة توصيل نشطة في {sel.nameAr}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-8 text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-3 relative">
                    <Navigation className="w-8 h-8 text-primary" />
                    <div className="absolute inset-0 rounded-2xl border-2 border-primary/30 animate-slow-pulse" />
                  </div>
                  <h3 className="font-bold text-white">اختر محافظة</h3>
                  <p className="text-sm text-zinc-500 mt-1">
                    اضغط على أي نقطة في الخريطة لعرض تفاصيلها
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-4 text-center">
                <div className="text-3xl font-black text-gradient-red">{markers.length}</div>
                <div className="text-xs text-zinc-500 mt-1">محافظة مغطاة</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-4 text-center">
                <div className="text-3xl font-black text-emerald-400">99.2%</div>
                <div className="text-xs text-zinc-500 mt-1">نسبة التسليم في الوقت</div>
              </div>
            </div>

            {/* Quick list */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-4">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-primary" />
                <h4 className="font-bold text-sm text-white">قائمة سريعة</h4>
              </div>
              <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto no-scrollbar">
                {markers.slice(0, 14).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelected(m.name)}
                    onMouseEnter={() => setHovered(m.name)}
                    onMouseLeave={() => setHovered(null)}
                    className={`flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors text-right ${
                      selected === m.name ? "bg-primary/15 text-primary" : "text-zinc-300 hover:bg-white/5"
                    }`}
                  >
                    <span className="truncate">{m.nameAr}</span>
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: ZONE_STYLE[m.zone]?.color, boxShadow: "0 0 6px " + ZONE_STYLE[m.zone]?.color }} />
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
