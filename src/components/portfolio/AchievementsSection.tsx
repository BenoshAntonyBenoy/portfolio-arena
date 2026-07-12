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

      <ol className="mt-14 border-t border-line">
        {achievements.items.map((item, index) => (
          <Reveal
            key={item.title}
            as="li"
            delay={0.04 * index}
            className="grid gap-4 border-b border-line py-7 transition-colors hover:border-accent/45 sm:grid-cols-[120px_1fr] sm:items-start md:grid-cols-[180px_1fr] md:py-9"
          >
            <span className="font-display text-5xl tracking-tight text-accent md:text-6xl">{item.metric}</span>
            <div className="grid gap-2 md:grid-cols-[0.7fr_1.3fr] md:gap-10">
              <h3 className="text-lg font-semibold text-cream md:text-xl">{item.title}</h3>
              <p className="max-w-[58ch] text-sm leading-relaxed text-muted md:text-base">{item.description}</p>
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
