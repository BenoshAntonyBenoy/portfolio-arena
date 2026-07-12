import type { ReactNode } from "react";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

type SectionParallaxProps = {
  children: ReactNode;
  className?: string;
};

/** A restrained continuous scroll shift for sections below the hero. */
export function SectionParallax({ children, className }: SectionParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [14, 0, -14]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.994, 1, 0.994]);

  return (
    <motion.div ref={ref} style={reducedMotion ? undefined : { y, scale }} className={className}>
      {children}
    </motion.div>
  );
}
