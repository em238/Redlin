"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Truck, Zap, Rocket, Package, Banknote, RotateCcw, ArrowLeft } from "lucide-react";
import { apiGet } from "@/lib/api";
import { SectionHeading } from "@/components/shared/section-heading";
import { StaggerGroup, StaggerItem } from "@/components/shared/section-reveal";

const ICONS: Record<string, any> = {
  truck: Truck, zap: Zap, rocket: Rocket, package: Package, banknote: Banknote, "rotate-ccw": RotateCcw,
};

const FALLBACK = [
  { name: "Standard", nameAr: "عادي", description: "توصيل خلال 48-96 ساعة بأفضل الأسعار", icon: "truck" },
  { name: "Express", nameAr: "ممتاز", description: "توصيل خلال 24-48 ساعة مع أولوية الشحن", icon: "zap" },
  { name: "Same Day", nameAr: "نفس اليوم", description: "توصيل في نفس اليوم داخل القاهرة الكبرى", icon: "rocket" },
  { name: "Freight", nameAr: "شحن ثقيل", description: "شحن البضائع والأغراض الثقيلة والكميات", icon: "package" },
  { name: "Cash on Delivery", nameAr: "دفع عند الاستلام", description: "استلام قيمة الشحنة عند التسليم للمستلم", icon: "banknote" },
  { name: "Returns", nameAr: "مرتجعات", description: "استرجاع الشحنات المرتجعة من العملاء", icon: "rotate-ccw" },
];

export function Services() {
  const { data } = useQuery({
    queryKey: ["services"],
    queryFn: () => apiGet<{ services: typeof FALLBACK }>("/api/services"),
  });
  const services = data?.services ?? FALLBACK;

  const scrollTo = (id: string) => document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="services" className="py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="خدماتنا"
          title={<>حلول شحن <span className="text-gradient-red">متكاملة</span> لكل احتياجاتك</>}
          subtitle="من الشحن العادي إلى التوصيل في نفس اليوم، نوفّر لك خيارات تناسب سرعتك وميزانيتك"
        />

        <StaggerGroup className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" stagger={0.07}>
          {services.map((s) => {
            const Icon = ICONS[s.icon] || Package;
            return (
              <StaggerItem key={s.name}>
                <div className="card-premium rounded-2xl border border-border/60 bg-card shadow-soft p-6 sm:p-7 h-full group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-primary" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-bold">{s.nameAr}</h3>
                  <p className="mt-2 text-muted-foreground text-sm leading-relaxed">{s.description}</p>
                  <button
                    onClick={() => scrollTo("#contact")}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all"
                  >
                    اطلب الخدمة
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}
