"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

interface Props {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: string;
  align?: "center" | "right";
  className?: string;
}

export function SectionHeading({ eyebrow, title, subtitle, align = "center", className = "" }: Props) {
  return (
    <div className={`${align === "center" ? "text-center mx-auto" : "text-right"} max-w-2xl mb-14 ${className}`}>
      {eyebrow && (
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-l from-primary/10 via-primary/8 to-amber-500/10 text-primary text-xs font-semibold mb-4 tracking-wide border border-primary/15"
        >
          <span className="w-1 h-1 rounded-full bg-gradient-to-r from-primary to-amber-500" />
          {eyebrow}
        </motion.span>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight"
      >
        {title}
      </motion.h2>
      {align === "center" && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-5 h-px w-16 divider-gradient"
        />
      )}
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="mt-4 text-muted-foreground text-base sm:text-lg leading-relaxed"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
