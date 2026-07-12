import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { PortfolioConfig } from "../../content/portfolioConfig";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { Cube3D } from "../ui/Cube3D";

type HeroSectionProps = {
  hero: PortfolioConfig["hero"];
  meta: PortfolioConfig["meta"];
};

const ease = [0.22, 1, 0.36, 1] as const;

const chipPositions = [
  "-left-2 top-8",
  "-right-2 top-1/3",
  "-left-2 bottom-24",
  "-right-2 bottom-10",
];

export function HeroSection({ hero, meta }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const secondaryIsDocument = hero.secondaryCta.href.toLowerCase().endsWith(".pdf");
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -52]);
  const opacity = useTransform(scrollYProgress, [0, 0.72, 1], [1, 0.86, 0]);
  const zoomStyle = reducedMotion ? undefined : { scale, y, opacity };

  return (
    <section
      ref={sectionRef}
      id="top"
      className="hero-veil relative overflow-hidden px-5 pb-16 pt-24 md:px-8 md:pb-24 md:pt-28"
      aria-label="Introduction"
    >
      <div className="surface-grid pointer-events-none absolute inset-0 -z-10 opacity-45" aria-hidden="true" />

      <motion.div
        style={zoomStyle}
        className="relative z-10 mx-auto grid w-full max-w-[1200px] origin-center items-center gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:gap-16"
      >
        <div className="order-1">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-3.5 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted sm:px-4 sm:text-xs sm:tracking-[0.22em]"
          >
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
            {hero.eyebrow}
          </motion.span>

          <h1 className="mt-5 font-display uppercase leading-[0.85] tracking-[-0.02em] text-cream">
            {hero.nameLines.map((line, index) => (
              <motion.span
                key={line}
                initial={{ opacity: 0, y: 36 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, ease, delay: 0.06 + index * 0.08 }}
                className="block text-[clamp(58px,9.5vw,132px)]"
              >
                {line}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease, delay: 0.26 }}
            className="mt-4 max-w-[40ch] text-sm font-semibold uppercase leading-relaxed tracking-[0.18em] text-accent sm:tracking-[0.22em]"
          >
            {meta.role}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease, delay: 0.33 }}
            className="mt-5 max-w-[52ch] text-base leading-relaxed text-muted md:text-lg"
          >
            {hero.intro}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease, delay: 0.4 }}
            className="mt-7 flex flex-wrap items-center gap-3"
          >
            <a
              href={hero.primaryCta.href}
              className="rounded-full bg-cream px-7 py-3 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
            >
              {hero.primaryCta.label}
            </a>
            <a
              href={hero.secondaryCta.href}
              target={secondaryIsDocument ? "_blank" : undefined}
              rel={secondaryIsDocument ? "noreferrer" : undefined}
              className="rounded-full border border-line px-7 py-3 text-sm font-semibold text-cream transition-colors hover:border-cream/40 hover:bg-white/5"
            >
              {hero.secondaryCta.label}
            </a>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease, delay: 0.47 }}
            className="mt-9 grid grid-cols-3 gap-3 border-t border-line pt-6 sm:flex sm:flex-wrap sm:gap-x-10 sm:gap-y-5"
          >
            {hero.stats.map((stat) => (
              <div key={stat.label} className="flex min-w-0 flex-col">
                <dt className="order-2 mt-1 text-[0.62rem] font-medium uppercase leading-snug tracking-[0.12em] text-muted sm:text-xs sm:tracking-[0.16em]">
                  {stat.label}
                </dt>
                <dd className="order-1 font-display text-2xl tracking-tight text-cream sm:text-3xl md:text-4xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.18 }}
          className="relative order-2 mx-auto w-full max-w-[300px] sm:max-w-[360px] lg:max-w-none"
        >
          <Cube3D size={86} className="absolute -right-5 -top-5 z-30 hidden opacity-80 xl:block" />
          <div
            className="absolute -inset-4 -z-10 rounded-[34px] bg-gradient-to-br from-accent/20 via-accent/5 to-transparent blur-2xl"
            aria-hidden="true"
          />
          <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-surface shadow-[0_30px_70px_-20px_rgba(0,0,0,0.8),0_0_0_1px_rgba(216,168,114,0.12)]">
            <div
              className="pointer-events-none absolute inset-0 z-10 rounded-[28px] ring-1 ring-inset ring-accent/20"
              aria-hidden="true"
            />
            <img
              src={meta.avatar}
              alt={`${meta.name}, ${meta.role}`}
              width={500}
              height={600}
              fetchPriority="high"
              className="aspect-[5/6] w-full object-cover object-top"
            />
          </div>

          <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between rounded-2xl border border-line bg-ink/75 px-4 py-3 backdrop-blur-md">
            <span className="text-sm font-semibold text-cream">{meta.name}</span>
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-accent" aria-hidden="true">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
              </svg>
              {hero.availability}
            </span>
          </div>

          {hero.floatingTags.slice(0, 4).map((tag, index) => (
            <span
              key={tag}
              className={`glass-chip absolute z-20 hidden rounded-xl px-3.5 py-2 text-xs font-semibold tracking-wide text-cream sm:block ${chipPositions[index]}`}
              aria-hidden="true"
            >
              {tag}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
