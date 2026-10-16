"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Premium custom cursor — fully optimized for 60fps:
 *
 * - Position tracking: direct DOM `style.transform = translate3d()` via rAF
 *   (zero React re-renders on mousemove)
 * - Hover detection: `mouseover` event (fires only on element enter/leave,
 *   not every pixel) + CSS class toggle (no React state for hover)
 * - `will-change: transform` for GPU compositing hint
 * - Desktop-only: `hidden md:block` + `pointer: fine` media query
 * - Respects `prefers-reduced-motion`
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  // Enable check — rAF-deferred to avoid hydration mismatch
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    const raf = requestAnimationFrame(() => setEnabled(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Mouse tracking + hover detection — zero React re-renders
  useEffect(() => {
    if (!enabled) return;

    let mx = -100, my = -100;
    let rafId: number | null = null;
    let isHovering = false;

    // Position: rAF-throttled, direct DOM transform (no React state)
    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          rafId = null;
          const tf = `translate3d(${mx}px, ${my}px, 0)`;
          if (dotRef.current) dotRef.current.style.transform = tf;
          if (ringRef.current) ringRef.current.style.transform = tf;
        });
      }
    };

    // Hover: mouseover fires only on element enter/leave (not every pixel)
    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const interactive = !!target?.closest(
        'a, button, [role="button"], [data-magnetic], input, textarea, select, label'
      );
      if (interactive !== isHovering) {
        isHovering = interactive;
        ringRef.current?.classList.toggle("cursor-active", interactive);
        dotRef.current?.classList.toggle("cursor-active", interactive);
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      dir="ltr"
      className="pointer-events-none fixed top-0 left-0 z-[999999] hidden md:block"
      aria-hidden
      style={{ width: 0, height: 0 }}
    >
      {/* Outer ring (lags slightly via CSS transition for spring effect) */}
      <div
        ref={ringRef}
        className="cursor-ring absolute left-0 top-0 -ml-4 -mt-4 w-8 h-8 rounded-full border border-primary/60"
        style={{ willChange: "transform", transform: "translate3d(-100px, -100px, 0)" }}
      />
      {/* Inner dot (1:1 tracking, no transition) */}
      <div
        ref={dotRef}
        className="cursor-dot absolute left-0 top-0 -ml-1 -mt-1 w-2 h-2 rounded-full bg-primary"
        style={{ willChange: "transform", transform: "translate3d(-100px, -100px, 0)" }}
      />
    </div>
  );
}

/**
 * Wrap any element to make it "magnetic" — shifts slightly towards the cursor.
 * Uses rAF throttling + direct MotionValue (no React re-renders).
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

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    let rafId: number | null = null;
    let targetX = 0, targetY = 0;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      targetX = (e.clientX - rect.left - rect.width / 2) * strength;
      targetY = (e.clientY - rect.top - rect.height / 2) * strength;
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          rafId = null;
          el.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
        });
      }
    };
    const onLeave = () => {
      targetX = 0;
      targetY = 0;
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          rafId = null;
          el.style.transform = "translate3d(0, 0, 0)";
        });
      }
    };
    el.addEventListener("mousemove", onMove, { passive: true });
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [strength]);

  return (
    <div
      ref={ref}
      data-magnetic
      className={className}
      style={{ willChange: "transform", transition: "transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)" }}
    >
      {children}
    </div>
  );
}
