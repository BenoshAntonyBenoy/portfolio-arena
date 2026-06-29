import { useRef } from "react";
import { motion, useMotionTemplate, useScroll, useTransform } from "framer-motion";
import type { PortfolioConfig } from "../../content/portfolioConfig";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { Cube3D } from "../ui/Cube3D";
import { TiltCard } from "../ui/TiltCard";

type HeroSectionProps = {
  hero: PortfolioConfig["hero"];
  meta: PortfolioConfig["meta"];
};

const ease = [0.22, 1, 0.36, 1] as const;

// Positions for the floating glass chips around the photo (up to 4).
// Offset via left/right (not translate) so the `floaty` keyframe — which sets
// `transform` — doesn't override the placement.
const chipPositions = [
  "-left-3 top-8 floaty",
  "-right-3 top-1/3 floaty floaty-delay",
  "-left-3 bottom-28 floaty floaty-delay",
  "-right-3 bottom-12 floaty",
];

export function HeroSection({ hero, meta }: HeroSectionProps) {
  const reduced = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // Parallax zoom: as the hero scrolls away, its content scales up, fades, and
  // softly blurs — so scrolling into the About section feels like a zoom-through.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const blur = useTransform(scrollYProgress, [0, 1], [0, 5]);
  const filter = useMotionTemplate`blur(${blur}px)`;
  const zoomStyle = reduced ? undefined : { scale, opacity, filter };

  return (
    <section
      ref={sectionRef}
      id="top"
      className="hero-veil relative overflow-hidden px-5 pb-14 pt-24 md:px-8 md:pb-20 md:pt-28"
      aria-label="Introduction"
    >
      {/* Ambient depth: grid + drifting blobs + slow light sweep */}
      <div className="surface-grid pointer-events-none absolute inset-0 -z-10 opacity-50" aria-hidden="true" />
      <div className="hero-blob hero-blob--gold -left-24 top-0 h-[420px] w-[420px] -z-10" aria-hidden="true" />
      <div className="hero-blob hero-blob--cool right-[-10%] top-1/4 h-[380px] w-[380px] -z-10" aria-hidden="true" />
      <div className="hero-sweep -z-10" aria-hidden="true" />
      <Cube3D size={108} className="absolute right-[6%] top-[14%] -z-10 hidden opacity-70 lg:block" />

      <motion.div
        style={zoomStyle}
        className="mx-auto grid w-full max-w-[1200px] origin-center items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14"
      >
        {/* ---- Text column: the name is the anchor ---- */}
        <div className="order-2 lg:order-1">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted"
          >
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            {hero.eyebrow}
          </motion.span>

          <h1 className="mt-5 font-display uppercase leading-[0.85] tracking-[-0.02em] text-cream">
            {hero.nameLines.map((line, i) => (
              <motion.span
                key={line}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease, delay: 0.08 + i * 0.08 }}
                className="block text-[clamp(58px,9.5vw,132px)]"
              >
                {line}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.3 }}
            className="mt-4 text-sm font-semibold uppercase tracking-[0.24em] text-accent"
          >
            {meta.role}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.38 }}
            className="mt-5 max-w-[46ch] text-base leading-relaxed text-muted md:text-lg"
          >
            {hero.intro}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.46 }}
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
              className="rounded-full border border-line px-7 py-3 text-sm font-semibold text-cream transition-colors hover:border-cream/40 hover:bg-white/5"
            >
              {hero.secondaryCta.label}
            </a>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.55 }}
            className="mt-9 flex flex-wrap gap-x-10 gap-y-5 border-t border-line pt-6"
          >
            {hero.stats.map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-display text-3xl tracking-tight text-cream md:text-4xl">{stat.value}</dd>
                <span className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-muted">{stat.label}</span>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* ---- Image column: premium tilt card + floating glass chips ---- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease, delay: 0.2 }}
          className="relative order-1 mx-auto w-full max-w-[360px] lg:order-2 lg:max-w-none"
        >
          <TiltCard className="relative" max={8} lift={10}>
            {/* Glow + layered depth behind the card */}
            <div
              className="absolute -inset-4 -z-10 rounded-[34px] bg-gradient-to-br from-accent/25 via-accent/5 to-transparent blur-2xl"
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
                style={{ transform: "translateZ(40px)" }}
              />
            </div>

            <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between rounded-2xl border border-line bg-ink/70 px-4 py-3 backdrop-blur-md">
              <span className="text-sm font-semibold text-cream">{meta.name}</span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-muted">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-accent" aria-hidden="true">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
                </svg>
                {hero.availability}
              </span>
            </div>

            {/* Floating glass chips */}
            {hero.floatingTags.slice(0, 4).map((tag, i) => (
              <span
                key={tag}
                className={`glass-chip absolute z-20 rounded-xl px-3.5 py-2 text-xs font-semibold tracking-wide text-cream ${chipPositions[i]}`}
                aria-hidden="true"
              >
                {tag}
              </span>
            ))}
          </TiltCard>
        </motion.div>
      </motion.div>
    </section>
  );
}
