import { MotionConfig } from "framer-motion";
import { AboutSection } from "./components/portfolio/AboutSection";
import { AchievementsSection } from "./components/portfolio/AchievementsSection";
import { ContactSection } from "./components/portfolio/ContactSection";
import { GallerySection } from "./components/portfolio/GallerySection";
import { HeroSection } from "./components/portfolio/HeroSection";
import { Navbar } from "./components/portfolio/Navbar";
import { ProjectsSection } from "./components/portfolio/ProjectsSection";
import { SkillsSection } from "./components/portfolio/SkillsSection";
import { ScrollBackdrop } from "./components/ui/ScrollBackdrop";
import { ContentProvider, useContent } from "./lib/useContent";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion";

export default function App() {
  return (
    <ContentProvider>
      <Site />
    </ContentProvider>
  );
}

function Site() {
  const reducedMotion = usePrefersReducedMotion();
  const c = useContent();

  /* The gallery hides itself while it holds no photos, so a menu link to it
     would scroll to nothing. The nav is content-driven, so rather than special
     casing the link somewhere he cannot see, drop it here on the same
     condition the section uses. Adding the first photo brings both back. */
  const nav = c.gallery.items.length
    ? c.nav
    : c.nav.filter((item) => item.href !== "#gallery");

  return (
    <MotionConfig reducedMotion={reducedMotion ? "always" : "never"}>
      <a
        href="#main"
        className="sr-only rounded-full bg-cream px-4 py-2 text-sm font-semibold text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60]"
      >
        Skip to content
      </a>

      <ScrollBackdrop />

      <Navbar meta={c.meta} nav={nav} cta={c.headerCta} />

      <main id="main" tabIndex={-1}>
        <HeroSection hero={c.hero} meta={c.meta} />
        <AboutSection about={c.about} meta={c.meta} />
        <SkillsSection skills={c.skills} />
        <ProjectsSection projects={c.projects} />
        <AchievementsSection achievements={c.achievements} />
        <GallerySection gallery={c.gallery} />
        <ContactSection contact={c.contact} meta={c.meta} socials={c.socials} />
      </main>
    </MotionConfig>
  );
}
