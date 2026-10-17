"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Building2, Navigation, Layers, CheckCircle2, Radio, X } from "lucide-react";
import { apiGet } from "@/lib/api";
import { useT } from "@/lib/i18n";
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

const ZONE: Record<string, { labelAr: string; labelEn: string; color: string }> = {
  A: { labelAr: "القاهرة الكبرى", labelEn: "Greater Cairo", color: "#34d399" },
  B: { labelAr: "الوجه البحري", labelEn: "Delta", color: "#60a5fa" },
  C: { labelAr: "الصعيد", labelEn: "Upper Egypt", color: "#fbbf24" },
  D: { labelAr: "الحدود والقناة", labelEn: "Borders & Canal", color: "#fb7185" },
  R: { labelAr: "مراكز إقليمية وخليجية", labelEn: "Regional & Gulf Hubs", color: "#fbbf24" },
};

const HUB = "Cairo";
const HUB_COLOR = "#ef4444";

// Node codes for telemetry display (e.g. "EG-ASW", "SA-RUH", "UAE-DXB")
const NODE_CODES: Record<string, string> = {
  Cairo: "EG-CAI", Giza: "EG-GIZ", Alexandria: "EG-ALX", Qalyubia: "EG-QLY",
  "Port Said": "EG-PSD", Suez: "EG-SUZ", Dakahlia: "EG-DAK", Sharqia: "EG-SHR",
  "Kafr El Sheikh": "EG-KFS", Gharbia: "EG-GHB", Monufia: "EG-MNF", Beheira: "EG-BHR",
  Ismailia: "EG-ISM", Faiyum: "EG-FYM", "Beni Suef": "EG-BNS", Minya: "EG-MIN",
  Asyut: "EG-ASY", Sohag: "EG-SHG", Qena: "EG-QEN", Luxor: "EG-LXR",
  Aswan: "EG-ASW", "Red Sea": "EG-RDS", "New Valley": "EG-NWV", Matrouh: "EG-MAT",
  "North Sinai": "EG-NSN", "South Sinai": "EG-SSN", Damietta: "EG-DMT",
  Riyadh: "SA-RUH", Dubai: "UAE-DXB", Muscat: "OM-MCT", Khartoum: "SD-KRT",
  "Addis Ababa": "ET-ADD", Nairobi: "KE-NBO", Lagos: "NG-LOS",
  Casablanca: "MA-CAS", Johannesburg: "ZA-JNB", Algiers: "DZ-ALG", Tripoli: "LY-TIP",
};

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
  const { t, isAr } = useT();
  const { data } = useQuery({
    queryKey: ["governorates"],
    queryFn: () => apiGet<{ governorates: Gov[] }>("/api/governorates"),
  });
  const govs = data?.governorates ?? FALLBACK;
  // Fetch section content from /api/site for DB-managed bilingual heading
  const { data: siteData } = useQuery({
    queryKey: ["site-data"],
    queryFn: () => apiGet<any>("/api/site"),
  });
  const sc = siteData?.sectionContent?.find((s: any) => s.section === "map");
  const eyebrowText = isAr ? (sc?.badgeAr || t("map.eyebrow")) : (sc?.badgeEn || t("map.eyebrow"));
  const titleText = isAr ? (sc?.titleAr || t("map.title")) : (sc?.titleEn || t("map.title"));
  const subtitleText = isAr ? (sc?.descriptionAr || t("map.subtitle")) : (sc?.descriptionEn || t("map.subtitle"));
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  // Returns the localized name for a governorate (Arabic uses nameAr, English uses name).
  const govName = (g: Gov) => (isAr ? g.nameAr : g.name);
  // Returns the localized zone label.
  const zoneLabel = (z: string) => (isAr ? ZONE[z]?.labelAr : ZONE[z]?.labelEn) ?? z;
  // Returns the node code (e.g. "EG-ASW", "SA-RUH")
  const nodeCode = (name: string) => NODE_CODES[name] || `EG-${name.slice(0, 3).toUpperCase()}`;

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

  // Regional city nodes (Gulf + Africa) projected — assigned zone "R"
  const regional = useMemo(
    () => REGIONAL_CITIES.map((c) => ({ ...c, ...project(c.lat, c.lng), zone: "R" as const })),
    []
  );

  const hub = markers.find((m) => m.name === HUB) || markers[0];

  // Combined zone counts including regional
  const zoneCounts = useMemo(() => {
    const c: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, R: 0 };
    markers.forEach((m) => { if (ZONE[m.zone]) c[m.zone]++; });
    c.R = regional.length;
    return c;
  }, [markers, regional]);

  // Total node count
  const totalNodes = markers.length + regional.length;

  // Active node = selected OR hovered (hovered takes priority for live feedback)
  const activeName = hovered || selected;
  const selGov = markers.find((m) => m.name === activeName);
  const selReg = regional.find((r) => r.name === activeName);
  const sel = selGov || selReg || null;

  // Category filter — determines which nodes are highlighted vs dimmed
  const isNodeActive = (zone: string) => {
    if (activeCategory === "ALL") return true;
    return zone === activeCategory;
  };

  // Compute curved beam path from hub to active node (quadratic Bezier)
  const beamPath = useMemo(() => {
    if (!hub || !sel) return null;
    const midX = (hub.x + sel.x) / 2;
    const midY = (hub.y + sel.y) / 2;
    // Offset control point for a gentle curve
    const dx = sel.x - hub.x;
    const dy = sel.y - hub.y;
    const perpX = -dy * 0.25;
    const perpY = dx * 0.25;
    return `M ${hub.x} ${hub.y} Q ${midX + perpX} ${midY + perpY} ${sel.x} ${sel.y}`;
  }, [hub, sel]);

  return (
    <section id="map" className="scroll-mt-20 pt-20 pb-14 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-24 bg-zinc-950 relative overflow-hidden">
      {/* Atmospheric background */}
      <div className="absolute inset-0 grid-bg opacity-15" />
      <div className="absolute top-10 right-20 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[140px] animate-aurora" />
      <div className="absolute bottom-10 left-20 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] animate-aurora" style={{ animationDelay: "5s" }} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-bold mb-4 border border-primary/40"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-slow-pulse" />
            <Radio className="w-4 h-4" /> {eyebrowText}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-white"
          >
            {titleText.split("Redline")[0]}
            <span className="text-gradient-red">Redline</span>
            {titleText.split("Redline")[1]}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-zinc-300 text-lg"
          >
            {subtitleText}
          </motion.p>
        </div>

        <div className="max-w-4xl mx-auto w-full px-4 space-y-4">
          {/* Map card — holographic command center */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative w-full rounded-2xl overflow-hidden bg-slate-950/80 border border-slate-800/80 shadow-2xl shadow-primary/10"
          >
            {/* HUD header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-white/10 bg-zinc-950/80">
              <div className="flex items-center gap-2 text-[11px] sm:text-sm text-white">
                <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary animate-slow-pulse shrink-0" />
                <span className="font-bold truncate">{t("map.hud")}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-amber-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
                {totalNodes} {t("map.nodes")}
              </div>
            </div>

            {/* SVG holographic map — wide */}
            <div className="relative w-full aspect-[16/11] sm:aspect-[16/9] bg-gradient-to-b from-black via-zinc-950 to-black">
              <svg viewBox="0 0 760 700" preserveAspectRatio="xMidYMid meet" className="w-full h-full" style={{ touchAction: "none", willChange: "transform", transform: "translateZ(0)" }}>
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

                  {/* Active beam gradient (cyan → red) */}
                  <linearGradient id="beamGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.7" />
                    <stop offset="100%" stopColor={HUB_COLOR} stopOpacity="0.9" />
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

                {/* Click-outside background — clicking empty map area clears the selection */}
                <rect x="0" y="0" width="760" height="700" fill="transparent" style={{ cursor: "default" }} onClick={() => { setSelected(null); setHovered(null); }} />

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
                  const isDimmed = !isNodeActive(m.zone);
                  return (
                    <line key={"net" + m.id} x1={hub.x} y1={hub.y} x2={m.x} y2={m.y}
                      stroke={zc} strokeWidth={isActive ? 1.4 : 0.6} strokeOpacity={isActive ? 0.6 : 0.16}
                      strokeDasharray="4 4" className="flow-line"
                      style={{ animationDelay: (i % 6) * 0.2 + "s", opacity: isDimmed ? 0.1 : 1, transition: "opacity 0.3s ease" }} />
                  );
                })}

                {/* Regional network lines from Cairo to Gulf + African cities (amber) */}
                {hub && regional.map((r, i) => {
                  const isDimmed = !isNodeActive("R");
                  return (
                    <line key={"reg" + i} x1={hub.x} y1={hub.y} x2={r.x} y2={r.y}
                      stroke="#fbbf24" strokeWidth="0.5" strokeOpacity="0.18"
                      strokeDasharray="3 5" className="flow-line"
                      style={{ animationDelay: (i % 5) * 0.25 + "s", opacity: isDimmed ? 0.1 : 1, transition: "opacity 0.3s ease" }} />
                  );
                })}

                {/* Animated beam from Cairo hub to active node (curved, flowing dashes) */}
                {beamPath && (
                  <>
                    {/* Glow underlay */}
                    <path d={beamPath} fill="none" stroke="url(#beamGrad)" strokeWidth="6"
                      strokeLinecap="round" opacity="0.25" filter="url(#bigGlow)" />
                    {/* Main beam with flowing dashes */}
                    <path d={beamPath} fill="none" stroke="url(#beamGrad)" strokeWidth="2"
                      strokeLinecap="round" strokeDasharray="8 6" className="flow-line" opacity="0.9" />
                    {/* Bright core */}
                    <path d={beamPath} fill="none" stroke="#fff" strokeWidth="0.8"
                      strokeLinecap="round" strokeDasharray="2 10" className="flow-line" opacity="0.7" />
                  </>
                )}

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
                  const isSel = selected === r.name;
                  const isActive = isHov || isSel;
                  const isDimmed = !isNodeActive("R");
                  return (
                    <g key={r.name} transform={`translate(${r.x} ${r.y})`}
                      className="cursor-pointer"
                      style={{ opacity: isDimmed ? 0.3 : 1, transition: "opacity 0.3s ease" }}
                      onMouseEnter={() => setHovered(r.name)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => setSelected(r.name)}
                    >
                      {/* Pulsing ripple when active */}
                      {isActive && (
                        <circle r="20" fill="none" stroke="#fbbf24" strokeWidth="1.5" opacity="0.6">
                          <animate attributeName="r" values="8;22;8" dur="2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
                        </circle>
                      )}
                      <circle r="16" fill="#fbbf24" fillOpacity="0.12" className="city-light" filter="url(#bigGlow)" />
                      <circle r="8" fill="#fbbf24" fillOpacity="0.28" filter="url(#softGlow)" />
                      <circle r={isActive ? 6 : 4.8} fill="#fbbf24" stroke="#fff" strokeWidth="1.8" filter="url(#softGlow)" />
                      <circle r="1.8" fill="#fff" />
                      {(isActive) && (
                        <g transform="translate(0 -18)">
                          <path d="M -3 8 L 3 8 L 0 12 Z" fill="#0a0a0a" stroke="#fbbf24" strokeWidth="1.4" />
                          <rect x="-70" y="-16" width="140" height="24" rx="6" fill="#0a0a0a" stroke="#fbbf24" strokeWidth="1.4" filter="url(#softGlow)" />
                          <text y="0" textAnchor="middle" fill="#fde68a" fontSize="11" className="font-bold">{(isAr ? r.nameAr : r.name)} · {nodeCode(r.name)}</text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Egypt governorate dots — subtle clickable markers for direct map interaction */}
                {hub && markers.filter((m) => m.name !== hub.name).map((m) => {
                  const isActive = selected === m.name || hovered === m.name;
                  const isDimmed = !isNodeActive(m.zone);
                  const zc = ZONE[m.zone]?.color || HUB_COLOR;
                  return (
                    <g key={"dot" + m.id} transform={`translate(${m.x} ${m.y})`}
                      className="cursor-pointer"
                      style={{ opacity: isDimmed ? 0.25 : 1, transition: "opacity 0.3s ease" }}
                      onMouseEnter={() => setHovered(m.name)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={(e) => { e.stopPropagation(); setSelected(m.name); }}
                    >
                      {isActive && (
                        <circle r="14" fill="none" stroke={zc} strokeWidth="1.2" opacity="0.5">
                          <animate attributeName="r" values="6;16;6" dur="2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
                        </circle>
                      )}
                      <circle r={isActive ? 6 : 4} fill={zc} fillOpacity="0.5" stroke="#fff" strokeWidth="1.2" filter="url(#softGlow)" />
                      <circle r="1.2" fill="#fff" />
                      {(isActive) && (
                        <g transform="translate(0 -16)">
                          <rect x="-60" y="-14" width="120" height="22" rx="5" fill="#0a0a0a" stroke={zc} strokeWidth="1.2" filter="url(#softGlow)" />
                          <text y="1" textAnchor="middle" fill="#fff" fontSize="10" className="font-bold">{isAr ? m.nameAr : m.name}</text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Cairo HQ — Egypt service cluster (27 governorates represented) */}
                {hub && (
                  <g transform={`translate(${hub.x} ${hub.y})`} className="cursor-pointer"
                    onMouseEnter={() => setHovered(hub.name)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => setSelected(hub.name)}
                  >
                    {/* radar sweep — GPU accelerated */}
                    <g style={{ willChange: "transform", transform: "translateZ(0)" }}>
                      <path d="M 0 0 L 110 0 A 110 110 0 0 0 78 -78 Z" fill="url(#radarGrad)" opacity="0.4">
                        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="4s" repeatCount="indefinite" />
                      </path>
                    </g>
                    {/* radar rings */}
                    <circle r="38" fill="none" stroke={HUB_COLOR} strokeWidth="1" strokeOpacity="0.32" />
                    <circle r="66" fill="none" stroke={HUB_COLOR} strokeWidth="0.7" strokeOpacity="0.18" />
                    <circle r="95" fill="none" stroke={HUB_COLOR} strokeWidth="0.5" strokeOpacity="0.1" />
                    {/* base glow */}
                    <circle r="26" fill="url(#dgHub)" opacity="0.9" />
                    {/* main dot */}
                    <circle r="9" fill={HUB_COLOR} stroke="#fff" strokeWidth="2.5" filter="url(#softGlow)" />
                    <circle r="3.5" fill="#fff" />
                    {/* "27" count badge */}
                    <g transform="translate(14 -14)">
                      <circle r="11" fill="#fbbf24" stroke="#0a0a0a" strokeWidth="1.5" filter="url(#softGlow)" />
                      <text y="3" textAnchor="middle" fill="#0a0a0a" fontSize="10" className="font-black">27</text>
                    </g>
                    {/* label */}
                    {(hovered === hub.name || selected === hub.name) && (
                      <g transform="translate(0 -34)" style={{ pointerEvents: "none" }}>
                        <path d="M -3 8 L 3 8 L 0 13 Z" fill="#dc2626" />
                        <rect x="-110" y="-16" width="220" height="26" rx="7" fill="#0a0a0a" stroke={HUB_COLOR} strokeWidth="1.5" filter="url(#softGlow)" />
                        <text y="0" textAnchor="middle" fill="#fff" fontSize="12" className="font-bold">★ {isAr ? hub.nameAr : hub.name} — {isAr ? "مصر (27 محافظة)" : "Egypt (27 governorates)"}</text>
                      </g>
                    )}
                  </g>
                )}

                {/* Selected governorate marker — appears ON-DEMAND only (no permanent clutter) */}
                <AnimatePresence>
                  {selGov && selGov.name !== HUB && (
                    <motion.g
                      key={selGov.id}
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.4 }}
                      transition={{ type: "spring", stiffness: 200, damping: 18 }}
                      transform={`translate(${selGov.x} ${selGov.y})`}
                      className="cursor-pointer"
                      onMouseEnter={() => setHovered(selGov.name)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => setSelected(null)}
                    >
                      <circle r="18" fill="none" stroke={ZONE[selGov.zone]?.color} strokeWidth="1.8" className="radar-ring" style={{ filter: "drop-shadow(0 0 6px " + ZONE[selGov.zone]?.color + ")" }} />
                      <circle r="14" fill={`url(#dg${selGov.zone})`} opacity="0.95" className="city-light" />
                      <circle r="6.5" fill={ZONE[selGov.zone]?.color} fillOpacity="0.4" filter="url(#softGlow)" />
                      <circle r="4.5" fill={ZONE[selGov.zone]?.color} stroke="#fff" strokeWidth="2" filter="url(#softGlow)" />
                      <circle r="1.8" fill="#fff" />
                      <g transform="translate(0 -24)">
                        <path d="M -3 8 L 3 8 L 0 13 Z" fill="#0a0a0a" stroke={ZONE[selGov.zone]?.color} strokeWidth="1.4" />
                        <rect x="-70" y="-16" width="140" height="24" rx="6" fill="#0a0a0a" stroke={ZONE[selGov.zone]?.color} strokeWidth="1.4" filter="url(#softGlow)" />
                        <text y="0" textAnchor="middle" fill="#fff" fontSize="11" className="font-bold">{govName(selGov)} · {nodeCode(selGov.name)}</text>
                      </g>
                    </motion.g>
                  )}
                </AnimatePresence>

                {/* Compass */}
                <g transform="translate(712 52)">
                  <circle r="15" fill="none" stroke="#1e3a5f" strokeWidth="0.8" />
                  <path d="M 0 -10 L 2.5 0 L 0 10 L -2.5 0 Z" fill={HUB_COLOR} />
                  <text y="-18" textAnchor="middle" fill="#475569" fontSize="8" className="font-bold">N</text>
                </g>
              </svg>

              {/* Floating selected overlay (top-right) */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-[min(210px,calc(100%-1.5rem))]">
                <AnimatePresence mode="wait">
                  {sel ? (
                    <motion.div key={sel.name} initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      className="rounded-2xl bg-zinc-950/95 border border-primary/30 shadow-2xl p-4 min-w-[200px] relative">
                      {/* Close button — top-end corner, circular, high-contrast */}
                      <button
                        type="button"
                        onClick={() => { setSelected(null); setHovered(null); }}
                        aria-label="Close"
                        className="absolute top-3.5 end-3.5 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-slate-800/80 text-slate-300 hover:bg-red-600 hover:text-white border border-slate-700/60 shadow-md transition-all duration-200 cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      {/* Node name + code — pe-8 ensures text doesn't collide with the close button */}
                      <div className="flex items-start justify-between gap-2 pe-8">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 text-[11px] text-zinc-300">
                            <MapPin className="w-3 h-3" style={{ color: ZONE[sel.zone]?.color }} />
                            {zoneLabel(sel.zone)}
                          </div>
                          <h4 className="font-black text-base mt-0.5 text-white truncate">
                            {selGov ? govName(selGov) : (isAr ? (selReg?.nameAr || sel.name) : sel.name)}
                          </h4>
                          <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{nodeCode(sel.name)}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shrink-0"
                          style={{ background: ZONE[sel.zone]?.color, boxShadow: "0 0 10px " + ZONE[sel.zone]?.color }}>
                          {sel.zone}
                        </span>
                      </div>
                      {/* Status pill */}
                      <div className="mt-2.5 flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-semibold text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-slow-pulse" />
                          {t("map.active")}
                        </span>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="rounded-2xl bg-zinc-950/90 border border-white/10 shadow-lg p-3 flex items-center gap-2">
                      <Radio className="w-4 h-4 text-primary animate-slow-pulse shrink-0" />
                      <span className="text-xs text-zinc-300">{t("map.placeholder")}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Zone legend — clickable category filter */}
            <div className="flex flex-wrap items-center justify-center gap-2 px-4 py-3 border-t border-white/10 bg-zinc-950/80">
              {/* All button */}
              <button
                onClick={() => setActiveCategory("ALL")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  activeCategory === "ALL"
                    ? "bg-white/15 text-white border border-white/20"
                    : "text-zinc-400 hover:text-zinc-200 border border-transparent"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-white/80" />
                {isAr ? "الكل" : "All"}
                <span className="text-zinc-500">({totalNodes})</span>
              </button>
              {Object.entries(ZONE).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setActiveCategory(k)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    activeCategory === k
                      ? "bg-white/15 text-white border border-white/20"
                      : "text-zinc-400 hover:text-zinc-200 border border-transparent"
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: v.color, boxShadow: "0 0 8px " + v.color }} />
                  <span>{isAr ? v.labelAr : v.labelEn}</span>
                  <span className="text-zinc-500">({zoneCounts[k] || 0})</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Selected Governorate Details — middle card with empty-state fallback */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full rounded-2xl overflow-hidden bg-slate-950/80 border border-slate-800/80 p-4 min-h-[140px] flex"
          >
            <AnimatePresence mode="wait" className="w-full">
              {sel ? (
                <motion.div
                  key={sel.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="w-full"
                >
                  {/* Header: zone label + name + zone badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: ZONE[sel.zone]?.color }} />
                        <span className="truncate">{zoneLabel(sel.zone)}</span>
                      </div>
                      <h4 className="font-black text-lg sm:text-xl mt-0.5 text-white truncate">{govName(sel)}</h4>
                    </div>
                    <span
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white shrink-0 whitespace-nowrap"
                      style={{ background: ZONE[sel.zone]?.color, boxShadow: "0 0 10px " + ZONE[sel.zone]?.color }}
                    >
                      {t("map.zone")} {sel.zone}
                    </span>
                  </div>

                  {/* Active status pill (replaces former stats grid) */}
                  <div className="mt-3 flex items-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs font-semibold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      {t("map.active")}
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 py-2"
                >
                  {/* Empty-state placeholder with hint */}
                  <div className="flex flex-col items-center text-center gap-2 flex-1">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <Navigation className="w-5 h-5 text-zinc-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-300">{t("map.selectGov")}</p>
                      <p className="text-xs text-zinc-500 mt-0.5 max-w-xs">{t("map.selectGovHint")}</p>
                    </div>
                  </div>

                  {/* Network health snapshot (kept useful in empty state) */}
                  <div className="hidden sm:flex items-center gap-4 ps-4 border-s border-white/10">
                    <div className="text-center">
                      <div className="text-2xl font-black text-gradient-red leading-none">{markers.length}</div>
                      <div className="text-[10px] uppercase tracking-wide text-zinc-500 mt-1">{t("map.covered")}</div>
                    </div>
                    <div className="w-px h-10 bg-white/10" />
                    <div className="text-center">
                      <div className="text-2xl font-black text-amber-400 leading-none">99.2%</div>
                      <div className="text-[10px] uppercase tracking-wide text-zinc-500 mt-1">{t("map.delivery")}</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Governorates list — wrapped badge grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full rounded-2xl overflow-hidden bg-slate-950/80 border border-slate-800/80 p-4"
          >
            <div className="flex items-center gap-2 mb-3 text-start">
              <Building2 className="w-4 h-4 text-primary shrink-0" />
              <h4 className="font-bold text-sm text-white">{t("map.quicklist")}</h4>
              <span className="ms-auto text-[10px] text-zinc-500 font-medium">{markers.length}</span>
            </div>
            <div className="flex flex-wrap gap-2.5 sm:gap-3">
              {markers.map((m) => {
                const isSel = selected === m.name;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelected(m.name)}
                    onMouseEnter={() => setHovered(m.name)}
                    onMouseLeave={() => setHovered(null)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm transition-colors ${
                      isSel
                        ? "bg-primary/15 text-primary border border-primary/40"
                        : "bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white border border-white/10"
                    }`}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: ZONE[m.zone]?.color, boxShadow: "0 0 6px " + ZONE[m.zone]?.color }}
                    />
                    {govName(m)}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
