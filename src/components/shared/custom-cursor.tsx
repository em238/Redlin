"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Premium custom cursor: a small dot that tracks the pointer 1:1,
 * plus a larger ring that springs behind it. The ring scales up + changes
 * color when hovering interactive elements ([data-magnetic], a, button).
 *
 * Desktop-only: rendered when `pointer: fine` is detected, hidden on touch devices.
 * Respects prefers-reduced-motion (renders nothing in that case).
 */
export function CustomCursor() {
  // SSR-safe: starts false, becomes true on client after hydration (rAF-deferred)
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const ringX = useSpring(dotX, { stiffness: 350, damping: 28, restDelta: 0.05 });
  const ringY = useSpring(dotY, { stiffness: 350, damping: 28, restDelta: 0.05 });

  const rafRef = useRef<number | null>(null);

  // Decide whether to enable (desktop + no reduced-motion) — rAF-deferred setState
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    const raf = requestAnimationFrame(() => setEnabled(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const move = (e: MouseEvent) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        dotX.set(e.clientX);
        dotY.set(e.clientY);
      });
      // Detect hovering an interactive element
      const target = e.target as HTMLElement | null;
      const interactive = !!target?.closest('a, button, [role="button"], [data-magnetic], input, textarea, select, label');
      setHovering(interactive);
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => {
      window.removeEventListener("mousemove", move);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, dotX, dotY]);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] hidden md:block" aria-hidden>
      {/* Outer ring (springs behind) */}
      <motion.div
        style={{ x: ringX, y: ringY }}
        className="absolute -ml-4 -mt-4 w-8 h-8 rounded-full border border-primary/60"
        animate={{ scale: hovering ? 1.6 : 1, opacity: hovering ? 1 : 0.5 }}
        transition={{ type: "spring", stiffness: 250, damping: 20 }}
      />
      {/* Inner dot (1:1 tracking) */}
      <motion.div
        style={{ x: dotX, y: dotY }}
        className="absolute -ml-1 -mt-1 w-2 h-2 rounded-full bg-primary"
        animate={{ scale: hovering ? 0.5 : 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      />
    </div>
  );
}

/**
 * Wrap any element to make it "magnetic" — it shifts slightly towards the cursor
 * when the cursor is near, creating a premium tactile feel.
 *
 * Usage: <Magnetic strength={0.3}><Button>...</Button></Magnetic>
 */
export function Magnetic({
  children,
  strength = 0.25,
  className,
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 18, restDelta: 0.05 });
  const springY = useSpring(y, { stiffness: 220, damping: 18, restDelta: 0.05 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * strength;
      const dy = (e.clientY - cy) * strength;
      x.set(dx);
      y.set(dy);
    };
    const onLeave = () => {
      x.set(0);
      y.set(0);
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [strength, x, y]);

  return (
    <motion.div
      ref={ref}
      data-magnetic
      style={{ x: springX, y: springY }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
