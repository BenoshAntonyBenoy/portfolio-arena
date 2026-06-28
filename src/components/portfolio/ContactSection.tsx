import type { PortfolioConfig } from "../../content/portfolioConfig";
import { Reveal } from "../ui/Reveal";

type ContactSectionProps = {
  contact: PortfolioConfig["contact"];
  meta: PortfolioConfig["meta"];
  socials: PortfolioConfig["socials"];
};

export function ContactSection({ contact, meta, socials }: ContactSectionProps) {
  const year = 2026;

  return (
    <section id="contact" aria-labelledby="contact-title" className="scroll-mt-24 px-5 pt-24 md:px-8 md:pt-32">
      <div className="mx-auto w-full max-w-[1200px]">
        <Reveal className="overflow-hidden rounded-[32px] border border-line bg-surface/50 px-6 py-16 text-center md:px-16 md:py-24">
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">{contact.eyebrow}</span>
          <h2
            id="contact-title"
            className="mt-5 font-display text-[clamp(56px,13vw,170px)] uppercase leading-[0.85] tracking-[-0.02em] text-cream"
          >
            {contact.title}
          </h2>
          <p className="mx-auto mt-6 max-w-[52ch] text-lg leading-relaxed text-muted">{contact.prompt}</p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={`mailto:${meta.email}`}
              className="w-full rounded-full bg-cream px-8 py-3.5 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5 sm:w-auto"
            >
              {contact.emailLabel}
            </a>
            <a
              href={meta.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full rounded-full border border-line px-8 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-white/5 sm:w-auto"
            >
              {contact.resumeLabel}
            </a>
          </div>
        </Reveal>
      </div>

      <footer className="mx-auto mt-16 w-full max-w-[1200px] border-t border-line py-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <p className="text-sm text-muted">
            © {year} {meta.name}. {contact.footerNote}.
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-6">
            {socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target={social.href.startsWith("http") ? "_blank" : undefined}
                  rel={social.href.startsWith("http") ? "noreferrer" : undefined}
                  className="text-sm font-medium text-muted transition-colors hover:text-cream"
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </footer>
    </section>
  );
}
