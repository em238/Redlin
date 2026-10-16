"use client";

import { useQuery } from "@tanstack/react-query";
import { Package, Map, Users, Building2 } from "lucide-react";
import { apiGet } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { StaggerGroup, StaggerItem } from "@/components/shared/section-reveal";

const ICONS: Record<string, any> = { package: Package, map: Map, users: Users, building: Building2 };

// Fallback shape mirrors the DB SiteStat model: `label` (English) + `labelAr` (Arabic).
// Pre-2.4 the FALLBACK only had Arabic in the `label` field, which made the
// English locale leak Arabic and vice versa. Now both fields are explicit.
const FALLBACK = [
  { id: "1", label: "Shipments delivered", labelAr: "شحنة تم تسليمها", value: "850K+", icon: "package" },
  { id: "2", label: "Governorates covered", labelAr: "محافظة مغطاة", value: "27", icon: "map" },
  { id: "3", label: "Happy customers", labelAr: "عميل يثقون بنا", value: "12K+", icon: "users" },
  { id: "4", label: "Branches & warehouses", labelAr: "فرع ومستودع", value: "40+", icon: "building" },
];

// Map the stat icon (in API data + FALLBACK) to a translation key — used as a
// last-resort fallback when neither `label` nor `labelAr` is populated.
const STAT_KEY_BY_ICON: Record<string, string> = {
  package: "stats.shipments",
  map: "stats.governorates",
  users: "stats.customers",
  building: "stats.branches",
};

type StatItem = (typeof FALLBACK)[number];

export function StatsBar() {
  const { t, isAr } = useT();
  const { data } = useQuery({
    queryKey: ["site-stats"],
    queryFn: () => apiGet<{ stats: StatItem[] }>("/api/site"),
  });

  const stats = data?.stats ?? FALLBACK;

  // Strict fallback rule per the localization spec:
  //   Arabic  → labelAr || label
  //   English → label (with t() as a final fallback for legacy rows)
  // The ticker-cities SiteStat (icon="ticker") is filtered out because it
  // stores a JSON payload in `value`, not a stat to render here.
  const visibleStats = stats.filter((s) => s.icon !== "ticker");
  const labelFor = (s: StatItem) => {
    if (isAr) return s.labelAr || s.label;
    const key = STAT_KEY_BY_ICON[s.icon];
    const translated = key ? t(key) : "";
    return translated || s.label;
  };

  return (
    <section className="py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <StaggerGroup className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5" stagger={0.08}>
          {visibleStats.map((s, i) => {
            const Icon = ICONS[s.icon] || Package;
            return (
              <StaggerItem key={s.id || i}>
                <div className="card-premium rounded-2xl border border-border/60 bg-card shadow-soft p-6 sm:p-7 text-center group relative">
                  {/* Glowing vertical divider on the left (between columns) */}
                  {i > 0 && (
                    <span className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 h-12 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
                  )}
                  <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 via-primary/8 to-amber-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform icon-gold-ring">
                    <Icon className="w-6 h-6 text-primary" strokeWidth={2} />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-gradient-red">
                    <AnimatedCounter value={s.value} />
                  </div>
                  <div className="mt-1.5 text-sm text-muted-foreground font-medium">{labelFor(s)}</div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}
