"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Truck, Zap, Rocket, Package, Banknote, RotateCcw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiGet } from "@/lib/api";

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
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-3">
            خدماتنا
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            حلول شحن <span className="text-gradient-red">متكاملة</span> لكل احتياجاتك
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            من الشحن العادي إلى التوصيل في نفس اليوم، نوفّر لك خيارات تناسب سرعتك وميزانيتك
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => {
            const Icon = ICONS[s.icon] || Package;
            return (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="group relative shine rounded-2xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                    <Icon className="w-7 h-7 text-white" strokeWidth={2.2} />
                  </div>
                  <h3 className="mt-5 text-xl font-bold">{s.nameAr}</h3>
                  <p className="mt-2 text-muted-foreground text-sm leading-relaxed">{s.description}</p>
                  <button
                    onClick={() => scrollTo("#pricing")}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all"
                  >
                    احسب السعر
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
