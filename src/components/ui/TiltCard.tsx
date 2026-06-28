import type { PointerEvent, ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  /** Maximum tilt in degrees. */
  max?: number;
  /** Lift the card slightly toward the viewer on hover. */
  lift?: number;
};

/**
 * Subtle pointer-driven 3D tilt. Pointer-only (no-op on touch, where there is
 * no hover), and flattens automatically under prefers-reduced-motion because
 * the springs settle to 0 with MotionConfig set to "always" in App.
 */
export function TiltCard({ children, className, max = 7, lift = 6 }: TiltCardProps) {
  const px = useMotionValue(0);
  const py = useMotionValue(0);

  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [max, -max]), { stiffness: 220, damping: 18 });
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-max, max]), { stiffness: 220, damping: 18 });
  const z = useSpring(0, { stiffness: 220, damping: 18 });

  function handleMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width - 0.5);
    py.set((event.clientY - rect.top) / rect.height - 0.5);
    z.set(lift);
  }

  function handleLeave() {
    px.set(0);
    py.set(0);
    z.set(0);
  }

  return (
    <div className="tilt-scene h-full">
      <motion.div
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        style={{ rotateX, rotateY, translateZ: z, transformStyle: "preserve-3d" }}
        className={className}
      >
        {children}
      </motion.div>
    </div>
  );
}
