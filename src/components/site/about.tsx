"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ShieldCheck, Zap, Headphones, Banknote, MapPinned, BarChart3 } from "lucide-react";
import { useT } from "@/lib/i18n";
import { StaggerGroup, StaggerItem } from "@/components/shared/section-reveal";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

const FEATURES_AR = [
  { icon: Zap, title: "سرعة فائقة", desc: "توصيل في نفس اليوم داخل القاهرة الكبرى و48-96 ساعة لكل المحافظات" },
  { icon: ShieldCheck, title: "أمان مضمون", desc: "تأمين كامل على كل شحنة مع تعويض كامل عند أي طارئ" },
  { icon: BarChart3, title: "تتبع مباشر", desc: "نظام تتبع لحظي يخبرك بمكان شحنتك في كل خطوة" },
  { icon: MapPinned, title: "تغطية شاملة", desc: "27 محافظة و40+ فرع ومستودع في كل أنحاء مصر" },
  { icon: Banknote, title: "أسعار منافسة", desc: "أفضل الأسعار في السوق مع خصومات للكميات والشركات" },
  { icon: Headphones, title: "دعم 24/7", desc: "فريق دعم متكامل على مدار الساعة لخدمتك في أي وقت" },
];
const FEATURES_EN = [
  { icon: Zap, title: "Ultra-fast", desc: "Same-day delivery in Greater Cairo and 48-96 hours for all governorates" },
  { icon: ShieldCheck, title: "Guaranteed safety", desc: "Full insurance on every shipment with complete compensation in case of any incident" },
  { icon: BarChart3, title: "Live tracking", desc: "Real-time tracking system that tells you where your shipment is at every step" },
  { icon: MapPinned, title: "Comprehensive coverage", desc: "27 governorates and 40+ branches and warehouses across Egypt" },
  { icon: Banknote, title: "Competitive prices", desc: "Best market prices with volume and corporate discounts" },
  { icon: Headphones, title: "24/7 support", desc: "Integrated support team available around the clock to serve you anytime" },
];

export function About() {
  const { t, isAr } = useT();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-30, 30]);
  const FEATURES = isAr ? FEATURES_AR : FEATURES_EN;
  const { data: aboutData } = useQuery({
  queryKey: ["about-content"],
  queryFn: () => apiGet<{ about: { image?: string | null } }>("/api/about"),
});
const aboutImage = aboutData ? (aboutData.about?.image || "/images/warehouse.png") : null;

  return (
    <section id="about" className="py-14 sm:py-24 lg:py-28 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column — Media */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative w-full"
          >
            {/* Main warehouse image */}
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl w-full">
              <Image
                    src={aboutImage}
                    alt="Redline warehouses"
                    fill
                    sizes="(max-width:1024px) 100vw, 540px"
                    className="object-cover"
                    unoptimized
                  />
            </div>
            {/* Overlapping operations image — hidden on mobile, safely anchored on desktop */}
            <motion.div
              style={{ y: y2 }}
              className="hidden sm:block absolute -bottom-8 left-8 w-1/2 max-w-[280px] aspect-video rounded-2xl overflow-hidden shadow-2xl ring-4 ring-background"
            >
              <Image src="/images/operations.png" alt="Operations center" fill sizes="280px" className="object-cover" />
            </motion.div>
            {/* +15 Years badge — anchored top-right inside parent */}
            <motion.div
              style={{ y: y1 }}
              className="hidden sm:block absolute top-6 end-6 glass rounded-2xl border border-border/60 px-5 py-4 shadow-xl"
            >
              <div className="text-3xl font-black text-gradient-red">+15</div>
              <div className="text-xs text-muted-foreground font-medium">{t("about.exp")}</div>
            </motion.div>
          </motion.div>

          {/* Right Column — Content */}
          {/* gap-4 gives consistent vertical rhythm; items-start + text-start
              make everything align to the start edge (left in LTR, right in RTL) */}
          <div className="flex flex-col items-start text-start gap-4">
            {/* 1. Pill Badge — self-start snaps it flush with the start edge */}
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-l from-primary/10 via-primary/8 to-amber-500/10 text-primary text-xs font-semibold tracking-wide border border-primary/15 self-start"
            >
              <span className="w-1 h-1 rounded-full bg-gradient-to-r from-primary to-amber-500" />
              {t("about.eyebrow")}
            </motion.span>

            {/* 2. Main Heading — inline text flow (not flex), unified for both languages.
                <bdi> protects "Redline" from BiDi reordering in RTL context.
                Same order for AR and EN: Redline — subtitle. */}
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-2"
            >
              <span className="text-red-600 font-extrabold"><bdi>Redline</bdi></span>
              <span className="mx-2 text-slate-400 font-normal">—</span>
              <span>{isAr ? "عصب الشحن في مصر" : "Egypt's Shipping Backbone"}</span>
            </motion.h2>

            {/* 3. Paragraphs — text-justify on mobile, text-start on sm+.
                Uses text-slate-600/dark:text-slate-300 for richer color than muted-foreground. */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed text-justify sm:text-start"
            >
              {t("about.p1")}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed text-justify sm:text-start"
            >
              {t("about.p2")}
            </motion.p>

            {/* 4. Features Grid */}
            <StaggerGroup className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full" stagger={0.06}>
              {FEATURES.map((f, i) => (
                <StaggerItem key={i}>
                  <div className="flex gap-3 p-3 rounded-xl hover:bg-muted/40 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center shrink-0 icon-gold-ring">
                      <f.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm">{f.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{f.desc}</div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </div>
      </div>
    </section>
  );
}
