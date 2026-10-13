"use client";

import { useEffect, useRef, useState } from "react";

export function useCountUp(target: number, duration = 1800, start = true) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!start || startedRef.current) return;
    startedRef.current = true;

    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setValue(target * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setValue(target);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, start]);

  return value;
}

// Parse values like "850K+", "27", "12K+", "40+"
export function parseStatValue(raw: string): { num: number; suffix: string; isK: boolean } {
  const match = raw.match(/([\d,.]+)\s*(K|M)?\s*(\+)?/i);
  if (!match) return { num: 0, suffix: raw, isK: false };
  let num = parseFloat(match[1].replace(/,/g, ""));
  const unit = match[2]?.toUpperCase();
  const plus = match[3] || "";
  let suffix = "";
  if (unit === "K") { num *= 1000; suffix = "K" + plus; }
  else if (unit === "M") { num *= 1000000; suffix = "M" + plus; }
  else suffix = plus;
  return { num, suffix, isK: !!unit };
}

export function formatStat(num: number, suffix: string, isK: boolean) {
  if (isK) {
    const k = num / 1000;
    const rounded = k >= 100 ? Math.round(k) : k >= 10 ? Math.round(k * 10) / 10 : Math.round(k * 10) / 10;
    return rounded + suffix;
  }
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M" + suffix;
  if (num >= 1000) return Math.round(num).toLocaleString("en-US") + suffix;
  return Math.round(num) + suffix;
}
