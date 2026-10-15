"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ShieldCheck, Zap, Headphones, Banknote, MapPinned, BarChart3 } from "lucide-react";
import { useT } from "@/lib/i18n";
import { SectionHeading } from "@/components/shared/section-heading";
import { StaggerGroup, StaggerItem } from "@/components/shared/section-reveal";

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

  return (
    <section id="about" className="py-14 sm:py-24 lg:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Images with parallax */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
              <Image src="/images/warehouse.png" alt="مستودعات Redline" fill sizes="(max-width:1024px) 100vw, 540px" className="object-cover" />
            </div>
            <motion.div style={{ y: y2 }} className="absolute -bottom-8 -left-4 sm:left-8 w-2/3 aspect-video rounded-2xl overflow-hidden shadow-2xl ring-4 ring-background">
              <Image src="/images/operations.png" alt="مركز العمليات" fill sizes="360px" className="object-cover" />
            </motion.div>
            <motion.div
              style={{ y: y1 }}
              className="absolute -top-6 -right-2 sm:-right-6 glass rounded-2xl border border-border/60 px-5 py-4 shadow-xl"
            >
              <div className="text-3xl font-black text-gradient-red">+15</div>
              <div className="text-xs text-muted-foreground font-medium">{t("about.exp")}</div>
            </motion.div>
          </motion.div>

          {/* Content */}
          <div>
            <SectionHeading
              align="right"
              eyebrow={t("about.eyebrow")}
              title={
                <>
                  {t("about.title").split("Redline")[0]}
                  <span className="text-gradient-red">Redline</span>
                  {t("about.title").split("Redline")[1]}
                </>
              }
            />
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-muted-foreground text-lg leading-relaxed -mt-6"
            >
              {t("about.p1")}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-3 text-muted-foreground leading-relaxed"
            >
              {t("about.p2")}
            </motion.p>

            <StaggerGroup className="mt-8 grid sm:grid-cols-2 gap-4" stagger={0.06}>
              {FEATURES.map((f, i) => (
                <StaggerItem key={i}>
                  <div className="flex gap-3 p-3 rounded-xl hover:bg-muted/40 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <f.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
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
