"use client";

import { useQuery } from "@tanstack/react-query";
import { Package, Map, Users, Building2 } from "lucide-react";
import { apiGet } from "@/lib/api";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { StaggerGroup, StaggerItem } from "@/components/shared/section-reveal";

const ICONS: Record<string, any> = { package: Package, map: Map, users: Users, building: Building2 };

const FALLBACK = [
  { id: "1", label: "شحنة تم توصيلها", value: "850K+", icon: "package" },
  { id: "2", label: "محافظة نغطّيها", value: "27", icon: "map" },
  { id: "3", label: "عميل سعيد", value: "12K+", icon: "users" },
  { id: "4", label: "فرع ومستودع", value: "40+", icon: "building" },
];

export function StatsBar() {
  const { data } = useQuery({
    queryKey: ["site-stats"],
    queryFn: () => apiGet<{ stats: typeof FALLBACK }>("/api/site"),
  });

  const stats = data?.stats ?? FALLBACK;

  return (
    <section className="py-10 sm:py-14">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <StaggerGroup className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5" stagger={0.08}>
          {stats.map((s) => {
            const Icon = ICONS[s.icon] || Package;
            return (
              <StaggerItem key={s.id}>
                <div className="rounded-2xl border border-border/60 bg-card shadow-soft p-6 sm:p-7 text-center hover:shadow-card hover:border-border transition-all duration-300 group">
                  <div className="mx-auto w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5 text-primary" strokeWidth={2} />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-gradient-red">
                    <AnimatedCounter value={s.value} />
                  </div>
                  <div className="mt-1.5 text-sm text-muted-foreground font-medium">{s.label}</div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}
