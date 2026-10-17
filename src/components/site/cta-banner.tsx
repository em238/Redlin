"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Zap, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { apiGet } from "@/lib/api";
import { Magnetic } from "@/components/shared/custom-cursor";

type CtaBannerData = {
  id: string;
  headingAr: string;
  headingEn: string;
  subAr: string;
  subEn: string;
  btnTextAr: string;
  btnTextEn: string;
  btnLink: string;
  phone: string;
  active: boolean;
};

export function CtaBanner() {
  const { t, isAr } = useT();
  const scrollTo = (id: string) =>
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });

  // Fetch the CTA banner content from the database (falls back to i18n if missing)
  const { data } = useQuery({
    queryKey: ["cta-banner"],
    queryFn: () => apiGet<{ banner: CtaBannerData }>("/api/cta-banner"),
  });
  const b = data?.banner;

  // Resolve bilingual fields with i18n fallbacks
  const heading = b ? (isAr ? b.headingAr : b.headingEn) : t("cta.title");
  const subtitle = b ? (isAr ? b.subAr : b.subEn) : t("cta.subtitle");
  const btnText = b ? (isAr ? b.btnTextAr : b.btnTextEn) : t("cta.button");
  const btnLink = b?.btnLink || "#contact";
  const phone = b?.phone || "19999";

  // Split the heading around "Redline" so the brand name can be highlighted in amber
  const headingParts = heading.split("Redline");
  const isInternalLink = btnLink.startsWith("#");
  const handleBtnClick = () => {
    if (isInternalLink) scrollTo(btnLink);
    else window.location.href = btnLink;
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl p-8 sm:p-14 text-center"
          style={{
            background: "linear-gradient(135deg, oklch(0.45 0.22 28), oklch(0.38 0.18 18))",
          }}
        >
          <div className="absolute inset-0" style={{ background: "radial-gradient(at 20% 20%, oklch(0.55 0.2 40 / 0.4), transparent 50%), radial-gradient(at 80% 80%, oklch(0.6 0.18 350 / 0.3), transparent 50%)" }} />
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-amber-400/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-red-900/30 rounded-full blur-3xl" />
          <div className="absolute inset-0 noise" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight" dir={isAr ? "rtl" : "ltr"}>
              {headingParts[0]}
              {headingParts.length > 1 && <span className="text-amber-300">Redline</span>}
              {headingParts.length > 1 ? headingParts[1] : ""}
            </h2>
            <p className="mt-4 text-white/85 text-lg max-w-2xl mx-auto leading-relaxed" dir={isAr ? "rtl" : "ltr"}>
              {subtitle}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Magnetic strength={0.2} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  onClick={handleBtnClick}
                  className="group bg-white text-primary hover:bg-white/90 gap-2 h-12 px-7 text-base font-semibold shadow-soft w-full sm:w-auto"
                >
                  <Zap className="w-5 h-5" />
                  {btnText}
                  {isAr
                    ? <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    : <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
                </Button>
              </Magnetic>
              <Magnetic strength={0.2} className="w-full sm:w-auto">
                <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className="block w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="bg-white/10 border-white/25 text-white hover:bg-white/20 hover:text-white gap-2 h-12 px-7 text-base w-full sm:w-auto">
                    <Phone className="w-5 h-5" />
                    <span dir="ltr">{phone}</span>
                  </Button>
                </a>
              </Magnetic>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
