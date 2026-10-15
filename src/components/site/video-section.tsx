"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Video, X, Clapperboard, Film } from "lucide-react";
import { apiGet } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { SectionHeading } from "@/components/shared/section-heading";

interface VideoItem {
  id: string; title: string; description: string | null;
  url: string; thumbnail: string | null; category: string;
  active: boolean; featured: boolean;
}

const FALLBACK_VIDEOS: VideoItem[] = [
  { id: "1", title: "Redline — قصة شحن", description: "تعرف على رحلة Redline", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", thumbnail: "/images/operations.png", category: "promo", active: true, featured: true },
  { id: "2", title: "شبكة التوصيل في 27 محافظة", description: "كيف نغطي كل محافظات مصر", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", thumbnail: "/images/fleet.png", category: "logistics", active: true, featured: false },
];

const CATEGORY_LABELS_AR: Record<string, string> = {
  promo: "ترويجي", logistics: "لوجستيات", tutorial: "شرح", testimonial: "آراء العملاء", other: "أخرى",
};
const CATEGORY_LABELS_EN: Record<string, string> = {
  promo: "Promo", logistics: "Logistics", tutorial: "Tutorial", testimonial: "Testimonials", other: "Other",
};

const VIDEO_EN: Record<string, { title: string; desc: string }> = {
  "Redline - قصة شحن": { title: "Redline - The Shipping Story", desc: "Discover Redline's journey from the beginning to becoming Egypt's largest shipping company" },
  "Redline — قصة شحن": { title: "Redline - The Shipping Story", desc: "Discover Redline's journey from the beginning to becoming Egypt's largest shipping company" },
  "شبكة التوصيل في 27 محافظة": { title: "Delivery Network Across 27 Governorates", desc: "How we cover all Egyptian governorates in the fastest time" },
  "رحلة شحنة من القاهرة لاسوان": { title: "A Shipment's Journey from Cairo to Aswan", desc: "Watch a Redline shipment's journey across 1000 km from Cairo to Aswan" },
  "صورة تجريبية جديدة من اللوحة": { title: "New test video from the dashboard", desc: "Test video" },
};

export function VideoSection() {
  const { t, isAr } = useT();
  const { data } = useQuery({
    queryKey: ["site-videos"],
    queryFn: () => apiGet<{ videos: VideoItem[] }>("/api/site"),
  });
  const videos = data?.videos ?? FALLBACK_VIDEOS;
  const [active, setActive] = useState<VideoItem | null>(null);
  const [category, setCategory] = useState<string>("ALL");

  const catLabel = (c: string) =>
    isAr ? CATEGORY_LABELS_AR[c] || c : CATEGORY_LABELS_EN[c] || c;

  const categories = useMemo(() => {
    const set = new Set<string>();
    videos.forEach((v) => set.add(v.category));
    return ["ALL", ...Array.from(set)];
  }, [videos]);

  const filtered = category === "ALL" ? videos : videos.filter((v) => v.category === category);
  const featured = videos.find((v) => v.featured) ?? videos[0];
  const others = filtered.filter((v) => v.id !== featured?.id).slice(0, 6);

  const titleFor = (v: VideoItem) => isAr ? v.title : (VIDEO_EN[v.title]?.title || v.title);
  const descFor = (v: VideoItem) => isAr ? v.description : (VIDEO_EN[v.title]?.desc || v.description);

  return (
    <section id="videos" className="py-14 sm:py-24 lg:py-28 bg-muted/30 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <SectionHeading
          eyebrow={<span className="flex items-center gap-1.5"><Clapperboard className="w-4 h-4" /> {t("videos.eyebrow")}</span>}
          title={
            <>
              {t("videos.title").split("Redline")[0]}
              <span className="text-gradient-red">Redline</span>
              {t("videos.title").split("Redline")[1]}
            </>
          }
          subtitle={t("videos.subtitle")}
        />

        {/* Category filter */}
        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                  category === c
                    ? "bg-gradient-to-l from-primary to-red-700 text-white border-transparent shadow-md shadow-primary/25"
                    : "bg-card border-border hover:border-primary/40"
                }`}
              >
                {c === "ALL" ? (isAr ? "الكل" : "All") : catLabel(c)}
              </button>
            ))}
          </div>
        )}

        {/* Unified container — featured + grid share same max-width */}
        <div className="max-w-6xl mx-auto">
          {/* Featured Video Card — full width */}
          {featured && category === "ALL" && (
            <motion.button
              layout
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              onClick={() => setActive(featured)}
              className="group relative w-full aspect-[4/3] sm:aspect-video min-h-[280px] rounded-3xl overflow-hidden border border-border shadow-2xl shadow-black/20 block"
            >
              {featured.thumbnail ? (
                <Image src={featured.thumbnail} alt={featured.title} fill sizes="(max-width:1024px) 100vw, 1024px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-red-900/40" />
              )}
              {/* High-contrast dark gradient overlay — bottom 75% for text legibility */}
              <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none" />
              {/* Centered play button — visual only, clicks bubble to parent */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/95 flex items-center justify-center shadow-2xl ring-4 ring-white/30 transition-transform duration-300 group-hover:scale-110">
                  <Play className="w-7 h-7 sm:w-9 sm:h-9 text-primary ml-1" fill="currentColor" />
                </div>
              </div>
              {/* Featured badge — top-start corner */}
              <div className="absolute top-4 start-4 z-10">
                <span className="inline-block px-2.5 py-1 rounded-full bg-primary text-white text-[10px] sm:text-xs font-bold shadow-lg shadow-primary/30">
                  {isAr ? "المميز" : "Featured"}
                </span>
              </div>
              {/* Bottom-anchored text block — title + description */}
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 lg:p-8 flex flex-col items-start text-start z-10 gap-1.5 sm:gap-2">
                <h3 className="text-lg sm:text-2xl lg:text-3xl font-bold text-white drop-shadow-md leading-tight line-clamp-2 max-w-md">
                  {titleFor(featured)}
                </h3>
                {descFor(featured) && (
                  <p className="text-xs sm:text-sm text-white/80 line-clamp-2 max-w-md drop-shadow leading-relaxed">
                    {descFor(featured)}
                  </p>
                )}
              </div>
            </motion.button>
          )}

          {/* Secondary Videos Grid — matches featured width exactly */}
          {others.length > 0 && (
            <motion.div layout className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <AnimatePresence mode="popLayout">
                {others.map((v, i) => (
                  <motion.button
                    key={v.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => setActive(v)}
                    className="group relative aspect-video min-h-[180px] rounded-2xl overflow-hidden border border-border hover:border-primary/40 hover:shadow-lg transition-all"
                  >
                    {v.thumbnail ? (
                      <Image src={v.thumbnail} alt={v.title} fill sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 332px" className="object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-red-900/40 flex items-center justify-center">
                        <Film className="w-8 h-8 text-white/70" />
                      </div>
                    )}
                    {/* Stronger dark gradient overlay — bottom 70% for label legibility */}
                    <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black/90 via-black/55 to-transparent pointer-events-none" />
                    {/* Category badge — top-end corner */}
                    <div className="absolute top-2 end-2 z-10">
                      <span className="px-2 py-0.5 rounded-full bg-black/70 text-white text-[10px] font-bold backdrop-blur-sm border border-white/10">
                        {catLabel(v.category)}
                      </span>
                    </div>
                    {/* Centered play button — visual only, clicks bubble to parent */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/90 flex items-center justify-center shadow-xl ring-2 ring-white/20 transition-transform duration-300 group-hover:scale-110">
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 text-primary ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                    {/* Bottom-anchored title */}
                    <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 flex flex-col items-start text-start z-10">
                      <span className="text-white text-xs sm:text-sm font-semibold line-clamp-2 drop-shadow-md leading-snug">
                        {titleFor(v)}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Modal player */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl"
            >
              <button
                onClick={() => setActive(null)}
                className="absolute top-3 left-3 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
                aria-label={isAr ? "إغلاق" : "Close"}
              >
                <X className="w-5 h-5" />
              </button>
              <div className="aspect-video">
                <iframe
                  src={`${active.url}?autoplay=1`}
                  title={active.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-5 bg-card">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Video className="w-5 h-5 text-primary" />
                  {titleFor(active)}
                </h3>
                {active.description && <p className="mt-1 text-sm text-muted-foreground">{descFor(active)}</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
