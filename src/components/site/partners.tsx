"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Image from "next/image";
import { Star, ExternalLink } from "lucide-react";
import { apiGet } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { SectionHeading } from "@/components/shared/section-heading";
import { StaggerGroup, StaggerItem } from "@/components/shared/section-reveal";

const FALLBACK = [
  { id: "1", name: "TechStore", logo: "/images/partner-1.png", icon: "smartphone", color: "#2563eb", website: null, order: 0, active: true },
  { id: "2", name: "FashionHub", logo: "/images/partner-2.png", icon: "shirt", color: "#ec4899", website: null, order: 1, active: true },
  { id: "3", name: "Adel Trading", logo: "/images/partner-3.png", icon: "briefcase", color: "#d97706", website: null, order: 2, active: true },
];

export function Partners() {
  const { t } = useT();
  const { data } = useQuery({
    queryKey: ["partners"],
    queryFn: () => apiGet<{ partners: typeof FALLBACK }>("/api/partners"),
  });
  const partners = data?.partners ?? FALLBACK;

  if (partners.length === 0) return null;

  return (
    <section id="partners" className="py-14 sm:py-24 lg:py-28 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={<span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5" /> {t("partners.eyebrow")}</span>}
          title={t("partners.title")}
          subtitle={t("partners.subtitle")}
        />

        <StaggerGroup className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" stagger={0.05}>
          {partners.map((p) => (
            <StaggerItem key={p.id}>
              <a
                href={p.website || "#"}
                target={p.website ? "_blank" : undefined}
                rel={p.website ? "noopener noreferrer" : undefined}
                className="card-premium shine relative group block rounded-2xl bg-card border border-border/60 shadow-soft p-6 h-28 flex flex-col items-center justify-center gap-2 overflow-hidden"
              >
                {/* ONLY images — no icons */}
                <div className="w-16 h-16 flex items-center justify-center">
                  <Image
                    src={p.logo || "/images/partner-1.png"}
                    alt={p.name}
                    width={64}
                    height={64}
                    className="object-contain max-h-16 max-w-16 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"
                  />
                </div>
                <div className="text-sm font-semibold text-foreground/70 group-hover:text-foreground text-center transition-colors">{p.name}</div>
                {p.website && (
                  <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 left-3" />
                )}
              </a>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 text-center text-sm text-muted-foreground"
        >
          <span className="inline-flex items-center gap-3">
            <span className="h-px w-10 bg-border" />
            {t("partners.trust")}
            <span className="h-px w-10 bg-border" />
          </span>
        </motion.div>
      </div>
    </section>
  );
}
