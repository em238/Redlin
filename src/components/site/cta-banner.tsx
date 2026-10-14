"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Zap, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  const scrollTo = (id: string) => document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="py-16 sm:py-20">
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
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
              جاهز تبدأ شحن مع <span className="text-amber-300">Redline؟</span>
            </h2>
            <p className="mt-4 text-white/85 text-lg max-w-2xl mx-auto leading-relaxed">
              انضم لأكثر من 12,000 عميل يثقون بنا يومياً. تواصل معنا الآن واحصل على عرض سعر مخصص لشحناتك.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                onClick={() => scrollTo("#contact")}
                className="bg-white text-primary hover:bg-white/90 gap-2 h-12 px-7 text-base font-semibold shadow-soft"
              >
                <Zap className="w-5 h-5" />
                اطلب عرض سعر
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <a href="tel:19999">
                <Button size="lg" variant="outline" className="bg-white/10 border-white/25 text-white hover:bg-white/20 hover:text-white gap-2 h-12 px-7 text-base w-full sm:w-auto">
                  <Phone className="w-5 h-5" />
                  19999
                </Button>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
