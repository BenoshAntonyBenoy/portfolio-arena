import { motion } from "framer-motion";
import type { PortfolioConfig } from "../../content/portfolioConfig";

type HeroSectionProps = {
  hero: PortfolioConfig["hero"];
  meta: PortfolioConfig["meta"];
};

const ease = [0.22, 1, 0.36, 1] as const;

export function HeroSection({ hero, meta }: HeroSectionProps) {
  return (
    <section
      id="top"
      className="hero-veil relative overflow-hidden px-5 pb-16 pt-28 md:px-8 md:pb-24 md:pt-36"
      aria-label="Introduction"
    >
      <div className="surface-grid pointer-events-none absolute inset-0 -z-10 opacity-60" aria-hidden="true" />

      <div className="mx-auto grid w-full max-w-[1200px] items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
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

          <h1 className="mt-6 font-display uppercase leading-[0.85] tracking-[-0.02em] text-cream">
            {hero.nameLines.map((line, i) => (
              <motion.span
                key={line}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease, delay: 0.08 + i * 0.08 }}
                className="block text-[clamp(64px,11vw,150px)]"
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
            className="mt-6 max-w-[46ch] text-lg leading-relaxed text-muted md:text-xl"
          >
            {hero.intro}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.46 }}
            className="mt-8 flex flex-wrap items-center gap-3"
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
            className="mt-12 flex flex-wrap gap-x-10 gap-y-6 border-t border-line pt-8"
          >
            {hero.stats.map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-display text-4xl tracking-tight text-cream md:text-5xl">{stat.value}</dd>
                <span className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-muted">{stat.label}</span>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* ---- Image column: complements, never covers ---- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease, delay: 0.2 }}
          className="order-1 mx-auto w-full max-w-[360px] lg:order-2 lg:max-w-none"
        >
          <div className="relative">
            <div className="absolute -inset-3 -z-10 rounded-[32px] bg-gradient-to-br from-accent/20 to-transparent blur-2xl" aria-hidden="true" />
            <div className="overflow-hidden rounded-[28px] border border-line bg-surface">
              <img
                src={meta.avatar}
                alt={`${meta.name}, ${meta.role}`}
                width={500}
                height={600}
                fetchPriority="high"
                className="aspect-[5/6] w-full object-cover object-top"
              />
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl border border-line bg-ink/70 px-4 py-3 backdrop-blur-md">
              <span className="text-sm font-semibold text-cream">{meta.name}</span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-muted">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-accent" aria-hidden="true">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
                </svg>
                {hero.availability}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
