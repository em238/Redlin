"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Premium custom cursor — fully optimized for 60fps with perfect sync:
 *
 * - Position + centering + scale ALL in one `transform` property (single GPU layer)
 * - `translate3d(x, y, 0) translate(-50%, -50%) scale(n)` — no drift, no separation
 * - rAF-throttled direct DOM manipulation (zero React re-renders on mousemove)
 * - `mouseover` for hover detection (fires on element enter/leave, not every pixel)
 * - `will-change: transform` for GPU compositing hint
 * - Desktop-only: `hidden md:block` + `pointer: fine` media query
 * - Respects `prefers-reduced-motion`
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    const raf = requestAnimationFrame(() => setEnabled(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let mx = -100, my = -100;
    let rafId: number | null = null;
    let isHovering = false;

    // Build the transform string with position + centering + scale in ONE transform
    const applyTransform = () => {
      const pos = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      if (ringRef.current) {
        ringRef.current.style.transform = `${pos} scale(${isHovering ? 1.6 : 1})`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `${pos} scale(${isHovering ? 0.5 : 1})`;
      }
    };

    // Position: rAF-throttled, direct DOM transform (no React state)
    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          rafId = null;
          applyTransform();
        });
      }
    };

    // Hover: mouseover fires only on element enter/leave
    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const interactive = !!target?.closest(
        'a, button, [role="button"], [data-magnetic], input, textarea, select, label'
      );
      if (interactive !== isHovering) {
        isHovering = interactive;
        applyTransform();
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
      {/* Outer ring — center + scale ALL via transform (single GPU layer) */}
      <div
        ref={ringRef}
        className="absolute left-0 top-0 w-8 h-8 rounded-full border border-primary/60 transition-opacity duration-200"
        style={{
          willChange: "transform",
          transform: "translate3d(-100px, -100px, 0) translate(-50%, -50%) scale(1)",
          opacity: 0.5,
        }}
      />
      {/* Inner dot — center + scale ALL via transform (single GPU layer) */}
      <div
        ref={dotRef}
        className="absolute left-0 top-0 w-2 h-2 rounded-full bg-primary"
        style={{
          willChange: "transform",
          transform: "translate3d(-100px, -100px, 0) translate(-50%, -50%) scale(1)",
        }}
      />
    </div>
  );
}

/**
 * Wrap any element to make it "magnetic" — shifts slightly towards the cursor.
 * Uses rAF throttling + direct DOM transform (no React re-renders).
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
