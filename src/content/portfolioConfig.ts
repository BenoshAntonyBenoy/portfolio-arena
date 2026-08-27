// ============================================================================
// Type definitions for every piece of editable content on the site.
//
// The live data is row "arena" of site_content in Supabase, which the panel at
// /admin writes. content.json beside this file is a snapshot of that row,
// compiled into the bundle: it is what renders until the fetch lands, and what
// keeps rendering if the fetch never does.
//
// These types stay the contract. If content.json drifts from them
// "npm run typecheck" fails, and validate() in src/admin/schema.ts is what
// stops a malformed document reaching the database in the first place.
// ============================================================================

import contentJson from "./content.json";

export type NavItem = {
  label: string;
  href: string;
};

export type SocialLink = {
  label: string;
  handle: string;
  href: string;
};

export type Stat = {
  value: string;
  label: string;
};

export type SkillGroup = {
  title: string;
  caption: string;
  items: string[];
};

export type AboutFact = {
  label: string;
  value: string;
};

export type ProjectImage = {
  src: string;
  srcSet?: string;
  alt: string;
  fit?: "cover" | "contain";
  position?: string;
};

export type Project = {
  index: string;
  name: string;
  kicker: string;
  year: string;
  summary: string;
  description: string;
  tech: string[];
  image: ProjectImage;
  featured?: boolean;
  highlights?: string[];
  liveUrl?: string;
  liveLabel?: string;
  githubUrl?: string;
  githubLabel?: string;
};

export type GalleryItem = {
  src: string;
  /** Doubles as the alt text. Left blank the photo is treated as decorative. */
  caption: string;
};

export type Achievement = {
  metric: string;
  title: string;
  description: string;
};

export type PortfolioConfig = {
  meta: {
    name: string;
    /** Full legal name - used only in the navbar beside the logo. */
    fullName: string;
    role: string;
    tagline: string;
    location: string;
    email: string;
    resumeUrl: string;
    avatar: string;
    siteUrl: string;
  };
  nav: NavItem[];
  headerCta: NavItem;
  socials: SocialLink[];
  hero: {
    eyebrow: string;
    nameLines: string[];
    intro: string;
    availability: string;
    primaryCta: NavItem;
    secondaryCta: NavItem;
    stats: Stat[];
    /** Small glass chips shown around the hero photo. */
    floatingTags: string[];
  };
  about: {
    eyebrow: string;
    title: string;
    paragraphs: string[];
    signature: string;
    facts: AboutFact[];
  };
  skills: {
    eyebrow: string;
    title: string;
    groups: SkillGroup[];
  };
  projects: {
    eyebrow: string;
    title: string;
    items: Project[];
  };
  achievements: {
    eyebrow: string;
    title: string;
    items: Achievement[];
  };
  gallery: {
    eyebrow: string;
    title: string;
    items: GalleryItem[];
  };
  contact: {
    eyebrow: string;
    title: string;
    prompt: string;
    emailLabel: string;
    resumeLabel: string;
    footerNote: string;
  };
};

/** The bundled snapshot. Rendered until the live row arrives, and instead of
 *  it whenever Supabase cannot be reached. */
export const fallbackContent = contentJson as PortfolioConfig;
