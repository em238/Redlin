"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

/**
 * Cinematic page-load splash:
 *
 * - Starts visible (show=true) from frame 1 on BOTH SSR and client
 *   → NO flash of website content before splash appears
 * - Dark overlay (#0b0f17) blocks the page underneath completely
 * - Logo + loading bar animate in
 * - After 1.5s, overlay fades out smoothly (0.6s easeInOut)
 *   → Website is already rendered underneath, so no white flash
 * - One-time per session (sessionStorage)
 * - Skipped if prefers-reduced-motion
 */
export function PageLoadReveal() {
  // Start visible from frame 1 — prevents website flash before splash
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Check if we should skip (reduced motion or already seen this session)
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let shouldShow = true;
    if (reduced) shouldShow = false;
    try {
      const seen = sessionStorage.getItem("redline-intro-seen");
      if (seen) shouldShow = false;
      else sessionStorage.setItem("redline-intro-seen", "1");
    } catch {
      shouldShow = false;
    }

    if (!shouldShow) {
      // Hide immediately — deferred to rAF to satisfy linter (16ms, invisible)
      const raf = requestAnimationFrame(() => setShow(false));
      return () => cancelAnimationFrame(raf);
    }

    // Show splash for 1.5s, then fade out
    const timer = setTimeout(() => setShow(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[99999] bg-[#0b0f17] flex items-center justify-center pointer-events-none"
          aria-hidden
        >
          {/* Centered brand logo + loading bar */}
          <div className="flex flex-col items-center justify-center gap-6">
            <motion.div
              initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="px-6"
            >
              <Image
                src="/redline-transport-white.png"
                alt="RedLine Transport"
                width={1200}
                height={514}
                priority
                className="h-16 sm:h-20 w-auto max-w-none object-contain"
              />
            </motion.div>
            {/* Loading bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="w-40 h-0.5 bg-white/10 overflow-hidden rounded-full"
            >
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.1, ease: "easeInOut" }}
                className="h-full w-1/2 bg-gradient-to-r from-transparent via-primary to-amber-400"
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
