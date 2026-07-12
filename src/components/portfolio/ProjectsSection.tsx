import type { PortfolioConfig } from "../../content/portfolioConfig";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";
import { SectionParallax } from "../ui/SectionParallax";
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
      <SectionParallax>
        <SectionHeading id="projects-title" eyebrow={projects.eyebrow} title={projects.title} />

        <div className="mt-14 flex flex-col gap-8 md:gap-10">
          {projects.items.map((project, index) => (
            <Reveal key={project.index} delay={0.035 * (index % 2)}>
              <ProjectCard project={project} featured={project.featured} reverse={index % 2 === 1} />
            </Reveal>
          ))}
        </div>
      </SectionParallax>
    </section>
  );
}
