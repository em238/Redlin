"use client";

import { useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Zap, ArrowUp } from "lucide-react";
import { useT } from "@/lib/i18n";

/**
 * Floating "Book a Shipment" CTA — appears as a sticky button on mobile after
 * the user has scrolled past the hero (so it doesn't compete with hero CTAs).
 * Disappears when the contact section is in view (avoiding redundancy).
 * Desktop is hidden (uses the in-page CTAs already present).
 */
export function FloatingCTA() {
  const { t } = useT();
  const [visible, setVisible] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    // Show after scrolling past 600px (below hero)
    // Hide when contact section is near viewport center
    const contact = document.querySelector("#contact");
    const contactRect = contact?.getBoundingClientRect();
    const contactNear = contactRect
      ? contactRect.top < window.innerHeight * 0.7 && contactRect.bottom > 0
      : false;
    setVisible(latest > 600 && !contactNear);
  });

  const onClick = () => {
    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ y: 80, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
          onClick={onClick}
          className="md:hidden fixed bottom-5 start-4 z-40 inline-flex items-center gap-2 h-12 ps-4 pe-5 rounded-full bg-gradient-to-r from-primary to-red-700 text-primary-foreground font-semibold text-sm shadow-2xl shadow-primary/40 fab-pulse"
          aria-label={t("hero.cta1")}
        >
          <Zap className="w-4.5 h-4.5" fill="currentColor" />
          {t("hero.cta1")}
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/** Small dismissible "scroll to top" button — pairs with FloatingCTA on long pages */
export function ScrollTopButton() {
  const [show, setShow] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => setShow(latest > 1200));

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="hidden md:flex fixed bottom-6 start-6 z-40 w-11 h-11 rounded-full bg-card border border-border shadow-elevated items-center justify-center text-foreground hover:text-primary hover:border-primary/40 transition-colors"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-4 h-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
