import { cn } from "../../utils/cn";

type Cube3DProps = {
  /** Edge length in pixels. */
  size?: number;
  className?: string;
};

/**
 * Pure-CSS wireframe cube with a faint gold "B" on each face. Decorative and
 * lightweight — no canvas, no 3D library. Slowly self-rotates.
 */
export function Cube3D({ size = 120, className }: Cube3DProps) {
  const half = size / 2;
  const faces = [
    `translateZ(${half}px)`,
    `rotateY(180deg) translateZ(${half}px)`,
    `rotateY(90deg) translateZ(${half}px)`,
    `rotateY(-90deg) translateZ(${half}px)`,
    `rotateX(90deg) translateZ(${half}px)`,
    `rotateX(-90deg) translateZ(${half}px)`,
  ];

  return (
    <div className={cn("cube-scene", className)} aria-hidden="true">
      <div className="cube" style={{ width: size, height: size }}>
        {faces.map((transform, i) => (
          <span
            key={i}
            className="cube__face rounded-md"
            style={{ width: size, height: size, transform, fontSize: size * 0.42 }}
          >
            B
          </span>
        ))}
      </div>
    </div>
  );
}
