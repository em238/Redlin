"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowLeft, Truck, ShieldCheck, Zap, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";

const GOV_MARQUEE = [
  "القاهره", "الجيزه", "الاسكندريه", "المنيا", "اسيوط", "سوهاج",
  "الاقصر", "اسوان", "بورسعيد", "السويس", "طنطا", "المنصوره",
  "دمياط", "الفيوم", "الزقازيق", "الاسماعيليه", "شرم الشيخ", "الغردقه",
];

export function Hero() {
  const { setView } = useAppStore();

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="home" className="relative min-h-[100svh] flex items-center overflow-hidden pt-20">
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/hero-truck.png"
          alt="شاحنة Redline على الطريق السريع"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black/90 via-black/65 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
      </div>

      {/* Decorative glow */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-primary/30 rounded-full blur-[120px] -z-0 animate-slow-pulse" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            نشحن لكل محافظات مصر — 27 محافظة بنفس السرعة
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-black leading-[1.1] text-white"
          >
            شحن يصل لكل مصر
            <br />
            بسرعة <span className="text-gradient-red">Redline</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-white/80 max-w-2xl leading-relaxed"
          >
            شركة شحن احترافية تغطي جميع محافظات مصر بخدمات متنوعة — عادي، ممتاز،
            نفس اليوم، وشحن ثقيل — مع تتبع مباشر وأسعار منافسة وضمان التسليم.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Button
              size="lg"
              onClick={() => scrollTo("#pricing")}
              className="bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 text-white shadow-xl shadow-primary/30 gap-2 text-base h-12 px-7"
            >
              <Zap className="w-5 h-5" />
              احسب سعر شحنتك
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollTo("#track")}
              className="bg-white/10 backdrop-blur-md border-white/25 text-white hover:bg-white/20 hover:text-white gap-2 text-base h-12 px-7"
            >
              <Truck className="w-5 h-5" />
              تتبع شحنتك
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </motion.div>

          {/* Mini features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-10 flex flex-wrap gap-6 text-white/85"
          >
            {[
              { icon: Zap, text: "توصيل نفس اليوم في القاهرة الكبرى" },
              { icon: ShieldCheck, text: "ضمان كامل على كل شحنة" },
              { icon: MapPin, text: "27 محافظة بتغطية كاملة" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <f.icon className="w-4 h-4 text-amber-400" />
                {f.text}
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Marquee */}
      <div className="absolute bottom-0 inset-x-0 border-t border-white/10 bg-black/40 backdrop-blur-md py-3 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...GOV_MARQUEE, ...GOV_MARQUEE].map((g, i) => (
            <span key={i} className="mx-6 text-sm text-white/70 font-medium flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              {g}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
