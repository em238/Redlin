"use client";

import { motion } from "framer-motion";
import { ClipboardList, Truck, Home, ArrowLeft } from "lucide-react";
import { useT } from "@/lib/i18n";
import { SectionHeading } from "@/components/shared/section-heading";
import { StaggerGroup, StaggerItem } from "@/components/shared/section-reveal";

export function HowItWorks() {
  const { t } = useT();
  const scrollTo = (id: string) => document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });

  const STEPS = [
    { icon: ClipboardList, title: t("how.step1"), desc: t("how.step1.desc") },
    { icon: Truck, title: t("how.step2"), desc: t("how.step2.desc") },
    { icon: Home, title: t("how.step3"), desc: t("how.step3.desc") },
  ];

  return (
    <section id="how" className="py-14 sm:py-24 lg:py-28 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t("how.eyebrow")}
          title={
            <>
              {t("how.title").split("Redline")[0]}
              <span className="text-gradient-red">Redline</span>
              {t("how.title").split("Redline")[1]}
            </>
          }
          subtitle={t("how.subtitle")}
        />

        {/* RTL so step 1 is on the right → step 3 on the left (Arabic reading flow) */}
        <div className="max-w-5xl mx-auto relative" dir="rtl">
          {/* Connecting gradient line BEHIND circles (vertical center of circles) */}
          <div className="hidden md:block absolute top-14 inset-x-[18%] h-0.5">
            <div className="w-full h-full bg-gradient-to-l from-transparent via-primary/40 to-transparent" />
            {/* Animated flowing dot along the line */}
            <motion.div
              animate={{ x: ["0%", "100%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary shadow-soft"
            />
          </div>

          <StaggerGroup className="grid md:grid-cols-3 gap-10 md:gap-6 relative" stagger={0.12}>
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <StaggerItem key={i}>
                  <div className="relative flex flex-col items-center text-center group">
                    {/* Circle with gradient ring */}
                    <div className="relative mb-6">
                      {/* Number badge — centered on top, attached to circle */}
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 w-9 h-9 rounded-full bg-gradient-to-br from-primary to-red-700 text-white text-sm font-bold flex items-center justify-center shadow-soft ring-4 ring-muted/30">
                        {i + 1}
                      </div>
                      {/* Big circle with gradient ring border */}
                      <div className="w-28 h-28 rounded-full p-[2px] bg-gradient-to-br from-primary/40 via-primary/15 to-amber-500/30 shadow-card group-hover:shadow-elevated transition-shadow">
                        <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/15 to-amber-500/10 flex items-center justify-center icon-gold-ring group-hover:scale-110 transition-transform">
                            <Icon className="w-7 h-7 text-primary" strokeWidth={1.6} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px]">{step.desc}</p>

                    {/* Arrow between steps (except last) — points left (next step direction in RTL) */}
                    {i < STEPS.length - 1 && (
                      <div className="hidden md:block absolute top-14 -left-3 -translate-y-1/2 z-10">
                        <div className="w-7 h-7 rounded-full bg-card border border-border/60 shadow-soft flex items-center justify-center">
                          <ArrowLeft className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
                        </div>
                      </div>
                    )}
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerGroup>

          {/* CTA button */}
          <div className="mt-12 text-center">
            <button
              onClick={() => scrollTo("#contact")}
              className="btn-glow inline-flex items-center gap-2 h-12 px-6 bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 text-primary-foreground text-base font-semibold rounded-lg shadow-soft"
            >
              {t("how.cta")}
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
