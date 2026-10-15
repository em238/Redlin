"use client";

import { ShieldCheck, Award, Star, Timer, BadgeCheck, Truck } from "lucide-react";
import { useT } from "@/lib/i18n";

/**
 * Premium trust badges marquee — sits below the StatsBar.
 * Communicates authority & reliability signals (certifications, ratings, SLAs)
 * without competing with the main stats. Pauses on hover.
 *
 * Twin-track technique (same keyframe) for seamless infinite scroll.
 * Direction is LTR-isolated so it flows the same way in both AR/EN.
 */
export function TrustBadges() {
  const { t, isAr } = useT();

  const BADGES = [
    { icon: ShieldCheck, label: isAr ? "ضمان كامل على كل شحنة" : "Full shipment insurance" },
    { icon: Timer, label: isAr ? "توصيل في الوقت 99.2%" : "99.2% on-time delivery" },
    { icon: Award, label: isAr ? "معتمد من البريد المصري" : "Egypt Post certified partner" },
    { icon: Star, label: isAr ? "تقييم 4.9/5 من العملاء" : "4.9/5 customer rating" },
    { icon: BadgeCheck, label: isAr ? "تتبع لحظي للشحنة" : "Real-time GPS tracking" },
    { icon: Truck, label: isAr ? "أسطول +800 مركبة" : "Fleet of 800+ vehicles" },
  ];

  const renderRow = (keyPrefix: string, ariaHidden = false) => (
    <div
      className="flex trust-marquee whitespace-nowrap will-change-transform"
      aria-hidden={ariaHidden}
    >
      {BADGES.map((b, i) => {
        const Icon = b.icon;
        return (
          <span
            key={`${keyPrefix}-${i}`}
            className="mx-5 inline-flex items-center gap-2 text-sm text-muted-foreground font-medium shrink-0 leading-none"
          >
            <Icon className="w-4 h-4 text-primary shrink-0" strokeWidth={2} />
            <span className="hover:text-foreground transition-colors">{b.label}</span>
            <span className="ms-5 w-1 h-1 rounded-full bg-primary/40" />
          </span>
        );
      })}
    </div>
  );

  return (
    <section className="py-4 sm:py-6 border-y border-border/40 bg-muted/20" dir="ltr">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden">
          {/* Edge fade masks */}
          <div className="absolute inset-y-0 start-0 w-16 sm:w-24 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
          <div className="absolute inset-y-0 end-0 w-16 sm:w-24 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
          {renderRow("t1")}
          {/* Twin track for seamless loop (hidden from screen readers) */}
          {renderRow("t2", true)}
        </div>
      </div>
    </section>
  );
}
