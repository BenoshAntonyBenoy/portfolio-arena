import type { Project } from "../../content/portfolioConfig";

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

/** Generated cover for projects without a preview image — keeps the grid cohesive. */
function GeneratedCover({ project }: { project: Project }) {
  return (
    <div className="surface-grid relative flex h-full w-full items-center justify-center bg-gradient-to-br from-surface-2 to-ink">
      <span className="font-display text-[clamp(72px,12vw,140px)] leading-none text-white/[0.06]" aria-hidden="true">
        {project.index}
      </span>
      <span className="absolute font-display text-2xl uppercase tracking-tight text-cream/80 md:text-3xl">
        {project.name.split(" ").slice(0, 2).join(" ")}
      </span>
    </div>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface/40 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40">
      <div className="relative aspect-[16/10] overflow-hidden border-b border-line bg-ink">
        {project.image ? (
          <img
            src={project.image}
            alt={`${project.name} preview`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <GeneratedCover project={project} />
        )}
        <span className="absolute left-4 top-4 rounded-full bg-ink/70 px-3 py-1 font-display text-xs tracking-widest text-cream backdrop-blur-sm">
          {project.index}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6 md:p-7">
        <h3 className="font-display text-2xl uppercase tracking-tight text-cream md:text-3xl">{project.name}</h3>
        <p className="mt-3 flex-1 text-base leading-relaxed text-muted">{project.description}</p>

        <ul className="mt-5 flex flex-wrap gap-2">
          {project.tech.map((tool) => (
            <li
              key={tool}
              className="rounded-md border border-line bg-ink/40 px-2.5 py-1 text-xs font-medium uppercase tracking-wider text-cream/70"
            >
              {tool}
            </li>
          ))}
        </ul>

        {(project.liveUrl || project.githubUrl) && (
          <div className="mt-6 flex items-center gap-3 border-t border-line pt-5">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-cream px-4 py-2 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
                aria-label={`View ${project.name} live`}
              >
                Live <ArrowIcon />
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-semibold text-cream transition-colors hover:bg-white/5"
                aria-label={`View ${project.name} source on GitHub`}
              >
                <GithubIcon /> Code
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
