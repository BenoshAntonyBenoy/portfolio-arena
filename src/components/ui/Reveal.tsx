import { motion } from "framer-motion";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger delay in seconds. */
  delay?: number;
  /** Pixels to travel on the y-axis. */
  y?: number;
  as?: "div" | "li" | "span";
};

/**
 * Subtle fade + slide reveal that fires once when scrolled into view.
 * Honors prefers-reduced-motion (framer-motion disables transforms globally
 * when the OS flag is set via MotionConfig in App).
 */
export function Reveal({ children, className, delay = 0, y = 24, as = "div" }: RevealProps) {
  const MotionTag = motion[as];
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </MotionTag>
  );
}
