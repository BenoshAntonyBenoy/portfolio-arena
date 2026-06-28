import { Reveal } from "./Reveal";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  id?: string;
};

/** Shared eyebrow + display title used at the top of each section. */
export function SectionHeading({ eyebrow, title, id }: SectionHeadingProps) {
  return (
    <Reveal className="flex flex-col gap-4">
      <span className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
        <span className="h-px w-8 bg-accent/60" aria-hidden="true" />
        {eyebrow}
      </span>
      <h2
        id={id}
        className="max-w-[20ch] font-display text-[clamp(40px,7vw,96px)] uppercase leading-[0.92] tracking-[-0.02em] text-cream"
      >
        {title}
      </h2>
    </Reveal>
  );
}
