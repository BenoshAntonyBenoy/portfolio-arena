import type { PortfolioConfig } from "../../content/portfolioConfig";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

type SkillsSectionProps = {
  skills: PortfolioConfig["skills"];
};

export function SkillsSection({ skills }: SkillsSectionProps) {
  return (
    <section
      id="skills"
      aria-labelledby="skills-title"
      className="mx-auto w-full max-w-[1200px] scroll-mt-24 px-5 py-24 md:px-8 md:py-32"
    >
      <SectionHeading id="skills-title" eyebrow={skills.eyebrow} title={skills.title} />

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {skills.groups.map((group, i) => (
          <Reveal key={group.title} delay={0.06 * i} className="h-full">
            <div className="group relative h-full overflow-hidden rounded-3xl border border-line bg-surface/50 p-7 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_0_0_1px_rgba(216,168,114,0.3),0_24px_55px_-30px_rgba(216,168,114,0.26),0_30px_60px_-30px_rgba(0,0,0,0.9)] md:p-9">
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/10 blur-2xl transition-opacity group-hover:opacity-100 md:opacity-0" />

              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-display text-3xl uppercase tracking-tight text-cream md:text-4xl">{group.title}</h3>
                <span className="font-display text-sm text-muted/50">0{i + 1}</span>
              </div>
              <p className="mt-2 text-sm text-muted">{group.caption}</p>

              <ul className="mt-6 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-line bg-ink/40 px-3.5 py-1.5 text-sm font-medium text-cream/85 transition-colors group-hover:border-line/80"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
