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
    <div className={`${align === "center" ? "text-center mx-auto" : "text-right"} max-w-2xl ${align === "center" ? "" : "ms-0"} mb-12 ${className}`}>
      {eyebrow && (
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold mb-4"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          {eyebrow}
        </motion.span>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15]"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-4 text-muted-foreground text-lg leading-relaxed"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
