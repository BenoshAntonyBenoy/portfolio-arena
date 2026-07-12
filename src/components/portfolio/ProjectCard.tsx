import type { Project } from "../../content/portfolioConfig";
import { cn } from "../../utils/cn";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2" aria-hidden="true">
      <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.1.66-.22.66-.48v-1.68c-2.7.58-3.27-1.16-3.27-1.16a2.58 2.58 0 0 0-1.08-1.41c-.88-.6.07-.6.07-.6a2.05 2.05 0 0 1 1.49 1 2.07 2.07 0 0 0 2.82.8 2.05 2.05 0 0 1 .62-1.3c-2.16-.24-4.42-1.08-4.42-4.81a3.77 3.77 0 0 1 1-2.62 3.5 3.5 0 0 1 .1-2.58s.84-.27 2.75 1a9.46 9.46 0 0 1 5 0c1.9-1.28 2.74-1 2.74-1a3.5 3.5 0 0 1 .1 2.58 3.76 3.76 0 0 1 1 2.62c0 3.74-2.26 4.56-4.43 4.8a2.3 2.3 0 0 1 .66 1.8v2.67c0 .26.18.58.67.48A10 10 0 0 0 12 2Z" />
    </svg>
  );
}

type ProjectCardProps = {
  project: Project;
  featured?: boolean;
  reverse?: boolean;
};

export function ProjectCard({ project, featured = false, reverse = false }: ProjectCardProps) {
  const imageFit = project.image.fit ?? "cover";

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-[32px] border border-line bg-[linear-gradient(135deg,rgba(19,19,24,0.94),rgba(10,10,12,0.88))] transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-accent/45 hover:shadow-[0_0_0_1px_rgba(216,168,114,0.24),0_34px_75px_-38px_rgba(216,168,114,0.42),0_42px_90px_-40px_rgba(0,0,0,0.95)] lg:grid",
        reverse ? "lg:grid-cols-[0.85fr_1.15fr]" : "lg:grid-cols-[1.15fr_0.85fr]",
      )}
    >
      <div
        className={cn(
          "relative aspect-[16/10] overflow-hidden border-b border-line bg-[#030706] lg:aspect-auto lg:min-h-[500px] lg:border-b-0",
          featured && "lg:min-h-[560px]",
          reverse ? "lg:order-2 lg:border-l" : "lg:order-1 lg:border-r",
        )}
      >
        <img
          src={project.image.src}
          srcSet={project.image.srcSet}
          sizes="(min-width: 1024px) 58vw, 100vw"
          alt={project.image.alt}
          loading="lazy"
          decoding="async"
          className={cn(
            "absolute inset-0 h-full w-full transition-transform duration-700",
            imageFit === "contain" ? "object-contain" : "object-cover group-hover:scale-[1.035]",
          )}
          style={{ objectPosition: project.image.position ?? "top" }}
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-white/[0.025]"
          aria-hidden="true"
        />
        <span className="absolute left-5 top-5 rounded-full border border-white/10 bg-ink/80 px-3.5 py-1.5 font-display text-xs tracking-widest text-cream backdrop-blur-sm">
          {project.index}
        </span>
      </div>

      <div
        className={cn(
          "relative flex min-w-0 flex-col justify-center p-7 md:p-9 lg:p-10 xl:p-12",
          reverse ? "lg:order-1" : "lg:order-2",
        )}
      >
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-accent/[0.06] blur-3xl"
          aria-hidden="true"
        />
        <div className="relative flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          <span>{project.kicker}</span>
          <span className="h-1 w-1 rounded-full bg-muted" aria-hidden="true" />
          <span className="text-muted">{project.year}</span>
        </div>

        <h3
          className={cn(
            "relative mt-4 font-display uppercase leading-[0.95] tracking-tight text-cream",
            featured ? "text-4xl md:text-5xl" : "text-3xl md:text-4xl",
          )}
        >
          {project.name}
        </h3>
        <p className={cn("relative mt-5 font-medium leading-relaxed text-cream/90", featured ? "text-xl" : "text-lg")}>
          {project.summary}
        </p>
        <p className="relative mt-3 text-sm leading-relaxed text-muted md:text-base">{project.description}</p>

        {project.highlights && (
          <ul className="relative mt-6 space-y-3 border-l border-accent/35 pl-4">
            {project.highlights.map((highlight) => (
              <li key={highlight} className="text-sm leading-relaxed text-cream/75">
                {highlight}
              </li>
            ))}
          </ul>
        )}

        <ul className="relative mt-6 flex flex-wrap gap-2">
          {project.tech.map((tool) => (
            <li
              key={tool}
              className="rounded-md border border-line bg-ink/45 px-2.5 py-1 text-[0.68rem] font-medium uppercase tracking-wider text-cream/70"
            >
              {tool}
            </li>
          ))}
        </ul>

        {(project.liveUrl || project.githubUrl) && (
          <div className="relative mt-7 flex flex-wrap items-center gap-3 border-t border-line pt-5">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-cream px-4 py-2 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
                aria-label={`${project.liveLabel ?? "View live project"}: ${project.name}`}
              >
                {project.liveLabel ?? "View live"} <ArrowIcon />
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-semibold text-cream transition-colors hover:bg-white/5"
                aria-label={`${project.githubLabel ?? "View source"}: ${project.name}`}
              >
                <GithubIcon /> {project.githubLabel ?? "Code"}
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
