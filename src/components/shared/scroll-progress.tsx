"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useT } from "@/lib/i18n";

export function ScrollProgress() {
  const { isAr } = useT();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  // Direction-aware transform origin + gradient:
  //   Arabic (RTL) → origin-right + gradient-to-l (fills right→left)
  //   English (LTR) → origin-left + gradient-to-r (fills left→right)
  const originClass = isAr ? "origin-right bg-gradient-to-l" : "origin-left bg-gradient-to-r";

  return (
    <motion.div
      style={{ scaleX }}
      className={`fixed top-0 inset-x-0 z-[60] h-1 ${originClass} from-primary via-red-500 to-amber-400`}
    />
  );
}
