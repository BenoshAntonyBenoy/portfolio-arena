import type { PortfolioConfig } from "../../content/portfolioConfig";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

type AchievementsSectionProps = {
  achievements: PortfolioConfig["achievements"];
};

export function AchievementsSection({ achievements }: AchievementsSectionProps) {
  return (
    <section
      id="beyond"
      aria-labelledby="beyond-title"
      className="mx-auto w-full max-w-[1200px] scroll-mt-24 px-5 py-24 md:px-8 md:py-32"
    >
      <SectionHeading id="beyond-title" eyebrow={achievements.eyebrow} title={achievements.title} />

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {achievements.items.map((item, i) => (
          <Reveal
            key={item.title}
            delay={0.05 * i}
            className="flex flex-col rounded-3xl border border-line bg-surface/40 p-6 transition-colors hover:border-accent/40"
          >
            <span className="font-display text-5xl tracking-tight text-accent md:text-6xl">{item.metric}</span>
            <h3 className="mt-4 text-lg font-semibold text-cream">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
