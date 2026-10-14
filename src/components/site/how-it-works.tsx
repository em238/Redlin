"use client";

import { motion } from "framer-motion";
import { ClipboardList, Truck, Home } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { StaggerGroup, StaggerItem } from "@/components/shared/section-reveal";

const STEPS = [
  {
    icon: ClipboardList,
    title: "احجز شحنتك",
    desc: "احجز شحنتك أونلاين أو بالهاتف 19999 في دقائق معدودة — بدون تعقيد.",
  },
  {
    icon: Truck,
    title: "نستلم ونشحن",
    desc: "مندوبنا يستلم الشحنة منك ونشحنها لوجهتها بأسرع خدمة مناسبة لك.",
  },
  {
    icon: Home,
    title: "توصّل للمستلم",
    desc: "توصّل الشحنة لأي محافظة في مصر وتسليمها للمستلم بأمان وضمان كامل.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-20 sm:py-28 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="إزاي بنشتغل"
          title={<>الشحن مع <span className="text-gradient-red">Redline</span> في 3 خطوات</>}
          subtitle="من الحجز للتسليم — عملية بسيطة وسريعة من البداية للنهاية"
        />

        <div className="max-w-5xl mx-auto relative">
          {/* Connecting line (decorative) */}
          <div className="hidden md:block absolute top-12 right-[16.66%] left-[16.66%] h-px">
            <div className="w-full h-full bg-gradient-to-l from-transparent via-primary/30 to-transparent" />
          </div>

          <StaggerGroup className="grid md:grid-cols-3 gap-8 md:gap-6 relative" stagger={0.12}>
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <StaggerItem key={i}>
                  <div className="relative flex flex-col items-center text-center">
                    {/* Step number badge */}
                    <div className="relative mb-6">
                      <div className="w-24 h-24 rounded-full bg-card border border-border/60 shadow-soft flex items-center justify-center relative z-10">
                        <Icon className="w-9 h-9 text-primary" strokeWidth={1.6} />
                      </div>
                      <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-red-700 text-white text-sm font-bold flex items-center justify-center shadow-soft">
                        {i + 1}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px]">{step.desc}</p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </div>
      </div>
    </section>
  );
}
