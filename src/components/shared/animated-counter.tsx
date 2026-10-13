"use client";

import { useCountUp, parseStatValue, formatStat } from "@/hooks/use-count-up";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { motion } from "framer-motion";

interface Props {
  value: string; // e.g. "850K+", "27", "12K+"
  className?: string;
  duration?: number;
}

export function AnimatedCounter({ value, className = "", duration = 2000 }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const { num, suffix, isK } = parseStatValue(value);
  const animated = useCountUp(num, duration, inView);
  const display = formatStat(animated, suffix, isK);

  return (
    <span ref={ref} className={className}>
      <motion.span
        initial={{ opacity: 0.6 }}
        animate={inView ? { opacity: 1 } : {}}
        className="tabular-nums"
      >
        {display}
      </motion.span>
    </span>
  );
}
