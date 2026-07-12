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
};

export function ProjectCard({ project, featured = false }: ProjectCardProps) {
  const imageFit = project.image.fit ?? "cover";
  const sizes = featured
    ? "(min-width: 1024px) 62vw, 100vw"
    : "(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw";

  return (
    <article
      className={cn(
        "group relative h-full overflow-hidden rounded-3xl border border-line bg-surface/45 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_0_0_1px_rgba(216,168,114,0.26),0_28px_60px_-34px_rgba(216,168,114,0.36),0_34px_70px_-32px_rgba(0,0,0,0.9)]",
        featured && "lg:grid lg:grid-cols-[1.3fr_0.7fr]",
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden border-b border-line bg-[#0d1016]",
          featured ? "aspect-[16/10] lg:aspect-auto lg:min-h-[520px] lg:border-b-0 lg:border-r" : "aspect-[16/10]",
        )}
      >
        <img
          src={project.image.src}
          srcSet={project.image.srcSet}
          sizes={sizes}
          alt={project.image.alt}
          loading="lazy"
          decoding="async"
          className={cn(
            "h-full w-full transition-transform duration-500 group-hover:scale-[1.025]",
            imageFit === "contain" ? "object-contain" : "object-cover",
          )}
          style={{ objectPosition: project.image.position ?? "top" }}
        />
        <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-ink/75 px-3 py-1 font-display text-xs tracking-widest text-cream backdrop-blur-sm">
          {project.index}
        </span>
      </div>

      <div className={cn("flex min-w-0 flex-col p-6 md:p-7", featured && "justify-center lg:p-10")}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          <span>{project.kicker}</span>
          <span className="h-1 w-1 rounded-full bg-muted" aria-hidden="true" />
          <span className="text-muted">{project.year}</span>
        </div>

        <h3
          className={cn(
            "mt-4 font-display uppercase leading-[0.95] tracking-tight text-cream",
            featured ? "text-4xl md:text-5xl" : "text-2xl md:text-3xl",
          )}
        >
          {project.name}
        </h3>
        <p className={cn("mt-4 font-medium leading-relaxed text-cream/90", featured ? "text-xl" : "text-lg")}>
          {project.summary}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">{project.description}</p>

        {project.highlights && (
          <ul className="mt-6 space-y-3 border-l border-accent/35 pl-4">
            {project.highlights.map((highlight) => (
              <li key={highlight} className="text-sm leading-relaxed text-cream/75">
                {highlight}
              </li>
            ))}
          </ul>
        )}

        <ul className="mt-6 flex flex-wrap gap-2">
          {project.tech.map((tool) => (
            <li
              key={tool}
              className="rounded-md border border-line bg-ink/40 px-2.5 py-1 text-[0.68rem] font-medium uppercase tracking-wider text-cream/70"
            >
              {tool}
            </li>
          ))}
        </ul>

        {(project.liveUrl || project.githubUrl) && (
          <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-line pt-5">
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
