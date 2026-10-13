"use client";

import { useRef, useState, type ReactNode, type MouseEvent } from "react";
import { motion } from "framer-motion";
import { Button, type ButtonProps } from "@/components/ui/button";

interface Props extends ButtonProps {
  children: ReactNode;
  strength?: number;
}

// Button that subtly follows the cursor (magnetic effect)
export function MagneticButton({ children, strength = 0.4, className = "", ...props }: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMove = (e: MouseEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) * strength;
    const y = (e.clientY - (rect.top + rect.height / 2)) * strength;
    setPos({ x, y });
  };

  const reset = () => setPos({ x: 0, y: 0 });

  return (
    <motion.div
      style={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className="inline-block"
    >
      <Button
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={reset}
        className={className}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
}
