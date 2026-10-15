"use client";

import { useQuery } from "@tanstack/react-query";
import { Truck, Zap, Rocket, Package, Banknote, RotateCcw, ArrowLeft } from "lucide-react";
import { apiGet } from "@/lib/api";
import { useT } from "@/lib/i18n";
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

// Map the service `name` (English, used by API + FALLBACK) to an i18n key suffix.
const SERVICE_KEY_BY_NAME: Record<string, string> = {
  "Standard": "standard",
  "Express": "express",
  "Same Day": "sameday",
  "Freight": "freight",
  "Cash on Delivery": "cod",
  "Returns": "returns",
};

export function Services() {
  const { t, isAr } = useT();
  const { data } = useQuery({
    queryKey: ["services"],
    queryFn: () => apiGet<{ services: typeof FALLBACK }>("/api/services"),
  });
  const services = data?.services ?? FALLBACK;

  const scrollTo = (id: string) => document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });

  // Localize service name/description. Arabic uses DB Arabic fields; English uses t() lookup by name.
  const nameFor = (s: (typeof FALLBACK)[number]) =>
    isAr ? s.nameAr : (SERVICE_KEY_BY_NAME[s.name] ? t(`service.${SERVICE_KEY_BY_NAME[s.name]}`) : s.name);
  const descFor = (s: (typeof FALLBACK)[number]) =>
    isAr ? s.description : (SERVICE_KEY_BY_NAME[s.name] ? t(`service.${SERVICE_KEY_BY_NAME[s.name]}.desc`) : s.description);

  return (
    <section id="services" className="py-14 sm:py-24 lg:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t("services.eyebrow")}
          title={t("services.title")}
          subtitle={t("services.subtitle")}
        />

        <StaggerGroup className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" stagger={0.07}>
          {services.map((s, idx) => {
            const Icon = ICONS[s.icon] || Package;
            return (
              <StaggerItem key={s.name}>
                <div className="card-premium shine rounded-2xl border border-border/60 bg-card shadow-soft p-6 sm:p-7 h-full group relative overflow-hidden">
                  {/* Big faded number watermark */}
                  <span className="absolute top-4 left-5 text-6xl font-black text-primary/[0.06] leading-none select-none pointer-events-none">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 via-primary/8 to-amber-500/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform icon-gold-ring relative">
                    <Icon className="w-6 h-6 text-primary" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-bold relative">{nameFor(s)}</h3>
                  <p className="mt-2 text-muted-foreground text-sm leading-relaxed relative">{descFor(s)}</p>
                  <button
                    onClick={() => scrollTo("#contact")}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all relative"
                  >
                    {t("services.cta")}
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
