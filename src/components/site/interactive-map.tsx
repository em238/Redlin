"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, Building2, Navigation, Layers, Sparkles, CheckCircle2 } from "lucide-react";
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

const ZONE: Record<string, { label: string; color: string; soft: string }> = {
  A: { label: "القاهرة الكبرى", color: "#059669", soft: "#a7f3d0" },
  B: { label: "الوجه البحري", color: "#2563eb", soft: "#bfdbfe" },
  C: { label: "الصعيد", color: "#d97706", soft: "#fde68a" },
  D: { label: "الحدود", color: "#e11d48", soft: "#fecdd3" },
};

const HUB = "Cairo";

// Political-map palette
const SEA = "#e0f2fe";
const SEA_DEEP = "#bae6fd";
const EGYPT_FILL = "#fde2e4";
const EGYPT_FILL2 = "#fcc5cc";
const EGYPT_STROKE = "#ffffff";
const NILE_COLOR = "#38bdf8";
const TEXT_DARK = "#1e293b";
const TEXT_SEA = "#0284c7";

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
    markers.forEach((m) => { if (ZONE[m.zone]) c[m.zone]++; });
    return c;
  }, [markers]);

  return (
    <section id="map" className="py-20 sm:py-28 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <SectionHeading
          eyebrow={<span className="flex items-center gap-1.5"><Layers className="w-4 h-4" /> شبكة التغطية</span>}
          title={<>خريطة <span className="text-gradient-red">مصر</span> الكاملة</>}
          subtitle="27 محافظة بنقاط توصيل نشطة — استكشف الخريطة واضغط على أي محافظة لعرض تفاصيلها"
        />

        <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-6">
          {/* Map card — clean political map style */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3 relative rounded-3xl bg-white border border-border shadow-2xl shadow-black/10 overflow-hidden"
          >
            {/* Map header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2 text-sm">
                <Navigation className="w-4 h-4 text-primary" />
                <span className="font-bold">خريطة التغطية — جمهورية مصر العربية</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                {markers.length} محافظة
              </div>
            </div>

            {/* SVG political map */}
            <div className="relative aspect-[5/6] w-full bg-[#e0f2fe]">
              <svg viewBox="0 0 600 720" className="w-full h-full" style={{ touchAction: "none" }}>
                <defs>
                  <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SEA_DEEP} />
                    <stop offset="100%" stopColor={SEA} />
                  </linearGradient>
                  <linearGradient id="egyptGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={EGYPT_FILL} />
                    <stop offset="100%" stopColor={EGYPT_FILL2} />
                  </linearGradient>
                  <linearGradient id="nileGradP" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={NILE_COLOR} />
                    <stop offset="100%" stopColor="#0ea5e9" />
                  </linearGradient>
                  <filter id="dotShadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.3" />
                  </filter>
                </defs>

                {/* Sea background */}
                <rect width="600" height="720" fill="url(#seaGrad)" />

                {/* Subtle sea grid (lat/long lines) for professional map feel */}
                <g stroke="#7dd3fc" strokeWidth="0.4" strokeOpacity="0.4">
                  {[100, 200, 300, 400, 500].map((x) => (
                    <line key={"v" + x} x1={x} y1="0" x2={x} y2="720" />
                  ))}
                  {[100, 200, 300, 400, 500, 600].map((y) => (
                    <line key={"h" + y} x1="0" y1={y} x2="600" y2={y} />
                  ))}
                </g>

                {/* Egypt landmass */}
                <path d={pathFromCoords(EGYPT_BORDER) + " Z"} fill="url(#egyptGrad)" stroke={EGYPT_STROKE} strokeWidth="2" strokeLinejoin="round" />
                {/* subtle inner shading */}
                <path d={pathFromCoords(EGYPT_BORDER) + " Z"} fill="none" stroke="#f9a8b0" strokeWidth="0.6" strokeOpacity="0.5" transform="translate(1 1)" />

                {/* Nile river */}
                <path d={pathFromCoords(NILE_MAIN)} fill="none" stroke={NILE_COLOR} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d={pathFromCoords(NILE_DAMIETTA)} fill="none" stroke={NILE_COLOR} strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.85" />
                <path d={pathFromCoords(NILE_ROSETTA)} fill="none" stroke={NILE_COLOR} strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.85" />

                {/* Sea labels (italic blue, like political maps) */}
                <text x="300" y="30" fill={TEXT_SEA} fontSize="13" fontStyle="italic" textAnchor="middle" className="font-semibold">البحر المتوسط</text>
                <text x="555" y="380" fill={TEXT_SEA} fontSize="11" fontStyle="italic" textAnchor="middle" transform="rotate(-90 555 380)">البحر الأحمر</text>
                <text x="120" y="690" fill={TEXT_SEA} fontSize="10" fontStyle="italic" textAnchor="middle">الصحراء الغربية</text>

                {/* Egypt country label (bold, centered) */}
                <text x="300" y="430" fill="#9f1239" fontSize="22" textAnchor="middle" className="font-black tracking-widest opacity-30">مصر</text>

                {/* Connection lines from selected to others (subtle dashed) */}
                {sel && markers.filter((m) => m.name !== sel.name).slice(0, 8).map((m, i) => (
                  <motion.line
                    key={"sel" + m.id}
                    x1={sel.x} y1={sel.y} x2={m.x} y2={m.y}
                    stroke={ZONE[m.zone]?.color || "#dc2626"}
                    strokeWidth="1"
                    strokeOpacity="0.35"
                    strokeDasharray="3 3"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.35 }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                  />
                ))}

                {/* Cairo hub marker (capital — star/special) */}
                {hub && (
                  <g transform={`translate(${hub.x} ${hub.y})`} className="cursor-pointer" onMouseEnter={() => setHovered(hub.name)} onMouseLeave={() => setHovered(null)} onClick={() => setSelected(hub.name)}>
                    {(hovered === hub.name || selected === hub.name) && (
                      <circle r="14" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeOpacity="0.5" />
                    )}
                    <circle r="6" fill="#dc2626" stroke="#fff" strokeWidth="2" filter="url(#dotShadow)" />
                    <path d="M 0 -8 L 1.8 -3 L 6 -3 L 2.5 0 L 3.6 4.5 L 0 2 L -3.6 4.5 L -2.5 0 L -6 -3 L -1.8 -3 Z" fill="#fbbf24" stroke="#fff" strokeWidth="0.8" transform="translate(0 -7) scale(0.6)" />
                    {(hovered === hub.name || selected === hub.name) && (
                      <g transform="translate(0 -20)">
                        <path d="M -3 8 L 3 8 L 0 13 Z" fill="#1e293b" />
                        <rect x="-44" y="-16" width="88" height="24" rx="6" fill="#1e293b" />
                        <text y="-1" textAnchor="middle" fill="#fff" fontSize="12" className="font-bold">★ {hub.nameAr} (العاصمة)</text>
                      </g>
                    )}
                  </g>
                )}

                {/* Governorate markers — clean political-map dots */}
                {markers.filter((m) => m.name !== HUB).map((m) => {
                  const z = ZONE[m.zone] || ZONE.A;
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
                      {/* selection ring */}
                      {active && <circle r="12" fill="none" stroke={z.color} strokeWidth="1.5" strokeOpacity="0.45" />}
                      {/* soft halo */}
                      {active && <circle r="10" fill={z.color} fillOpacity="0.18" />}
                      {/* main dot */}
                      <circle r={active ? 5.5 : 4} fill={z.color} stroke="#fff" strokeWidth="1.8" filter="url(#dotShadow)" />
                      {/* center dot */}
                      <circle r="1.4" fill="#fff" />
                      {/* inline label (political map style) */}
                      {active && (
                        <g transform="translate(0 -16)">
                          <path d="M -3 7 L 3 7 L 0 11 Z" fill="#1e293b" />
                          <rect x="-34" y="-15" width="68" height="22" rx="5" fill="#1e293b" filter="url(#dotShadow)" />
                          <text y="-1" textAnchor="middle" fill="#fff" fontSize="11" className="font-bold">{m.nameAr}</text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Compass rose (decorative, professional map touch) */}
                <g transform="translate(545 60)">
                  <circle r="16" fill="#fff" stroke="#cbd5e1" strokeWidth="1" fillOpacity="0.9" />
                  <path d="M 0 -12 L 3 0 L 0 12 L -3 0 Z" fill="#dc2626" />
                  <path d="M -12 0 L 0 3 L 12 0 L 0 -3 Z" fill="#94a3b8" />
                  <text y="-20" textAnchor="middle" fill="#475569" fontSize="9" className="font-bold">N</text>
                </g>

                {/* Scale bar (decorative) */}
                <g transform="translate(40 680)">
                  <rect x="0" y="0" width="30" height="6" fill="#1e293b" />
                  <rect x="30" y="0" width="30" height="6" fill="#fff" stroke="#1e293b" strokeWidth="0.5" />
                  <rect x="60" y="0" width="30" height="6" fill="#1e293b" />
                  <text x="45" y="-4" textAnchor="middle" fill="#475569" fontSize="9">0 — 300 كم</text>
                </g>
              </svg>
            </div>

            {/* Zone legend */}
            <div className="flex flex-wrap items-center justify-center gap-3 px-4 py-3 border-t border-border bg-muted/30">
              {Object.entries(ZONE).map(([k, v]) => (
                <div key={k} className="flex items-center gap-1.5 text-xs text-foreground/70">
                  <span className="w-2.5 h-2.5 rounded-full border border-white shadow-sm" style={{ background: v.color }} />
                  <span className="font-medium">{v.label}</span>
                  <span className="text-muted-foreground">({zoneCounts[k] || 0})</span>
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/5 to-card p-6 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-28 h-28 bg-primary/10 rounded-full blur-3xl" />
                  <div className="relative">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" style={{ color: ZONE[sel.zone]?.color }} />
                          {ZONE[sel.zone]?.label}
                        </div>
                        <h3 className="text-2xl font-black mt-1">{sel.nameAr}</h3>
                        <div className="text-xs text-muted-foreground font-mono mt-0.5" dir="ltr">{sel.name}</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ background: ZONE[sel.zone]?.color }}>
                        {sel.zone}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-card border border-border p-3">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                          <Clock className="w-3.5 h-3.5 text-primary" /> زمن التوصيل
                        </div>
                        <div className="text-xl font-black">{Math.ceil(sel.etaHours / 24)} <span className="text-sm">يوم</span></div>
                      </div>
                      <div className="rounded-xl bg-card border border-border p-3">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> الحالة
                        </div>
                        <div className="text-sm font-black text-emerald-600">نقطة نشطة</div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-amber-600">
                      <Sparkles className="w-3.5 h-3.5" />
                      تغطية كاملة في {sel.nameAr} — {ZONE[sel.zone]?.label}
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

            {/* Quick list */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-primary" />
                <h4 className="font-bold text-sm">قائمة المحافظات</h4>
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
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: ZONE[m.zone]?.color }} />
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
