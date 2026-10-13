"use client";

import { useEffect, useState } from "react";

export function useScrollSpy(ids: string[], offset = 120) {
  const [active, setActive] = useState(ids[0] || "");

  useEffect(() => {
    const handler = () => {
      const scrollY = window.scrollY + offset;
      let current = ids[0] || "";
      for (const id of ids) {
        const el = document.querySelector(id);
        if (el) {
          const top = (el as HTMLElement).offsetTop;
          if (top <= scrollY) current = id;
        }
      }
      setActive(current);
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [ids, offset]);

  return active;
}
