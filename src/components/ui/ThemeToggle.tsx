import { useTheme } from "../../lib/theme";
import { cn } from "../../utils/cn";

/**
 * Light/dark switch. Deliberately the same 40px bordered square as the mobile
 * menu button beside it rather than a sliding pill — one more control on the
 * shelf, not a feature being advertised.
 *
 * Both icons stay in the DOM and cross-fade, so the button never changes size
 * and nothing in the nav shifts on the flip.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        "relative grid h-10 w-10 place-items-center rounded-lg border border-line text-cream transition-colors hover:bg-[var(--tint)]",
        className,
      )}
    >
      <SunIcon
        className={cn(
          "absolute h-[18px] w-[18px] transition-[opacity,transform] duration-300",
          isDark ? "scale-100 opacity-100" : "scale-50 opacity-0",
        )}
      />
      <MoonIcon
        className={cn(
          "absolute h-[18px] w-[18px] transition-[opacity,transform] duration-300",
          isDark ? "scale-50 opacity-0" : "scale-100 opacity-100",
        )}
      />
    </button>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.5 1.5M17.1 17.1l1.5 1.5M18.6 5.4l-1.5 1.5M6.9 17.1l-1.5 1.5" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13.4A8.2 8.2 0 1 1 10.6 4a6.6 6.6 0 0 0 9.4 9.4Z" />
    </svg>
  );
}
