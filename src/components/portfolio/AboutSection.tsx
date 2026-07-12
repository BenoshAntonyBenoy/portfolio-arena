import type { PortfolioConfig } from "../../content/portfolioConfig";
import { Reveal } from "../ui/Reveal";

type AboutSectionProps = {
  about: PortfolioConfig["about"];
  meta: PortfolioConfig["meta"];
};

export function AboutSection({ about, meta }: AboutSectionProps) {
  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="mx-auto w-full max-w-[1200px] scroll-mt-24 px-5 py-24 md:px-8 md:py-32"
    >
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <Reveal className="flex flex-col gap-4">
            <span className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              <span className="h-px w-8 bg-accent/60" aria-hidden="true" />
              {about.eyebrow}
            </span>
            <h2
              id="about-title"
              className="font-display text-[clamp(40px,6.5vw,84px)] uppercase leading-[0.92] tracking-[-0.02em] text-cream"
            >
              {about.title}
            </h2>
          </Reveal>

          <Reveal delay={0.1} className="mt-8 rounded-2xl border border-line bg-surface/50 p-6">
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-muted">{about.signature}</p>
            <p className="mt-3 text-sm text-muted">
              Based in {meta.location} ·{" "}
              <a href={`mailto:${meta.email}`} className="text-cream underline-offset-4 hover:underline">
                {meta.email}
              </a>
            </p>
          </Reveal>

          <Reveal delay={0.14} className="mt-4 overflow-hidden rounded-2xl border border-line bg-ink/35">
            <dl>
              {about.facts.map((fact) => (
                <div
                  key={fact.label}
                  className="grid gap-1 border-b border-line px-5 py-4 last:border-b-0 sm:grid-cols-[96px_1fr] sm:gap-4"
                >
                  <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{fact.label}</dt>
                  <dd className="text-sm leading-relaxed text-cream/85">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <div className="flex flex-col gap-6">
          {about.paragraphs.map((paragraph, i) => (
            <Reveal key={i} delay={0.05 * i}>
              <p className="text-xl leading-relaxed text-cream/90 md:text-2xl md:leading-relaxed">{paragraph}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
