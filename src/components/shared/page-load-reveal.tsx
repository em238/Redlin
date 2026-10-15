"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Truck } from "lucide-react";

/**
 * Cinematic page-load reveal:
 * - A full-screen ink sheet covers the viewport on first paint
 * - Brand logo fades in centered on the sheet
 * - Sheet wipes away top-to-bottom revealing the page
 * - Only plays once per session (sessionStorage guard)
 * - Skipped entirely if prefers-reduced-motion
 *
 * Uses rAF-deferred setState to avoid SSR hydration mismatch (server renders
 * without overlay; client decides to show after hydration, deferred to next frame).
 */
export function PageLoadReveal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Compute the decision synchronously (no setState in effect body)
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let shouldShow = false;
    if (!reduced) {
      try {
        const seen = sessionStorage.getItem("redline-intro-seen");
        if (!seen) {
          sessionStorage.setItem("redline-intro-seen", "1");
          shouldShow = true;
        }
      } catch {
        // sessionStorage unavailable — skip intro
      }
    }
    if (!shouldShow) return;

    // Defer setState to next animation frame (avoids cascading render in effect body)
    const raf = requestAnimationFrame(() => setShow(true));
    const hide = setTimeout(() => setShow(false), 1900);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(hide);
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="ink-sheet"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, delay: 1.4 }}
          className="fixed inset-0 z-[200] bg-background"
          aria-hidden
        >
          {/* Ink wipe layer (scales from 1 to 0 top-to-bottom) */}
          <motion.div
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            transition={{ duration: 0.9, delay: 0.6, ease: [0.76, 0, 0.24, 1] }}
            className="absolute inset-0 bg-zinc-950 origin-top"
          >
            {/* Centered brand logo */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <motion.div
                initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center shadow-2xl shadow-primary/40 ring-4 ring-primary/20"
              >
                <Truck className="w-8 h-8 text-primary-foreground" strokeWidth={2.4} />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="text-center"
              >
                <div className="text-2xl font-black tracking-tight text-white">
                  Red<span className="text-primary">line</span>
                </div>
                <div className="mt-1 text-[11px] font-medium tracking-wider uppercase text-white/50">
                  Egypt&apos;s Premier Shipping
                </div>
              </motion.div>
              {/* Loading bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-2 w-40 h-0.5 bg-white/10 overflow-hidden rounded-full"
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
