"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

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
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
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
                transition={{ delay: 0.5 }}
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
