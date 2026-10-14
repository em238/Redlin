"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Building2, Navigation, Layers, CheckCircle2, Radio } from "lucide-react";
import { apiGet } from "@/lib/api";
import { SectionHeading } from "@/components/shared/section-heading";
import { AFRICA_BORDER, MIDEAST_BORDER, REGIONAL_CITIES, NILE_MAIN, NILE_DAMIETTA, NILE_ROSETTA, GOV_COORDS, project, pathFromCoords } from "@/lib/egypt-coords";

interface Gov {
  id: string; name: string; nameAr: string; zone: string;
  basePrice: number; etaHours: number; active: boolean;
}

const FALLBACK: Gov[] = [
  { id: "1", name: "Cairo", nameAr: "القاهرة", zone: "A", basePrice: 30, etaHours: 24, active: true },
  { id: "2", name: "Giza", nameAr: "الجيزة", zone: "A", basePrice: 30, etaHours: 24, active: true },
  { id: "3", name: "Alexandria", nameAr: "الاسكندرية", zone: "A", basePrice: 40, etaHours: 36, active: true },
  { id: "4", name: "Aswan", nameAr: "اسوان", zone: "D", basePrice: 90, etaHours: 96, active: true },
  { id: "5", name: "Luxor", nameAr: "الاقصر", zone: "D", basePrice: 80, etaHours: 96, active: true },
];

const ZONE: Record<string, { label: string; color: string }> = {
  A: { label: "القاهرة الكبرى", color: "#34d399" },
  B: { label: "الوجه البحري", color: "#60a5fa" },
  C: { label: "الصعيد", color: "#fbbf24" },
  D: { label: "الحدود", color: "#fb7185" },
};

const HUB = "Cairo";
const HUB_COLOR = "#ef4444";

// Stars + particles (stable random positions)
const STARS = Array.from({ length: 80 }).map((_, i) => ({
  x: (i * 137.5) % 760,
  y: (i * 89.3) % 700,
  r: (i % 3) * 0.4 + 0.4,
  delay: (i % 7) * 0.6,
}));
const PARTICLES = Array.from({ length: 22 }).map((_, i) => ({
  x: 40 + ((i * 53) % 680),
  y: 50 + ((i * 91) % 600),
  delay: (i % 6) * 0.8,
}));

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

  // Regional city nodes (Gulf + Africa) projected
  const regional = useMemo(
    () => REGIONAL_CITIES.map((c) => ({ ...c, ...project(c.lat, c.lng) })),
    []
  );

  const hub = markers.find((m) => m.name === HUB) || markers[0];
  const sel = markers.find((m) => m.name === selected);

  const zoneCounts = useMemo(() => {
    const c: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
    markers.forEach((m) => { if (ZONE[m.zone]) c[m.zone]++; });
    return c;
  }, [markers]);

  return (
    <section id="map" className="py-20 sm:py-28 bg-zinc-950 relative overflow-hidden">
      {/* Atmospheric background */}
      <div className="absolute inset-0 grid-bg opacity-15" />
      <div className="absolute top-10 right-20 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[140px] animate-aurora" />
      <div className="absolute bottom-10 left-20 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] animate-aurora" style={{ animationDelay: "5s" }} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-bold mb-4 border border-primary/40"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-slow-pulse" />
            <Radio className="w-4 h-4" /> الشبكة الإقليمية — أفريقيا والخليج
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-white"
          >
            شبكة <span className="text-gradient-red">Redline</span> على خريطة أفريقيا والخليج
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-zinc-400 text-lg"
          >
            {markers.length} محافظة مصرية + {regional.length} مركز إقليمي — جرّب الضغط على أي نقطة
          </motion.p>
        </div>

        <div className="max-w-7xl mx-auto space-y-4">
          {/* Map card — holographic command center */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl bg-black border border-primary/20 shadow-2xl shadow-primary/10 overflow-hidden"
          >
            {/* HUD header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-zinc-950/80">
              <div className="flex items-center gap-2 text-sm text-white">
                <Radio className="w-4 h-4 text-primary animate-slow-pulse" />
                <span className="font-bold">LIVE LOGISTICS GRID — AFRICA & MIDDLE EAST</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                {markers.length + regional.length} NODES ACTIVE
              </div>
            </div>

            {/* SVG holographic map — wide */}
            <div className="relative w-full aspect-[16/11] sm:aspect-[16/9] bg-gradient-to-b from-black via-zinc-950 to-black">
              <svg viewBox="0 0 760 700" preserveAspectRatio="xMidYMid meet" className="w-full h-full" style={{ touchAction: "none" }}>
                <defs>
                  {/* beam gradients (vertical: transparent top → bright base) */}
                  {Object.entries(ZONE).map(([k, v]) => (
                    <linearGradient key={"beam" + k} id={"beam" + k} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={v.color} stopOpacity="0" />
                      <stop offset="60%" stopColor={v.color} stopOpacity="0.7" />
                      <stop offset="100%" stopColor={v.color} stopOpacity="1" />
                    </linearGradient>
                  ))}
                  <linearGradient id="beamHub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={HUB_COLOR} stopOpacity="0" />
                    <stop offset="60%" stopColor={HUB_COLOR} stopOpacity="0.75" />
                    <stop offset="100%" stopColor={HUB_COLOR} stopOpacity="1" />
                  </linearGradient>

                  {/* dot glow (radial) */}
                  {Object.entries(ZONE).map(([k, v]) => (
                    <radialGradient key={"dg" + k} id={"dg" + k} cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor={v.color} stopOpacity="0.9" />
                      <stop offset="100%" stopColor={v.color} stopOpacity="0" />
                    </radialGradient>
                  ))}
                  <radialGradient id="dgHub" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={HUB_COLOR} stopOpacity="1" />
                    <stop offset="100%" stopColor={HUB_COLOR} stopOpacity="0" />
                  </radialGradient>

                  {/* radar sweep fade */}
                  <linearGradient id="radarGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={HUB_COLOR} stopOpacity="0.5" />
                    <stop offset="100%" stopColor={HUB_COLOR} stopOpacity="0" />
                  </linearGradient>

                  {/* nile neon */}
                  <linearGradient id="nileNeon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.6" />
                  </linearGradient>

                  {/* egypt wireframe glow */}
                  <linearGradient id="egyptWire" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#dc2626" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#dc2626" stopOpacity="0.04" />
                  </linearGradient>

                  <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="b" />
                    <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                  <filter id="bigGlow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="6" />
                  </filter>
                </defs>

                {/* Stars background */}
                {STARS.map((s, i) => (
                  <circle key={"star" + i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity="0.4" className="particle" style={{ animationDelay: s.delay + "s" }} />
                ))}

                {/* Lat/long grid (subtle cyan) */}
                <g stroke="#0ea5e9" strokeWidth="0.3" strokeOpacity="0.1">
                  {[60, 130, 200, 270, 340, 410, 480, 550, 620, 690].map((x) => (
                    <line key={"gv" + x} x1={x} y1="0" x2={x} y2="700" />
                  ))}
                  {[60, 130, 200, 270, 340, 410, 480, 550, 620].map((y) => (
                    <line key={"gh" + y} x1="0" y1={y} x2="760" y2={y} />
                  ))}
                </g>

                {/* Africa + Middle East landmass wireframe */}
                <path d={pathFromCoords(AFRICA_BORDER) + " Z"} fill="url(#egyptWire)" />
                <path d={pathFromCoords(AFRICA_BORDER) + " Z"} fill="none" stroke="#dc2626" strokeWidth="1" strokeOpacity="0.5" filter="url(#softGlow)" />
                <path d={pathFromCoords(MIDEAST_BORDER) + " Z"} fill="url(#egyptWire)" />
                <path d={pathFromCoords(MIDEAST_BORDER) + " Z"} fill="none" stroke="#dc2626" strokeWidth="1" strokeOpacity="0.5" filter="url(#softGlow)" />

                {/* Nile neon */}
                <path d={pathFromCoords(NILE_MAIN)} fill="none" stroke="url(#nileNeon)" strokeWidth="3" strokeLinecap="round" filter="url(#softGlow)" />
                <path d={pathFromCoords(NILE_DAMIETTA)} fill="none" stroke="url(#nileNeon)" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7" />
                <path d={pathFromCoords(NILE_ROSETTA)} fill="none" stroke="url(#nileNeon)" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7" />
                <path d={pathFromCoords(NILE_MAIN)} fill="none" stroke="#a5f3fc" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.7" strokeDasharray="2 8" className="nile-flow" />

                {/* Network lines from Cairo hub to Egypt governorates */}
                {hub && markers.filter((m) => m.name !== hub.name).map((m, i) => {
                  const zc = ZONE[m.zone]?.color || HUB_COLOR;
                  const isActive = selected === m.name || hovered === m.name;
                  return (
                    <line key={"net" + m.id} x1={hub.x} y1={hub.y} x2={m.x} y2={m.y}
                      stroke={zc} strokeWidth={isActive ? 1.4 : 0.6} strokeOpacity={isActive ? 0.6 : 0.16}
                      strokeDasharray="4 4" className="flow-line" style={{ animationDelay: (i % 6) * 0.2 + "s" }} />
                  );
                })}

                {/* Regional network lines from Cairo to Gulf + African cities (amber) */}
                {hub && regional.map((r, i) => (
                  <line key={"reg" + i} x1={hub.x} y1={hub.y} x2={r.x} y2={r.y}
                    stroke="#fbbf24" strokeWidth="0.5" strokeOpacity="0.18"
                    strokeDasharray="3 5" className="flow-line" style={{ animationDelay: (i % 5) * 0.25 + "s" }} />
                ))}

                {/* Floating particles */}
                {PARTICLES.map((p, i) => (
                  <circle key={"p" + i} cx={p.x} cy={p.y} r="1.5" fill={HUB_COLOR} opacity="0.4" className="particle" style={{ animationDelay: p.delay + "s" }} />
                ))}

                {/* Sea labels (subtle) */}
                <text x="380" y="22" fill="#334155" fontSize="12" textAnchor="middle" className="font-medium">MEDITERRANEAN SEA</text>
                <text x="560" y="360" fill="#334155" fontSize="10" textAnchor="middle" transform="rotate(-90 560 360)">RED SEA / GULF</text>
                <text x="120" y="380" fill="#334155" fontSize="11" textAnchor="middle" transform="rotate(-90 120 380)">ATLANTIC OCEAN</text>
                <text x="400" y="640" fill="#334155" fontSize="11" textAnchor="middle">INDIAN OCEAN</text>
                <text x="160" y="470" fill="#7f1d1d" fontSize="24" textAnchor="middle" className="font-black tracking-widest opacity-15">AFRICA</text>
                <text x="560" y="280" fill="#7f1d1d" fontSize="16" textAnchor="middle" className="font-black tracking-widest opacity-15">ARABIA</text>

                {/* Service area ambient glow under Egypt (shows active region) */}
                {hub && <circle cx={hub.x} cy={hub.y} r="55" fill={HUB_COLOR} fillOpacity="0.07" filter="url(#bigGlow)" className="city-light" />}

                {/* Regional city nodes — flat luminous gold dots */}
                {regional.map((r) => {
                  const isHov = hovered === r.name;
                  return (
                    <g key={r.name} transform={`translate(${r.x} ${r.y})`} className="cursor-pointer" onMouseEnter={() => setHovered(r.name)} onMouseLeave={() => setHovered(null)}>
                      <circle r="16" fill="#fbbf24" fillOpacity="0.12" className="city-light" filter="url(#bigGlow)" />
                      <circle r="8" fill="#fbbf24" fillOpacity="0.28" filter="url(#softGlow)" />
                      <circle r={isHov ? 6 : 4.8} fill="#fbbf24" stroke="#fff" strokeWidth="1.8" filter="url(#softGlow)" />
                      <circle r="1.8" fill="#fff" />
                      {isHov && (
                        <g transform="translate(0 -18)">
                          <path d="M -3 8 L 3 8 L 0 12 Z" fill="#0a0a0a" stroke="#fbbf24" strokeWidth="1.4" />
                          <rect x="-54" y="-16" width="108" height="24" rx="6" fill="#0a0a0a" stroke="#fbbf24" strokeWidth="1.4" filter="url(#softGlow)" />
                          <text y="0" textAnchor="middle" fill="#fde68a" fontSize="11" className="font-bold">{r.nameAr} · مركز إقليمي</text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Cairo HQ — radar sweep + flat luminous dot (no tall beam) */}
                {hub && (
                  <g transform={`translate(${hub.x} ${hub.y})`} className="cursor-pointer" onMouseEnter={() => setHovered(hub.name)} onMouseLeave={() => setHovered(null)} onClick={() => setSelected(hub.name)}>
                    {/* radar sweep (rotating sector) */}
                    <g>
                      <path d="M 0 0 L 95 0 A 95 95 0 0 0 67 -67 Z" fill="url(#radarGrad)" opacity="0.4">
                        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="4s" repeatCount="indefinite" />
                      </path>
                    </g>
                    {/* radar rings */}
                    <circle r="34" fill="none" stroke={HUB_COLOR} strokeWidth="0.9" strokeOpacity="0.32" />
                    <circle r="60" fill="none" stroke={HUB_COLOR} strokeWidth="0.6" strokeOpacity="0.18" />
                    {/* base glow */}
                    <circle r="24" fill="url(#dgHub)" opacity="0.85" />
                    {/* main dot */}
                    <circle r="8" fill={HUB_COLOR} stroke="#fff" strokeWidth="2.5" filter="url(#softGlow)" />
                    <circle r="3" fill="#fff" />
                    {/* selection ring */}
                    {(hovered === hub.name || selected === hub.name) && <circle r="16" fill="none" stroke={HUB_COLOR} strokeWidth="1.5" strokeOpacity="0.6" />}
                    {/* label */}
                    {(hovered === hub.name || selected === hub.name) && (
                      <g transform="translate(0 -28)">
                        <path d="M -3 8 L 3 8 L 0 13 Z" fill="#dc2626" />
                        <rect x="-50" y="-16" width="100" height="26" rx="6" fill="#0a0a0a" stroke={HUB_COLOR} strokeWidth="1.5" filter="url(#softGlow)" />
                        <text y="0" textAnchor="middle" fill="#fff" fontSize="12" className="font-bold">★ {hub.nameAr} HQ</text>
                      </g>
                    )}
                  </g>
                )}

                {/* Governorate markers — flat luminous dots (no beams = no clutter) */}
                {markers.filter((m) => m.name !== HUB).map((m) => {
                  const z = ZONE[m.zone] || ZONE.A;
                  const isSel = selected === m.name;
                  const isHov = hovered === m.name;
                  const active = isSel || isHov;
                  return (
                    <g key={m.id} transform={`translate(${m.x} ${m.y})`} className="cursor-pointer" onMouseEnter={() => setHovered(m.name)} onMouseLeave={() => setHovered(null)} onClick={() => setSelected(m.name)}>
                      {/* soft glow halo */}
                      <circle r={active ? 15 : 11} fill={`url(#dg${m.zone})`} opacity={active ? 0.95 : 0.55} className="city-light" />
                      {/* colored ring */}
                      <circle r={active ? 6.5 : 5} fill={z.color} fillOpacity="0.35" filter="url(#softGlow)" />
                      {/* main dot */}
                      <circle r={active ? 4.2 : 3.4} fill={z.color} stroke="#fff" strokeWidth="1.5" filter="url(#softGlow)" />
                      {/* white core */}
                      <circle r="1.4" fill="#fff" />
                      {/* pulse ring on active */}
                      {active && <circle r="5" fill="none" stroke={z.color} strokeWidth="1.8" className="radar-ring" style={{ filter: "drop-shadow(0 0 4px " + z.color + ")" }} />}
                      {/* label */}
                      {active && (
                        <g transform="translate(0 -20)">
                          <path d="M -3 8 L 3 8 L 0 12 Z" fill="#0a0a0a" stroke={z.color} strokeWidth="1.4" />
                          <rect x="-40" y="-16" width="80" height="24" rx="6" fill="#0a0a0a" stroke={z.color} strokeWidth="1.4" filter="url(#softGlow)" />
                          <text y="0" textAnchor="middle" fill="#fff" fontSize="11" className="font-bold">{m.nameAr}</text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* connection highlight from selected */}
                {sel && markers.filter((m) => m.name !== sel.name).slice(0, 7).map((m, i) => (
                  <motion.line key={"s" + m.id} x1={sel.x} y1={sel.y} x2={m.x} y2={m.y}
                    stroke={ZONE[m.zone]?.color || HUB_COLOR} strokeWidth="1.2" strokeOpacity="0.5" strokeDasharray="3 3"
                    initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.5 }}
                    transition={{ duration: 0.5, delay: i * 0.05 }} className="flow-line" />
                ))}

                {/* Compass */}
                <g transform="translate(712 52)">
                  <circle r="15" fill="none" stroke="#1e3a5f" strokeWidth="0.8" />
                  <path d="M 0 -10 L 2.5 0 L 0 10 L -2.5 0 Z" fill={HUB_COLOR} />
                  <text y="-18" textAnchor="middle" fill="#475569" fontSize="8" className="font-bold">N</text>
                </g>
              </svg>

              {/* Floating selected overlay (top-right) */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-[210px]">
                <AnimatePresence mode="wait">
                  {sel ? (
                    <motion.div key={sel.id} initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="rounded-2xl bg-zinc-950/90 backdrop-blur-md border border-primary/30 shadow-2xl p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                            <MapPin className="w-3 h-3" style={{ color: ZONE[sel.zone]?.color }} />
                            {ZONE[sel.zone]?.label}
                          </div>
                          <h4 className="font-black text-lg mt-0.5 text-white truncate">{sel.nameAr}</h4>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shrink-0" style={{ background: ZONE[sel.zone]?.color, boxShadow: "0 0 10px " + ZONE[sel.zone]?.color }}>{sel.zone}</span>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs">
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> نقطة توصيل نشطة
                        </span>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="rounded-2xl bg-zinc-950/85 backdrop-blur-md border border-white/10 shadow-lg p-3 flex items-center gap-2">
                      <Radio className="w-4 h-4 text-primary animate-slow-pulse shrink-0" />
                      <span className="text-xs text-zinc-400">اضغط على أي محافظة</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Zone legend */}
            <div className="flex flex-wrap items-center justify-center gap-3 px-4 py-3 border-t border-white/10 bg-zinc-950/80">
              {Object.entries(ZONE).map(([k, v]) => (
                <div key={k} className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: v.color, boxShadow: "0 0 8px " + v.color }} />
                  <span className="font-medium">{v.label}</span>
                  <span className="text-zinc-600">({zoneCounts[k] || 0})</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Bottom row */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5 flex items-center justify-around">
              <div className="text-center">
                <div className="text-3xl font-black text-gradient-red">{markers.length}</div>
                <div className="text-xs text-zinc-500 mt-1">محافظة مغطاة</div>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="text-center">
                <div className="text-3xl font-black text-emerald-400">99.2%</div>
                <div className="text-xs text-zinc-500 mt-1">تسليم في الوقت</div>
              </div>
            </div>
            <div className="sm:col-span-2 rounded-2xl border border-white/10 bg-zinc-950 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-primary" />
                <h4 className="font-bold text-sm text-white">قائمة المحافظات</h4>
              </div>
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {markers.map((m) => (
                  <button key={m.id} onClick={() => setSelected(m.name)} onMouseEnter={() => setHovered(m.name)} onMouseLeave={() => setHovered(null)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
                      selected === m.name ? "bg-primary/15 text-primary border border-primary/40" : "text-zinc-300 hover:bg-white/5 border border-transparent"
                    }`}>
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: ZONE[m.zone]?.color, boxShadow: "0 0 6px " + ZONE[m.zone]?.color }} />
                    {m.nameAr}
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
