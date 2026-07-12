import { cn } from "../../utils/cn";

type LogoProps = {
  /** Optional name rendered beside the badge. */
  name?: string;
  href?: string;
  className?: string;
};

/** Gold/glass 3D "B" badge. Spins on hover (driven by the parent `group`). */
export function Logo({ name, href = "#top", className }: LogoProps) {
  return (
    <a
      href={href}
      aria-label={name ? undefined : "Home"}
      className={cn("group flex items-center gap-3 text-sm font-semibold text-cream", className)}
    >
      <span className="logo-badge tilt-scene h-9 w-9 text-lg" aria-hidden="true">
        B
      </span>
      {name && <span className="tracking-tight">{name}</span>}
    </a>
  );
}
