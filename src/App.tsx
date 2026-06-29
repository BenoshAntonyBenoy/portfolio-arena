import { MotionConfig } from "framer-motion";
import { AboutSection } from "./components/portfolio/AboutSection";
import { AchievementsSection } from "./components/portfolio/AchievementsSection";
import { ContactSection } from "./components/portfolio/ContactSection";
import { HeroSection } from "./components/portfolio/HeroSection";
import { Navbar } from "./components/portfolio/Navbar";
import { ProjectsSection } from "./components/portfolio/ProjectsSection";
import { SkillsSection } from "./components/portfolio/SkillsSection";
import { ScrollBackdrop } from "./components/ui/ScrollBackdrop";
import { portfolioConfig } from "./content/portfolioConfig";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion";

export default function App() {
  const reducedMotion = usePrefersReducedMotion();
  const c = portfolioConfig;

  return (
    <MotionConfig reducedMotion={reducedMotion ? "always" : "never"}>
      <a
        href="#main"
        className="sr-only rounded-full bg-cream px-4 py-2 text-sm font-semibold text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60]"
      >
        Skip to content
      </a>

      <ScrollBackdrop />

      <Navbar meta={c.meta} nav={c.nav} />

      <main id="main">
        <HeroSection hero={c.hero} meta={c.meta} />
        <AboutSection about={c.about} meta={c.meta} />
        <SkillsSection skills={c.skills} />
        <ProjectsSection projects={c.projects} />
        <AchievementsSection achievements={c.achievements} />
        <ContactSection contact={c.contact} meta={c.meta} socials={c.socials} />
      </main>
    </MotionConfig>
  );
}
