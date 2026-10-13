"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Image from "next/image";
import { Building2, Briefcase, ShoppingBag, Shirt, Palette, Store, Truck, Cpu, Smartphone, Star, ExternalLink } from "lucide-react";
import { apiGet } from "@/lib/api";
import { SectionHeading } from "@/components/shared/section-heading";
import { StaggerGroup, StaggerItem } from "@/components/shared/section-reveal";

const ICONS: Record<string, any> = {
  building: Building2, briefcase: Briefcase, store: Store, truck: Truck,
  cpu: Cpu, smartphone: Smartphone, shirt: Shirt, palette: Palette,
  "shopping-bag": ShoppingBag,
};

const FALLBACK = [
  { id: "1", name: "TechStore", logo: "/images/partner-1.png", icon: "smartphone", color: "#2563eb", website: null, order: 0, active: true },
  { id: "2", name: "FashionHub", logo: "/images/partner-2.png", icon: "shirt", color: "#ec4899", website: null, order: 1, active: true },
  { id: "3", name: "Adel Trading", logo: "/images/partner-3.png", icon: "briefcase", color: "#d97706", website: null, order: 2, active: true },
];

export function Partners() {
  const { data } = useQuery({
    queryKey: ["partners"],
    queryFn: () => apiGet<{ partners: typeof FALLBACK }>("/api/partners"),
  });
  const partners = data?.partners ?? FALLBACK;

  if (partners.length === 0) return null;

  return (
    <section id="partners" className="py-20 sm:py-28 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={<span className="flex items-center gap-1.5"><Star className="w-4 h-4" /> شركاء النجاح</span>}
          title={<>شعارات <span className="text-gradient-red">شركائنا</span> وعملائنا</>}
          subtitle="أكثر من 12,000 شركة وعلامة تجارية تثق في Redline لشحناتها يومياً"
        />

        <StaggerGroup className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5" stagger={0.06}>
          {partners.map((p) => {
            const Icon = ICONS[p.icon] || Building2;
            return (
              <StaggerItem key={p.id}>
                <motion.a
                  href={p.website || "#"}
                  target={p.website ? "_blank" : undefined}
                  rel={p.website ? "noopener noreferrer" : undefined}
                  whileHover={{ y: -6 }}
                  className="group relative block rounded-2xl bg-white border border-border/60 p-6 h-32 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all overflow-hidden dark:bg-card"
                >
                  {/* shine sweep */}
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <div className="relative h-full flex flex-col items-center justify-center gap-2">
                    {p.logo ? (
                      <div className="relative w-16 h-16 flex items-center justify-center">
                        <Image
                          src={p.logo}
                          alt={p.name}
                          width={64}
                          height={64}
                          className="object-contain max-h-16 max-w-16 group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                        style={{ background: `${p.color}15` }}
                      >
                        <Icon className="w-6 h-6" style={{ color: p.color }} />
                      </div>
                    )}
                    <div className="text-sm font-bold text-foreground/80 text-center">{p.name}</div>
                  </div>
                  {p.website && (
                    <ExternalLink className="absolute top-3 left-3 w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </motion.a>
              </StaggerItem>
            );
          })}
        </StaggerGroup>

        {/* trust line */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 text-center text-sm text-muted-foreground"
        >
          <span className="inline-flex items-center gap-2">
            <span className="h-px w-8 bg-border" />
            موثوق به من قِبل أكبر العلامات التجارية في مصر
            <span className="h-px w-8 bg-border" />
          </span>
        </motion.div>
      </div>
    </section>
  );
}
