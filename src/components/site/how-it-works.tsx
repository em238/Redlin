"use client";

import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { ClipboardList, Truck, PackageCheck, ArrowLeft, ArrowRight } from "lucide-react";
import { apiGet } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { SectionHeading } from "@/components/shared/section-heading";
import { Magnetic } from "@/components/shared/custom-cursor";

export function HowItWorks() {
  const { t, isAr } = useT();
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  // Fetch section content from /api/site for DB-managed bilingual heading
  const { data: siteData } = useQuery({
    queryKey: ["site-data"],
    queryFn: () => apiGet<any>("/api/site"),
  });
  const sc = siteData?.sectionContent?.find((s: any) => s.section === "how-it-works");
  const eyebrow = isAr ? (sc?.badgeAr || t("how.eyebrow")) : (sc?.badgeEn || t("how.eyebrow"));
  const titleText = isAr ? (sc?.titleAr || t("how.title")) : (sc?.titleEn || t("how.title"));
  const subtitle = isAr ? (sc?.descriptionAr || t("how.subtitle")) : (sc?.descriptionEn || t("how.subtitle"));

  // Scroll progress 0..1 across the section (0 = section enters viewport bottom, 1 = section exits viewport top)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 80%", "end 20%"],
  });

  // Sync state for step activation (re-renders happen but only 3 steps, cheap)
  useMotionValueEvent(scrollYProgress, "change", (v) => setProgress(v));

  // Thresholds at which each step illuminates
  const stepThresholds = [0.05, 0.4, 0.75];
  const stepActive = stepThresholds.map((th) => progress >= th);

  // Flowing dot position (left% along the desktop line) — derived MotionValue, no re-renders
  // LTR: dot at left = progress * 100%
  // RTL: dot at left = (1 - progress) * 100%  (line fills right→left, dot tracks the leading edge)
  const dotLeft = useTransform(scrollYProgress, (p) =>
    isAr ? `${(1 - p) * 100}%` : `${p * 100}%`
  );

  // Line fill origin: RTL = right (fills right→left), LTR = left (fills left→right)
  const desktopLineOrigin = isAr ? "right center" : "left center";

  const scrollTo = (id: string) => document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });

  const STEPS = [
    { icon: ClipboardList, title: t("how.step1"), desc: t("how.step1.desc") },
    { icon: Truck, title: t("how.step2"), desc: t("how.step2.desc") },
    { icon: PackageCheck, title: t("how.step3"), desc: t("how.step3.desc") },
  ];

  return (
    <section
      ref={sectionRef}
      id="how"
      className="scroll-mt-20 py-14 sm:py-24 lg:py-28 bg-muted/30 relative overflow-hidden"
    >
      {/* Atmospheric background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 end-0 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <SectionHeading
          eyebrow={eyebrow}
          title={
            <>
              {titleText.split("Redline")[0]}
              <span className="text-gradient-red">Redline</span>
              {titleText.split("Redline")[1]}
            </>
          }
          subtitle={subtitle}
        />

        {/* ============ DESKTOP: Horizontal layout (md+) ============ */}
        <div className="hidden md:block max-w-5xl mx-auto relative" dir={isAr ? "rtl" : "ltr"}>
          {/* Background line track (between circle centers) */}
          <div className="absolute top-[88px] inset-x-[16.67%] h-1 rounded-full bg-border/60" />

          {/* Animated fill line — scaleX from 0 to 1 based on scroll progress */}
          <motion.div
            style={{ scaleX: scrollYProgress, transformOrigin: desktopLineOrigin }}
            className="absolute top-[88px] inset-x-[16.67%] h-1 rounded-full bg-gradient-to-r from-primary via-red-500 to-amber-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] origin-center"
          />

          {/* Flowing dot at the leading edge of the fill (smooth MotionValue, no re-renders) */}
          <div className="absolute top-[88px] inset-x-[16.67%] h-1 pointer-events-none">
            <motion.div
              style={{ left: dotLeft }}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.85)] ring-2 ring-white/40"
            />
          </div>

          {/* Steps grid */}
          <div className="grid grid-cols-3 gap-6 relative">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const active = stepActive[i];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center text-center"
                >
                  {/* Floating step number — becomes primary when active */}
                  <div
                    className={`mb-3 text-2xl font-black tracking-wider transition-all duration-300 ${
                      active
                        ? "text-primary drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                        : "text-muted-foreground/30"
                    }`}
                  >
                    0{i + 1}
                  </div>

                  {/* Circle with icon */}
                  <div
                    className={`relative w-28 h-28 rounded-full p-[2px] transition-all duration-300 ${
                      active
                        ? "bg-gradient-to-br from-primary via-red-500 to-amber-500 shadow-lg shadow-red-500/25 scale-105"
                        : "bg-gradient-to-br from-border to-border/60"
                    }`}
                  >
                    <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                          active
                            ? "bg-gradient-to-br from-primary/20 to-amber-500/10"
                            : "bg-muted/50"
                        }`}
                      >
                        <Icon
                          className={`w-7 h-7 transition-colors duration-300 ${
                            active ? "text-primary" : "text-muted-foreground"
                          }`}
                          strokeWidth={1.6}
                        />
                      </div>
                    </div>

                    {/* Pulse ring on active */}
                    {active && (
                      <motion.div
                        animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 rounded-full border-2 border-primary/40 pointer-events-none"
                      />
                    )}
                  </div>

                  <h3
                    className={`mt-6 text-lg font-bold transition-colors duration-300 ${
                      active ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-[240px]">
                    {step.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ============ MOBILE: Vertical timeline (< md) ============ */}
        <div className="md:hidden max-w-5xl mx-auto relative" dir={isAr ? "rtl" : "ltr"}>
          {/* Vertical line track (start side) */}
          <div className="absolute top-10 bottom-10 start-[25px] w-0.5 bg-border/60" />

          {/* Animated vertical fill line — scaleY from 0 to 1 (top to bottom) */}
          <motion.div
            style={{ scaleY: scrollYProgress, transformOrigin: "top center" }}
            className="absolute top-10 bottom-10 start-[25px] w-0.5 bg-gradient-to-b from-primary via-red-500 to-amber-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
          />

          {/* Steps */}
          <div className="space-y-10 relative">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const active = stepActive[i];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="relative ps-16 min-h-[52px]"
                >
                  {/* Circle — centered on the vertical line (line at start-[25px], circle w-[52px], center at 26px) */}
                  <div
                    className={`absolute start-0 top-0 w-[52px] h-[52px] rounded-full p-[2px] transition-all duration-300 ${
                      active
                        ? "bg-gradient-to-br from-primary via-red-500 to-amber-500 shadow-lg shadow-red-500/25 scale-105"
                        : "bg-gradient-to-br from-border to-border/60"
                    }`}
                  >
                    <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                      <Icon
                        className={`w-5 h-5 transition-colors duration-300 ${
                          active ? "text-primary" : "text-muted-foreground"
                        }`}
                        strokeWidth={1.8}
                      />
                    </div>
                    {active && (
                      <motion.div
                        animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 rounded-full border-2 border-primary/40 pointer-events-none"
                      />
                    )}
                  </div>

                  {/* Step number watermark (subtle) */}
                  <span
                    className={`absolute end-0 top-0 text-3xl font-black pointer-events-none transition-opacity duration-300 ${
                      active ? "text-primary/15" : "text-muted-foreground/10"
                    }`}
                  >
                    0{i + 1}
                  </span>

                  {/* Text content (beside the line) */}
                  <div className="pt-1.5 pe-8">
                    <h3
                      className={`text-base font-bold transition-colors duration-300 ${
                        active ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA button */}
        <div className="mt-12 text-center">
          <Magnetic strength={0.2} className="inline-block">
            <button
              onClick={() => scrollTo("#contact")}
              className="group btn-glow inline-flex items-center gap-2 h-12 px-6 bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 text-primary-foreground text-base font-semibold rounded-lg shadow-soft"
            >
              {t("how.cta")}
              {isAr
                ? <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                : <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
            </button>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
