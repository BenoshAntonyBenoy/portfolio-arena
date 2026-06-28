import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { PortfolioConfig } from "../../content/portfolioConfig";
import { useActiveSection } from "../../hooks/useActiveSection";
import { cn } from "../../utils/cn";

type NavbarProps = {
  meta: PortfolioConfig["meta"];
  nav: PortfolioConfig["nav"];
};

export function Navbar({ meta, nav }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const sectionIds = nav.map((item) => item.href.replace("#", ""));
  const activeId = useActiveSection(sectionIds);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll + close menu on Escape while the mobile sheet is open.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled ? "border-b border-line bg-ink/80 backdrop-blur-md" : "border-b border-transparent",
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-5 md:h-20 md:px-8"
      >
        <a
          href="#top"
          className="group flex items-center gap-2 text-sm font-semibold tracking-tight text-cream"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent font-display text-base text-ink transition-transform group-hover:-rotate-6">
            B
          </span>
          <span className="hidden sm:inline">{meta.name}</span>
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {nav.map((item) => {
            const id = item.href.replace("#", "");
            const isActive = activeId === id;
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
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
            href="#contact"
            className="hidden rounded-full bg-cream px-5 py-2 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5 md:inline-block"
          >
            Let's talk
          </a>

          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="grid h-10 w-10 place-items-center rounded-lg border border-line text-cream md:hidden"
          >
            <span className="relative block h-4 w-5">
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
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="border-t border-line bg-ink/95 backdrop-blur-md md:hidden"
          >
            <ul className="flex flex-col px-5 py-4">
              {nav.map((item) => {
                const isActive = activeId === item.href.replace("#", "");
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
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
              <li>
                <a
                  href="#contact"
                  onClick={() => setMenuOpen(false)}
                  className="mt-4 block rounded-full bg-cream py-3 text-center font-semibold text-ink"
                >
                  Let's talk
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
