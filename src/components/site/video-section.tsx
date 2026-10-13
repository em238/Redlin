"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Video, X, Clapperboard, Film } from "lucide-react";
import { apiGet } from "@/lib/api";

interface VideoItem {
  id: string; title: string; description: string | null;
  url: string; thumbnail: string | null; category: string;
  active: boolean; featured: boolean;
}

const FALLBACK_VIDEOS: VideoItem[] = [
  {
    id: "1", title: "Redline — قصة شحن",
    description: "تعرف على رحلة Redline من البداية حتى أصبحنا أكبر شبكة شحن في مصر",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "/images/operations.png", category: "promo", active: true, featured: true,
  },
  {
    id: "2", title: "شبكة التوصيل في 27 محافظة",
    description: "كيف نغطي كل محافظات مصر بأسرع وقت ممكن",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "/images/fleet.png", category: "logistics", active: true, featured: false,
  },
];

export function VideoSection() {
  const { data } = useQuery({
    queryKey: ["site-videos"],
    queryFn: () => apiGet<{ videos: VideoItem[] }>("/api/site"),
  });
  const videos = data?.videos ?? FALLBACK_VIDEOS;
  const featured = videos.find((v) => v.featured) ?? videos[0] ?? FALLBACK_VIDEOS[0];
  const others = videos.filter((v) => v.id !== featured.id).slice(0, 3);

  const [active, setActive] = useState<VideoItem | null>(null);

  return (
    <section id="videos" className="py-20 sm:py-28 bg-gradient-to-b from-muted/40 to-background relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-3">
            <Clapperboard className="w-4 h-4" />
            معرض الفيديو
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            شاهد <span className="text-gradient-red">Redline</span> أثناء العمل
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            مقاطع توثّق عملياتنا، شبكتنا، وقصص عملائنا في كل أنحاء مصر
          </p>
        </div>

        {featured && (
          <div className="max-w-5xl mx-auto">
            {/* Featured player */}
            <motion.button
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              onClick={() => setActive(featured)}
              className="group relative w-full aspect-video rounded-3xl overflow-hidden border border-border shadow-2xl shadow-black/20 block"
            >
              {featured.thumbnail ? (
                <Image src={featured.thumbnail} alt={featured.title} fill sizes="(max-width:1024px) 100vw, 1024px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-red-900/40" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-white/95 group-hover:bg-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                  <Play className="w-9 h-9 text-primary ml-1" fill="currentColor" />
                </div>
              </div>
              <div className="absolute bottom-0 inset-x-0 p-6 text-right">
                <span className="inline-block px-2 py-0.5 rounded bg-primary text-white text-xs font-bold mb-2">المميز</span>
                <h3 className="text-2xl sm:text-3xl font-black text-white">{featured.title}</h3>
                <p className="mt-1 text-white/75 text-sm max-w-xl">{featured.description}</p>
              </div>
            </motion.button>

            {/* Other videos */}
            {others.length > 0 && (
              <div className="mt-6 grid sm:grid-cols-3 gap-4">
                {others.map((v, i) => (
                  <motion.button
                    key={v.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => setActive(v)}
                    className="group relative aspect-video rounded-2xl overflow-hidden border border-border hover:border-primary/40 transition-colors"
                  >
                    {v.thumbnail ? (
                      <Image src={v.thumbnail} alt={v.title} fill sizes="(max-width:640px) 100vw, 332px" className="object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-red-900/40 flex items-center justify-center">
                        <Film className="w-8 h-8 text-white/70" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-2 inset-x-2 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shrink-0">
                        <Play className="w-3.5 h-3.5 text-primary ml-0.5" fill="currentColor" />
                      </div>
                      <span className="text-white text-xs font-semibold line-clamp-2 text-right">{v.title}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        )}
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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl"
            >
              <button
                onClick={() => setActive(null)}
                className="absolute top-3 left-3 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white"
                aria-label="إغلاق"
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
                  {active.title}
                </h3>
                {active.description && <p className="mt-1 text-sm text-muted-foreground">{active.description}</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
