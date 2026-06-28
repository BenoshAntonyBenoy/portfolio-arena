import type { PortfolioConfig } from "../../content/portfolioConfig";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";
import { ProjectCard } from "./ProjectCard";

type ProjectsSectionProps = {
  projects: PortfolioConfig["projects"];
};

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <section
      id="projects"
      aria-labelledby="projects-title"
      className="mx-auto w-full max-w-[1200px] scroll-mt-24 px-5 py-24 md:px-8 md:py-32"
    >
      <SectionHeading id="projects-title" eyebrow={projects.eyebrow} title={projects.title} />

      <div className="mt-14 grid gap-5 md:grid-cols-2">
        {projects.items.map((project, i) => (
          <Reveal key={project.index} delay={0.05 * (i % 2)} className="h-full">
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
