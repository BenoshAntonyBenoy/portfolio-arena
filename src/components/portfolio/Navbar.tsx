import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { NavItem, PortfolioConfig } from "../../content/portfolioConfig";
import { useActiveSection } from "../../hooks/useActiveSection";
import { cn } from "../../utils/cn";
import { Logo } from "../ui/Logo";

type NavbarProps = {
  meta: PortfolioConfig["meta"];
  nav: PortfolioConfig["nav"];
  cta: NavItem;
};

export function Navbar({ meta, nav, cta }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null);
  const sectionIds = useMemo(() => nav.map((item) => item.href.replace("#", "")), [nav]);
  const activeId = useActiveSection(sectionIds);
  const ctaIsDocument = cta.href.toLowerCase().endsWith(".pdf");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const previousFocus = document.activeElement;
    const media = window.matchMedia("(min-width: 768px)");
    const focusFrame = window.requestAnimationFrame(() => firstMobileLinkRef.current?.focus());

    const closeMenu = () => setMenuOpen(false);
    const onMediaChange = (event: MediaQueryListEvent) => event.matches && closeMenu();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = Array.from(
        headerRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [],
      ).filter((element) => element.getClientRects().length > 0);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    media.addEventListener("change", onMediaChange);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
      media.removeEventListener("change", onMediaChange);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [menuOpen]);

  return (
    <header
      ref={headerRef}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled || menuOpen ? "border-b border-line bg-ink/90 backdrop-blur-md" : "border-b border-transparent",
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-5 md:h-20 md:px-8"
      >
        <Logo name={meta.fullName} className="[&>span:nth-child(2)]:hidden sm:[&>span:nth-child(2)]:inline" />

        <ul className="hidden items-center gap-1 md:flex">
          {nav.map((item) => {
            const id = item.href.replace("#", "");
            const isActive = activeId === id;
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={isActive ? "location" : undefined}
                  className={cn(
                    "relative rounded-full px-3 py-2 text-sm font-medium transition-colors lg:px-4",
                    isActive ? "text-cream" : "text-muted hover:text-cream",
                  )}
                >
                  {item.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-full bg-white/5"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href={cta.href}
            target={ctaIsDocument ? "_blank" : undefined}
            rel={ctaIsDocument ? "noreferrer" : undefined}
            className="hidden rounded-full bg-cream px-5 py-2 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5 md:inline-block"
          >
            {cta.label}
          </a>

          <button
            ref={menuButtonRef}
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-controls="mobile-menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="grid h-10 w-10 place-items-center rounded-lg border border-line text-cream md:hidden"
          >
            <span className="relative block h-4 w-5" aria-hidden="true">
              <span
                className={cn(
                  "absolute left-0 top-0 h-0.5 w-5 bg-current transition-transform",
                  menuOpen && "translate-y-[7px] rotate-45",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-[7px] h-0.5 w-5 bg-current transition-opacity",
                  menuOpen && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "absolute bottom-0 left-0 h-0.5 w-5 bg-current transition-transform",
                  menuOpen && "-translate-y-[7px] -rotate-45",
                )}
              />
            </span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-x-0 top-full h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-ink md:hidden"
          >
            <ul className="flex min-h-full flex-col px-5 py-4">
              {nav.map((item, index) => {
                const isActive = activeId === item.href.replace("#", "");
                return (
                  <li key={item.href}>
                    <a
                      ref={index === 0 ? firstMobileLinkRef : undefined}
                      href={item.href}
                      aria-current={isActive ? "location" : undefined}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "block border-b border-line/60 py-4 text-lg font-medium",
                        isActive ? "text-accent" : "text-cream",
                      )}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
              <li className="mt-auto pt-6">
                <a
                  href={cta.href}
                  target={ctaIsDocument ? "_blank" : undefined}
                  rel={ctaIsDocument ? "noreferrer" : undefined}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-full bg-cream py-3 text-center font-semibold text-ink"
                >
                  {cta.label}
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
