import type { PortfolioConfig } from "../../content/portfolioConfig";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";
import { ProjectCard } from "./ProjectCard";

type ProjectsSectionProps = {
  projects: PortfolioConfig["projects"];
};

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const featured = projects.items.find((project) => project.featured) ?? projects.items[0];
  const supporting = projects.items.filter((project) => project !== featured);

  return (
    <section
      id="projects"
      aria-labelledby="projects-title"
      className="mx-auto w-full max-w-[1200px] scroll-mt-24 px-5 py-24 md:px-8 md:py-32"
    >
      <SectionHeading id="projects-title" eyebrow={projects.eyebrow} title={projects.title} />

      <Reveal className="mt-14">
        <ProjectCard project={featured} featured />
      </Reveal>

      <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-12">
        {supporting.map((project, index) => {
          const desktopSpan = index < 2 ? "xl:col-span-6" : "xl:col-span-4";
          const balanceTablet = index === supporting.length - 1 ? "md:col-span-2 xl:col-span-4" : "";
          return (
            <Reveal
              key={project.index}
              delay={0.04 * (index % 3)}
              className={`h-full ${desktopSpan} ${balanceTablet}`}
            >
              <ProjectCard project={project} />
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
