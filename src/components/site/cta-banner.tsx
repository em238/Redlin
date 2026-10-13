"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Zap, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";

export function CtaBanner() {
  const scrollTo = (id: string) => document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-primary via-red-700 to-red-900 p-8 sm:p-14 text-center"
        >
          <div className="absolute inset-0 grid-bg opacity-20" />
          <div className="absolute -top-10 -right-10 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-amber-500/20 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
              جاهز تبدأ شحن مع <span className="text-amber-300">Redline؟</span>
            </h2>
            <p className="mt-4 text-white/85 text-lg max-w-2xl mx-auto">
              انضم لأكثر من 12,000 عميل يثقون بنا يومياً. احسب سعر شحنتك الآن أو تواصل معنا لخدمة مخصصة.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                onClick={() => scrollTo("#pricing")}
                className="bg-white text-primary hover:bg-white/90 gap-2 h-12 px-7 text-base shadow-xl"
              >
                <Zap className="w-5 h-5" />
                احسب سعر شحنتك
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <a href="tel:19999">
                <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white gap-2 h-12 px-7 text-base w-full">
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
